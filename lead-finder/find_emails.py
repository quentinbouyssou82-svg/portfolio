#!/usr/bin/env python3
"""
Étape 3 : emails depuis sites web — parallèle, cache, FAST_MODE.

FAST_MODE=1 WORKERS=12 DEBUG=0 python find_emails.py

- Pas de Maps (lancez enrich_maps.py avant pour les sites)
- HTTP parallèle : homepage, /contact, /mentions — stop au 1er email
- Cache domaine + CSV streaming + logs PERF
"""

from __future__ import annotations

import csv
import time
from dataclasses import dataclass
from pathlib import Path

from email_utils import extract_emails_from_html
from maps_common import DATA_CSV, DATA_ENRICHED_CSV
from pipeline_core import (
    CACHE_DIR,
    FAST_MODE,
    FORCE_REFRESH,
    LEAD_FINDER_DIR,
    MERGE_OUTPUTS,
    TURBO_MODE,
    CacheEntry,
    DomainCache,
    PerfTracker,
    WORKERS,
    apply_row_limit,
    domain_key,
    fetch_contact_pages,
    load_csv_rows,
    log,
    log_config,
    merge_leads_by_website,
    normalize_website,
    run_parallel,
    should_skip_email_domain,
    write_csv_rows,
)

OUTPUT_CSV = LEAD_FINDER_DIR / "leads_input.csv"
OUTPUT_FIELDS = ["name", "website", "email", "business_type"]


@dataclass
class LeadJob:
    name: str
    maps_link: str
    website: str = ""
    business_type: str = ""


@dataclass
class LeadResult:
    name: str
    website: str
    email: str
    business_type: str = ""
    source: str = ""


def load_jobs() -> list[LeadJob]:
    source = DATA_ENRICHED_CSV if DATA_ENRICHED_CSV.is_file() else DATA_CSV
    if not source.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {source}")

    if source == DATA_ENRICHED_CSV:
        log("LOAD", "data_enriched.csv (sites pré-enrichis)")

    jobs: list[LeadJob] = []
    with source.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            name = (row.get("name") or "").strip()
            maps_link = (row.get("maps_link") or "").strip()
            website = normalize_website(row.get("website") or "")
            business_type = (row.get("business_type") or "").strip()
            if name and (maps_link or website):
                jobs.append(
                    LeadJob(
                        name=name,
                        maps_link=maps_link,
                        website=website,
                        business_type=business_type,
                    )
                )

    log("LOAD", f"{len(jobs)} commerce(s) depuis {source.name}")
    return jobs


def find_email_for_job(job: LeadJob, cache: DomainCache) -> LeadResult | None:
    website = job.website
    if not website:
        return None

    if should_skip_email_domain(website):
        return None

    key = domain_key(website)
    if key:
        cached = cache.get(key)
        if cached and cached.email:
            return LeadResult(
                name=job.name,
                website=website,
                email=cached.email,
                business_type=job.business_type,
                source="cache",
            )

    _html, url_used, _ms, email = fetch_contact_pages(
        website,
        stop_on_email=True,
        email_extractor=extract_emails_from_html,
    )

    if not email:
        return None

    if key:
        entry = cache.get(key) or CacheEntry()
        entry.email = email
        entry.website = website
        cache.set(key, entry)

    path = url_used.replace(website.rstrip("/"), "") or "/"
    return LeadResult(
        name=job.name,
        website=website,
        email=email,
        business_type=job.business_type,
        source=f"site:{path}",
    )


def load_existing_email_domains() -> set[str]:
    if not OUTPUT_CSV.is_file():
        return set()
    domains: set[str] = set()
    for row in load_csv_rows(OUTPUT_CSV):
        key = domain_key(row.get("website", ""))
        if key and row.get("email"):
            domains.add(key)
    return domains


def needs_email_scan(job: LeadJob, done_domains: set[str]) -> bool:
    if FORCE_REFRESH:
        return True
    key = domain_key(job.website)
    return not key or key not in done_domains


def main() -> int:
    log_config("find_emails")
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    try:
        jobs = apply_row_limit(load_jobs())
    except FileNotFoundError as err:
        log("ABORT", str(err))
        log("HINT", "python scrape_maps.py puis enrich_maps.py")
        return 1

    if not jobs:
        return 1

    with_website = [j for j in jobs if j.website]
    if not with_website:
        log(
            "ABORT",
            "aucun site web — lancez enrich_maps.py (FAST_MODE=0 HEADLESS=false si besoin)",
        )
        return 1

    if FAST_MODE and len(with_website) < len(jobs):
        log("SKIP", f"{len(jobs) - len(with_website)} sans site (FAST_MODE, pas de Maps)")

    done_domains = load_existing_email_domains()
    if done_domains and not FORCE_REFRESH:
        log("DEDUP", f"{len(done_domains)} domaine(s) déjà avec email dans {OUTPUT_CSV.name}")

    pending = [j for j in with_website if needs_email_scan(j, done_domains)]
    skipped_done = len(with_website) - len(pending)
    if skipped_done:
        log("SKIP", f"{skipped_done} site(s) déjà traités (email connu)")

    if TURBO_MODE:
        before = len(pending)
        pending = [j for j in pending if not should_skip_email_domain(j.website)]
        if before - len(pending):
            log("SKIP", f"{before - len(pending)} plateformes (Planity/Booksy/…)")

    if not pending:
        log("DONE", "rien de nouveau à scanner pour les emails")
        return 0

    cache = DomainCache()
    perf = PerfTracker(len(pending), label="sites")
    new_rows: list[dict[str, str]] = []

    def worker(job: LeadJob) -> LeadResult | None:
        t0 = time.perf_counter()
        result = find_email_for_job(job, cache)
        ms = (time.perf_counter() - t0) * 1000
        if result:
            new_rows.append(
                {
                    "name": result.name,
                    "website": result.website,
                    "email": result.email,
                    "business_type": result.business_type,
                }
            )
            perf.tick(success=True, detail=result.name, site_ms=ms)
            return result
        perf.tick(success=False, detail=job.name, site_ms=ms)
        return None

    log("START", f"{len(pending)} nouveau(x) site(s) | workers={WORKERS}")
    run_parallel(pending, worker, workers=WORKERS, perf=None)

    cache.save()
    perf.summary()

    existing = load_csv_rows(OUTPUT_CSV) if MERGE_OUTPUTS else []
    merged, added = merge_leads_by_website(existing, new_rows)
    write_csv_rows(OUTPUT_CSV, OUTPUT_FIELDS, merged)

    found = len(new_rows)
    log("MERGE", f"+{added} email(s) | total {len(merged)} lignes")
    log("DONE", f"{found} trouvé(s) cette session → {OUTPUT_CSV.name}")

    if found:
        log("NEXT", "python lead_scorer.py leads_input.csv leads_ranked.csv")
    else:
        log("HINT", "HEADLESS=false python enrich_maps.py pour récupérer les sites")

    return 0 if found else 1


if __name__ == "__main__":
    raise SystemExit(main())
