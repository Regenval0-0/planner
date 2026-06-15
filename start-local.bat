@echo off
chcp 65001 >nul
echo === Запуск Планера локально ===
echo.

:: Проверка Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker не найден. Установи Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

:: Запуск Docker Compose
echo [1/3] Запуск PostgreSQL + Backend...
cd /d "%~dp0"
docker-compose up -d
if errorlevel 1 (
    echo Ошибка запуска Docker
    pause
    exit /b 1
)

:: Ожидание запуска
echo [2/3] Ожидание запуска backend...
timeout /t 5 /nobreak >nul

:: Проверка
curl -s http://localhost:3001/health >nul
if errorlevel 1 (
    echo Backend не ответил. Попробуй открыть http://localhost:3001 через несколько секунд.
) else (
    echo [3/3] Backend работает! Открывай http://localhost:3001
)

echo.
echo === Готово ===
echo Backend: http://localhost:3001
echo.
echo Чтобы остановить: docker-compose down
echo.
pause
