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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleHackathonClick = () => {
    navigate('/dashboard/student/hackathon');
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-x-hidden">
      {sidebarOpen && isMobile && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside className={`fixed z-40 inset-y-0 left-0 w-72 max-w-[80vw] bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 md:max-w-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#0B3D91] to-indigo-500" />
            <div>
              <div className="text-gray-900 text-lg font-semibold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
                Chemy
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-[0.24em] mt-0.5">Student Panel</div>
            </div>
          </div>
          <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 text-[11px] tracking-widest text-gray-500 uppercase">Main Menu</div>

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
                  background: active ? '#EFF6FF' : 'transparent',
                  cursor: 'pointer',
                  color: active ? '#0B3D91' : '#6B7280',
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  lineHeight: 1.2,
                  borderRadius: 8,
                  paddingLeft: 8,
                }}
              >
                <div style={{ width: 6, height: 36, background: active ? '#0B3D91' : 'transparent', borderRadius: 6, marginRight: 8 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    background: active ? '#EFF6FF' : '#F3F4F6',
                    color: active ? '#0B3D91' : '#6B7280',
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
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={isMobile ? {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px',
          gap: 14,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(244,245,247,0.92) 100%)',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          borderBottom: '1px solid rgba(148,163,184,0.18)',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#0F172A',
        } : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          padding: '16px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #E5E7EB',
          color: '#0B1224',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(15, 23, 42, 0.04)',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              width: 44,
              height: 44,
              borderRadius: 16,
              display: isMobile ? 'inline-flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
            }}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }} />

          <button
            type="button"
            style={{
              position: 'relative',
              width: 44,
              height: 44,
              borderRadius: 16,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'rgba(255,255,255,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 16,
              height: 16,
              borderRadius: '9999px',
              background: '#2563EB',
              color: 'white',
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
            }}>
              3
            </span>
          </button>

          <div style={{ width: 44, height: 44, borderRadius: 16, background: 'linear-gradient(135deg, #4A6DFF 0%, #2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 35px rgba(37, 99, 235, 0.18)', cursor: 'pointer' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{userInitial}</span>
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
