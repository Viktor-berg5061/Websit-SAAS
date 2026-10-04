#!/usr/bin/env python3
"""Gör om .html-adresser till riktiga omdirigeringar (2026-10-04).

Bakgrund: GitHub Pages serverar /tjanster/hemsidor.html och /tjanster/hemsidor
från SAMMA fil, så en server-301 går inte att sätta utan att proxa domänen genom
Cloudflare. Skriptet som städar adressfältet gör nu en riktig navigering
(location.replace) i stället för history.replaceState — då följer Googlebot
omdirigeringen och .html-adressen slutar vara en dubblett i indexet.

  python3 scripts/webbtjanst-clean-url-redirect.py
"""
from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"

NEW = """<script data-clean-public-url>
  (function () {
    var path = window.location.pathname;
    if (!path.endsWith(".html")) return;
    var cleanPath = path.endsWith("/index.html")
      ? path.slice(0, -10) || "/"
      : path.slice(0, -5);
    window.location.replace(cleanPath + window.location.search + window.location.hash);
  })();
</script>"""


def main() -> None:
    changed = 0
    for f in sorted(SITE.rglob("*.html")):
        html = f.read_text(encoding="utf-8")
        m = re.search(r"<script data-clean-public-url>.*?</script>", html, flags=re.S)
        if not m:
            print("hoppar (saknar script):", f.relative_to(SITE))
            continue
        if m.group(0) == NEW:
            continue
        html = html[: m.start()] + NEW + html[m.end():]
        f.write_text(html, encoding="utf-8")
        changed += 1
    print(f"uppdaterade {changed} sidor till riktig omdirigering")


if __name__ == "__main__":
    main()
