# Quick script to find your IP address for API configuration
# Run: powershell -ExecutionPolicy Bypass -File get-ip.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Finding Your IP Address" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike '127.*' -and 
    $_.IPAddress -notlike '169.254.*' -and
    $_.InterfaceAlias -notlike '*Loopback*'
} | Select-Object IPAddress, InterfaceAlias

if ($ipAddresses) {
    Write-Host "Your IP Address(es):" -ForegroundColor Green
    Write-Host ""
    foreach ($ip in $ipAddresses) {
        Write-Host "  $($ip.IPAddress) - $($ip.InterfaceAlias)" -ForegroundColor White
        Write-Host "  API URL: http://$($ip.IPAddress):5000/api" -ForegroundColor Yellow
        Write-Host ""
    }
    
    $primaryIP = ($ipAddresses | Select-Object -First 1).IPAddress
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Primary IP: $primaryIP" -ForegroundColor Green
    Write-Host "API URL: http://$primaryIP:5000/api" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Update these files with this IP:" -ForegroundColor Yellow
    Write-Host "  1. .env: EXPO_PUBLIC_API_URL=http://$primaryIP:5000/api" -ForegroundColor White
    Write-Host "  2. app.json: \"apiUrl\": \"http://$primaryIP:5000/api\"" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Could not find IP address. Try running: ipconfig" -ForegroundColor Red
}
