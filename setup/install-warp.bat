@echo off
chcp 65001 >nul
echo ==========================================
echo  Installing Cloudflare WARP automatically
echo ==========================================
echo.

echo [1/3] Installing Cloudflare WARP via winget...
echo         (this will take 1-3 minutes)
winget install --id Cloudflare.Warp --exact --accept-source-agreements --accept-package-agreements --silent --disable-interactivity
echo         OK
echo.

echo [2/3] Adding to Windows auto-start...
set WARP="C:\Program Files\Cloudflare\Cloudflare WARP\Cloudflare WARP.exe"
set STARTUP="%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if exist %WARP% (
    powershell -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP:~1,-1%\Cloudflare WARP.lnk');$s.TargetPath='C:\Program Files\Cloudflare\Cloudflare WARP\Cloudflare WARP.exe';$s.WorkingDirectory='C:\Program Files\Cloudflare\Cloudflare WARP';$s.Save()"
    echo         OK — WARP will auto-start with Windows
) else (
    echo         Shortcut will be created after first manual launch
)
echo.

echo [3/3] Starting WARP now...
if exist %WARP% (
    start "" %WARP%
    echo         OK — WARP is starting
echo.
echo ==========================================
echo  DONE!
echo ==========================================
echo.
echo 1. Find the Cloudflare WARP icon in the system tray (near the clock)
echo 2. Click it once
echo 3. Toggle the switch to CONNECTED
echo 4. Done — Telegram works now!
echo.
echo Next time you turn on your PC, WARP will start automatically.
echo You will only need to toggle the switch to ON.
echo.
) else (
echo         WARP not found at expected path.
echo         Please restart your PC after installation,
echo         then find Cloudflare WARP in Start Menu and launch it.
echo.
)
pause
