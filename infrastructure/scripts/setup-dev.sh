#!/usr/bin/env bash
# setup-dev.sh — Bootstrap local development environment
set -euo pipefail

echo "==> SlideForge Studio — Local Dev Setup"

# 1. Check required tools
for cmd in node pnpm docker; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd is not installed"
    exit 1
  fi
done

# 2. Install dependencies
echo "--> Installing dependencies..."
pnpm install

# 3. Copy env files if not present
ROOT_ENV=".env"
if [ ! -f "$ROOT_ENV" ]; then
  cp .env.example "$ROOT_ENV"
  echo "--> Created .env from .env.example (edit secrets before running)"
fi
for app in api worker web; do
  APP_ENV="apps/$app/.env"
  if [ ! -f "$APP_ENV" ]; then
    cp "apps/$app/.env.example" "$APP_ENV"
    echo "--> Created apps/$app/.env"
  fi
done

# 4. Start infrastructure
echo "--> Starting Docker services (postgres, redis, minio)..."
docker compose -f docker-compose.dev.yml up -d

# 5. Wait for postgres
echo "--> Waiting for PostgreSQL..."
until docker exec slideforge-postgres pg_isready -U slideforge -d slideforge_dev &>/dev/null; do
  sleep 2
done

# 6. Run migrations + seed
echo "--> Running Prisma migrations..."
pnpm db:generate
pnpm db:migrate
pnpm db:seed

echo "==> Done! Services:"
echo "    PostgreSQL: localhost:5432"
echo "    Redis:      localhost:6379"
echo "    MinIO API:  localhost:9000"
echo "    MinIO UI:   http://localhost:9001  (user: slideforge / slideforge_dev_secret)"
