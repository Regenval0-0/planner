@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb runas"
    exit /b
)

if /I "%~1"=="remove" (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_autostart.ps1" -Remove
) else (
    powershell -ExecutionPolicy Bypass -File "%~dp0setup_autostart.ps1"
)
