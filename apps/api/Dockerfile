# Build from monorepo root (Coolify base_directory: /)
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate --schema=prisma/schema.prisma
RUN pnpm --filter @slideforge/api... build
RUN pnpm deploy --filter @slideforge/api --prod /prod/api
RUN cp -r /app/apps/api/dist /prod/api/dist && \
    cp -r /app/node_modules/.pnpm/@prisma+client@*/node_modules/.prisma /prod/api/node_modules/.prisma

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache openssl curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /prod/api ./
COPY --from=builder /app/prisma ./prisma

USER nestjs
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fs http://localhost:3001/api/v1/health || exit 1

CMD ["sh", "-c", "node_modules/.bin/prisma migrate resolve --rolled-back 20250625180000_init --schema=prisma/schema.prisma 2>/dev/null || true; node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma && node dist/main.js"]
