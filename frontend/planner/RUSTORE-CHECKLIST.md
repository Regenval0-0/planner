# Чек-лист публикации в RuStore

## ✅ Предварительные требования

- [x] Android APK собран и подписан
- [x] RuStore ассеты подготовлены
- [x] Политика конфиденциальности написана
- [x] Backend развёрнут (или готов к развёртыванию)

---

## 📝 Шаг 1: Регистрация в консоли RuStore

1. Перейти на https://console.rustore.ru
2. Авторизоваться через VK ID, Tinkoff ID или госуслуги
3. Заполнить данные разработчика (ИНН/паспорт для юрлиц или физлиц)

---

## 📦 Шаг 2: Создание приложения

| Поле | Значение |
|------|----------|
| **Название** | Планер — Календарь и Задачи |
| **Имя пакета** | `com.planner.app` |
| **Категория** | Производительность |
| **Возрастное ограничение** | 0+ (Для всех возрастов) |
| **Email поддержки** | planner-support@github.com |

---

## 🖼️ Шаг 3: Загрузка графических материалов

Файлы находятся в `frontend/planner/rustore-assets/`:

- [x] **Иконка**: `icon-512.png` — 512×512 px (RGBA)
- [x] **Feature Graphic**: `feature-graphic-1400x560.png` — 1400×560 px
- [x] **Скриншоты**: `screenshots/`
  - `01-setup.png` — 1280×720
  - `03-login-dark.png` — 1280×720
  - *Рекомендуется добавить ещё 2–3 скриншота в портретной ориентации (например, календарь, задачи, тёмная тема)*

---

## 📄 Шаг 4: Описание приложения

**Краткое описание** (до 80 символов):
```
Персональный планер событий, задач и платежей с синхронизацией
```

**Полное описание** (см. `rustore-assets/description.md`):
- Календарь событий с недельной и месячной навигацией
- Задачи с дедлайнами
- Встречи с указанием времени
- Платежи с суммой и повторением
- Синхронизация данных между устройствами
- Работа без интернета (данные сохраняются локально)

---

## 🔒 Шаг 5: Политика конфиденциальности

- Файл: `rustore-assets/PRIVACY_POLICY.md`
- URL для RuStore (можно разместить в GitHub репозитории):
  ```
  https://github.com/Regenval0-0/planner/blob/main/frontend/planner/rustore-assets/PRIVACY_POLICY.md
  ```
- Также добавлена ссылка внутри приложения (Настройки → Политика конфиденциальности)

---

## 📲 Шаг 6: Загрузка APK / AAB

### Вариант A: APK (быстрее, для тестирования)
- Файл: `frontend/planner/release/planner-rustore.apk`
- Размер: ~4.2 MB
- Подпись: v2 scheme, 1 signer
- Keystore: `android/app/planner-release.keystore`

### Вариант B: AAB (рекомендуется для RuStore)
- Собрать AAB: `cd android && .\gradlew.bat bundleRelease`
- Файл: `android/app/build/outputs/bundle/release/app-release.aab`
- RuStore предпочитает AAB для оптимизации доставки

**Важно**: не потеряйте keystore! Без него нельзя будет обновлять приложение.

---

## 🔧 Шаг 7: Настройка приложения в RuStore

### Контент рейтинг
- Выбрать категорию: **Производительность**
- Указать email поддержки

### Доступность
- Страны: Россия (по умолчанию)
- Устройства: телефоны и планшеты

### Цена
- Бесплатное приложение

---

## 🌐 Шаг 8: Подготовка backend (облако)

Для работы синхронизации между устройствами нужен облачный сервер:

**Вариант 1: Render.com (бесплатно)**
1. Зарегистрироваться на https://render.com
2. Нажать "Deploy to Render" в README репозитория
3. Скопировать URL вида `https://planner-backend-xxx.onrender.com`

**Вариант 2: Локальный сервер (Docker)**
```bash
cd C:\Ren
docker-compose up -d
```
Backend будет на `http://localhost:3001`.

**Вариант 3: Любой VPS с Docker**
- Склонировать репозиторий
- `docker-compose up -d`
- Указать публичный IP/домен в настройках приложения

---

## 🧪 Шаг 9: Тестирование перед модерацией

- [ ] Установить APK на чистое устройство (Android 10–14)
- [ ] Проверить SetupPage: ввести URL backend
- [ ] Зарегистрировать нового пользователя
- [ ] Создать событие, задачу, платёж
- [ ] Проверить тёмную тему и смену акцента
- [ ] Проверить уведомления (Android 13+ — разрешение запрашивается)
- [ ] Проверить ссылку на Privacy Policy в настройках
- [ ] Проверить offline-режим (данные в localStorage)

---

## 🚀 Шаг 10: Отправка на модерацию

1. В консоли RuStore перейти в раздел **Версии**
2. Загрузить APK или AAB
3. Заполнить все обязательные поля (✅)
4. Нажать **Отправить на модерацию**

**Срок модерации**: обычно 1–3 рабочих дня.

---

## 🔄 Шаг 11: Обновление приложения (будущие версии)

1. Повысить версию в `frontend/planner/package.json`
   ```json
   { "version": "1.0.2" }
   ```
2. Пересобрать APK (`scripts/build-apk.bat` или `./gradlew assembleRelease`)
3. Загрузить новую версию в RuStore
4. **Важно**: подписывать тем же keystore (`planner-release.keystore`)

---

## 📂 Полезные пути

| Файл | Путь |
|------|------|
| APK | `frontend/planner/release/planner-rustore.apk` |
| AAB | `frontend/planner/android/app/build/outputs/bundle/release/app-release.aab` |
| Keystore | `frontend/planner/android/app/planner-release.keystore` |
| Privacy Policy | `frontend/planner/rustore-assets/PRIVACY_POLICY.md` |
| Описание | `frontend/planner/rustore-assets/description.md` |
| Build script | `frontend/planner/scripts/build-apk.bat` |

---

## ⚡ Быстрые команды

```bash
# Сборка APK
cd frontend/planner
npx vite build --mode production
npx cap sync android
cd android
.\gradlew.bat assembleRelease

# Сборка AAB
.\gradlew.bat bundleRelease

# Проверка подписи
apksigner verify --verbose ..\release\planner-rustore.apk
```

---

Готово к выпуску! 🎉
