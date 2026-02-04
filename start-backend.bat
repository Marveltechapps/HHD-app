@echo off
REM Batch script to start the backend server
REM Usage: start-backend.bat

echo.
echo 🚀 Starting HHD App Backend Server...
echo.

REM Check if HHD-APP-Backend directory exists
if not exist "HHD-APP-Backend" (
    echo ❌ Error: HHD-APP-Backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd HHD-APP-Backend

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Warning: .env file not found!
    echo Creating .env from env.example.txt...
    
    if exist "env.example.txt" (
        copy "env.example.txt" ".env" >nul
        echo ✅ Created .env file. Please update it with your configuration.
    ) else (
        echo ❌ Error: env.example.txt not found!
        pause
        exit /b 1
    )
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Error: Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo 🚀 Starting backend server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
