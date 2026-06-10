#!/usr/bin/env python3
"""
Lead Finder v5.1 — SP/SS + filtre PME + analyse site DOM/CSS/UX.

INPUT  : leads_input.csv
OUTPUT : leads_ranked.csv (PME qualifiées uniquement, tri score_final ↓)
         leads_excluded.csv (grandes marques / institutions / franchises)

Usage :
    python lead_scorer.py leads_input.csv leads_ranked.csv
    python notion_sync.py
"""

from __future__ import annotations

import csv
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path

from business_qualification import qualify_lead
from pipeline_core import domain_key, load_csv_rows, maps_place_key
from scoring_engine import (
    LeadContext,
    ScoreBreakdown,
    niveau_from_final,
    normalize_url,
    priorite_from_final,
    score_lead,
)

LEAD_FINDER_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = LEAD_FINDER_DIR / "leads_input.csv"
DEFAULT_OUTPUT = LEAD_FINDER_DIR / "leads_ranked.csv"
DEFAULT_EXCLUDED = LEAD_FINDER_DIR / "leads_excluded.csv"
DATA_ENRICHED = LEAD_FINDER_DIR / "data_enriched.csv"
MAX_WORKERS = int(os.environ.get("SCORER_WORKERS", "16"))


@dataclass
class ScoredLead:
    name: str
    email: str
    url: str
    business_type: str
    score_prospection: float
    score_site: float
    score_final: float
    ss_qualite: float = 0.0
    sp_secteur: float = 0.0
    sp_taille: float = 0.0
    sp_digital: float = 0.0
    sp_site_vente: float = 0.0
    ss_structure_ux: float = 0.0
    ss_design: float = 0.0
    ss_hierarchie: float = 0.0
    ss_modernite: float = 0.0
    ss_mobile: float = 0.0
    niveau_lead: str = ""
    raisons_principales: list[str] = field(default_factory=list)
    problèmes_detectés: list[str] = field(default_factory=list)
    opportunités_de_revente: list[str] = field(default_factory=list)
    priorité_contact: str = "basse"


@dataclass
class ExcludedLead:
    name: str
    email: str
    website: str
    business_type: str
    exclusion_reason: str


def log(step: str, message: str = "") -> None:
    print(f"[{step}] {message}" if message else f"[{step}]", flush=True)


def is_valid_email(email: str) -> bool:
    import re

    email = (email or "").strip()
    return bool(email and re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def load_enriched_lookup() -> dict[str, dict[str, str]]:
    lookup: dict[str, dict[str, str]] = {}
    for row in load_csv_rows(DATA_ENRICHED):
        website = (row.get("website") or "").strip()
        key = domain_key(website) if website else maps_place_key(row.get("maps_link", ""))
        if key:
            lookup[key] = row
        name_key = (row.get("name") or "").strip().lower()[:60]
        if name_key:
            lookup[f"name:{name_key}"] = row
    return lookup


def merge_enriched(lead_row: dict[str, str], enriched: dict[str, dict[str, str]]) -> LeadContext:
    website = (lead_row.get("website") or "").strip()
    name = (lead_row.get("name") or "").strip()
    key = domain_key(website) or f"name:{name.lower()[:60]}"
    extra = enriched.get(key, {})

    return LeadContext(
        name=name or website,
        email=(lead_row.get("email") or "").strip(),
        website=website,
        business_type=(lead_row.get("business_type") or extra.get("business_type") or "").strip(),
        phone=(extra.get("phone") or "").strip(),
        address=(extra.get("address") or "").strip(),
        maps_link=(extra.get("maps_link") or "").strip(),
    )


def load_and_filter(path: Path) -> tuple[list[LeadContext], list[ExcludedLead]]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {path}")

    enriched = load_enriched_lookup()
    qualified: list[LeadContext] = []
    excluded: list[ExcludedLead] = []
    skipped = 0

    with path.open(newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            email = (row.get("email") or "").strip()
            if not is_valid_email(email):
                skipped += 1
                continue

            ctx = merge_enriched(row, enriched)
            ok, reason = qualify_lead(
                name=ctx.name,
                website=ctx.website,
                address=ctx.address,
                business_type=ctx.business_type,
            )
            if ok:
                qualified.append(ctx)
            else:
                excluded.append(
                    ExcludedLead(
                        name=ctx.name,
                        email=ctx.email,
                        website=ctx.website,
                        business_type=ctx.business_type or "autre",
                        exclusion_reason=reason,
                    )
                )

    log(
        "FILTER",
        f"PME qualifiées={len(qualified)} | exclues={len(excluded)} | sans email={skipped}",
    )
    return qualified, excluded


def breakdown_to_lead(ctx: LeadContext, bd: ScoreBreakdown) -> ScoredLead:
    return ScoredLead(
        name=ctx.name,
        email=ctx.email,
        url=normalize_url(ctx.website),
        business_type=ctx.business_type or "autre",
        score_prospection=bd.sp,
        score_site=bd.ss,
        score_final=bd.final,
        ss_qualite=bd.ss_quality,
        sp_secteur=bd.sp_parts.get("secteur", 0),
        sp_taille=bd.sp_parts.get("taille", 0),
        sp_digital=bd.sp_parts.get("digital", 0),
        sp_site_vente=bd.sp_parts.get("site_vente", 0),
        ss_structure_ux=bd.ss_parts.get("structure_ux", 0),
        ss_design=bd.ss_parts.get("design", 0),
        ss_hierarchie=bd.ss_parts.get("hierarchie_ux", 0),
        ss_modernite=bd.ss_parts.get("modernite", 0),
        ss_mobile=bd.ss_parts.get("mobile", 0),
        niveau_lead=niveau_from_final(bd.final),
        raisons_principales=bd.raisons,
        problèmes_detectés=bd.problemes,
        opportunités_de_revente=bd.opportunites,
        priorité_contact=priorite_from_final(bd.final),
    )


def save_ranked(leads: list[ScoredLead], path: Path) -> None:
    fields = [
        "name",
        "email",
        "url",
        "business_type",
        "score_prospection",
        "score_site",
        "score_final",
        "ss_qualite",
        "sp_secteur",
        "sp_taille",
        "sp_digital",
        "sp_site_vente",
        "ss_structure_ux",
        "ss_design",
        "ss_hierarchie",
        "ss_modernite",
        "ss_mobile",
        "niveau_lead",
        "priorité_contact",
        "raisons_principales",
        "problèmes_detectés",
        "opportunités_de_revente",
    ]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for lead in leads:
            w.writerow(
                {
                    "name": lead.name,
                    "email": lead.email,
                    "url": lead.url,
                    "business_type": lead.business_type,
                    "score_prospection": lead.score_prospection,
                    "score_site": lead.score_site,
                    "score_final": lead.score_final,
                    "ss_qualite": lead.ss_qualite,
                    "sp_secteur": lead.sp_secteur,
                    "sp_taille": lead.sp_taille,
                    "sp_digital": lead.sp_digital,
                    "sp_site_vente": lead.sp_site_vente,
                    "ss_structure_ux": lead.ss_structure_ux,
                    "ss_design": lead.ss_design,
                    "ss_hierarchie": lead.ss_hierarchie,
                    "ss_modernite": lead.ss_modernite,
                    "ss_mobile": lead.ss_mobile,
                    "niveau_lead": lead.niveau_lead,
                    "priorité_contact": lead.priorité_contact,
                    "raisons_principales": " | ".join(lead.raisons_principales),
                    "problèmes_detectés": " | ".join(lead.problèmes_detectés),
                    "opportunités_de_revente": " | ".join(lead.opportunités_de_revente),
                }
            )


def save_excluded(rows: list[ExcludedLead], path: Path) -> None:
    fields = ["name", "email", "website", "business_type", "exclusion_reason"]
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in rows:
            w.writerow(
                {
                    "name": r.name,
                    "email": r.email,
                    "website": r.website,
                    "business_type": r.business_type,
                    "exclusion_reason": r.exclusion_reason,
                }
            )


def run_parallel(leads: list[LeadContext]) -> list[ScoredLead]:
    scored: list[ScoredLead] = []
    total = len(leads)
    done = 0
    log("SCORE", f"v5.1 DOM/CSS/UX | {total} PME | {MAX_WORKERS} workers")

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(score_lead, ctx): ctx for ctx in leads}
        for future in as_completed(futures):
            done += 1
            ctx = futures[future]
            try:
                bd = future.result()
                result = breakdown_to_lead(ctx, bd)
                scored.append(result)
                ss_txt = "—" if bd.email_only else str(result.score_site)
                log(
                    "OK",
                    f"{done}/{total} {ctx.name[:32]} → "
                    f"SP={result.score_prospection} SS={ss_txt} F={result.score_final}",
                )
            except Exception as err:
                log("ERROR", f"{done}/{total} {ctx.name[:28]} : {err}")

    scored.sort(key=lambda x: x.score_final, reverse=True)
    return scored


def run(input_path: Path, output_path: Path) -> int:
    log("START", "lead_scorer v5.1 — filtre PME + SS vision heuristique")
    qualified, excluded = load_and_filter(input_path)

    if excluded:
        save_excluded(excluded, DEFAULT_EXCLUDED)
        log("EXCLUDED", f"{len(excluded)} lead(s) → {DEFAULT_EXCLUDED.name}")

    if not qualified:
        log("ABORT", "Aucune PME qualifiée après filtre")
        output_path.write_text("", encoding="utf-8")
        return 1

    scored = run_parallel(qualified)
    save_ranked(scored, output_path)

    top = scored[0].score_final if scored else 0
    log("DONE", f"{len(scored)} PME classées → {output_path.name} (top={top})")
    log("NEXT", "python notion_sync.py")
    return 0


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    inp = Path(args[0]) if args else DEFAULT_INPUT
    out = Path(args[1]) if len(args) > 1 else DEFAULT_OUTPUT
    try:
        return run(inp, out)
    except FileNotFoundError as err:
        log("ABORT", str(err))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
