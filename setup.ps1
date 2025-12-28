# Financial AI Platform - Quick Start Script (Windows PowerShell)

Write-Host "=== Financial AI Platform Setup ===" -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Python and Node.js found" -ForegroundColor Green

# Setup Backend
Write-Host "`n=== Setting up Backend ===" -ForegroundColor Cyan
Push-Location backend
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Pop-Location

# Setup Frontend
Write-Host "`n=== Setting up Frontend ===" -ForegroundColor Cyan
Push-Location frontend
Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Pop-Location

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Configure database in backend/.env"
Write-Host "2. Start backend: cd backend && uvicorn main:app --reload"
Write-Host "3. Start frontend: cd frontend && npm run dev"
Write-Host "4. Visit http://localhost:3000/login"
