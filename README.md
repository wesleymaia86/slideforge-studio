# SlideForge Studio

**AI Presentation OS** — Create, structure, and design professional presentations with AI assistance.

[![CI](https://github.com/YOUR_ORG/slideforge-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/slideforge-studio/actions/workflows/ci.yml)

---

## What is this?

SlideForge Studio is an AI-powered presentation platform that enables users to:

- Generate structured slide decks from a brief prompt or document
- Edit and refine content with multi-agent AI (OpenRouter routing)
- Collaborate in real-time on presentation assets
- Export to common formats (PDF, PPTX, web)

### Services

| Service | Tech | Port | Description |
|---------|------|------|-------------|
| `web` | Next.js 14 | 3000 | Frontend — editor, dashboard, preview |
| `api` | NestJS + Prisma | 4000 | REST API, auth, AI orchestration |
| `worker` | NestJS + BullMQ | 8000 | Async jobs — AI generation, export |
| `postgres` | PostgreSQL 16 + pgvector | 5432 | Primary database + vector search |
| `redis` | Redis 7 | 6379 | Job queues, sessions, cache |

---

## Quick Start (local development)

### Prerequisites

- Docker Desktop ≥ 24
- Node.js 20 LTS (for running outside Docker)
- `gh` CLI (optional, for GitHub operations)

### 1. Clone and configure

```bash
git clone git@github.com:YOUR_ORG/slideforge-studio.git
cd slideforge-studio
cp .env.example .env
# Edit .env with your values (see docs/development.md)
```

### 2. Start the full stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services will be available at:
- **Web:** http://localhost:3000
- **API:** http://localhost:4000
- **API Health:** http://localhost:4000/health

### 3. Run migrations (first time)

```bash
docker compose -f docker-compose.dev.yml exec api npm run prisma:migrate
```

---

## Repository Structure

```
slideforge-studio/
├── apps/
│   ├── web/          # Next.js frontend
│   │   └── Dockerfile
│   ├── api/          # NestJS API
│   │   ├── src/
│   │   │   ├── app/       # Application services / use cases
│   │   │   ├── domain/    # Entities, rules, contracts
│   │   │   ├── infra/     # DB, APIs, queues
│   │   │   └── interfaces/ # Controllers, routes
│   │   └── Dockerfile
│   └── worker/       # BullMQ worker
│       └── Dockerfile
├── infrastructure/
│   └── coolify/      # Coolify deployment guides
├── docs/
│   ├── architecture.md
│   ├── deployment.md
│   ├── coolify.md
│   ├── development.md
│   └── security.md
├── .github/
│   └── workflows/ci.yml
├── docker-compose.dev.yml
├── .env.example
└── AGENTS.md
```

---

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/architecture.md](docs/architecture.md) | System design, data flow, ADRs |
| [docs/deployment.md](docs/deployment.md) | Production deploy, Coolify, DNS |
| [docs/coolify.md](docs/coolify.md) | Coolify-specific setup and env vars |
| [docs/development.md](docs/development.md) | Local setup, debugging, testing |
| [docs/security.md](docs/security.md) | Security audit findings and controls |

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Project scaffold & rules | ✅ Done | Cursor rules, AGENTS.md, CI |
| Dockerfiles + compose | ✅ Done | Multi-stage, health checks |
| NestJS API boilerplate | ⚠ Stubbed | Structure defined in rules |
| Next.js frontend | ⚠ Stubbed | Landing page mock available |
| AI generation pipeline | ⚠ Stubbed | OpenRouter router designed |
| UAZAPI WhatsApp channel | ⚠ Stubbed | Integration spec in rules |
| BullMQ worker | ⚠ Stubbed | Queue patterns defined |
| Auth (JWT + guards) | ⚠ Stubbed | See security.md P0 items |
| Prisma schema | ⚠ Stubbed | Needs domain entities |
| Tests | ⚠ Stubbed | Structure defined |

---

## Credentials Needed (manual)

See [docs/deployment.md](docs/deployment.md#credentials-checklist) for the full checklist. Key items:

- [ ] `OPENROUTER_API_KEY` — from openrouter.ai
- [ ] `UAZAPI_INSTANCE_TOKEN` — from your UAZAPI dashboard
- [ ] `JWT_SECRET` — generate: `openssl rand -hex 32`
- [ ] `WEBHOOK_SECRET` — generate: `openssl rand -hex 32`
- [ ] GitHub App credentials (for Coolify private repo access)
- [ ] Coolify project + environment setup

---

## Contributing

Follow the [AGENTS.md](AGENTS.md) guidelines and `.cursor/rules/` for coding standards.
