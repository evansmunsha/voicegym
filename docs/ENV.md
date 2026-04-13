Environment variables

Create a `.env.local` with these keys for full functionality:

- `DATABASE_URL` — Postgres connection string
- `OPENAI_API_KEY` — OpenAI API key (for server transcription & AI feedback)
- `SESSION_SECRET` — HMAC session secret
- `STRIPE_SECRET_KEY` — Stripe secret key (for checkout)
- `STRIPE_PRICE_ID` — Stripe Price ID for subscriptions

CI

A GitHub Actions workflow is included at `.github/workflows/ci.yml` which runs typechecking and builds on push/pull requests.
