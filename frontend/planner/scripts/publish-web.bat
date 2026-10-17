@echo off
chcp 65001 >nul
rem Собирает веб-версию и выкладывает её в ветку gh-pages (GitHub Pages): https://regenval0-0.github.io/planner/
cd /d "%~dp0\.."
set "LOG=%~dp0publish-web.log"
set "VITE_BACKEND_URL=https://planner-backend-c7at.onrender.com"
set "VITE_SUPPORT_EMAIL=regenschopfer@mail.ru"
echo === Веб-версия === > "%LOG%"
call npm run build >> "%LOG%" 2>&1 || (echo Сборка не удалась, см. %LOG% & pause & exit /b 1)
set "TMP_PAGES=%TEMP%\planner-pages"
if exist "%TMP_PAGES%" rd /s /q "%TMP_PAGES%"
mkdir "%TMP_PAGES%"
xcopy /e /i /y /q dist "%TMP_PAGES%" >> "%LOG%" 2>&1
type nul > "%TMP_PAGES%\.nojekyll"
pushd "%TMP_PAGES%"
git init -q -b gh-pages >> "%LOG%" 2>&1
git add -A >> "%LOG%" 2>&1
git -c user.name=planner -c user.email=planner@users.noreply.github.com commit -q -m "Веб-версия Планера" >> "%LOG%" 2>&1
git remote add origin https://github.com/Regenval0-0/planner.git
git push -f origin gh-pages >> "%LOG%" 2>&1
echo EXIT=%ERRORLEVEL% >> "%LOG%"
popd
type "%LOG%"
echo.
echo Один раз включите GitHub Pages: репозиторий - Settings - Pages - Branch: gh-pages / root.
pause
