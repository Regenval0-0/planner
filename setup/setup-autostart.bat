@echo off
echo Настройка автозапуска Планера...
echo.

set "startup=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "target=C:\Ren\start-site.bat"

echo Создание ярлыка в автозагрузке...
powershell -Command "
    \$WshShell = New-Object -comObject WScript.Shell
    \$Shortcut = \$WshShell.CreateShortcut('%startup%\Планер.lnk')
    \$Shortcut.TargetPath = '%target%'
    \$Shortcut.WorkingDirectory = 'C:\Ren'
    \$Shortcut.IconLocation = 'C:\Windows\System32\shell32.dll,14'
    \$Shortcut.Save()
"

echo.
echo ✅ Готово! Сайт будет автоматически запускаться при включении компьютера.
echo.
pause
