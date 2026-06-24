@echo off
chcp 65001 >nul
echo === Сборка Android для RuStore ===
echo.

cd /d "%~dp0\.."

set "KEystoreFile=android\app\planner-release.keystore"
set "KEY_ALIAS=planner"

:: Проверка наличия production keystore
if not exist "%KEystoreFile%" (
    echo.
    echo ВНИМАНИЕ: Production keystore не найден: %KEystoreFile%
    echo.
    echo Для публикации в RuStore нужен production keystore.
    echo Если у вас его нет, скрипт создаст временный (ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ).
    echo.
    echo Чтобы создать production keystore:
    echo   keytool -genkey -v -keystore planner-release.keystore -alias planner -keyalg RSA -keysize 2048 -validity 10000
    echo.
    choice /C YN /M "Создать временный keystore для тестирования"
    if errorlevel 2 exit /b 1

    echo.
    echo Создание временного keystore...
    for /f "delims=" %%i in ('where keytool 2^>nul') do set KEYTOOL=%%i
    if "!KEYTOOL!"=="" (
        echo keytool не найден. Убедитесь что установлен JDK.
        pause
        exit /b 1
    )
    "%KEYTOOL%" -genkey -v -keystore "%KEystoreFile%" -alias %KEY_ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass planner123 -keypass planner123 -dname "CN=Planner App, OU=Dev, O=Planner, L=Moscow, ST=Russia, C=RU"
    if errorlevel 1 (
        echo ОШИБКА создания keystore
        pause
        exit /b 1
    )
)

echo [1/6] Сборка веб-assets...
call npx vite build --mode production
if errorlevel 1 (
    echo ОШИБКА: Сборка Vite не удалась
    pause
    exit /b 1
)

echo.
echo [2/6] Синхронизация Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ОШИБКА: Синхронизация Capacitor не удалась
    pause
    exit /b 1
)

cd android

echo.
echo [3/6] Сборка Release APK...
call .\gradlew assembleRelease
if errorlevel 1 (
    echo ОШИБКА: Сборка APK не удалась
    pause
    exit /b 1
)

echo.
echo [4/6] Сборка Release AAB...
call .\gradlew bundleRelease
if errorlevel 1 (
    echo ОШИБКА: Сборка AAB не удалась
    pause
    exit /b 1
)

cd ..

echo.
echo [5/6] Копирование артефактов...
if not exist "release" mkdir "release"
copy "android\app\build\outputs\apk\release\app-release.apk" "release\planner-rustore.apk" /Y
copy "android\app\build\outputs\bundle\release\app-release.aab" "release\planner-rustore.aab" /Y

echo.
echo [6/6] Проверка подписи APK...
for /f "delims=" %%i in ('where apksigner 2^>nul') do set APK_SIGNER=%%i
if "!APK_SIGNER!"=="" (
    echo apksigner не найден, пропускаю проверку подписи
) else (
    "!APK_SIGNER!" verify release\planner-rustore.apk
    if errorlevel 1 (
        echo ВНИМАНИЕ: APK не подписан или подпись невалидна!
    ) else (
        echo Подпись APK валидна.
    )
)

echo.
echo === УСПЕХ ===
echo APK: release\planner-rustore.apk
echo AAB: release\planner-rustore.aab
echo.
echo Следующие шаги для RuStore:
echo 1. Перейдите на https://console.rustore.ru
echo 2. Создайте приложение с именем пакета: com.planner.app
echo 3. Загрузите AAB (рекомендуется) или APK
echo 4. Заполните данные приложения (название, описание, скриншоты)
echo 5. Отправьте на модерацию
echo.
pause
