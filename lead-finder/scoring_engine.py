"""
Moteur de scoring Lead Finder v5.1

Score_Final = SP × 0.60 + SS × 0.40  |  sans site : SP × 1.10
SS = 100 − qualité visuelle (0–100) — SS élevé = site moche = bon lead refonte

Analyse site : DOM + CSS heuristiques + proxy UX (1 HTTP, pas SEO/perf/WHOIS).
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from business_types import sector_prospection_score
from site_analyzers import SiteAnalysis, analyze_site_html

FETCH_TIMEOUT_S = 8
MAX_BYTES = 350_000

WEIGHT_SP = 0.60
WEIGHT_SS = 0.40
EMAIL_ONLY_FINAL_BOOST = 1.10

SP_WEIGHTS = {
    "secteur": 0.28,
    "taille": 0.20,
    "digital": 0.12,
    "activite": 0.12,
    "decideur": 0.08,
    "site_vente": 0.20,
}

# Qualité visuelle (v5.1) — élevé = beau ; puis SS = 100 − qualité
SS_QUALITY_WEIGHTS = {
    "structure_ux": 0.25,
    "design": 0.35,
    "hierarchie_ux": 0.20,
    "modernite": 0.15,
    "mobile": 0.05,
}

PLATFORM_DOMAINS = (
    "planity.com",
    "booksy.com",
    "facebook.com",
    "instagram.com",
    "wikipedia.org",
)

GENERIC_EMAIL_PREFIXES = (
    "help.",
    "support.",
    "noreply",
    "no-reply",
    "contact@planity",
    "info@planity",
)


@dataclass
class LeadContext:
    name: str
    email: str
    website: str
    business_type: str = ""
    phone: str = ""
    address: str = ""
    maps_link: str = ""


@dataclass
class ScoreBreakdown:
    sp: float = 0.0
    ss: float = 0.0
    final: float = 0.0
    ss_quality: float = 0.0
    email_only: bool = False
    sp_parts: dict[str, float] = field(default_factory=dict)
    ss_parts: dict[str, float] = field(default_factory=dict)
    raisons: list[str] = field(default_factory=list)
    problemes: list[str] = field(default_factory=list)
    opportunites: list[str] = field(default_factory=list)


def clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return round(max(lo, min(hi, v)), 1)


def has_scorable_website(website: str) -> bool:
    return bool(normalize_url(website))


def is_email_only_lead(ctx: LeadContext) -> bool:
    return bool((ctx.email or "").strip()) and not has_scorable_website(ctx.website)


def normalize_url(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return ""
    if not re.match(r"^https?://", url, re.I):
        url = "https://" + url
    return url


def fetch_html(url: str) -> tuple[str, int, bool]:
    try:
        req = Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; LeadScorer/5.1)",
                "Accept": "text/html",
            },
        )
        with urlopen(req, timeout=FETCH_TIMEOUT_S) as resp:
            code = getattr(resp, "status", 200) or 200
            raw = resp.read(MAX_BYTES)
            return raw.decode("utf-8", errors="replace"), code, True
    except HTTPError as e:
        return "", e.code, False
    except (URLError, Exception):
        return "", 0, False


def analyze_site(url: str) -> SiteAnalysis:
    html, code, ok = fetch_html(url)
    host = urlparse(url).netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    a = analyze_site_html(html, url, host)
    a.fetched = ok and bool(html)
    a.status_code = code
    if code >= 400:
        a.problems.append(f"HTTP {code}")
    return a


def compute_ss_from_analysis(a: SiteAnalysis) -> tuple[float, float, dict[str, float], list[str], list[str]]:
    parts = {
        "structure_ux": a.structure_ux,
        "design": a.design,
        "hierarchie_ux": a.hierarchie_ux,
        "modernite": a.modernite,
        "mobile": a.mobile,
    }
    quality = sum(parts[k] * SS_QUALITY_WEIGHTS[k] for k in SS_QUALITY_WEIGHTS)
    quality = clamp(quality - a.dated_penalty)

    if not a.fetched:
        quality = min(quality, 30.0)

    ss = clamp(100.0 - quality)

    if quality >= 72:
        ss = min(ss, 28.0)
    if quality <= 28:
        ss = max(ss, 72.0)

    problemes = list(a.problems)[:6]
    opportunites: list[str] = []
    if ss >= 70:
        opportunites.append("Refonte complète + parcours conversion IA")
    if a.design <= 40:
        opportunites.append("Identité visuelle + UI moderne")
    if a.hierarchie_ux <= 45:
        opportunites.append("CTA et structure de page optimisés")
    if a.mobile <= 35:
        opportunites.append("Refonte mobile-first")
    if not a.fetched:
        opportunites.append("Site vitrine fiable + design premium")

    return ss, quality, parts, problemes, opportunites[:6]


def parse_review_count(address: str) -> int:
    if not address:
        return 0
    m = re.search(r"\((\d+)\s*avis", address, re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)\s*avis", address, re.I)
    return int(m.group(1)) if m else 0


def parse_rating(address: str) -> float:
    m = re.search(r"(\d[,.]\d)\s*(?:★|étoile|avis)?", address)
    if m:
        return float(m.group(1).replace(",", "."))
    return 0.0


def score_sp_taille(ctx: LeadContext) -> tuple[float, list[str]]:
    notes: list[str] = []
    score = 35.0
    reviews = parse_review_count(ctx.address)
    rating = parse_rating(ctx.address)

    if reviews >= 200:
        score = 95
        notes.append(f"Volume d'avis élevé ({reviews})")
    elif reviews >= 80:
        score = 82
    elif reviews >= 30:
        score = 68
    elif reviews >= 10:
        score = 55
    elif reviews > 0:
        score = 45

    name_low = ctx.name.lower()
    if any(k in name_low for k in ("eurl", " sarl", " sas ", "artisan")):
        score = max(score, min(score + 5, 78))
        notes.append("Structure PME locale")

    if rating >= 4.5 and reviews >= 20:
        score = max(score, 72)

    if ctx.phone:
        score = min(100, score + 8)

    return clamp(score), notes


def score_sp_digital(ctx: LeadContext, a: SiteAnalysis) -> tuple[float, list[str]]:
    notes: list[str] = []
    score = 30.0
    if ctx.website and not a.platform_site:
        score += 35
        notes.append("Site web PME")
    elif ctx.website:
        score += 15
    if ctx.phone:
        score += 15
    if "facebook.com" in (ctx.website or "").lower() or "instagram" in (ctx.website or "").lower():
        score += 12
    if a.has_form:
        score += 10
    if a.social_links:
        score += 15
        notes.append("Réseaux sociaux")
    return clamp(score), notes


def score_sp_activite(ctx: LeadContext, a: SiteAnalysis) -> tuple[float, list[str]]:
    reviews = parse_review_count(ctx.address)
    if reviews >= 50:
        return 85.0, [f"Activité Maps ({reviews} avis)"]
    if reviews >= 15:
        return 65.0, ["Activité modérée"]
    if a.hierarchie_ux >= 55:
        return 58.0, ["Signaux conversion sur le site"]
    return 42.0, []


def score_sp_decideur(ctx: LeadContext) -> tuple[float, list[str]]:
    email = (ctx.email or "").lower()
    notes: list[str] = []
    score = 25.0
    if email and not any(email.startswith(p) or p in email for p in GENERIC_EMAIL_PREFIXES):
        if not any(d in email for d in PLATFORM_DOMAINS):
            score = 88
            notes.append("Email direct")
        else:
            score = 40
    elif email:
        score = 35
    if ctx.phone:
        score = min(100, score + 12)
    return clamp(score), notes


def score_sp_site_vente(ss_quality: float, has_site: bool, a: SiteAnalysis) -> tuple[float, list[str]]:
    if not has_site:
        return 72.0, ["Pas de site — création très vendable"]
    if not a.fetched:
        return 55.0, ["Site injoignable"]
    refonte = 100.0 - ss_quality
    if refonte >= 75:
        return 60.0, ["Site très mauvais — vente refonte +10 %"]
    if refonte >= 48:
        return 50.0, ["Site moyen/mauvais — neutre 50 %"]
    if refonte <= 22:
        return 28.0, ["Site excellent — refonte très difficile (−40 %)"]
    if refonte <= 35:
        return 38.0, ["Site propre — faible marge (−25 %)"]
    if refonte > 48:
        t = (refonte - 48) / 27
        return clamp(50 + t * 10), []
    t = (35 - refonte) / 13
    return clamp(50 - t * 12), []


def compute_sp(
    ctx: LeadContext, a: SiteAnalysis, ss_quality: float, has_site: bool
) -> tuple[float, dict[str, float], list[str]]:
    secteur, sect_note = sector_prospection_score(
        ctx.business_type, ctx.name, ctx.address
    )
    taille, tail_notes = score_sp_taille(ctx)
    digital, dig_notes = score_sp_digital(ctx, a)
    activite, act_notes = score_sp_activite(ctx, a)
    decideur, dec_notes = score_sp_decideur(ctx)
    site_vente, site_notes = score_sp_site_vente(ss_quality, has_site, a)

    parts = {
        "secteur": secteur,
        "taille": taille,
        "digital": digital,
        "activite": activite,
        "decideur": decideur,
        "site_vente": site_vente,
    }
    sp = sum(parts[k] * SP_WEIGHTS[k] for k in SP_WEIGHTS)
    raisons = [sect_note] + site_notes + tail_notes + dig_notes + act_notes + dec_notes
    return clamp(sp), parts, [r for r in raisons if r][:7]


def score_lead(ctx: LeadContext) -> ScoreBreakdown:
    email_only = is_email_only_lead(ctx)
    has_site = has_scorable_website(ctx.website)
    a = SiteAnalysis()

    if has_site:
        a = analyze_site(normalize_url(ctx.website))

    if email_only:
        sp, sp_parts, sp_raisons = compute_sp(ctx, a, 0.0, False)
        return ScoreBreakdown(
            sp=sp,
            ss=0.0,
            final=clamp(sp * EMAIL_ONLY_FINAL_BOOST),
            ss_quality=0.0,
            email_only=True,
            sp_parts=sp_parts,
            ss_parts={},
            raisons=sp_raisons
            + [f"Sans site : final = SP×{EMAIL_ONLY_FINAL_BOOST:.0%}"],
            problemes=["Pas de site web"],
            opportunites=["Création site vitrine + IA", "Email direct disponible"],
        )

    ss, ss_quality, ss_parts, prob, opp = compute_ss_from_analysis(a)
    sp, sp_parts, sp_raisons = compute_sp(ctx, a, ss_quality, True)
    final = clamp(sp * WEIGHT_SP + ss * WEIGHT_SS)

    raisons = sp_raisons + [
        f"Final {final} = SP×{WEIGHT_SP} + SS×{WEIGHT_SS}",
        f"SS {ss} (qualité {ss_quality}) — 90+=très mauvais, 0-10=excellent",
    ]
    if ss >= 70:
        raisons.insert(0, "🔥 Site faible — priorité refonte")
    elif ss <= 25:
        raisons.append("Site moderne — faible priorité refonte")

    return ScoreBreakdown(
        sp=sp,
        ss=ss,
        final=final,
        ss_quality=ss_quality,
        sp_parts=sp_parts,
        ss_parts=ss_parts,
        raisons=raisons[:8],
        problemes=prob,
        opportunites=opp,
    )


def niveau_from_final(score: float) -> str:
    if score >= 75:
        return "excellent"
    if score >= 60:
        return "bon"
    if score >= 40:
        return "moyen"
    return "faible"


def priorite_from_final(score: float) -> str:
    if score >= 80:
        return "urgente"
    if score >= 65:
        return "haute"
    if score >= 45:
        return "moyenne"
    return "basse"
