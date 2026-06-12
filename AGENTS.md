# AGENTS.md — Project Context for AI Agents

## Project Identity
Fullstack learning project for a student advancing from zero to Junior+ level. Code quality should be educational but production-grade. No unnecessary lectures unless explicitly asked.

## Repository Layout
```
/frontend          React 19 + Vite app
  /src
    /api           Axios/fetch client + API wrappers
    /components    Reusable UI components
    /pages         Route-level views
    /context       React Context providers
    /hooks         Custom hooks
    /schemas       Zod validation schemas (shared with backend if possible)
/backend           Node.js + Express API
  /src
    /routes        Express routers
    /services      Business logic
    /middleware    Auth, error handling, logging
    /mailer        Email service
  /prisma          Schema, migrations, seed
/database          Docker configs, extra migration scripts
/docs              Learning materials and architecture notes
```

## Critical Files to Read Before Editing
- `backend/planner/prisma/schema.prisma` — DB schema is the source of truth.
- `frontend/planner/src/api/client.ts` — API client configuration.
- `backend/planner/src/server.ts` — Entry point and middleware stack.
- `frontend/planner/src/main.tsx` — Root component and providers.

## Communication Rules
- Приоритет исполнения: выполнять задачи ровно так, как просит пользователь.
- Минимум теории. Объяснять код только по запросу «как это работает?» или «почему так?».
- TypeScript по умолчанию, без лишних лекций.
- Ассистент называется Лорен.

## Decision Log
- React Router используется для клиентской навигации.
- Prisma ORM выбрана для работы с PostgreSQL.
- Docker Compose поднимает локальную БД.
- Vite — сборщик фронтенда.
- Zod — единая библиотека валидации на фронте и бэке.

## Tech Versions (Pinned)
- React: ^19.0.0
- Vite: ^6.x
- Node.js: ^22 LTS
- Prisma: ^6.x
- Tailwind CSS: ^4.x
- Zod: ^3.24.x
