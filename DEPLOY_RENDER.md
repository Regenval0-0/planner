# 🚀 Деплой на Render (1 кнопка)

## Шаг 1. Нажми кнопку

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Regenval0-0/planner)

Это откроет Render Dashboard.

## Шаг 2. Авторизуйся через GitHub

1. Если спросит — залогинься через GitHub (1 клик)
2. Render автоматически создаст:
   - **Web Service** — твой backend (Node.js + Express)
   - **PostgreSQL базу** — бесплатная, данные сохраняются
   - **JWT_SECRET** — сгенерирует автоматически

## Шаг 3. Жди и копируй URL

- Сборка занимает **3–5 минут**
- Когда увидишь зелёную галочку ✅ — всё готово
- Скопируй URL вида: `https://planner-backend-xxx.onrender.com`

## Шаг 4. Настрой приложение

1. Открой приложение на телефоне
2. На SetupPage вставь URL сервера
3. Нажми **Подключиться**
4. Регистрируйся → создавай заметки → они синхронизируются

## ⚠️ Важно про бесплатный tier Render

- Сервер засыпает через **15 минут** без запросов
- При первом входе после сна — задержка **30–60 секунд**
- Если хочешь, чтобы не засыпал — нужно перейти на платный тариф ($7/мес)

## 📁 Что деплоится автоматически

```
backend/planner/          → Node.js сервер
prisma/schema.prod.prisma → PostgreSQL схема
render.yaml               → Конфиг Render
```
