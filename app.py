"""
Live Notes — YouTube → Résumé intelligent Notion
=================================================
Pipeline :
  A. Extraction YouTube + filtrage par timestamp
  B. Synthèse IA (Ollama) — résumé dense, riche, structuré
  C. Conversion Markdown → blocs Notion (tableaux inclus) + push sécurisé
"""

from __future__ import annotations

import html
import json
import re
import time
from dataclasses import dataclass, field
from typing import Any, Optional

import ollama
import streamlit as st
from notion_client import Client
from notion_client.errors import APIResponseError
from ollama import ResponseError
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)

# ─────────────────────────────────────────────────────────────────────────────
# Constantes
# ─────────────────────────────────────────────────────────────────────────────

OLLAMA_MODEL = "qwen2.5-coder"
NOTION_VERSION = "2022-06-28"
RICH_TEXT_LIMIT = 2000
MAX_TRANSCRIPT_CHARS = 18_000
LINES_PER_MINUTE = 3

SYSTEM_PROMPT_TEMPLATE = """
Tu es un expert Notion et un rédacteur de synthèses ultra-denses.

MISSION : produire un VRAI RÉSUMÉ intelligent (PAS une transcription, PAS une paraphrase ligne par ligne).

CONTRAINTE DE DENSITÉ (STRICTE) :
- Durée analysée : {minutes:.1f} minute(s).
- Maximum total : {max_lines} lignes/blocs de contenu (≈ 3 lignes par minute).
- Élimine absolument le superflu : blagues, digressions, remplissage, transitions orales.

STRUCTURE NOTION RICHE (obligatoire quand pertinent) :
- Utilise des titres Markdown ## et ### pour structurer.
- Utilise des listes à puces ou numérotées pour les actions / étapes.
- Utilise **gras** pour les mots-clés et chiffres importants.
- Si le contenu s'y prête (comparaisons, prix, étapes, concepts, pros/cons, KPI), crée des TABLEAUX Markdown :
  | Colonne A | Colonne B |
  |-----------|-----------|
  | valeur    | valeur    |
- Pour des données type "base de données", préfère un tableau avec colonnes claires (Nom, Détail, Impact, Chiffre…).
- N'utilise PAS de phrase d'introduction ni de conclusion.

SORTIE : uniquement du Markdown Notion-compatible (titres, listes, tableaux, gras).
""".strip()

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; }
.stApp { background: #0B0F19; color: #E5E7EB; }
.block-container { padding: 24px !important; max-width: 1240px; }
[data-testid="stSidebar"] { background: #0B0F19; border-right: 1px solid #1F2937; }
.card { background: #111827; border: 1px solid #1F2937; border-radius: 14px; padding: 24px; }
.card-title { color: #F9FAFB; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em;
              text-transform: uppercase; margin-bottom: 16px; }
.subtitle { color: #6B7280; margin-bottom: 24px; }
.stButton > button {
    background: linear-gradient(135deg, #6366F1, #4F46E5 55%, #7C3AED) !important;
    color: #FFF !important; border: none !important; border-radius: 10px !important;
    font-weight: 600 !important; box-shadow: 0 8px 24px rgba(99,102,241,.28) !important;
}
.highlight-box {
    background: linear-gradient(135deg, rgba(99,102,241,.14), rgba(124,58,237,.1));
    border: 1px solid rgba(99,102,241,.35); border-radius: 12px; padding: 20px 22px; margin-top: 16px;
}
.highlight-title { color: #A5B4FC; font-size: .78rem; font-weight: 700; letter-spacing: .1em;
                   text-transform: uppercase; margin-bottom: 12px; }
.status-box { background: #0B0F19; border: 1px solid #1F2937; border-radius: 10px;
              padding: 16px; min-height: 200px; color: #9CA3AF; font-size: .9rem; }
h1 { color: #F9FAFB !important; }
</style>
"""


# ─────────────────────────────────────────────────────────────────────────────
# Modèles internes
# ─────────────────────────────────────────────────────────────────────────────


@dataclass
class ParsedTable:
    rows: list[list[str]] = field(default_factory=list)
    has_header: bool = True


@dataclass
class NotionPushReport:
    success: int = 0
    failed: int = 0
    errors: list[str] = field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Secrets & état
# ─────────────────────────────────────────────────────────────────────────────


def read_secret(section: str, key: str, default: str = "") -> str:
    try:
        value = st.secrets[section][key]
        return str(value).strip() if value else default
    except (KeyError, TypeError, FileNotFoundError):
        return default


def resolve_page_id() -> str:
    return read_secret("notion", "page_id") or read_secret("notion", "parent_page_id")


def init_state() -> None:
    for key, val in {
        "processing": False,
        "notion_token": read_secret("notion", "token"),
        "notion_page_id": resolve_page_id(),
        "final_summary": "",
        "debug_logs": [],
    }.items():
        st.session_state.setdefault(key, val)


def log_debug(message: str) -> None:
    st.session_state.debug_logs.append(message)


# ─────────────────────────────────────────────────────────────────────────────
# YouTube
# ─────────────────────────────────────────────────────────────────────────────


def extract_video_id(url: str) -> Optional[str]:
    for pattern in (
        r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})",
    ):
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def fetch_transcript(video_id: str) -> list[dict[str, Any]]:
    api = YouTubeTranscriptApi()
    langs = ["fr", "fr-FR", "en", "en-US", "en-GB"]
    try:
        return api.fetch(video_id, languages=langs).to_raw_data()
    except NoTranscriptFound:
        listing = api.list(video_id)
        try:
            return listing.find_transcript(langs).fetch().to_raw_data()
        except NoTranscriptFound:
            for item in listing:
                return item.fetch().to_raw_data()
            raise


def filter_transcript(
    transcript: list[dict[str, Any]], start_seconds: float
) -> list[dict[str, Any]]:
    return [r for r in transcript if float(r.get("start", 0)) >= start_seconds]


def analyzed_duration_minutes(transcript: list[dict[str, Any]], start_seconds: float) -> float:
    if not transcript:
        return 0.0
    end = max(float(r.get("start", 0)) + float(r.get("duration", 0)) for r in transcript)
    return max((end - start_seconds) / 60.0, 0.1)


def transcript_to_text(transcript: list[dict[str, Any]]) -> str:
    return " ".join(str(r.get("text", "")) for r in transcript).strip()


def format_ts(seconds: float) -> str:
    total = int(seconds)
    m, s = divmod(total, 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


# ─────────────────────────────────────────────────────────────────────────────
# Notion — utilitaires bas niveau
# ─────────────────────────────────────────────────────────────────────────────


def normalize_page_id(page_id: str) -> str:
    clean = page_id.replace("-", "").strip()
    if len(clean) == 32:
        return (
            f"{clean[:8]}-{clean[8:12]}-{clean[12:16]}-"
            f"{clean[16:20]}-{clean[20:]}"
        )
    return page_id.strip()


def format_notion_error(exc: Exception, context: str = "") -> str:
    prefix = f"[{context}] " if context else ""
    if isinstance(exc, APIResponseError):
        body = exc.body if isinstance(exc.body, dict) else {"raw": str(exc.body)}
        code = body.get("code", "api_error")
        message = body.get("message", str(exc))
        return (
            f"{prefix}Notion APIResponseError — status={exc.status}, "
            f"code={code}, message={message}, body={json.dumps(body, ensure_ascii=False)}"
        )
    return f"{prefix}Erreur Notion détaillée : {type(exc).__name__}: {exc}"


def safe_text(content: str) -> str:
    """Notion rejette les rich_text vides."""
    cleaned = " ".join((content or "").split())
    return cleaned if cleaned else " "


def split_rich_chunks(text: str) -> list[str]:
    clean = safe_text(text)
    if len(clean) <= RICH_TEXT_LIMIT:
        return [clean]
    parts: list[str] = []
    while clean:
        parts.append(clean[:RICH_TEXT_LIMIT])
        clean = clean[RICH_TEXT_LIMIT:]
    return parts


def parse_inline_rich_text(text: str) -> list[dict[str, Any]]:
    """Convertit **gras** en annotations Notion."""
    rich: list[dict[str, Any]] = []
    pattern = re.compile(r"\*\*(.+?)\*\*")
    cursor = 0
    for match in pattern.finditer(text):
        if match.start() > cursor:
            for chunk in split_rich_chunks(text[cursor : match.start()]):
                rich.append({"type": "text", "text": {"content": chunk}})
        for chunk in split_rich_chunks(match.group(1)):
            rich.append(
                {
                    "type": "text",
                    "text": {"content": chunk},
                    "annotations": {"bold": True},
                }
            )
        cursor = match.end()
    if cursor < len(text):
        for chunk in split_rich_chunks(text[cursor:]):
            rich.append({"type": "text", "text": {"content": chunk}})
    if not rich:
        rich.append({"type": "text", "text": {"content": " "}})
    return rich


def make_table_cell(text: str) -> list[dict[str, Any]]:
    return parse_inline_rich_text(text)


def verify_notion_page(notion: Client, page_id: str) -> Optional[str]:
    try:
        page = notion.pages.retrieve(page_id=page_id)
        log_debug(f"Page Notion OK — id={page.get('id')}, object={page.get('object')}")
        return None
    except Exception as exc:
        msg = format_notion_error(exc, "verify_page")
        log_debug(msg)
        return msg


def append_single_block(
    notion: Client, parent_id: str, block: dict[str, Any], context: str
) -> tuple[bool, Optional[str]]:
    """Push 1 bloc à la fois — un échec n'arrête pas tout le pipeline."""
    try:
        notion.blocks.children.append(block_id=parent_id, children=[block])
        log_debug(f"Bloc OK ({context}) — type={block.get('type')}")
        return True, None
    except Exception as exc:
        msg = format_notion_error(exc, context)
        log_debug(msg)
        st.error(msg)
        return False, msg


def append_table_block(
    notion: Client, page_id: str, table: ParsedTable, context: str
) -> tuple[bool, Optional[str]]:
    """
    Crée un tableau Notion conforme API 2022-06-28 :
    1) table sur la page
    2) table_row ajoutés comme enfants du bloc table
    """
    if not table.rows:
        return True, None

    width = max(len(row) for row in table.rows)
    rows = [row + [""] * (width - len(row)) for row in table.rows]

    table_block: dict[str, Any] = {
        "object": "block",
        "type": "table",
        "table": {
            "table_width": width,
            "has_column_header": table.has_header,
            "has_row_header": False,
        },
    }

    try:
        created = notion.blocks.children.append(block_id=page_id, children=[table_block])
        table_id = created["results"][0]["id"]
        log_debug(f"Table créée ({context}) — id={table_id}, width={width}")
    except Exception as exc:
        msg = format_notion_error(exc, f"{context}/table")
        log_debug(msg)
        st.error(msg)
        return False, msg

    for row_idx, row in enumerate(rows):
        row_block: dict[str, Any] = {
            "object": "block",
            "type": "table_row",
            "table_row": {
                "cells": [make_table_cell(safe_text(cell)) for cell in row[:width]]
            },
        }
        ok, err = append_single_block(
            notion, table_id, row_block, f"{context}/row_{row_idx + 1}"
        )
        if not ok:
            return False, err
        time.sleep(0.15)

    return True, None


# ─────────────────────────────────────────────────────────────────────────────
# Markdown → blocs Notion (tableaux inclus)
# ─────────────────────────────────────────────────────────────────────────────


def is_table_separator(line: str) -> bool:
    return bool(re.match(r"^\s*\|?[\s:-]+\|[\s|:-]+\|?\s*$", line))


def parse_markdown_table(lines: list[str], start: int) -> tuple[Optional[ParsedTable], int]:
    if start >= len(lines) or "|" not in lines[start]:
        return None, start

    table_lines: list[str] = []
    idx = start
    while idx < len(lines) and "|" in lines[idx]:
        table_lines.append(lines[idx].strip())
        idx += 1

    if len(table_lines) < 2:
        return None, start

    parsed_rows: list[list[str]] = []
    header = True
    for line in table_lines:
        if is_table_separator(line):
            header = True
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        parsed_rows.append(cells)

    if not parsed_rows:
        return None, start

    return ParsedTable(rows=parsed_rows, has_header=True), idx


def markdown_to_notion_blocks(markdown: str) -> tuple[list[dict[str, Any]], list[ParsedTable]]:
    """
    Traduit le Markdown IA en blocs Notion standards + tableaux structurés.
    Retourne (blocs_simples, tableaux).
    """
    blocks: list[dict[str, Any]] = []
    tables: list[ParsedTable] = []
    lines = markdown.splitlines()
    i = 0

    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if "|" in stripped:
            table, next_i = parse_markdown_table(lines, i)
            if table:
                tables.append(table)
                i = next_i
                continue

        if stripped.startswith("### "):
            blocks.append(
                {
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {"rich_text": parse_inline_rich_text(stripped[4:].strip())},
                }
            )
        elif stripped.startswith("## "):
            blocks.append(
                {
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {"rich_text": parse_inline_rich_text(stripped[3:].strip())},
                }
            )
        elif stripped.startswith("# "):
            blocks.append(
                {
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {"rich_text": parse_inline_rich_text(stripped[2:].strip())},
                }
            )
        elif stripped in ("---", "***", "___"):
            blocks.append({"object": "block", "type": "divider", "divider": {}})
        elif re.match(r"^[-*•]\s+", stripped):
            content = re.sub(r"^[-*•]\s+", "", stripped)
            blocks.append(
                {
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": parse_inline_rich_text(content)
                    },
                }
            )
        elif re.match(r"^\d+\.\s+", stripped):
            content = re.sub(r"^\d+\.\s+", "", stripped)
            blocks.append(
                {
                    "object": "block",
                    "type": "numbered_list_item",
                    "numbered_list_item": {
                        "rich_text": parse_inline_rich_text(content)
                    },
                }
            )
        else:
            blocks.append(
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {"rich_text": parse_inline_rich_text(stripped)},
                }
            )
        i += 1

    if not blocks and not tables:
        blocks.append(
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": parse_inline_rich_text(markdown.strip() or "—")},
            }
        )

    return blocks, tables


def push_markdown_to_notion(
    notion: Client, page_id: str, markdown: str
) -> NotionPushReport:
    """Envoie chaque bloc individuellement pour isoler les erreurs de format."""
    report = NotionPushReport()
    blocks, tables = markdown_to_notion_blocks(markdown)

    for idx, block in enumerate(blocks, start=1):
        ok, _ = append_single_block(notion, page_id, block, f"block_{idx}/{block.get('type')}")
        if ok:
            report.success += 1
        else:
            report.failed += 1
        time.sleep(0.12)

    for t_idx, table in enumerate(tables, start=1):
        ok, err = append_table_block(notion, page_id, table, f"table_{t_idx}")
        if ok:
            report.success += 1
        else:
            report.failed += 1
            if err:
                report.errors.append(err)

    return report


# ─────────────────────────────────────────────────────────────────────────────
# Ollama
# ─────────────────────────────────────────────────────────────────────────────


def build_system_prompt(minutes: float) -> str:
    max_lines = max(int(minutes * LINES_PER_MINUTE), 3)
    return SYSTEM_PROMPT_TEMPLATE.format(minutes=minutes, max_lines=max_lines)


def trim_transcript(text: str) -> tuple[str, bool]:
    clean = " ".join(text.split())
    if len(clean) <= MAX_TRANSCRIPT_CHARS:
        return clean, False
    return clean[: MAX_TRANSCRIPT_CHARS - 3].rsplit(" ", 1)[0] + "...", True


def generate_summary(raw_transcript: str, minutes: float) -> str:
    payload, truncated = trim_transcript(raw_transcript)
    user_msg = (
        f"Durée analysée : {minutes:.1f} minutes.\n"
        f"Budget strict : {int(minutes * LINES_PER_MINUTE)} lignes maximum.\n\n"
        f"Transcription source (à RÉSUMER, ne pas recopier) :\n{payload}"
    )
    if truncated:
        user_msg += "\n\n[Note: transcription tronquée pour la limite de contexte locale.]"

    response = ollama.chat(
        model="qwen2.5-coder",
        messages=[
            {"role": "system", "content": build_system_prompt(minutes)},
            {"role": "user", "content": user_msg},
        ],
    )
    return response["message"]["content"] or ""


def ollama_healthcheck() -> Optional[str]:
    try:
        listed = ollama.list()
        models = getattr(listed, "models", None) or listed.get("models", [])
        installed = set()
        for m in models:
            name = (
                m.get("model") or m.get("name", "")
                if isinstance(m, dict)
                else getattr(m, "model", None) or getattr(m, "name", "")
            )
            if name:
                installed.add(str(name).split(":")[0])
        if OLLAMA_MODEL not in installed:
            return f"Modèle `{OLLAMA_MODEL}` manquant. Lancez `ollama pull {OLLAMA_MODEL}`."
        return None
    except ConnectionError:
        return "Ollama inaccessible. Démarrez Ollama ou `ollama serve`."
    except Exception as exc:
        return f"Erreur Ollama : {exc}"


# ─────────────────────────────────────────────────────────────────────────────
# UI helpers
# ─────────────────────────────────────────────────────────────────────────────


def render_summary_preview(markdown: str) -> None:
    st.markdown(
        '<div class="highlight-box"><div class="highlight-title">Résumé intelligent</div></div>',
        unsafe_allow_html=True,
    )
    st.markdown(markdown)


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline principal
# ─────────────────────────────────────────────────────────────────────────────


def validate_launch(url: str, token: str, page_id: str) -> Optional[str]:
    if not url.strip():
        return "Collez une URL YouTube."
    if not token.strip():
        return "Renseignez le token Notion."
    if not page_id.strip():
        return "Renseignez l'ID de page Notion."
    return ollama_healthcheck()


def execute_pipeline(
    youtube_url: str,
    start_minutes: float,
    notion_token: str,
    notion_page_id: str,
    preview_slot,
    status_slot,
    progress,
) -> None:
    video_id = extract_video_id(youtube_url)
    if not video_id:
        st.error("URL YouTube invalide.")
        return

    start_sec = start_minutes * 60
    page_id = normalize_page_id(notion_page_id)

    # ── ÉTAPE A ──────────────────────────────────────────────────────────────
    status_slot.info("Étape A — Extraction & filtrage de la transcription…")
    progress.progress(0.1)

    try:
        full_transcript = fetch_transcript(video_id)
    except TranscriptsDisabled:
        st.error("Sous-titres désactivés sur cette vidéo.")
        return
    except NoTranscriptFound:
        st.error("Aucune transcription trouvée.")
        return
    except VideoUnavailable:
        st.error("Vidéo introuvable ou privée.")
        return
    except Exception as exc:
        st.error(f"Erreur YouTube : {exc}")
        return

    filtered = filter_transcript(full_transcript, start_sec)
    if not filtered:
        st.error(f"Aucun contenu après {format_ts(start_sec)}.")
        return

    minutes = analyzed_duration_minutes(filtered, start_sec)
    raw_text = transcript_to_text(filtered)
    max_lines = int(minutes * LINES_PER_MINUTE)

    status_slot.info(
        f"Étape A OK — {minutes:.1f} min analysées depuis {format_ts(start_sec)}. "
        f"Budget résumé : **{max_lines} lignes max**."
    )
    preview_slot.markdown(
        f'<div class="status-box">Analyse de <b>{minutes:.1f} min</b> de contenu…<br>'
        f"Objectif : résumé dense (~{max_lines} lignes), pas une transcription.</div>",
        unsafe_allow_html=True,
    )

    try:
        notion = Client(auth=notion_token, notion_version=NOTION_VERSION)
    except Exception as exc:
        st.error(f"Initialisation Notion impossible : {exc}")
        return

    page_error = verify_notion_page(notion, page_id)
    if page_error:
        st.error(page_error)
        st.caption(
            "Vérifiez : token valide, page partagée avec l'intégration, "
            "et ID au format UUID."
        )
        return

    # ── ÉTAPE B — Synthèse IA (pas de transcription brute sur Notion) ────────
    status_slot.info("Étape B — Génération du résumé intelligent (Ollama)…")
    progress.progress(0.35)

    try:
        summary_md = generate_summary(raw_text, minutes)
    except ConnectionError:
        st.error("Ollama ne répond pas. Démarrez le serveur local.")
        return
    except ResponseError as exc:
        st.error(f"Erreur Ollama : {exc}")
        return
    except Exception as exc:
        st.error(f"Échec synthèse Ollama : {exc}")
        return

    if not summary_md.strip():
        st.warning("Ollama a renvoyé un résumé vide.")
        return

    st.session_state.final_summary = summary_md
    with preview_slot.container():
        render_summary_preview(summary_md)

    # ── ÉTAPE C — Push Notion bloc par bloc ──────────────────────────────────
    status_slot.info("Étape C — Envoi sécurisé vers Notion (bloc par bloc)…")
    progress.progress(0.65)

    header_block: dict[str, Any] = {
        "object": "block",
        "type": "heading_2",
        "heading_2": {
            "rich_text": parse_inline_rich_text(
                f"📝 Résumé — {minutes:.0f} min analysées (depuis {format_ts(start_sec)})"
            )
        },
    }
    append_single_block(notion, page_id, header_block, "header")

    report = push_markdown_to_notion(notion, page_id, summary_md)

    progress.progress(1.0)

    if report.failed == 0:
        status_slot.success(
            f"Terminé — {report.success} éléments publiés sur Notion."
        )
        st.toast("🚀 Notes et résumé synchronisés sur Notion !", icon="✅")
    else:
        status_slot.warning(
            f"Publication partielle — OK: {report.success}, Échecs: {report.failed}. "
            "Consultez les erreurs détaillées ci-dessus."
        )
        if report.errors:
            with st.expander("Détails des erreurs Notion"):
                for err in report.errors:
                    st.code(err)


# ─────────────────────────────────────────────────────────────────────────────
# Streamlit entrypoint
# ─────────────────────────────────────────────────────────────────────────────


def main() -> None:
    st.set_page_config(
        page_title="Live Notes — Résumé Notion",
        page_icon="📝",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    init_state()
    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

    st.sidebar.markdown("### 🤖 Ollama")
    st.sidebar.caption(f"Modèle : `{OLLAMA_MODEL}` — résumé dense (~3 lignes/min).")
    health = ollama_healthcheck()
    st.sidebar.success("Ollama prêt.") if not health else st.sidebar.warning(health)

    st.sidebar.markdown("---")
    st.sidebar.markdown("### 🔐 Notion")
    st.sidebar.caption("Pré-rempli via `st.secrets` / `secrets.toml`.")

    st.sidebar.text_input("Token Notion", type="password", key="notion_token")
    st.sidebar.text_input("Page ID Notion", type="password", key="notion_page_id")

    st.markdown(
        "<h1>📝 Live Notes</h1>"
        '<p class="subtitle">Résumé intelligent Notion — dense, structuré, avec tableaux. '
        "Plus de transcription brute.</p>",
        unsafe_allow_html=True,
    )

    left, right = st.columns([1, 1.15], gap="large")

    with left:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<p class="card-title">Configuration</p>', unsafe_allow_html=True)
        youtube_url = st.text_input(
            "URL YouTube",
            placeholder="https://www.youtube.com/watch?v=…",
            label_visibility="collapsed",
        )
        start_minutes = st.number_input(
            "Minutes de départ",
            min_value=0.0,
            max_value=600.0,
            value=0.0,
            step=1.0,
        )
        st.caption(
            f"Départ {format_ts(start_minutes * 60)} · "
            f"Densité cible : **{LINES_PER_MINUTE} lignes/min**"
        )
        launch = st.button(
            "🚀 Générer le résumé Notion",
            type="primary",
            use_container_width=True,
            disabled=st.session_state.processing,
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with right:
        st.markdown('<div class="card">', unsafe_allow_html=True)
        st.markdown('<p class="card-title">Aperçu du résumé</p>', unsafe_allow_html=True)
        preview_slot = st.empty()
        if st.session_state.final_summary:
            with preview_slot.container():
                render_summary_preview(st.session_state.final_summary)
        else:
            preview_slot.markdown(
                '<div class="status-box">Le résumé intelligent apparaîtra ici après analyse.</div>',
                unsafe_allow_html=True,
            )
        st.markdown("</div>", unsafe_allow_html=True)

    status_slot = st.empty()
    progress = st.progress(0.0)

    if st.session_state.debug_logs:
        with st.expander("Logs debug Notion"):
            for line in st.session_state.debug_logs[-30:]:
                st.text(line)

    if not launch:
        return
    if st.session_state.processing:
        st.warning("Traitement déjà en cours.")
        return

    err = validate_launch(
        youtube_url,
        st.session_state.notion_token,
        st.session_state.notion_page_id,
    )
    if err:
        st.error(err)
        return

    st.session_state.processing = True
    st.session_state.final_summary = ""
    st.session_state.debug_logs = []

    try:
        execute_pipeline(
            youtube_url=youtube_url.strip(),
            start_minutes=float(start_minutes),
            notion_token=st.session_state.notion_token.strip(),
            notion_page_id=st.session_state.notion_page_id.strip(),
            preview_slot=preview_slot,
            status_slot=status_slot,
            progress=progress,
        )
    finally:
        st.session_state.processing = False


if __name__ == "__main__":
    main()
