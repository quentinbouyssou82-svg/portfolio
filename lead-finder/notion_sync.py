#!/usr/bin/env python3
"""
Synchronise leads_ranked.csv → base Notion « Lead Ranking IA ».

Upsert par email : mise à jour si existant, création sinon.

Variables d'environnement :
  NOTION_TOKEN                  — obligatoire
  NOTION_RANKING_DATABASE_ID    — ID base Notion (optionnel)
  NOTION_DATA_SOURCE_ID         — ID data source (recommandé, voir NOTION.md)
  NOTION_PARENT_PAGE_ID         — requis pour créer la base la 1ère fois

Usage :
    export NOTION_TOKEN="secret_..."
    export NOTION_PARENT_PAGE_ID="..."
    python notion_sync.py

    python notion_sync.py chemin/vers/leads_ranked.csv

Voir NOTION.md (section Lead Ranking IA).
"""

from __future__ import annotations

import csv
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

from notion_client import Client
from notion_client.errors import APIResponseError

from business_types import KNOWN_TYPES, notion_select_options

LEAD_FINDER_DIR = Path(__file__).resolve().parent
ENV_LOCAL = LEAD_FINDER_DIR / ".env.local"
DEFAULT_INPUT = LEAD_FINDER_DIR / "leads_ranked.csv"


def load_env_local() -> None:
    """Charge .env.local (NOTION_TOKEN, etc.) sans dépendance externe."""
    if not ENV_LOCAL.is_file():
        return
    for line in ENV_LOCAL.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
DATABASE_TITLE = "Lead Ranking IA"
REQUEST_DELAY_S = float(os.environ.get("NOTION_REQUEST_DELAY", "0.35"))
MAX_SCORE = 50.0  # score_final brut max (lead_scorer)

NIVEAU_OPTIONS = [
    {"name": "excellent", "color": "green"},
    {"name": "bon", "color": "blue"},
    {"name": "moyen", "color": "yellow"},
    {"name": "faible", "color": "gray"},
]

PRIORITE_OPTIONS = [
    {"name": "urgente", "color": "red"},
    {"name": "haute", "color": "orange"},
    {"name": "moyenne", "color": "yellow"},
    {"name": "basse", "color": "gray"},
]

# Schéma cible (API Notion v3 : une seule colonne « title », email en type email)
DATABASE_PROPERTIES: dict[str, Any] = {
    "Name": {"title": {}},
    "email": {"email": {}},
    "business_type": {"select": {"options": notion_select_options()}},
    "website": {"url": {}},
    "score_prospection": {"number": {"format": "number"}},
    "score_site": {"number": {"format": "number"}},
    "score_final": {"number": {"format": "number"}},
    "niveau_lead": {"select": {"options": NIVEAU_OPTIONS}},
    "priorité_contact": {"select": {"options": PRIORITE_OPTIONS}},
    "raisons_principales": {"rich_text": {}},
    "problèmes_detectés": {"rich_text": {}},
    "opportunités_de_revente": {"rich_text": {}},
    "last_updated": {"date": {}},
}
TITLE_PROPERTY = "Name"


def log(step: str, message: str = "") -> None:
    print(f"[{step}] {message}" if message else f"[{step}]", flush=True)


def get_database_id_env() -> str:
    return (
        os.environ.get("NOTION_RANKING_DATABASE_ID", "").strip()
        or os.environ.get("NOTION_DATABASE_ID", "").strip()
    )


def get_notion_client() -> Client:
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        raise EnvironmentError(
            "NOTION_TOKEN manquant — https://www.notion.so/my-integrations"
        )
    return Client(auth=token)


def with_retry(action: Callable[[], Any], label: str, retries: int = 4) -> Any:
    """Gère les rate limits Notion (429) avec backoff."""
    delay = 1.0
    for attempt in range(retries):
        try:
            return action()
        except APIResponseError as err:
            if err.code == "rate_limited" and attempt < retries - 1:
                log("RATE_LIMIT", f"{label} — pause {delay:.1f}s")
                time.sleep(delay)
                delay *= 2
                continue
            raise
    raise RuntimeError(f"Échec après {retries} tentatives : {label}")


def load_ranked_csv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {path}")

    rows: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            cleaned = {k: (row.get(k) or "").strip() for k in row}
            email = cleaned.get("email", "").lower()
            if not email or "@" not in email:
                continue
            rows.append(cleaned)

    rows.sort(
        key=lambda r: float(r.get("score_final") or 0),
        reverse=True,
    )
    log("LOAD", f"{len(rows)} lead(s) depuis {path.name}")
    return rows


def is_valid_url(value: str) -> bool:
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def rich_text(content: str) -> list[dict[str, Any]]:
    if not content:
        return []
    return [{"type": "text", "text": {"content": content[:2000]}}]


def parse_float(value: str, default: float = 0.0) -> float:
    try:
        return float((value or "").replace(",", "."))
    except ValueError:
        return default


def score_to_percent(score_final_raw: str) -> float:
    """Convertit le score 0–50 en pourcentage 0–100 pour Notion."""
    raw = parse_float(score_final_raw)
    return round((raw / MAX_SCORE) * 100, 1)


def normalize_select(value: str, allowed: set[str]) -> str | None:
    v = (value or "").strip().lower()
    return v if v in allowed else None


def build_properties(row: dict[str, str], title_column: str = TITLE_PROPERTY) -> dict[str, Any]:
    email = row.get("email", "").strip()
    name = row.get("name", "").strip() or email
    website = row.get("url", "").strip() or row.get("website", "").strip()

    props: dict[str, Any] = {
        title_column: {"title": rich_text(name)},
        "email": {"email": email},
        "score_prospection": {"number": parse_float(row.get("score_prospection", ""))},
        "score_site": {"number": parse_float(row.get("score_site", ""))},
        "score_final": {"number": score_to_percent(row.get("score_final", ""))},
        "last_updated": {
            "date": {"start": datetime.now(timezone.utc).isoformat()}
        },
    }

    if is_valid_url(website):
        props["website"] = {"url": website}

    niveau = normalize_select(
        row.get("niveau_lead", ""),
        {"excellent", "bon", "moyen", "faible"},
    )
    if niveau:
        props["niveau_lead"] = {"select": {"name": niveau}}

    priorite = normalize_select(
        row.get("priorité_contact", "") or row.get("priorite_contact", ""),
        {"urgente", "haute", "moyenne", "basse"},
    )
    if priorite:
        props["priorité_contact"] = {"select": {"name": priorite}}

    btype = (row.get("business_type") or "").strip().lower().replace(" ", "_")
    if btype not in KNOWN_TYPES:
        btype = "autre" if btype else ""
    if btype:
        props["business_type"] = {"select": {"name": btype}}

    for field in (
        "raisons_principales",
        "problèmes_detectés",
        "opportunités_de_revente",
    ):
        text = row.get(field, "")
        if text:
            props[field] = {"rich_text": rich_text(text)}

    return props


def extract_email_from_page(page: dict[str, Any]) -> str:
    props = page.get("properties", {})
    email_prop = props.get("email", {})
    if email_prop.get("type") == "email":
        return (email_prop.get("email") or "").strip().lower()
    return ""


def find_title_column(properties: dict[str, Any]) -> str:
    for key, meta in properties.items():
        if meta.get("type") == "title":
            return key
    return TITLE_PROPERTY


def resolve_data_source_id(client: Client) -> str:
    """Trouve le data source Notion v3 (obligatoire pour query/create)."""
    ds_id = os.environ.get("NOTION_DATA_SOURCE_ID", "").strip()
    if ds_id:
        log("DATA_SOURCE", f"utilisation {ds_id}")
        with_retry(
            lambda: client.data_sources.retrieve(data_source_id=ds_id),
            "retrieve_data_source",
        )
        return ds_id

    database_id = get_database_id_env()
    if database_id:
        db = with_retry(
            lambda: client.databases.retrieve(database_id=database_id),
            "retrieve_database",
        )
        sources = db.get("data_sources") or []
        if sources:
            ds_id = sources[0]["id"]
            log("DATA_SOURCE", f"depuis base → {ds_id}")
            log("HINT", f"export NOTION_DATA_SOURCE_ID={ds_id}")
            return ds_id

    log("SEARCH", f'base « {DATABASE_TITLE} »…')
    result = with_retry(
        lambda: client.search(
            query=DATABASE_TITLE,
            filter={"property": "object", "value": "data_source"},
            page_size=20,
        ),
        "search_data_source",
    )
    for item in result.get("results", []):
        title_parts = item.get("title") or []
        title = "".join(p.get("plain_text", "") for p in title_parts)
        if DATABASE_TITLE.lower() in title.lower():
            ds_id = item["id"]
            log("DATA_SOURCE", f"trouvé → {ds_id}")
            log("HINT", f"export NOTION_DATA_SOURCE_ID={ds_id}")
            return ds_id

    return create_database_and_data_source(client)


def create_database_and_data_source(client: Client) -> str:
    parent_id = os.environ.get("NOTION_PARENT_PAGE_ID", "").strip()
    if not parent_id:
        raise EnvironmentError(
            "NOTION_DATA_SOURCE_ID, NOTION_RANKING_DATABASE_ID ou NOTION_PARENT_PAGE_ID requis"
        )

    log("DATABASE", f'création « {DATABASE_TITLE} » (API v3)…')
    response = with_retry(
        lambda: client.databases.create(
            parent={"type": "page_id", "page_id": parent_id},
            title=[{"type": "text", "text": {"content": DATABASE_TITLE}}],
            initial_data_source={
                "properties": DATABASE_PROPERTIES,
            },
        ),
        "create_database",
    )
    database_id = response["id"]
    sources = response.get("data_sources") or []
    if not sources:
        raise RuntimeError("Base créée mais data_source introuvable")
    ds_id = sources[0]["id"]
    log("DATABASE", f"base={database_id} data_source={ds_id}")
    log("HINT", f"export NOTION_RANKING_DATABASE_ID={database_id}")
    log("HINT", f"export NOTION_DATA_SOURCE_ID={ds_id}")
    return ds_id


def ensure_data_source_schema(client: Client, data_source_id: str) -> str:
    """Ajoute les colonnes manquantes (sans créer un 2e title)."""
    current = with_retry(
        lambda: client.data_sources.retrieve(data_source_id=data_source_id),
        "retrieve_schema",
    )
    existing = current.get("properties") or {}
    title_column = find_title_column(existing)

    to_add = {
        key: spec
        for key, spec in DATABASE_PROPERTIES.items()
        if key not in existing and spec.get("title") is None
    }
    if to_add:
        log("SCHEMA", f"ajout colonnes : {', '.join(to_add.keys())}")
        with_retry(
            lambda: client.data_sources.update(
                data_source_id=data_source_id,
                properties=to_add,
            ),
            "update_schema",
        )
    else:
        log("SCHEMA", "colonnes déjà à jour")

    return title_column


def extract_website_from_page(page: dict[str, Any]) -> str:
    props = page.get("properties", {})
    web = props.get("website", {})
    if web.get("type") == "url":
        return (web.get("url") or "").strip()
    return ""


def fetch_existing_pages(client: Client, data_source_id: str) -> tuple[dict[str, str], dict[str, str]]:
    """Index email → page_id et domaine site → page_id (anti-doublon site)."""
    by_email: dict[str, str] = {}
    by_domain: dict[str, str] = {}
    cursor: str | None = None

    log("INDEX", "lecture des pages existantes…")
    while True:
        response = with_retry(
            lambda c=cursor: client.data_sources.query(
                data_source_id=data_source_id,
                start_cursor=c,
                page_size=100,
            ),
            "query_data_source",
        )
        for page in response.get("results", []):
            email = extract_email_from_page(page)
            page_id = page["id"]
            if email:
                by_email[email] = page_id
            site = extract_website_from_page(page)
            if site:
                from pipeline_core import domain_key

                dom = domain_key(site)
                if dom:
                    by_domain[dom] = page_id

        if not response.get("has_more"):
            break
        cursor = response.get("next_cursor")
        if REQUEST_DELAY_S > 0:
            time.sleep(REQUEST_DELAY_S)

    log("INDEX", f"{len(by_email)} email(s), {len(by_domain)} domaine(s) site en base")
    return by_email, by_domain


def sync_lead(
    client: Client,
    data_source_id: str,
    title_column: str,
    row: dict[str, str],
    existing_email: dict[str, str],
    existing_domain: dict[str, str],
) -> str:
    """Retourne 'created' | 'updated' | 'skipped'."""
    from pipeline_core import domain_key

    email = row.get("email", "").strip().lower()
    website = row.get("url", "").strip() or row.get("website", "").strip()
    dom = domain_key(website)

    if dom and dom in existing_domain and existing_email.get(email) != existing_domain[dom]:
        return "skipped"

    props = build_properties(row, title_column=title_column)
    page_id = existing_email.get(email) or (existing_domain.get(dom) if dom else None)

    if page_id:
        with_retry(
            lambda: client.pages.update(page_id=page_id, properties=props),
            f"update_{email}",
        )
        existing_email[email] = page_id
        if dom:
            existing_domain[dom] = page_id
        return "updated"

    response = with_retry(
        lambda: client.pages.create(
            parent={"data_source_id": data_source_id},
            properties=props,
        ),
        f"create_{email}",
    )
    page_id = response["id"]
    existing_email[email] = page_id
    if dom:
        existing_domain[dom] = page_id
    return "created"


def run_sync(input_path: Path) -> int:
    log("START", "notion_sync — Lead Ranking IA")
    rows = load_ranked_csv(input_path)
    if not rows:
        log("ABORT", "aucun lead avec email valide")
        return 1

    client = get_notion_client()
    data_source_id = resolve_data_source_id(client)
    title_column = ensure_data_source_schema(client, data_source_id)
    existing_email, existing_domain = fetch_existing_pages(client, data_source_id)

    created = 0
    updated = 0
    skipped = 0
    failed = 0
    total = len(rows)

    log("SYNC", f"{total} lead(s) → colonne titre « {title_column} »")

    for index, row in enumerate(rows, start=1):
        email = row.get("email", "?")
        name = row.get("name", "")[:40]
        try:
            action = sync_lead(
                client,
                data_source_id,
                title_column,
                row,
                existing_email,
                existing_domain,
            )
            if action == "created":
                created += 1
            elif action == "updated":
                updated += 1
            else:
                skipped += 1
                log("SKIP", f"{index}/{total} doublon site — {name}")
                continue
            pct = score_to_percent(row.get("score_final", ""))
            log("OK", f"{index}/{total} {action} — {name} ({pct}%)")
        except APIResponseError as err:
            failed += 1
            log("API_ERROR", f"{index}/{total} {email} : {err}")
        except Exception as err:
            failed += 1
            log("ERROR", f"{index}/{total} {email} : {err}")

        if index < total and REQUEST_DELAY_S > 0:
            time.sleep(REQUEST_DELAY_S)

    log("DONE", f"créés={created} mis à jour={updated} ignorés={skipped} échecs={failed}")
    log(
        "VIEW",
        "Notion : trier par score_final ↓ — filtrer par colonne business_type",
    )
    return 0 if failed == 0 else 1


def main(argv: list[str] | None = None) -> int:
    load_env_local()
    args = argv if argv is not None else sys.argv[1:]
    input_path = Path(args[0]) if args else DEFAULT_INPUT
    try:
        return run_sync(input_path)
    except (EnvironmentError, FileNotFoundError) as err:
        log("ABORT", str(err))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
