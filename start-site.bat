@echo off
chcp 65001 >nul
echo =========================================
echo   🚀 Планер — запуск сайта в интернете
echo =========================================
echo.

cd /d C:\Ren\backend\planner

echo [1/3] Запуск backend...
start /min "Backend" cmd /c "npx tsx src/server.ts > backend.log 2>&1"
timeout /t 5 /nobreak >nul

echo [2/3] Запуск туннеля (дает сайту интернет-адрес)...
start /min "Tunnel" cmd /c "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=nul -o ServerAliveInterval=60 -R 80:localhost:3001 serveo.net > tunnel.log 2>&1"
timeout /t 10 /nobreak >nul

echo [3/3] Получение URL...
findstr "serveousercontent.com" tunnel.log > url.txt 2>nul
for /f "tokens=*" %%a in (url.txt) do (
    echo.
    echo =========================================
    echo  ✅ Сайт доступен!
    echo.
    echo  Фронтенд (постоянный):
    echo  https://regenval0-0.github.io/planner/
    echo.
    echo  Backend (временный):
    echo  %%a
    echo =========================================
)

echo.
echo ⚠️  Важно:
echo    - Не закрывай это окно — иначе сайт отключится
echo    - Backend работает только пока включен компьютер
echo    - Для постоянного сайта нажми кнопку на GitHub:
echo    - https://github.com/Regenval0-0/planner
echo.
pause
