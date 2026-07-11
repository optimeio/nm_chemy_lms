# run-all.ps1
# Usage: Open PowerShell in repository root and run: .\run-all.ps1

Write-Host "Starting all services: local MongoDB, backend, and frontend..."

# Use local mongod. Ensure MongoDB server binary `mongod` is available.
$root = $PSScriptRoot
if (Get-Command mongod -ErrorAction SilentlyContinue) {
  $dataDir = Join-Path $root 'data\db'
  if (-not (Test-Path $dataDir)) {
    Write-Host "Creating MongoDB data directory at $dataDir"
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
  }

  Write-Host "Launching local mongod using data directory: $dataDir"
  Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","mongod --dbpath `"$dataDir`" --bind_ip 127.0.0.1 --port 27017" -WindowStyle Normal
  Write-Host "Waiting briefly for mongod to initialize..."
  Start-Sleep -Seconds 3
} else {
  Write-Warning "Local 'mongod' binary not found on PATH. Please install MongoDB community server or provide a running MongoDB instance and set MONGO_URI in backend/.env or environment."
}

$root = $PSScriptRoot

function Get-FreePort {
  param([int]$startPort = 5000)
  for ($port = $startPort; $port -lt $startPort + 100; $port++) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if (-not $conn) { return $port }
  }
  throw "No free port found between $startPort and $($startPort + 99)"
}

$backendPort = Get-FreePort 5000
Write-Host "Using backend port $backendPort"

# Start backend in a new PowerShell window
$backendDir = Join-Path $root 'backend'
$backendCmd = @"
cd `"$backendDir`"
if (-not (Test-Path node_modules)) { npm install }
# Use local MongoDB by default; override with MONGO_URI env var if needed
`$env:MONGO_URI = 'mongodb://localhost:27017/chemy_lms'
`$env:PORT = '$backendPort'
npm run dev
"@

Write-Host "Launching backend in a new window..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$backendCmd -WindowStyle Normal

# Start frontend in a new PowerShell window
$frontendDir = Join-Path $root 'frontend'
$frontendCmd = @"
cd `"$frontendDir`"
if (-not (Test-Path node_modules)) { npm install }
`$env:VITE_BACKEND_URL = 'http://localhost:$backendPort'
npm run dev
"@

Write-Host "Launching frontend in a new window..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$frontendCmd -WindowStyle Normal

Write-Host "All processes started. Check the new windows for logs. Press Ctrl+C to stop frontend/backend, and close the MongoDB window to stop the database."