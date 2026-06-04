# Planner App

Персональный планировщик задач, событий и встреч. Desktop-приложение на Electron + React + Tailwind. Данные хранятся локально (localStorage) с возможностью перехода на Supabase.

## 📁 Структура

```
planner-app/
├── shared/          # Типы и API (localStorage / Supabase-ready)
├── desktop/         # Electron + React + Tailwind + Виджет
└── mobile/          # Заготовка под React Native Expo
```

## 🚀 Быстрый старт

```bash
cd planner-app
npm install
npm run build:shared
npm run dev:desktop
```

## 🖥 Desktop

- **Главное окно** — полный CRUD для задач, событий и встреч
- **Виджет** — always-on-top прозрачное окно в углу экрана с ближайшими делами
- **Синхронизация окон** — изменения в главном окне мгновенно отображаются в виджете (BroadcastChannel)
- **Уведомления** — напоминания за 15 минут до начала события

### Горячие клавиши
- `Ctrl+Shift+P` — показать/скрыть главное окно
- `Ctrl+Shift+W` — показать/скрыть виджет
- `Win` + иконка в трее — двойной клик открывает окно

## 📦 Production сборка

```bash
cd planner-app/desktop
npm run dist:win
```

Создаёт `.exe` + `.portable` в `desktop/dist-installer/`.

## 🔧 Переход на Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. Скопируй `URL` и `anon key` в `.env` (по примеру `.env.example`)
3. Замени реализацию в `shared/src/supabase.ts` на настоящий Supabase клиент

## 🛠 Технологии

| Слой | Технология |
|------|-----------|
| Frontend Desktop | React 19, Vite, Tailwind CSS, Electron 33 |
| Shared | TypeScript |
| Mobile (future) | React Native Expo |

## ⚠️ Известные нюансы

- На некоторых Windows виджет может рендерить чёрный фон. Использован фикс `opacity: 0.9999999`.
- Для сборки `.exe` на Windows требуется `build/icon.ico` (уже есть в проекте).
