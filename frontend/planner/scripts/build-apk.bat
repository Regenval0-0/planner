@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0\.."
echo === Сборка «Планера» для Android (RuStore) ===
echo.

if not exist "android\app\keystore.properties" if not exist "android\app\planner-release.keystore" if not exist "android\app\planner.keystore" (
  echo Нет ключа подписи. Сначала запустите scripts\create-keystore.bat
  echo ВАЖНО: этим ключом подписываются ВСЕ будущие обновления в RuStore. Потеряете ключ — не сможете обновлять приложение.
  pause
  exit /b 1
)

echo [1/5] Установка зависимостей...
call npm install --no-audit --no-fund || goto :error

echo [2/5] Проверка настроек...
call npm run check-env || goto :error

echo [3/5] Сборка интерфейса...
call npm run build || goto :error

echo [4/5] Перенос в Android-проект...
call npx cap sync android || goto :error

echo [5/5] Сборка APK и AAB...
pushd android
call gradlew.bat assembleRelease bundleRelease || (popd & goto :error)
popd

if not exist release mkdir release
for /f "tokens=2 delims=:, " %%v in ('findstr /c:"\"version\"" package.json') do set VER=%%~v
copy /Y "android\app\build\outputs\apk\release\app-release.apk" "release\planner-!VER!.apk" >nul
copy /Y "android\app\build\outputs\bundle\release\app-release.aab" "release\planner-!VER!.aab" >nul

echo.
echo === Готово ===
echo APK (установить на телефон): release\planner-!VER!.apk
echo AAB (загрузить в RuStore):   release\planner-!VER!.aab
pause
exit /b 0

:error
echo.
echo *** Сборка остановлена из-за ошибки (см. выше) ***
pause
exit /b 1
