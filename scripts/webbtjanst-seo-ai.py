#!/usr/bin/env python3
"""Genererar AI-receptionist-sidor för webbtjanst.com (pris + sex branscher).

  python3 scripts/webbtjanst-seo-ai.py

Skal kopieras ordagrant från site/tjanster/ai-receptionist.html; endast
<main>-innehållet och title/description/canonical/og byggs per sida.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
BASE = "https://www.webbtjanst.com"
TEMPLATE = SITE / "tjanster" / "ai-receptionist.html"

SHARED_FAQ = [
    ("Låter AI:n som en människa?",
     "Rösten är naturlig och svarar på svenska. Kunden får veta att den pratar med företagets digitala receptionist, så ingen blir lurad – upplevelsen är fortfarande snabb och trevlig."),
    ("Vad händer om AI:n inte kan svara?",
     "Den gissar aldrig. Samtalet kopplas vidare till dig eller en kollega, eller så tar AI:n ett meddelande och skickar en sammanfattning till dig med namn, nummer och vad kunden ville."),
]

BRANCHES = [
    {
        "slug": "rormokare",
        "name": "rörmokare",
        "label": "Rörmokare",
        "scenario": "Vattenläckan kommer sällan kontorstid. Ringer kunden 19:40 och ingen svarar, ringer hen nästa rörmokare i listan – och du får aldrig veta att du förlorade jobbet.",
        "promise": "AI-receptionisten svarar på jourfrågor, tar adress och ärendebeskrivning och bokar in besiktning eller åtgärd i din kalender – medan du fortfarande ligger under diskbänken.",
        "questions": [
            "”Kan ni komma i kväll?”",
            "”Vad kostar det att laga en läckande kran?”",
            "”Har ni jour på helger?”",
            "”Kan jag få ROT-avdrag?”",
        ],
        "faq": [
            ("Kan AI:n hantera akuta jourärenden?",
             "Ja. AI:n ställer frågorna som avgör hur akut det är – var läcker det, hur mycket, finns det elnära vatten – och bokar eller vidarekopplar utifrån dina regler. Akuta ärenden når dig direkt."),
            ("Kan den svara på pris per timme?",
             "Ja, du anger vilka priser AI:n får säga. Den kan till exempel ge timpris, förklara att resa tillkommer och att fast pris ges efter besiktning. Den hittar aldrig på en siffra."),
            ("Kan den ta hand om ROT-frågor?",
             "Ja. AI:n kan förklara att du gör ROT-avdraget direkt på fakturan och be om personnummer när bokningen görs, så att underlaget är klart."),
        ],
    },
    {
        "slug": "elektriker",
        "name": "elektriker",
        "label": "Elektriker",
        "scenario": "Elfel, proppskåp som löser ut och laddboxar som ska installeras. Kunden ringer medan du står med händerna i en central – och lägger på när ingen svarar.",
        "promise": "AI:n tar emot ärendet, frågar om det är akut eller kan vänta, och bokar tiden direkt i kalendern. Du får en sammanfattning i stället för en röstbrevlåda ingen lyssnar på.",
        "questions": [
            "”Kan ni komma i morgon?”",
            "”Vad kostar en laddbox installerad?”",
            "”Varför löser jordfelsbrytaren ut hela tiden?”",
            "”Har ni jour på helger?”",
        ],
        "faq": [
            ("Kan AI:n skilja på akut elfel och bokningsbara jobb?",
             "Ja. Du bestämmer vilka frågor som betyder akut – till exempel rök, bränd lukt eller helt strömlöst – och då kopplas samtalet vidare till dig direkt. Allt annat bokas in som vanligt arbete."),
            ("Kan den förklara priser för laddboxar?",
             "AI:n kan ge dina priser, förklara vad som ingår och att priset beror på kabeldragning, samt be om adress och elcentralens ålder så att du kan lämna fast pris."),
            ("Fungerar det när vi är flera elektriker i firman?",
             "Ja. AI:n kan koppla till rätt person, boka i rätt kalender och lämna ett meddelande om ingen är ledig. Alla samtal sammanfattas så att inget faller mellan stolarna."),
        ],
    },
    {
        "slug": "hantverkare",
        "name": "hantverkare",
        "label": "Hantverkare",
        "scenario": "Du står på en arbetsplats hela dagen. Offertförfrågningarna som kommer in på förmiddagen blir liggande till kvällen – och då har kunden redan skrivit till någon annan.",
        "promise": "AI:n tar emot förfrågan, frågar om jobbet, ytan och tidsramen, och bokar in ett platsbesök. När du kommer hem ligger dagens leads färdiga i stället för i en röstbrevlåda.",
        "questions": [
            "”Kan ni bygga altan i sommar?”",
            "”Vad tar ni per timme?”",
            "”När kan ni komma och titta?”",
            "”Ger ni fast pris?”",
        ],
        "faq": [
            ("Kan AI:n ta emot offertförfrågningar?",
             "Ja. Den frågar vad jobbet gäller, ungefärlig storlek, var det ligger och när kunden vill ha det gjort, och bokar ett platsbesök. Du får allt samlat i en sammanfattning."),
            ("Vad händer med jobb vi inte vill ta?",
             "Du bestämmer vilka områden, jobbtyper eller storlekar AI:n ska tacka nej till. Den tackar artigt nej och hänvisar vidare i stället för att lova något du inte håller."),
            ("Kan den svara på frågor om ROT-avdrag?",
             "Ja. AI:n förklarar hur avdraget funkar och att du gör det direkt på fakturan, och kan be om uppgifterna som behövs för bokningen."),
        ],
    },
    {
        "slug": "bilverkstad",
        "name": "bilverkstad",
        "label": "Bilverkstad",
        "scenario": "Kunderna ringer för att boka service när du har bilar på lyftarna. Missade samtal blir ofta en bokning hos verkstaden i nästa kvarter – utan att du märker det.",
        "promise": "AI:n bokar service, däckbyte och felsökning direkt i kalendern, svarar på prisfrågor och säger till om lånebil – dygnet runt, även när verkstaden är stängd.",
        "questions": [
            "”Har ni tid för service nästa vecka?”",
            "”Vad kostar en stor service?”",
            "”Kan jag få lånebil?”",
            "”Byter ni däck utan bokning?”",
        ],
        "faq": [
            ("Kan AI:n boka service utan att dubbelboka?",
             "Ja. AI:n bokar i din kalender i realtid med den kapacitet du anger per dag och lyft, så dubbelbokningar undviks."),
            ("Kan den ge pris på service?",
             "AI:n kan ge dina angivna priser per bilmodell eller tjänst, och be om registreringsnummer så att du kan lämna exakt pris. Den hittar aldrig på en siffra."),
            ("Kan den svara när verkstaden är stängd?",
             "Ja, dygnet runt. Kvällar och helger är ofta då kunderna faktiskt ringer – och då är konkurrenterna som mest tysta."),
        ],
    },
    {
        "slug": "tandlakare",
        "name": "tandläkare",
        "label": "Tandläkare",
        "scenario": "Akut tandvärk kommer alltid olägligt. Får patienten inget svar ringer hen vidare direkt – och besöket blir någon annans.",
        "promise": "AI:n tar emot förfrågan, avgör om det är akut, bokar undersökning eller akuttid och svarar på prisfrågor – medan ni behandlar patienter.",
        "questions": [
            "”Kan jag få tid i dag?”",
            "”Vad kostar en undersökning?”",
            "”Tar ni emot akuta patienter?”",
            "”Omfattas det av tandvårdsförsäkringen?”",
        ],
        "faq": [
            ("Kan AI:n hantera akuta patienter?",
             "Ja. AI:n frågar om symtom och hur länge patienten haft besvär, och följer dina regler för vad som bokas akut respektive som vanlig undersökning."),
            ("Får den prata om priser och försäkringar?",
             "Den kan ge de prisuppgifter du anger och förklara att ersättning beror på patientens försäkring och avtal. Den lovar aldrig kostnadsfri behandling."),
            ("Hur hanteras patientuppgifter?",
             "Samtalet sammanfattas och skickas till mottagningen på samma sätt som ett vanligt telefonmeddelande. Känsliga uppgifter hanteras enligt era rutiner och GDPR."),
        ],
    },
    {
        "slug": "frisor",
        "name": "frisör",
        "label": "Frisör",
        "scenario": "Saxen i handen, kunden i stolen. Varje samtal mitt i en klippning kostar tid – och den som inte får svar bokar hos salongen bredvid.",
        "promise": "AI:n bokar tider direkt i kalendern, svarar på behandlingar och priser och tar hand om avbokningar, utan att du behöver släppa kunden i stolen.",
        "questions": [
            "”Har ni tid på fredag?”",
            "”Vad kostar slingor?”",
            "”Kan jag boka online i stället?”",
            "”Hur avbokar jag min tid?”",
        ],
        "faq": [
            ("Kan AI:n boka fel längd på behandlingen?",
             "Du anger hur lång tid varje behandling tar. AI:n bokar rätt tidslängd och kan lägga in extra tid vid färgning eller slingor, så schemat håller."),
            ("Vad händer vid avbokning?",
             "AI:n tar emot avbokningen, visar att tiden blir ledig och kan fylla den igen genom att erbjuda tiden till kunder som vill ha tidigare."),
            ("Fungerar det för salonger med flera frisörer?",
             "Ja. AI:n kan boka i rätt frisörs kalender och svara på vem som är ledig – eller boka in kunden hos första bästa lediga som kunden själv gör."),
        ],
    },
]


def read(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8")


def faq_block(items: list[tuple[str, str]]) -> str:
    rows = []
    for q, a in items:
        rows.append(
            f'        <details class="faq-item">\n          <summary>{q}</summary>\n'
            f'          <div class="faq-body">\n            <p>{a}</p>\n          </div>\n        </details>'
        )
    return "\n".join(rows)


def jsonld(payloads: list[dict]) -> str:
    return "\n".join(
        '<script type="application/ld+json">\n' + json.dumps(p, ensure_ascii=False, indent=2) + "\n</script>"
        for p in payloads
    )


def faq_ld(faq: list[tuple[str, str]]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq
        ],
    }


def service_ld(name: str, service_type: str, url: str, area: list[str] | None = None) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": name,
        "serviceType": service_type,
        "areaServed": area or ["Sverige"],
        "provider": {
            "@type": "LocalBusiness",
            "name": "Webbtjänst",
            "url": f"{BASE}/",
            "telephone": "+46 70 494 90 87",
            "email": "vberg024@gmail.com",
        },
        "url": url,
    }


def price_cards(city_suffix: str = "") -> str:
    return f"""      <div class="grid grid--3">
        <article class="price-card">
          <h3>Start</h3>
          <p class="price">3 500 kr</p>
          <p class="price-note">Per månad</p>
          <p class="price-card__time">8 timmar/mån</p>
          <ul class="features">
            <li>8 timmar/mån</li>
            <li>Svarar på frågor om ditt företag</li>
            <li>Bokar tider i din kalender</li>
            <li>Vidarebefordrar till rätt person</li>
            <li>Sammanfattning av varje samtal</li>
          </ul>
          <a href="../starta-projekt" class="btn btn--primary btn--block">Välj Start</a>
        </article>
        <article class="price-card price-card--featured">
          <h3>Tillväxt</h3>
          <p class="price">8 500 kr</p>
          <p class="price-note">Per månad</p>
          <p class="price-card__time">20 timmar/mån</p>
          <ul class="features">
            <li>20 timmar/mån</li>
            <li>Allt i Start</li>
            <li>Kvalificerar kunder med rätt frågor</li>
            <li>Tränad på din bransch</li>
            <li>Skickar varma leads direkt till dig</li>
          </ul>
          <a href="../starta-projekt" class="btn btn--primary btn--block">Välj Tillväxt</a>
        </article>
        <article class="price-card">
          <h3>Premium</h3>
          <p class="price">24 800 kr</p>
          <p class="price-note">Per månad</p>
          <p class="price-card__time">60 timmar/mån</p>
          <ul class="features">
            <li>60 timmar/mån</li>
            <li>Allt i Tillväxt</li>
            <li>Anpassad röst och personlighet</li>
            <li>Månadsrapport över samtal och bokningar</li>
            <li>Prioriterad support</li>
          </ul>
          <a href="../starta-projekt" class="btn btn--primary btn--block">Välj Premium</a>
        </article>
      </div>"""


def build_branch(branch: dict, head: str, tail: str) -> str:
    name = branch["name"]
    label = branch["label"]
    url = f"{BASE}/tjanster/ai-receptionist-{branch['slug']}"
    title = f"AI-receptionist för {name} | Webbtjänst"
    desc = (
        f"AI-telefonist för {name} som svarar dygnet runt, bokar tider och kvalificerar kunder. "
        f"Från 3 500 kr/mån. Ring +46 70 494 90 87."
    )
    faq = branch["faq"] + SHARED_FAQ

    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', head, count=1)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', head, count=1)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{title}">', head, count=1)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', head, count=1)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', head, count=1)

    questions = "\n".join(f"            <li>{q}</li>" for q in branch["questions"])
    other = [b for b in BRANCHES if b["slug"] != branch["slug"]][:3]
    other_cards = "\n".join(
        f'        <article class="feature-card">\n          <h3><a href="ai-receptionist-{b["slug"]}">AI-receptionist för {b["name"]}</a></h3>\n'
        f'          <p>Svarar på samtal och bokar tider i {b["name"]}-branschen, dygnet runt.</p>\n        </article>'
        for b in other
    )

    main = f"""
  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <nav class="crumbs" aria-label="Brödsmulor">
        <a href="/">Start</a>
        <span class="sep" aria-hidden="true">→</span>
        <a href="../tjanster">Tjänster</a>
        <span class="sep" aria-hidden="true">→</span>
        <a href="../tjanster/ai-receptionist">AI-receptionist</a>
        <span class="sep" aria-hidden="true">→</span>
        <span aria-current="page">{label}</span>
      </nav>
      <h1>AI-receptionist för {name} – svarar när <span class="accent">du jobbar</span></h1>
      <p class="lede">{branch["scenario"]}</p>
    </div>
  </section>

  <!-- VAD DEN GÖR -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">VAD DEN GÖR</span>
        <h2 class="section-title">{branch["promise"]}</h2>
      </div>
      <div class="grid grid--2">
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.9 8.9 0 0 1-3.7-.8L3 21l1.9-5.3a8.4 8.4 0 1 1 16.1-4.2z"/></svg></span>
          <h3>Svarar dygnet runt</h3>
          <p>Kvällar, helger och mitt i arbetsdagen. Kunden får svar på första signalen i stället för att ringa nästa företag i listan.</p>
        </article>
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
          <h3>Bokar tider</h3>
          <p>Direkt i din kalender, i realtid, med den kapacitet du anger. Kunden får bekräftelse och du slipper dubbelbokningar.</p>
        </article>
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg></span>
          <h3>Ställer rätt frågor</h3>
          <p>Tränad på {name}-branschen: den frågar om det du behöver veta, och skickar bara vidare kunder som är redo att boka.</p>
        </article>
        <article class="feature-card">
          <span class="tile-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg></span>
          <h3>Lämnar aldrig ett tomt svar</h3>
          <p>Kan den inte svaret kopplar den vidare eller tar ett meddelande – och du får alltid en sammanfattning av samtalet.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- SAMTALEN -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">SAMTALEN DEN TAR</span>
        <h2 class="section-title">Typiska frågor från {name}-kunder</h2>
      </div>
      <div class="grid grid--2">
        <div>
          <ul>
{questions}
          </ul>
          <p>AI:n svarar med dina uppgifter och dina regler. Den hittar aldrig på ett pris, en tid eller ett löfte som du inte har gett.</p>
        </div>
        <aside class="callout">
          <strong>Så låter ett samtal</strong>
          <p><em>Kund:</em> Hej, kan ni komma i morgon?<br>
          <em>AI:</em> Hej! Det beror på vad det gäller – berätta kort, så bokar jag in rätt tid hos oss.</p>
          <p><em>Kund:</em> Det gäller {branch["questions"][0].strip("”")}<br>
          <em>AI:</em> Tack. Jag har en ledig tid i morgon klockan 08:00. Passar det, eller vill du se fler tider?</p>
          <p>Samtalet sammanfattas och skickas till dig direkt efteråt.</p>
        </aside>
      </div>
    </div>
  </section>

  <!-- IGÅNG -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">IGÅNG</span>
        <h2 class="section-title">Live på <span class="accent">fyra dagar</span></h2>
      </div>
      <ol class="timeline" style="max-width:760px;margin:0 auto">
        <li class="tl-item">
          <span class="tl-time">Dag 1</span>
          <h3>Koppling</h3>
          <p>Vi kopplar AI:n till ditt nummer, din kalender och dina uppgifter om företaget.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Dag 2</span>
          <h3>Träning på {name}-samtal</h3>
          <p>Vi lär AI:n era vanligaste frågor, era priser och vad som ska kopplas vidare till dig.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Dag 3</span>
          <h3>Test med riktiga samtal</h3>
          <p>Vi provkör och justerar tills svaren sitter. Du lyssnar och godkänner innan vi går live.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Dag 4</span>
          <h3>Live</h3>
          <p>AI:n svarar. Du får en sammanfattning av varje samtal och bara de varma kunderna vidare.</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- PRIS -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">PAKET — PER MÅNAD</span>
        <h2 class="section-title">Fasta priser, <span class="accent">ingen bindningstid</span></h2>
        <p class="lede">Ett räddat jobb i månaden betalar oftast hela paketet. <a href="../tjanster/ai-receptionist-pris">Läs mer om vad som ingår i priset →</a></p>
      </div>
{price_cards()}
    </div>
  </section>

  <!-- FAQ -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">FAQ</span>
        <h2 class="section-title">Vanliga frågor om AI-receptionist för {name}</h2>
      </div>
      <div class="faq-list">
{faq_block(faq)}
      </div>
    </div>
  </section>

  <!-- RELATERAT -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">LÄS OCKSÅ</span>
        <h2 class="section-title">Fler branscher och <span class="accent">priser</span></h2>
      </div>
      <div class="grid grid--3">
{other_cards}
        <article class="feature-card">
          <h3><a href="ai-receptionist-pris">Vad kostar en AI-receptionist?</a></h3>
          <p>Paket, samtaltimmar, jämförelse mot anställd telefonist och när det lönar sig.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="section">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>Sluta missa samtal i <span class="accent">{name}-jobbet</span></h2>
          <p>Berätta hur din telefon vardag ser ut – vi visar vad AI:n skulle svara och vad det kostar.</p>
        </div>
        <div class="cta-band__actions">
          <a class="btn btn--accent btn--lg" href="../boka-mote">Boka ett telefonmöte</a>
          <a class="btn btn--outline btn--lg" href="../tjanster/ai-receptionist">Om AI-receptionisten</a>
        </div>
      </div>
    </div>
  </section>

{jsonld([service_ld(f"AI-receptionist för {name}", f"AI-telefonist för {name}", url), faq_ld(faq)])}
"""
    return head + "<main>" + main + "</main>" + tail


def build_price_page(head: str, tail: str) -> str:
    url = f"{BASE}/tjanster/ai-receptionist-pris"
    title = "AI receptionist pris – vad kostar en AI-telefonist? | Webbtjänst"
    desc = (
        "AI-receptionist kostar 3 500 kr/mån (8 h), 8 500 kr/mån (20 h) eller 24 800 kr/mån (60 h). "
        "Se vad som ingår och när det lönar sig. Ring +46 70 494 90 87."
    )
    faq = [
        ("Vad kostar en AI-receptionist per månad?",
         "Start kostar 3 500 kr per månad och omfattar 8 samtaltimmar. Tillväxt kostar 8 500 kr per månad med 20 timmar, kvalificering av kunder och träning på din bransch. Premium kostar 24 800 kr per månad med 60 timmar, anpassad röst och månadsrapport."),
        ("Vad räknas som en samtaltimme?",
         "En samtaltimme är 60 minuters faktisk samtalstid. Ett vanligt kundsamtal tar två till fem minuter, så 8 timmar räcker längre än de flesta tror – men vi säger till i god tid innan du närmar dig taket."),
        ("Är det billigare än att anställa en telefonist?",
         "Nästan alltid, ja. En anställd telefonist innebär lön, arbetsgivaravgifter, semester, sjukdagar och rekrytering – och svarar ändå bara kontorstid. Våra paket börjar på 3 500 kr per månad och svarar dygnet runt, utan bindningstid."),
        ("Vad ingår i alla paket?",
         "Koppling till ditt nummer och din kalender, träning på din bransch och dina vanligaste frågor, vidarekoppling till rätt person, sammanfattning av varje samtal och support när du behöver ändra något."),
        ("Finns det startkostnad eller bindningstid?",
         "Nej. Du betalar per månad och kan säga upp när du vill. Vill du byta paket eller lägga till timmar gör vi det direkt."),
        ("Hur snabbt kommer vi igång?",
         "Vanligtvis är AI:n live inom fyra dagar: koppling dag ett, träning dag två, test dag tre och live dag fyra. Du godkänner svaren innan vi går live."),
    ]
    branches = "\n".join(
        f'        <article class="feature-card">\n          <h3><a href="ai-receptionist-{b["slug"]}">AI-receptionist för {b["name"]}</a></h3>\n'
        f'          <p>Se hur AI:n hanterar samtalen i {b["name"]}-branschen.</p>\n        </article>'
        for b in BRANCHES
    )

    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', head, count=1)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', head, count=1)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{title}">', head, count=1)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', head, count=1)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', head, count=1)

    main = f"""
  <!-- HERO -->
  <section class="page-hero">
    <div class="container">
      <nav class="crumbs" aria-label="Brödsmulor">
        <a href="/">Start</a>
        <span class="sep" aria-hidden="true">→</span>
        <a href="../tjanster">Tjänster</a>
        <span class="sep" aria-hidden="true">→</span>
        <a href="../tjanster/ai-receptionist">AI-receptionist</a>
        <span class="sep" aria-hidden="true">→</span>
        <span aria-current="page">Pris</span>
      </nav>
      <h1>Vad kostar en <span class="accent">AI-receptionist</span>?</h1>
      <p class="lede">Fasta månadspriser från 3 500 kr, ingen startkostnad och ingen bindningstid. Här ser du exakt vad du betalar för – och när det lönar sig.</p>
    </div>
  </section>

  <!-- PRISER -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">PRISER PER MÅNAD</span>
        <h2 class="section-title">Tre paket med <span class="accent">fasta priser</span></h2>
        <p class="lede">Alla paket inkluderar träning på din bransch, koppling till ditt nummer och kalender samt en sammanfattning av varje samtal.</p>
      </div>
{price_cards()}
    </div>
  </section>

  <!-- VAD SOM INGÅR -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">VAD SOM INGÅR</span>
        <h2 class="section-title">Samma sak i alla paket – <span class="accent">bara volymen skiljer</span></h2>
      </div>
      <div class="grid grid--2">
        <div>
          <p><strong>Träning på din bransch.</strong> Vi går igenom era vanligaste samtal, vad AI:n får säga och vad som ska kopplas vidare till en människa. Du godkänner svaren innan vi går live.</p>
          <p><strong>Bokning i din kalender.</strong> AI:n bokar i realtid och bekräftar till kunden. Du behåller ditt nuvarande system – vi kopplar ihop det.</p>
          <p><strong>Sammanfattning av varje samtal.</strong> Namn, nummer, ärende och vad ni kom fram till. Inga hemliga samtal och ingen information som försvinner.</p>
          <p><strong>Ingen bindningstid.</strong> Du betalar månadsvis och säger upp när du vill. Timmar du inte använder flyttar inte över – därför säger vi till i god tid om du närmar dig taket.</p>
        </div>
        <aside class="callout">
          <strong>Vad en samtaltimme är värd</strong>
          <p>Räkna på ditt eget läge: om ett räddat jobb i månaden är värt mer än paketpriset, är AI:n lönsam. För de flesta hantverks- och serviceföretag räcker ett enda jobb per månad för att hela kostnaden ska vara betald.</p>
          <p><a href="../starta-projekt">Starta projekt →</a></p>
        </aside>
      </div>
    </div>
  </section>

  <!-- JÄMFÖRELSE -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">JÄMFÖRELSE</span>
        <h2 class="section-title">AI-receptionist eller <span class="accent">anställd telefonist</span>?</h2>
      </div>
      <div class="grid grid--3">
        <article class="feature-card">
          <h3>Anställd telefonist</h3>
          <p>Lön, arbetsgivaravgifter, semester, sjukdagar och rekrytering. Svarar kontorstid, men hanterar komplexa ärenden och relationer bättre än något system.</p>
        </article>
        <article class="feature-card">
          <h3>AI-receptionist</h3>
          <p>Fast månadskostnad från 3 500 kr, dygnet runt, ingen semester och ingen frånvaro. Svarar på vanliga frågor, bokar tider och sammanfattar varje samtal.</p>
        </article>
        <article class="feature-card">
          <h3>Bäst resultat: båda</h3>
          <p>Låt AI:n ta alla samtal dag, kväll och helg, och koppla vidare komplexa ärenden till en människa på kontorstid. Då fångas allt utan att någon behöver sitta i telefon hela dagen.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">FAQ</span>
        <h2 class="section-title">Frågor om <span class="accent">priset</span></h2>
      </div>
      <div class="faq-list">
{faq_block(faq)}
      </div>
    </div>
  </section>

  <!-- BRANSCHER -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">PER BRANSCH</span>
        <h2 class="section-title">Se hur AI:n jobbar i <span class="accent">din bransch</span></h2>
      </div>
      <div class="grid grid--3">
{branches}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="section">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>Vill du veta vad det kostar <span class="accent">för dig</span>?</h2>
          <p>Boka ett telefonmöte så går vi igenom din samtalsvolym och föreslår rätt paket.</p>
        </div>
        <div class="cta-band__actions">
          <a class="btn btn--accent btn--lg" href="../boka-mote">Boka telefonmöte</a>
          <a class="btn btn--outline btn--lg" href="../starta-projekt">Starta projekt</a>
        </div>
      </div>
    </div>
  </section>

{jsonld([service_ld("AI-receptionist", "AI-telefonist", url), faq_ld(faq)])}
"""
    return head + "<main>" + main + "</main>" + tail


def main() -> None:
    tpl = read(TEMPLATE)
    head, rest = tpl.split("<main>", 1)
    _main, tail = rest.split("</main>", 1)

    outputs = [("ai-receptionist-pris.html", build_price_page(head, tail))]
    outputs += [
        (f"ai-receptionist-{b['slug']}.html", build_branch(b, head, tail)) for b in BRANCHES
    ]
    for filename, content in outputs:
        path = SITE / "tjanster" / filename
        path.write_text(content, encoding="utf-8")
        body = re.sub(r"<script.*?</script>", " ", content, flags=re.S)
        body = re.sub(r"<[^>]+>", " ", body)
        print(f"{filename}: {len(body.split())} ord, {len(content)} tecken")
    print("klart")


if __name__ == "__main__":
    main()
