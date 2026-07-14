# Feedback Submission Debugging Guide

## 📋 Complete Debugging Checklist

### Step 1: Restart Backend Server ⚠️ **CRITICAL**

```powershell
# Terminal 1: Stop existing backend
# Press Ctrl+C in the backend terminal

# Then start fresh:
cd backend
node server.js
```

**Expected output:**
```
Server running on http://localhost:5000
MongoDB connected successfully
🔵 [ROUTE] POST /api/announcements/feedback/submit received
```

---

### Step 2: Verify Frontend is Running

```powershell
# Terminal 2: Keep frontend running
cd frontend
npm run dev
```

Expected: http://localhost:5173 (or similar Vite port)

---

### Step 3: Test Feedback Submission & Read Logs

1. **Open Browser DevTools:** Press `F12` → **Console** tab
2. **Navigate to:** http://localhost:5173/feedback (or wherever feedback form is)
3. **Fill the form:**
   - Select a rating (Great, Okay, or Needs work)
   - Enter a comment
   - Click "Submit"

---

### Step 4: Check Browser Console Logs

**Frontend logs will show:**
```
=== FEEDBACK SUBMISSION DEBUG ===
API_BASE_URL: http://localhost:5000
Token exists: false
User Email: your@email.com
Feedback Data: {student: 'your@email.com', email: 'your@email.com', rating: 'great', text: 'Great course!', message: 'Great course!'}
Request URL: http://localhost:5000/api/announcements/feedback/submit
Request Headers: {Content-Type: application/json}
Response Status: 201
Response OK: true
Response Body: {message: 'Feedback submitted successfully', data: {...}}
✅ Feedback submitted successfully
```

---

### Step 5: Check Backend Console Logs

**Backend logs will show:**
```
🔵 [ROUTE] POST /api/announcements/feedback/submit received
Content-Type: application/json

=== FEEDBACK SUBMISSION DEBUG ===
Request Method: POST
Request URL: /api/announcements/feedback/submit
Request Body: {student: 'your@email.com', email: 'your@email.com', rating: 'great', text: 'Great course!', message: 'Great course!'}
Request Headers: {...}
Request IP: ::1
✅ Validation passed
Creating Feedback document with: {student: 'your@email.com', email: 'your@email.com', rating: 'great'}
Feedback object created: {...}
✅ Feedback saved to MongoDB
Saved Feedback ID: 507f1f77bcf86cd799439011
Saved Feedback: {_id: '507f1f77bcf86cd799439011', ...}
```

---

### Step 6: Check Browser Network Tab

1. **Open DevTools:** Press `F12` → **Network** tab
2. **Submit feedback form**
3. **Look for request to:** `api/announcements/feedback/submit`
4. **Expected values:**

| Property | Expected Value |
|----------|---|
| **Method** | POST |
| **Status** | 201 |
| **URL** | http://localhost:5000/api/announcements/feedback/submit |
| **Request Headers** | Content-Type: application/json |
| **Request Payload** | `{student: '...', email: '...', rating: '...', text: '...'}` |
| **Response** | `{message: 'Feedback submitted successfully', data: {...}}` |

---

### Step 7: Verify MongoDB Data

1. Go to: https://cloud.mongodb.com
2. Navigate to your cluster: **Cluster0** → **Collections**
3. Look for: **chemy_lms** database → **feedbacks** collection
4. You should see the newly inserted feedback document with:
   - `_id`: Generated ObjectId
   - `student`: Your email
   - `email`: Your email
   - `rating`: 'great' | 'okay' | 'needs_work'
   - `text`: Your comment
   - `message`: Your comment
   - `createdAt`: Current timestamp
   - `updatedAt`: Current timestamp

---

## 🚨 Troubleshooting Error Codes

### ❌ Error: 404 Not Found

**Cause:** Backend route not found (server not restarted)

**Solution:**
```powershell
# Stop backend (Ctrl+C)
# Restart with:
cd backend
node server.js
```

**Verify in console:**
```
🔵 [ROUTE] POST /api/announcements/feedback/submit received
```

---

### ❌ Error: 400 Bad Request

**Cause:** Missing required fields in request

**Backend log will show:**
```
❌ Validation failed - Missing required fields
Student: undefined | Email: undefined | Rating: undefined
```

**Frontend data being sent:**
```
Feedback Data: {student: '', email: '', rating: null, ...}
```

**Solution:** Fill all fields in the form before submitting

---

### ❌ Error: 500 Internal Server Error

**Cause:** Server error (database connection, validation error, etc.)

**Backend log will show:**
```
❌ Error submitting feedback: [Error details]
Error Stack: [Full error trace]
```

**Solutions:**
1. Check MongoDB connection in backend/.env
2. Verify MONGO_URI is correct
3. Check network connectivity to MongoDB Atlas
4. Review error message for specific issue

---

### ❌ Error: CORS Error

**Cause:** Frontend and backend origin mismatch

**Browser error:** `Access to XMLHttpRequest at 'http://localhost:5000/...' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution:** CORS is already enabled in backend/server.js:
```javascript
app.use(cors());
```

If issue persists:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

### ❌ Error: Cannot read localStorage

**Cause:** localStorage.getItem('userEmail') returns null

**Frontend will use:** `'Anonymous Student'`

**Solution:** Login first or set email in localStorage

---

## 🔍 Complete Request/Response Flow

### Request Flow (Frontend → Backend)

```
1. User fills feedback form
2. User clicks "Submit"
3. handleSubmit() triggered
   ↓
4. Validates: mood selected? YES → continue
   ↓
5. Creates feedbackData object:
   {
     student: 'user@email.com',
     email: 'user@email.com',
     rating: 'great',
     text: 'comment text',
     message: 'comment text'
   }
   ↓
6. Makes POST request to:
   http://localhost:5000/api/announcements/feedback/submit
   ↓
7. Headers: { 'Content-Type': 'application/json' }
   Body: JSON.stringify(feedbackData)
```

### Response Flow (Backend → Frontend)

```
1. Backend receives POST request
2. Router middleware logs: "[ROUTE] received"
3. Controller function executes: submitFeedback()
4. Validates required fields (student, email, rating)
5. Creates Feedback document:
   {
     student: 'user@email.com',
     email: 'user@email.com',
     rating: 'great',
     text: 'comment text',
     message: 'comment text',
     createdAt: [timestamp],
     updatedAt: [timestamp]
   }
6. Saves to MongoDB
7. Returns 201 response:
   {
     message: 'Feedback submitted successfully',
     data: {...saved feedback object...}
   }
8. Frontend receives response
9. Sets submitted = true
10. Shows success message
```

---

## 📊 API Endpoint Details

**POST** `/api/announcements/feedback/submit`

### Request Body
```json
{
  "student": "student@email.com",
  "email": "student@email.com",
  "rating": "great",
  "text": "Great course",
  "message": "Great course"
}
```

### Required Fields
- ✅ `student` (string) - Student name or email
- ✅ `email` (string) - Student email
- ✅ `rating` (string) - One of: 'great', 'okay', 'needs_work'
- ❌ `text` (string) - Optional comment
- ❌ `message` (string) - Optional comment

### Response (201 Created)
```json
{
  "message": "Feedback submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "student": "student@email.com",
    "email": "student@email.com",
    "rating": "great",
    "text": "Great course",
    "message": "Great course",
    "adminReply": null,
    "adminReplyAt": null,
    "createdAt": "2026-07-14T10:30:45.123Z",
    "updatedAt": "2026-07-14T10:30:45.123Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Missing required fields",
  "received": {
    "student": null,
    "email": null,
    "rating": null
  }
}
```

---

## ✅ Final Validation Checklist

- [ ] Backend restarted successfully
- [ ] Backend shows: "Server running on http://localhost:5000"
- [ ] Backend shows: "MongoDB connected successfully"
- [ ] Backend shows route log: "🔵 [ROUTE] POST /api/announcements/feedback/submit received"
- [ ] Frontend running on http://localhost:5173 (or Vite port)
- [ ] Browser console shows complete debug logs
- [ ] Network tab shows 201 response
- [ ] Response body contains feedback ID
- [ ] MongoDB Atlas shows new feedback document
- [ ] Feedback displays in admin portal

---

## 📝 Summary

**To fix "Failed to submit feedback":**

1. **Stop backend** (Ctrl+C in backend terminal)
2. **Restart backend:**
   ```powershell
   cd backend
   node server.js
   ```
3. **Wait for:** "Server running on http://localhost:5000"
4. **Submit feedback** and check console logs
5. **Verify response status is 201** (not 404, 400, or 500)

If status is **201**, feedback submission is working ✅

If status is **404**, backend wasn't restarted ⚠️

If status is **400**, check required fields ⚠️

If status is **500**, check backend console error ⚠️
