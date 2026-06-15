# Планер — Календарь, Задачи и Платежи

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Regenval0-0/planner)

**Планер** — это персональный планировщик событий с синхронизацией между устройствами.

## 🚀 Быстрый старт

### Вариант 1: Облако (Render) — данные синхронизируются

1. Нажми кнопку "Deploy to Render" выше ↑
2. Зарегистрируйся на Render через GitHub (1 минута)
3. Render автоматически создаст сервер + базу данных
4. Скопируй URL сервера (например `https://planner-backend-xxx.onrender.com`)
5. Открой приложение → ⚙️ Настройки → вставь URL → Сохранить

### Вариант 2: Локально (без регистрации)

```bash
# Docker (backend + база данных)
cd C:\Ren
docker-compose up -d

# Или вручную
cd backend/planner
npm install
npm run db:migrate
npm run dev
```

### Вариант 3: Windows-приложение

Файл: `frontend/planner/release/Планер-Portable-0.0.0.exe`
- Двойной клик → работает
- ⚙️ Настройки → можно указать облачный URL

### Вариант 4: Android (RuStore)

```bash
cd frontend/planner
.\scripts\build-apk.bat
```
APK создастся в `release/planner-rustore.apk`

## ✨ Возможности

- 📅 Календарь с недельной/месячной навигацией
- ✅ Задачи с дедлайнами
- 📍 Встречи с временем
- 💰 Платежи с суммой и повторением
- 🔄 **Real-time синхронизация** между ПК и телефоном
- 🔒 JWT-аутентификация, восстановление пароля

## 📁 Структура

```
├── backend/planner/      # Node.js + Express + Prisma + PostgreSQL
├── frontend/planner/     # React 19 + Vite + Tailwind + PWA
├── render.yaml           # Конфиг деплоя на Render
├── docker-compose.yml    # Локальный запуск
└── DEPLOY.md             # Подробная инструкция
```

## 🛠 Технологии

**Frontend:** React 19, Vite 6, Tailwind CSS 4, Socket.IO Client, Capacitor (Android)  
**Backend:** Node.js 20, Express, Prisma, PostgreSQL, Socket.IO, JWT  
**Desktop:** Electron 42  
**Deploy:** Render.com, Docker, GitHub Actions

---

**Код:** [github.com/Regenval0-0/planner](https://github.com/Regenval0-0/planner)
