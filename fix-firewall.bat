@echo off
REM Windows Firewall Configuration for HHD App Backend
REM This script allows Node.js and port 5000 through Windows Firewall
REM MUST BE RUN AS ADMINISTRATOR

echo ========================================
echo HHD App - Firewall Configuration
echo ========================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script requires Administrator privileges!
    echo.
    echo Please right-click this file and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo [OK] Running as Administrator
echo.

REM Find Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Node.js not found in PATH!
    echo Please install Node.js first.
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%i in ('where node') do set NODE_PATH=%%i
echo [OK] Found Node.js at: %NODE_PATH%
echo.

REM Remove existing rules
echo Cleaning up existing rules...
netsh advfirewall firewall delete rule name="HHD App Backend - Node.js" >nul 2>&1
netsh advfirewall firewall delete rule name="HHD App Backend - Port 5000" >nul 2>&1
echo.

REM Add firewall rule for Node.js
echo Adding firewall rule for Node.js...
netsh advfirewall firewall add rule name="HHD App Backend - Node.js" dir=in action=allow program="%NODE_PATH%" enable=yes profile=private,public
if %errorLevel% equ 0 (
    echo [OK] Node.js firewall rule added successfully
) else (
    echo [ERROR] Failed to add Node.js firewall rule
)
echo.

REM Add firewall rule for port 5000
echo Adding firewall rule for port 5000 (TCP)...
netsh advfirewall firewall add rule name="HHD App Backend - Port 5000" dir=in action=allow protocol=TCP localport=5000 enable=yes profile=private,public
if %errorLevel% equ 0 (
    echo [OK] Port 5000 firewall rule added successfully
) else (
    echo [ERROR] Failed to add port 5000 firewall rule
)
echo.

echo ========================================
echo Firewall Configuration Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the backend server: cd HHD-APP-Backend ^&^& npm run dev
echo 2. Test connection from your device
echo.
echo Your server should be accessible at:
echo   http://YOUR_IP:5000/api
echo   (Find YOUR_IP via: ipconfig ^| findstr IPv4)
echo.
pause
