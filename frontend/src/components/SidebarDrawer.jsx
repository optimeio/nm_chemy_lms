import { useState } from 'react';
import '../styles/SidebarDrawer.css';

export default function SidebarDrawer({ children, onNavigate, currentPage = 'hackathon' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState(currentPage);

  const handleOpenSidebar = () => {
    setIsOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsOpen(false);
  };

  const handleNavItemClick = (page) => {
    setActivePage(page);
    if (onNavigate) {
      onNavigate(page);
    }
    handleCloseSidebar();
  };

  const handleSignOut = () => {
    // Handle sign out logic here
    console.log('Signing out...');
    // You can add navigation or auth logic here
  };

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'courses', label: '📖 My Courses' },
    { id: 'live', label: '🎥 Live Classes' },
    { id: 'hackathon', label: '🏆 Hackathon' },
    { id: 'certs', label: '🎓 Certificates' },
  ];

  return (
    <div className={`app ${isOpen ? 'open' : ''}`}>
      <div className="backdrop" onClick={handleCloseSidebar}></div>

      <div className="sidebar">
        <div className="brand-row">
          <div className="brand">🧪 Chemy</div>
          <button className="close-btn" onClick={handleCloseSidebar}>✕</button>
        </div>
        <div className="nav-label">Main menu</div>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavItemClick(item.id)}
          >
            {item.label}
          </div>
        ))}
        <div className="sign-out" onClick={handleSignOut}>↪ Sign Out</div>
      </div>

      <div className="topbar">
        <div className="hamburger" onClick={handleOpenSidebar}>☰</div>
        <div className="brand">Chemy</div>
      </div>

      <div className="content">
        {children}
      </div>
    </div>
  );
}
