@echo off
echo ==========================================
echo  Finalizing setup...
echo ==========================================
echo.

set "OBLIVION=C:\Users\dasha\AppData\Local\Programs\Oblivion Desktop\Oblivion Desktop.exe"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo [1/2] Adding Oblivion to auto-start...
if exist "%OBLIVION%" (
    powershell -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP%\Oblivion.lnk'); $s.TargetPath='%OBLIVION%'; $s.WorkingDirectory='C:\Users\dasha\AppData\Local\Programs\Oblivion Desktop'; $s.Save()"
    echo         OK
echo.

echo [2/2] Starting apps now...
start "" "%OBLIVION%"
echo         Oblivion Desktop started
timeout /t 3 >nul

echo         Telegram Desktop started
start "" "C:\Users\dasha\AppData\Roaming\Telegram Desktop\Telegram.exe"

echo.
echo ==========================================
echo  READY!
echo ==========================================
echo.
echo 1. Look for the Oblivion icon in the system tray (near the clock)
echo 2. Click it once and toggle the switch to CONNECTED
echo 3. Telegram is already open — it will work immediately!
echo.
echo From now on, both apps start automatically when Windows boots.
echo You only need to toggle Oblivion ON once after each restart.
echo.
pause
