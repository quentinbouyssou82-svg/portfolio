"""
Noyau performance du pipeline Lead Finder (1000–10000 leads).

FAST_MODE=1  → timeouts courts, pas de pages profondes, headless, blocage assets
WORKERS=N    → parallélisme (défaut : min(16, cpu_count*2))
CACHE        → cache/domain_cache.json (clé = domaine)
"""

from __future__ import annotations

import csv
import json
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, TypeVar
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

# --- Chemins ---
LEAD_FINDER_DIR = Path(__file__).resolve().parent
CACHE_DIR = LEAD_FINDER_DIR / "cache"
DOMAIN_CACHE_FILE = CACHE_DIR / "domain_cache.json"
DATA_CSV = LEAD_FINDER_DIR / "data.csv"
DATA_ENRICHED_CSV = LEAD_FINDER_DIR / "data_enriched.csv"

# --- Modes & limites ---
FAST_MODE = os.environ.get("FAST_MODE", "false").lower() in ("1", "true", "yes")
TURBO_MODE = os.environ.get("TURBO_MODE", "false").lower() in ("1", "true", "yes")
DEBUG_MODE = os.environ.get("DEBUG", "false").lower() in ("1", "true", "yes")
SAFE_MODE = os.environ.get("SAFE_MODE", "false").lower() in ("1", "true", "yes")
FORCE_REFRESH = os.environ.get("FORCE_REFRESH", "false").lower() in ("1", "true", "yes")
MERGE_SCRAPE = os.environ.get("MERGE_SCRAPE", "true").lower() in ("1", "true", "yes")
MERGE_OUTPUTS = os.environ.get("MERGE_OUTPUTS", "true").lower() in ("1", "true", "yes")
MAX_ROWS = int(os.environ.get("MAX_ROWS", "5" if DEBUG_MODE else "200"))

# TURBO = FAST + budgets agressifs (objectif ~10 min pour 200 leads côté emails)
if TURBO_MODE:
    FAST_MODE = True

_CPU = os.cpu_count() or 4
_DEFAULT_WORKERS = min(32 if TURBO_MODE else 16, max(8 if TURBO_MODE else 4, _CPU * 3))
WORKERS = min(32, max(1, int(os.environ.get("WORKERS", str(_DEFAULT_WORKERS)))))

# Réseau (secondes)
HTTP_TIMEOUT_S = float(
    os.environ.get("HTTP_TIMEOUT_S", "3" if TURBO_MODE else ("6" if FAST_MODE else "10"))
)
HTTP_RETRIES = int(
    os.environ.get("HTTP_RETRIES", "0" if TURBO_MODE else ("1" if FAST_MODE else "2"))
)
MAX_HTML_BYTES = int(
    os.environ.get("MAX_HTML_BYTES", "120000" if TURBO_MODE else ("250000" if FAST_MODE else "500000"))
)

# Playwright (ms)
NAVIGATION_TIMEOUT_MS = int(
    os.environ.get(
        "NAVIGATION_TIMEOUT_MS",
        "6000" if TURBO_MODE else ("8000" if FAST_MODE else "12000"),
    )
)
ACTION_TIMEOUT_MS = int(
    os.environ.get(
        "ACTION_TIMEOUT_MS",
        "4000" if TURBO_MODE else ("5000" if FAST_MODE else "8000"),
    )
)
PAGE_DELAY_MS = int(os.environ.get("PAGE_DELAY_MS", "0"))
ENRICH_MAX_WAIT_MS = int(
    os.environ.get(
        "ENRICH_MAX_WAIT_MS",
        "2800" if TURBO_MODE else ("6000" if FAST_MODE else "8000"),
    )
)
# Budget total max par fiche Maps (goto + extract) — évite les 60–130 s observés
ENRICH_PAGE_BUDGET_S = float(
    os.environ.get("ENRICH_PAGE_BUDGET_S", "8" if TURBO_MODE else ("12" if FAST_MODE else "18"))
)
PLAYWRIGHT_CONCURRENCY = int(
    os.environ.get(
        "PLAYWRIGHT_CONCURRENCY",
        # >3 onglets Maps en parallèle → fiches vides (anti-bot Google)
        "3" if TURBO_MODE else ("6" if FAST_MODE else "4"),
    )
)
HEADLESS = os.environ.get(
    "HEADLESS", "true" if FAST_MODE else os.environ.get("HEADLESS", "true")
).lower() in ("1", "true", "yes")

# Pages email (stop dès qu'un email est trouvé)
CONTACT_PATHS = (
    ("", "/contact")
    if TURBO_MODE
    else (
        ("", "/contact", "/mentions-legales", "/mentions")
        if FAST_MODE
        else ("", "/contact", "/mentions-legales", "/mentions", "/contact.html", "/nous-contacter")
    )
)

# Plateformes sans email propre (skip HTTP en TURBO)
SKIP_EMAIL_DOMAINS = frozenset(
    {
        "planity.com",
        "booksy.com",
        "facebook.com",
        "instagram.com",
        "google.com",
        "g.page",
        "wikipedia.org",
        "duckduckgo.com",
    }
)

USER_AGENT = "Mozilla/5.0 (compatible; LeadFinder/2.0; +prospection-web)"

T = TypeVar("T")


def sanitize_field(value: Any) -> str:
    """Retire les caractères invalides pour CSV (ex. NUL depuis Maps)."""
    if value is None:
        return ""
    return str(value).replace("\x00", "").strip()


def log(step: str, message: str = "") -> None:
    line = f"[{step}] {message}" if message else f"[{step}]"
    print(line, flush=True)


def log_config(script: str = "") -> None:
    prefix = f"{script} | " if script else ""
    turbo = " TURBO" if TURBO_MODE else ""
    log(
        "CONFIG",
        f"{prefix}FAST={FAST_MODE}{turbo} workers={WORKERS} pw={PLAYWRIGHT_CONCURRENCY} "
        f"http={HTTP_TIMEOUT_S}s enrich_budget={ENRICH_PAGE_BUDGET_S}s headless={HEADLESS}",
    )


def should_skip_email_domain(website: str) -> bool:
    key = domain_key(website)
    return any(skip in key for skip in SKIP_EMAIL_DOMAINS)


def maps_goto_url(url: str) -> str:
    """URL pour page.goto — conserve /data=… (requis pour ouvrir la fiche lieu)."""
    return (url or "").strip()


def normalize_maps_url(url: str) -> str:
    """URL courte pour CSV (affichage). Ne pas utiliser pour Playwright."""
    clean = maps_goto_url(url)
    if not clean:
        return clean
    idx = clean.find("/data=")
    if idx != -1:
        clean = clean[:idx]
    return clean.split("?")[0].split("&")[0]


def domain_key(url: str) -> str:
    if not url:
        return ""
    try:
        netloc = urlparse(url if "://" in url else f"https://{url}").netloc.lower()
        host = netloc.removeprefix("www.")
        # Ne jamais utiliser google.com comme clé (toutes les fiches Maps partagent ce domaine)
        if host in ("google.com", "maps.google.com", "goo.gl"):
            return ""
        return host
    except Exception:
        return ""


def maps_place_key(url: str) -> str:
    """Clé cache unique par fiche Google Maps (pas par domaine google.com)."""
    clean = normalize_maps_url(url)
    if "/place/" in clean:
        slug = clean.split("/place/", 1)[1].split("/")[0].lower()
        return f"maps:{slug}"
    return f"maps:{clean}"


def normalize_website(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return ""
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    parsed = urlparse(url)
    if not parsed.netloc:
        return ""
    blocked = ("google.com", "g.page", "facebook.com", "instagram.com", "duckduckgo.com")
    if any(b in parsed.netloc for b in blocked):
        return ""
    return url.split("?")[0]


# --- Cache domaine ---
@dataclass
class CacheEntry:
    website: str = ""
    email: str = ""
    phone: str = ""
    html_sample: str = ""
    updated_at: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> CacheEntry:
        return cls(
            website=data.get("website", "") or "",
            email=data.get("email", "") or "",
            phone=data.get("phone", "") or "",
            html_sample=data.get("html_sample", "") or "",
            updated_at=float(data.get("updated_at", 0) or 0),
        )


class DomainCache:
    def __init__(self, path: Path = DOMAIN_CACHE_FILE) -> None:
        self.path = path
        self._lock = threading.Lock()
        self._data: dict[str, dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        if self.path.is_file():
            try:
                self._data = json.loads(self.path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                self._data = {}

    def get(self, key: str) -> CacheEntry | None:
        if not key:
            return None
        with self._lock:
            raw = self._data.get(key)
        return CacheEntry.from_dict(raw) if raw else None

    def set(self, key: str, entry: CacheEntry) -> None:
        if not key:
            return
        entry.updated_at = time.time()
        with self._lock:
            self._data[key] = entry.to_dict()

    def save(self) -> None:
        with self._lock:
            snapshot = dict(self._data)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(snapshot, ensure_ascii=False), encoding="utf-8")


# --- Performance ---
class PerfTracker:
    def __init__(self, total: int, label: str = "sites") -> None:
        self.total = max(total, 1)
        self.label = label
        self.done = 0
        self.ok = 0
        self._start = time.perf_counter()
        self._lock = threading.Lock()

    def tick(self, success: bool = True, detail: str = "", site_ms: float = 0) -> None:
        with self._lock:
            self.done += 1
            if success:
                self.ok += 1
            done, ok, elapsed = self.done, self.ok, time.perf_counter() - self._start

        rate = done / elapsed if elapsed > 0 else 0.0
        remaining = self.total - done
        eta = remaining / rate if rate > 0 else 0.0
        ms_part = f" | {site_ms:.0f}ms" if site_ms else ""
        log(
            "PERF",
            f"{done}/{self.total} {self.label} | {rate:.2f}/s | "
            f"ETA {eta:.0f}s | ok {ok}{ms_part} {detail[:35]}",
        )

    def summary(self) -> None:
        elapsed = time.perf_counter() - self._start
        rate = self.done / elapsed if elapsed > 0 else 0.0
        log(
            "PERF_SUM",
            f"total {elapsed:.1f}s | {self.done} {self.label} | "
            f"{rate:.2f}/s | succès {self.ok}",
        )


# --- HTTP rapide ---
def fetch_url(url: str, timeout_s: float | None = None) -> tuple[str, float, str | None]:
    """GET HTML avec retry court. Retourne (html, ms, error)."""
    timeout = timeout_s if timeout_s is not None else HTTP_TIMEOUT_S
    last_err: str | None = None

    for attempt in range(HTTP_RETRIES + 1):
        start = time.perf_counter()
        try:
            request = Request(
                url,
                headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"},
            )
            with urlopen(request, timeout=timeout) as response:
                raw = response.read(MAX_HTML_BYTES)
            elapsed_ms = (time.perf_counter() - start) * 1000
            return raw.decode("utf-8", errors="replace"), elapsed_ms, None
        except HTTPError as err:
            last_err = f"HTTP {err.code}"
        except URLError as err:
            last_err = f"URL {err.reason}"
        except Exception as err:
            last_err = str(err)[:80]

        if attempt < HTTP_RETRIES:
            time.sleep(0.15)

    return "", 0.0, last_err


def fetch_contact_pages(
    website: str,
    paths: tuple[str, ...] = CONTACT_PATHS,
    stop_on_email: bool = False,
    email_extractor: Callable[[str], list[str]] | None = None,
) -> tuple[str, str, float, str]:
    """
    Parcourt homepage + contact + mentions.
    Retourne (html, url_used, ms_total, email_found).
    Si stop_on_email et extractor fournis → stop dès le 1er email valide.
    """
    from email_utils import extract_emails_from_html, pick_best_email

    extract = email_extractor or extract_emails_from_html
    pick = pick_best_email
    base = website.rstrip("/")
    total_ms = 0.0

    for path in paths:
        url = base if not path else f"{base}{path}"
        html, ms, _err = fetch_url(url)
        total_ms += ms
        if not html:
            continue
        if stop_on_email:
            emails = extract(html)
            best = pick(emails, website)
            if best:
                return html, url, total_ms, best
        else:
            return html, url, total_ms, ""

    return "", "", total_ms, ""


# --- CSV streaming ---
class StreamingCsvWriter:
    """Écriture ligne par ligne + flush (reprise possible)."""

    def __init__(self, path: Path, fieldnames: list[str]) -> None:
        self.path = path
        self.fieldnames = fieldnames
        self._file = path.open("w", newline="", encoding="utf-8")
        self._writer = csv.DictWriter(self._file, fieldnames=fieldnames, extrasaction="ignore")
        self._writer.writeheader()
        self._file.flush()
        self._lock = threading.Lock()

    def write_row(self, row: dict[str, Any]) -> None:
        clean = {k: sanitize_field(v) for k, v in row.items()}
        with self._lock:
            self._writer.writerow(clean)
            self._file.flush()

    def close(self) -> None:
        self._file.close()


def is_enriched_complete(row: dict[str, Any]) -> bool:
    """Fiche déjà enrichie (site ou téléphone présent)."""
    return bool(sanitize_field(row.get("website")) or sanitize_field(row.get("phone")))


def load_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        return []
    rows: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            rows.append({k: sanitize_field(row.get(k, "")) for k in row})
    return rows


def index_rows_by_place(rows: list[dict[str, str]], link_field: str = "maps_link") -> dict[str, dict[str, str]]:
    index: dict[str, dict[str, str]] = {}
    for row in rows:
        key = maps_place_key(row.get(link_field, ""))
        if not key:
            continue
        index[key] = row
    return index


def _row_dedupe_key(row: dict[str, str], url_field: str = "website") -> str:
    url = row.get(url_field) or row.get("url", "")
    if url and not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return domain_key(url) or maps_place_key(row.get("maps_link", "")) or row.get("email", "").lower()


def write_csv_rows(path: Path, fieldnames: list[str], rows: list[dict[str, Any]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({k: sanitize_field(row.get(k, "")) for k in fieldnames})


def merge_leads_by_website(
    existing: list[dict[str, str]],
    new_rows: list[dict[str, str]],
    url_field: str = "website",
) -> tuple[list[dict[str, str]], int]:
    """Fusionne sans doublon de domaine site (ni email si pas de site)."""
    seen: set[str] = set()
    merged: list[dict[str, str]] = []
    added = 0
    for row in existing:
        key = _row_dedupe_key(row, url_field)
        if key and key not in seen:
            seen.add(key)
            merged.append(row)
    for row in new_rows:
        key = _row_dedupe_key(row, url_field)
        if not key or key in seen:
            continue
        seen.add(key)
        merged.append(row)
        added += 1
    return merged, added


def append_csv_row(path: Path, fieldnames: list[str], row: dict[str, Any]) -> None:
    exists = path.is_file() and path.stat().st_size > 0
    with path.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames, extrasaction="ignore")
        if not exists:
            writer.writeheader()
        writer.writerow(row)


# --- Parallélisation ---
def run_parallel(
    items: list[T],
    worker: Callable[[T], Any],
    workers: int | None = None,
    perf: PerfTracker | None = None,
) -> list[Any]:
    if not items:
        return []

    pool_size = workers if workers is not None else WORKERS
    pool_size = min(pool_size, len(items))
    results: list[Any] = []

    with ThreadPoolExecutor(max_workers=pool_size) as executor:
        futures = {executor.submit(worker, item): item for item in items}
        for future in as_completed(futures):
            item = futures[future]
            try:
                result = future.result()
                results.append(result)
                if perf:
                    perf.tick(success=result is not None, detail=str(getattr(item, "name", item))[:35])
            except Exception as err:
                log("WORKER_ERR", f"{err}")
                if perf:
                    perf.tick(success=False, detail="error")
    return results


# --- Playwright optimisé ---
BLOCKED_RESOURCE_TYPES = frozenset({"image", "stylesheet", "font", "media", "websocket"})


def install_fast_routes(context) -> None:
    """Bloque images / CSS / fonts pour accélérer Playwright."""

    def handle(route, request):
        if request.resource_type in BLOCKED_RESOURCE_TYPES:
            route.abort()
        else:
            route.continue_()

    context.route("**/*", handle)


def configure_playwright_page(page) -> None:
    page.set_default_navigation_timeout(NAVIGATION_TIMEOUT_MS)
    page.set_default_timeout(ACTION_TIMEOUT_MS)


def launch_fast_browser(playwright, headless: bool | None = None):
    """Un browser + context partagés (sync Playwright)."""
    use_headless = HEADLESS if headless is None else headless
    log("BROWSER", f"Chromium headless={use_headless}…")
    browser = playwright.chromium.launch(headless=use_headless)
    context = browser.new_context(
        locale="fr-FR",
        viewport={"width": 1280, "height": 720},
        java_script_enabled=True,
    )
    install_fast_routes(context)
    log("BROWSER", "prêt (assets lourds bloqués)")
    return browser, context


async def launch_fast_browser_async(playwright, headless: bool | None = None):
    """Un browser + context partagés (async Playwright)."""
    use_headless = HEADLESS if headless is None else headless
    log("BROWSER", f"Chromium async headless={use_headless}…")
    browser = await playwright.chromium.launch(headless=use_headless)
    context = await browser.new_context(
        locale="fr-FR",
        viewport={"width": 1280, "height": 720},
        java_script_enabled=True,
    )

    async def handle(route):
        if route.request.resource_type in BLOCKED_RESOURCE_TYPES:
            await route.abort()
        else:
            await route.continue_()

    await context.route("**/*", handle)
    log("BROWSER", "prêt (async, assets bloqués)")
    return browser, context


def apply_row_limit(businesses: list) -> list:
    if len(businesses) > MAX_ROWS:
        log("LIMIT", f"{len(businesses)} → {MAX_ROWS} lignes")
        return businesses[:MAX_ROWS]
    return businesses
