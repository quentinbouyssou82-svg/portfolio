"""Extraction d'emails depuis HTML (stdlib)."""

from __future__ import annotations

import re
from typing import Iterable
from urllib.parse import urlparse

EMAIL_PATTERN = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE,
)

BLOCKED_FRAGMENTS = (
    "example.com",
    "email.com",
    "sentry.io",
    "wixpress.com",
    "google.com",
    "facebook.com",
    "instagram.com",
    "duckduckgo.com",
    "duck.com",
    "noreply",
    "no-reply",
    "png",
    "jpg",
    "webp",
)

BLOCKED_PREFIXES = ("support@", "admin@", "webmaster@")


def is_valid_email(email: str) -> bool:
    email = (email or "").strip().lower()
    if not email or "@" not in email:
        return False
    if not EMAIL_PATTERN.fullmatch(email):
        return False
    if any(x in email for x in BLOCKED_FRAGMENTS):
        return False
    if any(email.startswith(p) for p in BLOCKED_PREFIXES):
        return False
    local, _, domain = email.partition("@")
    return len(local) >= 2 and "." in domain


def extract_emails_from_html(html: str) -> list[str]:
    found: list[str] = []
    for match in EMAIL_PATTERN.findall(html or ""):
        e = match.lower().strip()
        if is_valid_email(e):
            found.append(e)
    for match in re.findall(r"mailto:([^\"'?\s>]+)", html or "", re.I):
        e = match.split("?")[0].strip().lower()
        if is_valid_email(e):
            found.append(e)
    seen: set[str] = set()
    out: list[str] = []
    for e in found:
        if e not in seen:
            seen.add(e)
            out.append(e)
    return out


def pick_best_email(emails: Iterable[str], website: str = "") -> str:
    emails = list(emails)
    if not emails:
        return ""
    site_domain = urlparse(website).netloc.lower().replace("www.", "") if website else ""
    prefs = ("contact@", "info@", "hello@", "bonjour@", "accueil@")
    if site_domain:
        for p in prefs:
            for e in emails:
                if e.startswith(p) and site_domain in e:
                    return e
        for e in emails:
            if site_domain in e:
                return e
    for p in prefs:
        for e in emails:
            if e.startswith(p):
                return e
    return emails[0]
