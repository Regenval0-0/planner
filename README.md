# Планер — онлайн-календарь событий, задач и платежей

Бесплатный онлайн-планер с регистрацией через email, повторяющимися событиями и напоминаниями.

🔗 **Фронтенд (GitHub Pages):** https://regenval0-0.github.io/planner/

## Деплой бэкенда (одна кнопка)

<!-- Бэкенд разворачивается на Render.com — нужен бесплатный аккаунт -->
<a href="https://render.com/deploy?repo=https://github.com/Regenval0-0/planner">
  <img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" />
</a>

### Шаги после нажатия кнопки:

1. Зарегистрируйся на Render через GitHub (1 кнопка)
2. Добавь 3 переменные окружения в настройках сервиса:
   - `DATABASE_URL` — строка подключения PostgreSQL (создай бесплатно на [neon.tech](https://neon.tech))
   - `RESEND_API_KEY` — API ключ для почты (создай бесплатно на [resend.com](https://resend.com))
   - `APP_URL` — URL твоего сервиса на Render (например `https://planner-app.onrender.com`)
3. Открой **Shell** на Render и выполни: `npx prisma migrate deploy`
4. Сайт готов!

### Полная инструкция

См. [backend/planner/DEPLOY.md](backend/planner/DEPLOY.md)

## Локальный запуск

```bash
# Бэкенд
cd backend/planner
npm install
npx prisma migrate dev
npx tsx src/server.ts

# Фронтенд (в другом терминале)
cd frontend/planner
npm install
npx vite --port 5173 --open
```

## Технологии

- **Frontend:** React 19, Vite, Tailwind CSS, TypeScript
- **Backend:** Node.js, Express, Prisma, JWT
- **Database:** PostgreSQL (Neon) / SQLite (local)
- **Email:** Resend
- **Hosting:** GitHub Pages (frontend) + Render (backend)
