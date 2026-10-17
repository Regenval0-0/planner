@echo off
chcp 65001 >nul
cd /d "%~dp0\.."
echo === Сборка «Планера» для Windows ===
echo.
echo [1/2] Установка зависимостей...
call npm install --no-audit --no-fund || goto :error
echo [2/2] Сборка установщика...
call npm run dist:win || goto :error
echo.
echo === Готово ===
echo Установщик: release\Planer-Setup-*.exe
echo Без установки: release\Planer-Portable-*.exe
pause
exit /b 0
:error
echo.
echo *** Сборка остановлена из-за ошибки (см. выше) ***
pause
exit /b 1
