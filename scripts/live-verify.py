#!/usr/bin/env python3
"""Live-verifiering av webbtjanst.com efter deploy.

  python3 scripts/live-verify.py                 # HTTP-kontroll av alla publika URL:er
  python3 scripts/live-verify.py --render        # + Playwright-rendering desktop/mobil

HTTP: status, titel, canonical, H1, ordantal, .html-läckage.
Render: horisontell overflow, header/nav, antal sektioner, konsolfel. För /boka-mote
kontrolleras även bokningswidgeten (person-knappar + inbäddade kalendrar).
"""
from __future__ import annotations

import json
import re
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = "https://www.webbtjanst.com"
KEY_PAGES = [
    "/",
    "/tjanster",
    "/tjanster/lokal-seo",
    "/tjanster/ai-receptionist",
    "/tjanster/ai-receptionist-pris",
    "/tjanster/lokal-seo-stockholm",
    "/tjanster/lokal-seo-goteborg",
    "/tjanster/lokal-seo-malmo",
    "/tjanster/lokal-seo-uppsala",
    "/tjanster/lokal-seo-vasteras",
    "/tjanster/lokal-seo-orebro",
    "/tjanster/ai-receptionist-rormokare",
    "/tjanster/ai-receptionist-elektriker",
    "/tjanster/ai-receptionist-hantverkare",
    "/tjanster/ai-receptionist-bilverkstad",
    "/tjanster/ai-receptionist-tandlakare",
    "/tjanster/ai-receptionist-frisor",
    "/boka-mote",
    "/github-demos/index.html",
    "/sitemap.xml",
    "/robots.txt",
]

CTX = ssl.create_default_context()
UA = "Mozilla/5.0 (compatible; WebbtjanstVerify/1.0)"


def fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=25, context=CTX) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001
        return 0, str(exc)


def http_check(sitemap_urls: list[str]) -> list[str]:
    problems = []
    for path in KEY_PAGES:
        url = BASE + path
        status, body = fetch(url)
        if status != 200:
            problems.append(f"{path}: HTTP {status}")
            print(f"{path:45} HTTP {status}")
            continue
        if path.endswith((".xml", ".txt")):
            print(f"{path:45} HTTP {status} ({len(body)} byte)")
            continue
        title = re.search(r"<title>(.*?)</title>", body, re.S)
        canon = re.search(r'rel="canonical" href="([^"]+)"', body)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.S)
        noindex = bool(re.search(r'name="robots"[^>]*noindex', body))
        body_text = re.sub(r"<script.*?</script>", " ", body, flags=re.S)
        body_text = re.sub(r"<[^>]+>", " ", body_text)
        words = len(body_text.split())
        leaked = [u for u in re.findall(r'href="([^"]*\.html[^"]*)"', body) if not u.startswith("http")]
        print(
            f"{path:45} HTTP {status} | {words:4d} ord | noindex={noindex} | "
            f"canonical={(canon.group(1) if canon else '-').replace(BASE, '')} | "
            f"h1={(re.sub('<[^>]+>', '', h1.group(1)).strip()[:42] if h1 else '-')}"
        )
        if not title:
            problems.append(f"{path}: ingen title")
        if not canon:
            problems.append(f"{path}: ingen canonical")
        if words < 200 and not path.startswith("/github-demos"):
            problems.append(f"{path}: bara {words} ord")
        if leaked:
            problems.append(f"{path}: .html-länk i HTML {leaked[:2]}")
    print(f"\nsitemap: {len(sitemap_urls)} URL:er")
    return problems


def render_check() -> list[str]:
    from playwright.sync_api import sync_playwright

    problems = []
    targets = ["/", "/tjanster/lokal-seo", "/tjanster/lokal-seo-stockholm", "/tjanster/ai-receptionist-pris", "/boka-mote"]
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for path in targets:
            for label, width, height in (("desktop", 1440, 900), ("mobil", 375, 812)):
                page = browser.new_page(viewport={"width": width, "height": height})
                console: list[str] = []
                page.on("console", lambda msg, c=console: c.append(f"{msg.type}: {msg.text}") if msg.type == "error" else None)
                page.goto(BASE + path, wait_until="load", timeout=45000)
                stats = page.evaluate(
                    """() => ({
                        overflow: document.documentElement.scrollWidth - window.innerWidth,
                        sections: document.querySelectorAll('main section').length,
                        nav: !!document.querySelector('.site-nav'),
                        h1: (document.querySelector('h1')||{}).innerText || '',
                        faq: document.querySelectorAll('details.faq-item').length,
                        ld: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s=>{try{return JSON.parse(s.textContent)['@type']}catch(e){return 'PARSE_FEL'}}),
                        people: document.querySelectorAll('[data-booking-person]').length,
                        iframes: document.querySelectorAll('iframe.booking-frame').length
                    })"""
                )
                flag = ""
                if stats["overflow"] > 4:
                    flag += f" OVERFLOW+{stats['overflow']}px"
                    problems.append(f"{path} {label}: horisontell overflow {stats['overflow']}px")
                if not stats["nav"]:
                    flag += " INGEN-NAV"
                    problems.append(f"{path} {label}: navigering saknas")
                if stats["sections"] < 3:
                    flag += " FÅ-SEKTIONER"
                    problems.append(f"{path} {label}: bara {stats['sections']} sektioner")
                if "PARSE_FEL" in stats["ld"]:
                    problems.append(f"{path} {label}: JSON-LD går inte att parsa i webbläsaren")
                if path == "/boka-mote" and (stats["people"] != 2 or stats["iframes"] < 2):
                    problems.append(f"{path} {label}: bokningswidget trasig (personer={stats['people']}, iframes={stats['iframes']})")
                if console:
                    flag += f" KONSOLFEL={len(console)}"
                    problems.append(f"{path} {label}: konsolfel {console[:2]}")
                print(
                    f"{path:34} {label:7} sektioner={stats['sections']:2d} faq={stats['faq']:2d} "
                    f"ld={stats['ld']} overflow={stats['overflow']}{flag}"
                )
                page.close()
        browser.close()
    return problems


if __name__ == "__main__":
    status, sitemap = fetch(BASE + "/sitemap.xml")
    urls = re.findall(r"<loc>([^<]+)</loc>", sitemap) if status == 200 else []
    problems = http_check(urls)
    if "--render" in sys.argv:
        print("\n--- rendering ---")
        problems += render_check()
    print(f"\nPROBLEM: {len(problems)}")
    for p in problems:
        print("  ✗", p)
    raise SystemExit(1 if problems else 0)
