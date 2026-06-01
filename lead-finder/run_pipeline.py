#!/usr/bin/env python3
"""
Pipeline complet : scrape → enrich → emails → score → Notion.

Usage rapide (~10 min objectif pour 200 leads avec emails) :
  TURBO_MODE=1 MAX_ROWS=200 DEBUG=0 python run_pipeline.py

TURBO active : budgets 7s/fiche Maps, 10 pages réutilisées, HTTP 3s × 32 workers.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run_step(label: str, cmd: list[str]) -> int:
    print(f"\n=== {label} ===", flush=True)
    env = {**os.environ, "PYTHONUNBUFFERED": "1"}
    result = subprocess.run(cmd, cwd=ROOT, env=env)
    if result.returncode != 0:
        print(f"[ABORT] {label} code {result.returncode}", flush=True)
    return result.returncode


def apply_turbo_env() -> None:
    if os.environ.get("TURBO_MODE", "").lower() not in ("1", "true", "yes"):
        return
    os.environ.setdefault("FAST_MODE", "1")
    os.environ.setdefault("PLAYWRIGHT_CONCURRENCY", "3")
    os.environ.setdefault("ENRICH_PAGE_BUDGET_S", "8")
    os.environ.setdefault("WORKERS", "32")
    os.environ.setdefault("HTTP_TIMEOUT_S", "3")
    os.environ.setdefault("HTTP_RETRIES", "0")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-notion", action="store_true")
    parser.add_argument("--skip-scrape", action="store_true")
    parser.add_argument("--turbo", action="store_true", help="Active TURBO_MODE")
    args = parser.parse_args()

    if args.turbo:
        os.environ["TURBO_MODE"] = "1"
    apply_turbo_env()

    py = sys.executable
    steps: list[tuple[str, list[str]]] = []

    if not args.skip_scrape:
        steps.append(("1/5 scrape_maps", [py, "scrape_maps.py"]))
    steps.extend(
        [
            ("2/5 enrich_maps", [py, "enrich_maps.py"]),
            ("3/5 find_emails", [py, "find_emails.py"]),
            ("4/5 lead_scorer", [py, "lead_scorer.py", "leads_input.csv", "leads_ranked.csv"]),
        ]
    )
    if not args.skip_notion:
        steps.append(("5/5 notion_sync", [py, "notion_sync.py"]))

    for label, cmd in steps:
        if run_step(label, cmd) != 0:
            return 1

    print("\n[DONE] Pipeline terminé.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
