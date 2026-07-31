# Чек-лист публикации в RuStore

## ✅ Техническая готовность

- [x] `targetSdkVersion` = 36 (Android 14)
- [x] `compileSdkVersion` = 36
- [x] `minSdkVersion` = 24 (Android 7.0)
- [x] Adaptive Icons (mipmap-anydpi-v26)
- [x] Network Security Config
- [x] Data Extraction Rules (backup ограничен)
- [x] Local Notifications plugin подключён
- [x] ProGuard + minifyEnabled для release
- [x] versionCode синхронизирован с package.json
- [x] CI/CD (GitHub Actions) для сборки signed APK/AAB

## ⚠️ Предварительные шаги (выполнить вручную)

### 1. Production Keystore (КРИТИЧНО)

**Создать один раз и сохранить в надёжном месте!** Потеря keystore = невозможность обновлять приложение.

```bash
cd frontend/planner/android/app
keytool -genkey -v \
  -keystore planner-release.keystore \
  -alias planner \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass ВАШ_ПАРОЛЬ \
  -keypass ВАШ_ПАРОЛЬ \
  -dname "CN=Planner App, OU=Dev, O=Planner, L=Moscow, ST=Russia, C=RU"
```

**Сохранить для CI/CD (GitHub Secrets):**
```bash
# base64 encode keystore
base64 -w 0 planner-release.keystore > keystore.base64

# Скопировать содержимое keystore.base64 в GitHub Secret: ANDROID_KEYSTORE_BASE64
# А также создать секреты:
#   ANDROID_KEYSTORE_PASSWORD
#   ANDROID_KEY_ALIAS (= planner)
#   ANDROID_KEY_PASSWORD
```

### 2. Сборка локально (для ручной загрузки)

```bash
cd frontend/planner
.\scripts\build-apk.bat
```

Результат:
- `release/planner-rustore.apk`
- `release/planner-rustore.aab` ← **рекомендуется загружать AAB**

### 3. Графические материалы

| Файл | Размер | Где разместить |
|------|--------|----------------|
| Иконка приложения | 512×512 PNG | `rustore-assets/icon-512.png` |
| Feature Graphic | 1400×560 PNG | `rustore-assets/feature-graphic-1400x560.png` |
| Скриншот 1 (настройка сервера) | 1080×2340 | `rustore-assets/screenshots/01-setup.png` |
| Скриншот 2 (вход) | 1080×2340 | `rustore-assets/screenshots/02-login.png` |
| Скриншот 3 (календарь) | 1080×2340 | `rustore-assets/screenshots/03-calendar.png` |
| Скриншот 4 (настройки) | 1080×2340 | `rustore-assets/screenshots/04-settings.png` |
| Скриншот 5 (добавление события) | 1080×2340 | `rustore-assets/screenshots/05-add-event.png` |

**Советы по скриншотам:**
- Снимайте на реальном устройстве или эмуляторе с включённой навигационной панелью Android
- Убедитесь, что на скриншотах нет личных данных
- Используйте русский язык интерфейса
- Покажите разные состояния: календарь, создание события, список задач

### 4. Загрузка в RuStore Console

1. Перейдите на https://console.rustore.ru
2. Создайте приложение → **Название:** Планер → **Имя пакета:** com.planner.app
3. Заполните:
   - **Название:** Планер
   - **Краткое описание:** (из `rustore-assets/description.md`)
   - **Полное описание:** (из `rustore-assets/description.md`)
   - **Категория:** Производительность / Инструменты
   - **Возрастной рейтинг:** 0+
   - **Ссылка на политику конфиденциальности:** https://github.com/Regenval0-0/planner/blob/main/frontend/planner/rustore-assets/PRIVACY_POLICY.md
4. Загрузите:
   - AAB файл (`release/planner-rustore.aab`)
   - Иконку 512×512
   - Feature Graphic 1024×500
   - 3-5 скриншотов
5. Укажите контакты поддержки (email или Telegram)
6. Отправьте на модерацию

### 5. Время модерации

- Обычно: **1-3 рабочих дня**
- После одобрения: приложение появится в RuStore в течение нескольких часов

## 🔒 Важные замечания

- **Keystore:** никогда не теряйте production keystore. Без него невозможно выпускать обновления.
- **Версия:** при каждом обновлении увеличивайте версию в `package.json` (например, `0.1.0` → `0.1.1`). `versionCode` обновится автоматически.
- **AAB vs APK:** RuStore поддерживает оба формата. AAB предпочтительнее — он позволяет Google Play/RuStore оптимизировать размер.
- **Подпись:** убедитесь, что APK/AAB подписан production keystore, а не debug.

## 📝 Полезные ссылки

- [RuStore Console](https://console.rustore.ru)
- [Требования RuStore к приложениям](https://www.rustore.ru/help/developers/)
- [Политика конфиденциальности](../PRIVACY.md)
