@echo off
chcp 65001 >nul
cd /d "%~dp0\..\android\app"
echo === Создание ключа подписи для RuStore ===
echo.
echo Ключ создаётся ОДИН раз. Сохраните файл planner-release.keystore и пароль
echo в надёжном месте (например, на флешке и в менеджере паролей):
echo без них нельзя будет выпускать обновления приложения в RuStore.
echo.
if exist planner-release.keystore (
  echo Ключ уже есть: android\app\planner-release.keystore — новый не создаётся.
  pause
  exit /b 0
)
where keytool >nul 2>&1
if errorlevel 1 (
  if exist "%JAVA_HOME%\bin\keytool.exe" (
    set "KEYTOOL=%JAVA_HOME%\bin\keytool.exe"
  ) else if exist "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" (
    set "KEYTOOL=C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
  ) else (
    echo Не найден keytool. Установите Android Studio: https://developer.android.com/studio
    pause
    exit /b 1
  )
) else (
  set "KEYTOOL=keytool"
)
set /p STOREPASS=Придумайте пароль ключа (не короче 8 символов): 
"%KEYTOOL%" -genkeypair -v -keystore planner-release.keystore -alias planner -keyalg RSA -keysize 2048 -validity 10000 -storepass "%STOREPASS%" -keypass "%STOREPASS%" -dname "CN=Planer, O=Planer, C=RU"
if errorlevel 1 (
  echo Ошибка создания ключа.
  pause
  exit /b 1
)
(
  echo STORE_FILE=planner-release.keystore
  echo STORE_PASSWORD=%STOREPASS%
  echo KEY_ALIAS=planner
  echo KEY_PASSWORD=%STOREPASS%
) > keystore.properties
echo.
echo Готово: android\app\planner-release.keystore и android\app\keystore.properties
echo Эти файлы НЕ попадают в git. Сделайте их резервную копию.
pause
