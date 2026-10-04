#!/usr/bin/env python3
"""Webbtjänst — on-page SEO-fixar (2026-10-04).

Kör i repo-roten (katalogen som innehåller site/):
  python3 scripts/webbtjanst-seo-onpage.py

Steg 1: /github-demos/index.html  -> noindex, follow + titel + beskrivning
Steg 2: /boka-mote.html           -> innehållssektioner + FAQ (telefonmöte-intent) + FAQPage-schema
Steg 3: /tjanster/lokal-seo.html  -> lokal-SEO-innehåll + FAQ-utökning + FAQPage-schema + tydligare H1
Steg 4: /tjanster/ai-receptionist.html -> pris-FAQ + FAQPage-schema
Inga .html-länkar, inga ändrade kontaktuppgifter (telefon/e-post återanvänds ordagrant från filen).
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


def read(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8")


def write(p: pathlib.Path, text: str) -> None:
    p.write_text(text, encoding="utf-8")
    print("skrev", p.relative_to(ROOT), len(text), "tecken")


def contact_strings(html: str) -> tuple[str, str, str]:
    """Plocka telefon-href, telefontext och e-post ur den befintliga sidan."""
    tel_href = re.search(r'href="(tel:[^"]+)"', html)
    tel_text = re.search(r'href="tel:[^"]+">([^<]+)</a>', html)
    mail = re.search(r'href="(mailto:[^"]+)"', html)
    if not (tel_href and tel_text and mail):
        raise SystemExit("kunde inte hitta kontaktuppgifter i sidan")
    return tel_href.group(1), tel_text.group(1), mail.group(1)


def faq_jsonld(blocks: list[tuple[str, str]]) -> str:
    main = []
    for q, a in blocks:
        main.append(
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
        )
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": main,
    }
    return (
        '<script type="application/ld+json">\n'
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + "\n</script>\n"
    )


def strip_tags(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", " ", fragment)
    text = re.sub(r"\s+", " ", text)
    return (
        text.replace("&amp;", "&")
        .replace("&nbsp;", " ")
        .replace("&ouml;", "ö")
        .replace("&auml;", "ä")
        .replace("&aring;", "å")
        .strip()
    )


def parse_faq(html: str, main_html: str) -> list[tuple[str, str]]:
    out = []
    for m in re.finditer(
        r'<details class="faq-item">\s*<summary>(.*?)</summary>\s*<div class="faq-body">(.*?)</div>\s*</details>',
        main_html,
        re.S,
    ):
        out.append((strip_tags(m.group(1)), strip_tags(m.group(2))))
    return out


# ---------------------------------------------------------------- steg 1
def fix_github_demos() -> None:
    p = SITE / "github-demos" / "index.html"
    html = read(p)
    if 'name="robots"' in html:
        print("github-demos: noindex finns redan")
        return
    html = html.replace(
        '    <title>Webbtjänst | Hemsidor på 24-48 Timmar</title>',
        '    <meta name="robots" content="noindex, follow" />\n'
        '    <title>Demogalleri – interaktiva exempel | Webbtjänst</title>\n'
        '    <meta name="description" content="Internt demogalleri med Webbtjänsts hemsidemallar. Sidan är endast ett visningsexempel och ska inte indexeras separat." />',
        1,
    )
    if 'name="robots"' not in html:
        # titeln hade annan form: lägg meta först i head
        html = html.replace(
            "</head>",
            '  <meta name="robots" content="noindex, follow" />\n</head>',
            1,
        )
    write(p, html)


# ---------------------------------------------------------------- steg 2
def fix_boka_mote() -> None:
    p = SITE / "boka-mote.html"
    html = read(p)
    if "booking-seo-faq" in html:
        print("boka-mote: innehåll finns redan")
        return
    tel_href, tel_text, mailto = contact_strings(html)

    html = html.replace(
        "<title>Boka telefonmöte | Webbtjänst</title>",
        "<title>Boka telefonmöte – kostnadsfritt 30 min | Webbtjänst</title>",
        1,
    )
    html = re.sub(
        r'<meta name="description" content="[^"]*">',
        '<meta name="description" content="Boka ett kostnadsfritt telefonmöte på 30 minuter med Webbtjänst. '
        'Välj ledig kvällstid, berätta kort vad du behöver och vi ringer upp. Tider från 17:00.">',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta property="og:title" content="[^"]*">',
        '<meta property="og:title" content="Boka telefonmöte – kostnadsfritt 30 min | Webbtjänst">',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta property="og:description" content="[^"]*">',
        '<meta property="og:description" content="Välj en ledig kvällstid och berätta kort vad du vill få hjälp med. Vi ringer upp dig.">',
        html,
        count=1,
    )

    faq = [
        (
            "Vad är ett telefonmöte hos Webbtjänst?",
            "Ett telefonmöte är ett kostnadsfritt första samtal på 30 minuter där vi går igenom vad du behöver, "
            "vad det kostar och hur snabbt du kan vara live. Du behöver inte förbereda något särskilt.",
        ),
        (
            "Kostar mötet något?",
            "Nej. Telefonmötet är kostnadsfritt och du förbinder dig inte till något. Du får en offert efteråt om du vill gå vidare.",
        ),
        (
            "När kan jag boka en tid?",
            "Vi har lediga telefonmöten dagligen från klockan 17:00, i 30-minuterspass. Du kan boka med minst en timmes framförhållning och upp till 60 dagar framåt.",
        ),
        (
            "Vad behöver jag berätta innan mötet?",
            "Namn, företag, telefonnummer och e-post räcker, plus en kort rad om vad du vill få hjälp med. Då kan vi förbereda oss på ditt läge.",
        ),
        (
            "Kan jag avboka eller flytta tiden?",
            f"Ja. Använd länken i bekräftelsen från Google, eller ring {tel_text} så flyttar vi tiden åt dig.",
        ),
    ]
    faq_html = "\n".join(
        f'        <details class="faq-item">\n          <summary>{q}</summary>\n'
        f'          <div class="faq-body">\n            <p>{a}</p>\n          </div>\n        </details>'
        for q, a in faq
    )

    section = f"""
  <section class="section" id="booking-seo-faq">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">SÅ FUNGERAR MÖTET</span>
        <h2 class="section-title">Från bokning till <span class="accent">offert</span></h2>
        <p class="lede">Ett telefonmöte räcker för att du ska veta vad din hemsida kostar, vad den innehåller och när den kan vara live.</p>
      </div>
      <ol class="timeline" style="max-width:760px;margin:0 auto">
        <li class="tl-item">
          <span class="tl-time">Strax efter bokning</span>
          <h3>Bekräftelse</h3>
          <p>Du får en bekräftelse med tid och telefonnummer. Vill du flytta tiden gör du det direkt i bekräftelsen.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">I mötet</span>
          <h3>30 minuter om ditt läge</h3>
          <p>Vi pratar om din verksamhet, dina kunder och vad du vill uppnå. Vi visar exempel på sidor vi byggt för liknande företag.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Efter mötet</span>
          <h3>Fast pris och nästa steg</h3>
          <p>Du får ett fast pris och ett förslag på paket – utan bindning. Vill du starta skickar du in formuläret och är live inom 24–48 timmar.</p>
        </li>
      </ol>
      <div class="callout" style="max-width:760px;margin:24px auto 0">
        <p><strong>Vill du hellre börja direkt?</strong> Fyll i <a href="starta-projekt">starta projekt</a> så återkommer vi inom 1 arbetsdag, eller ring
        <a href="{tel_href}">{tel_text}</a>. Du kan också läsa mer om <a href="tjanster/lokal-seo">lokal SEO</a> och
        <a href="tjanster/ai-receptionist">AI-receptionist</a> innan vi pratar.</p>
      </div>
    </div>
  </section>

  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">FAQ</span>
        <h2 class="section-title">Vanliga frågor om <span class="accent">telefonmötet</span></h2>
      </div>
      <div class="faq-list">
{faq_html}
      </div>
    </div>
  </section>

{faq_jsonld(faq)}"""
    html = html.replace("\n</main>", section + "\n</main>", 1)
    write(p, html)


# ---------------------------------------------------------------- steg 3
def fix_lokal_seo() -> None:
    p = SITE / "tjanster" / "lokal-seo.html"
    html = read(p)
    if "lokal-seo-intro-extra" in html:
        print("lokal-seo: innehåll finns redan")
        return
    tel_href, tel_text, _ = contact_strings(html)

    html = html.replace(
        "<h1>Syns när kunder söker i din <span class=\"accent\">stad</span></h1>",
        "<h1>Lokal SEO – syns när kunder söker i din <span class=\"accent\">stad</span></h1>",
        1,
    )

    faq = [
        (
            "Vad kostar lokal SEO?",
            "Lokal SEO byggs in i din hemsida och kostar från 15 000 kr i engångsavgift. Tillväxt med lokal SEO på fem sökord och sökords-sidor för din stad ligger på 30 000 kr, och Premium med tio sökord och hela regionen på 60 000 kr. Vill du fortsätta växa efteråt finns underhåll från 1 200 kr/mån.",
        ),
        (
            "Vad är skillnaden mellan lokal SEO och vanlig SEO?",
            "Vanlig SEO tävlar om hela Sverige och tar lång tid. Lokal SEO tävlar om din stad och ditt närområde – betydligt färre konkurrenter, och kunden är oftast redo att boka. Du behöver vanlig SEO också för kärnsidorna, men lokal SEO ger snabbare resultat.",
        ),
        (
            "Behöver jag Google Ads också?",
            "Inte nödvändigtvis. Ads ger klick direkt men kostar pengar varje månad och försvinner när du slutar betala. Lokal SEO bygger värde som blir kvar. Många kör Ads på de få sökord där de snabbast vill ha kunder och lokal SEO parallellt.",
        ),
        (
            "Hur många sökord kan jag ranka på?",
            "Vi bygger mot sökord med dokumenterad sökvolym i din region. Tillväxt täcker fem sökord, Premium tio. Det är antalet sökord vi aktivt bygger sidor mot – sedan rankar sidorna ofta på många fler varianter av samma sökning.",
        ),
    ]
    faq_html = "\n".join(
        f'        <details class="faq-item">\n          <summary>{q}</summary>\n'
        f'          <div class="faq-body">\n            <p>{a}</p>\n          </div>\n        </details>'
        for q, a in faq
    )

    extra = f"""
  <!-- SÅ SÖKER KUNDER -->
  <section class="section" id="lokal-seo-intro-extra">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">SÅ SÖKER KUNDER</span>
        <h2 class="section-title">Tre sökningar som avgör om du <span class="accent">får jobbet</span></h2>
        <p class="lede">De flesta lokala tjänsteföretag förlorar kunder i samma tre sökningar. Vi bygger sidor för alla tre.</p>
      </div>
      <div class="grid grid--3">
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
          <h3>Tjänst + stad</h3>
          <p>”Rörmokare Stockholm”, ”elektriker Uppsala”, ”städfirma Malmö”. Den som söker så här har redan bestämt sig – den vill bara hitta rätt företag. Det här är sökningarna som ger jobb.</p>
        </article>
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg></span>
          <h3>Nära mig</h3>
          <p>”Rörmokare nära mig” är en kartsökning. Här avgör din Google Business Profile – rätt kategori, rätt område och nya recensioner. Vi kopplar profilen till hemsidan.</p>
        </article>
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6 6.4.8-4.6 4.3 1.2 6.3L12 17.8 6.4 20l1.2-6.3L3 9.4l6.4-.8z"/></svg></span>
          <h3>Förtroende-sökningar</h3>
          <p>”Bra snickare i Västerås”, ”omdömen målare Örebro”, ”vad kostar en städfirma”. Här vinner den som visar priser, omdömen och tydliga svar – inte den som skriver mest.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- LOKAL SEO FÖR HANTVERKARE -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">FÖR DIG SOM JOBVAR</span>
        <h2 class="section-title">Lokal SEO för hantverkare och <span class="accent">serviceföretag</span></h2>
      </div>
      <div class="grid grid--2">
        <div>
          <p>Ett lokalt serviceföretag behöver inte synas i hela Sverige – det behöver synas i området man faktiskt kör till. Därför bygger vi sidor per tjänst och område i stället för en enda sida som försöker täcka allt: ”hemsida för rörmokare”, ”rörjour i Uppsala”, ”akuta läckor Södermalm”.</p>
          <p>Varje sida har ett tydligt uppdrag: titel, rubrik, text och frågor som matchar exakt det kunden skriver. Google matchar då sidan mot sökningen i stället för att gissa – och du slipper konkurrera med rikstäckande portaler om de dyraste orden.</p>
          <p>Det gör också att du kan mäta: du ser vilka sökord som ger visningar, vilka sidor som får klick och vilka som behöver byggas om. Det är samma siffror du får i månadsrapporten.</p>
        </div>
        <aside class="callout">
          <strong>Exempel på vad vi bygger mot</strong>
          <p>”rörmokare Stockholm”, ”eljour nära mig”, ”frisör centrum”, ”akut låsöppning”, ”städfirma kontor”, ”takfirma ombesiktning”. Vi väljer sökord efter volym och efter hur nära köp kunden är.</p>
          <p><a href="../starta-projekt">Starta projekt →</a></p>
        </aside>
      </div>
    </div>
  </section>

  <!-- FAQ-EXTRA -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">MER OM LOKAL SEO</span>
        <h2 class="section-title">Pris, skillnader och <span class="accent">förväntningar</span></h2>
      </div>
      <div class="faq-list">
{faq_html}
      </div>
    </div>
  </section>
""".replace("{STAD_PLACEHOLDER}", "Stockholm")

    # lägg in de nya sektionerna före sista CTA-sektionen i <main>
    marker = "\n  <!-- CTA -->"
    if marker not in html:
        raise SystemExit("hittade inte CTA-sektionen i lokal-seo.html")
    html = html.replace(marker, extra + marker, 1)

    # FAQPage-schema för samtliga FAQ på sidan (befintliga + nya)
    main_html = html.split("<main>", 1)[1].split("</main>", 1)[0]
    blocks = parse_faq(html, main_html)
    if len(blocks) < 6:
        raise SystemExit(f"för få FAQ-block hittade: {len(blocks)}")
    html = html.replace("</main>", faq_jsonld(blocks) + "\n</main>", 1)
    write(p, html)


# ---------------------------------------------------------------- steg 4
def fix_ai_receptionist() -> None:
    p = SITE / "tjanster" / "ai-receptionist.html"
    html = read(p)
    if "ai-receptionist-pris-faq" in html:
        print("ai-receptionist: innehåll finns redan")
        return

    faq = [
        (
            "Vad kostar en AI-receptionist?",
            "Start kostar 3 500 kr per månad och omfattar 8 samtaltimmar. Tillväxt kostar 8 500 kr per månad med 20 timmar och kvalificering av kunder, och Premium 24 800 kr per månad med 60 timmar, anpassad röst och månadsrapport. Alla paket inkluderar träning på din bransch och en sammanfattning av varje samtal.",
        ),
        (
            "Blir det billigare än att anställa en receptionist?",
            "En heltidsanställd receptionist eller telefonist kostar i Sverige betydligt mer per månad när lön, arbetsgivaravgifter, semester och tid går in i kalkylen – och svarar ändå bara kontorstid. Våra paket börjar på 3 500 kr per månad och svarar dygnet runt.",
        ),
        (
            "Vad händer om jag pratar mer än timmarna i paketet?",
            "Du kan byta paket eller lägga till extra timmar när samtalsvolymen växer. Du betalar bara för det du använder, och vi säger till i god tid innan du närmar dig taket.",
        ),
        (
            "Ingår telefonnumer och uppsägning?",
            "Du behöver inget eget telefonisystem – vi kopplar AI:n till ditt nummer. Avtalet löper månadsvis och du kan säga upp det när du vill.",
        ),
    ]
    faq_html = "\n".join(
        f'        <details class="faq-item">\n          <summary>{q}</summary>\n'
        f'          <div class="faq-body">\n            <p>{a}</p>\n          </div>\n        </details>'
        for q, a in faq
    )

    block = f"""
  <section class="section" id="ai-receptionist-pris-faq">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">PRIS OCH FRÅGOR</span>
        <h2 class="section-title">Vad kostar en <span class="accent">AI-receptionist</span>?</h2>
        <p class="lede">Fasta månadspriser, ingen startkostnad och ingen bindningstid. Timmarna i paketet är samtaltimmar – räcker de inte byter du paket.</p>
      </div>
      <div class="faq-list">
{faq_html}
      </div>
    </div>
  </section>

{faq_jsonld(faq)}"""
    html = html.replace("\n</main>", block + "\n</main>", 1)
    write(p, html)


if __name__ == "__main__":
    fix_github_demos()
    fix_boka_mote()
    fix_lokal_seo()
    fix_ai_receptionist()
    print("klart")
