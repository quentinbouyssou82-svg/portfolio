"""Utilitaires Maps / CSV — config & perf via pipeline_core."""

from __future__ import annotations

import csv
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

from playwright.async_api import Page as AsyncPage
from playwright.async_api import TimeoutError as AsyncPlaywrightTimeout
from playwright.sync_api import Browser, BrowserContext, Page, Playwright
from playwright.sync_api import TimeoutError as PlaywrightTimeout

from pipeline_core import (
    ACTION_TIMEOUT_MS,
    DEBUG_MODE,
    FAST_MODE,
    HEADLESS,
    LEAD_FINDER_DIR,
    MAX_ROWS,
    NAVIGATION_TIMEOUT_MS,
    PAGE_DELAY_MS,
    SAFE_MODE,
    apply_row_limit,
    configure_playwright_page,
    is_enriched_complete,
    launch_fast_browser,
    load_csv_rows,
    log,
    log_config,
    maps_goto_url,
    maps_place_key,
    normalize_maps_url,
    write_csv_rows,
)

DATA_CSV = LEAD_FINDER_DIR / "data.csv"
DATA_SAFE_CSV = LEAD_FINDER_DIR / "data_safe.csv"
DATA_ENRICHED_CSV = LEAD_FINDER_DIR / "data_enriched.csv"
MAPS_URL = "https://www.google.com/maps"
COOKIE_BTN_TIMEOUT_MS = 1500


BUSINESS_CSV_FIELDS = ["name", "maps_link", "address", "business_type"]
ENRICHED_CSV_FIELDS = ["name", "maps_link", "address", "business_type", "website", "phone"]


@dataclass
class Business:
    name: str
    maps_link: str
    address: str = ""
    business_type: str = ""


@dataclass
class EnrichedBusiness(Business):
    website: str = ""
    phone: str = ""


EXTRACT_PLACE_META_SCRIPT = """
() => {
  let phone = "";
  let website = "";
  let category = "";

  const tel = document.querySelector('a[href^="tel:"]');
  if (tel) {
    phone = (tel.getAttribute("href") || "").replace(/^tel:/i, "").trim();
  }

  if (!phone) {
    const phoneEl = document.querySelector(
      '[data-item-id^="phone:tel:"], [data-item-id^="phone:"], button[data-item-id*="phone"]'
    );
    if (phoneEl) {
      const id = phoneEl.getAttribute("data-item-id") || "";
      phone = id.replace(/^phone:tel:/i, "").replace(/^phone:/i, "").trim();
      if (!phone) phone = (phoneEl.textContent || "").trim();
    }
  }

  const siteLink = document.querySelector('a[data-item-id="authority"]');
  if (siteLink) {
    website = siteLink.href || "";
  }

  if (!website) {
    for (const a of document.querySelectorAll('a[href^="http"]')) {
      const href = a.href || "";
      if (
        href.includes("google.com") ||
        href.includes("g.page") ||
        href.includes("goo.gl/maps")
      ) {
        continue;
      }
      const label = (
        (a.getAttribute("aria-label") || "") +
        " " +
        (a.textContent || "")
      ).toLowerCase();
      if (
        label.includes("site") ||
        label.includes("website") ||
        label.includes("web")
      ) {
        website = href;
        break;
      }
    }
  }

  const catBtn = document.querySelector('button[jsaction*="category"], button.DkEaL');
  if (catBtn) {
    category = (catBtn.textContent || catBtn.getAttribute("aria-label") || "").trim();
  }
  if (!category) {
    const main = document.querySelector('[role="main"]') || document.body;
    const h1 = document.querySelector("h1");
    if (main && h1) {
      const lines = (main.innerText || "").split("\\n").map(l => l.trim()).filter(Boolean);
      const idx = lines.findIndex(l => l === (h1.textContent || "").trim());
      if (idx >= 0 && lines[idx + 1]) {
        category = lines[idx + 1].split("·")[0].trim();
      }
    }
  }

  phone = phone.replace(/\\s+/g, " ").trim();
  website = website.split("?")[0].trim();
  category = category.split("·")[0].trim();

  return { phone, website, category };
}
"""

EXTRACT_PLACE_CONTACTS_SCRIPT = EXTRACT_PLACE_META_SCRIPT


def accept_cookies_if_present(page: Page) -> None:
    selectors = [
        'button:has-text("Tout accepter")',
        'button:has-text("Accept all")',
        'button:has-text("J\'accepte tout")',
    ]
    for selector in selectors:
        try:
            button = page.locator(selector).first
            if button.is_visible(timeout=COOKIE_BTN_TIMEOUT_MS):
                button.click(timeout=ACTION_TIMEOUT_MS)
                page.wait_for_timeout(500)
                return
        except PlaywrightTimeout:
            continue
        except Exception:
            continue


def launch_browser(playwright: Playwright) -> tuple[Browser, BrowserContext, Page]:
    browser, context = launch_fast_browser(playwright)
    page = context.new_page()
    configure_playwright_page(page)
    return browser, context, page


def wait_for_place_panel(page: Page, fast: bool = False) -> None:
    # Maps headless : h1 souvent présent mais "hidden" — attached suffit
    try:
        page.wait_for_selector("h1", state="attached", timeout=ACTION_TIMEOUT_MS)
    except PlaywrightTimeout:
        page.wait_for_selector('div[role="main"]', state="attached", timeout=ACTION_TIMEOUT_MS)
    if not fast and PAGE_DELAY_MS:
        page.wait_for_timeout(min(PAGE_DELAY_MS, 500))


async def wait_for_place_panel_async(page: AsyncPage, fast: bool = False) -> None:
    try:
        await page.wait_for_selector("h1", state="attached", timeout=ACTION_TIMEOUT_MS)
    except AsyncPlaywrightTimeout:
        await page.wait_for_selector(
            'div[role="main"]', state="attached", timeout=ACTION_TIMEOUT_MS
        )
    if not fast and PAGE_DELAY_MS:
        await page.wait_for_timeout(min(PAGE_DELAY_MS, 500))


def extract_place_meta(page: Page) -> tuple[str, str, str]:
    data = page.evaluate(EXTRACT_PLACE_META_SCRIPT)
    if not data:
        return "", "", ""
    return (
        (data.get("website") or "").strip(),
        (data.get("phone") or "").strip(),
        (data.get("category") or "").strip(),
    )


def extract_place_contacts(page: Page) -> tuple[str, str]:
    website, phone, _cat = extract_place_meta(page)
    return website, phone


async def extract_place_meta_async(page: AsyncPage, fast: bool = False) -> tuple[str, str, str]:
    await wait_for_place_panel_async(page, fast=fast)
    data = await page.evaluate(EXTRACT_PLACE_META_SCRIPT)
    if not data:
        return "", "", ""
    return (
        (data.get("website") or "").strip(),
        (data.get("phone") or "").strip(),
        (data.get("category") or "").strip(),
    )


async def extract_place_contacts_async(page: AsyncPage, fast: bool = False) -> tuple[str, str]:
    website, phone, _ = await extract_place_meta_async(page, fast=fast)
    return website, phone


async def accept_cookies_if_present_async(page: AsyncPage) -> None:
    selectors = [
        'button:has-text("Tout accepter")',
        'button:has-text("Accept all")',
        'button:has-text("J\'accepte tout")',
        '[aria-label*="Tout accepter"]',
    ]
    for selector in selectors:
        try:
            button = page.locator(selector).first
            if await button.is_visible(timeout=1200):
                await button.click(timeout=ACTION_TIMEOUT_MS)
                return
        except AsyncPlaywrightTimeout:
            continue
        except Exception:
            continue


def load_businesses_csv(path: Path, limit: int | None = None) -> list[Business]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {path}")

    cap = limit if limit is not None else MAX_ROWS
    rows: list[Business] = []
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            if len(rows) >= cap:
                break
            name = (row.get("name") or "").strip()
            maps_link = maps_goto_url(row.get("maps_link") or "")
            address = (row.get("address") or "").strip()
            business_type = (row.get("business_type") or "").strip()
            if name and maps_link:
                rows.append(
                    Business(
                        name=name,
                        maps_link=maps_link,
                        address=address,
                        business_type=business_type,
                    )
                )
    return rows


def save_businesses_csv(businesses: Iterable[Business], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=BUSINESS_CSV_FIELDS,
            extrasaction="ignore",
        )
        writer.writeheader()
        for business in businesses:
            writer.writerow(asdict(business))


def save_safe_csv(businesses: Iterable[Business], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=["name", "maps_link"],
            extrasaction="ignore",
        )
        writer.writeheader()
        for business in businesses:
            writer.writerow(
                {"name": business.name, "maps_link": business.maps_link}
            )


def merge_business_lists(existing: list[Business], new_items: list[Business]) -> tuple[list[Business], int]:
    """Fusionne par fiche Maps (maps_place_key), conserve l'existant."""
    index: dict[str, Business] = {}
    for b in existing:
        key = maps_place_key(b.maps_link) or b.name.lower()
        if key:
            index[key] = b
    added = 0
    for b in new_items:
        key = maps_place_key(b.maps_link) or b.name.lower()
        if not key or key in index:
            continue
        index[key] = b
        added += 1
    # ordre : anciens puis nouveaux
    seen: set[str] = set()
    merged: list[Business] = []
    for b in existing + new_items:
        key = maps_place_key(b.maps_link) or b.name.lower()
        if key in seen:
            continue
        seen.add(key)
        merged.append(index.get(key, b))
    return merged, added


def load_enriched_index(path: Path) -> dict[str, dict[str, str]]:
    from pipeline_core import index_rows_by_place

    return index_rows_by_place(load_csv_rows(path))


def enriched_row_from_business(b: Business, extra: dict[str, str] | None = None) -> dict[str, str]:
    row = {
        "name": b.name,
        "maps_link": normalize_maps_url(b.maps_link),
        "address": b.address,
        "business_type": b.business_type or "autre",
        "website": "",
        "phone": "",
    }
    if extra:
        row.update(extra)
    if isinstance(b, EnrichedBusiness):
        row["website"] = b.website
        row["phone"] = b.phone
    return row


def save_enriched_csv(businesses: Iterable[EnrichedBusiness], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=ENRICHED_CSV_FIELDS,
            extrasaction="ignore",
        )
        writer.writeheader()
        for business in businesses:
            writer.writerow(asdict(business))
