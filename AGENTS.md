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
