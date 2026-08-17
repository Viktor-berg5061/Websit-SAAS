# Webbtjanst.com

Production repository for Webbtjanst.com.

- `site/`: static site published by GitHub Pages.
- `checkout-backend/`: Convex backend for Stripe Checkout, verified webhooks, orders, leads and delivery outbox jobs.
- Root Vite app: interactive reference demos used by the production site.

The GitHub Actions workflow verifies the static artifact and backend, deploys Convex with the repository secret `CONVEX_DEPLOY_KEY`, and publishes `site/` only after both verification jobs pass.

See `AGENTS.md` for operational and secret-handling rules.
