# PowerShell script to build APK for RuStore
# Usage: .\build-apk.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== Building Planner APK for RuStore ===" -ForegroundColor Cyan

# Step 1: Build web assets
Write-Host "`n[1/4] Building web assets..." -ForegroundColor Yellow
Set-Location $PSScriptRoot\..
npx vite build --mode production
if ($LASTEXITCODE -ne 0) { throw "Vite build failed" }

# Step 2: Sync Capacitor
Write-Host "`n[2/4] Syncing Capacitor with Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed" }

# Step 3: Build APK with Gradle
Write-Host "`n[3/4] Building APK with Gradle..." -ForegroundColor Yellow
Set-Location $PSScriptRoot\..\android
.\gradlew assembleRelease
if ($LASTEXITCODE -ne 0) { throw "Gradle build failed" }

# Step 4: Copy APK to release folder
Write-Host "`n[4/4] Copying APK to release folder..." -ForegroundColor Yellow
$apkPath = "$PSScriptRoot\..\android\app\build\outputs\apk\release\app-release.apk"
$releaseDir = "$PSScriptRoot\..\release"
if (!(Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir }
Copy-Item $apkPath "$releaseDir\planner-rustore.apk" -Force

Write-Host "`n=== SUCCESS ===" -ForegroundColor Green
Write-Host "APK saved to: $releaseDir\planner-rustore.apk"
Write-Host "`nNext steps for RuStore:"
Write-Host "1. Go to https://console.rustore.ru"
Write-Host "2. Create app with package name: com.planner.app"
Write-Host "3. Upload the APK"
Write-Host "4. Fill in app details (name, description, screenshots)"
Write-Host "5. Submit for moderation"
