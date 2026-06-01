#!/usr/bin/env python3
"""
Classement de leads pour prospection web (création / refonte de site).

INPUT CSV  : name, website, email  (lignes sans email valide → ignorées)
OUTPUT CSV : ranking trié par score_final décroissant

Usage :
    python lead_scorer.py leads_input.csv leads_ranked.csv
    python lead_scorer.py   # défaut : leads_input.csv → leads_ranked.csv

Dépendances : bibliothèque standard uniquement.
"""

from __future__ import annotations

import csv
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from business_types import pc_bonus_for_type

# --- Configuration ---
DEFAULT_INPUT = Path(__file__).resolve().parent / "leads_input.csv"
DEFAULT_OUTPUT = Path(__file__).resolve().parent / "leads_ranked.csv"
MAX_WORKERS = 12
FETCH_TIMEOUT_S = 12
MAX_BYTES = 500_000

# Secteurs à fort potentiel commercial (bonus PC)
HIGH_VALUE_SECTORS = (
    "immobilier",
    "immo",
    "santé",
    "sante",
    "medical",
    "médecin",
    "avocat",
    "juridique",
    "notaire",
    "btp",
    "rénovation",
    "renovation",
    "plombier",
    "artisan",
    "finance",
    "assurance",
    "comptable",
    "expert-comptable",
    "dental",
    "dentaire",
    "clinique",
    "cabinet",
)

# Signaux CMS / stack ancienne
OLD_CMS_PATTERNS = (
    r"wp-content",
    r"wordpress\s*[\d.]+",
    r"joomla",
    r"drupal",
    r"wix\.com",
    r"squarespace",
    r"weebly",
    r"magento",
    r"prestashop",
    r"tableau\s+de\s+bord",
)

CTA_KEYWORDS = (
    "contact",
    "devis",
    "réserver",
    "reserver",
    "rendez-vous",
    "rendez vous",
    "appeler",
    "appelez",
    "demander",
    "inscription",
    "essai gratuit",
    "nous contacter",
    "prendre contact",
)


@dataclass
class LeadInput:
    name: str
    website: str
    email: str
    business_type: str = ""


@dataclass
class SiteSignals:
    """Signaux détectés sur le HTML / la réponse HTTP."""
    fetched: bool = False
    status_code: int = 0
    response_ms: int = 0
    html_size: int = 0
    has_viewport: bool = False
    has_https: bool = False
    has_title: bool = False
    has_meta_description: bool = False
    has_cta: bool = False
    has_tel_link: bool = False
    has_form: bool = False
    table_layout: bool = False
    legacy_tags: bool = False
    heavy_inline_css: bool = False
    old_cms: bool = False
    thin_content: bool = False
    sector_bonus: bool = False
    error: str = ""


@dataclass
class ScoredLead:
    name: str
    email: str
    url: str
    business_type: str
    score_prospection: float
    score_site: float
    score_final: float
    niveau_lead: str
    raisons_principales: list[str] = field(default_factory=list)
    problèmes_detectés: list[str] = field(default_factory=list)
    opportunités_de_revente: list[str] = field(default_factory=list)
    priorité_contact: str = "basse"


def log(step: str, message: str = "") -> None:
    line = f"[{step}] {message}" if message else f"[{step}]"
    print(line, flush=True)


def is_valid_email(email: str) -> bool:
    email = (email or "").strip()
    if not email:
        return False
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def normalize_url(website: str) -> str:
    url = (website or "").strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    return url


def fetch_site(url: str) -> tuple[str, SiteSignals]:
    """Télécharge la page (stdlib). En cas d'échec, signaux vides + error."""
    signals = SiteSignals(has_https=url.lower().startswith("https://"))
    start = time.perf_counter()

    try:
        request = Request(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (compatible; LeadScorer/1.0; +prospection-web)"
                ),
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        with urlopen(request, timeout=FETCH_TIMEOUT_S) as response:
            signals.status_code = getattr(response, "status", 200) or 200
            raw = response.read(MAX_BYTES)
            elapsed = int((time.perf_counter() - start) * 1000)
            signals.response_ms = elapsed
            signals.fetched = True

            charset = "utf-8"
            content_type = response.headers.get("Content-Type", "")
            match = re.search(r"charset=([\w-]+)", content_type, re.I)
            if match:
                charset = match.group(1)

            html = raw.decode(charset, errors="replace")
            signals.html_size = len(html)
            return html, signals

    except HTTPError as err:
        signals.error = f"HTTP {err.code}"
        signals.status_code = err.code
    except URLError as err:
        signals.error = f"URL {err.reason}"
    except Exception as err:
        signals.error = str(err)[:120]

    signals.response_ms = int((time.perf_counter() - start) * 1000)
    return "", signals


def detect_signals(html: str, url: str, name: str, signals: SiteSignals) -> SiteSignals:
    """Analyse heuristique du HTML (pas d'API externe)."""
    if not html:
        return signals

    lower = html.lower()
    text_only = re.sub(r"<[^>]+>", " ", lower)
    combined = f"{name} {url} {text_only[:8000]}".lower()

    signals.has_viewport = 'name="viewport"' in lower or "width=device-width" in lower
    signals.has_title = bool(re.search(r"<title[^>]*>\s*\S+", lower, re.I))
    signals.has_meta_description = 'name="description"' in lower
    signals.has_cta = any(kw in combined for kw in CTA_KEYWORDS)
    signals.has_tel_link = "tel:" in lower
    signals.has_form = "<form" in lower
    signals.table_layout = lower.count("<table") >= 2
    signals.legacy_tags = any(
        tag in lower for tag in ("<font", "<center", "<marquee", "<frame")
    )
    signals.heavy_inline_css = lower.count("style=") > 25
    signals.old_cms = any(re.search(p, lower) for p in OLD_CMS_PATTERNS)
    signals.thin_content = len(text_only.strip()) < 400
    signals.sector_bonus = any(s in combined for s in HIGH_VALUE_SECTORS)

    return signals


def clamp_score(value: float, maximum: float = 50.0) -> float:
    return round(max(0.0, min(maximum, value)), 1)


def score_prospection(
    signals: SiteSignals, business_type: str = ""
) -> tuple[float, list[str], list[str], list[str]]:
    """
    PC (0–50) : potentiel de conversion pour vendre une refonte.
    Plus le site est faible commercialement, plus le score monte.
    """
    score = 0.0
    raisons: list[str] = []
    problèmes: list[str] = []
    opportunités: list[str] = []

    if not signals.fetched:
        score += 18
        problèmes.append("Site inaccessible ou injoignable")
        opportunités.append("Refonte + hébergement fiable")
        raisons.append("Présence en ligne défaillante")
    else:
        if not signals.has_cta and not signals.has_form:
            score += 12
            problèmes.append("Absence de CTA / formulaire visible")
            opportunités.append("Parcours de conversion (CTA, formulaires)")
            raisons.append("Faible capture de leads")

        if not signals.has_meta_description or not signals.has_title:
            score += 8
            problèmes.append("SEO de base incomplet (title / description)")
            opportunités.append("Optimisation SEO on-page")

        if signals.thin_content:
            score += 6
            problèmes.append("Contenu trop léger")
            opportunités.append("Enrichissement éditorial + pages services")

        if signals.response_ms > 3000:
            score += 5
            problèmes.append("Temps de chargement élevé")
            opportunités.append("Performance et optimisation technique")

    bonus, bonus_reason = pc_bonus_for_type(business_type)
    if bonus:
        score += bonus
        if bonus_reason:
            raisons.append(bonus_reason)
    elif signals.sector_bonus:
        score += 10
        raisons.append("Secteur à forte valeur détecté sur le site")

    if signals.has_tel_link or signals.has_form:
        score += 4
        raisons.append("Entreprise active (contact / formulaire détecté)")

    if not signals.has_https:
        score += 4
        problèmes.append("Pas de HTTPS")
        opportunités.append("Migration HTTPS + confiance utilisateur")

    return clamp_score(score), raisons, problèmes, opportunités


def score_site(signals: SiteSignals) -> tuple[float, list[str], list[str]]:
    """
    PS (0–50) : potentiel lié à la qualité technique / design du site.
    """
    score = 0.0
    problèmes: list[str] = []
    opportunités: list[str] = []

    if not signals.fetched:
        score += 22
        problèmes.append("Impossible d'analyser le site")
        opportunités.append("Nouveau site professionnel clé en main")
        return clamp_score(score), problèmes, opportunités

    if not signals.has_viewport:
        score += 12
        problèmes.append("Responsive mobile non détecté (viewport)")
        opportunités.append("Design mobile-first")

    if signals.table_layout:
        score += 8
        problèmes.append("Mise en page type tableaux (design daté)")
        opportunités.append("Refonte UI moderne")

    if signals.legacy_tags:
        score += 8
        problèmes.append("Balises HTML obsolètes")
        opportunités.append("Modernisation front-end")

    if signals.heavy_inline_css:
        score += 6
        problèmes.append("CSS inline excessif (maintenance difficile)")
        opportunités.append("Stack moderne (composants, design system)")

    if signals.old_cms:
        score += 8
        problèmes.append("CMS / stack ancienne détectée")
        opportunités.append("Migration vers stack actuelle (Next.js, etc.)")

    if signals.response_ms > 2500:
        score += 6
        problèmes.append("Lenteur perçue")
        opportunités.append("Optimisation performance (Core Web Vitals)")

    if signals.html_size > 200_000:
        score += 4
        problèmes.append("Page HTML très lourde")
        opportunités.append("Allègement et bonnes pratiques perf")

    return clamp_score(score), problèmes, opportunités


def niveau_from_score(score_final: float) -> str:
    if score_final >= 40:
        return "excellent"
    if score_final >= 30:
        return "bon"
    if score_final >= 18:
        return "moyen"
    return "faible"


def priorite_from_score(score_final: float) -> str:
    if score_final >= 42:
        return "urgente"
    if score_final >= 32:
        return "haute"
    if score_final >= 22:
        return "moyenne"
    return "basse"


def merge_unique(*lists: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for lst in lists:
        for item in lst:
            if item and item not in seen:
                seen.add(item)
                out.append(item)
    return out[:8]


def analyze_lead(lead: LeadInput) -> ScoredLead | None:
    url = normalize_url(lead.website)
    if not url:
        return None

    html, signals = fetch_site(url)
    signals = detect_signals(html, url, lead.name, signals)

    pc, raisons_pc, prob_pc, opp_pc = score_prospection(signals, lead.business_type)
    ps, prob_ps, opp_ps = score_site(signals)

    score_final = round((pc * 0.6) + (ps * 0.4), 1)
    raisons = merge_unique(raisons_pc, [f"Score prospection {pc}/50", f"Score site {ps}/50"])
    problèmes = merge_unique(prob_pc, prob_ps)
    opportunités = merge_unique(opp_pc, opp_ps)

    return ScoredLead(
        name=lead.name,
        email=lead.email,
        url=url,
        business_type=(lead.business_type or "autre").strip(),
        score_prospection=pc,
        score_site=ps,
        score_final=score_final,
        niveau_lead=niveau_from_score(score_final),
        raisons_principales=raisons,
        problèmes_detectés=problèmes,
        opportunités_de_revente=opportunités,
        priorité_contact=priorite_from_score(score_final),
    )


def load_input_csv(path: Path) -> list[LeadInput]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {path}")

    leads: list[LeadInput] = []
    skipped = 0

    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            name = (row.get("name") or "").strip()
            website = (row.get("website") or "").strip()
            email = (row.get("email") or "").strip()

            if not is_valid_email(email):
                skipped += 1
                continue
            if not website:
                skipped += 1
                continue

            leads.append(
                LeadInput(
                    name=name or website,
                    website=website,
                    email=email,
                    business_type=(row.get("business_type") or "").strip(),
                )
            )

    log("LOAD", f"{len(leads)} lead(s) valide(s), {skipped} ignoré(s) (email/site manquant)")
    return leads


def list_to_cell(items: list[str]) -> str:
    return " | ".join(items)


def save_ranked_csv(leads: list[ScoredLead], path: Path) -> None:
    fieldnames = [
        "name",
        "email",
        "url",
        "business_type",
        "score_prospection",
        "score_site",
        "score_final",
        "niveau_lead",
        "raisons_principales",
        "problèmes_detectés",
        "opportunités_de_revente",
        "priorité_contact",
    ]
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for lead in leads:
            writer.writerow(
                {
                    "name": lead.name,
                    "email": lead.email,
                    "url": lead.url,
                    "business_type": lead.business_type,
                    "score_prospection": lead.score_prospection,
                    "score_site": lead.score_site,
                    "score_final": lead.score_final,
                    "niveau_lead": lead.niveau_lead,
                    "raisons_principales": list_to_cell(lead.raisons_principales),
                    "problèmes_detectés": list_to_cell(lead.problèmes_detectés),
                    "opportunités_de_revente": list_to_cell(lead.opportunités_de_revente),
                    "priorité_contact": lead.priorité_contact,
                }
            )


def score_leads_parallel(leads: list[LeadInput]) -> list[ScoredLead]:
    scored: list[ScoredLead] = []
    total = len(leads)
    done = 0

    log("ANALYZE", f"démarrage ({total} sites, {MAX_WORKERS} workers)")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(analyze_lead, lead): lead for lead in leads}

        for future in as_completed(futures):
            done += 1
            lead_in = futures[future]
            try:
                result = future.result()
                if result:
                    scored.append(result)
                    log(
                        "OK",
                        f"{done}/{total} {lead_in.name[:40]} → {result.score_final}",
                    )
                else:
                    log("SKIP", f"{done}/{total} {lead_in.name}")
            except Exception as err:
                log("ERROR", f"{done}/{total} {lead_in.name} : {err}")

    scored.sort(key=lambda x: x.score_final, reverse=True)
    return scored


def run(input_path: Path, output_path: Path) -> int:
    log("START", "lead_scorer — ranking prospection web")
    leads = load_input_csv(input_path)
    if not leads:
        log("ABORT", "aucun lead valide après filtrage email")
        return 1

    scored = score_leads_parallel(leads)
    save_ranked_csv(scored, output_path)

    urgent = sum(1 for lead in scored if lead.priorité_contact == "urgente")
    log("DONE", f"{len(scored)} lead(s) → {output_path.name}")
    log("STATS", f"urgente={urgent} excellent={sum(1 for l in scored if l.niveau_lead == 'excellent')}")
    return 0


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    input_path = Path(args[0]) if len(args) > 0 else DEFAULT_INPUT
    output_path = Path(args[1]) if len(args) > 1 else DEFAULT_OUTPUT
    try:
        return run(input_path, output_path)
    except FileNotFoundError as err:
        log("ABORT", str(err))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
