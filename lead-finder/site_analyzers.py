"""
Analyse site v5.1 — 3 couches : DOM, CSS heuristiques, proxy UX visuel.
1 requête HTTP, perception humaine (pas SEO / perf / WHOIS).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

# --- Marqueurs datés (pénalité forte) ---
DATED_MARKERS = (
    "bienvenue sur",
    "bienvenue sur notre site",
    "cliquez ici",
    "click here",
    "compteur de visite",
    "visitor counter",
    "hit counter",
    "meilleur avec internet explorer",
    "lorem ipsum",
    "site en cours",
    "under construction",
)

DATED_HTML = (
    "<marquee",
    "<blink",
    "<font ",
    "<center>",
    "bgcolor=",
    "spacer.gif",
    "frameset",
)

TEMPLATE_MARKERS = (
    "wix.com",
    "wixsite.com",
    "jimdo",
    "site-solocal",
    "webself",
    "created with wix",
    "powered by wix",
)

MODERN_CSS = (
    "box-shadow",
    "border-radius",
    "transition:",
    "transform:",
    "hover:",
    "display:flex",
    "display: grid",
    "grid-template",
    "object-fit",
    "backdrop-filter",
)

MODERN_FONTS = ("inter", "poppins", "montserrat", "dm sans", "outfit", "raleway", "work sans")
LEGACY_FONTS = ("arial", "times new roman", "comic sans", "papyrus", "courier new")


@dataclass
class SiteAnalysis:
    fetched: bool = False
    status_code: int = 0
    error: str = ""
    platform_site: bool = False
    has_form: bool = False
    social_links: bool = False
    # Scores qualité 0–100 par axe (élevé = bon)
    structure_ux: float = 40.0
    design: float = 40.0
    hierarchie_ux: float = 40.0
    modernite: float = 40.0
    mobile: float = 40.0
    dated_penalty: float = 0.0
    signals: list[str] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return round(max(lo, min(hi, v)), 1)


def _strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html.lower())


def max_dom_depth(html: str, limit: int = 12000) -> int:
    """Profondeur max approximative des balises ouvrantes."""
    depth = 0
    max_d = 0
    for m in re.finditer(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>", html[:limit]):
        closing, tag = m.group(1), m.group(2).lower()
        if tag in ("br", "img", "meta", "link", "input", "hr", "area", "base", "col", "embed", "source", "track", "wbr"):
            continue
        if closing:
            depth = max(0, depth - 1)
        else:
            depth += 1
            max_d = max(max_d, depth)
    return max_d


def count_hex_colors(low: str) -> int:
    return len(set(re.findall(r"#[0-9a-f]{3,8}\b", low, re.I)))


def count_font_families(low: str) -> int:
    families = set(re.findall(r"font-family\s*:\s*([^;}{]+)", low, re.I))
    families |= set(re.findall(r"fonts\.googleapis\.com/css[^\"']*family=([^&\"']+)", low, re.I))
    count = 0
    for f in families:
        parts = re.split(r",", f)
        count += len([p for p in parts if p.strip() and "inherit" not in p])
    return min(count, 12) if count else (1 if "font-family" in low else 0)


def analyze_site_html(html: str, url: str, host: str) -> SiteAnalysis:
    a = SiteAnalysis()
    a.fetched = bool(html)
    if not html:
        a.structure_ux = 25
        a.design = 25
        a.hierarchie_ux = 25
        a.modernite = 25
        a.mobile = 20
        a.problems.append("Site injoignable ou HTML vide")
        return a

    low = html.lower()
    visible = _strip_tags(html)[:10000]

    # --- Couche 1 : DOM ---
    has_header = bool(re.search(r"<header[\s>]", low, re.I))
    has_main = bool(re.search(r"<main[\s>]", low, re.I))
    has_footer = bool(re.search(r"<footer[\s>]", low, re.I))
    has_nav = bool(re.search(r"<nav[\s>]", low, re.I))
    has_section = low.count("<section") >= 1
    semantic = sum([has_header, has_main, has_footer, has_nav, has_section])
    div_count = low.count("<div")
    depth = max_dom_depth(html)
    nav_links = len(re.findall(r"<nav[\s\S]*?</nav>", low, re.I))
    link_in_nav = 0
    if nav_links:
        link_in_nav = sum(block.count("<a ") for block in re.findall(r"<nav[\s\S]*?</nav>", low, re.I))
    else:
        link_in_nav = min(40, low.count("<a "))

    structure = 42.0
    if semantic >= 4:
        structure += 28
        a.signals.append("Structure sémantique complète")
    elif semantic >= 2:
        structure += 14
    if has_section:
        structure += 8
    if depth > 6:
        structure -= 22
        a.problems.append("DOM trop profond")
    elif depth <= 4 and semantic >= 2:
        structure += 8
    if div_count > 80 and semantic < 2:
        structure -= 18
        a.problems.append("Structure plate (trop de div)")
    if link_in_nav > 40:
        structure -= 20
        a.problems.append("Navigation surchargée")
    elif has_nav and 4 <= link_in_nav <= 22:
        structure += 12
    a.structure_ux = _clamp(structure)

    # --- Couche 2 : CSS heuristiques ---
    hex_colors = count_hex_colors(low)
    font_count = count_font_families(low)
    inline_styles = low.count("style=")
    has_google_fonts = "fonts.googleapis" in low
    modern_font = any(f in low for f in MODERN_FONTS)
    legacy_only = any(f in low for f in LEGACY_FONTS) and not modern_font
    shadows = low.count("box-shadow")
    radius = len(re.findall(r"border-radius\s*:\s*\d", low))
    transitions = low.count("transition")
    flex_grid = sum(1 for k in ("display:flex", "display: grid", "grid-template") if k in low)

    design = 45.0
    if 2 <= hex_colors <= 8:
        design += 18
        a.signals.append("Palette cohérente")
    elif hex_colors > 14:
        design -= 25
        a.problems.append("Trop de couleurs différentes")
    elif hex_colors == 0:
        design -= 8
    if font_count <= 2 and (has_google_fonts or modern_font):
        design += 20
    elif font_count >= 4:
        design -= 22
        a.problems.append("Trop de polices")
    elif legacy_only:
        design -= 18
        a.problems.append("Typographie datée")
    if inline_styles > 55:
        design -= 16
        a.problems.append("Styles inline excessifs")
    if shadows >= 2 or radius >= 3:
        design += 14
    if flex_grid >= 2:
        design += 10
    a.design = _clamp(design)

    # --- Couche 3 : proxy UX visuel ---
    h1_count = len(re.findall(r"<h1[\s>]", low, re.I))
    h2_count = low.count("<h2")
    has_cta = any(
        k in visible
        for k in ("contact", "devis", "réserver", "reserver", "rendez-vous", "rdv", "nous contacter", "appeler")
    )
    has_btn = bool(re.search(r"<button|class=\"[^\"]*btn", low, re.I))
    has_hero = bool(
        re.search(r'class="[^"]*(hero|banner|jumbotron)', low, re.I)
        or (h1_count >= 1 and low.count("<img") >= 2)
    )
    img_count = len(re.findall(r"<img[\s>]", low, re.I))
    has_video = "<video" in low or "youtube.com/embed" in low or "vimeo.com" in low
    text_len = len(visible)

    hier = 40.0
    if h1_count == 1:
        hier += 18
    elif h1_count == 0:
        hier -= 15
        a.problems.append("Pas de H1 clair")
    if h2_count >= 2:
        hier += 10
    if has_cta and (has_btn or has_hero):
        hier += 22
        a.signals.append("CTA visibles")
    elif not has_cta:
        hier -= 20
        a.problems.append("Pas de CTA")
    if text_len > 6000 and img_count < 3:
        hier -= 15
        a.problems.append("Contenu trop dense")
    elif text_len < 200 and img_count < 1:
        hier -= 10
        a.problems.append("Page trop vide")
    a.hierarchie_ux = _clamp(hier)

    modern = 38.0
    modern_hits = sum(1 for k in MODERN_CSS if k in low)
    if modern_hits >= 4:
        modern += 28
    elif modern_hits >= 2:
        modern += 14
    if has_video:
        modern += 10
    if img_count >= 6:
        modern += 8
    if flex_grid >= 1 and radius >= 2:
        modern += 10
    if inline_styles < 25 and not re.search(r"<table", low):
        modern += 6
    a.modernite = _clamp(modern)

    has_viewport = 'name="viewport"' in low or "width=device-width" in low
    media_queries = "@media" in low or "max-width" in low
    mobile = 35.0
    if has_viewport and media_queries:
        mobile += 45
        a.signals.append("Responsive mobile")
    elif has_viewport:
        mobile += 22
    else:
        mobile -= 25
        a.problems.append("Viewport absent")
    if len(re.findall(r"width:\s*\d{3,4}px", low)) >= 4:
        mobile -= 20
        a.problems.append("Layout largeur fixe")
    a.mobile = _clamp(mobile)

    # --- Pénalité site daté (0–35 points retirés sur qualité globale) ---
    penalty = 0.0
    if any(m in visible for m in DATED_MARKERS):
        penalty += 12
        a.problems.append("Texte daté (bienvenue / cliquez ici)")
    if any(m in low for m in DATED_HTML):
        penalty += 14
        a.problems.append("HTML daté (tables layout / font)")
    if low.count("<table") >= 2:
        penalty += 10
        a.problems.append("Tables HTML pour mise en page")
    if ".gif" in low and "animation" not in low:
        penalty += 4
    if any(t in low for t in TEMPLATE_MARKERS):
        penalty += 10
        a.problems.append("Template générique (Wix/Jimdo/Solocal)")
    years = [int(m.group(1)) for m in re.finditer(r"(?:©|copyright)[^\d]{0,20}(20\d{2})", low, re.I)]
    if years and max(years) < 2020:
        penalty += 12
        a.problems.append("Copyright ancien")

    a.dated_penalty = min(35.0, penalty)
    a.has_form = "<form" in low
    a.social_links = any(s in low for s in ("facebook.com", "instagram.com", "linkedin.com"))
    a.platform_site = any(
        p in host for p in ("planity.com", "booksy.com", "facebook.com", "instagram.com")
    )
    if a.platform_site:
        a.design = min(a.design, 35)
        a.problems.append("Plateforme tierce, pas site vitrine")

    return a
