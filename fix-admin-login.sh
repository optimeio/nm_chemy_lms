#!/bin/bash
# Admin Login Fix and Debug Script
# Run this to verify backend connection and fix login issues

echo "=========================================="
echo "CHEMY LMS - Admin Login Debug & Fix"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Checking Backend Server...${NC}"
echo "Testing connection to http://localhost:5000/health"
HEALTH=$(curl -s http://localhost:5000/health 2>&1)
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is NOT running${NC}"
    echo "   Fix: Run 'npm run dev' in backend folder"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 2: Creating/Resetting Admin Account...${NC}"
echo "Admin Email: theoptime.io@gmail.com"
echo "Admin Password: TSMGPVT@2026"
echo ""
echo "Running: cd backend && node scripts/createAdmin.js"

cd backend 2>/dev/null || { echo -e "${RED}✗ backend folder not found${NC}"; exit 1; }
node scripts/createAdmin.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Admin account created/updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to create admin account${NC}"
    echo "   Troubleshooting: Check if MONGO_URI is correct in backend/.env"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3: Testing Login API...${NC}"
echo "Sending login request..."

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"theoptime.io@gmail.com","password":"TSMGPVT@2026"}')

echo "Response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Login API is working${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: $TOKEN"
else
    echo -e "${RED}✗ Login API returned error${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "All checks passed! Login should now work."
echo "=========================================="
echo ""
echo "Admin Credentials:"
echo "  Email: theoptime.io@gmail.com"
echo "  Password: TSMGPVT@2026"
echo ""
