# Rebvar Studio

Bilingual portfolio for Rebvar Ebrahimi, a full-stack developer in Berlin. The production site is available at [rebvar.xyz](https://rebvar.xyz/).

## Stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4 with a small token-based global stylesheet
- Sanity-backed English and German content with an embedded editor at `/studio`
- Server-side contact delivery through Resend without publishing the recipient address
- Docker standalone output for self-hosted deployment

## Local development

Requirements: Node.js 22+ and pnpm 9.15+.

```bash
pnpm install --frozen-lockfile
pnpm --dir web dev
```

Copy `.env.example` to an ignored local environment file and provide the server-only contact and webhook secrets. The public Sanity defaults point to project `x34rtnfv` and dataset `production`. Then open [http://localhost:3000/en](http://localhost:3000/en).

## Quality checks

```bash
pnpm --dir web test
pnpm --dir web typecheck
pnpm --dir web lint
pnpm --dir web build
```

The production build statically generates known localized routes and revalidates portfolio content from Sanity at runtime.

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

The repository is configured for `https://rebvar.xyz`. Build the `web` image or upload the Next.js standalone output using the hosting workflow for that domain. Production needs the variables documented in `.env.example`; `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and `SANITY_REVALIDATE_SECRET` must remain server-only.

Sanity must allow credentialed CORS from `https://rebvar.xyz`. Configure a signed webhook for `portfolioSiteSettings` and `portfolioProject` publish/update/delete events at `https://rebvar.xyz/api/sanity/revalidate`, using the same `SANITY_REVALIDATE_SECRET` as the host.

Security-related configuration includes removal of the `X-Powered-By` header, clickjacking protection, MIME sniffing protection, a strict referrer policy, and a restrictive permissions policy.
