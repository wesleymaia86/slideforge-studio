# ADR-002: Prisma ORM with pgvector

**Date:** 2026-06-25  
**Status:** Accepted

## Context
The AI pipeline requires vector similarity search for semantic document retrieval. We need a type-safe ORM that works well with NestJS and supports raw SQL escape hatches for vector operations.

## Decision
Use Prisma as the primary ORM with the `postgresqlExtensions` preview feature to declare `vector`, `uuid-ossp`, and `pg_trgm`. Vector columns use `Unsupported("vector(1536)")` until Prisma adds native support. Vector queries (ANN search) use `$queryRaw`.

## Consequences
- Vector similarity must be done via `prisma.$queryRaw`
- Migrations are managed via `prisma migrate dev`
- `generated/prisma` is gitignored; generated at build/install time
- `DIRECT_DATABASE_URL` is required when using a connection pooler (e.g. PgBouncer, Supabase pooler)
