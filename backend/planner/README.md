# Планер — сервер

Node.js 20+, Express, Prisma, Socket.IO, Zod.

- Разработка: SQLite (`prisma/schema.prisma`), сервер: PostgreSQL (`prisma/postgres/schema.prisma`).
- `npm run dev` — запуск с автоперезагрузкой (нужен `.env`, см. `.env.example`).
- `npm test` — тесты API на временной базе.
- `npm run prod:generate && npm run build && npm run prod:start` — боевой запуск (применяет миграции PostgreSQL).

## API

| Метод | Путь | |
|---|---|---|
| POST | `/api/auth/register` | регистрация (нужно `acceptPrivacy: true`; логин уникален без учёта регистра) |
| POST | `/api/auth/login` | вход |
| GET | `/api/auth/me` | текущий пользователь + продлённый токен |
| GET | `/api/auth/question/:username` | секретный вопрос |
| POST | `/api/auth/reset-password` | сброс пароля по ответу |
| POST | `/api/auth/change-password` | смена пароля (выход на других устройствах) |
| DELETE | `/api/auth/account` | удаление аккаунта и всех данных |
| GET | `/api/events` | все события пользователя |
| POST | `/api/events` | создать (можно передать свой `id` — повторная отправка не создаёт дубликат) |
| PUT | `/api/events/:id` | изменить (`null` очищает поле) |
| DELETE | `/api/events/:id` | удалить |
| GET | `/health` | проверка работы |

Подробно о запуске: [../../ЗАПУСК-И-RUSTORE.md](../../ЗАПУСК-И-RUSTORE.md)
