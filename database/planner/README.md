# База данных Планера

Схема хранится рядом с сервером:
- `backend/planner/prisma/schema.prisma` — SQLite для разработки;
- `backend/planner/prisma/postgres/schema.prisma` и `prisma/postgres/migrations/` — PostgreSQL для сервера.

Таблицы: `users` (логин, хеш пароля, телефон, секретный вопрос и хеш ответа, версия токена) и `events` (события, задачи, встречи, платежи; повторяющиеся хранятся одной записью).

`docker-compose.yml` в этой папке — только для локальных экспериментов с PostgreSQL.
