# RooferClaw Scope

Drone-to-scope roof measurement service. Contractors upload drone photos, an
admin traces the roof facets over the generated orthomosaic, and the customer
gets a branded PDF measurement report plus a CSV of line items.

See `DECISIONS.md` for choices made where the spec was silent.

## Stack

Next.js 16 (App Router, TypeScript) + Tailwind CSS · PostgreSQL via Prisma ·
Auth.js v5 (magic-link email auth) · Stripe Checkout (one-time payments) ·
S3-compatible storage (Hetzner Object Storage) via AWS SDK v3 · BullMQ + Redis
worker · Puppeteer (PDF reports) · Leaflet + leaflet-draw (tracing UI) ·
external WebODM instance for photogrammetry.

## Local setup

### Prerequisites

- Node.js 20.9+ (Next 16 requirement)
- PostgreSQL and Redis (locally installed, or via `docker-compose up postgres
  redis`)
- A running WebODM instance reachable over HTTP (not part of this repo)
- An SMTP server for magic-link and notification emails (any provider, or a
  local catch-all like [MailHog](https://github.com/mailhog/MailHog) /
  [Mailpit](https://github.com/axllent/mailpit) for development)
- An S3-compatible bucket (Hetzner Object Storage in production; MinIO works
  for local testing)
- A Stripe account in test mode

### Install

```bash
npm install
cp .env.example .env
# fill in .env — see "Environment variables" below
npx prisma migrate dev
npm run dev
```

The app runs at `http://localhost:3000`. Run the worker in a separate
terminal (it shares the same `.env`):

```bash
npm run worker
```

### Environment variables

All variables are listed in `.env.example`. Notable ones:

- `DATABASE_URL` — Postgres connection string.
- `REDIS_URL` — used by both the app (to enqueue jobs) and the worker.
- `EMAIL_SERVER` / `EMAIL_FROM` — SMTP connection string for magic links
  *and* operational emails (job-ready, failure, delivery notices).
- `STRIPE_*` — Stripe secret key, webhook signing secret, and the three price
  IDs for the $35 / $150 / $500 packs (create these as one-time Prices in the
  Stripe dashboard).
- `S3_*` — endpoint, region, bucket, and credentials for the object store.
  Presigned uploads use path-style addressing.
- `WEBODM_*` — base URL and credentials for your existing WebODM instance.
- `ADMIN_EMAILS` — comma-separated list; these users get `isAdmin = true` the
  first time they sign in.
- `NEXT_PUBLIC_DEMO_EMBED_URL` — PlayCanvas iframe URL for the landing page's
  3D demo section (optional; the section shows a placeholder if unset).

### Database

```bash
npx prisma migrate dev     # apply migrations locally
npx prisma studio          # browse data
```

### Tests

```bash
npm test          # Vitest — lib/measure.ts unit tests against a hand-computed fixture roof
npx tsc --noEmit   # typecheck
npx eslint .       # lint
```

### Testing Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET
stripe trigger checkout.session.completed
```

## Docker Compose (deployment)

```bash
cp .env.example .env   # fill in real values
docker compose up -d --build
```

This runs four services: `app` (Next.js), `worker` (BullMQ worker + Puppeteer
+ Chromium), `postgres`, and `redis`. Point your VPS's Nginx at the `app`
container's port 3000 and terminate TLS there; Nginx itself isn't part of
this compose file. Run migrations against the compose Postgres before first
boot:

```bash
docker compose run --rm app npx prisma migrate deploy
```

## Project structure

- `app/` — routes (marketing pages, customer job flow, admin tools, API
  routes)
- `lib/` — shared server logic: Prisma client, auth config, Stripe/S3/WebODM
  clients, BullMQ queues, mailer, roofing measurement math (`measure.ts`)
- `worker/` — standalone BullMQ worker process: WebODM polling
  (`webodm-processor.ts`) and report generation (`report-generator.ts`,
  `overlay.ts`, `report-template.ts`, `csv.ts`)
- `components/` — client UI: header, pricing cards, upload dropzone, the
  Leaflet tracing tool
- `prisma/schema.prisma` — data model
- `content/testimonials.json` — landing page testimonials (hidden if fewer
  than 3 entries)
