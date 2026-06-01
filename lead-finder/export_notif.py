#!/usr/bin/env python3
"""
Étape 4 : exporte data_scored.csv vers une base Notion « Leads IA ».

Variables d'environnement :
  NOTION_TOKEN            — token d'intégration (obligatoire)
  NOTION_DATABASE_ID      — ID base existante (optionnel)
  NOTION_PARENT_PAGE_ID   — page parente si création de base (requis sans DATABASE_ID)

Usage :
    export NOTION_TOKEN="secret_..."
    export NOTION_PARENT_PAGE_ID="..."
    python export_notif.py

Voir NOTION.md pour la configuration complète.
"""

from __future__ import annotations

import csv
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from notion_client import Client
from notion_client.errors import APIResponseError

LEAD_FINDER_DIR = Path(__file__).resolve().parent
ENV_LOCAL = LEAD_FINDER_DIR / ".env.local"
INPUT_CSV = LEAD_FINDER_DIR / "data_scored.csv"


def load_env_local() -> None:
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
DATABASE_TITLE = "Leads IA"
REQUEST_DELAY_S = float(os.environ.get("NOTION_REQUEST_DELAY", "0.35"))

PRIORITY_OPTIONS = [
    {"name": "HIGH", "color": "red"},
    {"name": "MEDIUM", "color": "yellow"},
    {"name": "LOW", "color": "gray"},
]

DATABASE_PROPERTIES: dict[str, Any] = {
    "name": {"title": {}},
    "website": {"url": {}},
    "phone": {"phone_number": {}},
    "address": {"rich_text": {}},
    "score_total": {"number": {"format": "number"}},
    "priority": {"select": {"options": PRIORITY_OPTIONS}},
}


def log(step: str, message: str = "") -> None:
    line = f"[{step}] {message}" if message else f"[{step}]"
    print(line, flush=True)


def get_notion_client() -> Client:
    token = os.environ.get("NOTION_TOKEN", "").strip()
    if not token:
        raise EnvironmentError(
            "NOTION_TOKEN manquant. Créez une intégration sur https://www.notion.so/my-integrations"
        )
    return Client(auth=token)


def load_scored_csv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise FileNotFoundError(f"Fichier introuvable : {path}")

    rows: list[dict[str, str]] = []
    with path.open(newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            rows.append({k: (row.get(k) or "").strip() for k in row})
    return rows


def is_valid_url(value: str) -> bool:
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def normalize_phone(value: str) -> str | None:
    """Notion phone_number : chiffres et + uniquement."""
    if not value:
        return None
    cleaned = re.sub(r"[^\d+]", "", value)
    if len(cleaned) < 8:
        return None
    return cleaned


def normalize_priority(value: str) -> str | None:
    upper = (value or "").strip().upper()
    if upper in ("HIGH", "MEDIUM", "LOW"):
        return upper
    return None


def rich_text(content: str) -> list[dict[str, Any]]:
    if not content:
        return []
    return [{"type": "text", "text": {"content": content[:2000]}}]


def build_page_properties(row: dict[str, str]) -> dict[str, Any]:
    """Construit les propriétés Notion pour une ligne CSV."""
    props: dict[str, Any] = {}

    name = row.get("name", "")
    if name:
        props["name"] = {"title": rich_text(name)}

    website = row.get("website", "")
    if is_valid_url(website):
        props["website"] = {"url": website}

    phone = normalize_phone(row.get("phone", ""))
    if phone:
        props["phone"] = {"phone_number": phone}

    # Infos texte regroupées si URL/tél. non compatibles avec les types Notion
    address_lines: list[str] = []
    if row.get("address"):
        address_lines.append(row["address"])
    if website and not is_valid_url(website):
        address_lines.insert(0, f"Site : {website}")
    if row.get("phone") and not phone:
        address_lines.append(f"Tél. : {row['phone']}")
    if address_lines:
        props["address"] = {"rich_text": rich_text("\n".join(address_lines))}

    score_raw = row.get("score_total", "")
    if score_raw:
        try:
            props["score_total"] = {"number": int(float(score_raw))}
        except ValueError:
            log("WARN", f"score_total invalide pour « {name} » : {score_raw}")

    priority = normalize_priority(row.get("priority", ""))
    if priority:
        props["priority"] = {"select": {"name": priority}}

    return props


def get_or_create_database(client: Client) -> str:
    """Retourne l'ID de la base à utiliser (existante ou nouvellement créée)."""
    database_id = os.environ.get("NOTION_DATABASE_ID", "").strip()
    if database_id:
        log("DATABASE", f"utilisation de la base existante {database_id}")
        try:
            client.databases.retrieve(database_id=database_id)
            return database_id
        except APIResponseError as err:
            raise RuntimeError(f"Base Notion inaccessible : {err}") from err

    parent_id = os.environ.get("NOTION_PARENT_PAGE_ID", "").strip()
    if not parent_id:
        raise EnvironmentError(
            "NOTION_DATABASE_ID ou NOTION_PARENT_PAGE_ID requis pour créer « Leads IA »"
        )

    log("DATABASE", f'création de « {DATABASE_TITLE} »…')
    try:
        response = client.databases.create(
            parent={"type": "page_id", "page_id": parent_id},
            title=[{"type": "text", "text": {"content": DATABASE_TITLE}}],
            properties=DATABASE_PROPERTIES,
        )
    except APIResponseError as err:
        raise RuntimeError(f"Échec création base : {err}") from err

    new_id = response["id"]
    log("DATABASE", f"créée : {new_id}")
    log("HINT", "Enregistrez : export NOTION_DATABASE_ID=" + new_id)
    return new_id


def create_lead_page(
    client: Client, database_id: str, row: dict[str, str]
) -> str:
    properties = build_page_properties(row)
    if "name" not in properties:
        raise ValueError("Ligne sans nom — ignorée")

    response = client.pages.create(
        parent={"database_id": database_id},
        properties=properties,
    )
    return response["id"]


def export_to_notion(rows: list[dict[str, str]]) -> tuple[int, int]:
    client = get_notion_client()
    database_id = get_or_create_database(client)

    success = 0
    failed = 0
    total = len(rows)

    log("EXPORT", f"{total} ligne(s) à envoyer")

    for index, row in enumerate(rows, start=1):
        name = row.get("name", "(sans nom)")
        try:
            page_id = create_lead_page(client, database_id, row)
            success += 1
            log("OK", f"{index}/{total} « {name} » → {page_id}")
        except APIResponseError as err:
            failed += 1
            log("API_ERROR", f"{index}/{total} « {name} » : {err}")
        except ValueError as err:
            failed += 1
            log("SKIP", f"{index}/{total} : {err}")
        except Exception as err:
            failed += 1
            log("ERROR", f"{index}/{total} « {name} » : {err}")

        if index < total and REQUEST_DELAY_S > 0:
            time.sleep(REQUEST_DELAY_S)

    return success, failed


def main() -> int:
    log("START", "export Notion — Leads IA")

    try:
        rows = load_scored_csv(INPUT_CSV)
    except FileNotFoundError as err:
        log("ABORT", str(err))
        log("HINT", "Lancez d’abord : python score_leads.py")
        return 1

    if not rows:
        log("ABORT", "data_scored.csv est vide")
        return 1

    try:
        success, failed = export_to_notion(rows)
    except (EnvironmentError, RuntimeError) as err:
        log("ABORT", str(err))
        return 1

    log("DONE", f"{success} créée(s), {failed} échec(s)")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    load_env_local()
    raise SystemExit(main())
