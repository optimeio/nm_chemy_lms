# Authentication Flow - Complete Analysis

## Root Cause Analysis

### The Problem
Admin login was always showing "Invalid credentials" even with correct email and password.

### Why It Was Happening
```
Frontend                          Backend
(Port 5173)                       (Port 5000)
    ↓                                 ↓
[Login Form]                      [Express Server]
    ↓
[Fetch to localhost:5002] ← ❌ WRONG PORT!
    ↓                           
[No Backend Found] ❌
    ↓
Error: "Unable to reach server"
    ↓
[Frontend displays] "Invalid credentials"
```

The request **never reached the backend**. It failed before authentication could even run.

---

## Authentication Flow (Fixed)

```
┌─ FRONTEND ─────────────────────────────────────────┐
│                                                    │
│  1. User enters:                                  │
│     • Email: theoptime.io@gmail.com               │
│     • Password: TSMGPVT@2026                      │
│                                                    │
│  2. Form validates inputs                         │
│                                                    │
│  3. Sends to: http://localhost:5000 ✅ (FIXED)   │
│     POST /api/auth/login                          │
│     { email, password }                           │
│                                                    │
│  4. Receives { token, role }                      │
│                                                    │
│  5. Stores in localStorage:                       │
│     • authToken                                   │
│     • userRole                                    │
│     • userEmail                                   │
│                                                    │
│  6. Redirects to:                                 │
│     • /dashboard/admin (if role === 'admin')      │
│     • /dashboard/student (otherwise)              │
│                                                    │
└────────────────────────────────────────────────────┘
             ↓ HTTP POST ↓
┌─ BACKEND ──────────────────────────────────────────┐
│                                                    │
│  [authController.js - login function]             │
│                                                    │
│  1. Receive: { email, password }                  │
│     [AUTH] Login attempt with: {...}              │
│                                                    │
│  2. Trim & lowercase email                        │
│     [AUTH] Looking up user with email: ...        │
│                                                    │
│  3. Query MongoDB:                                │
│     User.findOne({                                │
│       $or: [                                      │
│         { email: lookup },                        │
│         { registerNo: lookup },                   │
│         { phone: lookup }                         │
│       ]                                           │
│     })                                            │
│     [AUTH] User found: { email, role, id }        │
│                                                    │
│  4. Compare passwords:                            │
│     bcrypt.compare(password, user.password)       │
│     [AUTH] bcrypt.compare result: true ✅         │
│                                                    │
│  5. Generate JWT token:                           │
│     jwt.sign({ id: user._id }, JWT_SECRET, ...)   │
│     [AUTH] Token generated: { ... }               │
│                                                    │
│  6. Return response:                              │
│     { token: "...", role: "admin" }               │
│     [AUTH] Login successful for: { email, role }  │
│                                                    │
└────────────────────────────────────────────────────┘
             ↓ HTTP Response ↓
┌─ DATABASE ─────────────────────────────────────────┐
│  MongoDB Atlas                                     │
│  Collection: users                                │
│                                                    │
│  Document:                                        │
│  {                                                │
│    _id: ObjectId(...),                            │
│    fullName: "Administrator",                     │
│    email: "theoptime.io@gmail.com",               │
│    password: "$2a$10$..." (bcrypt hash),          │
│    role: "admin",                                 │
│    createdAt: ISODate(...)                        │
│  }                                                │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Code Changes Made

### 1. Backend Environment Variables

**File**: [backend/.env](backend/.env)

```diff
  MONGO_URI=mongodb://...
  PORT=5000
+ JWT_SECRET=chemy_lms_jwt_secret_key_2026_change_in_production
  SMTP_HOST=smtp.gmail.com
```

**Why**: JWT_SECRET is used to sign and verify tokens. Having it in .env allows secure configuration.

---

### 2. Backend Login Controller - Debug Logging

**File**: [backend/controllers/authController.js](backend/controllers/authController.js)

**Added logging at each step**:

```javascript
// Before:
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
    // ... no visibility into what's happening
  }
}

// After:
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[AUTH] Login attempt with:', { email: email?.toLowerCase(), passwordLength: password?.length || 0 });
    
    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const lookup = email.trim().toLowerCase();
    console.log('[AUTH] Looking up user with email:', lookup);
    
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { registerNo: lookup },
        { phone: lookup },
      ],
    });
    
    console.log('[AUTH] User found:', !!user ? { email: user.email, role: user.role, id: user._id } : 'NOT FOUND');
    
    // ... bcrypt compare with detailed logging ...
    
    console.log('[AUTH] Password verified! Generating JWT token...');
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('[AUTH] Token generated:', { tokenLength: token.length, userId: user._id, role: user.role });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
```

**Why**: You can now see exactly where login fails and why.

---

### 3. Frontend API URL - Port Fix

**File**: [frontend/src/App.jsx](frontend/src/App.jsx#L14)

```diff
- const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5002';
+ const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000';
```

**Why**: Frontend must connect to the same port where backend is running.

---

### 4. Frontend Vite Config - Proxy Port Fix

**File**: [frontend/vite.config.js](frontend/vite.config.js#L3)

```diff
- const backendUrl = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5002';
+ const backendUrl = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
```

**Why**: During development, Vite proxies `/api` requests to the backend proxy target.

---

## Debug Log Output Explained

When you log in with correct credentials, backend console shows:

```
[AUTH] Login attempt with: { email: 'theoptime.io@gmail.com', passwordLength: 13 }
      ↓ Request received with email and password
      
[AUTH] Looking up user with email: theoptime.io@gmail.com
      ↓ Starting database query
      
[AUTH] User found: { email: 'theoptime.io@gmail.com', role: 'admin', id: '507f1f77bcf86cd799439011' }
      ↓ User exists in database with admin role
      
[AUTH] Comparing password with bcrypt...
[AUTH] Stored password hash length: 60
[AUTH] bcrypt.compare result: true
      ↓ Password matches (bcrypt hash comparison successful)
      
[AUTH] Password verified! Generating JWT token...
[AUTH] Token generated: { tokenLength: 177, userId: '507f1f77bcf86cd799439011', role: 'admin' }
      ↓ JWT token created and will expire in 7 days
      
[AUTH] Login successful for: { email: 'theoptime.io@gmail.com', role: 'admin' }
      ↓ Login complete, response sent to frontend
```

---

## Common Issues and Solutions

### Issue 1: "Invalid credentials" appears
**Logs show**: `[AUTH] User found: NOT FOUND`
- User doesn't exist in database
- Email is stored differently (mixed case, spaces, etc.)
- **Solution**: Run `node scripts/createAdmin.js` to create admin user

### Issue 2: "Invalid credentials" appears  
**Logs show**: `[AUTH] bcrypt.compare result: false`
- Password is incorrect
- Or password stored as plain text (old data)
- **Solution**: 
  - Verify password is correct
  - If plain text, system auto-migrates on first correct login attempt
  - Re-create user with `node scripts/createAdmin.js --email admin@test.com --password NewPass123`

### Issue 3: "Unable to reach server" error
**Logs show**: No logs at all
- Backend not running
- Wrong port
- **Solution**: 
  - Check backend is running: `node server.js` should show `Server running on http://localhost:5000`
  - Check frontend is using port 5000 (it is now)

### Issue 4: Token works but role check fails
**Logs show**: `[AUTH] Login successful` but admin dashboard doesn't load
- Role is not being returned correctly
- **Solution**: Check that `res.json({ token, role: user.role })` includes role

---

## Environment Variables Checklist

**backend/.env must have**:
```env
MONGO_URI=mongodb://...          ✅ Have it
PORT=5000                        ✅ Have it
JWT_SECRET=your_secret_key       ✅ Added it
SMTP_HOST=smtp.gmail.com         ✅ Optional
SMTP_PORT=465                    ✅ Optional
```

**Frontend .env (optional)**:
```env
VITE_BACKEND_URL=http://localhost:5000    # If different from default
```

---

## Security Considerations

1. **JWT_SECRET**: Currently `chemy_lms_jwt_secret_key_2026_change_in_production`
   - For production: Generate strong random: `openssl rand -base64 32`
   - Never commit real secrets to git

2. **Admin Password**: Currently `TSMGPVT@2026`
   - Change immediately in production
   - Use: `node scripts/createAdmin.js --email admin@company.com --password StrongPassword123`

3. **MONGO_URI**: Connected to production database
   - Credentials are visible in code (not ideal)
   - Consider: Use environment-only .env, never commit credentials

4. **Token Expiry**: Set to 7 days
   - Consider shorter expiry for security
   - Implement refresh token mechanism

---

## Testing Verification Steps

1. **Backend running?**
   ```bash
   curl http://localhost:5000/health
   # Should return: { "status": "ok", "message": "Backend is running" }
   ```

2. **Admin user exists?**
   ```bash
   # In MongoDB Compass or shell
   db.users.findOne({ email: 'theoptime.io@gmail.com' })
   # Should return user document with role: 'admin'
   ```

3. **Can create token?**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"theoptime.io@gmail.com","password":"TSMGPVT@2026"}'
   # Should return: { "token": "...", "role": "admin" }
   ```

4. **Frontend connecting?**
   - Open http://localhost:5173
   - F12 → Network tab
   - Try login
   - Should see POST to /api/auth/login returning 200 with token

---

## Next Steps After Login Works

1. Verify admin dashboard loads (`/dashboard/admin`)
2. Test JWT authentication on protected routes
3. Implement token refresh if needed
4. Add password reset functionality
5. Implement login rate limiting
6. Add user session management
7. Set up HTTPS for production
