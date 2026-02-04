# PowerShell script to start the backend server
# Usage: .\start-backend.ps1

Write-Host "🚀 Starting HHD App Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "HHD-APP-Backend")) {
    Write-Host "❌ Error: HHD-APP-Backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory
Set-Location "HHD-APP-Backend"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env from env.example.txt..." -ForegroundColor Yellow
    
    if (Test-Path "env.example.txt") {
        Copy-Item "env.example.txt" ".env"
        Write-Host "✅ Created .env file. Please update it with your configuration." -ForegroundColor Green
    } else {
        Write-Host "❌ Error: env.example.txt not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error: Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Start the server
Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
