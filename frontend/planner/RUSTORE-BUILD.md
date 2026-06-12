# Сборка APK для RuStore

## Предварительные требования

1. **Node.js** (v20+) — https://nodejs.org
2. **Android Studio** — https://developer.android.com/studio
3. **Git** — https://git-scm.com

## Шаг 1: Установка зависимостей

```bash
cd frontend/planner
npm install
```

## Шаг 2: Сборка APK (автоматический способ)

### Способ A: Через скрипт (рекомендуется)

Дважды кликни на файл:
```
scripts\build-apk.bat
```

Или через PowerShell:
```powershell
.\scripts\build-apk.ps1
```

Скрипт автоматически:
1. Соберёт веб-assets (`vite build`)
2. Синхронизирует с Android (`cap sync`)
3. Создаст keystore (если нет)
4. Соберёт APK (`gradle assembleRelease`)
5. Скопирует готовый APK в `release\planner-rustore.apk`

### Способ B: Вручную

```bash
# 1. Сборка frontend
cd frontend/planner
npx vite build --mode production

# 2. Синхронизация Capacitor
npx cap sync android

# 3. Создание keystore (только первый раз)
cd android/app
keytool -genkey -v -keystore planner.keystore -alias planner -keyalg RSA -keysize 2048 -validity 10000 -storepass planner123 -keypass planner123 -dname "CN=Planner App, OU=Dev, O=Planner, L=Moscow, ST=Russia, C=RU"
cd ../..

# 4. Сборка APK
cd android
.\gradlew assembleRelease

# 5. APK находится по пути:
# android\app\build\outputs\apk\release\app-release.apk
```

## Шаг 3: Публикация в RuStore

1. Перейди на https://console.rustore.ru
2. Создай новое приложение:
   - **Название**: Планер
   - **Имя пакета**: `com.planner.app`
   - **Версия**: 1.0
3. Загрузи APK: `release\planner-rustore.apk`
4. Заполни карточку приложения:
   - Иконка (512x512 PNG)
   - Скриншоты (минимум 2)
   - Описание (см. `rustore-assets\description.md`)
   - Категория: Производительность
5. Отправь на модерацию

## Важно

### Облачный backend
Для синхронизации данных между устройствами нужен облачный сервер.

**Вариант 1: Render.com (бесплатно)**
1. Задеплой backend на Render.com (см. README в backend/planner)
2. Получи URL вида `https://planner-backend-xxx.onrender.com`

**Вариант 2: Самостоятельный сервер**
- Установи Docker и docker-compose
- Запусти: `docker-compose up -d` в корне проекта
- Backend будет доступен на `http://localhost:3001`

### Настройка URL в приложении
1. Открой приложение на телефоне
2. Нажми ⚙️ (Настройки)
3. Введи URL сервера
4. Нажми "Сохранить"

### Повторяющиеся платежи
Для работы повторяющихся событий нужно, чтобы приложение периодически синхронизировалось с сервером.

## Отладка

Если сборка не работает:

1. **JAVA_HOME не установлен**
   - Android Studio → SDK Manager → выбери JDK
   - Установи переменную среды JAVA_HOME

2. **Gradle не найден**
   ```bash
   cd android
   .\gradlew --version
   ```

3. **Capacitor не синхронизирован**
   ```bash
   npx cap sync android
   ```

## Контакты

Проект: https://github.com/Regenval0-0/planner
