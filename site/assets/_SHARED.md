# Webbtjänst — delad spec för sidbyggare

Läs HELA denna fil först. Bygg sedan DIN sida enligt din uppgift.
Alla sidor delar detta designsystem. Skriv ALDRIG om `assets/css/style.css`
eller `assets/js/main.js` — de finns redan. Länka dem bara.

## Företaget

Webbtjänst — svensk webbtjänst som bygger professionella hemsidor åt lokala
serviceföretag på 24–48 timmar. Målgrupp: små och medelstora lokala företag
(rör, el, målare, frisör, restaurang, juridik, gym, fastigheter …).

- Kontakt (ANVÄND EXAKT): e-post vberg024@gmail.com, telefon +46 70 494 90 87
- Adress (fiktiv): Digitalvägen 1, 111 57 Stockholm. Öppettider: Mån–Fre 08:00–18:00
- Domän för canonical: https://www.webbtjanst.com/

## Publika webbadresser

- Alla länkar, canonical-taggar, Open Graph-adresser och sitemap-poster använder
  rena sökvägar utan `.html`, till exempel `/boka-mote` och `/tjanster/hemsidor`.
- De fysiska produktionsfilerna får fortfarande heta `.html`; GitHub Pages
  serverar dem även via den rena adressen.
- Varje HTML-sida ska ha det tidiga `data-clean-public-url`-skriptet från
  head-mallen. Det städar gamla bokmärken med `.html` utan omladdning.

## Designsystem (finns i assets/css/style.css)

Tokens i `:root` (använd klasserna, sätt aldrig egna hex-värden):

- Färger: navy #0f172a (hero/footer), blå accent #2563eb / #3b82f6, vit #fff,
  ljusgrå sektion #f8fafc, text #475569/#334155, kantlinje #e2e8f0
- Typsnitt: Playfair Display (rubriker), Inter (brödtext) — via Google Fonts
- Form: pill-knappar, kort med 16px radie, generösa marginaler

### Klasser att använda

- Layout: `.container`, `.section`, `.section--mist`, `.section--dark`,
  `.grid .grid--2/3/4`, `.split` (+ `.split--flip`, `.split-media`)
- Rubriker: `.eyebrow` (liten blå etikett), `.section-title`, `.lede`,
  `.section-head`, `.accent` (kursiv blå text i rubriker)
- Knappar: `.btn`, `.btn--primary` (navy), `.btn--accent` (blå),
  `.btn--outline` (vit), `.btn--ghost` (på mörk), `.btn--lg`, `.btn--sm`, `.btn--block`
- Kort: `.feature-card` (+ `.tile-icon` med SVG), `.service-card` (+ `.card-link`),
  `.price-card` (+ `.price-card--featured`, `.price-badge`, `.price-card__time`,
  `.price`, `.price-note`, `ul.features`), `.ref-card` (`.ref-card__cat`,
  `.ref-card__body`, `.ref-tags`, `.demo-link`)
- Process: `.process-layout`, `.callout`, `.timeline`, `.tl-item`, `.tl-time`
- Tabeller: `.table-wrap`, `.price-table` (+ `.plan-price`, `.tier-badge`)
- CTA: `.cta-band` (+ `.cta-band__actions`)
- Undersida: `.page-hero` (bakgrund ljusgrå, h1 + lede), `.crumbs` (breadcrumb)
- Listor: `.check-list`
- FAQ: `.faq-list`, `.faq-item`, `.faq-body` (details/summary)
- Formulär: `.lead-form`, `.form-grid`, `.form-field` (+ `.form-field--full`),
  `.radio-row`, `.radio-pill`, `.hint`, `.form-status` (framgång/fel via JS)

### Ikoner (inline SVG, stroke currentColor, 24x24, i .tile-icon)

Hemsidor (skärm): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>`

Lokal SEO (karta): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`

AI-receptionist (meddelande): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.9 8.9 0 0 1-3.7-.8L3 21l1.9-5.3a8.4 8.4 0 1 1 16.1-4.2z"/></svg>`

Underhåll (skiftnyckel): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4.5 4.5 0 0 0 6 6L13 20a2.1 2.1 0 0 1-3-3l7.7-7.7z"/><path d="M14.7 6.3 12 3.6a4.5 4.5 0 0 0-6.4 6.4L8 12.4"/></svg>`

Blixt (snabbhet): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z"/></svg>`

Palett (design): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/><path d="M12 16.5a4.5 4.5 0 0 0 4.5-4.5"/></svg>`

Checklista (onboarding): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`

Diagram (skalbarhet): `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>`

## Header (exakt samma på ALLA sidor)

```html
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="Webbtjänst – startsida">
      <span class="brand-mark" aria-hidden="true"></span>
      <span class="brand-name">WEBBTJÄNST</span>
    </a>
    <nav class="site-nav" aria-label="Huvudmeny">
      <a href="TJANSTER" CLASS_ACTIVE>Tjänster</a>
      <a href="REFERENSER" CLASS_ACTIVE>Referenser</a>
      <a href="PROCESS" CLASS_ACTIVE>Process</a>
      <a href="PRISER" CLASS_ACTIVE>Priser</a>
      <a href="STARTAPROJEKT" class="btn btn--primary btn--sm nav-cta">Starta Projekt</a>
    </nav>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav-drawer" aria-label="Öppna meny">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<div class="nav-drawer" id="nav-drawer" aria-hidden="true">
  <div class="nav-drawer__panel">
    <button class="nav-drawer__close" aria-label="Stäng meny">×</button>
    <nav aria-label="Mobilmeny">
      <a href="/">Start</a>
      <a href="TJANSTER">Tjänster</a>
      <a href="REFERENSER">Referenser</a>
      <a href="PROCESS">Process</a>
      <a href="PRISER">Priser</a>
      <a href="OMOSS">Om oss</a>
      <a href="KONTAKT">Kontakt</a>
      <a href="STARTAPROJEKT" class="btn btn--primary btn--block">Starta Projekt</a>
    </nav>
    <div class="nav-drawer__contact">
      <a href="tel:+46704949087">+46 70 494 90 87</a>
      <a href="mailto:vberg024@gmail.com">vberg024@gmail.com</a>
    </div>
  </div>
</div>
```

Ersätt platshållarna med rätt relativa sökvägar (se din uppgift).
Sätt `class="active"` + `aria-current="page"` på den länk som är DIN sida.
Rotnivå-sidor: `tjanster.html`, `referenser.html`, `process.html`, `priser.html`,
`index.html`, `om-oss.html`, `kontakt.html`, `starta-projekt.html`.
Undersidor i /tjanster/: prefix `../` på ALLA länkar.

## Footer (exakt samma på ALLA sidor)

```html
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand brand--light" href="/">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-name">WEBBTJÄNST</span>
      </a>
      <p>Professionella hemsidor på 24–48 timmar för lokala serviceföretag. Snabbhet utan att offra kvalitet.</p>
    </div>
    <div class="footer-col">
      <h4>Länkar</h4>
      <a href="TJANSTER">Tjänster</a>
      <a href="PROCESS">Processen</a>
      <a href="PRISER">Priser</a>
      <a href="REFERENSER">Referenser</a>
      <a href="STARTAPROJEKT">Starta projekt</a>
    </div>
    <div class="footer-col">
      <h4>Tjänster</h4>
      <a href="TJANSTER_HEMSIDOR">Hemsidor</a>
      <a href="TJANSTER_SEO">Lokal SEO</a>
      <a href="TJANSTER_AI">AI-receptionist</a>
      <a href="TJANSTER_UH">Underhåll</a>
    </div>
    <div class="footer-col footer-nap">
      <h4>Kontakt</h4>
      <a href="mailto:vberg024@gmail.com">vberg024@gmail.com</a>
      <a href="tel:+46704949087">+46 70 494 90 87</a>
      <span>Digitalvägen 1, 111 57 Stockholm</span>
      <span>Mån–Fre 08:00–18:00</span>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container footer-bottom-inner">
      <p>© <span data-year></span> Webbtjänst. Alla rättigheter förbehållna.</p>
      <div class="footer-legal">
        <a href="INTEGRITET">Integritetspolicy</a>
        <a href="VILLKOR">Allmänna villkor</a>
      </div>
    </div>
  </div>
</footer>
```

## Head-mall (anpassa per sida)

```html
<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script data-clean-public-url>
  (function () {
    var path = window.location.pathname;
    if (!path.endsWith(".html")) return;
    var cleanPath = path.endsWith("/index.html")
      ? path.slice(0, -10) || "/"
      : path.slice(0, -5);
    window.history.replaceState(null, "", cleanPath + window.location.search + window.location.hash);
  })();
</script>
<title>DIN UNIKA TITLE | Webbtjänst</title>
<meta name="description" content="DIN UNIKA META (140–160 tecken, med sökord + nytta + CTA)">
<link rel="canonical" href="https://www.webbtjanst.com/DIN-SIDA">
<meta property="og:title" content="…">
<meta property="og:description" content="…">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.webbtjanst.com/DIN-SIDA">
<meta property="og:image" content="https://www.webbtjanst.com/DIN-BILD">
<link rel="icon" href="FAVICON" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="CSS-PATH">
<script defer src="JS-PATH"></script>
<script type="application/ld+json">
{ DIN JSON-LD }
</script>
</head>
```

## Bild-URL:er (Unsplash, med w+h-crop)

Använd ALLTID formatet `…?q=80&w=900&h=700&auto=format&fit=crop`.
Rotnivå-sidor använder `assets/`-sökvägar endast för CSS/JS — bilder är
absoluta Unsplash-URL:er. Hero-bilden på startsidan ska ha
`filter: grayscale(1)` (klassen `.hero-media img` gör det automatiskt).

## Copy-regler (VIKTIGT — Ser 2026-08-08)

- Svensk copy, korta meningar, EN idé per sektion
- Benefit-först: "Din hemsida rankar på 5 sökord i din region" INTE "Vi erbjuder SEO"
- ALDRIG: "Vi erbjuder tjänster", "välkommen till", "vi kan hjälpa dig med allt"
- ALDRIG AI-slop: inga tre-i-rad-listor, inga em-dash-högar (max 2 per stycke),
  inga "delve", "crucial", "testament", "sömlös", "innovativ", "holistisk"
- Specifikt > vage. Siffror, timmar, priser, sökord — inte "snabbt och bra"
- Exakta priser (se Priskort v2 nedan) — använd ALLTID exakta siffror
- En H1 per sida. Rubriker i Playfair, gärna med `.accent`-kursivt blått ord
- Inga placeholder-hrefs ("#"). Inga falska statistik ("0 medlemmar")
- Alla bilder ska ha alt-text och width/height-attribut (eller aspect-ratio via CSS)

## Priskort v2 (EXAKTA priser — facit)

Hemsida (engång, via Klarna):
- Start 15 000 kr — 1 sida + grund-SEO
- Tillväxt 30 000 kr — flersida + lokal SEO (5 sökord) — REKOMMENDERAS
- Premium 60 000 kr — fullt paket + 10 sökord + AI-receptionist rabatterad

AI-receptionist (per månad):
- Start 3 500 kr — 8 timmar/mån
- Tillväxt 8 500 kr — 20 timmar/mån
- Premium 24 800 kr — 60 timmar/mån

Underhåll (per månad, separat tillval):
- Trygg 1 200 kr — 2 nya SEO-sidor/mån, rankningskoll 5 sökord, sajt-bevakning
- Aktiv 3 200 kr — 8 sidor/mån, 15 sökord, innehållsuppdateringar, rapport
- Partner 6 900 kr — 15 sidor/mån, 30+ sökord, hela regionen, konkurrentbevakning,
  Google Business Profile, veckorapport, dedikerad kontakt
- Alla underhållspaket inkluderar månadsrapport (var ni rankar, vad som kom in, vad som byggdes)

## Referensarkiv (9 projekt — exakta uppgifter)

| Projekt | Kategori | Taggar |
|---|---|---|
| Lume Architecture | Design & Arkitektur | #Framer #Architecture |
| Savor Catering | Mat & Restaurang | #Wix Studio #E-com |
| Nova Tech SaaS | Teknik & Mjukvara | #Webflow #SaaS |
| Vantage Legal | Juridik & Finans | #Professional #Trust |
| Studio Pulse | Kreativ Byrå | #Bold #Experimental |
| EcoGarden Shop | E-handel | #Shopify #Eco |
| Quantum AI | Framtidsteknik | #AI #Future |
| Nordic Home | Fastigheter | #Clean #Real Estate |
| Vantage Fitness | Hälsa & Sport | #Dynamic #Gym |

Varje kort: bild, kategori (liten etikett), namn (h3), 1 rad beskrivning,
taggar, länk "Starta Live Demo →" (`.demo-link`) till
`https://demo.webbtjanst.com/<slug>` med target="_blank" rel="noopener nofollow"
(title="Extern demosajt"). Slug: lume-architecture, savor-catering,
nova-tech-saas, vantage-legal, studio-pulse, ecogarden-shop, quantum-ai,
nordic-home, vantage-fitness.

## Undersidor i /tjanster/

Alla fyra: hemsidor.html, lokal-seo.html, ai-receptionist.html, underhall.html
ligger i mappen /tjanster/. De använder `../assets/css/style.css` och
`../assets/js/main.js`, `../favicon.svg`, och ALLA interna länkar prefixas `../`.
