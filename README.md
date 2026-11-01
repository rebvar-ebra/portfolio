# Rebvar Studio

A bilingual, production-oriented portfolio for **Rebvar Ebrahimi**, a full-stack developer in Berlin. It combines an editorial portfolio with a working Restaurant Operations Lab backed by a Go API and PostgreSQL.

Prepared for `rebvar.xyz`; nothing in this repository publishes the site, changes DNS, or connects external accounts.

## What is included

- English and German portfolio routes with Home, Projects, three case studies, About, Contact, and Lab pages.
- Public-safe 3D Scan Platform reconstruction, a working Restaurant Operations case study, and a clearly labelled Go learning project.
- Interactive demo: list/create fictional orders, move them from New → Preparing → Ready, filter the board, view statistics, and receive SSE update notifications.
- Go API with strict JSON decoding, input validation, forward-only transitions, parameterized pgx queries, request-size limits, fixed-window rate limiting, restricted CORS, and a token-protected reset.
- PostgreSQL migration and deterministic fictional seed data.
- Docker Compose stack, CI checks, SEO metadata, sitemap, robots configuration, keyboard/reduced-motion support, and Playwright browser verification.

## Architecture

```mermaid
flowchart LR
  V[Visitor browser] -->|Next.js pages| W[Web container]
  W -->|/api reverse proxy| A[Go API]
  A -->|parameterized SQL| P[(PostgreSQL)]
  A -. orders-changed SSE .-> W
```

The repository deliberately stays small: one frontend, one API, one database. Next.js statically renders portfolio content where possible. The Lab is the only substantial client component. Go owns validation and status-transition rules; PostgreSQL owns persistence and database constraints.

## Technology choices

- **Next.js 16 / React 19 / TypeScript:** statically rendered App Router pages with a focused interactive island.
- **Tailwind CSS 4 plus project CSS:** modern build pipeline with a specific, token-driven visual system rather than a component template.
- **Go 1.26 standard HTTP server:** explicit routes, timeouts, graceful shutdown, and minimal framework surface.
- **PostgreSQL 18:** durable demo data with checks that mirror API bounds.
- **SSE:** one-way invalidation notifications are simpler than WebSockets for this demo.
- **Docker Compose:** reproducible local stack without introducing orchestration the project does not need.

## Requirements

- Node.js 22+
- pnpm 9.15+
- Go 1.26+
- Docker with Compose v2+
- Python 3.12 and Playwright only for browser verification

## Run with Docker Compose

```bash
cp .env.example .env
# Replace the local password and reset token in .env.
docker compose up --build --wait
```

Open [http://localhost:3000/en](http://localhost:3000/en). The API health endpoint is [http://localhost:8080/healthz](http://localhost:8080/healthz).

Stop the stack without deleting demo data:

```bash
docker compose down
```

## Run services directly

Start PostgreSQL first (the Compose database is convenient):

```bash
docker compose up -d db
```

Run the API:

```bash
cd api
DATABASE_URL='postgres://portfolio:portfolio-local-only@localhost:5432/portfolio?sslmode=disable' \
DEMO_RESET_TOKEN='local-reset-token-change-me' \
ALLOWED_ORIGIN='http://localhost:3000' \
go run ./cmd/server
```

Run the web app in another terminal:

```bash
pnpm install
API_INTERNAL_URL='http://localhost:8080' pnpm --dir web dev
```

## Environment variables

| Variable | Service | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API | PostgreSQL connection string; assembled by Compose. |
| `DEMO_RESET_TOKEN` | API | Required in `X-Demo-Reset-Token` for manual reset. Use a long random production value. |
| `ALLOWED_ORIGIN` | API | Exact browser origin allowed by CORS. |
| `RATE_LIMIT` | API | Requests per IP per one-minute fixed window. |
| `TRUSTED_PROXY_CIDRS` | API | Comma-separated proxy CIDRs allowed to supply the client IP via `X-Forwarded-For`. Set this to the precise proxy network in production. |
| `API_INTERNAL_URL` | Web | Server-side/proxy origin for the Go service. |
| `WEB_PORT`, `API_PORT` | Compose | Optional host-port overrides. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Database | Local database configuration. |

Never commit `.env`. Public browser code receives no reset token or database secret.

## Seed and reset behavior

On a brand-new database volume, `api/db/migrations/001_init.sql` creates the table and inserts three fictional orders. Existing volumes are not silently reset.

Manual API reset:

```bash
curl -i -X POST http://localhost:8080/api/demo/reset \
  -H 'X-Demo-Reset-Token: local-reset-token-change-me'
```

Manual SQL reset:

```bash
docker compose exec -T db psql -U portfolio -d portfolio < api/db/reset.sql
```

There is no automatic reset scheduler. For a public deployment, run the protected reset from a trusted scheduler or replace this strategy with short-lived demo rows; do not expose the reset token to the browser.

## Checks

```bash
pnpm --dir web test
pnpm --dir web typecheck
pnpm --dir web lint
pnpm --dir web build
(cd api && go test -race ./... && go vet ./...)
docker compose config --quiet
docker compose build
```

Browser smoke test on a running stack:

```bash
python3 -m pip install --target .e2e-deps -r e2e/requirements.txt
PYTHONPATH=.e2e-deps E2E_RESET_TOKEN='local-reset-token-change-me' python3 e2e/smoke.py
```

The script verifies desktop navigation, keyboard skip-link focus, order creation, status change, filtering, SSE connection, console errors, German mobile navigation, horizontal overflow, and screenshots in `artifacts/e2e/`.

## API summary

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Container health. |
| `GET` | `/api/orders?status=` | List all or filter by `new`, `preparing`, `ready`. |
| `POST` | `/api/orders` | Create a fictional order with `item` and `quantity`. |
| `PATCH` | `/api/orders/{id}/status` | Advance one status step. |
| `GET` | `/api/stats` | Return current counts. |
| `GET` | `/api/events` | SSE invalidation stream. |
| `POST` | `/api/demo/reset` | Protected deterministic reset. |

## Deployment preparation for `rebvar.xyz`

1. Build and publish the web and API images to the chosen container registry.
2. Provision a managed PostgreSQL database and run `api/db/migrations/001_init.sql` once.
3. Set `DATABASE_URL`, a random `DEMO_RESET_TOKEN`, `ALLOWED_ORIGIN=https://rebvar.xyz`, `RATE_LIMIT`, and `API_INTERNAL_URL` in the deployment platform.
4. Route `rebvar.xyz/*` to the web service and proxy `rebvar.xyz/api/*` to the API (or keep the Next.js rewrite pointed at the private API origin).
5. Terminate TLS at the platform/load balancer, preserve streaming for `/api/events`, and confirm the SSE proxy does not buffer responses.
6. Run the full checks and browser smoke script against the staging URL.
7. Only after review, connect DNS for `rebvar.xyz`. This repository does not perform that step.

## Information still needed before launch

- Verified public GitHub URL.
- A privacy-reviewed public résumé URL or PDF (the supplied CV contains a phone number and street address, so it is not copied into the public site).
- Confirmed availability wording.
- Screenshots and any additional details explicitly approved for the 3D Scan Platform case study.
- Verified features, repository URL, and screenshots for the Go E-commerce learning project.
- Repository URL for this portfolio, if it should be public.
- Final legal notice/imprint and privacy wording appropriate to the operator and hosting setup.
- Open Graph image or approved portrait/visual asset.
- Hosting provider, production database, registry, and secret-management choices.

Until these are supplied, the site shows honest placeholders rather than fabricated contact details or claims.
