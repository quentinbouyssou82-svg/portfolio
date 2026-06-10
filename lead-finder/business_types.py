"""
Classification métier (business_type) + bonus score prospection (PC).
"""

from __future__ import annotations

import re
import unicodedata

# Bonus PC selon secteur
PC_BONUS_HIGH = 10.0   # immobilier, juridique, santé, BTP, finance
PC_BONUS_LOCAL = 5.0   # commerce local classique
PC_BONUS_LOW = -5.0    # hobby / faible valeur
PC_BONUS_DEFAULT = 0.0

# Types normalisés (slug Notion / CSV)
KNOWN_TYPES = (
    "coiffeur",
    "restaurant",
    "plombier",
    "avocat",
    "immobilier",
    "salle_de_sport",
    "sante",
    "btp",
    "finance",
    "commerce",
    "beaute",
    "automobile",
    "hotel",
    "education",
    "autre",
    "hobby",
)

# Mots-clés → type (ordre : plus spécifique en premier)
_TYPE_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("immobilier", ("immobilier", "immo", "agence immobilière", "agent immobilier")),
    ("avocat", ("avocat", "cabinet d'avocat", "juridique", "notaire", "huissier")),
    ("finance", ("banque", "assurance", "comptable", "expert-comptable", "finance", "courtier")),
    ("sante", (
        "médecin", "medecin", "dentiste", "clinique", "pharmacie", "kinésithérapeute",
        "kinesitherapeute", "vétérinaire", "veterinaire", "hôpital", "hopital", "santé", "sante",
    )),
    ("btp", (
        "plombier", "électricien", "electricien", "maçon", "macon", "menuisier",
        "rénovation", "renovation", "btp", "artisan", "chauffagiste", "couvreur",
        "peintre en bâtiment", "carreleur",
    )),
    ("coiffeur", ("coiffeur", "coiffure", "salon de coiffure", "barbier", "barber")),
    ("restaurant", ("restaurant", "restauration", "brasserie", "pizzeria", "bistrot", "café", "cafe")),
    ("salle_de_sport", ("salle de sport", "fitness", "gym", "crossfit", "musculation", "yoga")),
    ("beaute", ("esthétique", "esthetique", "institut de beauté", "spa", "onglerie", "massage")),
    ("automobile", ("garage", "automobile", "carrosserie", "mécanicien", "mecanicien")),
    ("hotel", ("hôtel", "hotel", "hébergement", "hebergement", "chambre d'hôtes")),
    ("education", ("école", "ecole", "formation", "cours", "auto-école")),
    ("hobby", ("hobby", "loisir créatif", "association", "club de")),
]

_HIGH_VALUE_TYPES = frozenset({"immobilier", "avocat", "sante", "btp", "finance"})
_LOCAL_TYPES = frozenset({
    "coiffeur", "restaurant", "plombier", "commerce", "beaute",
    "automobile", "hotel", "salle_de_sport", "education",
})
_LOW_TYPES = frozenset({"hobby", "autre"})


def _normalize_text(text: str) -> str:
    text = (text or "").strip().lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text


def classify_business_type(
    category: str = "",
    name: str = "",
    address: str = "",
    default_query_hint: str = "",
) -> str:
    """
    Déduit business_type depuis catégorie Maps, nom, adresse ou requête de recherche.
    """
    blob = _normalize_text(f"{category} {name} {address} {default_query_hint}")

    for slug, keywords in _TYPE_RULES:
        for kw in keywords:
            if _normalize_text(kw) in blob:
                return slug

    # Mot unique dans la requête (ex. « plombier Montauban »)
    if default_query_hint:
        first = _normalize_text(default_query_hint.split()[0] if default_query_hint else "")
        for slug, keywords in _TYPE_RULES:
            if first and any(first in _normalize_text(k) for k in keywords):
                return slug
            if first == slug or first in slug:
                return slug if slug in KNOWN_TYPES else "commerce"

    if category:
        return "commerce"
    return "autre"


def extract_category_from_maps_line(line: str) -> str:
    """
    Extrait la catégorie depuis une ligne Maps du type :
    « Salon de coiffure · 4,5 · 416 Av. Jean Moulin »
    """
    line = (line or "").strip()
    if not line:
        return ""
    if "·" in line:
        return line.split("·")[0].strip()
    return line


def pc_bonus_for_type(business_type: str) -> tuple[float, str]:
    """Legacy — utiliser sector_prospection_score."""
    score, note = sector_prospection_score(business_type)
    return score / 10.0, note


# Score secteur SP (0–100) — aligné sur grille prospection refonte web + IA
_SECTOR_SP_SCORES: dict[str, int] = {
    "sante": 100,
    "avocat": 100,
    "finance": 100,
    "immobilier": 100,
    "btp": 85,
    "automobile": 85,
    "hotel": 80,
    "restaurant": 80,
    "salle_de_sport": 80,
    "education": 75,
    "beaute": 70,
    "coiffeur": 60,
    "commerce": 40,
    "plombier": 85,
    "autre": 35,
    "hobby": 20,
}

# Mots-clés nom/adresse → boost secteur premium
_PREMIUM_KEYWORDS = (
    "dentiste", "chirurgien", "clinique", "avocat", "notaire", "architecte",
    "immobilier", "concession", "comptable", "expert-comptable", "kinésithérapeute",
    "veterinaire", "vétérinaire",
)
_MID_KEYWORDS = (
    "restaurant", "brasserie", "hotel", "hôtel", "fitness", "formation",
    "boulangerie", "traiteur",
)


def sector_prospection_score(
    business_type: str = "",
    name: str = "",
    address: str = "",
) -> tuple[float, str]:
    """
    Score secteur pour SP (0–100).
    Enrichit via business_type + mots-clés nom/adresse.
    """
    t = (business_type or "autre").strip().lower()
    blob = _normalize_text(f"{name} {address}")

    for kw in _PREMIUM_KEYWORDS:
        if _normalize_text(kw) in blob:
            return 100.0, f"Secteur premium détecté ({kw})"

    for kw in _MID_KEYWORDS:
        if _normalize_text(kw) in blob:
            return 80.0, f"Secteur intermédiaire ({kw})"

    base = float(_SECTOR_SP_SCORES.get(t, _SECTOR_SP_SCORES["autre"]))
    label = t.replace("_", " ")
    return base, f"Secteur {label} — potentiel {int(base)}/100"


def notion_select_options() -> list[dict[str, str]]:
    """Options pour colonne select Notion."""
    colors = {
        "immobilier": "purple",
        "avocat": "purple",
        "sante": "red",
        "btp": "brown",
        "finance": "blue",
        "coiffeur": "pink",
        "restaurant": "orange",
        "plombier": "yellow",
        "salle_de_sport": "green",
        "commerce": "gray",
        "autre": "default",
        "hobby": "gray",
    }
    return [
        {"name": t, "color": colors.get(t, "default")}
        for t in KNOWN_TYPES
    ]
