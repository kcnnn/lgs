# Decisions

Choices made where the spec was silent or ambiguous, plus notable engineering
tradeoffs made while building RooferClaw Scope.

## Stack details

- **Next.js 16 / React 19.2**. The repo was scaffolded against Next 16 (App
  Router), which is newer than the "14+" floor in the spec. Async `params`,
  `searchParams`, and route-handler `context.params` are used throughout (all
  `Promise`-typed per Next 16). `middleware.ts` is written as `proxy.ts` per
  the Next 16 rename, guarding `/admin/**`.
- **Auth.js (next-auth) v5 beta.31** with the Prisma adapter and **database**
  sessions (not JWT), so a change to `credits` or `isAdmin` is reflected on
  the next request without re-authenticating. The `Nodemailer` provider is
  used for magic links; a separate `lib/mailer.ts` (also nodemailer, pointed
  at the same `EMAIL_SERVER`) sends the operational emails (admin
  "ready to trace", failure, and customer delivery notices) since those aren't
  sign-in emails and don't belong in the auth provider.
- **Leaflet + leaflet-draw** are used directly (imperative API) rather than
  `react-leaflet`, which does not yet support React 19 in a version compatible
  with this Leaflet version. This also better suits the tracing tool, which
  needs fine-grained control over draw events, per-layer restyling, and a
  bespoke scale-calibration mode that doesn't map cleanly onto a declarative
  wrapper.
- **BullMQ connection options** are constructed by hand from `REDIS_URL`
  (host/port/username/password) rather than passing a shared `ioredis`
  instance, because BullMQ vendors its own `ioredis` copy and the two
  packages' types are not structurally compatible when mixed.

## Data model

- Added `emailVerified DateTime?` and `Account`/`Session`/`VerificationToken`
  models to `User`/schema beyond the spec's Prisma listing — required by the
  Auth.js Prisma adapter contract, not optional.
- Added `webodmProjectId` alongside the spec's `webodmTaskId`, since WebODM
  task IDs are scoped to a project and both are needed to call the WebODM API
  for polling/downloads.
- Added `failureReason String?` on `Job` to hold the human-readable reason
  shown on the customer status page and admin dashboard when `status =
  FAILED`.

## Business logic choices

- **Squares vs. materials math**: material formulas (`shingleBundles`,
  `underlaymentRolls`) use the **rounded, displayed** `squares` value (2
  decimals) as their input, not the unrounded slope area / 100. This matches
  what a person reading the report table would compute by hand, which is the
  behavior the "matches unit-test fixtures within 1%" acceptance criterion is
  checking for.
- **Hip/valley 5% allowance** is applied to the grouped LF total per edge
  type, after summing all polylines of that type — not per individual
  polyline before summing. Order doesn't affect the result here (the
  allowance is a flat multiplier) but it's simpler to compute once per type.
- **Materials list depends only on `ridge`/`hip`/`eave`/`rake`/`valley`**
  edge types; `step_flashing` and `wall_flashing` are captured, priced into
  nothing in §8 (the spec's material formulas never reference them), and
  simply appear in the edge-length table and the trace data for the admin's
  reference / future use.

## Report generation

- The facet overlay is composited **server-side with `sharp`** onto a
  downscaled (max 1600px wide) copy of the orthophoto PNG, then embedded in
  the report HTML as a base64 data URI — no extra S3 round-trip or public URL
  needed for Puppeteer to render it, and no CORS/auth concerns.
- Per the spec, only facet polygons + labels are drawn on the report's ortho
  image (not edges/penetrations) — matches "ortho image with facet polygons +
  labels drawn on top" in §9 literally, and keeps the report focused.
- CSV numeric fields are rounded to 1 decimal (materials list) except the
  integer quantities (bundles, rolls, sticks, penetration count), which are
  already whole numbers from `Math.ceil`.

## Landing page

- `content/testimonials.json` ships as `[]` — no real testimonials exist yet,
  and inventing placeholder quotes would be dishonest marketing copy. Per
  §5.1.7 this means the section is hidden entirely, which is the correct,
  spec-compliant behavior until real testimonials are supplied.
- Comparison table numbers in `lib/comparison.ts` (EagleView/Hover turnaround
  and pricing) are placeholder estimates in the same ballpark as public
  marketing claims from those competitors, pending real figures — the file is
  isolated specifically so they're a one-line edit.
- Founder bio, photo, and Part 107 badge are rendered as clearly-labeled
  placeholders (per spec, final copy/assets are supplied separately).
  `public/hero-demo.mp4` is referenced by the hero `<video>` but not included.

## Infra / deployment

- `docker-compose.yml` runs `app`, `worker`, `postgres`, and `redis` per spec.
  Nginx itself isn't containerized (the VPS's existing Nginx reverse-proxies
  to the `app` container's exposed port), matching "single Ubuntu VPS behind
  Nginx" — Nginx config isn't part of this repo.
- `Dockerfile.worker` installs the Debian `chromium` package for Puppeteer
  (`PUPPETEER_SKIP_DOWNLOAD=1` + `PUPPETEER_EXECUTABLE_PATH`) rather than
  bundling Puppeteer's own Chromium download, since apt keeps the image
  smaller and matches the target OS in the spec.
- WebODM task options are fixed at `{ dsm: true, "orthophoto-resolution": 2,
  "pc-quality": "medium", "auto-boundary": true }` exactly as specified, with
  no admin-facing UI to change them (spec doesn't ask for one).

## Testing

- `lib/measure.ts` is fully unit-tested (Vitest) against a hand-computed
  40ft×30ft single-facet fixture roof at a 6/12 pitch with ridge/eave/rake/
  hip/valley edges (see `lib/measure.test.ts`) — all values (plan area, slope
  area, squares, edge totals with hip/valley allowance, full materials list)
  are asserted against independently hand-calculated numbers.
- End-to-end smoke testing (magic-link login → admin flag → credits → job
  creation → upload page → Leaflet tracing UI → calibration → facet drawing →
  compute/save → PDF+CSV report generation) was run manually against a local
  Postgres/Redis/fake-SMTP stack in this environment; WebODM and Stripe
  integration could not be exercised end-to-end since no live WebODM instance
  or Stripe test account was available here — see README for how to test
  those with real credentials.
