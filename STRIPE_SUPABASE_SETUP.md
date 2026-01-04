# Stripe + Supabase + GitHub Pages (Websit-SAAS) — steg för steg

Mål:
1) Kund väljer paket (quiz)  
2) Kund betalar (Stripe Checkout)  
3) Kund fyller i underlag + bokar möte  
4) Allt sparas i Supabase + mail skickas till `vberg024@gmail.com`

Det här repot är redan förberett med:
- GitHub Pages workflow: `.github/workflows/pages.yml`
- Supabase schema: `supabase/schema.sql`
- Edge Functions: `supabase/functions/*`
- Frontend-flöde: quiz → checkout → success-formulär

---

## 0) GitHub Pages (fix för ditt Actions-fel)

Felet du såg:
`Resource not accessible by integration` / `Create Pages site failed`

Gör detta i GitHub-repot `Viktor-berg5061/Websit-SAAS`:

1. **Settings → Pages**
   - Under “Build and deployment”
   - **Source: GitHub Actions**

2. **Settings → Actions → General**
   - Scrolla ner till “Workflow permissions”
   - Välj **Read and write permissions**
   - Spara

3. Gå till **Actions** och kör workflow igen (Re-run).

---

## 1) Supabase — skapa projekt + databas

1. Skapa ett nytt Supabase-projekt.
2. Gå till **SQL Editor** i Supabase.
3. Kör SQL från `supabase/schema.sql`.

Det skapar tabeller:
- `orders` (Stripe session + status)
- `intake_forms` (kundens svar efter betalning)
- `bookings` (bokade tider)
- `busy_blocks` (blockade tider, för undantag)

---

## 2) Stripe (TEST MODE) — skapa priser

Du sa att du kör sandbox/test mode. Perfekt.

1. Stripe Dashboard → Products → Add product
2. Skapa 3 produkter/priser (one-time):
   - Basic: **5000 SEK**
   - Professional: **12900 SEK**
   - Business: **24900 SEK**
3. Kopiera Price IDs (ser ut som `price_...`) för alla tre.

---

## 3) Resend (mail) — enklast/bäst

För att du automatiskt ska få mail (utan att bygga en egen mailserver) använder vi Resend.

1. Skapa konto på Resend.
2. Skapa en API key (ser ut som `re_...`).
3. Vi använder i test: `onboarding@resend.dev` som “from”.
   - Sen när du har din .com kan du verifiera domänen och byta from-adress.

---

## 4) Supabase Edge Functions — secrets + deploy

### 4.1 Lägg in secrets i Supabase

Supabase Dashboard → **Project Settings → Functions → Secrets**:

Stripe:
- `STRIPE_SECRET_KEY` = Stripe secret key (test: `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` = webhook signing secret (`whsec_...`)
- `STRIPE_PRICE_BASIC` = `price_...`
- `STRIPE_PRICE_PROFESSIONAL` = `price_...`
- `STRIPE_PRICE_BUSINESS` = `price_...`

Supabase:
- `SUPABASE_URL` = din project URL
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (hemlig)

Mail:
- `ADMIN_EMAIL` = `vberg024@gmail.com`
- `RESEND_API_KEY` = din Resend API key
- `RESEND_FROM` = `onboarding@resend.dev`

### 4.2 Deploy Edge Functions (lokalt på din dator)

Installera Supabase CLI (en gång):

```powershell
npm i -g supabase
supabase login
```

I repo-mappen:

```powershell
cd "C:\Users\0901VIBE\OneDrive - Uddevalla kommun\Skrivbordet\Min\Websit-SAAS"
supabase init
```

Deploy:

```powershell
supabase functions deploy create-checkout-session --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy submit-intake --no-verify-jwt
supabase functions deploy booked-slots --no-verify-jwt
```

---

## 5) Stripe webhook → Supabase

Stripe Dashboard → Developers → Webhooks → Add endpoint

- URL:
  - `https://YOUR_PROJECT_REF.functions.supabase.co/stripe-webhook`
- Events:
  - `checkout.session.completed`

Kopiera “Signing secret” (`whsec_...`) och lägg in i Supabase secret:
- `STRIPE_WEBHOOK_SECRET`

---

## 6) GitHub Secrets (frontend)

GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

- `VITE_SUPABASE_URL` = Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = Supabase anon/public key
- `VITE_BOOKING_URL` = din bokningslänk (t.ex. Calendly) (valfri)

---

## 7) Testflöde (så du vet att allt funkar)

1. Vänta tills GitHub Pages deploy är “green”.
2. Öppna Pages-URL:
   - `https://viktor-berg5061.github.io/Websit-SAAS/`
3. Välj paket → quiz → fortsätt → Stripe Checkout.
4. Betala med Stripe testkort:
   - `4242 4242 4242 4242` (valfritt datum i framtiden, valfri CVC)
5. Efter betalning kommer du tillbaka till siten med `?success=1&session_id=...`
6. Fyll i formuläret → Skicka.

Kontroll i Supabase:
- `orders`: ska ha en rad med `status = paid`
- `intake_forms`: ska ha en ny rad

Mail:
- ett mail ska komma till `vberg024@gmail.com` (via Resend)

---

## Om något strular

- Om Stripe-betalning går igenom men `orders` är tom:
  - webhook är inte kopplad rätt (URL eller `STRIPE_WEBHOOK_SECRET`)
- Om success-sidan säger “Order not found yet”:
  - webhook har inte hunnit skriva (vänta 5–10 sek och prova igen)
- Om GitHub Pages visar 404 eller blankt:
  - Settings → Pages → Source: GitHub Actions
  - `vite.config.ts` har `base: './'` (finns redan)
