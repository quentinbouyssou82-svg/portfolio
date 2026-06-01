#!/usr/bin/env python3
"""
Étape 2 : enrichit data.csv (site + téléphone).

Relance sans doublon :
  - Ne re-traite que les fiches pas encore enrichies (sans site ni tél)
  - FORCE_REFRESH=1 pour tout refaire

TURBO_MODE=1 DEBUG=0 python enrich_maps.py
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass

from playwright.async_api import Page, TimeoutError as PlaywrightTimeout
from playwright.async_api import async_playwright

from business_types import classify_business_type
from maps_common import (
    DATA_CSV,
    DATA_ENRICHED_CSV,
    ENRICHED_CSV_FIELDS,
    EnrichedBusiness,
    accept_cookies_if_present_async,
    enriched_row_from_business,
    extract_place_meta_async,
    load_businesses_csv,
    load_enriched_index,
    maps_goto_url,
    normalize_maps_url,
    save_enriched_csv,
)
from pipeline_core import (
    ENRICH_MAX_WAIT_MS,
    ENRICH_PAGE_BUDGET_S,
    FAST_MODE,
    FORCE_REFRESH,
    PLAYWRIGHT_CONCURRENCY,
    SAFE_MODE,
    TURBO_MODE,
    CacheEntry,
    DomainCache,
    PerfTracker,
    apply_row_limit,
    configure_playwright_page,
    is_enriched_complete,
    launch_fast_browser_async,
    log,
    log_config,
    maps_place_key,
)


@dataclass
class EnrichJob:
    business: object
    index: int


def _result_from_cache(b, goto_url: str, cached: CacheEntry) -> EnrichedBusiness:
    return EnrichedBusiness(
        name=b.name,
        maps_link=normalize_maps_url(goto_url),
        address=b.address,
        business_type=(b.business_type or "autre").strip() or "autre",
        website=cached.website,
        phone=cached.phone,
    )


def needs_enrich(b, enriched_index: dict[str, dict[str, str]]) -> bool:
    if FORCE_REFRESH:
        return True
    key = maps_place_key(maps_goto_url(b.maps_link))
    if not key:
        return True
    prev = enriched_index.get(key)
    if not prev:
        return True
    return not is_enriched_complete(prev)


def build_output_rows(
    businesses: list, enriched_index: dict[str, dict[str, str]]
) -> list[EnrichedBusiness]:
    rows: list[EnrichedBusiness] = []
    for b in businesses:
        key = maps_place_key(maps_goto_url(b.maps_link))
        prev = enriched_index.get(key, {}) if key else {}
        rows.append(
            EnrichedBusiness(
                name=b.name,
                maps_link=normalize_maps_url(b.maps_link),
                address=b.address or prev.get("address", ""),
                business_type=b.business_type or prev.get("business_type", "autre"),
                website=prev.get("website", ""),
                phone=prev.get("phone", ""),
            )
        )
    return rows


async def enrich_on_page(page: Page, job: EnrichJob, cache: DomainCache) -> EnrichedBusiness:
    b = job.business
    goto_url = maps_goto_url(b.maps_link)
    key = maps_place_key(goto_url)
    btype = (b.business_type or "").strip() or "autre"

    cached = cache.get(key)
    if cached and (cached.website or cached.phone) and not FORCE_REFRESH:
        return _result_from_cache(b, goto_url, cached)

    website, phone, category = "", "", ""
    nav_ms = ENRICH_MAX_WAIT_MS + 3000
    try:
        await page.goto(goto_url, wait_until="domcontentloaded", timeout=nav_ms)
        if ENRICH_MAX_WAIT_MS:
            await page.wait_for_timeout(ENRICH_MAX_WAIT_MS)
        await accept_cookies_if_present_async(page)
        website, phone, category = await extract_place_meta_async(page, fast=True)
    except PlaywrightTimeout:
        pass
    except Exception as err:
        if not TURBO_MODE:
            log("ERROR", f"{b.name[:30]} {err}")

    if category and btype in ("", "autre"):
        btype = classify_business_type(category=category, name=b.name, address=b.address)

    if website or phone:
        cache.set(key, CacheEntry(website=website, phone=phone))

    return EnrichedBusiness(
        name=b.name,
        maps_link=normalize_maps_url(goto_url),
        address=b.address,
        business_type=btype,
        website=website,
        phone=phone,
    )


async def enrich_with_budget(page: Page, job: EnrichJob, cache: DomainCache) -> EnrichedBusiness:
    try:
        return await asyncio.wait_for(
            enrich_on_page(page, job, cache),
            timeout=ENRICH_PAGE_BUDGET_S,
        )
    except asyncio.TimeoutError:
        b = job.business
        goto_url = maps_goto_url(b.maps_link)
        log("SKIP", f"budget {ENRICH_PAGE_BUDGET_S}s — {b.name[:28]}")
        return EnrichedBusiness(
            name=b.name,
            maps_link=normalize_maps_url(goto_url),
            address=b.address,
            business_type=b.business_type or "autre",
        )


async def page_worker(
    page: Page,
    queue: asyncio.Queue,
    cache: DomainCache,
    enriched_index: dict[str, dict[str, str]],
    index_lock: asyncio.Lock,
    perf: PerfTracker,
    worker_id: int = 0,
) -> None:
    if worker_id:
        await asyncio.sleep(worker_id * 0.35)
    while True:
        job = await queue.get()
        if job is None:
            queue.task_done()
            break
        t0 = time.perf_counter()
        row = await enrich_with_budget(page, job, cache)
        ms = (time.perf_counter() - t0) * 1000
        key = maps_place_key(maps_goto_url(job.business.maps_link))
        if key:
            async with index_lock:
                enriched_index[key] = enriched_row_from_business(row)
        perf.tick(success=bool(row.website or row.phone), detail=row.name, site_ms=ms)
        queue.task_done()


async def prime_cookies(context) -> None:
    from maps_common import MAPS_URL

    page = await context.new_page()
    configure_playwright_page(page)
    try:
        await page.goto(MAPS_URL, wait_until="domcontentloaded", timeout=15_000)
        await accept_cookies_if_present_async(page)
        await page.wait_for_timeout(500)
    finally:
        await page.close()


async def run_async(businesses: list, pending: list[EnrichJob]) -> dict[str, dict[str, str]]:
    cache = DomainCache()
    enriched_index = load_enriched_index(DATA_ENRICHED_CSV)
    index_lock = asyncio.Lock()
    perf = PerfTracker(len(pending), label="nouvelles fiches")
    concurrency = PLAYWRIGHT_CONCURRENCY
    queue: asyncio.Queue = asyncio.Queue()

    for job in pending:
        queue.put_nowait(job)

    if not pending:
        log("SKIP", "aucune fiche à enrichir (tout est déjà fait)")
        return enriched_index

    async with async_playwright() as playwright:
        browser, context = await launch_fast_browser_async(playwright)
        await prime_cookies(context)

        pages: list[Page] = []
        for _ in range(concurrency):
            p = await context.new_page()
            configure_playwright_page(p)
            pages.append(p)

        workers = [
            asyncio.create_task(
                page_worker(p, queue, cache, enriched_index, index_lock, perf, wid)
            )
            for wid, p in enumerate(pages)
        ]
        for _ in pages:
            queue.put_nowait(None)

        await queue.join()
        await asyncio.gather(*workers)

        for p in pages:
            await p.close()
        await browser.close()

    cache.save()
    perf.summary()
    return enriched_index


def main() -> int:
    log_config("enrich_maps")
    try:
        businesses = apply_row_limit(load_businesses_csv(DATA_CSV))
    except FileNotFoundError as err:
        log("ABORT", str(err))
        return 1

    if not businesses:
        return 1

    enriched_index = load_enriched_index(DATA_ENRICHED_CSV)

    if SAFE_MODE:
        rows = build_output_rows(businesses, enriched_index)
        save_enriched_csv(rows, DATA_ENRICHED_CSV)
        log("DONE", "SAFE_MODE — pas de navigation")
        return 0

    pending_jobs = [
        EnrichJob(b, i)
        for i, b in enumerate(businesses, start=1)
        if needs_enrich(b, enriched_index)
    ]
    skipped = len(businesses) - len(pending_jobs)
    if skipped:
        log("DEDUP", f"{skipped} fiche(s) déjà enrichies — ignorées")

    mode = "TURBO" if TURBO_MODE else ("FAST" if FAST_MODE else "normal")
    log(
        "START",
        f"{len(pending_jobs)} à traiter | {PLAYWRIGHT_CONCURRENCY} pages | "
        f"budget {ENRICH_PAGE_BUDGET_S}s | mode {mode}",
    )

    enriched_index = asyncio.run(run_async(businesses, pending_jobs))
    output = build_output_rows(businesses, enriched_index)
    save_enriched_csv(output, DATA_ENRICHED_CSV)
    log("DONE", f"{len(output)} lignes → {DATA_ENRICHED_CSV.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
