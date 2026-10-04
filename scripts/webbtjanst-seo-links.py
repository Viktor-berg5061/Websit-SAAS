#!/usr/bin/env python3
"""Webbtjänst — sitemap, llms.txt och internlänkning för nya klustersidor.

Kör EFTER att de nya sidorna är byggda:
  python3 scripts/webbtjanst-seo-links.py

1. Bygger om site/sitemap.xml från faktiska filer (exkl. 404, checkout-, demo- och noindex-sidor)
2. Uppdaterar site/llms.txt med nya klustersidor
3. Lägger "Se även"-block på pelarsidorna (lokal-seo, ai-receptionist)
4. Länkar ortssidorna (hemsida-<stad>) till respektive lokal-seo-<stad>
"""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
BASE = "https://www.webbtjanst.com"

EXCLUDE_NAMES = {
    "404.html",
    "demo.html",
    "checkout-klar.html",
    "checkout-avbruten.html",
    "betalning-klar.html",
}
EXCLUDE_DIRS = {"github-demos"}

CITIES = [
    ("stockholm", "Stockholm"),
    ("goteborg", "Göteborg"),
    ("malmo", "Malmö"),
    ("uppsala", "Uppsala"),
    ("vasteras", "Västerås"),
    ("orebro", "Örebro"),
]

BRANCHES = [
    ("rormokare", "Rörmokare"),
    ("elektriker", "Elektriker"),
    ("hantverkare", "Hantverkare"),
    ("bilverkstad", "Bilverkstad"),
    ("tandlakare", "Tandläkare"),
    ("frisor", "Frisör"),
]


def read(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8")


def write(p: pathlib.Path, text: str) -> None:
    p.write_text(text, encoding="utf-8")


def public_pages() -> list[str]:
    urls = []
    for f in sorted(SITE.rglob("*.html")):
        rel = f.relative_to(SITE)
        if rel.name in EXCLUDE_NAMES:
            continue
        if rel.parts[0] in EXCLUDE_DIRS or "github-demos" in rel.parts:
            continue
        html = read(f)
        if re.search(r'name="robots"[^>]*noindex', html):
            continue
        clean = "/" + str(rel).replace("\\", "/")
        clean = clean[: -len("index.html")] if clean.endswith("/index.html") else clean[: -len(".html")]
        urls.append(BASE + clean)
    return sorted(set(urls))


def rebuild_sitemap(urls: list[str]) -> None:
    body = "\n".join(f"  <url><loc>{u}</loc></url>" for u in urls)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{body}\n"
        "</urlset>\n"
    )
    write(SITE / "sitemap.xml", xml)
    print(f"sitemap.xml: {len(urls)} URL:er")


def update_llms(urls: list[str]) -> None:
    p = SITE / "llms.txt"
    text = read(p)
    if "lokal-seo-stockholm" in text:
        print("llms.txt: klustersidor finns redan")
        return
    city_lines = "\n".join(
        f"- [Lokal SEO {name}]({BASE}/tjanster/lokal-seo-{slug}): Lokal SEO för företag i {name} och närområdet."
        for slug, name in CITIES
    )
    branch_lines = "\n".join(
        f"- [AI-receptionist för {name}]({BASE}/tjanster/ai-receptionist-{slug}): AI-telefonist som svarar kunder i {name}-branschen dygnet runt."
        for slug, name in BRANCHES
    )
    block = (
        "\n## Lokal SEO per stad\n"
        f"{city_lines}\n"
        "\n## AI-receptionist per bransch\n"
        f"{branch_lines}\n"
        f"- [AI receptionist pris]({BASE}/tjanster/ai-receptionist-pris): Vad en AI-receptionist kostar per månad och vad som ingår.\n"
    )
    text = text.replace("\n## Priser", block + "\n## Priser", 1)

    if "## Guider" not in text:
        guides = []
        if (SITE / "guider" / "vad-kostar-en-hemsida.html").exists():
            guides.append(
                f"- [Vad kostar en hemsida?]({BASE}/guider/vad-kostar-en-hemsida): Priser, paket och löpande kostnader förklarade."
            )
        if (SITE / "guider" / "lokal-seo-guide.html").exists():
            guides.append(
                f"- [Lokal SEO-guide]({BASE}/guider/lokal-seo-guide): Sju steg för att ranka lokalt med hemsida och Google Business Profile."
            )
        if guides:
            text += "\n## Guider\n" + "\n".join(guides) + "\n"

    text = re.sub(r"\n{3,}", "\n\n", text)
    write(p, text)
    print("llms.txt: uppdaterad")


def card_grid(title: str, items: list[tuple[str, str, str]], href_prefix: str = "") -> str:
    cards = []
    for href, heading, body in items:
        cards.append(
            f'        <article class="feature-card">\n'
            f'          <h3><a href="{href_prefix}{href}">{heading}</a></h3>\n'
            f"          <p>{body}</p>\n"
            f"        </article>"
        )
    return (
        '  <section class="section">\n'
        '    <div class="container">\n'
        '      <div class="section-head">\n'
        f'        <span class="eyebrow">RELATERADE SIDOR</span>\n'
        f'        <h2 class="section-title">{title}</h2>\n'
        "      </div>\n"
        '      <div class="grid grid--3">\n' + "\n".join(cards) + "\n      </div>\n"
        "    </div>\n"
        "  </section>\n\n"
    )


def add_pillar_links() -> None:
    # lokal-seo -> stadssidor
    p = SITE / "tjanster" / "lokal-seo.html"
    html = read(p)
    if "lokal-seo-city-links" not in html:
        items = [
            (f"lokal-seo-{slug}", f"Lokal SEO {name}", f"Syns på lokala sökningar för företag i {name} och närområdet.")
            for slug, name in CITIES
            if (SITE / "tjanster" / f"lokal-seo-{slug}.html").exists()
        ]
        if items:
            block = card_grid("Lokal SEO i din <span class=\"accent\">stad</span>", items)
            block = block.replace('<section class="section">', '<section class="section" id="lokal-seo-city-links">', 1)
            html = html.replace("\n  <!-- CTA -->", block + "  <!-- CTA -->", 1)
            write(p, html)
            print(f"lokal-seo.html: {len(items)} stadslänkar")
    else:
        print("lokal-seo.html: stadslänkar finns redan")

    # ai-receptionist -> branschsidor + pris
    p = SITE / "tjanster" / "ai-receptionist.html"
    html = read(p)
    if "ai-receptionist-branch-links" not in html:
        items = [("ai-receptionist-pris", "Vad kostar en AI-receptionist?", "Paket, samtaltimmar och jämförelse mot att anställa.")]
        items += [
            (f"ai-receptionist-{slug}", f"AI-receptionist för {name.lower()}", f"Svarar på samtal och bokar tider i {name.lower()}-branschen, dygnet runt.")
            for slug, name in BRANCHES
            if (SITE / "tjanster" / f"ai-receptionist-{slug}.html").exists()
        ]
        block = card_grid("AI-receptionist per <span class=\"accent\">bransch</span>", items)
        block = block.replace('<section class="section">', '<section class="section" id="ai-receptionist-branch-links">', 1)
        html = html.replace("\n  <!-- CTA -->", block + "  <!-- CTA -->", 1)
        write(p, html)
        print(f"ai-receptionist.html: {len(items)} branschlänkar")
    else:
        print("ai-receptionist.html: branschlänkar finns redan")


def add_city_crosslinks() -> None:
    """Ortssidorna (hemsida-<stad>) länkar till lokal-seo-<stad>."""
    added = 0
    for slug, name in CITIES:
        ort = SITE / f"hemsida-{slug}.html"
        target = SITE / "tjanster" / f"lokal-seo-{slug}.html"
        if not (ort.exists() and target.exists()):
            continue
        html = read(ort)
        if f"lokal-seo-{slug}" in html:
            continue
        block = (
            f'  <section class="section" id="lokal-seo-korslank-{slug}">\n'
            '    <div class="container">\n'
            '      <div class="callout" style="max-width:820px;margin:0 auto">\n'
            f"        <p><strong>Vill du synas i {name} och inte bara ha en hemsida?</strong> "
            f'Vi bygger in <a href="tjanster/lokal-seo-{slug}">lokal SEO för {name}</a> i sajten, så du rankar på '
            f"sökningar som ”hemsida {name.lower()}”, din tjänst + staden och ”nära mig”. "
            f'Läs mer om <a href="tjanster/lokal-seo">lokal SEO</a> eller <a href="starta-projekt">starta ett projekt</a>.</p>\n'
            "      </div>\n"
            "    </div>\n"
            "  </section>\n\n"
        )
        marker = "\n<footer"
        if marker not in html:
            continue
        html = html.replace(marker, "\n" + block + marker, 1)
        write(ort, html)
        added += 1
    print(f"ortssidor: {added} korslänkar tillagda")


def add_guide_links() -> None:
    """Länkar guidessidorna från relevanta sidor så de inte blir föräldralösa."""
    targets = [
        (
            SITE / "tjanster" / "lokal-seo.html",
            "<!-- CTA -->",
            '  <section class="section section--mist" id="lokal-seo-guide-lank">\n'
            '    <div class="container">\n'
            '      <div class="callout" style="max-width:820px;margin:0 auto">\n'
            "        <strong>Guide: lokal SEO i sju steg</strong>\n"
            "        <p>Vill du förstå hur lokal SEO faktiskt fungerar innan du beställer? Vi har skrivit en praktisk guide om sökord, "
            "Google Business Profile, recensioner och teknik – i sju steg.</p>\n"
            '        <p><a href="../guider/lokal-seo-guide">Läs lokal SEO-guiden →</a></p>\n'
            "      </div>\n"
            "    </div>\n"
            "  </section>\n\n",
            "../guider/lokal-seo-guide",
        ),
        (
            SITE / "tjanster" / "hemsidor.html",
            "<footer",
            '  <section class="section section--mist" id="hemsida-kostnad-guide">\n'
            '    <div class="container">\n'
            '      <div class="callout" style="max-width:820px;margin:0 auto">\n'
            "        <strong>Vad kostar en hemsida egentligen?</strong>\n"
            "        <p>Vi har brutit ner priserna: vad som ingår i paketen, vilka löpande kostnader som tillkommer och vad som driver upp priset. "
            "Läs den innan du jämför offerter.</p>\n"
            '        <p><a href="../guider/vad-kostar-en-hemsida">Läs prisguiden →</a></p>\n'
            "      </div>\n"
            "    </div>\n"
            "  </section>\n\n",
            "../guider/vad-kostar-en-hemsida",
        ),
        (
            SITE / "priser.html",
            "<footer",
            '  <section class="section" id="prisguide-lank">\n'
            '    <div class="container">\n'
            '      <div class="callout" style="max-width:820px;margin:0 auto">\n'
            "        <strong>Osäker på vilket paket som passar?</strong>\n"
            "        <p>Guidens genomgång av hemsidepriser 2026 visar vad som faktiskt ingår i 15 000-, 30 000- och 60 000-kronorspaketen – "
            "och vilka frågor du bör ställa till vilken webbyrå som helst.</p>\n"
            '        <p><a href="guider/vad-kostar-en-hemsida">Läs prisguiden →</a></p>\n'
            "      </div>\n"
            "    </div>\n"
            "  </section>\n\n",
            "guider/vad-kostar-en-hemsida",
        ),
    ]
    for path, marker, block, needle in targets:
        if not (SITE / "guider" / "lokal-seo-guide.html").exists():
            continue
        if not path.exists():
            continue
        html = read(path)
        if needle in html:
            continue
        if marker == "<!-- CTA -->":
            html = html.replace("\n  " + marker, "\n" + block + "  " + marker, 1)
        else:
            html = html.replace("\n" + marker, "\n" + block + marker, 1)
        write(path, html)
        print(f"{path.relative_to(ROOT)}: guidelänk tillagd")


if __name__ == "__main__":
    urls = public_pages()
    missing = [
        f"/tjanster/lokal-seo-{slug}" for slug, _ in CITIES if f"{BASE}/tjanster/lokal-seo-{slug}" not in urls
    ] + [
        f"/tjanster/ai-receptionist-{slug}" for slug, _ in BRANCHES if f"{BASE}/tjanster/ai-receptionist-{slug}" not in urls
    ] + [f"{BASE}/tjanster/ai-receptionist-pris" for _ in [0] if f"{BASE}/tjanster/ai-receptionist-pris" not in urls]
    if missing:
        print("VARNING: saknade sidor (byggs inte in):", *missing, sep="\n  ")
    update_llms(urls)
    add_pillar_links()
    add_city_crosslinks()
    add_guide_links()
    urls = public_pages()
    rebuild_sitemap(urls)
    print("klart")
