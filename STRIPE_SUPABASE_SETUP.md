# Stripe + Supabase + GitHub Pages (Websit-SAAS)

Mål: quiz → Stripe Checkout → success (form + bokning) → sparas i Supabase + mail till admin.

## 1) Supabase (databas)

1. Skapa ett Supabase-projekt.
2. Gå till **SQL Editor** och kör `supabase/schema.sql`.

## 2) Stripe (engångsbetalning)

1. Skapa 3 produkter + priser (one-time) i Stripe:
   - Basic: 5 000 SEK
   - Professional: 12 900 SEK
   - Business: 24 900 SEK
2. Notera Price IDs:
   - `price_...` för Basic/Professional/Business.

## 3) Supabase Edge Functions

Installera Supabase CLI lokalt (en gång):

```powershell
npm i -g supabase
supabase login
```

I repo-mappen:

```powershell
cd "C:\Users\0901VIBE\OneDrive - Uddevalla kommun\Skrivbordet\Min\Websit-SAAS"
supabase init
```

Lägg in functions (de finns redan i `supabase/functions/` i repot).

### 3.1 Sätt secrets i Supabase

I Supabase Dashboard → **Project Settings → Functions → Secrets** lägg:

- `STRIPE_SECRET_KEY` = Stripe secret key (börjar med `sk_...`)
- `STRIPE_WEBHOOK_SECRET` = webhook signing secret (börjar med `whsec_...`)
- `STRIPE_PRICE_BASIC` = `price_...`
- `STRIPE_PRICE_PROFESSIONAL` = `price_...`
- `STRIPE_PRICE_BUSINESS` = `price_...`
- `SUPABASE_URL` = din project URL
- `SUPABASE_SERVICE_ROLE_KEY` = service role key (hemlig, aldrig i frontend)
- `ADMIN_EMAIL` = `vberg024@gmail.com`

För mail via Resend (rekommenderat):
- `RESEND_API_KEY` = Resend API key
- `RESEND_FROM` = t.ex. `onboarding@resend.dev` (test) eller `info@din-domän.com` (när du har domän)

### 3.2 Deploy functions

```powershell
supabase functions deploy create-checkout-session --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy submit-intake --no-verify-jwt
```

## 4) Stripe webhook

I Stripe Dashboard → **Developers → Webhooks**:

1. Add endpoint:
   - URL: `https://YOUR_PROJECT_REF.functions.supabase.co/stripe-webhook`
2. Events:
   - `checkout.session.completed`
3. Kopiera `Signing secret` → lägg i `STRIPE_WEBHOOK_SECRET` (se ovan).

## 5) GitHub Pages deploy

1. Push till GitHub repo: `Viktor-berg5061/Websit-SAAS`.
2. GitHub repo → **Settings → Pages**:
   - Source: GitHub Actions
3. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_BOOKING_URL` (valfri, t.ex. Calendly)

## 6) Testflöde

1. Öppna siten.
2. Välj paket → quiz → fortsätt → Stripe Checkout.
3. Efter betalning kommer du tillbaka till samma sida med `?success=1&session_id=...`.
4. Fyll i underlag + lägg in bokningslänk (om du har) → Skicka.
5. Kontroll:
   - Supabase `orders`: status ska vara `paid`
   - Supabase `intake_forms`: ny rad
   - Admin mail ska komma (om `RESEND_API_KEY` satt).

