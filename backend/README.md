# 📁 backend/

**Назначение:** Серверные приложения.

---

## Содержимое

| Папка | Проект | Стек |
|-------|--------|------|
| `planner/` | Planner Backend | Node.js, Express, Prisma ORM, JWT, PostgreSQL |

---

## Planner Backend

**Путь:** `backend/planner/`

### Стек
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (bcrypt)
- **Mail:** Nodemailer (SendGrid)

### Запуск
```bash
cd backend/planner
npm install
npx prisma migrate dev
npm run dev        # localhost:5000
```

### Структура
```
backend/planner/
├── prisma/
│   └── schema.prisma    # Модели User, Event, Task, Payment
├── src/
│   ├── server.ts        # Точка входа
│   ├── routes/
│   │   ├── auth.ts      # Регистрация, логин, verify-email
│   │   └── ...
│   └── utils/
│       └── mailer.ts    # Отправка писем
└── .env.example         # Пример переменных
```
