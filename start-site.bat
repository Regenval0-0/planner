@echo off
chcp 65001 >nul
echo 🚀 Запуск Планера в интернете...
echo.

cd /d C:\Ren\backend\planner

echo [1/3] Запуск backend...
start /min cmd /c "npx tsx src/server.ts"
timeout /t 5 /nobreak >nul

echo [2/3] Открытие туннеля...
start /min cmd /c "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=nul -o ServerAliveInterval=60 -R 80:localhost:3001 serveo.net > tunnel-url.txt 2>&1"
timeout /t 8 /nobreak >nul

echo [3/3] Получение URL...
findstr "serveousercontent.com" tunnel-url.txt > url.txt 2>nul
for /f "tokens=*" %%a in (url.txt) do (
    echo.
    echo =========================================
    echo  ✅ Сайт доступен по адресу:
    echo  %%a
    echo =========================================
    echo.
    echo  Фронтенд: https://regenval0-0.github.io/planner/
    echo  Backend:  %%a
    echo.
    echo  Не закрывай это окно — туннель активен.
    echo  Нажми Ctrl+C дважды для остановки.
)

echo.
pause
