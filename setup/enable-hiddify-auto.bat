@echo off
chcp 65001 >nul
echo ==========================================
echo  Enabling Hiddify Auto-Start
echo ==========================================
echo.

set HIDDIFY="C:\Program Files\Hiddify\Hiddify.exe"
set STARTUP="%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo [1/3] Checking installation...
if not exist %HIDDIFY% (
    echo ERROR: Hiddify not found. Install it first.
    pause
    exit /b 1
)
echo         OK
echo.

echo [2/3] Adding to Windows Startup...
powershell -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP:~1,-1%\Hiddify.lnk');$s.TargetPath='C:\Program Files\Hiddify\Hiddify.exe';$s.WorkingDirectory='C:\Program Files\Hiddify';$s.Save()"
echo         OK — Hiddify will start automatically with Windows
echo.

echo [3/3] Launching Hiddify now...
start "" %HIDDIFY%
echo         OK — Hiddify is starting
echo.

echo ==========================================
echo  DONE! Now do this ONCE inside Hiddify:
echo ==========================================
echo.
echo 1. Wait for Hiddify window to open
echo 2. Click gear icon (Settings) bottom-left
echo 3. Turn ON:  [Auto Connect]
echo 4. Turn ON:  [Launch at Startup] (if exists)
echo 5. Close settings
echo.
echo From now on: PC turns on ^→ Hiddify starts ^→ VPN connects automatically
echo.
pause
