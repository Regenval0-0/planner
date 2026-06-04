$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut("$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\VoiceInput.lnk")
$shortcut.TargetPath = "C:\Ren\tools\voice-to-text\silent_start.vbs"
$shortcut.WorkingDirectory = "C:\Ren\tools\voice-to-text"
$shortcut.Save()
Write-Host "[OK] Yarlik sozdan v Avtozagruzke"