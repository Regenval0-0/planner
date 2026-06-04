@echo off
chcp 1251 > nul
echo [INFO] Zapusk golosovogo vvoda...
echo.

:: Proveryaem, zapuschen li uzhe
tasklist /FI "WINDOWTITLE eq Golosovoy vvod" 2> nul | findstr /I "python.exe" > nul
if %errorlevel% == 0 (
    echo [WARN] Golosovoy vvod uzhe zapuschen!
    pause
    exit /b 1
)

:: Полный путь к pythonw.exe
set PYTHONW="C:\Users\dasha\AppData\Local\Programs\Python\Python312\pythonw.exe"
if not exist %PYTHONW% (
    set PYTHONW=pythonw
)

:: Zapuskaem Python-skript
start "Golosovoy vvod" /min %PYTHONW% "%~dp0main_background.py"

echo [OK] Golosovoy vvod zapuschen v fone.
echo      Nazhmi Ctrl+' v lyubom meste dlya zapisi.
     Tekst vstavit' v pole vvoda, Enter nazhimay sama.
     Dlya ostanovki naydi okno "Golosovoy vvod" i zakroy ego.
echo.
timeout /t 3 > nul
