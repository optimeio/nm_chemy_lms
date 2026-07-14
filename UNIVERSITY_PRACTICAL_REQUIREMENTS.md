# Student Portal - University Practical Examination

## Page Requirements

### Header Section
- **Page Label:** "Student Portal" (xs tracking-wider, uppercase, indigo-400, semibold)
- **Title:** "University Practical Examination" (3xl/4xl responsive, bold, white, Playfair Display serif)
- **Description:** "Schedules, venues and results for your practical examinations." (gray-400, sm/base responsive)
- **Back Button:** Hidden on mobile, visible on md+, text-gray-400 hover:text-white (Back arrow + text)

### Summary Bar
- **Label:** "Records" 
- **Value:** "12" (displayed in semibold white)
- **Style:** Rounded-xl, px-4 py-2.5, text-sm gray-300, rgba(17,24,39,0.7) background with indigo border, blur backdrop

### Records Table
**Columns:**
1. Days
2. Date
3. Time
4. Venue
5. Actions (right-aligned)

**Header Style:**
- Border-bottom, border-white/10
- Uppercase, text-xs, tracking-wider
- Font-semibold, text-gray-400

**Row Data (12 Total):**

| Day | Date | Time | Venue |
|-----|------|------|-------|
| Day 1 | 18 Jul 2026 | 10:00 AM | Lab Block A - 204 |
| Day 2 | 20 Jul 2026 | 01:30 PM | CS Lab 3 |
| Day 3 | 22 Jul 2026 | 09:00 AM | Analytics Lab |
| Day 4 | 25 Jul 2026 | 11:00 AM | Lab Block B - 101 |
| Day 5 | 05 Jul 2026 | 10:00 AM | Lab Block A - 204 |
| Day 6 | 03 Jul 2026 | 02:00 PM | CS Lab 1 |
| Day 7 | 28 Jun 2026 | 09:30 AM | CS Lab 2 |
| Day 8 | 27 Jul 2026 | 10:00 AM | AI Research Lab |
| Day 9 | 30 Jul 2026 | 01:00 PM | Lab Block A - 301 |
| Day 10 | 01 Aug 2026 | 10:30 AM | Seminar Hall 2 |
| Day 11 | 22 Jun 2026 | 11:00 AM | Cloud Lab |
| Day 12 | 04 Aug 2026 | 09:00 AM | Lab Block B - 202 |

**Row Styling:**
- Divide-y divide-white/5
- Hover: rgba(99,102,241,0.06) background
- Text-white font-medium for day
- Text-gray-300 for date, time, venue

**Actions Per Row:**
1. **View Button**
   - Color: #93c5fd
   - Background: rgba(59,130,246,0.1)
   - Border: 1px solid rgba(59,130,246,0.3)
   - Icon: Eye icon (SVG)
   - Text: "View"

2. **Download Button**
   - Color: #d1d5db
   - Background: rgba(255,255,255,0.05)
   - Border: 1px solid rgba(255,255,255,0.1)
   - Icon: Download arrow (SVG)
   - Text: "Download"

**Common Button Styling:**
- px-3 py-1.5
- rounded-lg
- text-xs font-medium
- transition effect
- inline-flex items-center gap-1.5

### Pagination Section
**Info Text:**
- "Showing {start + 1}–{end} of {total} records"
- Text-xs, text-gray-500
- Left aligned

**Page Controls (Right aligned):**

**Previous Button:**
- Width/Height: 8 (w-8 h-8)
- rounded-lg
- Flex center
- text-gray-400
- hover:bg-white/5
- disabled:opacity-30 disabled:cursor-not-allowed
- Left arrow SVG icon

**Page Numbers:**
- Loop through all page numbers
- Active page: gradient(135deg, #2A4BD9 0%, #4338CA 100%), white text
- Inactive page: color gray-400, hover:bg-white/5
- w-8 h-8, rounded-lg, text-sm, font-medium, transition

**Next Button:**
- Same as Previous but right arrow
- Right arrow SVG icon

### Color Scheme
- **Background:** #0B0F1A (dark navy/black)
- **Table Background:** rgba(17,24,39,0.7) with blur
- **Primary Accent:** #2A4BD9 / #4338CA (indigo/blue gradient)
- **Text Primary:** white
- **Text Secondary:** text-gray-400, text-gray-300
- **Borders:** rgba(99,102,241,0.15), white/10
- **Hover State:** rgba(99,102,241,0.06)

### Typography
- **Header Title:** Playfair Display serif, bold
- **Tables:** text-sm text-left
- **Button Text:** text-xs font-medium

### Layout
- **Container:** max-w-6xl mx-auto
- **Padding:** px-4 py-10 md:px-10 (responsive)
- **Min Height:** min-h-screen
- **Gap Sizes:** gap-3, gap-1.5, gap-2

### Responsive Design
- **Mobile:** Hidden back button, px-4
- **Tablet+:** Visible back button, px-10
- **Title Size:** text-3xl md:text-4xl
- **Description Size:** text-sm md:text-base

### Interactive Elements
- Back button: Hover state color change (gray-400 → white)
- Pagination buttons: Hover with rgba(255,255,255,0.05) background
- Table rows: Hover with rgba(99,102,241,0.06) background
- All with smooth transition

### Icon Requirements
1. **Eye Icon** (View button) - 14x14
2. **Download Icon** (Download button) - 14x14
3. **Back Arrow** (Back button) - 16x16
4. **Left Chevron** (Previous pagination) - 14x14
5. **Right Chevron** (Next pagination) - 14x14

---

## Technical Details

### State Management
- `currentPage` - tracks current pagination page (useState(1))
- `records` - array of 12 examination records
- `pageSize` - set to 5 records per page
- `totalPages` - calculated from records.length / pageSize
- `start` - calculated start index for current page
- `pageRecords` - sliced records for current page

### Functions
- `goTo(page)` - Navigate to specific page with bounds checking
- `IconBtn({ type })` - Reusable button component for View/Download actions

### Pagination Math
- Total Pages = Math.ceil(12 / 5) = 3 pages
- Page 1: Shows records 1-5
- Page 2: Shows records 6-10
- Page 3: Shows records 11-12

---

## Content Summary

**Purpose:** Display university practical examination schedules for students

**Total Records:** 12 examination days

**Fields Displayed:**
- Day (Day 1-12)
- Date (dates in Jul-Aug 2026 range)
- Time (morning to afternoon times)
- Venue (various lab locations)

**Allowed Actions:**
- View examination details
- Download examination materials
- Navigate between pages
- Return to previous page

---

## Accessibility Features
- Disabled state for pagination buttons at boundaries
- Text descriptions for all buttons
- Semantic HTML structure
- Clear visual hierarchy
- Good color contrast (white on dark background)

---

## Performance Considerations
- Pagination limits table display to 5 records at a time
- SVG icons inline (optimized)
- CSS gradients for styling
- Backdrop blur effect for modern look
- Smooth transitions for interactions
