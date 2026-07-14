# Announcement Feature Implementation Guide

## ✅ What Has Been Created

### 1. Backend Files
- **[backend/models/Announcement.js](backend/models/Announcement.js)** - MongoDB schema with fields: title, description, category, type, author, visibility, content, isPinned, attachments, readBy, timestamps
- **[backend/controllers/announcementController.js](backend/controllers/announcementController.js)** - 7 controller functions: getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin, getAnnouncementStats
- **[backend/routes/announcements.js](backend/routes/announcements.js)** - API route handlers with auth middleware
- **backend/server.js** - Updated to include announcements route at `/api/announcements`

### 2. Frontend Files
- **[frontend/src/services/announcementService.js](frontend/src/services/announcementService.js)** - Service module with 7 functions for API communication, includes auth token handling and error management
- **[frontend/src/pages/AnnouncementWithAPI.jsx](frontend/src/pages/AnnouncementWithAPI.jsx)** - Complete announcement page component with:
  - Real API integration
  - Loading states with spinner
  - Error handling with retry button
  - Featured announcement card
  - Filter system (All, Important, Events, Courses, System)
  - Pin/unpin functionality with localStorage
  - Stats card with live counters
  - Quick links sidebar
  - Pagination support
  - Responsive design

### 3. Documentation
- **[ANNOUNCEMENT_REQUIREMENTS.md](ANNOUNCEMENT_REQUIREMENTS.md)** - Complete 19-section requirements document

---

## 🚀 Getting Started

### Step 1: Update Frontend Import (Optional)
To use the new API-integrated component, update [frontend/src/StudentDashboard.jsx](frontend/src/StudentDashboard.jsx):

```javascript
// Change from:
import Announcement from './pages/Announcement';

// To:
import Announcement from './pages/AnnouncementWithAPI';
```

Or replace the mock version entirely with the API version.

### Step 2: Seed Sample Data (Testing)
Create a helper script or use MongoDB shell to add test announcements:

```javascript
db.announcements.insertMany([
  {
    title: "Practical exam venue changed for Day 3",
    description: "The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A – 305. Please update your calendar.",
    category: "IMPORTANT",
    type: "important",
    author: ObjectId("...admin_id..."),
    authorName: "Examination Office",
    visibility: "all",
    isPinned: true,
    createdAt: new Date("2026-07-14T10:00:00Z")
  },
  {
    title: "Webinar: Future of Data Science",
    description: "Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session.",
    category: "EVENT",
    type: "event",
    author: ObjectId("...admin_id..."),
    authorName: "Career Services",
    visibility: "all",
    isPinned: false,
    createdAt: new Date("2026-07-14T04:00:00Z")
  },
  {
    title: "New assignment posted in Data Structures",
    description: "Assignment 4 covering binary trees and traversal algorithms is now available. Due 28 Jul 2026, 11:59 PM.",
    category: "COURSE",
    type: "course",
    author: ObjectId("...admin_id..."),
    authorName: "Prof. Menon",
    visibility: "all",
    isPinned: false,
    createdAt: new Date("2026-07-13T14:00:00Z")
  },
  {
    title: "Scheduled maintenance this weekend",
    description: "The portal will be briefly unavailable on 19 Jul 2026, 1:00–2:00 AM IST.",
    category: "SYSTEM",
    type: "system",
    author: ObjectId("...admin_id..."),
    authorName: "IT Support",
    visibility: "all",
    isPinned: false,
    createdAt: new Date("2026-07-12T08:00:00Z")
  }
]);
```

### Step 3: Test the Feature

#### Via API (Using cURL or Postman):

**1. Get all announcements**
```bash
curl "http://localhost:5000/api/announcements?page=1&limit=10"
```

**2. Get announcements by type**
```bash
curl "http://localhost:5000/api/announcements?type=important"
```

**3. Create announcement (requires Bearer token)**
```bash
curl -X POST "http://localhost:5000/api/announcements" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "description": "This is a test announcement",
    "category": "COURSE",
    "authorName": "Admin"
  }'
```

**4. Pin announcement (requires Bearer token)**
```bash
curl -X PATCH "http://localhost:5000/api/announcements/{announcementId}/pin" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pinned": true}'
```

#### Via Frontend:
1. Start backend: `npm run dev` (from backend folder)
2. Start frontend: `npm run dev` (from frontend folder)
3. Login as student
4. Navigate to Announcements
5. Test filtering, pinning, loading

---

## 🔐 Authentication Flow

### How it Works
1. User logs in → JWT token stored in `localStorage.authToken`
2. Frontend service retrieves token from localStorage
3. Token added to request header: `Authorization: Bearer {token}`
4. Backend auth middleware validates token
5. If invalid/missing → 401 error → Redirect to login

### Common 401 Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" + 401 | No login token | Login first, check localStorage for authToken |
| Token expired | Token was valid but expired | Logout and login again |
| Wrong format | Token not prefixed with "Bearer " | Check announcementService.js token formatting |
| CORS error | Frontend and backend on different ports | Verify CORS is enabled in server.js |

---

## 📦 API Endpoints Reference

### Public Endpoints
- `GET /api/announcements` - Get all announcements (paginated)
  - Query params: `page`, `limit`, `type`, `sort`
  - No auth required

### Protected Endpoints (Require Bearer Token)
- `GET /api/announcements/:id` - Get announcement details & mark as read
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement
- `PATCH /api/announcements/:id/pin` - Toggle pin status
- `GET /api/announcements/:id/stats` - Get read statistics

### Request/Response Examples

**GET Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Sample Announcement",
      "description": "...",
      "category": "IMPORTANT",
      "type": "important",
      "authorName": "Admin",
      "isPinned": false,
      "createdAt": "2026-07-14T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized"
}
```

---

## 🎨 Frontend Component Props & Features

### AnnouncementWithAPI.jsx

**Features:**
- ✅ Real-time data fetching from API
- ✅ Filter by category (All, Important, Events, Courses, System)
- ✅ Pin/unpin with localStorage persistence
- ✅ Loading states with spinner
- ✅ Error handling with retry
- ✅ Pagination with "Load more"
- ✅ Featured card (pinned or latest)
- ✅ Live stats counter
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Relative time display (e.g., "2 hours ago")

**Local Storage:**
- `authToken` - JWT authentication token (set by login)
- `pinnedAnnouncements` - Array of pinned announcement IDs

---

## 🛠️ Troubleshooting

### Issue: 401 Unauthorized on all API calls
**Solutions:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check token exists: Open DevTools → Application → localStorage → look for `authToken`
3. Test login endpoint works: Use login form on frontend first
4. Check auth middleware: Verify `/api/announcements` route has proper cors/middleware setup

### Issue: MongoDB Connection Error
**Solutions:**
1. Verify MongoDB is running
2. Check MONGO_URI in backend/.env
3. Ensure database exists and is accessible

### Issue: CORS errors
**Solutions:**
1. Verify CORS enabled in server.js
2. Check frontend URL vs backend URL match
3. Ensure no port mismatches

### Issue: Stats showing 0 values
**Solutions:**
1. Check sample data was inserted
2. Verify database connection
3. Check filter is not too restrictive

---

## 📝 Development Checklist

- [ ] Backend Announcement model created
- [ ] Controllers and routes created
- [ ] Routes registered in server.js
- [ ] Frontend service created with auth handling
- [ ] AnnouncementWithAPI component created
- [ ] Sample data seeded in MongoDB
- [ ] Tested GET /api/announcements (public)
- [ ] Tested POST /api/announcements (authenticated)
- [ ] Tested PATCH /api/announcements/:id/pin (authenticated)
- [ ] Tested filtering by type
- [ ] Tested pagination (load more)
- [ ] Tested error handling (401, network errors)
- [ ] Tested responsive design on mobile
- [ ] Verified pin state persists in localStorage
- [ ] Verified stats update correctly

---

## 🔄 Next Steps / Enhancements

### Phase 2 (Recommended)
1. **Admin Panel** - Create/Edit/Delete announcements
2. **Search** - Full-text search across announcements
3. **Email Notifications** - Send emails for important announcements
4. **Rich Text Editor** - Support for formatted content

### Phase 3 (Future)
1. **Scheduling** - Publish announcements at specific times
2. **File Attachments** - Upload PDFs, images, etc.
3. **Analytics** - Dashboard showing read statistics
4. **Notification Preferences** - Student can control notification settings
5. **Comments** - Discussion threads on announcements

---

## 📞 Support

**Files Modified:**
- `backend/server.js` - Added announcements route

**Files Created:**
- `backend/models/Announcement.js`
- `backend/controllers/announcementController.js`
- `backend/routes/announcements.js`
- `frontend/src/services/announcementService.js`
- `frontend/src/pages/AnnouncementWithAPI.jsx`

**Documentation:**
- `ANNOUNCEMENT_REQUIREMENTS.md`
- `ANNOUNCEMENT_SETUP.md` (this file)
