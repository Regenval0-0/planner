# Skill: Docker & DevOps Setup

## When to Use
Setting up local infrastructure, containerizing apps, or CI/CD configurations.

## Docker Compose (Local Dev)
Create `docker-compose.yml` in `/database` or root:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: planner
      POSTGRES_PASSWORD: planner
      POSTGRES_DB: planner
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Optional: Redis for caching/sessions
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

Run:
```bash
docker compose up -d
docker compose logs -f postgres
```

## Backend Dockerfile (Production)
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

## Frontend Dockerfile (Static + Nginx)
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## GitHub Actions (CI)
Create `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
```

## Environment Variables Checklist
- [ ] `.env` added to `.gitignore`.
- [ ] `.env.example` updated with all required keys.
- [ ] Docker Compose uses `.env` if needed (`env_file: .env`).
- [ ] No secrets in Dockerfiles (use build args or runtime env).

## Common Commands
```bash
docker system prune -f          # Clean unused images
docker compose down -v          # Remove containers + volumes
docker compose exec postgres psql -U planner -d planner
```
