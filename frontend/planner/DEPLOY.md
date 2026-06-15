# Быстрый деплой на Render (1 клик)

## Вариант 1: Deploy to Render (рекомендуется)

1. Зарегистрируйся на [render.com](https://render.com) (бесплатно, через GitHub — 1 минута)
2. Нажми эту кнопку:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Regenval0-0/planner)

3. Render автоматически создаст:
   - **PostgreSQL базу** (бесплатно)
   - **Backend** (Node.js)
4. Скопируй URL backend (например `https://planner-backend-xxx.onrender.com`)
5. В приложении нажми ⚙️ → вставь URL → Сохранить → перезапусти

## Вариант 2: Локально через Docker (без облака)

Если не хочешь регистрироваться нигде:

```bash
cd C:\Ren
docker-compose up -d
```

Backend + PostgreSQL запустятся локально на `http://localhost:3001`.

## Вариант 3: GitHub Pages (только мобильная/веб версия)

1. Зайди в настройки репозитория на GitHub: `https://github.com/Regenval0-0/planner/settings/pages`
2. Source → Deploy from a branch → `main` → `/root`
3. Через 2 минуты frontend будет доступен по:
   `https://regenval0-0.github.io/planner/`

## Настройка URL в приложении

После деплоя backend:

| Платформа | Где ввести URL |
|---|---|
| **Windows (.exe)** | Открой приложение → ⚙️ (Настройки) → "URL сервера" |
| **Android (RuStore)** | Открой приложение → ⚙️ → "URL сервера" |
| **Веб (GitHub Pages)** | Указывается при сборке через `VITE_BACKEND_URL` |

**Готовый URL будет вида:** `https://planner-backend-xxx.onrender.com`
