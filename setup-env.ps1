# Setup script to configure API URL
# Run: powershell -ExecutionPolicy Bypass -File setup-env.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HHD App - Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Find IP address
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike '127.*' -and 
    $_.IPAddress -notlike '169.254.*' -and
    $_.InterfaceAlias -notlike '*Loopback*'
} | Select-Object IPAddress, InterfaceAlias

if (-not $ipAddresses) {
    Write-Host "❌ Could not find IP address" -ForegroundColor Red
    Write-Host "Please run: ipconfig | findstr IPv4" -ForegroundColor Yellow
    exit 1
}

$primaryIP = ($ipAddresses | Select-Object -First 1).IPAddress
$apiUrl = "http://$primaryIP:5000/api"

Write-Host "✅ Found IP Address: $primaryIP" -ForegroundColor Green
Write-Host "✅ API URL: $apiUrl" -ForegroundColor Green
Write-Host ""

# Create .env file
$envContent = @"
# API Configuration
# This file sets the backend API URL for the Expo app
# Priority: This file > app.json > Platform defaults

EXPO_PUBLIC_API_URL=$apiUrl

# For different networks, update this IP address:
# - Find your IP: ipconfig | findstr IPv4
# - Update the IP above
# - Restart Expo: npm start
"@

try {
    $envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
    Write-Host "✅ Created .env file with API URL" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
    Write-Host "You can manually create .env with:" -ForegroundColor Yellow
    Write-Host "EXPO_PUBLIC_API_URL=$apiUrl" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run firewall fix: .\fix-firewall.ps1 (as Administrator)" -ForegroundColor White
Write-Host "2. Start backend: cd HHD-APP-Backend && npm run dev" -ForegroundColor White
Write-Host "3. Restart Expo: npm start -- --clear" -ForegroundColor White
Write-Host "4. Test connection in app" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
