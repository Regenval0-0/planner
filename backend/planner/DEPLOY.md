# 🚀 Деплой на Render.com + Neon.tech

Это полноценный сайт в интернете с:
- PostgreSQL базой данных (Neon — бесплатно)
- Реальной отправкой писем (Resend — бесплатно 3000 писем/день)
- HTTPS и постоянным URL (Render — бесплатно)
- SEO для поисковиков

---

## 1. Создай базу данных PostgreSQL (Neon.tech)

1. Перейди на https://neon.tech
2. Зарегистрируйся через GitHub
3. Создай новый проект, выбери регион **Frankfurt** (ближе к России)
4. В разделе **Connection Details** скопируй строку подключения — она выглядит так:
   ```
   postgresql://user:password@ep-xxx.neon.tech/planner?sslmode=require
   ```
5. **Сохрани её** — она понадобится на Render

---

## 2. Получи API ключ для почты (Resend)

1. Перейди на https://resend.com
2. Зарегистрируйся
3. Во вкладке **API Keys** нажми **Create API Key**
4. Скопируй ключ — он начинается с `re_`
5. **Сохрани его**

> Пока не подтвердишь домен на Resend, письма будут отправляться только на твою собственную почту. Для теста этого достаточно.

---

## 3. Загрузи код на GitHub

Если проект ещё не в Git:

```bash
cd C:\Ren
git init
git add .
git commit -m "Production ready"
```

Затем создай репозиторий на https://github.com/new (назови `planner`) и выполни:

```bash
git remote add origin https://github.com/ТВОЙ_НИК/planner.git
git branch -M main
git push -u origin main
```

---

## 4. Деплой на Render.com

1. Перейди на https://render.com и залогинься через GitHub
2. Нажми **New +** → **Blueprint** (или **Web Service** если Blueprint не видит файл)
3. Выбери свой репозиторий `planner`
4. Render автоматически прочитает `render.yaml` в папке `backend/planner/`

Если используешь **Blueprint**:
- Render предложит создать сервис из `render.yaml`
- Укажи имя: `planner-app`

Если используешь **Web Service** вручную:
- **Name**: `planner-app`
- **Environment**: Node
- **Build Command**:
  ```bash
  cp prisma/schema.prod.prisma prisma/schema.prisma && npm install && npx prisma generate && npm run build
  ```
- **Start Command**: `npm start`
- **Root Directory**: `backend/planner`

### 4.1 Добавь переменные окружения (Environment Variables)

В настройках сервиса на Render добавь:

| Key | Value |
|---|---|
| `DATABASE_URL` | Твоя строка из Neon (шаг 1) |
| `JWT_SECRET` | Случайная строка минимум 32 символа |
| `RESEND_API_KEY` | Твой ключ из Resend (шаг 2) |
| `APP_URL` | `https://planner-app.onrender.com` (или твой домен) |

### 4.2 Первая миграция базы данных

После деплоя открой **Shell** на Render и выполни:

```bash
npx prisma migrate deploy
```

Это создаст таблицы в Neon PostgreSQL.

---

## 5. Проверь сайт

После деплоя Render даст тебе URL типа:

```
https://planner-app.onrender.com
```

Открой его в браузере:
- Главная страница должна загрузиться
- `/health` должен вернуть `{"ok":true}`
- `/robots.txt` должен показать правила для поисковиков
- Регистрация должна работать (письмо с кодом придёт на почту)

---

## 6. Добавь свой домен (опционально)

Чтобы сайт был по настоящему адресу типа `planner.ru`:

1. Купи домен на https://reg.ru или https://namecheap.com
2. В панели Render: **Settings** → **Custom Domains**
3. Добавь свой домен
4. В панели регистратора домена: создай CNAME-запись на `planner-app.onrender.com`
5. Обнови `APP_URL` в переменных окружения Render на свой домен
6. На Resend добавь и подтверди свой домен для отправки писем

---

## 7. SEO — добавь в Google

1. Перейди на https://search.google.com/search-console
2. Добавь свой домен или URL
3. Подтверди владение (через HTML-файл или DNS-запись)
4. Запроси индексацию главной страницы
5. Добавь ссылку на `/sitemap.xml` в Search Console

---

## 📁 Что подготовлено в коде

| Файл | Назначение |
|---|---|
| `render.yaml` | Конфигурация деплоя на Render |
| `prisma/schema.prod.prisma` | PostgreSQL схема для продакшена |
| `src/server.ts` | Раздача фронтенда + `/robots.txt` + `/sitemap.xml` |
| `src/mailer.ts` | Resend для реальной отправки писем |
| `index.html` | SEO meta-теги для поисковиков |
| `DEPLOY.md` | Эта инструкция |

---

## ⚠️ Важно

- **Render free tier**: сервер "засыпает" после 15 минут без запросов. Первый запрос после сна занимает 30-60 секунд (спин-ап).
- **Neon free tier**: 500 MB хранилища, 100+ часов вычислений/месяц — достаточно для учебного проекта.
- **Resend free tier**: 3000 писем/день — более чем достаточно.

---

## 🔒 Безопасность

- `.env` не попадает в Git (добавь в `.gitignore` если ещё нет)
- `JWT_SECRET` на Render генерируется автоматически
- Пароли хешируются через bcrypt
- HTTPS включён автоматически на Render
