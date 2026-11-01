# Rebvar Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual Next.js portfolio and functioning Go/PostgreSQL restaurant operations demo for Rebvar Ebrahimi.

**Architecture:** A statically rendered Next.js App Router portfolio consumes typed bilingual content while a focused client-side Lab talks to a Go REST/SSE service backed by PostgreSQL. Docker Compose runs the web, API, and database, with a deterministic migration and protected manual reset.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Vitest, Go, pgx, PostgreSQL, Docker Compose, Playwright

**Spec:** `docs/superpowers/specs/2026-11-01-rebvar-studio-design.md`

## Global Constraints

- Do not publish, modify DNS, or connect external accounts.
- Do not invent personal details, employment facts, metrics, links, or production Go experience.
- Store all personal and project content in `web/src/content/site.ts`.
- Support English and German at `/en` and `/de`, redirecting `/` to `/en`.
- Keep the public demo fictional, isolated, validated, rate-limited, and manually resettable.
- Respect keyboard navigation, visible focus, WCAG AA contrast, and `prefers-reduced-motion`.

## Review Focus

- Malformed, oversized, or unknown JSON fields must return a safe 4xx response, never mutate data, and never panic.
- Concurrent order updates and SSE clients must not race or block normal requests.
- Unsupported locale or project slugs must produce a real 404, not English content under a misleading URL.
- The Lab must retain useful loading, empty, disconnected, and API-error states on narrow screens.
- Missing personal links must remain explicit placeholders and must not generate broken anchors or fake contact forms.

---

### Task 1: Repository foundation and typed portfolio content

**Files:** Create root configuration, `web/` package/App Router files, `web/src/content/site.ts`, locale helpers, and locale/content tests.

**Interfaces:** Produces `Locale`, `getSiteContent(locale)`, `projects`, and route metadata consumed by all portfolio pages.

- [ ] Write failing Vitest tests for locale parsing, bilingual required content, invalid locale handling, and absent-link placeholders.
- [ ] Run the targeted tests and confirm failure because the content/locale modules do not exist.
- [ ] Add the minimal Next.js/TypeScript/Tailwind scaffold and typed content modules.
- [ ] Run the targeted tests, then the frontend suite, type-check, and lint.

### Task 2: Portfolio shell, pages, case studies, and design system

**Files:** Create locale layout, global CSS, navigation/footer, request-path visual, Home, Projects, project detail, About, Contact, metadata, sitemap, robots, loading, error, and not-found UI.

**Interfaces:** Consumes Task 1 content; produces semantic routes `/[locale]/*` and reusable layout/components.

- [ ] Write failing component/route utility tests for project lookup and generated localized paths.
- [ ] Confirm the tests fail for missing helpers.
- [ ] Implement the accessible responsive pages and blueprint editorial system, with reduced-motion support.
- [ ] Run frontend tests, type-check, lint, and production build.

### Task 3: Go order domain and HTTP API

**Files:** Create `api/` module, domain/repository/service/handler packages, PostgreSQL repository, migration, seed/reset SQL, middleware, and Go tests.

**Interfaces:** Produces the documented REST/SSE endpoints and JSON shapes consumed by the Lab.

- [ ] Write failing Go tests for order validation, status transitions, filters, stats, reset authorization, request-size/JSON rejection, CORS, and rate limiting.
- [ ] Run targeted tests and confirm compile failures from missing production types.
- [ ] Implement domain logic through an interface-backed service, HTTP handlers, SSE hub, middleware, and pgx repository.
- [ ] Run `go test -race ./...` and `go vet ./...`.

### Task 4: Restaurant Operations Lab

**Files:** Create Lab types, API client, pure state/stat utilities, Lab components/styles, and Vitest tests.

**Interfaces:** Consumes Task 3 endpoints; produces `/[locale]/lab` with list, create, transition, filter, stats, connection status, and recovery states.

- [ ] Write failing tests for status progression, filtering, statistic calculation, and input validation.
- [ ] Confirm expected failures for missing Lab utilities.
- [ ] Implement the client, SSE refresh behavior, optimistic-safe mutations, and accessible controls.
- [ ] Run frontend tests, type-check, lint, and build.

### Task 5: Containers, CI, documentation, and end-to-end verification

**Files:** Create Dockerfiles, Compose file, `.env.example`, GitHub Actions workflow, Playwright smoke test, and `README.md`.

**Interfaces:** Produces the documented one-command local stack and deployment-ready configuration for `rebvar.xyz`.

- [ ] Add a failing end-to-end smoke test for navigation, order creation, filtering, and status change.
- [ ] Build and start the Compose stack; confirm the smoke test initially fails before the integrated stack is complete.
- [ ] Complete container health checks, environment wiring, CI, seed/reset commands, architecture/deployment docs, and missing-information checklist.
- [ ] Run all frontend and Go checks, Compose/API smoke checks, Playwright desktop/mobile flows, screenshots, keyboard/console inspection, and final UI guideline audit.
