# SlideForge Studio

AI-powered presentation builder. Monorepo with NestJS API + Python worker.

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
# 1. Start infrastructure
docker-compose up -d postgres redis minio

# 2. Install dependencies
npm install

# 3. Generate Prisma client + run migrations
npm run prisma:generate
npm run prisma:migrate

# 4. Start API
cd apps/api && npm run dev

# 5. Start worker (separate terminal)
cd apps/worker
pip install -r requirements.txt
celery -A celery_app.celery_app worker --loglevel=info --queues=processing
# Or run the FastAPI health server:
uvicorn main:app --reload --port 8000
```

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
