#!/usr/bin/env python3
"""Trimmar för långa meta-descriptions (>160 tecken) på webbtjanst.com.

  python3 scripts/webbtjanst-seo-meta.py

Google klipper descriptions runt 155–160 tecken. Sidor med 176–192 tecken
(t.ex. hemsida-<bransch>) tappar slutet av meningen i sökresultatet. Vi kapar
vid sista meningsgränsen före 160 tecken, annars vid sista kommatecknet.
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
LIMIT = 160
SKIP = {"404.html", "demo.html", "betalning-klar.html", "checkout-klar.html", "checkout-avbruten.html"}


def shorten(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= LIMIT:
        return text
    for sep in (". ", "! ", "? "):
        cut = text.rfind(sep, 80, LIMIT)
        if cut != -1:
            return text[: cut + 1]
    cut = text.rfind(", ", 80, LIMIT)
    if cut != -1:
        return text[:cut] + "."
    cut = text.rfind(" ", 80, LIMIT)
    return text[:cut] + "."


def main() -> None:
    changed = 0
    for f in sorted(SITE.rglob("*.html")):
        rel = f.relative_to(SITE)
        if rel.name in SKIP or "github-demos" in rel.parts:
            continue
        html = f.read_text(encoding="utf-8")
        if re.search(r'name="robots"[^>]*noindex', html):
            continue
        m = re.search(r'<meta name="description" content="([^"]*)"', html)
        if not m or len(m.group(1)) <= LIMIT:
            continue
        old = m.group(1)
        new = shorten(old)
        html = html.replace(f'content="{old}"', f'content="{new}"', 1)
        f.write_text(html, encoding="utf-8")
        changed += 1
        print(f"{str(rel):45} {len(old):3d} -> {len(new):3d} tecken")
    print(f"klart: {changed} beskrivningar kortade")


if __name__ == "__main__":
    main()
