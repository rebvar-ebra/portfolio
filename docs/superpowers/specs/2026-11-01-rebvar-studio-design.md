# Rebvar Studio Portfolio Design

## Intent

Build a production-ready bilingual portfolio that lets recruiters understand Rebvar Ebrahimi quickly, lets engineering teams inspect honest case studies, and lets visitors try a small but real full-stack product. The site must make credibility visible through clear decisions and functioning software rather than invented metrics or claims.

## Audience and primary journeys

- Recruiters scan the first screen, selected work, skills, education, and contact path.
- Engineering managers read case studies and inspect the architecture of the live lab.
- Visitors create a fictional restaurant order, change its state, filter the board, and see summary data update.
- English is the default at `/en`; German is available at `/de`, with all public copy stored in a single typed content module.

## Goals

- Distinctive, responsive, accessible portfolio with Home, Projects, project detail, About, Contact, and Lab routes.
- Honest case studies for the 3D Scan Platform, Restaurant Operations Demo, and Go E-commerce learning project.
- Go REST API backed by PostgreSQL for demo orders, with validation, rate limiting, request-size limits, restricted CORS, and Server-Sent Events.
- Docker Compose local environment, CI checks, environment documentation, seed/reset workflow, SEO metadata, sitemap, and robots configuration.
- Explicit placeholders for unverified email, GitHub, LinkedIn, résumé URL, legal details, and missing Go project specifics.

## Non-goals

- Publishing, DNS changes, email-provider integration, analytics, authentication, payments, or real customer data.
- Claims about employers, dates, outcomes, scale, production Go experience, or private source code.
- Automatic demo resets unless a scheduler is later configured; a protected manual reset endpoint and command are sufficient.

## Architecture

The repository contains `web/` (Next.js App Router, React, TypeScript, Tailwind CSS), `api/` (Go standard-library HTTP service with pgx), and root Docker/CI documentation. Next.js renders portfolio content statically where possible. The Lab is a focused client component that calls the Go API and subscribes to an SSE endpoint. PostgreSQL stores fictional orders; SQL migrations create the schema and seed deterministic sample data.

The API exposes `GET /api/orders`, `POST /api/orders`, `PATCH /api/orders/{id}/status`, `GET /api/stats`, `GET /api/events`, `POST /api/demo/reset`, and `GET /healthz`. The reset endpoint requires `X-Demo-Reset-Token`. Status values are `new`, `preparing`, and `ready`; order names are short fictional labels, not personal information.

## Content and privacy

All personal and project content lives in `web/src/content/site.ts`. Verified facts are copied from the brief. Unknown contact links and details are represented as `null`, rendered as clearly labelled “Details needed” states, and listed in the README. The contact page does not submit data; it explains that a verified email address is still needed. The 3D platform case study is explicitly a public-safe reconstruction with no confidential screenshots or metrics.

## Visual design

### Direction

“Field notes from a product engineer”: a deep navy drafting surface, paper-white type, ember-orange signals, desaturated cyan construction lines, and compact annotation marks. The memorable element is the interactive request-path diagram in the hero, showing a request moving through browser, API, and database. Everything else stays typographically calm and editorial.

### Tokens

- `ink` `#071016`: page background
- `panel` `#0D1A21`: raised working surface
- `paper` `#F2F0E8`: primary text
- `muted` `#9BA9AC`: secondary text
- `signal` `#FF6B35`: primary action and focus
- `trace` `#6FC7C2`: system paths and live state
- Display/body: local font stack led by `Aptos`, `Segoe UI`, sans-serif; technical annotations use `ui-monospace`. No remote font request is required.

### Layout

Desktop uses a 12-column measured grid with a left-weighted hero and the request path crossing the right side. Mobile collapses to one column and keeps the diagram horizontal-scroll-free.

```text
desktop                         mobile
┌───────────────────────────┐   ┌──────────────┐
│ mark     nav    EN / DE   │   │ mark    menu│
├──────────────┬────────────┤   ├──────────────┤
│ headline     │ request    │   │ headline     │
│ intro + CTAs │ path       │   │ CTAs         │
├──────────────┴────────────┤   │ request path │
│ selected work / approach  │   ├──────────────┤
└───────────────────────────┘   │ selected work│
                                └──────────────┘
```

### Principles

- Grid lines encode architecture and relationships; they are not decorative card borders.
- Motion appears only in the request-path pulse, live-update feedback, and direct interaction states; reduced-motion disables it.
- Copy is direct, specific, and avoids sales claims.
- Visible focus, semantic landmarks, skip link, 44px targets, non-color status labels, and AA contrast are mandatory.

### Uniqueness review

The initial “dark + acid accent + monospace labels” concept risked a generic developer-portfolio look. The revision uses a deep blue drafting surface rather than near-black, orange only for decisions/actions, cyan only for data flow, sentence-case annotations, asymmetric editorial spacing, and a functional request-path visual tied directly to Rebvar’s full-stack story.

## Quality and verification

- Go tests cover validation, status transitions, filtering, rate limits, reset authorization, and handler responses using a real in-memory repository implementation.
- Frontend tests cover locale/content behavior and Lab calculations/state utilities; Playwright verifies primary navigation and lab interaction against the running stack.
- Final checks: formatting, lint, type-check, unit tests, Go race tests, production builds, Docker Compose startup, API smoke test, desktop/mobile screenshots, keyboard path, console errors, and a guideline audit.

## Deployment preparation

The documented target is `rebvar.xyz`, with the web app at the root and `/api/*` reverse-proxied to the Go service. No deployment or DNS mutation is authorized. A production operator must supply database credentials, allowed origin, reset token, public API URL, and verified personal/contact links.
