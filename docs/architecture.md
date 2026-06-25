# Architecture — SlideForge Studio

## Overview

SlideForge Studio follows a **layered monorepo** architecture with clear separation between interface, application, domain, and infrastructure concerns.

```
┌─────────────────────────────────────────────────────────┐
│  Browser / Mobile                                        │
│  Next.js 14 (App Router)  :3000                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS + JWT
┌───────────────────────▼─────────────────────────────────┐
│  NestJS API  :4000                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │interfaces│→│   app    │→│  domain  │←│   infra    │  │
│  │controllers│ │use-cases │ │entities  │ │Prisma/HTTP │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ BullMQ jobs
┌────────────────────▼────────────────────────────────────┐
│  NestJS Worker  :8000                                    │
│  BullMQ consumers → AI generation, export, UAZAPI        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
  PostgreSQL 16              Redis 7
  + pgvector                 (queue + cache)
        │
        ├── OpenRouter API (LLM routing)
        └── UAZAPI (WhatsApp)
```

## Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **interfaces** | `apps/api/src/interfaces/` | HTTP controllers, route guards, DTOs validation, WebSocket handlers |
| **app** | `apps/api/src/app/` | Use cases, application services, command/query handlers |
| **domain** | `apps/api/src/domain/` | Entities, value objects, domain rules, repository contracts |
| **infra** | `apps/api/src/infra/` | Prisma repositories, HTTP adapters (OpenRouter, UAZAPI), BullMQ producers |
| **shared** | `apps/api/src/shared/` | Cross-cutting utilities, Zod schemas, error types |

## Key Architectural Decisions

### ADR-001: OpenRouter for all LLM calls

**Decision:** All AI calls route through OpenRouter, never directly to OpenAI/Anthropic.  
**Rationale:** Single API key management, model switching without code changes, cost tracking.  
**Consequence:** `OpenRouterClientService` is the only LLM abstraction — no direct SDK imports.

### ADR-002: BullMQ for async AI generation

**Decision:** AI generation jobs are async (BullMQ + Redis), never blocking HTTP requests.  
**Rationale:** LLM calls can take 10–60s; HTTP timeout ≤ 30s. Job IDs returned immediately.  
**Consequence:** Client polls `GET /jobs/:id` or uses WebSocket subscription for completion.

### ADR-003: pgvector for embedding search

**Decision:** Store embeddings in PostgreSQL via `pgvector` extension.  
**Rationale:** Avoids a separate vector database for initial scale; Prisma raw queries for similarity search.  
**Consequence:** Requires `pgvector/pgvector:pg16` image (not default Coolify image).

### ADR-004: JWT authentication, stateless API

**Decision:** Stateless JWT (HS256) for API auth; sessions managed client-side.  
**Rationale:** Simplicity for single-host deploy; no session store dependency on API nodes.  
**Consequence:** Must implement Redis token blocklist for logout/revocation (see security.md).

### ADR-005: Monorepo with per-service Dockerfiles

**Decision:** Each service (`web`, `api`, `worker`) has its own Dockerfile under `apps/<service>/`.  
**Rationale:** Independent build caches, deployment timelines, and resource profiles.  
**Consequence:** Coolify deploys each service separately from the same repo using `Base directory`.

## Data Flow: AI Presentation Generation

```
1. User submits prompt → POST /presentations/generate
2. API validates input, creates Presentation record (status: PENDING)
3. API enqueues BullMQ job { presentationId, prompt, userId }
4. HTTP response: { jobId, presentationId }
5. Worker picks up job:
   a. Calls OpenRouter (triagem model) → structured outline
   b. Calls OpenRouter (busca_imoveis/content model) per slide → content
   c. Calls OpenRouter (embedding model) → stores vectors in pgvector
   d. Updates Presentation record (status: READY)
   e. Emits WebSocket event or updates job status
6. Client polls GET /jobs/:jobId → receives completion
7. Client fetches GET /presentations/:id → full slide content
```

## Multi-Agent Routing (OpenRouter)

```
Incoming message/task
      │
      ▼
AgentRouterService.resolveProfileFromFluxo(conversationState)
      │
      ├─→ atendimento   → gpt-4o-mini   (greeting, intent detection)
      ├─→ triagem        → gpt-4o-mini   (data collection)
      ├─→ qualificacao   → gpt-4o        (scoring, summary)
      ├─→ busca_imoveis  → gpt-4o-mini   (content/asset retrieval)
      ├─→ handoff        → gpt-4o-mini   (human transfer)
      └─→ embedding      → text-embed-3-small (vector generation)
```

## Network Topology (Production — Coolify single host)

```
Internet → Coolify Traefik (80/443)
              │
              ├── studio.byterush.com.br  → web:3000
              └── api-slideforge.byterush.com.br → api:4000
                                                      │
                                        (internal Docker network)
                                              ├── worker:8000
                                              ├── postgres:5432
                                              └── redis:6379
```

Worker and databases are **not exposed** to the public internet. Only `web` and `api` have public domains.
