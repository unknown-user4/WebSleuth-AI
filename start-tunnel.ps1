# WebSleuth AI — IBM LinuxONE SSH Tunnel Starter
# Code Apex v5 | Double-click to run before demo

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WebSleuth AI - IBM LinuxONE Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing tunnel on port 8001
$existing = Get-Process -Name "ssh" -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[INFO] Killing existing SSH processes..." -ForegroundColor Yellow
    Stop-Process -Name "ssh" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Locate the PEM key
$keyPaths = @(
    "C:\Users\theja\.ssh\codeapex.pem",
    "$PSScriptRoot\codeapex.pem",
    "C:\Users\theja\Desktop\codeapex.pem"
)

$keyFile = $null
foreach ($path in $keyPaths) {
    if (Test-Path $path) {
        $keyFile = $path
        break
    }
}

if (-not $keyFile) {
    Write-Host "[ERROR] codeapex.pem not found!" -ForegroundColor Red
    Write-Host "        Place codeapex.pem in C:\Users\theja\.ssh\" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK]   PEM key found: $keyFile" -ForegroundColor Green
Write-Host "[INFO] Starting SSH tunnel: localhost:8001 -> IBM LinuxONE:8000" -ForegroundColor Yellow
Write-Host ""

# Start the tunnel as a hidden background process
Start-Process -FilePath "ssh" `
    -ArgumentList "-i `"$keyFile`" -N -L 8001:127.0.0.1:8000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ConnectTimeout=10 linux1@148.100.98.166" `
    -WindowStyle Hidden

Start-Sleep -Seconds 3

# Verify tunnel is working
Write-Host "[INFO] Verifying connection to IBM LinuxONE..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 5 -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  TUNNEL ACTIVE - SERVER IS ONLINE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Status       : $($json.status)" -ForegroundColor White
    Write-Host "  Model Version: $($json.model_version)" -ForegroundColor White
    Write-Host "  URLs Checked : $($json.checks)" -ForegroundColor White
    Write-Host "  Threats Found: $($json.threats)" -ForegroundColor White
    Write-Host ""
    Write-Host "  API URL: http://localhost:8001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[READY] Load the extension in Chrome and start demo!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[WARN] Tunnel started but server health check failed." -ForegroundColor Yellow
    Write-Host "       The server may still be starting up." -ForegroundColor Yellow
    Write-Host "       Try: http://localhost:8001/health in browser" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "       If it keeps failing, SSH in and restart server:" -ForegroundColor Yellow
    Write-Host "       ssh -i `"$keyFile`" linux1@148.100.98.166" -ForegroundColor White
    Write-Host "       cd ~/trustshield && source venv/bin/activate" -ForegroundColor White
    Write-Host "       nohup python main.py > server.log 2>&1 &" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to close this window (tunnel stays running)"
