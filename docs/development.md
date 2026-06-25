# SlideForge Studio — Development Guide

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose
- (Optional) Cursor IDE for AI-assisted development

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd slideforge-studio

# 2. Run automated setup (installs deps, starts Docker, migrates DB, seeds)
bash infrastructure/scripts/setup-dev.sh

# 3. Start all apps
pnpm dev
```

## Manual Setup

```bash
pnpm install
cp .env.example .env          # Edit with your values
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env

pnpm infra:up                  # Start postgres, redis, minio
pnpm db:generate               # Generate Prisma client
pnpm db:migrate                # Run migrations
pnpm db:seed                   # Seed demo data
```

## Service URLs (dev)

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:3001 |
| API docs (Swagger) | http://localhost:3001/docs |
| MinIO console | http://localhost:9001 |
| Prisma Studio | `pnpm db:studio` |

## Monorepo Commands

```bash
pnpm build          # Build all packages and apps
pnpm dev            # Start all apps in watch mode
pnpm lint           # Lint all workspaces
pnpm typecheck      # Type-check all workspaces
pnpm test           # Run all tests
pnpm format         # Format all files with Prettier
```

## Adding a New Package

1. Create directory under `packages/`
2. Add `package.json` with `"name": "@slideforge/<name>"`
3. Add `tsconfig.json` extending `../../tsconfig.base.json`
4. Add entry to `pnpm-workspace.yaml` if needed (auto-detected via glob)

## Database

```bash
pnpm db:migrate        # Create migration from schema diff
pnpm db:migrate:deploy # Apply migrations (production)
pnpm db:push           # Push schema without migration (dev shortcut)
pnpm db:studio         # Open Prisma Studio at localhost:5555
pnpm db:seed           # Seed demo data
```

## Environment Variables

See `.env.example` and `apps/<service>/.env.example` for all required vars.
Validation is handled by `@slideforge/config` using Zod schemas — the app
throws with detailed errors on startup if required vars are missing.
