# Connection Test Script for HHD App Backend
# Tests if the backend server is accessible

param(
    [string]$ServerIP,
    [int]$Port = 5000
)

function Get-LocalIPv4Address {
    try {
        $ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction Stop |
            Where-Object {
                $_.IPAddress -and
                $_.IPAddress -notlike '127.*' -and
                $_.IPAddress -notlike '169.254*'
            } |
            Sort-Object -Property InterfaceMetric |
            Select-Object -First 1 -ExpandProperty IPAddress

        if ($ip) { return $ip }
    } catch { }

    try {
        $ip = Get-WmiObject Win32_NetworkAdapterConfiguration -ErrorAction Stop |
            Where-Object { $_.IPAddress } |
            ForEach-Object { $_.IPAddress } |
            Where-Object {
                $_ -match '^\d+\.\d+\.\d+\.\d+$' -and
                $_ -notlike '127.*' -and
                $_ -notlike '169.254*'
            } |
            Select-Object -First 1

        if ($ip) { return $ip }
    } catch { }

    return $null
}

if (-not $ServerIP) {
    $detectedIP = Get-LocalIPv4Address
    if ($detectedIP) {
        $ServerIP = $detectedIP
    } else {
        Write-Host "❌ Could not auto-detect a local IPv4 address." -ForegroundColor Red
        Write-Host "   Please pass -ServerIP YOUR_IP (find via: ipconfig | findstr IPv4)" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HHD App - Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://${ServerIP}:${Port}"
$healthUrl = "${baseUrl}/health"
$apiUrl = "${baseUrl}/api"

Write-Host "Testing connection to:" -ForegroundColor Yellow
Write-Host "  Server IP: $ServerIP" -ForegroundColor White
Write-Host "  Port: $Port" -ForegroundColor White
Write-Host "  Health URL: $healthUrl" -ForegroundColor White
Write-Host "  API URL: $apiUrl" -ForegroundColor White
Write-Host ""

# Test 1: Check if port is open
Write-Host "Test 1: Checking if port $Port is open..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ReceiveTimeout = 3000
    $tcpClient.SendTimeout = 3000
    $result = $tcpClient.BeginConnect($ServerIP, $Port, $null, $null)
    $wait = $result.AsyncWaitHandle.WaitOne(3000, $false)
    
    if ($wait) {
        $tcpClient.EndConnect($result)
        Write-Host "✅ Port $Port is open and accessible" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "❌ Port $Port is not accessible (timeout)" -ForegroundColor Red
        Write-Host "   → Check if backend server is running" -ForegroundColor Yellow
        Write-Host "   → Check Windows Firewall settings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Port $Port is not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Check if backend server is running" -ForegroundColor Yellow
    Write-Host "   → Check Windows Firewall settings" -ForegroundColor Yellow
}
Write-Host ""

# Test 2: Check health endpoint
Write-Host "Test 2: Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health endpoint is responding" -ForegroundColor Green
        $json = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($json.status)" -ForegroundColor White
        Write-Host "   Database: $($json.database.connected)" -ForegroundColor White
    } else {
        Write-Host "❌ Health endpoint returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health endpoint is not accessible" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Make sure backend server is running" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Check API endpoint
Write-Host "Test 3: Testing API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "${apiUrl}/auth/send-otp" -Method POST -Body '{}' -ContentType "application/json" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ API endpoint is accessible" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400 -or $statusCode -eq 422) {
        Write-Host "✅ API endpoint is accessible (expected validation error)" -ForegroundColor Green
    } else {
        Write-Host "❌ API endpoint returned status: $statusCode" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed:" -ForegroundColor Green
Write-Host "  ✅ Your backend is accessible from this computer" -ForegroundColor White
Write-Host "  ✅ Check app.json has: apiUrl: `"$apiUrl`"" -ForegroundColor White
Write-Host ""
Write-Host "If tests failed:" -ForegroundColor Red
Write-Host "  1. Make sure backend is running: cd HHD-APP-Backend && npm run dev" -ForegroundColor Yellow
Write-Host "  2. Run fix-firewall.ps1 as Administrator" -ForegroundColor Yellow
Write-Host "  3. Verify both devices are on the same WiFi network" -ForegroundColor Yellow
Write-Host "  4. Check your IP address: ipconfig | findstr IPv4" -ForegroundColor Yellow
Write-Host ""
