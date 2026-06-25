# ADR-001: Turborepo + pnpm Monorepo

**Date:** 2026-06-25  
**Status:** Accepted

## Context
Multiple apps (web, api, worker) and packages need to share types, config, and utilities without code duplication. Build caching and parallel task execution are critical for developer velocity.

## Decision
Use Turborepo for task orchestration with pnpm workspaces. Turborepo provides remote caching, incremental builds, and parallel task graphs. pnpm is chosen over npm/yarn for its strict dependency isolation and disk efficiency.

## Consequences
- All workspace packages use `@slideforge/<name>` naming
- `turbo.json` defines task pipelines and cache rules
- `pnpm-workspace.yaml` lists workspace globs
