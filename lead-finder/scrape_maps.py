#!/usr/bin/env python3
"""
Étape 1 : scrape Google Maps — 100–200 leads, multi-secteurs.

Variables :
  SEARCH_QUERY      — une recherche (ex. « coiffeur Montauban »)
  SEARCH_QUERIES    — plusieurs recherches séparées par | ou ;
  MAX_ROWS          — défaut 200 (via pipeline_core)
  TARGET_COUNT      — alias de MAX_ROWS si défini

Usage :
  MAX_ROWS=150 SEARCH_QUERIES="coiffeur|restaurant|plombier Montauban" python scrape_maps.py
"""

from __future__ import annotations

import os
import re
from urllib.parse import quote_plus

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeout
from playwright.sync_api import sync_playwright

from business_types import classify_business_type, extract_category_from_maps_line
from maps_common import (
    DATA_CSV,
    DATA_SAFE_CSV,
    MAPS_URL,
    MAX_ROWS,
    SAFE_MODE,
    Business,
    accept_cookies_if_present,
    launch_browser,
    load_businesses_csv,
    log,
    log_config,
    maps_goto_url,
    merge_business_lists,
    save_businesses_csv,
    save_safe_csv,
)
from pipeline_core import MERGE_SCRAPE, maps_place_key

DEFAULT_QUERIES = (
    "coiffeur Montauban",
    "restaurant Montauban",
    "plombier Montauban",
    "avocat Montauban",
    "agence immobilière Montauban",
    "salle de sport Montauban",
)

EXTRACT_SCRIPT = """
(limit) => {
  const feed = document.querySelector('div[role="feed"]');
  if (!feed) return [];

  const seen = new Set();
  const results = [];

  for (const link of feed.querySelectorAll('a[href*="/maps/place/"]')) {
    let href = link.href || link.getAttribute("href") || "";
    if (!href.includes("/maps/place/")) continue;
    if (href.startsWith("/")) href = "https://www.google.com" + href;
    href = href.trim();

    const dedupeKey = href.split("/place/")[1]?.split("/")[0]?.toLowerCase() || href;
    if (seen.has(dedupeKey)) continue;

    const card =
      link.closest('div[role="article"]') ||
      link.closest("[jsaction]") ||
      link.parentElement;

    let name = (link.getAttribute("aria-label") || "").trim();
    if (!name && card) {
      const title = card.querySelector(
        '.fontHeadlineSmall, [class*="fontHeadlineSmall"], [class*="qBF1Pd"]'
      );
      name = (title?.textContent || link.textContent || "").trim();
    }
    name = name.split("·")[0].trim();
    if (!name) continue;

    let address = "";
    let category = "";
    if (card) {
      const lines = (card.innerText || "")
        .split("\\n")
        .map((l) => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        if (line === name) continue;
        if (/^\\d[,\\.]\\d/.test(line)) continue;
        if (/avis|ouvert|fermé|ferme|€|horaires/i.test(line)) continue;
        if (line.includes("·")) {
          category = line.split("·")[0].trim();
          const parts = line.split("·").map((p) => p.trim()).filter(Boolean);
          address = parts[parts.length - 1] || line;
          break;
        }
        if (line.length >= 6 && !address) {
          address = line;
        }
      }
    }

    seen.add(dedupeKey);
    results.push({ name, maps_link: href, address, category });
    if (results.length >= limit) break;
  }

  return results;
}
"""


def parse_search_queries() -> list[str]:
    multi = os.environ.get("SEARCH_QUERIES", "").strip()
    single = os.environ.get("SEARCH_QUERY", "").strip()
    if multi:
        parts = re.split(r"[|;]", multi)
        return [p.strip() for p in parts if p.strip()]
    if single:
        return [single]
    return list(DEFAULT_QUERIES)


def target_count() -> int:
    if os.environ.get("TARGET_COUNT"):
        return min(MAX_ROWS, int(os.environ["TARGET_COUNT"]))
    return MAX_ROWS


def build_search_url(query: str) -> str:
    return f"{MAPS_URL}/search/{quote_plus(query)}"


def run_search(page: Page, query: str, attempt: int = 1) -> None:
    search_url = build_search_url(query)
    log("SEARCH", f'"{query}" (tentative {attempt})')
    page.goto(search_url, wait_until="domcontentloaded", timeout=25_000)
    page.wait_for_timeout(1200)
    accept_cookies_if_present(page)

    if "search" not in page.url and attempt < 2:
        run_search(page, query, attempt=attempt + 1)
        return

    try:
        page.wait_for_selector('div[role="feed"]', timeout=20_000)
    except PlaywrightTimeout:
        page.wait_for_selector('a[href*="/maps/place/"]', timeout=12_000)
    page.wait_for_timeout(800)


def scroll_results_feed(page: Page, target: int) -> None:
    if SAFE_MODE:
        log("SCROLL", "SAFE_MODE — pas de défilement")
        return

    max_scrolls = min(90, max(25, target // 2))
    log("SCROLL", f"objectif ~{target} | max {max_scrolls} scrolls")
    feed = page.locator('div[role="feed"]').first
    if feed.count() == 0:
        return

    try:
        feed.wait_for(state="attached", timeout=12_000)
    except PlaywrightTimeout:
        return

    previous_count = 0
    stale_rounds = 0

    for i in range(max_scrolls):
        count = page.evaluate(
            """() => {
              const feed = document.querySelector('div[role="feed"]');
              if (!feed) return 0;
              return new Set(
                [...feed.querySelectorAll('a[href*="/maps/place/"]')]
                  .map(a => (a.href || '').split('/place/')[1]?.split('/')[0])
              ).size;
            }"""
        )

        if count >= target:
            log("SCROLL", f"atteint {count} fiches uniques")
            break

        if count == previous_count:
            stale_rounds += 1
            if stale_rounds >= 4:
                log("SCROLL", f"stagnation à {count}")
                break
        else:
            stale_rounds = 0

        previous_count = count
        feed.evaluate("el => { el.scrollTop = el.scrollHeight; }")
        page.wait_for_timeout(1400 if i < 15 else 1800)

    page.wait_for_timeout(400)


def raw_to_business(item: dict, query_hint: str) -> Business | None:
    name = (item.get("name") or "").strip()
    maps_link = maps_goto_url(item.get("maps_link") or "")
    address = (item.get("address") or "").strip()
    category = (item.get("category") or "").strip()
    if not category and address:
        category = extract_category_from_maps_line(address)

    if not name or not maps_link:
        return None

    btype = classify_business_type(
        category=category,
        name=name,
        address=address,
        default_query_hint=query_hint,
    )
    return Business(
        name=name,
        maps_link=maps_link,
        address=address,
        business_type=btype,
    )


def extract_businesses(page: Page, limit: int, query_hint: str) -> list[Business]:
    raw_items = page.evaluate(EXTRACT_SCRIPT, limit)
    businesses: list[Business] = []
    for item in raw_items or []:
        b = raw_to_business(item, query_hint)
        if b:
            businesses.append(b)
    return businesses[:limit]


def dedupe_businesses(items: list[Business]) -> list[Business]:
    seen: set[str] = set()
    out: list[Business] = []
    for b in items:
        key = maps_place_key(b.maps_link) or b.name.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(b)
    return out


def scrape_query(page: Page, query: str, per_query: int) -> list[Business]:
    try:
        run_search(page, query)
        scroll_results_feed(page, per_query)
        return extract_businesses(page, per_query, query)
    except PlaywrightTimeout as err:
        log("TIMEOUT", f"{query} — {err}")
        return extract_businesses(page, per_query, query)
    except Exception as err:
        log("ERROR", f"{query} — {err}")
        return []


def main() -> int:
    log_config("scrape_maps")
    queries = parse_search_queries()
    total_target = target_count()
    per_query = max(15, (total_target + len(queries) - 1) // len(queries))

    log("CONFIG", f"{len(queries)} requête(s) | objectif {total_target} | ~{per_query}/requête")

    all_businesses: list[Business] = []

    with sync_playwright() as playwright:
        browser, _context, page = launch_browser(playwright)
        try:
            for qi, query in enumerate(queries, start=1):
                if len(all_businesses) >= total_target:
                    break
                log("QUERY", f"{qi}/{len(queries)}")
                batch = scrape_query(page, query, per_query)
                all_businesses.extend(batch)
                all_businesses = dedupe_businesses(all_businesses)
                log("PROGRESS", f"{len(all_businesses)} uniques après « {query[:40]} »")
        finally:
            browser.close()

    scraped = dedupe_businesses(all_businesses)

    existing: list[Business] = []
    if MERGE_SCRAPE and DATA_CSV.is_file():
        try:
            existing = load_businesses_csv(DATA_CSV, limit=999_999)
            log("MERGE", f"{len(existing)} fiche(s) déjà dans {DATA_CSV.name}")
        except FileNotFoundError:
            pass

    businesses, new_count = merge_business_lists(existing, scraped)
    if len(businesses) > MAX_ROWS:
        log("LIMIT", f"{len(businesses)} → tronqué à MAX_ROWS={MAX_ROWS}")
        businesses = businesses[:MAX_ROWS]

    if SAFE_MODE:
        save_safe_csv(businesses, DATA_SAFE_CSV)
    save_businesses_csv(businesses, DATA_CSV)

    types = {}
    for b in businesses:
        types[b.business_type] = types.get(b.business_type, 0) + 1
    log("STATS", ", ".join(f"{k}={v}" for k, v in sorted(types.items(), key=lambda x: -x[1])))
    log("MERGE", f"+{new_count} nouvelle(s) fiche(s) | total {len(businesses)}")
    log("DONE", f"{len(businesses)} → {DATA_CSV.name}")
    log("NEXT", "DEBUG=0 python enrich_maps.py")
    return 0 if businesses else 1


if __name__ == "__main__":
    raise SystemExit(main())
