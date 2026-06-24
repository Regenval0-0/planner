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

### Вариант 2: RuStore (Android)

```bash
cd frontend/planner
.\scripts\build-apk.bat
```

APK и AAB создадутся в `release/planner-rustore.apk` и `release/planner-rustore.aab`.

Подробная инструкция по публикации: [`rustore/RUSTORE_CHECKLIST.md`](rustore/RUSTORE_CHECKLIST.md)

### Вариант 3: Локально (без регистрации)

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

### Вариант 4: Windows-приложение

```bash
cd frontend/planner
npm run dist:win
```

- Двойной клик → работает
- ⚙️ Настройки → можно указать облачный URL

## ✨ Возможности

- 📅 Календарь с месячной навигацией
- ✅ Задачи с дедлайнами
- 📍 Встречи с временем
- 💰 Платежи с суммой и повторением
- 🔔 Локальные уведомления о задачах (Android)
- 🔄 **Real-time синхронизация** между ПК и телефоном
- 🔒 JWT-аутентификация, восстановление пароля
- 📴 **Offline-first** — работай без интернета, синхронизация при подключении

## 📦 Сборки

| Платформа | Команда | Результат |
|-----------|---------|-----------|
| Android APK | `npm run android:apk` | `release/planner-rustore.apk` |
| Android AAB | `./gradlew bundleRelease` | `release/planner-rustore.aab` |
| Windows | `npm run dist:win` | `release/Планер-Portable-*.exe` |
| Web (PWA) | `npm run build` | `dist/` |
| Backend | `npm run build` | `dist/` |

## 📁 Структура

```
├── backend/planner/      # Node.js + Express + Prisma + PostgreSQL
├── frontend/planner/     # React 19 + Vite + Tailwind + Capacitor + Electron
├── .github/workflows/     # CI/CD для Android сборки
├── render.yaml            # Конфиг деплоя на Render
├── docker-compose.yml     # Локальный запуск
├── rustore/               # Метаданные для RuStore
├── PRIVACY.md             # Политика конфиденциальности
└── DEPLOY.md              # Подробная инструкция по деплою
```

## 🛠 Технологии

**Frontend:** React 19, Vite 6, Tailwind CSS 4, Socket.IO Client, Capacitor (Android)  
**Backend:** Node.js 20, Express, Prisma, PostgreSQL, Socket.IO, JWT  
**Desktop:** Electron 42  
**DevOps:** GitHub Actions, Render, Docker

---

**Код:** [github.com/Regenval0-0/planner](https://github.com/Regenval0-0/planner)
