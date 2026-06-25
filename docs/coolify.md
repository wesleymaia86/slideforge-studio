# Coolify Reference — SlideForge Studio

> Coolify host: `https://byterush.com.br`  
> Server: `localhost` (UUID: `csow8ss0kscskwk04g0osgcg`)  
> Wildcard domain: `*.byterush.com.br`

---

## MCP Setup Status (completed 2026-06-25)

| Resource | Status | UUID |
|----------|--------|------|
| SLIDEFORGE project | ✅ Created via MCP | `cpngzeky5yur0aan0mo68hh7` |
| `slideforge-postgres` (PostgreSQL 16 + pgvector) | ✅ Created via MCP | `grolg1c581tybkg809mzg24c` |
| `slideforge-redis` (Redis 7-alpine) | ✅ Created via MCP | `q9wu221pcsxaixgf2zns6wvj` |
| `slideforge-api` application | ⚠ Needs GitHub App UUID | See manual steps below |
| `slideforge-worker` application | ⚠ Needs GitHub App UUID | See manual steps below |
| `slideforge-web` application | ⚠ Needs GitHub App UUID | See manual steps below |

### MCP deploy attempt (2026-06-25, post-push `f1ed101`)

`create_private_gh` was called for `slideforge-api` — **blocked**:

```
Validation failed: github_app_uuid — The github app uuid field is required.
```

No application UUIDs exist yet. Databases are ready:

| Resource | UUID |
|----------|------|
| SLIDEFORGE project | `cpngzeky5yur0aan0mo68hh7` |
| slideforge-postgres | `grolg1c581tybkg809mzg24c` |
| slideforge-redis | `q9wu221pcsxaixgf2zns6wvj` |

### Manual steps (required)

The `create_private_gh` MCP operation requires `github_app_uuid`, which is not exposed by the MCP tool list. Find it:

1. In Coolify UI → **Settings** → **Sources** → Click on the GitHub App connected to `wesleymaia86`
2. The UUID is in the URL or shown in the source details
3. Use it in the MCP calls below

### Create applications via MCP (once GitHub App UUID is known)

```json
// slideforge-api
{
  "operation": "create_private_gh",
  "body": {
    "project_uuid": "cpngzeky5yur0aan0mo68hh7",
    "server_uuid": "csow8ss0kscskwk04g0osgcg",
    "destination_uuid": "qosowcscco0okggggs48s40w",
    "environment_name": "production",
    "github_app_uuid": "<YOUR_GITHUB_APP_UUID>",
    "git_repository": "wesleymaia86/slideforge-studio",
    "git_branch": "main",
    "build_pack": "dockerfile",
    "base_directory": "/apps/api",
    "dockerfile_location": "/apps/api/Dockerfile",
    "ports_exposes": "3001",
    "name": "slideforge-api",
    "fqdn": "https://api-slideforge.byterush.com.br",
    "health_check_enabled": true,
    "health_check_path": "/api/v1/health",
    "health_check_port": "3001"
  }
}
```

Repeat similarly for `worker` (`base_directory: /apps/worker`, `ports_exposes: 8000`, `health_check_path: /health`, no FQDN) and `web` (`base_directory: /apps/web`, `ports_exposes: 3000`, `health_check_path: /`, `fqdn: https://studio.byterush.com.br`).

### Internal connection strings (set as env vars in each application)

```
DATABASE_URL=postgres://slideforge:<PASSWORD>@grolg1c581tybkg809mzg24c:5432/slideforge
DIRECT_DATABASE_URL=postgres://slideforge:<PASSWORD>@grolg1c581tybkg809mzg24c:5432/slideforge
REDIS_URL=redis://default:<PASSWORD>@q9wu221pcsxaixgf2zns6wvj:6379/0
```

> Retrieve the actual passwords from Coolify UI → SLIDEFORGE project → click on each database → "Connection String".

---

## Existing Projects on this Coolify Instance

| ID | UUID | Name | Description |
|----|------|------|-------------|
| 1 | `vggo00w0ow8wg0sw0ws4c048` | Aplicação | Local de Instalação |
| 6 | `gs8ggsgso0ok4g40swo0c4ow` | NEXUS | — |
| 7 | `qossww8cw04088800c8wsww8` | IAPI | — |
| 8 | `uu9kejjz6x1q7wiq62k7nicw` | CURSOR | — |
| 9 | `pokgrlxz9fqdzxrbe4r2zzb9` | DWELLGO | WhatsApp real-estate agent API |
| 10 | `mcy5s9t7bty1wj876d0wu4d2` | CORTEX | Agent platform |
| 12 | `hydlurfi4yc7rf06ajy9kp48` | TIME | OpenClaw official |

**SlideForge will be a new project** — create as `SLIDEFORGE`.

---

## MCP Tools Available

The `user-coolify-mcp` MCP server provides these tools:

| Tool | Operations |
|------|-----------|
| `ping` | Health check |
| `projects` | list, get, create, update, delete, environment, resources |
| `servers` | list, get, create, update, delete, validate, resources, domains |
| `applications` | list, get, create_public, create_private_gh, create_private_key, create_dockerfile, create_docker_image, create_docker_compose, update, delete, get_logs, start, stop, restart, list_envs, create_env, update_env, update_envs_bulk, delete_env |
| `databases` | list, get, update, delete, create_postgresql, create_redis, create_clickhouse, etc., start, stop, restart |
| `services` | list, get, create, update, delete, start, stop, restart, list/create/update/delete_envs, get_service_types |
| `deployments` | (see schema) |
| `private-keys` | (see schema) |
| `system` | (see schema) |

---

## Creating the SLIDEFORGE Project via MCP

```json
// MCP call: projects.create
{
  "operation": "create",
  "body": "{\"name\": \"SLIDEFORGE\", \"description\": \"SlideForge Studio — AI Presentation OS\"}"
}
```

---

## Full Env Vars Reference

### `web` service

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api-slideforge.byterush.com.br
NEXT_PUBLIC_APP_ENV=production
PORT=3000
```

### `api` service

```env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://slideforge:<PASSWORD>@<DB_HOST>:5432/slideforge

# Redis
REDIS_URL=redis://<REDIS_HOST>:6379

# Auth
JWT_SECRET=<openssl rand -hex 32>
WEBHOOK_SECRET=<openssl rand -hex 32>

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL_ATENDIMENTO=openai/gpt-4o-mini
OPENROUTER_MODEL_TRIAGEM=openai/gpt-4o-mini
OPENROUTER_MODEL_QUALIFICACAO=openai/gpt-4o
OPENROUTER_MODEL_IMOVEIS=openai/gpt-4o-mini
OPENROUTER_MODEL_HANDOFF=openai/gpt-4o-mini
OPENROUTER_MODEL_EMBEDDING=openai/text-embedding-3-small

# UAZAPI
UAZAPI_BASE_URL=https://<instance>.uazapi.com
UAZAPI_INSTANCE_TOKEN=<token>

# Feature flags
AI_AGENT_ENABLED=true
```

### `worker` service

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://slideforge:<PASSWORD>@<DB_HOST>:5432/slideforge
REDIS_URL=redis://<REDIS_HOST>:6379
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL_QUALIFICACAO=openai/gpt-4o
OPENROUTER_MODEL_EMBEDDING=openai/text-embedding-3-small
UAZAPI_BASE_URL=https://<instance>.uazapi.com
UAZAPI_INSTANCE_TOKEN=<token>
AI_AGENT_ENABLED=true
```

---

## Auto-deploy on Push

Once the GitHub App is connected:
1. In each Application settings → **Enable Auto-deploy on push**
2. Select branch: `main`
3. Coolify will re-build and redeploy on every push to `main`

For production workflows, disable auto-deploy and trigger manually or via the Coolify MCP:

```json
// MCP: applications.restart (or deployments.deploy)
{
  "operation": "restart",
  "id": "<application-uuid>"
}
```

---

## Coolify UI Locations for GitHub App Credentials

| Field | UI Location |
|-------|------------|
| Add GitHub App source | Settings → Sources → GitHub App → Add GitHub App |
| App ID | Settings → Sources → GitHub App → your app |
| Webhook URL (to copy to GitHub) | Shown during "Add GitHub App" flow |
| Private Key PEM | Settings → Sources → GitHub App → Edit |
| Select repositories | Settings → Sources → GitHub App → Edit → Manage on GitHub |

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| Build fails with "repository not found" | GitHub App installation includes the repo? |
| Prisma connection error | `DATABASE_URL` internal hostname correct? |
| Worker jobs not processing | Redis connection in `REDIS_URL`? Worker health check passing? |
| SSL not provisioning | DNS A record pointing to Coolify host? Port 80/443 open? |
| pgvector extension missing | Run `CREATE EXTENSION IF NOT EXISTS vector;` on DB |
