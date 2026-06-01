#!/usr/bin/env python3
"""
Étape 3 : classe les prospects de data_enriched.csv par potentiel commercial.

Usage :
    python score_leads.py

Produit : data_scored.csv (trié par score décroissant)
"""

from __future__ import annotations

import csv
import re
import sys
from dataclasses import dataclass
from pathlib import Path

LEAD_FINDER_DIR = Path(__file__).resolve().parent
INPUT_CSV = LEAD_FINDER_DIR / "data_enriched.csv"
OUTPUT_CSV = LEAD_FINDER_DIR / "data_scored.csv"

# Mots typiques d'une activité professionnelle (vs. particulier)
BUSINESS_KEYWORDS = (
    "salon",
    "coiffeur",
    "coiffure",
    "barber",
    "barbier",
    "studio",
    "institut",
    "restaurant",
    "agence",
    "cabinet",
    "shop",
    "boutique",
    "fitness",
    "habitat",
    "entreprise",
    "sarl",
    "sas",
    "eurl",
    "dessange",
    "barbouzes",
    "comptoir",
    "bar ",
    " bar",
)


@dataclass
class ScoredLead:
    name: str
    website: str
    phone: str
    address: str
    score_total: int
    priority: str


def has_value(value: str) -> bool:
    return bool((value or "").strip())


def is_company_name(name: str) -> bool:
    """
    Heuristique : entreprise si mot-clé métier, forme juridique,
    nom long ou structure non « Prénom Nom ».
    """
    clean = (name or "").strip()
    if not clean:
        return False

    lower = clean.lower()

    if any(keyword in lower for keyword in BUSINESS_KEYWORDS):
        return True

    if re.search(r"\b(sarl|sas|eurl|sa|sasu)\b", lower):
        return True

    if "&" in clean or "#" in clean:
        return True

    words = [w for w in re.split(r"\s+", clean) if w]
    if len(words) >= 3:
        return True

    # « Prénom Nom » sur deux mots courts → plutôt un particulier
    if len(words) == 2 and all(w[0].isupper() for w in words if w):
        if len(words[0]) <= 12 and len(words[1]) <= 14:
            return False

    return True


def is_complete_address(address: str) -> bool:
    """Adresse jugée exploitable (rue, numéro ou libellé assez long)."""
    clean = (address or "").strip()
    if len(clean) < 10:
        return False

    lower = clean.lower()
    street_hints = (
        "rue",
        "avenue",
        " av.",
        " av ",
        " bd",
        "boulevard",
        "place",
        "chemin",
        "route",
        "impasse",
        "allée",
        "montauban",
    )
    if any(hint in lower for hint in street_hints):
        return True

    return bool(re.search(r"\d", clean))


def compute_score(website: str, phone: str, name: str, address: str) -> int:
    score = 0

    if has_value(website):
        score += 30

    if has_value(phone):
        score += 20

    if is_company_name(name):
        score += 20

    if is_complete_address(address):
        score += 10

    if not has_value(website) and not has_value(phone):
        score -= 20

    return score


def priority_from_score(score: int) -> str:
    if score >= 60:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    return "LOW"


def load_enriched(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {path}")

    rows: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            rows.append({k: (row.get(k) or "").strip() for k in row})
    return rows


def score_leads(rows: list[dict[str, str]]) -> list[ScoredLead]:
    scored: list[ScoredLead] = []

    for row in rows:
        name = row.get("name", "")
        website = row.get("website", "")
        phone = row.get("phone", "")
        address = row.get("address", "")

        if not name:
            continue

        total = compute_score(website, phone, name, address)
        scored.append(
            ScoredLead(
                name=name,
                website=website,
                phone=phone,
                address=address,
                score_total=total,
                priority=priority_from_score(total),
            )
        )

    scored.sort(key=lambda lead: lead.score_total, reverse=True)
    return scored


def save_scored(leads: list[ScoredLead], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["name", "website", "phone", "address", "score_total", "priority"],
        )
        writer.writeheader()
        for lead in leads:
            writer.writerow(
                {
                    "name": lead.name,
                    "website": lead.website,
                    "phone": lead.phone,
                    "address": lead.address,
                    "score_total": lead.score_total,
                    "priority": lead.priority,
                }
            )


def main() -> int:
    try:
        rows = load_enriched(INPUT_CSV)
    except FileNotFoundError as err:
        print(err, file=sys.stderr)
        print("Lancez d’abord : python enrich_maps.py", file=sys.stderr)
        return 1

    if not rows:
        print("Aucune ligne dans data_enriched.csv.", file=sys.stderr)
        return 1

    leads = score_leads(rows)
    save_scored(leads, OUTPUT_CSV)

    high = sum(1 for lead in leads if lead.priority == "HIGH")
    medium = sum(1 for lead in leads if lead.priority == "MEDIUM")
    low = sum(1 for lead in leads if lead.priority == "LOW")

    print(f"{len(leads)} prospect(s) classé(s) → {OUTPUT_CSV.name}")
    print(f"  HIGH={high}  MEDIUM={medium}  LOW={low}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
