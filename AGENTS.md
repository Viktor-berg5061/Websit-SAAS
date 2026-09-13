# Webbtjanst production repository

## Layout

- `site/` is the exact static production artifact published by GitHub Pages.
- `checkout-backend/` is the Convex + Stripe checkout, webhook, order, lead and outbox backend.
- The root Vite app is the source for the interactive reference demos; it is not the Pages artifact.
- `.github/workflows/pages.yml` verifies both layers, deploys Convex, then publishes `site/`.

## Safety and secrets

- Never commit Stripe keys, webhook secrets, Convex deploy keys or dispatch tokens.
- Runtime Stripe and dispatch secrets belong only in the Convex production environment.
- GitHub Actions needs only `CONVEX_DEPLOY_KEY` in repository Actions secrets.
- Checkout verification may create a live-mode Checkout Session, but must never complete a real charge.
- The current Stripe CLI restricted live key expires on 2026-11-15 and must be rotated in the Convex production environment before then.

## Verification

```powershell
node scripts/verify-production-site.mjs
cd checkout-backend
npm ci
npm test
npm run typecheck
```

Do not push or deploy without explicit owner approval. After a production deployment, verify the Actions run, the real domain, representative desktop/mobile pages, lead OPTIONS, checkout session creation and Stripe webhook health.

Production note (2026-08-17): live Checkout session creation, AI-only coupon scope, session expiration and the signed Stripe-to-Convex webhook were verified without completing a payment.

Navigation/favicon note (2026-08-17): home navigation uses the canonical root path `/`, never `/index.html`. The homepage publishes stable SVG, ICO, 48 px PNG and Apple touch favicon declarations. After changing `site/favicon.svg`, regenerate raster assets with `python scripts/generate-favicons.py`.

Booking note (2026-08-22): `site/boka-mote.html` is the local review surface for Google Appointment Schedules. Shared `site/assets/js/main.js` injects a `Boka möte` navigation link across static pages. Viktor and John each have separate embedded Google schedules. John was renamed from Eddie on 2026-09-13; the owner explicitly confirmed that John's bookings use the connected Eddie Nord Google account, whose Google profile name remains unchanged. John's saved schedule offers 30-minute telephone appointments daily at 17:00, 17:30, 18:00 and 18:30 Europe/Stockholm, with one-hour minimum notice, a 60-day booking window, and busy-calendar conflict checking enabled. The form requires name, email, phone, company and the customer's question; referral source is optional. Do not route John bookings into Viktor's calendar, and do not push the page before owner review.
Booking correction (2026-09-13): Preserve the inline person -> date/time flow; no launcher step and no scrollable calendar wrapper. Each panel preloads a non-interactive mirror calendar beneath the active Google iframe. On a time click, the active iframe immediately becomes transparent while Google's form animates, leaving the preloaded calendar unchanged; after 550 ms the completed form is promoted and clipped to its centered column over a dim backdrop. This prevents the brief form-inside-calendar intermediate state. The small circular × sits at the form's upper-right. Closing hides the resetting active iframe so the mirror remains visible, then reveals the active calendar after its reload completes. Verify both Viktor and John on desktop and mobile without submitting a booking. Both Google calendar connections and schedules remain unchanged.

Clean URL note (2026-09-13): Public navigation, canonical metadata and `sitemap.xml` use extensionless URLs such as `/boka-mote`; physical Pages artifacts remain `.html`. Every HTML document includes the early `data-clean-public-url` history replacement so legacy `.html` visits immediately display the clean path without a reload. `scripts/verify-production-site.mjs` rejects public `.html` links, missing cleanup scripts, broken internal links and `.html` sitemap entries.
