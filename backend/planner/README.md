# 📁 backend/planner/

**Назначение:** API-сервер для приложения «Персональный планировщик».

---

## Стек

| Технология | Назначение |
|-----------|-----------|
| Node.js 20+ | Runtime |
| Express.js | Web framework |
| Prisma ORM | Database access |
| SQLite | Database (local/desktop) |
| JWT | Authentication |
| bcrypt | Password hashing |
| Nodemailer / Resend | Email sending |
| Zod | Validation |

---

## Запуск

```bash
npm install
npx prisma migrate dev
npm run dev    # localhost:3001
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Логин
- `POST /api/auth/find-user` — Найти логин по телефону
- `GET /api/auth/question/:username` — Получить секретный вопрос
- `POST /api/auth/reset-password` — Сброс пароля
- `GET /api/auth/me` — Текущий пользователь

### Events
- `GET /api/events?month=&year=` — Список событий (с повторениями)
- `POST /api/events` — Создать событие
- `PUT /api/events/:id` — Обновить
- `DELETE /api/events/:id` — Удалить

---

## Структура

```
src/
├── server.ts          # Точка входа
├── config.ts          # Конфигурация (JWT и др.)
├── prisma.ts          # PrismaClient
├── routes/
│   ├── auth.ts
│   └── events.ts
├── middleware/
│   └── auth.ts
└── utils/
    ├── rateLimit.ts
    └── mailer.ts
```
