# Student Panel Announcement - Complete Requirements

## 1. FEATURE OVERVIEW
The Announcement feature provides students with a centralized hub to view, filter, and manage important notifications across the LMS platform.

---

## 2. ANNOUNCEMENT TYPES & CATEGORIES

### Announcement Categories (4 Types):
1. **IMPORTANT** (Amber/Orange)
   - Color: #f2994a (dot), #d97706 (text)
   - Priority notifications: venue changes, deadline extensions, urgent updates
   - Example: "Practical exam venue changed for Day 3"

2. **EVENT** (Teal)
   - Color: #0fa39a (dot & text)
   - Campus events, webinars, workshops, seminars
   - Example: "Webinar: Future of Data Science"

3. **COURSE** (Purple)
   - Color: #4a3aff (dot & text)
   - Course updates, new assignments, lecture notices
   - Example: "New assignment posted in Data Structures"

4. **SYSTEM** (Slate Gray)
   - Color: #7c8291 (dot & text)
   - Maintenance alerts, platform updates, technical notices
   - Example: "Scheduled maintenance this weekend"

---

## 3. ANNOUNCEMENT DATA STRUCTURE

### Database Model (Announcement.js - Backend)
```javascript
{
  _id: ObjectId,
  title: String (required, max 100 chars),
  description: String (required, max 1000 chars),
  category: Enum['IMPORTANT', 'EVENT', 'COURSE', 'SYSTEM'] (required),
  type: String (normalized from category), // 'important', 'event', 'course', 'system'
  author: ObjectId (reference to User - Admin/Trainer),
  authorName: String, // "Examination Office", "Prof. Menon", "IT Support"
  visibility: Enum['all', 'students', 'specific_course'], // default: 'all'
  courseId: ObjectId (optional, if visibility is 'specific_course'),
  content: String (rich HTML/markdown content),
  isPinned: Boolean (default: false),
  createdAt: Date (auto-set),
  updatedAt: Date (auto-set),
  expiresAt: Date (optional, for time-limited announcements),
  imageUrl: String (optional, featured image),
  attachments: Array (optional, file URLs),
  readBy: Array of { userId, readAt } (tracking)
}
```

---

## 4. FRONTEND UI COMPONENTS

### Main Announcement Page (AnnouncementNew.jsx)

#### 4.1 Header Section
- **Title**: "Announcements"
- **Subtitle**: "Everything you need to know, in the order it happened."
- **Breadcrumb**: "Student · Chemy LMS"
- **Back Button**: Navigate to dashboard

#### 4.2 Featured Card
- Large gradient card (Primary Purple: #4a3aff to #241a8f)
- Displays the latest/most important announcement
- Content:
  - Category tags (e.g., "FEATURED", "COURSE UPDATE")
  - Large bold title (26px, Space Grotesk)
  - Description text (max 560px width)
  - Meta info: Author name, Date
  - CTA Button: "View course →" or contextual action

#### 4.3 Filter System
**Filter Buttons** (Horizontal, 5 options):
1. **All** - Show all announcements
2. **Important** - Only IMPORTANT type
3. **Events** - Only EVENT type
4. **Courses** - Only COURSE type
5. **System** - Only SYSTEM type

- Active filter: Dark background (#161522) with white text
- Inactive filter: White background with border
- Sticky/top positioned for easy access

#### 4.4 Timeline/Announcement List
**Each Timeline Item** contains:
- **Left Indicator Dot** (colored based on category, positioned left of card)
- **Icon** (40x40px, rounded, emoji or icon-based)
- **Category Badge** (small uppercase pill)
- **Title** (16.5px, bold, Space Grotesk)
- **Description** (14px, dark-soft color, 2 lines max with ellipsis)
- **Metadata**:
  - Time/Date (relative: "2 hours ago", "Yesterday", "2 days ago")
  - Author/Department name
- **Pin Button** (Save/Bookmark icon, toggle pinned state)
- **Hover Effect**: Slight shadow/elevation

**Card Styling**:
- Border: 1px solid #eae8e3
- Background: White
- Border-radius: 14px
- Padding: 18px 20px
- Spacing between items: 14px

#### 4.5 Right Sidebar (Desktop Only, 320px wide)

##### Stats Card
**Title**: "Announcement stats"
- **Grid Layout** (2x2):
  - Stat 1: Total (📋) - violet background
  - Stat 2: Important (⚠️) - amber background
  - Stat 3: This week (⏱️) - teal background
  - Stat 4: Pinned (📌) - slate background
- Each stat shows: Large number + label

##### Quick Links Card
**Title**: "Quick links"
- Academic calendar (📅) - "View important dates and deadlines"
- Exam schedule (✓) - "Check upcoming exams"
- Assignment submission (📄) - "View pending submissions"
- Each link: Clickable row with icon, title, description, arrow

##### Notification Settings Card
**Title**: "Get notified"
- Description: "Stay updated with real-time announcements"
- Button: "Enable notifications" (dark background, white text)
- Background: Gradient (#efedff to #f7eefb)

#### 4.6 Load More Button
- Text: "Load more announcements ⬇️"
- Centered, light text color
- Pagination: Load 5-10 items per page

#### 4.7 Responsive Behavior
- **Desktop (>900px)**: Grid layout (1.7fr main | 0.9fr sidebar)
- **Tablet/Mobile**: Single column, sidebar below
- **Mobile**: Adjusted padding, full-width cards
- **Typography**: Scale responsive (h1: 38px desktop, 24px mobile)

---

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 Display & Sorting
- **Default Sort**: Newest first (by createdAt)
- **Pinned Items**: Always appear at top
- **Visibility**: Student should only see:
  - Global announcements (visibility: 'all')
  - Course-specific announcements for their enrolled courses
- **Unread Indicator**: Badge on bell icon in navigation (optional enhancement)

### 5.2 Filtering
- Client-side filtering by announcement type/category
- Maintain filter state in URL params (optional)
- Show empty state if no announcements match filter

### 5.3 Pin/Unpin
- Toggle pin state with bookmark/save icon
- Pin state stored per user (localStorage or backend)
- Pinned items float to top in their respective filter

### 5.4 Search (Future Enhancement)
- Search box in header (optional)
- Filter announcements by title/description keywords

### 5.5 Read Status Tracking (Optional)
- Track which announcements user has read
- Visual indication (dimmed text for read items)
- Mark as read on click/view

### 5.6 Date/Time Display
- Relative time format (e.g., "2 hours ago", "Yesterday")
- Tooltip shows absolute date/time on hover
- Use library like `date-fns` or `moment`

---

## 6. BACKEND API ENDPOINTS

### 6.1 Authentication
- All endpoints require JWT authentication
- User must be logged in

### 6.2 API Routes (Create `backend/routes/announcements.js`)

#### GET /api/announcements
**Get all announcements (paginated)**
- Query params:
  - `page`: 1 (default)
  - `limit`: 10 (default)
  - `type`: optional filter (important|event|course|system)
  - `sort`: 'newest' (default) | 'oldest' | 'pinned'
- Response:
  ```json
  {
    success: true,
    data: [...announcements],
    pagination: { total, page, limit, pages }
  }
  ```

#### GET /api/announcements/:id
**Get single announcement details**
- Response: Full announcement object with all fields
- Mark as read for current user

#### POST /api/announcements (Admin/Trainer only)
**Create new announcement**
- Body:
  ```json
  {
    title: String,
    description: String,
    category: Enum,
    authorName: String,
    visibility: String,
    courseId: ObjectId (if needed),
    content: String,
    imageUrl: String,
    attachments: Array
  }
  ```
- Response: Created announcement object

#### PUT /api/announcements/:id (Admin/Trainer only)
**Update announcement**
- Body: Same as POST
- Response: Updated announcement object

#### DELETE /api/announcements/:id (Admin/Trainer only)
**Delete announcement**
- Response: { success: true, message: "Deleted" }

#### PATCH /api/announcements/:id/pin
**Toggle pin status (User specific)**
- Body: `{ pinned: boolean }`
- Response: { success: true, pinned: boolean }

#### GET /api/announcements/:id/stats
**Get announcement read stats (Admin only)**
- Response:
  ```json
  {
    totalViews: Number,
    readBy: Number,
    readers: Array[{ userId, userName, readAt }]
  }
  ```

---

## 7. DATABASE SCHEMA (MongoDB)

### Collection: `announcements`
```javascript
db.createCollection("announcements", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "category", "author"],
      properties: {
        _id: { bsonType: "objectId" },
        title: { bsonType: "string", maxLength: 100 },
        description: { bsonType: "string", maxLength: 1000 },
        category: { enum: ["IMPORTANT", "EVENT", "COURSE", "SYSTEM"] },
        type: { bsonType: "string" },
        author: { bsonType: "objectId" },
        authorName: { bsonType: "string" },
        visibility: { enum: ["all", "students", "specific_course"] },
        courseId: { bsonType: "objectId" },
        content: { bsonType: "string" },
        isPinned: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        expiresAt: { bsonType: "date" },
        imageUrl: { bsonType: "string" },
        attachments: { bsonType: "array" },
        readBy: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              userId: { bsonType: "objectId" },
              readAt: { bsonType: "date" }
            }
          }
        }
      }
    }
  }
});

// Indexes for performance
db.announcements.createIndex({ createdAt: -1 });
db.announcements.createIndex({ category: 1 });
db.announcements.createIndex({ visibility: 1 });
db.announcements.createIndex({ isPinned: -1, createdAt: -1 });
```

### Collection: `user_announcements` (Track user-specific data)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  announcementId: ObjectId (reference to Announcement),
  isPinned: Boolean,
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

---

## 8. STYLING & DESIGN TOKENS

### Color Palette
- **Primary**: #4a3aff (Purple)
- **Primary Deep**: #241a8f (Dark Purple)
- **Ink**: #161522 (Dark text)
- **Ink Soft**: #5b5a6e (Medium text)
- **Paper**: #faf9f7 (Background)
- **Card**: #ffffff (White)
- **Line**: #eae8e3 (Border)
- **Amber**: #f2994a (Important)
- **Teal**: #0fa39a (Event)
- **Slate**: #7c8291 (System)

### Typography
- **Font Family**: Space Grotesk (headings), IBM Plex Mono (labels)
- **Border Radius**: 16px (cards), 14px (items), 999px (pills)
- **Shadows**: Minimal, subtle shadows on cards

### Spacing
- Gap between sections: 24px
- Gap between items: 14px
- Card padding: 18-32px
- Container max-width: 1180px

---

## 9. USER FLOWS

### Flow 1: View Announcements
1. Student clicks "Announcements" in sidebar
2. Loads announcement page with featured card
3. Displays filtered list (default: All)
4. Can scroll/paginate through announcements
5. Featured card shows latest/pinned announcement

### Flow 2: Filter Announcements
1. Student clicks filter button (e.g., "Important")
2. List updates to show only that category
3. Featured card updates if available for that category
4. Stats update accordingly

### Flow 3: Pin Announcement
1. Student hovers over announcement card
2. Clicks pin/bookmark icon
3. Icon highlights (color changes to primary)
4. Item moves to top of list
5. Count in "Pinned" stat increases

### Flow 4: Mark as Read
1. Student clicks on announcement title/card
2. Opens announcement detail view (or modal)
3. Marks announcement as read in backend
4. Card styling changes (optional dimming)
5. Unread badge updates

---

## 10. ERROR HANDLING

### States to Handle
1. **Loading State**: Skeleton cards, spinner
2. **Empty State**: 
   - "No announcements yet" - if no data
   - "No announcements match filter" - if filter returns empty
3. **Error State**: 
   - "Failed to load announcements" with retry button
   - Network error handling
4. **Not Found**: Announcement deleted or no permission

---

## 11. ACCESSIBILITY

- Semantic HTML (nav, article, section)
- ARIA labels for buttons (pin/unpin)
- Keyboard navigation support
- Color not only indicator (use icons + text)
- Sufficient contrast ratios (WCAG AA)
- Alt text for images/icons

---

## 12. PERFORMANCE

- Lazy load announcements on scroll/pagination
- Cache announcements (5-10 min TTL)
- Optimize images (WebP, lazy loading)
- Debounce filter/search operations
- Virtual scrolling for large lists (optional)

---

## 13. SECURITY

- Validate user has permission to view announcement
- Sanitize user inputs (XSS prevention)
- Rate limit API endpoints
- Validate file uploads (if attachments feature)
- Audit trail for admin actions

---

## 14. INTEGRATIONS

### Notifications (Optional Future)
- Email notifications for important announcements
- Push notifications to mobile
- In-app notification badge

### Related Features
- Link announcements to courses/hackathons
- Attach documents/images
- Announcement scheduling (publish at specific time)
- Announcement expiration

---

## 15. TESTING REQUIREMENTS

### Unit Tests
- Filter logic
- Date formatting
- Pin/unpin toggle
- Read status update

### Integration Tests
- API endpoints
- Authentication/authorization
- Database operations

### E2E Tests
- Complete user flow (view → filter → pin)
- Responsive design across devices

---

## 16. IMPLEMENTATION PRIORITIES

### Phase 1 (MVP)
- [x] Frontend UI (already designed)
- [ ] Backend Model (Announcement.js)
- [ ] API endpoints (GET announcements)
- [ ] Display announcements
- [ ] Filter by category
- [ ] Pin/unpin functionality

### Phase 2 (Core Features)
- [ ] Create/Edit/Delete (Admin panel)
- [ ] Search functionality
- [ ] Pagination
- [ ] Read status tracking
- [ ] Responsive improvements

### Phase 3 (Enhancements)
- [ ] Email notifications
- [ ] Scheduling announcements
- [ ] File attachments
- [ ] Rich text editor
- [ ] Analytics/stats

---

## 17. FILE STRUCTURE

```
backend/
  models/
    Announcement.js          (NEW)
  routes/
    announcements.js         (NEW)
  controllers/
    announcementController.js (NEW)

frontend/
  src/
    pages/
      Announcement.jsx       (REFACTOR - use real API)
    components/
      AnnouncementCard.jsx   (NEW - extract component)
      AnnouncementFilters.jsx (NEW - extract component)
    services/
      announcementService.js (NEW - API calls)
```

---

## 18. DEPENDENCIES (Frontend)

- **date-fns** or **dayjs**: Date formatting
- **axios**: HTTP requests
- **lucide-react**: Icons
- **react-router-dom**: Navigation

---

## 19. FUTURE ENHANCEMENTS

1. Announcement templates
2. A/B testing announcements
3. Announcement analytics dashboard
4. Recurring announcements
5. Multi-language support
6. Announcement versioning
7. Comment/Discussion on announcements
8. Archive old announcements
9. Announcement workflows (draft → review → publish)
10. Integration with calendar/deadlines
