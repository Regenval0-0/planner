@echo off
chcp 65001 >nul
echo === Сборка APK для RuStore ===
echo.

cd /d "%~dp0\.."

echo [1/5] Сборка веб-assets...
call npx vite build --mode production
if errorlevel 1 (
    echo ОШИБКА: Сборка Vite не удалась
    pause
    exit /b 1
)

echo.
echo [2/5] Синхронизация Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ОШИБКА: Синхронизация Capacitor не удалась
    pause
    exit /b 1
)

cd android\app

echo.
echo [3/5] Проверка keystore...
if not exist "planner.keystore" (
    echo Создание keystore для подписи APK...
    for /f "delims=" %%i in ('where keytool 2^>nul') do set KEYTOOL=%%i
    if "!KEYTOOL!"=="" (
        echo keytool не найден. Используется путь из Android Studio...
        if exist "%LOCALAPPDATA%\Android\Sdk" (
            set KEYTOOL=%LOCALAPPDATA%\Android\Sdk\openjdk\bin\keytool.exe
        ) else (
            echo ОШИБКА: Не найден keytool. Установите Android Studio.
            pause
            exit /b 1
        )
    )
    "%KEYTOOL%" -genkey -v -keystore planner.keystore -alias planner -keyalg RSA -keysize 2048 -validity 10000 -storepass planner123 -keypass planner123 -dname "CN=Planner App, OU=Dev, O=Planner, L=Moscow, ST=Russia, C=RU"
)

cd ..

echo.
echo [4/5] Сборка APK...
call .\gradlew assembleRelease
if errorlevel 1 (
    echo ОШИБКА: Сборка Gradle не удалась
    pause
    exit /b 1
)

echo.
echo [5/5] Копирование APK...
if not exist "..\release" mkdir "..\release"
copy "app\build\outputs\apk\release\app-release.apk" "..\release\planner-rustore.apk" /Y

echo.
echo === УСПЕХ ===
echo APK сохранён: release\planner-rustore.apk
echo.
echo Следующие шаги для RuStore:
echo 1. Перейдите на https://console.rustore.ru
echo 2. Создайте приложение с именем пакета: com.planner.app
echo 3. Загрузите APK
echo 4. Заполните данные приложения (название, описание, скриншоты)
echo 5. Отправьте на модерацию
echo.
pause
