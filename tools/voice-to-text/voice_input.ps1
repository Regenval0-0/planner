# Альтернативный вариант через PowerShell (без Python)
# Работает только если установлен русский языковой пакет распознавания речи Windows

Add-Type -AssemblyName System.Speech

$engine = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$engine.SetInputToDefaultAudioDevice()

# Создаём грамматику для диктовки (неограниченный словарь)
$grammar = New-Object System.Speech.Recognition.DictationGrammar
$engine.LoadGrammar($grammar)

Write-Host "🎤 Говорите сейчас... (жду речь)" -ForegroundColor Green

# Распознаём одну фразу
$result = $engine.Recognize()

if ($result) {
    $text = $result.Text
    Write-Host "✅ Распознано: $text" -ForegroundColor Cyan
    Set-Clipboard -Value $text
    Write-Host "📋 Скопировано в буфер обмена!" -ForegroundColor Yellow
} else {
    Write-Host "❌ Речь не распознана" -ForegroundColor Red
}

$engine.Dispose()

Write-Host "`nНажмите Enter чтобы выйти..."
Read-Host
