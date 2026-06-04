@echo off
chcp 65001 >nul
echo ==========================================
echo  Installing Hiddify VPN for Telegram
echo ==========================================
echo.
echo Downloading... Please wait about 1 minute.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe' -OutFile \"$env:TEMP\HiddifySetup.exe\" -MaximumRedirection 5; Write-Host 'Download complete. Starting installer...'; Start-Process -FilePath \"$env:TEMP\HiddifySetup.exe\" -Wait"

echo.
echo ==========================================
echo  INSTALLATION COMPLETE
echo ==========================================
echo.
echo Next steps:
echo 1. Open Hiddify from Start Menu
echo 2. Click CONNECT (free servers are preloaded)
echo 3. Telegram will work immediately
echo.
pause
