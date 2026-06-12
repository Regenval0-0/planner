# 📁 frontend/planner/

**Назначение:** Клиентское приложение «Персональный планировщик».

---

## Стек

| Технология | Версия |
|-----------|--------|
| React | 19.2.6 |
| Vite | 6.0.1 |
| Tailwind CSS | 4.3.0 |
| React Router | 7.16.0 |
| Axios | 1.17.0 |
| Electron | 33 (desktop) |

---

## Запуск

```bash
# Web dev server
npm run dev          # localhost:5173

# Desktop (Electron)
npm run electron:dev

# Production build
npm run build
npm run build:desktop
```

---

## Структура

```
src/
├── pages/              # Страницы приложения
│   ├── CalendarPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ...
├── components/         # UI компоненты
├── context/            # React Context (AuthContext)
├── api/                # API клиент (axios)
├── hooks/              # Кастомные хуки
└── main.tsx            # Точка входа
```

---

## Функционал

- 📅 Календарь событий (цветовая кодировка)
- ✅ Задачи с дедлайнами
- 💰 Платежи и напоминания
- 🔐 JWT-аутентификация
- 🔔 Уведомления (Electron desktop)

---

## Связь с backend

Backend: `backend/planner/` (Express + Prisma + PostgreSQL)
