# Admin Login Authentication Debug Guide

## Issues Found and Fixed

### 1. ✅ CRITICAL: PORT MISMATCH
**Problem**: Frontend was trying to connect to `localhost:5002` but backend runs on `localhost:5000`
- Frontend API_BASE_URL was hardcoded to `http://localhost:5002`
- Backend .env had `PORT=5000`

**Fixed in**:
- [frontend/src/App.jsx](frontend/src/App.jsx#L14) - Changed to `http://localhost:5000`
- [frontend/vite.config.js](frontend/vite.config.js#L3) - Changed to `http://localhost:5000`

---

### 2. ✅ SECURITY: Missing JWT_SECRET
**Problem**: JWT_SECRET was not in `.env`, using fallback `dev_jwt_secret_change_me`

**Fixed in**:
- [backend/.env](backend/.env#L3) - Added `JWT_SECRET=chemy_lms_jwt_secret_key_2026_change_in_production`

---

### 3. ✅ DEBUGGING: No Console Logging
**Problem**: Auth controller had no logging, making it impossible to debug issues

**Added comprehensive logging to**:
- [backend/controllers/authController.js](backend/controllers/authController.js)
- Request body logging
- User lookup result
- Password comparison result
- JWT token generation
- Success/error messages

---

## Authentication Flow Checklist

### Frontend
- ✅ Login form sends email & password to `/api/auth/login`
- ✅ API URL is correct: `http://localhost:5000` (FIXED)
- ✅ Request body: `{ email, password }`
- ✅ Token stored in localStorage as `authToken`
- ✅ User role stored in localStorage as `userRole`

### Backend
- ✅ Login route: `POST /api/auth/login`
- ✅ Controller: [authController.js](backend/controllers/authController.js)
- ✅ User model: [User.js](backend/models/User.js)
- ✅ Password comparison: bcrypt.compare() with fallback migration
- ✅ JWT generation: 7-day expiry
- ✅ Response: `{ token, role }`

### Database
- MongoDB URI configured in `.env`
- User schema has `role` field (enum: 'student', 'admin', 'trainer')

---

## Step-by-Step Fix Instructions

### Step 1: Restart Your Servers
```bash
# Terminal 1: Backend
cd backend
npm install
node server.js
# Should see: "Server running on http://localhost:5000"

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev
# Should see: "Local: http://localhost:5173"
```

### Step 2: Create Admin User
Run the admin creation script with default credentials:
```bash
cd backend
node scripts/createAdmin.js
```

**Output should show:**
```
Created admin user theoptime.io@gmail.com.
Admin credentials:
  email: theoptime.io@gmail.com
  password: TSMGPVT@2026
```

Or with custom credentials:
```bash
node scripts/createAdmin.js --email admin@example.com --password MyPassword123
```

### Step 3: Test Login with Debug Logs
1. Open your browser's DevTools (F12)
2. Go to **Console** tab
3. Click "Sign In" on frontend
4. Enter admin email: `theoptime.io@gmail.com`
5. Enter admin password: `TSMGPVT@2026`
6. Click Sign In

### Step 4: Check Terminal Logs
Watch the backend terminal for detailed logs:
```
[AUTH] Login attempt with: { email: 'theoptime.io@gmail.com', passwordLength: 13 }
[AUTH] Looking up user with email: theoptime.io@gmail.com
[AUTH] User found: { email: 'theoptime.io@gmail.com', role: 'admin', id: '...' }
[AUTH] Comparing password with bcrypt...
[AUTH] Stored password hash length: 60
[AUTH] bcrypt.compare result: true
[AUTH] Password verified! Generating JWT token...
[AUTH] Token generated: { tokenLength: 177, userId: '...', role: 'admin' }
[AUTH] Login successful for: { email: 'theoptime.io@gmail.com', role: 'admin' }
```

---

## Troubleshooting

### Error: "Invalid credentials"
**Possible causes:**

1. **Backend not running on port 5000**
   - Check: Backend terminal should show `Server running on http://localhost:5000`
   - If running on different port, frontend won't connect
   
2. **Admin user doesn't exist**
   - Solution: Run `node scripts/createAdmin.js`
   - Verify: Check MongoDB - should have user with role='admin'
   
3. **Password is incorrect**
   - Check backend logs for: `[AUTH] bcrypt.compare result: false`
   - Solution: Delete admin user and recreate: `node scripts/createAdmin.js --email admin@example.com --password NewPassword123`
   
4. **Email not found in database**
   - Check backend logs for: `[AUTH] No user found for: theoptime.io@gmail.com`
   - Solution: Verify email is lowercase in MongoDB
   
5. **JWT_SECRET mismatch**
   - If you change JWT_SECRET after login, old tokens become invalid
   - Solution: Clear localStorage and re-login

### Error: "Unable to reach server"
- **Cause**: Backend not running or port mismatch
- **Check**: Is backend running on port 5000?
- **Check**: Are frontend and backend using same port (both 5000)?

### Logs show "bcrypt.compare error"
- **Cause**: Password stored as plain text, not hashed
- **Fix**: Automatic migration - login once and system will hash the password
- **Check**: After login, logs should show `[AUTH] Plain text password matches! Migrating to bcrypt...`

---

## Database Verification

Check if admin user exists in MongoDB:
```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: 'theoptime.io@gmail.com' })

// Should return:
{
  _id: ObjectId("..."),
  fullName: 'Administrator',
  email: 'theoptime.io@gmail.com',
  password: '$2a$10$...' // bcrypt hash, not plain text
  role: 'admin',
  createdAt: ISODate("2026-...")
}
```

---

## Environment Variables Verified

✅ [backend/.env](backend/.env):
- `MONGO_URI`: MongoDB connection string
- `PORT`: 5000
- `JWT_SECRET`: chemy_lms_jwt_secret_key_2026_change_in_production
- SMTP settings (optional)

---

## Files Modified

1. [backend/.env](backend/.env) - Added JWT_SECRET, verified PORT
2. [backend/controllers/authController.js](backend/controllers/authController.js) - Added extensive debug logging
3. [frontend/src/App.jsx](frontend/src/App.jsx#L14) - Fixed API_BASE_URL port
4. [frontend/vite.config.js](frontend/vite.config.js#L3) - Fixed proxy port

---

## Next Steps

After admin login works:
1. Test that `/dashboard/admin` loads correctly
2. Verify admin can access admin-only endpoints
3. Test JWT token refresh mechanism
4. Update JWT_SECRET to a strong random value for production
5. Implement token refresh endpoint if needed

---

## Debug Logs Reference

All backend logs are prefixed with `[AUTH]` for easy filtering:
- `[AUTH] Login attempt with:` - Initial login request
- `[AUTH] Looking up user with email:` - Database query
- `[AUTH] User found:` - User lookup result
- `[AUTH] Comparing password with bcrypt...` - Password check starting
- `[AUTH] bcrypt.compare result:` - Comparison outcome (true/false)
- `[AUTH] Password verified!` - Password accepted
- `[AUTH] Token generated:` - JWT created
- `[AUTH] Login successful for:` - Final success
- `[AUTH] Error:` - Any errors during process
