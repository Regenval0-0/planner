$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Planner.lnk")
$Shortcut.TargetPath = "C:\Ren\planner-app\desktop\dist-installer-v2\win-unpacked\Planner.exe"
$Shortcut.WorkingDirectory = "C:\Ren\planner-app\desktop\dist-installer-v2\win-unpacked"
$Shortcut.IconLocation = "C:\Ren\planner-app\desktop\dist-installer-v2\win-unpacked\Planner.exe,0"
$Shortcut.Description = "Planner App"
$Shortcut.Save()
Write-Host "Shortcut created at $env:USERPROFILE\Desktop\Planner.lnk"
