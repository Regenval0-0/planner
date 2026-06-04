#Requires -RunAsAdministrator
param([switch]$Remove)

$taskName = "VoiceInputAutoStart"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath   = Join-Path $scriptDir "silent_start.vbs"
$startupDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$oldShortcut = Join-Path $startupDir "VoiceInput.lnk"

# Удаляем старый ярлык из Автозагрузки, если есть
if (Test-Path $oldShortcut) {
    Remove-Item $oldShortcut -Force
    Write-Host "[OK] Старый ярлык из Автозагрузки удалён." -ForegroundColor Green
}

# Удаление режим
if ($Remove) {
    $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($task) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "[OK] Автозапуск голосового ввода УДАЛЁН." -ForegroundColor Green
    } else {
        Write-Host "[INFO] Задача в планировщике не найдена." -ForegroundColor Yellow
    }
    Read-Host "Нажми Enter для выхода"
    exit
}

# Создание задачи
$action = New-ScheduledTaskAction -Execute $vbsPath -WorkingDirectory $scriptDir
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -RunLevel Highest -LogonType Interactive
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Удаляем старую задачу, если есть
$oldTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($oldTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "[OK] Старая задача удалена." -ForegroundColor Green
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "[OK] Автозапуск голосового ввода НАСТРОЕН!" -ForegroundColor Green
Write-Host "     Задача: $taskName" -ForegroundColor Cyan
Write-Host "     Запуск: при входе в Windows с правами администратора (без UAC)." -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Сейчас попробуем запустить для проверки..." -ForegroundColor Yellow

Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 3

$task = Get-ScheduledTask -TaskName $taskName
$info = Get-ScheduledTaskInfo -TaskName $taskName
if ($info.LastTaskResult -eq 0) {
    Write-Host "[OK] Задача запущена успешно!" -ForegroundColor Green
} else {
    Write-Host "[!] Возможна проблема (код: $($info.LastTaskResult)). Проверь лог voice_log.txt" -ForegroundColor Red
}

Read-Host "Нажми Enter для выхода"
