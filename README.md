# Rebvar Studio

Bilingual portfolio for Rebvar Ebrahimi, a full-stack developer in Berlin. The production site is available at [rebvar.xyz](https://rebvar.xyz/).

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 with a small token-based global stylesheet
- Static generation for English and German pages
- Docker standalone output for self-hosted deployment

The portfolio intentionally has no runtime API or database. Project content is statically generated, which keeps deployment and maintenance simple.

## Local development

Requirements: Node.js 22+ and pnpm 9.15+.

```bash
pnpm install --frozen-lockfile
pnpm --dir web dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

No environment variables are required. Local `.env*` files are ignored. If variables are added later, commit only a redacted `.env.example` containing placeholders.

## Quality checks

```bash
pnpm --dir web test
pnpm --dir web typecheck
pnpm --dir web lint
pnpm --dir web build
```

The production build currently pre-renders all localized portfolio and project routes.

## Docker

```bash
docker compose up --build --wait
```

The container runs as a non-root user, uses the Next.js standalone server, and exposes the site on port `3000` by default. Override the host port with `WEB_PORT` if needed.

## Browser smoke test

With the site running:

```bash
python3 -m pip install --target .e2e-deps -r e2e/requirements.txt
PYTHONPATH=.e2e-deps python3 e2e/smoke.py
```

The script checks English desktop navigation, German mobile navigation, keyboard access, key project and contact pages, console errors, and horizontal overflow.

## Deployment

The repository is configured for `https://rebvar.xyz`. Build the `web` image or upload the output produced by `pnpm --dir web build` using the hosting workflow for that domain.

Security-related configuration includes removal of the `X-Powered-By` header, clickjacking protection, MIME sniffing protection, a strict referrer policy, and a restrictive permissions policy.
