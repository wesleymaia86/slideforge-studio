# Deployment Guide — SlideForge Studio

## Prerequisites

- Coolify instance at `https://byterush.com.br` (confirmed reachable)
- GitHub private repo: `slideforge-studio`
- Docker installed on Coolify host
- Domain DNS pointing to Coolify host

---

## Credentials Checklist

Complete **all items** before first production deploy.

### GitHub App (for Coolify private repo access)

| Credential | Status | Where to get |
|-----------|--------|--------------|
| App ID | ☐ | GitHub → Settings → Developer settings → GitHub Apps → your app → "App ID" |
| Installation ID | ☐ | `github.com/settings/installations/<ID>` — ID is in the URL |
| Client ID | ☐ | GitHub App settings → "Client ID" |
| Client Secret | ☐ | GitHub App → "Generate a new client secret" |
| Webhook Secret | ☐ | Set during app creation, or regenerate in App settings |
| Private Key (.pem) | ☐ | GitHub App → "Generate a private key" → download .pem |
| Webhook URL | ☐ | Coolify provides this during GitHub App setup (Settings → Sources → GitHub App → Add) |

**How to create the GitHub App:**

1. Go to https://github.com/settings/apps/new
2. App name: `slideforge-coolify`
3. Homepage: `https://byterush.com.br`
4. Webhook URL: paste the URL Coolify provides at Settings → Sources → GitHub App → Add
5. Webhook secret: `openssl rand -hex 32`
6. Permissions: Repository → Contents: **Read-only**, Repository → Metadata: **Read-only**
7. Where to install: **Only on selected repositories**
8. After creating: generate private key, note App ID and Client ID
9. Install app on `slideforge-studio` repo → note Installation ID from URL

### Application Secrets

Generate all secrets before deploy. Store in a password manager.

```bash
# Generate JWT_SECRET
openssl rand -hex 32

# Generate WEBHOOK_SECRET
openssl rand -hex 32

# Generate SESSION_SECRET
openssl rand -hex 32

# Encode PEM private key for env var
base64 -w0 private-key.pem
```

| Secret | Notes |
|--------|-------|
| `POSTGRES_PASSWORD` | Strong random password |
| `JWT_SECRET` | Min 32 chars, random hex |
| `WEBHOOK_SECRET` | For UAZAPI webhook signature validation |
| `OPENROUTER_API_KEY` | From https://openrouter.ai/keys |
| `UAZAPI_INSTANCE_TOKEN` | From your UAZAPI instance dashboard |

---

## GitHub Repository Setup

### Option A: Using `gh` CLI (recommended)

```bash
# Authenticate (one-time)
gh auth login

# Create private repo
gh repo create slideforge-studio --private --source=. --remote=origin --push

# Or if repo exists already
git remote add origin git@github.com:YOUR_ORG/slideforge-studio.git
git push -u origin main
```

### Option B: Manual steps

1. Go to https://github.com/new
2. Repository name: `slideforge-studio`
3. Visibility: **Private**
4. Do NOT initialize with README (you have existing code)
5. Copy the SSH remote URL
6. Locally:
   ```bash
   git init
   git add .
   git commit -m "chore: initial project scaffold"
   git remote add origin git@github.com:YOUR_ORG/slideforge-studio.git
   git push -u origin main
   ```

---

## Coolify Deployment Steps

### 1. Create project

In Coolify UI:
1. Click **Projects** → **New Project**
2. Name: `SLIDEFORGE`
3. Description: `SlideForge Studio — AI Presentation OS`

### 2. Add PostgreSQL database

1. Project → **New Resource** → **Database** → **PostgreSQL**
2. Name: `slideforge-postgres`
3. PostgreSQL version: `16`
4. Database name: `slideforge`
5. Save → note the internal connection string
6. After creation: connect to DB and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

> If you need pgvector from day one, use a Docker Compose resource with image `pgvector/pgvector:pg16` instead of the built-in PostgreSQL option.

### 3. Add Redis database

1. Project → **New Resource** → **Database** → **Redis**
2. Name: `slideforge-redis`
3. Redis version: `7`
4. Save → note the internal connection string

### 4. Connect GitHub App source

1. **Settings** → **Sources** → **GitHub App** → **Add**
2. Follow OAuth flow — Coolify will give you the webhook URL for GitHub App
3. After connecting, select repositories: `slideforge-studio`

### 5. Deploy `api` service

1. Project → **New Resource** → **Application**
2. Source: GitHub App → `slideforge-studio`
3. Build pack: **Dockerfile**
4. Base directory: `apps/api`
5. Dockerfile path: `Dockerfile`
6. Port: `4000`
7. Health check URL: `/health`
8. Add all env vars from the `api` section in [docs/coolify.md](coolify.md)
9. Deploy

### 6. Deploy `worker` service

Same flow as `api`, but:
- Base directory: `apps/worker`
- Port: `8000`
- Domain: **none** (internal only)

### 7. Deploy `web` service

Same flow, but:
- Base directory: `apps/web`
- Port: `3000`
- Add build arg `NEXT_PUBLIC_API_URL=https://api-slideforge.byterush.com.br`
- Domain: `studio.byterush.com.br`
- Enable **Force HTTPS** in Coolify domain settings

### 8. Post-deploy: Run Prisma migrations

```bash
# Via Coolify terminal (Application → Terminal)
npx prisma migrate deploy
```

---

## DNS Configuration

| Record | Type | Value | TTL |
|--------|------|-------|-----|
| `studio` | A | `<Coolify host IP>` | 300 |
| `api-slideforge` | A | `<Coolify host IP>` | 300 |

Coolify will provision Let's Encrypt SSL automatically once DNS resolves.

---

## Rollback Procedure

1. In Coolify: Application → **Deployments** tab
2. Find the last successful deployment
3. Click **Redeploy** on that specific deployment
4. For database schema rollbacks: use Prisma migration rollback (`prisma migrate resolve`)

---

## Monitoring

- Coolify built-in metrics: CPU, memory, network per service
- Application logs: Application → **Logs** tab in Coolify UI
- Health endpoints:
  - `https://api-slideforge.byterush.com.br/health`
  - `https://studio.byterush.com.br/api/health`
