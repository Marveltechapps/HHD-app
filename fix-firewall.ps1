# Windows Firewall Configuration Script for HHD App Backend
# This script allows Node.js and port 5000 through Windows Firewall

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HHD App - Firewall Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges!" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Find Node.js executable
$nodePath = Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source

if (-not $nodePath) {
    Write-Host "❌ Node.js not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Node.js first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found Node.js at: $nodePath" -ForegroundColor Green
Write-Host ""

# Remove existing firewall rules (if any)
Write-Host "Cleaning up existing rules..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="HHD App Backend - Node.js" 2>$null
netsh advfirewall firewall delete rule name="HHD App Backend - Port 5000" 2>$null
Write-Host ""

# Add firewall rule for Node.js executable
Write-Host "Adding firewall rule for Node.js..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="HHD App Backend - Node.js" dir=in action=allow program="$nodePath" enable=yes profile=private,public

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js firewall rule added successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add Node.js firewall rule" -ForegroundColor Red
}

Write-Host ""

# Add firewall rule for port 5000 (TCP)
Write-Host "Adding firewall rule for port 5000 (TCP)..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="HHD App Backend - Port 5000" dir=in action=allow protocol=TCP localport=5000 enable=yes profile=private,public

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Port 5000 firewall rule added successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to add port 5000 firewall rule" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firewall Configuration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend server: cd HHD-APP-Backend && npm run dev" -ForegroundColor White
Write-Host "2. Test connection from your device" -ForegroundColor White
Write-Host ""
Write-Host "Your server should be accessible at:" -ForegroundColor Yellow
Write-Host "  http://YOUR_IP:5000/api" -ForegroundColor White
Write-Host "  (Find YOUR_IP via: ipconfig | findstr IPv4)" -ForegroundColor White
Write-Host ""
