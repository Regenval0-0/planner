# Auto cleanup script
$ErrorActionPreference = 'SilentlyContinue'
$totalFiles = 0
$totalBytes = 0

function Add-Deleted($size) {
    $script:totalFiles++
    $script:totalBytes += $size
}

Write-Host "[START] Auto cleanup" -ForegroundColor Cyan

# 1. TEMP
Write-Host "[1] Cleaning TEMP..." -ForegroundColor Yellow
$temp = $env:TEMP
if (Test-Path $temp) {
    Get-ChildItem $temp -Recurse -Force | ForEach-Object {
        $size = if ($_.PSIsContainer) { 0 } else { $_.Length }
        try {
            Remove-Item $_.FullName -Recurse -Force
            Add-Deleted $size
        } catch {}
    }
}

# 2. pip cache
Write-Host "[2] Cleaning pip cache..." -ForegroundColor Yellow
python -m pip cache purge | Out-Null

# 3. npm cache
Write-Host "[3] Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force | Out-Null

# 4. Downloads installers older than 7 days
Write-Host "[4] Cleaning old installers from Downloads..." -ForegroundColor Yellow
$dl = [Environment]::GetFolderPath('UserProfile') + '\Downloads'
if (Test-Path $dl) {
    Get-ChildItem $dl -Include '*.exe','*.msi','*.msix' -Recurse |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
    ForEach-Object {
        try {
            $size = $_.Length
            Remove-Item $_.FullName -Force
            Add-Deleted $size
        } catch {}
    }
}

# 5. .tmp .log .bak older than 7 days in Downloads, Desktop, Documents
Write-Host "[5] Cleaning .tmp/.log/.bak older than 7 days..." -ForegroundColor Yellow
$folders = @(
    [Environment]::GetFolderPath('UserProfile') + '\Downloads',
    [Environment]::GetFolderPath('Desktop'),
    [Environment]::GetFolderPath('MyDocuments')
)
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Get-ChildItem $folder -Include '*.tmp','*.log','*.bak' -Recurse |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
        ForEach-Object {
            try {
                $size = $_.Length
                Remove-Item $_.FullName -Force
                Add-Deleted $size
            } catch {}
        }
    }
}

# 6a. Empty folders
Write-Host "[6a] Removing empty folders..." -ForegroundColor Yellow
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Get-ChildItem $folder -Recurse -Directory |
        Where-Object { ($_.GetFiles().Count + $_.GetDirectories().Count) -eq 0 } |
        ForEach-Object {
            try {
                Remove-Item $_.FullName -Force
                $script:totalFiles++
            } catch {}
        }
    }
}

# 6b. Duplicate files like file (1).exe
Write-Host "[6b] Removing duplicate files (1)..." -ForegroundColor Yellow
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Get-ChildItem $folder -Recurse -File |
        Where-Object { $_.Name -match '\s\(\d+\)\.' } |
        ForEach-Object {
            try {
                $size = $_.Length
                Remove-Item $_.FullName -Force
                Add-Deleted $size
            } catch {}
        }
    }
}

# 7. .claude trash sessions
Write-Host "[7] Cleaning .claude trash sessions..." -ForegroundColor Yellow
$claudeDir = $env:USERPROFILE + '\.claude\projects'
if (Test-Path $claudeDir) {
    Get-ChildItem $claudeDir -Directory |
    Where-Object { $_.Name -match 'C--WINDOWS-system32|tmp|temp|trash' -and (Get-ChildItem $_.FullName -Recurse -File).Count -eq 0 } |
    ForEach-Object {
        try {
            Remove-Item $_.FullName -Recurse -Force
            $script:totalFiles++
        } catch {}
    }
}

# Summary
Write-Host "`n[DONE] Cleanup finished" -ForegroundColor Green
Write-Host "Deleted items: $totalFiles" -ForegroundColor White
Write-Host "Freed space: $([math]::Round($totalBytes/1MB, 2)) MB ($([math]::Round($totalBytes/1GB, 2)) GB)" -ForegroundColor White
