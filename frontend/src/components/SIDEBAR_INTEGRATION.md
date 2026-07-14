# SidebarDrawer Component - Integration Guide

## ✅ What Was Converted

The mobile drawer sidebar from your HTML mockup has been converted to a fully functional React component with:

- **State Management**: Uses `useState` hook for open/close sidebar state and active page tracking
- **Event Handling**: Hamburger menu, close button, backdrop click, and navigation item click handlers
- **CSS Styling**: Complete styling with animations, responsive design, and hover effects
- **Navigation**: Built-in navigation items with active state highlighting
- **Sign Out**: Integrated sign-out button with handler

## 📁 Files Created

1. **`frontend/src/components/SidebarDrawer.jsx`** - Main React component
2. **`frontend/src/styles/SidebarDrawer.css`** - All styling (identical to original HTML)
3. **`frontend/src/pages/HackathonWithSidebar.jsx`** - Example integration file

## 🚀 How to Use

### Option 1: Wrap Individual Pages

```jsx
import SidebarDrawer from '../components/SidebarDrawer';
import YourPage from './YourPage';
import { useState } from 'react';

export default function PageWithSidebar() {
  const [currentPage, setCurrentPage] = useState('hackathon');

  return (
    <SidebarDrawer 
      onNavigate={setCurrentPage} 
      currentPage={currentPage}
    >
      <YourPage />
    </SidebarDrawer>
  );
}
```

### Option 2: Create a Layout Wrapper

```jsx
import SidebarDrawer from '../components/SidebarDrawer';

export default function MainLayout({ children }) {
  return (
    <SidebarDrawer>
      {children}
    </SidebarDrawer>
  );
}
```

Then use it in your App.jsx:
```jsx
<MainLayout>
  <YourPage />
</MainLayout>
```

## 🎯 Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Page content to display |
| `onNavigate` | function | - | Callback when nav item is clicked: `(page) => {}` |
| `currentPage` | string | 'hackathon' | Active page identifier |

## 🎨 Features

✓ Mobile-first responsive design
✓ Smooth slide-in/slide-out animations
✓ Semi-transparent backdrop with click-to-close
✓ Active state highlighting for current page
✓ Hamburger menu + close button
✓ Sign Out button with handler
✓ All UI details from mockup preserved
✓ No errors or breaking changes

## 📝 Navigation Items

Pre-configured navigation items:
- 📊 Dashboard
- 📖 My Courses
- 🎥 Live Classes
- 🏆 Hackathon
- 🎓 Certificates

To modify, edit the `navItems` array in `SidebarDrawer.jsx`

## 🔄 Event Handlers

All handlers can be extended:
- **`handleOpenSidebar()`** - Opens drawer
- **`handleCloseSidebar()`** - Closes drawer
- **`handleNavItemClick(page)`** - Navigation logic
- **`handleSignOut()`** - Sign out logic (add your auth code here)

## 💡 Integration Tips

1. Import the CSS file wherever you use SidebarDrawer
2. The component uses 100% viewport height - works great as a page wrapper
3. Content automatically scrolls if it exceeds available height
4. Active page state persists within the component - use props for global state if needed
5. Customize nav items and icons as needed

## 🎯 Next Steps

1. Test by importing `HackathonWithSidebar` in your App.jsx
2. Customize navigation items based on your actual pages
3. Add your routing logic in the `onNavigate` callback
4. Update the `handleSignOut()` function with your auth logic
