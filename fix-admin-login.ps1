# Admin Login Fix and Debug Script for Windows PowerShell
# Run this to verify backend connection and create admin account

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CHEMY LMS - Admin Login Debug and Fix" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Backend Server
Write-Host "Step 1: Checking Backend Server..." -ForegroundColor Yellow
Write-Host "Testing connection to http://localhost:5000/health" -ForegroundColor Gray

try {
    $health = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5 -ErrorAction Stop
    if ($health.StatusCode -eq 200) {
        Write-Host "[OK] Backend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Backend is NOT running" -ForegroundColor Red
    Write-Host "  Fix: Run npm run dev in the backend folder first" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""

# Step 2: Create/Reset Admin Account
Write-Host "Step 2: Creating/Resetting Admin Account..." -ForegroundColor Yellow
Write-Host "Admin Email: theoptime.io@gmail.com" -ForegroundColor Gray
Write-Host "Admin Password: TSMGPVT@2026" -ForegroundColor Gray
Write-Host ""

Push-Location backend -ErrorAction Stop
Write-Host "Running: node scripts/createAdmin.js" -ForegroundColor Gray
Write-Host ""

& node scripts/createAdmin.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Admin account created/updated successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to create admin account" -ForegroundColor Red
    Write-Host "  Troubleshooting: Check if MONGO_URI is correct in backend/.env" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

Write-Host ""

# Step 3: Test Login API
Write-Host "Step 3: Testing Login API..." -ForegroundColor Yellow
Write-Host "Sending login request..." -ForegroundColor Gray
Write-Host ""

$loginBody = @{
    email = "theoptime.io@gmail.com"
    password = "TSMGPVT@2026"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -TimeoutSec 5 -ErrorAction Stop

    $responseData = $loginResponse.Content | ConvertFrom-Json
    
    if ($responseData.token) {
        Write-Host "[OK] Login API is working" -ForegroundColor Green
        Write-Host "  Token received successfully" -ForegroundColor Gray
        Write-Host "  Role: $($responseData.role)" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] Login API returned error" -ForegroundColor Red
        Write-Host "  Response: $($loginResponse.Content)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Login API failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "SUCCESS! Login should now work." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    theoptime.io@gmail.com" -ForegroundColor White
Write-Host "  Password: TSMGPVT@2026" -ForegroundColor White
Write-Host ""
