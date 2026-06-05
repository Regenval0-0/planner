# Автоматический мониторинг сайта
# Запускает backend, туннель serveo.net, и следит за их работой

$backendDir = "C:\Ren\backend\planner"
$frontendDir = "C:\Ren\frontend\planner"
$gitDir = "C:\Ren"
$logFile = "C:\Ren\site-monitor.log"

function Write-Log($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp $msg" | Tee-Object -FilePath $logFile -Append
}

function Start-Backend {
    Write-Log "Starting backend..."
    $proc = Start-Process -FilePath "npx" -ArgumentList "tsx", "src/server.ts" -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 5
    try {
        $res = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
        if ($res.ok) {
            Write-Log "Backend started successfully (PID: $($proc.Id))"
            return $proc
        }
    } catch {
        Write-Log "Backend health check failed: $_"
    }
    return $null
}

function Start-Tunnel {
    Write-Log "Starting serveo tunnel..."
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "ssh"
    $psi.Arguments = "-o StrictHostKeyChecking=no -o UserKnownHostsFile=nul -o ServerAliveInterval=60 -R 80:localhost:3001 serveo.net"
    $psi.WorkingDirectory = $gitDir
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false
    $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden

    $proc = [System.Diagnostics.Process]::Start($psi)
    Start-Sleep -Seconds 10

    # Read output to find URL
    $output = $proc.StandardOutput.ReadToEnd()
    $urlMatch = [regex]::Match($output, 'https://[a-z0-9-]+\.serveousercontent\.com')
    if ($urlMatch.Success) {
        $url = $urlMatch.Value
        Write-Log "Tunnel started: $url"
        return @{ Process = $proc; URL = $url }
    }

    Write-Log "Failed to get tunnel URL"
    return $null
}

function Update-FrontendURL($newURL) {
    Write-Log "Updating frontend API URL to: $newURL"
    $clientFile = "$frontendDir\src\api\client.ts"
    $content = Get-Content $clientFile -Raw

    # Replace the serveo URL
    $newContent = $content -replace 'https://[a-z0-9-]+-188-162-14-149\.serveousercontent\.com/api', "$newURL/api"

    if ($newContent -ne $content) {
        Set-Content $clientFile $newContent -NoNewline

        # Rebuild
        Set-Location $frontendDir
        npm run build 2>&1 | Out-Null

        # Push to GitHub
        Set-Location $gitDir
        git add . 2>&1 | Out-Null
        git commit -m "Auto-update backend URL" 2>&1 | Out-Null
        git push origin main 2>&1 | Out-Null

        Write-Log "Frontend updated and pushed"
        return $true
    }
    return $false
}

function Test-Tunnel($url) {
    try {
        $res = Invoke-RestMethod -Uri "$url/health" -TimeoutSec 10
        return $res.ok -eq $true
    } catch {
        return $false
    }
}

# Main monitoring loop
Write-Log "=== Site Monitor Started ==="

$backendProc = $null
$tunnelInfo = $null
$tunnelURL = $null

while ($true) {
    # Check backend
    if ($backendProc -eq $null -or $backendProc.HasExited) {
        Write-Log "Backend not running, restarting..."
        $backendProc = Start-Backend
    }

    # Check tunnel
    if ($tunnelInfo -eq $null -or $tunnelInfo.Process.HasExited -or -not (Test-Tunnel $tunnelURL)) {
        if ($tunnelInfo -ne $null -and $tunnelInfo.Process.HasExited) {
            Write-Log "Tunnel died, restarting..."
        } elseif ($tunnelURL -ne $null -and -not (Test-Tunnel $tunnelURL)) {
            Write-Log "Tunnel not responding, restarting..."
        }

        $tunnelInfo = Start-Tunnel
        if ($tunnelInfo -ne $null) {
            $newURL = $tunnelInfo.URL
            if ($newURL -ne $tunnelURL) {
                Update-FrontendURL $newURL
                $tunnelURL = $newURL
            }
        }
    }

    Start-Sleep -Seconds 30
}
