"""
Filtre business v5.1 — ne garder que les PME / indépendants locaux vendables.
"""

from __future__ import annotations

import re
import unicodedata
from urllib.parse import urlparse

# Franchises / chaînes nationales (nom ou domaine)
FRANCHISE_KEYWORDS = (
    "mcdonald",
    "burger king",
    "kfc",
    "subway",
    "starbucks",
    "pizza hut",
    "domino",
    "carrefour",
    "leclerc",
    "auchan",
    "intermarche",
    "intermarché",
    "casino ",
    "monoprix",
    "franprix",
    "dessange",
    "jean louis david",
    "jean-louis david",
    "quick ",
    "paul ",
    "brioche doree",
    "brioche dorée",
    "la poste",
    "relay ",
    "orange ",
    "sfr ",
    "bouygues telecom",
    "free mobile",
)

# Institutions / public / ordres professionnels (pas PME cible)
INSTITUTION_KEYWORDS = (
    "ordre des",
    "conseil de l'ordre",
    "conseil de lordre",
    "chambre de commerce",
    "chambre des metiers",
    "mairie de",
    "ville de ",
    "prefecture",
    "préfecture",
    "universite ",
    "université ",
    "ministere",
    "ministère ",
    "hopital public",
    "hôpital public",
    "centre hospitalier",
    "gendarmerie",
    "police nationale",
    "caisse primaire",
    "urssaf",
    "pole emploi",
    "pôle emploi",
)

# Grandes marques / groupes nationaux / SaaS / réseaux
CORPORATE_KEYWORDS = (
    "foncia",
    "orpi ",
    "century 21",
    "laforet",
    "la forêt",
    "guy hoquet",
    "stéphane plaza",
    "stephane plaza",
    "credit agricole",
    "crédit agricole",
    "bnp paribas",
    "societe generale",
    "société générale",
    "lcl ",
    "banque populaire",
    "cafpi",
    "axa ",
    "allianz",
    "groupama",
    "macif",
    "maif ",
    "salesforce",
    "hubspot",
    "microsoft",
    "google workspace",
    "amazon ",
    "decathlon",
    "ikea",
    "leroy merlin",
    "castorama",
    "but ",
    "conforama",
    "darty",
    "boulanger ",
    "fnac",
    "espace atypiques",
    "espaces atypiques",
    "groupe ",
    " sa national",
    "franchise ",
    "reseau national",
    "réseau national",
    "filiale de",
    "holding ",
)

# Domaines corporate / plateformes (pas site vitrine PME)
CORPORATE_DOMAINS = (
    "mcdonalds.fr",
    "carrefour.fr",
    "leclerc.com",
    "foncia.com",
    "orpi.com",
    "dessange.com",
    "cafpi.fr",
    "orange.fr",
    "sfr.fr",
    "free.fr",
    "laposte.fr",
    "wikipedia.org",
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "youtube.com",
    "amazon.fr",
    "google.com",
    "microsoft.com",
    "salesforce.com",
)

# Mots qui renforcent le profil PME local (garde-fou)
LOCAL_PME_HINTS = (
    "eurl",
    "sarl",
    "sasu",
    "artisan",
    "plombier",
    "electricien",
    "électricien",
    "coiffeur",
    "salon",
    "restaurant",
    "cabinet",
    "avocat",
    "menuisier",
    "macon",
    "maçon",
    "chauffagiste",
    "garage",
    "boulangerie",
    "patisserie",
    "pâtisserie",
    "institut",
    "esthetique",
    "esthétique",
)


def _norm(text: str) -> str:
    text = (text or "").strip().lower()
    text = unicodedata.normalize("NFD", text)
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


def _contains_any(blob: str, keywords: tuple[str, ...]) -> str | None:
    for kw in keywords:
        if _norm(kw) in blob:
            return kw
    return None


def parse_review_count(address: str) -> int:
    if not address:
        return 0
    m = re.search(r"\((\d+)\s*avis", address, re.I)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)\s*avis", address, re.I)
    return int(m.group(1)) if m else 0


def qualify_lead(
    name: str = "",
    website: str = "",
    address: str = "",
    business_type: str = "",
) -> tuple[bool, str]:
    """
    Retourne (True, "") si PME locale qualifiée.
    Retourne (False, raison) si exclu (franchise, institution, corporate).
    """
    name_n = _norm(name)
    address_n = _norm(address)
    blob = f"{name_n} {address_n} {_norm(business_type)}"

    website = (website or "").strip()
    host = urlparse(website if "://" in website else f"https://{website}").netloc.lower()
    if host.startswith("www."):
        host = host[4:]

    for dom in CORPORATE_DOMAINS:
        if host == dom or host.endswith("." + dom):
            return False, f"Domaine corporate / plateforme ({dom})"

    hit = _contains_any(blob, INSTITUTION_KEYWORDS)
    if hit:
        return False, f"Institution / organisme ({hit})"

    hit = _contains_any(blob, FRANCHISE_KEYWORDS)
    if hit:
        return False, f"Franchise / chaîne ({hit})"

    hit = _contains_any(blob, CORPORATE_KEYWORDS)
    if hit:
        # Garde-fou : petit nom avec "cabinet avocat" sans marque nationale
        if hit in ("groupe ", "holding ") and any(h in blob for h in LOCAL_PME_HINTS):
            pass
        else:
            return False, f"Grande marque / réseau ({hit})"

    # Volume d'avis Maps très élevé → souvent chaîne / marque
    reviews = parse_review_count(address)
    if reviews >= 800:
        return False, f"Trop d'avis Maps ({reviews}) — probable enseigne / chaîne"

    # Nom très long + mots corporate
    if len(name) > 85 and reviews >= 200:
        return False, "Nom entreprise très long + forte notoriété Maps"

    return True, "PME locale qualifiée"
