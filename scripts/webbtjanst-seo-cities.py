#!/usr/bin/env python3
"""Genererar lokal-SEO-stadssidor för webbtjanst.com.

  python3 scripts/webbtjanst-seo-cities.py

Skal (head, header, drawer, footer) kopieras ordagrant från site/tjanster/lokal-seo.html
så att design, kontaktuppgifter och rena URL:er blir identiska. Endast <main>-innehållet
och title/description/canonical/og byggs per stad.
"""
from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
BASE = "https://www.webbtjanst.com"
TEMPLATE = SITE / "tjanster" / "lokal-seo.html"

CITIES = [
    {
        "slug": "stockholm",
        "name": "Stockholm",
        "intro": "Stockholm är Sveriges mest konkurrensutsatta lokalmarknad. Här räcker det sällan med en snygg startsida – du behöver en sida per tjänst och område för att synas när någon söker efter hjälp i din del av stan.",
        "competition": "I Stockholm tävlar du både mot rikstäckande portaler och mot hundratals lokala företag. Vinner gör den som har tydliga sidor för exakt det kunden söker.",
        "districts": ["Södermalm", "Östermalm", "Vasastan", "Kungsholmen", "Bromma", "Enskede"],
        "nearby": ["Solna", "Sundbyberg", "Nacka"],
        "industries": ["rörmokare", "elektriker", "städfirma", "snickeri"],
        "keywords": ["rörmokare stockholm", "eljour stockholm", "städfirma södermalm", "snickare bromma", "lokal seo stockholm", "hemsida stockholm"],
        "faq": [
            ("Vilka områden i Stockholm jobbar ni med?",
             "Vi bygger sidor för hela Stockholm – innerstaden såväl som Södermalm, Östermalm, Vasastan, Kungsholmen, Bromma och Enskede, och för närliggande Solna, Sundbyberg och Nacka. Du väljer vilka områden du faktiskt kör till."),
            ("Är det värt lokal SEO i Stockholm när konkurrensen är så hård?",
             "Ja, men med rätt angreppssätt. Att ranka på ”rörmokare” i hela Stockholm är svårt och dyrt. Att ranka på ”rörmokare Södermalm” eller ”eljour Bromma” är betydligt lättare – och de kunderna är närmare ett köp."),
        ],
    },
    {
        "slug": "goteborg",
        "name": "Göteborg",
        "intro": "Göteborg är en stad med starka lokala hantverkstraditioner och kunder som gärna väljer företag i sitt eget område. Det gör lokal SEO särskilt lönsamt – om dina sidor faktiskt nämner området kunden söker i.",
        "competition": "Många göteborgska företag har funnits länge och har starka recensioner men svag hemsida. Där ligger din möjlighet: bättre struktur och tydligare sidor slår äldre sajter utan innehåll.",
        "districts": ["Majorna", "Linnéstaden", "Hisingen", "Frölunda", "Centrum", "Bergsjön"],
        "nearby": ["Mölndal", "Partille", "Kungsbacka"],
        "industries": ["byggfirma", "rörmokare", "bilverkstad", "restaurang"],
        "keywords": ["byggfirma göteborg", "rörmokare majorna", "bilverkstad hisingen", "flyttstäd göteborg", "lokal seo göteborg", "hemsida göteborg"],
        "faq": [
            ("Täcker ni hela Göteborg med omnejd?",
             "Ja. Vi bygger sidor för centrala Göteborg och stadsdelar som Majorna, Linnéstaden, Hisingen och Frölunda, och kan samtidigt rikta sidor mot Mölndal, Partille och Kungsbacka om du jobbar där."),
            ("Vi har funnits länge men syns inte på Google – varför?",
             "Det vanligaste skälet är att sajten är en enda sida utan sidor för enskilda tjänster och områden. Google har då inget att matcha mot lokala sökningar. Vi bygger den strukturen och kopplar din Google Business Profile."),
        ],
    },
    {
        "slug": "malmo",
        "name": "Malmö",
        "intro": "I Malmö ligger många av dina kunder inom tio minuters körning – men också dina konkurrenter. Lokal SEO handlar här om att vara synlig i rätt stadsdel och att skilja sig från de stora kedjorna.",
        "competition": "Kedjor och franchiseföretag dominerar de breda sökningarna i Malmö. De lokala företagen vinner i stället på närområdet, snabbhet och personligt bemötande.",
        "districts": ["Möllevången", "Limhamn", "Rosengård", "Bunkeflostrand", "Centrum", "Kirseberg"],
        "nearby": ["Lund", "Trelleborg", "Vellinge"],
        "industries": ["städfirma", "bilverkstad", "restaurang", "frisör"],
        "keywords": ["städfirma malmö", "bilverkstad limhamn", "flyttstäd möllan", "frisör centrum malmö", "lokal seo malmö", "hemsida malmö"],
        "faq": [
            ("Kan ni rikta sidor mot både Malmö och Lund?",
             "Ja. Många företag i Malmö jobbar också i Lund, Trelleborg och Vellinge. Vi bygger separata sidor per område i stället för en sida som försöker täcka allt – det är så Google matchar lokala sökningar."),
            ("Hur skiljer vi oss från kedjorna i sökresultaten?",
             "Genom att vara tydligare: fasta priser, område, svar på vanliga frågor och recensioner på sidan. Kedjorna har bredd, du har närhet – och närheten är vad kunden söker efter."),
        ],
    },
    {
        "slug": "uppsala",
        "name": "Uppsala",
        "intro": "Uppsala växer snabbt, och med studenter, pendlare och nybyggda områden kommer nya typer av sökningar: flyttstäd, förstahandskontrakt, akuta rörjobb i lägenhet.",
        "competition": "Konkurrensen i Uppsala är lägre än i Stockholm, men kunderna är vana vid att jämföra. Tydliga sidor med pris och område slår generella sajter.",
        "districts": ["Fålhagen", "Luthagen", "Gottsunda", "Sävja", "Centrum", "Sala backe"],
        "nearby": ["Knivsta", "Enköping", "Tierp"],
        "industries": ["rörmokare", "tandläkare", "byggfirma", "städfirma"],
        "keywords": ["rörmokare uppsala", "flyttstäd uppsala", "tandläkare luthagen", "byggfirma uppsala", "lokal seo uppsala", "hemsida uppsala"],
        "faq": [
            ("Vi jobbar mest i bostadsrätter och hyreslägenheter – funkar lokal SEO då?",
             "Absolut. I Uppsala söker många på område och typ av bostad, till exempel ”rörmokare Luthagen” eller ”flyttstäd Gottsunda”. Vi bygger sidor som matchar de sökningarna."),
            ("Hur lång tid tar det innan vi syns i Uppsala?",
             "Vanligtvis ser vi rörelse efter två till tre månader och tydligare resultat efter fyra till sex. Du får en rapport varje månad som visar position per sökord."),
        ],
    },
    {
        "slug": "vasteras",
        "name": "Västerås",
        "intro": "Västerås är en industristad där många företag säljer till både privatpersoner och företag. Det gör sökintentionen extra viktig: en tjänstesida för privatkunder ska inte se ut som en sida för upphandlingar.",
        "competition": "I Västerås finns färre specialiserade webbsidor än i storstäderna – vilket betyder att en välbyggd tjänstesida kan ranka snabbt.",
        "districts": ["Centrum", "Bäckby", "Rönnby", "Skiljebo", "Hälla", "Irsta"],
        "nearby": ["Köping", "Hallstahammar", "Surahammar"],
        "industries": ["elektriker", "byggfirma", "bilverkstad", "larmfirma"],
        "keywords": ["elektriker västerås", "byggfirma västerås", "larm västerås", "bilverkstad västerås", "lokal seo västerås", "hemsida västerås"],
        "faq": [
            ("Vi säljer både till privatpersoner och företag – hur gör ni då?",
             "Vi bygger separata sidor för de två målgrupperna. Företagskunder söker ofta på avtal, jour och ramavtal, medan privatkunder söker på pris, område och snabbhet. Samma sökord funkar inte för båda."),
            ("Kan ni rikta sidor mot Köping och Hallstahammar också?",
             "Ja. Om du kör utanför Västerås bygger vi sidor för de orterna – till exempel ”elektriker Köping” – med samma struktur men eget innehåll och egen ort i title."),
        ],
    },
    {
        "slug": "orebro",
        "name": "Örebro",
        "intro": "Örebro är en medelstor stad med ett tydligt lokalpatriotiskt köpbeteende: kunderna väljer gärna ett företag från stan framför en portal. Det gör lokal SEO effektivt.",
        "competition": "I Örebro är de flesta konkurrenter fortfarande svaga på lokal SEO. Den som bygger ordentliga tjänste- och områdessidor tidigt får en fördel som är svår att ta igen.",
        "districts": ["Centrum", "Adolfsberg", "Brickebacken", "Haga", "Rynninge", "Varberga"],
        "nearby": ["Kumla", "Hallsberg", "Nora"],
        "industries": ["rörmokare", "städfirma", "restaurang", "snickeri"],
        "keywords": ["rörmokare örebro", "städfirma örebro", "snickare örebro", "flyttstäd örebro", "lokal seo örebro", "hemsida örebro"],
        "faq": [
            ("Hur många sidor behöver vi för att täcka Örebro?",
             "För de flesta räcker fem till tio sidor: en per huvudtjänst och två till fyra områden. Sedan växer vi med fler sökord i underhållspaketet när de första sidorna börjar ranka."),
            ("Räcker det med Google Business Profile?",
             "Nej, men det är en viktig del. Profilen avgör hur du syns i kartan och på ”nära mig”-sökningar. Hemsidans sidor avgör om du syns på ”tjänst + stad”. Båda behövs för att du ska få trafik och samtal."),
        ],
    },
]

SHARED_FAQ = [
    ("Vad ingår i lokal SEO?",
     "Sökordsanalys för din region, en sida per tjänst och område, tekniska grunder som title, rubriker, hastighet och mobil, koppling av din Google Business Profile samt månadsrapport över hur du rankar."),
    ("Varför bygger ni en sida per område i stället för en enda sida?",
     "Google matchar innehåll mot sökningen. En sida om ”rörmokare Södermalm” matchar en sökning på just det, medan en allmän sida matchar sämre på allt. Fler tydliga sidor ger fler ingångar – utan att innehållet blir tunt."),
    ("Vad händer efter att sidorna är byggda?",
     "Du får månadsrapporten och kan fortsätta med underhållspaketen från 1 200 kr/mån, där vi bygger nya sökords-sidor varje månad och bevakar rankningen så att den inte tappar."),
]


def read(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8")


def shell() -> tuple[str, str, str]:
    tpl = read(TEMPLATE)
    head, rest = tpl.split("<main>", 1)
    _main, tail = rest.split("</main>", 1)
    return head, rest, tail


def faq_block(items: list[tuple[str, str]]) -> str:
    rows = []
    for q, a in items:
        rows.append(
            f'        <details class="faq-item">\n          <summary>{q}</summary>\n'
            f'          <div class="faq-body">\n            <p>{a}</p>\n          </div>\n        </details>'
        )
    return "\n".join(rows)


def jsonld(city: dict, faq: list[tuple[str, str]]) -> str:
    faq_ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faq
        ],
    }
    service_ld = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": f"Lokal SEO i {city['name']}",
        "serviceType": "Lokal sökmotoroptimering",
        "areaServed": [city["name"]] + city["nearby"],
        "provider": {
            "@type": "LocalBusiness",
            "name": "Webbtjänst",
            "url": f"{BASE}/",
            "telephone": "+46 70 494 90 87",
            "email": "vberg024@gmail.com",
        },
        "url": f"{BASE}/tjanster/lokal-seo-{city['slug']}",
    }
    out = []
    for payload in (service_ld, faq_ld):
        out.append(
            '<script type="application/ld+json">\n'
            + json.dumps(payload, ensure_ascii=False, indent=2)
            + "\n</script>"
        )
    return "\n".join(out)


def card(title: str, body: str, icon: str) -> str:
    return (
        '        <article class="feature-card">\n'
        f'          <span class="tile-icon" aria-hidden="true">{icon}</span>\n'
        f"          <h3>{title}</h3>\n"
        f"          <p>{body}</p>\n"
        "        </article>\n"
    )


ICON_MAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>'
ICON_CHART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>'
ICON_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>'


def build_city(city: dict, head: str, tail: str) -> str:
    name = city["name"]
    districts = ", ".join(city["districts"][:-1]) + " och " + city["districts"][-1]
    nearby = ", ".join(city["nearby"])
    faq = city["faq"] + SHARED_FAQ

    title = f"Lokal SEO i {name} | Syns lokalt med Webbtjänst"
    desc = (
        f"Lokal SEO i {name}: sidor per tjänst och område, Google Business Profile och månadsrapport. "
        f"Fast pris från 15 000 kr. Ring +46 70 494 90 87."
    )
    url = f"{BASE}/tjanster/lokal-seo-{city['slug']}"

    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", head, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', head, count=1)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', head, count=1)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{title}">', head, count=1)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', head, count=1)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', head, count=1)

    keyword_items = "\n".join(
        f'            <li>{kw}</li>' for kw in city["keywords"]
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
        <a href="../tjanster/lokal-seo">Lokal SEO</a>
        <span class="sep" aria-hidden="true">→</span>
        <span aria-current="page">{name}</span>
      </nav>
      <h1>Lokal SEO i {name} – syns på <span class="accent">lokala sökningar</span></h1>
      <p class="lede">{city["intro"]}</p>
    </div>
  </section>

  <!-- VARFÖR -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">VARFÖR LOKAL SEO I {name.upper()}</span>
        <h2 class="section-title">Kunder i {name} söker <span class="accent">lokalt</span></h2>
        <p class="lede">{city["competition"]}</p>
      </div>
      <div class="grid grid--3">
{card(f"Nära mig-sökningar", f"När någon söker på din tjänst och klickar i kartan avgör din Google Business Profile. Vi kopplar profilen till hemsidan och ser till att område, öppettider och tjänster stämmer för {name}.", ICON_MAP)}{card("Tjänst + område", f"Vi bygger en sida per tjänst och område i {name}: {districts.lower()}. Varje sida matchar exakt det kunder skriver i sökrutan.", ICON_SEARCH)}{card("Mätbar utveckling", f"Du ser vilka sökord som ger visningar och klick i {name}, och vilka sidor som behöver byggas om. Rapporten kommer varje månad.", ICON_CHART)}      </div>
    </div>
  </section>

  <!-- VAD VI BYGGER -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">VAD VI BYGGER</span>
        <h2 class="section-title">Områden och sökord vi jobbar med i {name}</h2>
      </div>
      <div class="grid grid--2">
        <div>
          <p><strong>Områden:</strong> {districts}. Kör du utanför stadskärnan bygger vi även in {nearby} – till exempel ”{city['industries'][0]} {city['nearby'][0].lower()}”.</p>
          <p><strong>Branscher vi ser mest av i {name}:</strong> {", ".join(city['industries'])}. Det är också där vi vet vilka sökord som faktiskt leder till jobb i stället för bara visningar.</p>
          <p>Om du redan har en hemsida bygger vi vidare på den. Har du ingen bygger vi en ny i samma stil som övriga sajten – live på 24–48 timmar – och lägger in lokal SEO från start.</p>
        </div>
        <aside class="callout">
          <strong>Sökord vi typiskt bygger mot i {name}</strong>
          <ul>
{keyword_items}
          </ul>
          <p>Listan anpassas efter din verksamhet. Du väljer slutligen vilka sökord vi satsar på.</p>
        </aside>
      </div>
    </div>
  </section>

  <!-- SÅ JOBBAR VI -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">SÅ JOBBAR VI</span>
        <h2 class="section-title">Från analys till <span class="accent">synlighet i {name}</span></h2>
      </div>
      <ol class="timeline" style="max-width:760px;margin:0 auto">
        <li class="tl-item">
          <span class="tl-time">Steg 1</span>
          <h3>Sökordsanalys för {name}</h3>
          <p>Vi kartlägger vilka sökningar som faktiskt görs i din stad och inom din bransch, och vilka av dem du realistiskt kan ranka på.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Steg 2</span>
          <h3>Sidor per tjänst och område</h3>
          <p>En sida per tjänst och område, med egen title, rubrik och innehåll. Alla sidor kopplas ihop så att Google förstår helheten.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Steg 3</span>
          <h3>Google Business Profile</h3>
          <p>Profilen kopplas till hemsidan, kategorier och område stäms av, och vi ser till att recensioner och öppettider är aktuella.</p>
        </li>
        <li class="tl-item">
          <span class="tl-time">Löpande</span>
          <h3>Rapport och underhåll</h3>
          <p>Varje månad får du siffrorna för {name}: visningar, klick och position per sökord. Sedan bygger vi vidare på det som fungerar.</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- PAKET -->
  <section class="section section--mist">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">PAKET</span>
        <h2 class="section-title">Lokal SEO i {name} – <span class="accent">fasta priser</span></h2>
        <p class="lede">Engångsavgift. Lokal SEO byggs in i din hemsida; betalningssätt bekräftas före start.</p>
      </div>
      <div class="grid grid--3">
        <article class="price-card">
          <h3>Start</h3>
          <p class="price">15 000 kr</p>
          <p class="price-note">Engångsavgift · betalningssätt bekräftas före start</p>
          <p class="price-card__time">Inbyggt i din hemsida</p>
          <ul class="features">
            <li>Grund-SEO: meta-data och titlar</li>
            <li>Optimerad sidstruktur</li>
            <li>Teknisk grund: hastighet och mobil</li>
            <li>Google förstår din verksamhet i {name}</li>
          </ul>
          <a href="../starta-projekt" class="btn btn--primary btn--block">Välj Start</a>
        </article>
        <article class="price-card price-card--featured">
          <h3>Tillväxt</h3>
          <p class="price">30 000 kr</p>
          <p class="price-note">Engångsavgift · betalningssätt bekräftas före start</p>
          <p class="price-card__time">Inbyggt i din hemsida</p>
          <ul class="features">
            <li>Lokal SEO på 5 sökord</li>
            <li>Sökords-sidor för {name}</li>
            <li>Google Business Profile – kopplad</li>
            <li>Grund-SEO på alla sidor</li>
          </ul>
          <a href="../starta-projekt" class="btn btn--primary btn--block">Välj Tillväxt</a>
        </article>
        <article class="price-card">
          <h3>Premium</h3>
          <p class="price">60 000 kr</p>
          <p class="price-note">Engångsavgift · betalningssätt bekräftas före start</p>
          <p class="price-card__time">Inbyggt i din hemsida</p>
          <ul class="features">
            <li>Lokal SEO på 10 sökord</li>
            <li>Sökords-sidor för hela regionen</li>
            <li>Google Business Profile – optimerad</li>
            <li>AI-receptionist till rabatterat pris</li>
          </ul>
          <a href="../starta-projekt" class="btn btn--primary btn--block">Välj Premium</a>
        </article>
      </div>
      <div class="callout" style="max-width:760px;margin:24px auto 0">
        <p><strong>Ska rankningen hållas uppe?</strong> Underhållspaketen från 1 200 kr/mån bygger nya sökords-sidor och bevakar rankningen i {name} varje månad.
        <a href="../tjanster/underhall">Se underhållspaketen →</a></p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">FAQ</span>
        <h2 class="section-title">Vanliga frågor om lokal SEO i {name}</h2>
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
        <h2 class="section-title">Mer om lokal SEO och <span class="accent">hemsidor</span></h2>
      </div>
      <div class="grid grid--3">
{card("Lokal SEO – så funkar det", 'Översikten över hur vi bygger in lokal SEO i din hemsida, vad som ingår och vilka paket som finns. <a href="../tjanster/lokal-seo">Läs mer</a>', ICON_SEARCH)}{card("Hemsida för ditt företag", f'Vi bygger din hemsida i {name} på 24–48 timmar, med design, texter och grund-SEO. Från 15 000 kr. <a href="../tjanster/hemsidor">Läs mer</a>', ICON_DOC)}{card("AI-receptionist", 'Slipper du missa samtal när du står på en stege? AI:n svarar dygnet runt och bokar tider. <a href="../tjanster/ai-receptionist">Läs mer</a>', ICON_MAP)}      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="section">
    <div class="container">
      <div class="cta-band">
        <div>
          <h2>Redo att synas i <span class="accent">{name}</span>?</h2>
          <p>Berätta vad du gör och var du jobbar – vi föreslår sökord och paket, och du får ett fast pris.</p>
        </div>
        <div class="cta-band__actions">
          <a class="btn btn--accent btn--lg" href="../starta-projekt">Starta ditt projekt</a>
          <a class="btn btn--outline btn--lg" href="../priser">Se priser</a>
        </div>
      </div>
    </div>
  </section>

{jsonld(city, faq)}
"""
    return head + "<main>" + main + "</main>" + tail


def main() -> None:
    head, _rest, tail = shell()
    for city in CITIES:
        out = build_city(city, head, tail)
        path = SITE / "tjanster" / f"lokal-seo-{city['slug']}.html"
        path.write_text(out, encoding="utf-8")
        body = re.sub(r"<script.*?</script>", " ", out, flags=re.S)
        body = re.sub(r"<[^>]+>", " ", body)
        print(f"{path.name}: {len(body.split())} ord, {len(out)} tecken")
    print("klart")


if __name__ == "__main__":
    main()
