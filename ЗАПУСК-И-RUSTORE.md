# Планер: запуск сервера, сборка для Windows и Android, публикация в RuStore

## Как устроено

```
Телефон (Android, RuStore) ─┐
                            ├──► Сервер (Node.js + PostgreSQL) ◄── один аккаунт на всех устройствах
Компьютер (Windows, .exe) ──┘
```

- **Сервер** — `backend/planner`. Хранит аккаунты и события, рассылает изменения на другие устройства мгновенно.
- **Приложение** — `frontend/planner`. Один и тот же интерфейс собирается в Android-приложение (Capacitor) и программу для Windows (Electron).
- Адрес сервера **встраивается в сборку**: пользователю ничего настраивать не нужно, только зарегистрироваться.
- Без интернета приложение работает с сохранённой копией; изменения отправляются, когда связь появится.
- Напоминания: на Android — системные уведомления (даже если приложение закрыто), на Windows — пока программа запущена (при закрытии окна она остаётся в трее).

---

## Шаг 0. Один раз после обновления (вручную)

Файлы в `.github` и `.env*` нельзя записать удалённо, поэтому они лежат в `C:\Ren\_planner-update`:

1. Скопируйте всё из `_planner-update\github-workflows\` в `C:\Ren\.github\workflows\` (с заменой) — там есть и `keep-alive.yml`.
2. Удалите `C:\Ren\.github\workflows\android-release.yml` — его заменил `build-apps.yml`.
3. Скопируйте `_planner-update\env.production.example` в `C:\Ren\frontend\planner\.env.production.example`.
4. Удалите папку `C:\Ren\_planner-update` (там проверочные скрипты и журналы, они больше не нужны).
5. Сохраните изменения в git и отправьте на GitHub:
   ```
   cd C:\Ren
   git add -A backend/planner frontend/planner deploy .github render.yaml docker-compose.yml .gitignore PRIVACY.md README.md ЗАПУСК-И-RUSTORE.md
   git commit -m "Планер 1.1.0: подготовка к запуску и RuStore"
   git push
   ```
   Важно: у вас в `C:\Ren` много других незакоммиченных файлов — команда выше добавляет только файлы Планера.

---

## Шаг 1. Сервер (бесплатно)

Схема: **Render** (сам сервер, бесплатно) + **Neon** (база PostgreSQL, бесплатно и бессрочно) + **UptimeRobot** (бесплатный пинг, чтобы сервер не засыпал). Карта нигде не нужна.

### 1.1. База данных в Neon

1. Зарегистрируйтесь на https://neon.tech (можно через GitHub).
2. Create project: имя `planner`, регион **AWS Europe Central 1 (Frankfurt)**, Postgres 16 или новее.
3. На странице проекта нажмите **Connect**, выключите **Connection pooling** и скопируйте строку подключения вида
   `postgresql://user:пароль@ep-....eu-central-1.aws.neon.tech/neondb?sslmode=require`
4. Допишите в конец `&connect_timeout=15` (база «просыпается» за секунду-две, так сервер её подождёт). Сохраните строку — она нужна в следующем пункте. Никому её не показывайте: в ней пароль от базы.

### 1.2. Сервер в Render

1. Сначала отправьте изменения на GitHub (шаг 0).
2. Зарегистрируйтесь на https://render.com через GitHub.
3. **New → Blueprint** → выберите репозиторий `Regenval0-0/planner` → Render прочитает `render.yaml`.
4. Render спросит `DATABASE_URL` — вставьте строку из Neon. `JWT_SECRET` он придумает сам.
5. **Apply**. Через 3–5 минут появится адрес вида `https://planner-backend-xxxx.onrender.com`.
   Откройте `…onrender.com/health` — должно быть `{"ok":true,...}`. Таблицы в базе создадутся сами при первом запуске.

### 1.3. Чтобы сервер не засыпал

Бесплатный Render засыпает после 15 минут без запросов, и тогда первый вход занимает до минуты.

1. Зарегистрируйтесь на https://uptimerobot.com (бесплатно).
2. **New monitor** → тип **HTTP(s)** → адрес `https://planner-backend-xxxx.onrender.com/health` → интервал **5 минут** → Create.
3. Запасной вариант уже есть в репозитории (`.github/workflows/keep-alive.yml`): на GitHub → Settings → Secrets and variables → Actions → **Variables** → New: `SERVER_URL` = адрес сервера.

Монитор ещё и пришлёт письмо, если сервер упадёт.

### Что даёт бесплатный вариант и его пределы

| | Лимит | Хватит на |
|---|---|---|
| Render: время работы | 750 ч/мес (сутки напролёт ≈ 744 ч) | один сервер 24/7 |
| Render: трафик | 5 ГБ/мес | сотни активных пользователей (запросы маленькие) |
| Neon: размер базы | 1 ГБ | сотни тысяч событий |
| Neon: вычисления | 100 ч/мес, база засыпает через 5 мин простоя | небольшое приложение |

Если лимиты закончатся, сервис приостановится до начала следующего месяца (данные не пропадут). Когда пользователей станет много — платный тариф или свой сервер (ниже).

**Персональные данные.** Приложение не собирает телефон, почту и имя — только логин, хеш пароля и записи планера. Сервер находится в Германии, это указано в политике конфиденциальности. Если позже понадобится хранить данные в России — переезд на свой сервер описан ниже.

### Платный вариант на будущее: свой сервер в России

1. VPS с Ubuntu (Timeweb Cloud, Selectel, Yandex Cloud и т. п., от ~200–400 ₽/мес) и домен с A-записью `api.ваш-домен.ru` → IP сервера.
2. На сервере:
   ```bash
   curl -fsSL https://get.docker.com | sh
   git clone https://github.com/Regenval0-0/planner.git && cd planner/deploy
   cp .env.example .env
   nano .env          # DOMAIN, JWT_SECRET и POSTGRES_PASSWORD (openssl rand -hex 32)
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. HTTPS включится сам, резервные копии базы — каждый день в `deploy/backups/`.

Переезд с бесплатного варианта: поменять `VITE_BACKEND_URL` и выпустить обновление приложения; данные переносятся командой `pg_dump` из Neon в новую базу.

---

## Шаг 2. Адрес сервера и почта поддержки

Создайте файл `C:\Ren\frontend\planner\.env.production` (по образцу `.env.production.example`):

```
VITE_BACKEND_URL=https://planner-backend-xxxx.onrender.com
VITE_SUPPORT_EMAIL=ваша-почта@example.ru
```

Почта показывается в политике конфиденциальности — RuStore требует реальный контакт. Этот файл не попадает в git.

---

## Шаг 3. Программа для Windows

Дважды щёлкните `frontend\planner\scripts\build-windows.bat`. Результат в `frontend\planner\release\`:

- `Planer-Setup-1.1.0.exe` — установщик (ярлык на рабочем столе и в «Пуске»);
- `Planer-Portable-1.1.0.exe` — запуск без установки.

Если у вас установлена старая версия «Планера» (со встроенным сервером), удалите её через «Параметры → Приложения» перед установкой новой.

---

## Шаг 4. Android

Нужен Android Studio (в нём есть Java и Android SDK — на компьютере их сейчас нет): https://developer.android.com/studio. После установки откройте Android Studio один раз, чтобы скачались компоненты SDK.

**Ключ подписи.** У вас уже есть `frontend\planner\android\app\planner-release.keystore` (пароль `planner123`). Им подписываются все версии в RuStore, менять его после первой публикации нельзя.
- Если приложение ещё **не публиковалось** — лучше создать новый ключ с надёжным паролем: переименуйте старый файл и запустите `scripts\create-keystore.bat`.
- Сделайте резервную копию ключа и пароля (флешка + менеджер паролей). Потеря ключа = невозможность выпускать обновления.

**Сборка:** дважды щёлкните `frontend\planner\scripts\build-apk.bat`. Результат в `frontend\planner\release\`:
- `planner-1.1.0.apk` — установить на телефон для проверки;
- `planner-1.1.0.aab` — загрузить в RuStore.

**Без Android Studio — через GitHub.** На github.com → репозиторий → Settings → Secrets and variables → Actions:
- Variables: `VITE_BACKEND_URL`, `VITE_SUPPORT_EMAIL`;
- Secrets: `ANDROID_KEYSTORE_BASE64` (содержимое ключа в base64: `certutil -encode planner-release.keystore key.txt`, взять текст между строками BEGIN/END), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`planner`), `ANDROID_KEY_PASSWORD`.

Затем Actions → «Сборка приложений» → Run workflow. Через ~15 минут APK, AAB и EXE появятся в разделе Artifacts.

**Новая версия:** поменяйте `"version"` в `frontend/planner/package.json` (например, `1.1.1`) — номер версии для Android посчитается из него автоматически.

---

## Шаг 5. Проверка перед публикацией

На телефоне (Android 10–15) и на компьютере:

- [ ] регистрация, вход, выход, вход с другого устройства;
- [ ] занятый логин (в том числе в другом регистре: `Dasha` / `dasha`) зарегистрировать нельзя;
- [ ] событие, созданное на телефоне, появляется на ПК (и наоборот) за пару секунд;
- [ ] режим полёта: создать событие → включить интернет → оно ушло на сервер;
- [ ] напоминание «В момент начала» на ближайшие минуты — уведомление пришло (Android спросит разрешение);
- [ ] ежемесячный платёж 31-го числа → в феврале 28/29, в марте снова 31;
- [ ] смена пароля → на другом устройстве просит войти заново;
- [ ] «Настройки → Удалить аккаунт» удаляет данные;
- [ ] тёмная тема, поворот экрана, системная кнопка «Назад».

---

## Шаг 6. RuStore

1. https://console.rustore.ru — регистрация разработчика.
2. Новое приложение:
   - **Имя пакета: `com.planner.app`.** Оно должно быть уникальным во всём RuStore и не меняется после публикации. Если RuStore скажет, что имя занято, поменяйте `appId` в `capacitor.config.ts` и `namespace`/`applicationId` в `android/app/build.gradle` (например, на `ru.вашеимя.planer`) и пересоберите.
   - Категория: «Производительность», возраст 0+.
   - Описание: `frontend/planner/rustore-assets/description.md` (впишите почту поддержки).
   - Иконка: `rustore-assets/icon-512.png`; баннер: `feature-graphic-1400x560.png`; скриншоты: `rustore-assets/screenshots/`.
   - Политика конфиденциальности (ссылка): `https://github.com/Regenval0-0/planner/blob/main/frontend/planner/rustore-assets/PRIVACY_POLICY.md` — впишите в файл свою почту в разделе «Контакты» и отправьте на GitHub.
   - Удаление аккаунта: «Настройки → Удалить аккаунт» внутри приложения.
3. Загрузите `planner-1.1.0.aab` (или `.apk`) и отправьте на модерацию.

---

## Для разработки

```bash
# сервер (SQLite, файл prisma/dev.db)
cd backend/planner
copy .env.example .env      # впишите JWT_SECRET (32+ символа)
npm install
npx prisma migrate reset    # создаст базу заново (старую dev.db — удалит)
npm run dev                 # http://localhost:3001

# интерфейс в браузере
cd frontend/planner
npm install
npm run dev                 # http://localhost:5173

# тесты
cd backend/planner && npm test      # API на временной базе
cd frontend/planner && npm test     # повторы событий, офлайн-очередь
```

Структура базы: `backend/planner/prisma/schema.prisma` (SQLite, для разработки) и `prisma/postgres/schema.prisma` (сервер) — модели в них должны совпадать. Новая миграция для сервера пишется в `prisma/postgres/migrations/`.
