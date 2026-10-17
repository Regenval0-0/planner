@echo off
chcp 65001 >nul
rem Публикует установщик Windows на GitHub (раздел Releases): у ссылки на страницу скачивания постоянные адреса файлов.
cd /d "%~dp0\.."
set "LOG=%~dp0publish-release.log"
for /f "usebackq delims=" %%v in (`node -p "require('./package.json').version"`) do set "VER=%%v"
echo === Релиз %VER% === > "%LOG%"
where gh >nul 2>&1 || (echo Не найден GitHub CLI ^(gh^). Установите: https://cli.github.com и выполните "gh auth login" >> "%LOG%" & type "%LOG%" & pause & exit /b 1)
if not exist "release\Planer-Setup-%VER%.exe" (echo Нет release\Planer-Setup-%VER%.exe — сначала соберите программу ^(build-windows.bat^) >> "%LOG%" & type "%LOG%" & pause & exit /b 1)
rem Копии без номера версии — для вечной ссылки /releases/latest/download/Planer-Setup.exe
copy /y "release\Planer-Setup-%VER%.exe" "release\Planer-Setup.exe" >nul
copy /y "release\Planer-Portable-%VER%.exe" "release\Planer-Portable.exe" >nul
gh release view "v%VER%" >nul 2>&1
if errorlevel 1 (
  gh release create "v%VER%" "release\Planer-Setup.exe" "release\Planer-Portable.exe" --title "Планер %VER%" --notes "Программа для Windows. Войдите тем же логином, что на телефоне." --latest >> "%LOG%" 2>&1
) else (
  gh release upload "v%VER%" "release\Planer-Setup.exe" "release\Planer-Portable.exe" --clobber >> "%LOG%" 2>&1
)
echo EXIT=%ERRORLEVEL% >> "%LOG%"
type "%LOG%"
echo.
echo Страница релиза: https://github.com/Regenval0-0/planner/releases/latest
pause
