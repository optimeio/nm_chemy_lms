#!/usr/bin/env pwsh

# Admin Login Fix - Setup and Verification Script
# Run this to automatically set up and test the admin login

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Admin Login Fix - Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Color codes
$SUCCESS = "Green"
$ERROR = "Red"
$WARNING = "Yellow"
$INFO = "Cyan"

function Write-Status {
    param([string]$Message, [string]$Status = "INFO")
    
    $Color = switch($Status) {
        "SUCCESS" { $SUCCESS }
        "ERROR" { $ERROR }
        "WARNING" { $WARNING }
        default { $INFO }
    }
    
    Write-Host "[$Status]" -ForegroundColor $Color -NoNewline
    Write-Host " $Message"
}

# Step 1: Check Node.js
Write-Status "Checking Node.js..." "INFO"
try {
    $nodeVersion = (node --version)
    Write-Status "Node.js found: $nodeVersion" "SUCCESS"
} catch {
    Write-Status "Node.js not found! Install from https://nodejs.org/" "ERROR"
    exit 1
}

# Step 2: Check MongoDB Connection
Write-Status "Verifying MongoDB connection..." "INFO"
if (Test-Path "backend/.env") {
    $envContent = Get-Content "backend/.env"
    if ($envContent -match "MONGO_URI") {
        Write-Status "MongoDB URI configured" "SUCCESS"
    }
} else {
    Write-Status "backend/.env not found!" "ERROR"
    exit 1
}

# Step 3: Check JWT_SECRET
Write-Status "Checking JWT_SECRET configuration..." "INFO"
if ($envContent -match "JWT_SECRET") {
    Write-Status "JWT_SECRET is configured" "SUCCESS"
} else {
    Write-Status "WARNING: JWT_SECRET not found in .env" "WARNING"
}

# Step 4: Check Port Configuration
Write-Status "Verifying port configuration..." "INFO"
if ($envContent -match "PORT=5000") {
    Write-Status "Backend PORT set to 5000" "SUCCESS"
} else {
    Write-Status "WARNING: Backend PORT might not be 5000" "WARNING"
}

# Step 5: Check Frontend Configuration
Write-Status "Checking frontend configuration..." "INFO"
$appContent = Get-Content "frontend/src/App.jsx" -ErrorAction SilentlyContinue
if ($appContent -match "localhost:5000") {
    Write-Status "Frontend configured to use localhost:5000" "SUCCESS"
} else {
    Write-Status "WARNING: Frontend might not be using localhost:5000" "WARNING"
}

# Step 6: Install Dependencies (if needed)
Write-Status "Checking dependencies..." "INFO"
if (!(Test-Path "backend/node_modules")) {
    Write-Status "Installing backend dependencies..." "INFO"
    Push-Location "backend"
    npm install --silent
    Pop-Location
    Write-Status "Backend dependencies installed" "SUCCESS"
} else {
    Write-Status "Backend dependencies already installed" "SUCCESS"
}

if (!(Test-Path "frontend/node_modules")) {
    Write-Status "Installing frontend dependencies..." "INFO"
    Push-Location "frontend"
    npm install --silent
    Pop-Location
    Write-Status "Frontend dependencies installed" "SUCCESS"
} else {
    Write-Status "Frontend dependencies already installed" "SUCCESS"
}

# Step 7: Create/Update Admin User
Write-Status "Setting up admin user..." "INFO"
Push-Location "backend"
try {
    $output = node scripts/createAdmin.js 2>&1
    Write-Status "Admin user created/updated" "SUCCESS"
    Write-Host ""
    Write-Host "Admin Credentials:" -ForegroundColor Cyan
    Write-Host "  Email: theoptime.io@gmail.com"
    Write-Host "  Password: TSMGPVT@2026"
    Write-Host ""
} catch {
    Write-Status "Error creating admin user: $_" "ERROR"
    Write-Status "Try running manually: cd backend && node scripts/createAdmin.js" "INFO"
}
Pop-Location

# Step 8: Provide Setup Instructions
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Start Backend (Terminal 1):" -ForegroundColor Yellow
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    node server.js" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  Start Frontend (Terminal 2):" -ForegroundColor Yellow
Write-Host "    cd frontend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  Open Browser:" -ForegroundColor Yellow
Write-Host "    http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  Login with:" -ForegroundColor Yellow
Write-Host "    Email: theoptime.io@gmail.com" -ForegroundColor Gray
Write-Host "    Password: TSMGPVT@2026" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  Watch Backend Console for:" -ForegroundColor Yellow
Write-Host "    [AUTH] Login attempt with: ..." -ForegroundColor Gray
Write-Host "    [AUTH] Login successful for: ..." -ForegroundColor Gray
Write-Host ""

Write-Host "🔍 Troubleshooting:" -ForegroundColor Cyan
Write-Host ""
Write-Host "• Can't connect? Make sure backend is running on port 5000" -ForegroundColor Gray
Write-Host "• Wrong port error? Check backend/.env has PORT=5000" -ForegroundColor Gray
Write-Host "• Invalid credentials? Run: cd backend && node scripts/createAdmin.js" -ForegroundColor Gray
Write-Host "• No debug logs? Backend console must start with [AUTH] prefix" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host ""
Write-Host "• ADMIN_LOGIN_FIX_COMPLETE.md - Complete solution" -ForegroundColor Gray
Write-Host "• DEBUG_ADMIN_LOGIN.md - Detailed debugging guide" -ForegroundColor Gray
Write-Host "• BEFORE_AFTER_COMPARISON.md - Visual comparison" -ForegroundColor Gray
Write-Host "• AUTHENTICATION_FLOW.md - Architecture and flow" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Ready to test! Start the backend first." -ForegroundColor Green
