#!/usr/bin/env python3
"""Strukturkontroll av webbtjanst.com-artefakten (site/).

  python3 scripts/seo-site-check.py            # full kontroll
  python3 scripts/seo-site-check.py --thin 250 # tröskel för tunn text

Kontrollerar per sida: clean-URL-script, .html-läckage, canonical, en H1,
titel/beskrivning, JSON-LD som går att parsa, interna länkar som löser ut,
förbjudna strängar. Dessutom: sitemap-täckning och ordantal.
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
BASE = "https://www.webbtjanst.com"
FORBIDDEN = ["trycloudflare.com", "rosy-parakeet-562", "+46 73 650 21 84", "info@webbtjanst.com"]
NOINDEX_EXPECTED = {"github-demos/index.html"}

errors: list[str] = []
warnings: list[str] = []


def clean_url(rel: pathlib.Path) -> str:
    s = "/" + str(rel).replace("\\", "/")
    if s.endswith("/index.html"):
        s = s[: -len("index.html")]
    elif s.endswith(".html"):
        s = s[: -len(".html")]
    return BASE + s


def visible_words(html: str) -> int:
    body = re.sub(r"<script.*?</script>", " ", html, flags=re.S)
    body = re.sub(r"<style.*?</style>", " ", body, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body)
    return len(body.split())


def main() -> int:
    thin_limit = 250
    if "--thin" in sys.argv:
        thin_limit = int(sys.argv[sys.argv.index("--thin") + 1])

    files = sorted(SITE.rglob("*.html"))
    words: list[tuple[int, str]] = []
    for f in files:
        rel = f.relative_to(SITE)
        text = f.read_text(encoding="utf-8")
        name = str(rel)

        if "<script data-clean-public-url>" not in text:
            errors.append(f"{name}: saknar data-clean-public-url")

        for value in FORBIDDEN:
            if value in text:
                errors.append(f"{name}: förbjudet värde {value}")

        leaked = re.findall(r'(?:href|action)="([^"]*\.html[^"]*)"', text)
        leaked = [u for u in leaked if not u.startswith(("http", "//"))]
        if leaked:
            errors.append(f"{name}: .html-länk {leaked[:3]}")

        canon = re.search(r'rel="canonical" href="([^"]+)"', text)
        noindex = bool(re.search(r'name="robots"[^>]*noindex', text))
        transactional = name in {
            "404.html",
            "demo.html",
            "betalning-klar.html",
            "checkout-klar.html",
            "checkout-avbruten.html",
        } or "github-demos" in rel.parts
        if not canon and not transactional:
            errors.append(f"{name}: saknar canonical")
        elif canon and not transactional:
            want = clean_url(rel)
            if rel.name != "index.html" and canon.group(1) != want and not canon.group(1).endswith("/"):
                errors.append(f"{name}: canonical {canon.group(1)} != {want}")

        h1 = len(re.findall(r"<h1[ >]", text))
        if h1 != 1 and name not in NOINDEX_EXPECTED and not transactional:
            errors.append(f"{name}: {h1} H1")

        title = re.search(r"<title>(.*?)</title>", text, re.S)
        if not title:
            errors.append(f"{name}: saknar title")
        elif len(title.group(1)) > 70:
            warnings.append(f"{name}: title {len(title.group(1))} tecken")

        desc = re.search(r'<meta name="description" content="([^"]*)"', text)
        if not desc and not transactional:
            errors.append(f"{name}: saknar meta description")
        elif desc and not (70 <= len(desc.group(1)) <= 175):
            warnings.append(f"{name}: description {len(desc.group(1))} tecken")

        for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
            try:
                json.loads(m.group(1))
            except Exception as exc:  # noqa: BLE001
                errors.append(f"{name}: JSON-LD går inte att parsa ({exc})")

        for m in re.finditer(r'<a\b[^>]*\bhref="([^"]+)"', text):
            href = m.group(1).replace("&amp;", "&")
            if re.match(r"^(?:[a-z]+:|//|#|\?)", href, re.I):
                continue
            path = href.split("#")[0].split("?")[0]
            if not path:
                continue
            target = (SITE / path.lstrip("/")) if path.startswith("/") else (f.parent / path)
            candidates = [target, pathlib.Path(str(target) + ".html"), target / "index.html"]
            if not any(c.exists() for c in candidates):
                errors.append(f"{name}: bruten intern länk {href}")

        wc = visible_words(text)
        words.append((wc, name))
        noindex = bool(re.search(r'name="robots"[^>]*noindex', text))
        if wc < thin_limit and not noindex and not name.startswith(("checkout-", "betalning-", "demo")):
            warnings.append(f"{name}: {wc} ord (tunn text)")

    sitemap = (SITE / "sitemap.xml").read_text(encoding="utf-8")
    locs = set(re.findall(r"<loc>([^<]+)</loc>", sitemap))
    if any(".html" in u for u in locs):
        errors.append("sitemap.xml: innehåller .html")
    expected = set()
    for f in files:
        rel = f.relative_to(SITE)
        if rel.name in {"404.html", "demo.html", "checkout-klar.html", "checkout-avbruten.html", "betalning-klar.html"}:
            continue
        if "github-demos" in rel.parts:
            continue
        if re.search(r'name="robots"[^>]*noindex', f.read_text(encoding="utf-8")):
            continue
        expected.add(clean_url(rel))
    missing = sorted(expected - locs)
    extra = sorted(locs - expected)
    if missing:
        errors.append(f"sitemap saknar {len(missing)}: {missing[:5]}")
    if extra:
        warnings.append(f"sitemap har {len(extra)} URL:er utan fil: {extra[:5]}")

    print(f"HTML-sidor: {len(files)} | sitemap-URL:er: {len(locs)}")
    words.sort()
    print("minsta sidor:", ", ".join(f"{n.split('/')[-1]}={w}" for w, n in words[:8]))
    print(f"FEL: {len(errors)}")
    for e in errors:
        print("  ✗", e)
    print(f"VARNINGAR: {len(warnings)}")
    for w in warnings[:25]:
        print("  !", w)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
