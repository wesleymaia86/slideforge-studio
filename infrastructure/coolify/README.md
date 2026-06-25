# Coolify Deployment

SlideForge Studio is deployed via [Coolify](https://coolify.io) (self-hosted PaaS).

## Services

| Service | Build context | Dockerfile |
|---------|---------------|------------|
| web | repo root | infrastructure/docker/Dockerfile.web |
| api | repo root | infrastructure/docker/Dockerfile.api |
| worker | repo root | infrastructure/docker/Dockerfile.worker |

## Environment variables

Copy the relevant `.env.example` file for each service and fill in production values.
All secrets are managed in Coolify UI — never in version control.

## Ports

| Service | Container port | Public |
|---------|---------------|--------|
| web | 3000 | Yes (443 via Caddy) |
| api | 3001 | Yes (via reverse proxy) |
| worker | 3002 | No (internal only) |
| postgres | 5432 | No |
| redis | 6379 | No |
| minio | 9000/9001 | 9001 console via reverse proxy |
