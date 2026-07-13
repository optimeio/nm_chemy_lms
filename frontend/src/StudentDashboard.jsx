import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, LayoutDashboard, BookOpen, Video, FileText, Award, Trophy, Bell, MessageCircle, User } from 'lucide-react';
import BrandLogo from './components/BrandLogo';
import Hackathon from './pages/Hackathon';
import Announcement from './pages/Announcement';
import Feedback from './pages/Feedback';
import Certificates from './pages/Certificates';
import UniversityPractical from './pages/UniversityPractical';
import Profile from './pages/Profile';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'My Courses', icon: BookOpen },
  { id: 'live-classes', label: 'Live Classes', icon: Video },
  { id: 'assignments', label: 'Assignments / Quiz', icon: FileText },
  { id: 'announcement', label: 'Announcement', icon: Bell },
  { id: 'university-practical', label: 'University Practical Examination', icon: FileText },
  { id: 'hackathon', label: 'Hackathon', icon: Trophy },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userInitial, setUserInitial] = useState('D');
  const [studentData, setStudentData] = useState({
    fullName: '',
    email: '',
    collegeName: '',
    institution: '',
    collegeCode: '',
    registerNo: '',
    department: '',
    year: '',
    district: '',
  });

  useEffect(() => {
    // Try to load student data from backend profile if a real token is present.
    const token = localStorage.getItem('authToken');
    const isDemo = token === 'demo-token';
    if (token && !isDemo) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setStudentData(data);
            if (data.fullName) setUserInitial(data.fullName.trim()[0].toUpperCase());
          }
        })
        .catch(() => {});
    } else {
      // demo token or no token -> fall back to localStorage-stored studentData
      const stored = localStorage.getItem('studentData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setStudentData(parsed);
        if (parsed.fullName) {
          setUserInitial(parsed.fullName.trim()[0].toUpperCase());
        }
      } else {
        // Derive minimal profile from userEmail if available
        const email = localStorage.getItem('userEmail');
        if (email) {
          const namePart = email.split('@')[0] || 'student';
          const fullName = namePart.split(/[._-]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          const derived = {
            fullName,
            email,
            collegeName: 'N/A',
            institution: 'N/A',
            collegeCode: 'N/A',
            registerNo: 'N/A',
            department: 'N/A',
            year: 'N/A',
            district: 'N/A',
            fatherName: 'N/A',
            gender: 'N/A',
          };
          setStudentData(derived);
          setUserInitial(fullName.trim()[0].toUpperCase());
        }
      }
    }

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleMenuClick = (menuId) => {
    if (menuId === 'dashboard') {
      navigate('/dashboard/student');
    } else {
      navigate(`/dashboard/student/${menuId}`);
    }
  };

  const handleHackathonClick = () => {
    navigate('/dashboard/student/hackathon');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9FAFB' }}>
      <div style={{
        width: sidebarOpen ? 240 : 0,
        minWidth: sidebarOpen ? 240 : 0,
        background: 'white',
        borderRight: sidebarOpen ? '1px solid #E5E7EB' : 'none',
        transition: 'width 0.3s, min-width 0.3s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'absolute' : 'relative',
        zIndex: isMobile ? 20 : 'auto',
        height: isMobile ? '100vh' : 'auto',
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <BrandLogo size="sm" />
        </div>

        <div style={{ padding: '16px 20px 12px', fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Main Menu
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const targetPath = item.id === 'dashboard' ? '/dashboard/student' : `/dashboard/student/${item.id}`;
            const active = location.pathname === targetPath;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  background: active ? '#FFFFFF' : 'transparent',
                  cursor: 'pointer',
                  color: active ? '#1D4ED8' : '#6B7280',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  lineHeight: 1.2,
                  borderRadius: 8,
                  paddingLeft: 8,
                }}
              >
                <div style={{ width: 6, height: 36, background: active ? '#2563EB' : 'transparent', borderRadius: 6, marginRight: 8 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    background: active ? '#EFF6FF' : '#F3F4F6',
                    color: active ? '#2563EB' : '#6B7280',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ display: 'block' }}>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#DC2626',
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 6,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: isMobile && sidebarOpen ? 240 : 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: isMobile ? '16px' : '16px 32px',
          background: 'white',
          borderBottom: '1px solid #E5E7EB',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
            }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div style={{
            width: 40,
            height: 40,
            background: '#EC4899',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
            marginTop: isMobile ? 8 : 0,
          }}>
            {userInitial}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 32 }}>
          {location.pathname === '/dashboard/student/hackathon' ? (
            <Hackathon />
          ) : location.pathname === '/dashboard/student/announcement' ? (
            <Announcement />
          ) : location.pathname === '/dashboard/student/feedback' ? (
            <Feedback />
          ) : location.pathname === '/dashboard/student/certificates' ? (
            <Certificates />
          ) : location.pathname === '/dashboard/student/university-practical' ? (
            <UniversityPractical />
          ) : location.pathname === '/dashboard/student/profile' ? (
            <Profile />
          ) : (
            <>
              <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1F2937', margin: '0 0 8px 0' }}>Learning Dashboard</h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Empowering your technical journey in IoT & EV Engineering</p>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: 20,
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56,
                height: 56,
                background: '#2563EB',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 24,
              }}>
                📖
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', margin: 0 }}>Fermion Mirror LMS</h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0 0' }}>Access your courses on the high-performance secondary portal.</p>
              </div>
            </div>
            <button style={{
              padding: '5px 14px',
              background: '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              Start Course / Open LMS →
            </button>
          </div>

          {/* Fermion LMS stats row (matches provided screenshot) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, flex: 1 }}>
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📘</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>0</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginTop: 4 }}>Enrolled Courses</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏆</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>0</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginTop: 4 }}>Completed</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F3F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎥</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>0%</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', marginTop: 4 }}>Avg. Progress</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ width: 260 }}>
              <input placeholder="Filter courses..." style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#FFFFFF' }} />
            </div>
          </div>

          {/* Current Progress block */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937', margin: '0 0 12px 0' }}>Current Progress</h2>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '48px 32px', textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>Your course list is currently empty.</p>
              <p style={{ fontSize: 12, color: '#9CA3AF' }}>Explore the catalog to start your technical training.</p>
            </div>
          </div>

          <div style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: isMobile ? 16 : 24,
            marginBottom: 32,
          }}>
            <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Account Details</div>
                <div style={{ 
                  fontSize: 12, 
                  fontWeight: 700, 
                  color: (localStorage.getItem('userRole') || 'student') === 'trainer' ? '#7C3AED' : '#2563EB', 
                  background: (localStorage.getItem('userRole') || 'student') === 'trainer' ? '#F5F3FF' : '#EFF6FF', 
                  padding: '6px 10px', 
                  borderRadius: 999,
                  textTransform: 'uppercase'
                }}>
                  {localStorage.getItem('userRole') || 'student'} ACCOUNT
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Full Name</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{studentData.fullName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Email Address</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{studentData.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Institutional Affiliation</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{studentData.institution || studentData.collegeName || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Access Level</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{localStorage.getItem('userRole') || 'student'}</div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
