# Quick Fix Script for Server Connection Issues
# This script automates the most common fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HHD App - Quick Server Connection Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get current IP
Write-Host "Step 1: Getting your IP address..." -ForegroundColor Yellow
$ipOutput = ipconfig | findstr IPv4
$ipAddress = ($ipOutput -split ':')[1].Trim()
Write-Host "✅ Your IP address: $ipAddress" -ForegroundColor Green
Write-Host ""

# Step 2: Check if app.json needs update
Write-Host "Step 2: Checking app.json configuration..." -ForegroundColor Yellow
$appJsonPath = "app.json"
if (Test-Path $appJsonPath) {
    $appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
    $currentApiUrl = $appJson.expo.extra.apiUrl
    
    $expectedApiUrl = "http://${ipAddress}:5000/api"
    
    if ($currentApiUrl -ne $expectedApiUrl) {
        Write-Host "⚠️  app.json has different IP: $currentApiUrl" -ForegroundColor Yellow
        Write-Host "   Expected: $expectedApiUrl" -ForegroundColor Yellow
        Write-Host ""
        $update = Read-Host "Update app.json? (Y/N)"
        if ($update -eq "Y" -or $update -eq "y") {
            $appJson.expo.extra.apiUrl = $expectedApiUrl
            $appJson | ConvertTo-Json -Depth 10 | Set-Content $appJsonPath
            Write-Host "✅ app.json updated" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ app.json is correctly configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ app.json not found!" -ForegroundColor Red
}
Write-Host ""

# Step 3: Check if backend is running
Write-Host "Step 3: Checking if backend server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend server:" -ForegroundColor Yellow
    Write-Host "  cd HHD-APP-Backend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
}
Write-Host ""

# Step 4: Check firewall
Write-Host "Step 4: Checking Windows Firewall..." -ForegroundColor Yellow
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  Cannot check firewall (requires Administrator)" -ForegroundColor Yellow
    Write-Host "   Run fix-firewall.ps1 as Administrator" -ForegroundColor Yellow
} else {
    $firewallRule = netsh advfirewall firewall show rule name="HHD App Backend - Port 5000" 2>$null
    if ($firewallRule) {
        Write-Host "✅ Firewall rule exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Firewall rule not found" -ForegroundColor Red
        Write-Host "   Run: .\fix-firewall.ps1" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: Test connection
Write-Host "Step 5: Testing connection..." -ForegroundColor Yellow
Write-Host "   Testing: http://${ipAddress}:5000/health" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "http://${ipAddress}:5000/health" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Connection test PASSED" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "   Server Status: $($json.status)" -ForegroundColor White
    Write-Host "   Database: $($json.database.connected)" -ForegroundColor White
} catch {
    Write-Host "❌ Connection test FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "   1. Start backend: cd HHD-APP-Backend && npm run dev" -ForegroundColor White
    Write-Host "   2. Fix firewall: .\fix-firewall.ps1 (as Administrator)" -ForegroundColor White
    Write-Host "   3. Check both devices on same WiFi" -ForegroundColor White
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your configuration:" -ForegroundColor Yellow
Write-Host "  IP Address: $ipAddress" -ForegroundColor White
Write-Host "  API URL: http://${ipAddress}:5000/api" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. If backend not running: cd HHD-APP-Backend && npm run dev" -ForegroundColor White
Write-Host "  2. If firewall issue: .\fix-firewall.ps1 (as Administrator)" -ForegroundColor White
Write-Host "  3. Test from phone: http://${ipAddress}:5000/health" -ForegroundColor White
Write-Host "  4. Reload your app" -ForegroundColor White
Write-Host ""
