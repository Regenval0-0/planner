@echo off
chcp 65001 >nul
echo ==========================================
echo  Psiphon — Free VPN for Telegram
echo ==========================================
echo.

set "PSIPHON_DIR=%USERPROFILE%\Psiphon"
set "PSIPHON_EXE=%PSIPHON_DIR%\psiphon3.exe"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo [1/3] Creating folder...
if not exist "%PSIPHON_DIR%" mkdir "%PSIPHON_DIR%"
echo         OK
echo.

echo [2/3] Downloading Psiphon... Wait ~30 sec.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://psiphon.ca/psiphon3.exe' -OutFile '%PSIPHON_EXE%'"
echo         OK
echo.

echo [3/3] Adding to Windows auto-start...
powershell -NoProfile -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%STARTUP%\Psiphon.lnk'); $s.TargetPath='%PSIPHON_EXE%'; $s.WorkingDirectory='%PSIPHON_DIR%'; $s.Save()"
echo         OK
echo.

echo ==========================================
echo  Starting Psiphon now...
echo ==========================================
start "" "%PSIPHON_EXE%"
echo.
echo Wait 15-30 seconds for the connection.
echo A small window will appear with spinning arrows.
echo When it connects, Telegram will work immediately.
echo.
echo From now on: Windows starts --^> Psiphon auto-connects --^> Telegram works.
echo.
pause
