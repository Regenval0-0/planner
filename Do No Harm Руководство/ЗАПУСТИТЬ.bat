@echo off
chcp 65001 > /dev/null
echo.
echo ==========================================
echo   Do No Harm - Dosage Calculator
echo ==========================================
echo.
echo [i]  http://localhost:8081 ...
echo.

cd /d "%~dp0app\dist"

start http://localhost:8081

python -m http.server 8081 > /dev/null 2>&1
if %errorlevel% == 0 goto :end

python3 -m http.server 8081 > /dev/null 2>&1
if %errorlevel% == 0 goto :end

py -m http.server 8081 > /dev/null 2>&1
if %errorlevel% == 0 goto :end

echo [X]     Python
echo.
echo   Python: https://python.org
echo.
pause
exit /b 1

:end
pause
