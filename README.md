# SlideForge Studio

AI-powered presentation builder. Monorepo with NestJS API, Next.js web, and Python worker.

## Delivery status (2026-06-25)

**Pushed commits on `main`:**

| SHA | Message |
|-----|---------|
| `d16cfd4` | feat(api): JWT auth guards, service hardening, security docs |
| `e09c9ab` | feat(db): Prisma schema, initial migration, worker config |
| `f1ed101` | feat(web): Next.js UI wired to API, shared UI components |
| `f559af4` | docs: delivery checklist, migration steps, Coolify blocker notes |

Remote: https://github.com/wesleymaia86/slideforge-studio (`main` @ `f559af4`)

### Functional vs stubbed

| Area | Status | Notes |
|------|--------|-------|
| Auth (email/password, JWT) | **Functional** | Register, login, `/auth/me`, global JWT guard + `@Public()` |
| Workspaces CRUD | **Functional** | API + web pages wired via React Query |
| Projects / decks / slides | **Functional** | CRUD + editor/outline pages |
| File upload + processing jobs | **Functional** | Multipart upload → BullMQ queue → worker callbacks |
| Worker parsing (xlsx/csv/pdf/docx) | **Functional** | Celery + FastAPI health on port 8000 |
| Brand kits | **Functional** | CRUD API + controllers |
| Briefing + AI outline | **Partial** | Endpoints exist; AI client stub, needs provider keys |
| Insights | **Partial** | Worker generates basic insights; UI lists them |
| Export jobs | **Stubbed** | API creates records; no PPTX/PDF renderer yet |
| Magic link / Google / Microsoft OAuth | **Stubbed** | Routes return placeholder responses |
| Stripe billing | **Stubbed** | Env schema only |
| Admin panel | **Functional** | Super-admin stats/users/workspaces (API + web) |
| Prisma migrations | **Ready** | `prisma/migrations/20250625180000_init/` — run against Postgres |
| Coolify deploy | **Blocked** | Project + DB + Redis created; apps need GitHub App UUID (see `docs/coolify.md`) |
| API production start | **Needs fix** | `nest build` emits `dist/apps/api/src/main.js`; start script expects `dist/main` |

## Stack

| Layer | Technology |
|-------|-----------|
| API | NestJS 10, Prisma 5, BullMQ, TypeScript |
| Worker | Python 3.12, FastAPI, Celery, Redis |
| Database | PostgreSQL 16 (pgvector) |
| Queue | Redis 7 |
| Storage | S3-compatible (MinIO for local dev) |
| Auth | JWT + email/password (magic link + OAuth stubs) |

## Quick start

```bash
# 1. Start infrastructure (requires Docker)
docker compose up -d postgres redis minio

# 2. Install dependencies
pnpm install

# 3. Copy env templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env   # or merge into root .env
cp apps/web/.env.example apps/web/.env.local

# 4. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate:deploy   # production / CI
# or: pnpm db:migrate     # interactive dev

# 5. Start API
pnpm --filter @slideforge/api dev

# 6. Start web (separate terminal)
pnpm --filter @slideforge/web dev

# 7. Start worker (separate terminal)
cd apps/worker
pip install -r requirements.txt
celery -A celery_app.celery_app worker --loglevel=info --queues=processing
# Or run the FastAPI health server:
uvicorn main:app --reload --port 8000
```

> **No Docker on this machine?** Install Docker Desktop, then run the commands above. Migration only:
> `pnpm db:generate && pnpm db:migrate:deploy` with `DATABASE_URL` pointing at your Postgres instance.

## Environment

Copy `.env.example` to `.env` and fill in values. See also `apps/worker/.env.example`.

## Endpoints (API prefix: `/api/v1`)

### Auth
- `POST /auth/register` — email + password registration
- `POST /auth/login` — email + password login
- `POST /auth/magic-link` — request magic link (stub)
- `GET  /auth/google` — Google OAuth redirect (stub)
- `GET  /auth/microsoft` — Microsoft OAuth redirect (stub)
- `GET  /auth/me` — current user profile (JWT required)

### Workspaces
- `POST   /workspaces` — create workspace
- `GET    /workspaces` — list my workspaces
- `GET    /workspaces/:workspaceId`
- `PATCH  /workspaces/:workspaceId`
- `DELETE /workspaces/:workspaceId` (owner only)
- `GET    /workspaces/:workspaceId/members`
- `POST   /workspaces/:workspaceId/members` — invite
- `DELETE /workspaces/:workspaceId/members/:userId`

### Projects / Decks / Slides
- CRUD under `/workspaces/:workspaceId/projects`
- Decks under `/workspaces/:workspaceId/projects/:projectId/decks`
- Slides CRUD + reorder under `.../decks/:deckId/slides`

### Brand Kits
- CRUD under `/workspaces/:workspaceId/brand-kits`

### File Assets
- `POST /workspaces/:workspaceId/file-assets/upload` (multipart) → creates ProcessingJob
- `GET  /workspaces/:workspaceId/file-assets`
- `GET  /workspaces/:workspaceId/file-assets/:assetId/presigned-url`

### Processing Jobs
- `GET  /workspaces/:workspaceId/processing-jobs`
- `GET  /workspaces/:workspaceId/processing-jobs/:jobId`
- `POST /internal/jobs/progress` (worker callback, x-worker-key header)
- `POST /internal/jobs/artifact` (worker callback)

### Insights
- CRUD under `/workspaces/:workspaceId/insights` with `?jobId=` / `?artifactId=` filters

### Briefing & Outline
- `POST /workspaces/:workspaceId/decks/:deckId/briefings`
- `POST /workspaces/:workspaceId/decks/:deckId/briefings/:briefingId/outline` (AI generation)

### Export Jobs (stub)
- `POST /workspaces/:workspaceId/decks/:deckId/exports`
- `GET  /workspaces/:workspaceId/decks/:deckId/exports`

### Audit Logs
- `GET /workspaces/:workspaceId/audit-logs` (admin+)

### Admin (super-admin only)
- `GET /admin/workspaces`
- `GET /admin/users`
- `GET /admin/stats`

### Health
- `GET /health`
- `GET /ready`

## Worker capabilities

- Parses: `.xlsx`, `.csv`, `.pdf`, `.docx`
- Tabular profiling: row/column count, dtypes, nullable columns, sample values
- Basic insight generation (data quality, numeric columns, multi-sheet)
- Callbacks to API via `x-worker-key`
- Health endpoint: `GET /health`, `GET /ready`

## Architecture

```
src/
  domain/     # Entities, contracts (no framework deps)
  app/        # Use-case services
  infra/      # Prisma, S3, queue adapters
  interfaces/ # Controllers, guards, DTOs
```

## RBAC Roles

`OWNER > ADMIN > EDITOR > APPROVER > VIEWER`
