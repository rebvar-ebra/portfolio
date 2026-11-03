FROM node:22-alpine AS dependencies
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web/package.json web/package.json
RUN pnpm install --frozen-lockfile --filter @rebvar-studio/web... --prod

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/web/node_modules ./web/node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY web ./web
RUN pnpm --dir web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=8080
RUN addgroup -S app && adduser -S -G app app
COPY --from=builder --chown=app:app /app/web/.next/standalone ./
COPY --from=builder --chown=app:app /app/web/.next/static ./web/.next/static
COPY --from=builder --chown=app:app /app/web/public ./web/public
USER app
CMD ["node", "web/server.js"]
