# Планер — приложение (Android + Windows)

React 19 + Vite + Tailwind. Android — Capacitor 8, Windows — Electron.

| Команда | Что делает |
|---|---|
| `npm run dev` | интерфейс в браузере, сервер по умолчанию `http://localhost:3001` |
| `npm test` | тесты логики повторов и офлайн-очереди |
| `npm run build` | проверка типов и сборка в `dist/` |
| `scripts\build-windows.bat` | установщик для Windows в `release/` |
| `scripts\build-apk.bat` | APK и AAB для RuStore в `release/` |

Адрес сервера и почта поддержки задаются в `.env.production` (см. `.env.production.example`).

Главное в коде:
- `src/sync/` — хранение на устройстве и синхронизация (офлайн-очередь изменений);
- `src/utils/recurrence.ts` — расчёт повторяющихся событий;
- `src/lib/reminders.ts` — напоминания (Android — системные уведомления, Windows — уведомления программы);
- `electron/main.cjs` — программа для Windows.

Подробно: [../../ЗАПУСК-И-RUSTORE.md](../../ЗАПУСК-И-RUSTORE.md)
