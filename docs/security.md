# Security Audit — SlideForge Studio

> **Date:** 2026-06-25  
> **Scope:** Architecture-level review of planned codebase (scaffolding phase).  
> **Auditor:** AI security-auditor skill (STRIDE / OWASP Top 10 2021).  
> **Status:** Pre-implementation — findings are design-time recommendations.

---

## 1. System Overview

| Component | Technology | Port | Trust boundary |
|-----------|-----------|------|----------------|
| `web`     | Next.js 14 (App Router) | 3000 | Public internet |
| `api`     | NestJS + Prisma + BullMQ | 4000 | Internal (behind reverse proxy) |
| `worker`  | NestJS worker process | 8000 (health only) | Internal |
| `postgres`| PostgreSQL 16 + pgvector | 5432 | Private network only |
| `redis`   | Redis 7 | 6379 | Private network only |

External integrations: **OpenRouter** (LLM), **UAZAPI** (WhatsApp), **GitHub App** (Coolify private repo access).

---

## 2. Auth Data Flow Trace

```
Client (browser)
  │  HTTPS
  ▼
[web :3000] — Next.js
  │  HTTP (internal) + Authorization: Bearer <JWT>
  ▼
[api :4000] — NestJS
  │  JWT validation (JwtStrategy / JwtAuthGuard)
  │  Role check (RBAC decorator)
  ▼
[Prisma ORM]  →  [postgres :5432]
  │
  ▼ async jobs
[BullMQ / Redis :6379]
  │
  ▼ consumed by
[worker :8000]
  │
  ▼ outbound calls
[OpenRouter API]  /  [UAZAPI API]
```

### 2.1 JWT Lifecycle (actual code review)

| Step | Implemented control | Status |
|------|---------------------|--------|
| Token issuance | `JWT_SECRET` env var, `passport-jwt` HS256 | ✅ Implemented |
| Access token expiry | `JWT_EXPIRY=15m` (Zod default) | ✅ Configured |
| Refresh token | `JWT_REFRESH_SECRET` + `JWT_REFRESH_EXPIRY=30d` | ✅ Configured |
| Token revocation | No Redis blocklist for logout | ⚠ Missing |
| Guard registration | `JwtAuthGuard` extends `AuthGuard('jwt')` — per-route only | ⚠ Opt-in (risk) |

**FINDING [HIGH] — Weak JWT fallback in `jwt.strategy.ts`:**

```typescript
secretOrKey: process.env['JWT_SECRET'] ?? 'dev-secret-change-me',
```

If `JWT_SECRET` is not set, the app starts with a predictable secret. In production this is catastrophic — attackers could forge valid tokens.

**Remediation:** Throw on missing `JWT_SECRET` at startup via Zod env validation (already defined in `packages/config`). Remove the fallback entirely.

**FINDING [MEDIUM] — Demo login in `apps/web/auth.ts`:**

```typescript
if (process.env.NODE_ENV === 'development') {
  if (email === 'demo@slideforge.io' && password === 'demo') {
    return { id: 'demo-user-1', accessToken: 'demo-token', role: 'admin' }
  }
}
```

The `demo-token` is not validated by the API's JWT guard. If `NODE_ENV=development` leaks to production, or if the API guard doesn't reject `demo-token`, this is a complete auth bypass.

**Remediation:** Ensure `NODE_ENV=production` is set in all production deployments. Add an API-side check that rejects tokens not signed with `JWT_SECRET`.

**Risk:** If `JwtAuthGuard` is registered only at route level (opt-in), newly added routes are unprotected by default. **Recommendation:** Register as global guard and use `@Public()` decorator for explicit opt-out.

---

## 3. Secret Leak Analysis

### 3.1 CI Workflow — `.github/workflows/ci.yml`

**FINDING [HIGH] — Hardcoded credentials in CI (FIXED):**

Original CI had hardcoded `imobiliaria`/`imobiliaria` Postgres credentials from a previous project. **Remediated** in this audit by replacing with project-specific ephemeral values (`slideforge_ci`/`slideforge_ci`). These hold no production value.

**Recommended further hardening:**
- Move to GitHub Actions secrets: `${{ secrets.CI_POSTGRES_USER }}` / `${{ secrets.CI_POSTGRES_PASSWORD }}`

**FINDING [MEDIUM] — Test token in env:**

```yaml
UAZAPI_INSTANCE_TOKEN: test-token
OPENROUTER_API_KEY: sk-or-test-key
```

Acceptable for CI if `AI_AGENT_ENABLED: 'false'`. Ensure integration tests mock HTTP calls and never reach real endpoints with these values.

### 3.2 `.env.example`

- ✅ Template values only, no real secrets.
- ✅ `GITHUB_APP_PRIVATE_KEY_B64` uses base64 encoding pattern (safe for env vars).
- Ensure `.gitignore` explicitly ignores `.env`, `.env.local`, `.env.production`.

### 3.3 Dockerfile analysis

- ✅ No `ARG` / `ENV` for secrets in Dockerfiles.
- ✅ `NEXT_PUBLIC_*` args are non-sensitive (public by design).
- ✅ Non-root users (`nextjs`, `nestjs`, `worker`) in runner stages.
- ⚠ Ensure build args for API/Worker never include secret values — pass secrets at runtime via environment only.

---

## 4. IDOR Pattern Analysis

### 4.1 Potential IDOR surfaces (by feature)

| Resource | Endpoint pattern | Risk | Mitigation required |
|----------|-----------------|------|---------------------|
| Presentation/Slide | `GET /presentations/:id` | HIGH — must scope to `userId` | Filter by `WHERE userId = req.user.id` |
| AI generation job | `GET /jobs/:jobId` | HIGH — BullMQ job IDs are not secret | Check `job.data.userId === req.user.id` |
| Webhook payloads | `POST /webhook/:instanceToken` | MEDIUM | Validate `WEBHOOK_SECRET` HMAC signature |
| User resources | `DELETE /users/:id` | HIGH | Require `req.user.id === params.id` or ADMIN role |

**Recommendation:** Every Prisma query that accepts a user-controlled identifier **must** include an ownership filter:

```typescript
// Correct pattern
const presentation = await this.prisma.presentation.findFirst({
  where: { id: dto.id, userId: user.id },  // ownership enforced
});
if (!presentation) throw new NotFoundException();
```

Never use `findUnique({ where: { id } })` for user-owned resources without ownership check.

### 4.2 BullMQ Job Visibility

BullMQ does not enforce per-user job access. If job results are exposed via API:
- Store `userId` in job data.
- Gate `GET /jobs/:id` with ownership check before returning job result.

---

## 5. Environment Validation Requirements

All services must validate env vars at startup using **Zod** (as specified in `nestjs-patterns.mdc`):

```typescript
// apps/api/src/config/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  WEBHOOK_SECRET: z.string().min(16),
  OPENROUTER_API_KEY: z.string().startsWith('sk-or-'),
  UAZAPI_BASE_URL: z.string().url(),
  UAZAPI_INSTANCE_TOKEN: z.string().min(1),
  PORT: z.coerce.number().default(4000),
});
```

**Missing validations** (must add before production):
- `JWT_SECRET` minimum entropy (32 chars)
- `WEBHOOK_SECRET` minimum length
- `POSTGRES_*` values not equal to default `slideforge` in production
- GitHub App fields when `GITHUB_APP_ENABLED=true`

---

## 6. API Security Controls

### 6.1 Webhook HMAC Validation

UAZAPI webhooks must be validated with HMAC-SHA256:

```typescript
// Expected implementation in WebhookModule
const sig = req.headers['x-hub-signature-256'];
const expected = `sha256=${createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex')}`;
if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
  throw new UnauthorizedException('Invalid webhook signature');
}
```

**Status:** ⚠ Not yet implemented — required before production.

### 6.2 Rate Limiting

- Apply `@nestjs/throttler` globally: recommended 100 req/min per IP.
- Lower limits on AI generation endpoints: 10 req/min per user.
- Exempt health check endpoints (`/health`).

### 6.3 Security Headers

For `web` (Next.js), add to `next.config.ts`:

```typescript
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // CSP: tighten after identifying all CDN sources
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..." },
]
```

---

## 7. Dependency Security

| Package | Risk area | Action |
|---------|-----------|--------|
| `@prisma/client` | SQL injection (mitigated by ORM) | Keep updated |
| `bull` / `bullmq` | Redis deserialization | Validate job data on consume |
| `axios` / `@nestjs/axios` | SSRF | Whitelist external URLs (OpenRouter, UAZAPI) |
| `jsonwebtoken` | Algorithm confusion | Pin `algorithms: ['HS256']` |

**Recommended:** Add `npm audit` to CI pipeline. Consider `trivy` image scanning in GitHub Actions.

---

## 8. Container Security

| Control | Status | Priority |
|---------|--------|----------|
| Non-root user in runner stage | ✅ Implemented | Done |
| Read-only filesystem (`--read-only`) | ⚠ Not in compose | Medium |
| No privileged containers | ✅ None requested | Done |
| Image pinned to digest | ⚠ Using tags only | Low |
| Secrets via env (not build args) | ✅ Pattern correct | Done |
| Network isolation (internal network) | ⚠ Compose has no explicit networks | Medium |

**Recommendation:** Add explicit Docker networks to `docker-compose.dev.yml`:

```yaml
networks:
  internal:
    driver: bridge
  public:
    driver: bridge
# postgres/redis on `internal` only; api/worker on `internal`; web on `public` + `internal`
```

---

## 9. Residual Risks (Accept / Defer)

| Risk | Severity | Decision | Rationale |
|------|----------|----------|-----------|
| No mTLS between services | Low | Defer | Single-host Coolify deploy, internal Docker network |
| JWT in localStorage (if web does this) | Medium | Must verify | Use `httpOnly` cookie or memory only |
| No audit log | Medium | Defer Phase 2 | Log sensitive actions to structured log |
| SSRF via OpenRouter URL | Low | Accept | URL is static, not user-controlled |

---

## 10. Action Items (Prioritized)

| Priority | Item | Owner |
|----------|------|-------|
| 🔴 P0 | Fix hardcoded `imobiliaria` credentials in `ci.yml` | DevOps |
| 🔴 P0 | Implement global `JwtAuthGuard` with `@Public()` opt-out | Backend |
| 🔴 P0 | Zod env validation at startup for all services | Backend |
| 🟠 P1 | HMAC webhook signature validation | Backend |
| 🟠 P1 | IDOR ownership filters on all Prisma queries | Backend |
| 🟠 P1 | Rate limiting with `@nestjs/throttler` | Backend |
| 🟡 P2 | Security headers in Next.js config | Frontend |
| 🟡 P2 | `npm audit` in CI | DevOps |
| 🟡 P2 | Docker network isolation | DevOps |
| 🟢 P3 | JWT refresh token + Redis revocation list | Backend |
| 🟢 P3 | Trivy image scanning in CI | DevOps |
