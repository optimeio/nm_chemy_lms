import SidebarDrawer from '../components/SidebarDrawer';
import Hackathon from './Hackathon';
import { useState } from 'react';

/**
 * EXAMPLE: How to use SidebarDrawer with your pages
 * 
 * You can either:
 * 1. Wrap individual pages like this example
 * 2. Or create a main layout wrapper that all pages use
 * 
 * Replace this with your actual page component
 */

export default function HackathonWithSidebar() {
  const [currentPage, setCurrentPage] = useState('hackathon');

  const handleNavigate = (page) => {
    setCurrentPage(page);
    // Here you can add logic to navigate to different pages
    console.log('Navigating to:', page);
    
    // Example: You could use react-router or your own navigation logic
    // navigate(`/${page}`);
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        // import StudentDashboard from './StudentDashboard';
        // return <StudentDashboard />;
        return <div className="p-8">Dashboard content goes here</div>;
      
      case 'courses':
        // import Courses from './Courses';
        // return <Courses />;
        return <div className="p-8">Courses content goes here</div>;
      
      case 'live':
        return <div className="p-8">Live Classes content goes here</div>;
      
      case 'hackathon':
        return <Hackathon />;
      
      case 'certs':
        // import Certificates from './Certificates';
        // return <Certificates />;
        return <div className="p-8">Certificates content goes here</div>;
      
      default:
        return <Hackathon />;
    }
  };

  return (
    <SidebarDrawer onNavigate={handleNavigate} currentPage={currentPage}>
      {renderPageContent()}
    </SidebarDrawer>
  );
}
