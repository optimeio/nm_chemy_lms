import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  Send,
  Sparkles,
  Search,
  Check,
  Calendar,
  Lock,
  Mail,
  Sliders,
  CornerDownRight,
  MessageCircle,
  Users2,
  ClipboardList,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import AdminPracticalExamination from './AdminPracticalExamination';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hackathons', label: 'Hackathon Manager', icon: FileText },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'courses', label: 'Course Management', icon: BookOpen },
  { id: 'live-learning', label: 'Live Learning', icon: Video },
  { id: 'university-practical', label: 'University Practical', icon: ClipboardList },
  { id: 'feedback', label: 'Student Feedback', icon: Mail },
  { id: 'settings', label: 'Portal Settings', icon: Settings },
];

export default function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [adminName, setAdminName] = useState('theoptime.io@gmail.com');
  
  // Dashboard & global stats
  const [dbStats, setDbStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    liveSessions: 0,
    hackathons: 0
  });

  // Hackathon Image Gallery
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  // USER MANAGEMENT
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserRole, setEditingUserRole] = useState('student');

  // COURSE MANAGEMENT
  const [coursesList, setCoursesList] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDept, setCourseDept] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  // LIVE SESSIONS
  const [sessionsList, setSessionsList] = useState([]);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTrainer, setSessionTrainer] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionLink, setSessionLink] = useState('');

  // HACKATHON CONFIG
  const [hackathonsList, setHackathonsList] = useState([]);
  const [hackTitle, setHackTitle] = useState('');
  const [hackEdition, setHackEdition] = useState('Naan Mudhalvan · 2026 Edition');
  const [hackDesc, setHackDesc] = useState('');
  const [hackDate, setHackDate] = useState('2026-07-18T09:00');
  const [hackVenue, setHackVenue] = useState('Chemy Innovation Campus, Chennai');
  const [hackStatTeams, setHackStatTeams] = useState('128');
  const [hackStatPrize, setHackStatPrize] = useState('₹2,00,000');
  const [hackStatDuration, setHackStatDuration] = useState('48 Hrs');
  const [hackStatMentors, setHackStatMentors] = useState('24');
  const [hackTimeline, setHackTimeline] = useState([]);
  const [targetCollege, setTargetCollege] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [targetStudentEmail, setTargetStudentEmail] = useState('');
  const [targetTrainerEmail, setTargetTrainerEmail] = useState('');
  const [hackPublished, setHackPublished] = useState(true);

  // FEEDBACK
  const [feedbackEntries, setFeedbackEntries] = useState(null);
  const [feedbackFilter, setFeedbackFilter] = useState('all');
  const [feedbackDrafts, setFeedbackDrafts] = useState({});
  const [feedbackSendingId, setFeedbackSendingId] = useState(null);
  const [feedbackError, setFeedbackError] = useState('');

  // Settings
  const [settingsBrand, setSettingsBrand] = useState('Chemy LMS');
  const [settingsSupport, setSettingsSupport] = useState('support@chemy.lms');
  const [settingsNotify, setSettingsNotify] = useState('New semesters launch tomorrow!');

  const [notifMessage, setNotifMessage] = useState('');

  // Auto sizing & authentication check
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (storedEmail) {
      setAdminName(storedEmail);
    }

    if (role !== 'admin') {
      navigate('/login');
      return;
    }

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync / Load data on Tab Change
  useEffect(() => {
    loadAllData();
    if (activeTab === 'feedback') {
      loadFeedback();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const uRes = await fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const users = uRes.ok ? await uRes.json() : [];
      setUsersList(users);

      const cRes = await fetch('/api/lms/courses');
      const courses = cRes.ok ? await cRes.json() : [];
      setCoursesList(courses);

      const sRes = await fetch('/api/lms/live-sessions');
      const sessions = sRes.ok ? await sRes.json() : [];
      setSessionsList(sessions);

      const hRes = await fetch('/api/hackathon/all', { headers: { 'Authorization': `Bearer ${token}` } });
      const hacks = hRes.ok ? await hRes.json() : [];
      setHackathonsList(hacks);

      setDbStats({
        totalUsers: users.length,
        activeCourses: courses.length,
        liveSessions: sessions.length,
        hackathons: hacks.length
      });

    } catch (e) {
      console.error('Data load failed', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const loadFeedback = async () => {
    setFeedbackError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/announcements/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.entries || []);
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeedbackEntries(items);
      } else {
        setFeedbackEntries([]);
      }
    } catch (e) {
      console.error('Feedback load failed', e);
      setFeedbackEntries([]);
    }
  };

  const sendFeedbackReply = async (entry) => {
    const replyText = (feedbackDrafts[entry._id] || '').trim();
    if (!replyText) return;
    setFeedbackSendingId(entry._id);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/announcements/feedback/${entry._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminReply: replyText })
      });
      if (res.ok) {
        const updated = await res.json();
        setFeedbackEntries((prev) => prev.map((e) => (e._id === entry._id ? updated : e)));
        setFeedbackDrafts((prev) => ({ ...prev, [entry._id]: '' }));
      } else {
        setFeedbackError('Failed to send reply.');
      }
    } catch (e) {
      setFeedbackError('Network error while sending reply.');
      console.error(e);
    } finally {
      setFeedbackSendingId(null);
    }
  };

  const handleFileSelection = (event) => {
    setSelectedFiles(Array.from(event.target.files || []).slice(0, 5));
  };

  const handleHackathonUpload = async () => {
    setUploadMessage('');
    setUploadError('');
    if (selectedFiles.length === 0) {
      setUploadError('Please select images first.');
      return;
    }
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('images', file));

    setUploading(true);
    try {
      const res = await fetch('/api/hackathon/images', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setUploadMessage('Images successfully uploaded to hackathon slider.');
        setSelectedFiles([]);
      } else {
        setUploadError('Failed to upload.');
      }
    } catch (e) {
      setUploadError('Network error.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateUserRole = async (userId) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: editingUserRole })
      });
      if (res.ok) {
        setEditingUserId(null);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle.trim() || !courseCode.trim()) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/lms/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          title: courseTitle,
          code: courseCode,
          department: courseDept || 'General Engineering',
          description: courseDesc
        })
      });
      if (res.ok) {
        setCourseTitle('');
        setCourseCode('');
        setCourseDept('');
        setCourseDesc('');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Delete this course?')) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/lms/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sessionTitle.trim() || !sessionTrainer.trim()) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/lms/live-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: sessionTitle,
          trainer: sessionTrainer,
          date: sessionDate || '2026-07-10',
          time: sessionTime || '10:00 AM',
          link: sessionLink,
          topic: sessionTopic
        })
      });
      if (res.ok) {
        setSessionTitle('');
        setSessionTrainer('');
        setSessionDate('');
        setSessionTime('');
        setSessionTopic('');
        setSessionLink('');
        loadAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (sessId) => {
    if (!confirm('Cancel this scheduled session?')) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/lms/live-sessions/${sessId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePublishHackathon = async (e) => {
    e.preventDefault();
    if (!hackTitle.trim()) return;
    const token = localStorage.getItem('authToken');
    const payload = {
      title: hackTitle,
      edition: hackEdition,
      description: hackDesc,
      eventDate: new Date(hackDate),
      venue: hackVenue,
      stats: [
        { label: 'Teams Registered', value: hackStatTeams },
        { label: 'Prize Pool', value: hackStatPrize },
        { label: 'Duration', value: hackStatDuration },
        { label: 'Expert Mentors', value: hackStatMentors }
      ],
      timeline: hackTimeline,
      targetCollege,
      targetDepartment: targetDept,
      targetStudentEmail,
      targetTrainerEmail,
      published: hackPublished
    };

    try {
      const res = await fetch('/api/hackathon/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setHackTitle('');
        setHackDesc('');
        setTargetCollege('');
        setTargetDept('');
        setTargetStudentEmail('');
        setTargetTrainerEmail('');
        loadAllData();
        setNotifMessage('Hackathon targeted and published successfully!');
        setTimeout(() => setNotifMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHack = async (id) => {
    if (!confirm('Remove this hackathon?')) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/hackathon/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative flex h-screen bg-slate-50 overflow-hidden font-sans">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-10 bg-black/40"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <div 
        className="bg-white border-r border-slate-200 transition-transform duration-300 flex flex-col z-20"
        style={{
          width: 260,
          minWidth: 260,
          position: isMobile ? 'fixed' : 'relative',
          height: '100%',
          top: 0,
          left: 0,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: isMobile ? '2px 0 20px rgba(15, 23, 42, 0.12)' : 'none',
        }}
      >
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#0B3D91] to-indigo-500" />
            <span className="text-gray-900 text-lg font-semibold tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
              Chemy
            </span>
          </div>
          <div className="mt-2 text-xs font-bold text-blue-600 tracking-widest uppercase">Admin Panel</div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 transition sm:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900">Administrator</span>
              <span className="text-[10px] text-slate-400 font-mono">{adminName}</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200">
              A
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left">Dashboard Overview</h1>
                <p className="text-sm text-slate-500 mt-1 text-left font-semibold">Real-time status metrics of Chemy LMS portal operations.</p>
              </div>

              <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Active Users', value: dbStats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Enrolled Courses', value: dbStats.activeCourses, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Live Classes', value: dbStats.liveSessions, icon: Video, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Hackathons', value: dbStats.hackathons, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 text-left">Slide Showcase Images</h3>
                  <p className="text-xs text-slate-500 text-left font-semibold mt-1">Upload pictures to update the student showcase slideshow.</p>
                </div>
                <div className="max-w-md space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelection}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">{selectedFiles.length} files selected</span>
                    <button
                      type="button"
                      onClick={handleHackathonUpload}
                      disabled={uploading}
                      className="px-5 py-2 text-xs font-bold text-white bg-slate-950 rounded-xl hover:bg-slate-800 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </button>
                  </div>
                  {uploadMessage && <p className="text-xs text-emerald-600 font-bold mt-1 text-left">{uploadMessage}</p>}
                  {uploadError && <p className="text-xs text-rose-600 font-bold mt-1 text-left">{uploadError}</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hackathons' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left">Hackathon Manager</h1>
                <p className="text-sm text-slate-500 mt-1 text-left font-semibold">Assign hackathons targeting specific colleges, departments, trainers, or students.</p>
              </div>

              {notifMessage && <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold rounded-xl">{notifMessage}</div>}

              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 text-left flex items-center gap-2">
                    <Sparkles className="text-blue-600" size={20} /> Publish Assigned Hackathon
                  </h3>

                  <form onSubmit={handlePublishHackathon} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1 text-left">Hackathon Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. EV Design Sprint 2026" 
                        value={hackTitle} 
                        onChange={(e) => setHackTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1 text-left">Edition</label>
                        <input 
                          type="text" 
                          value={hackEdition} 
                          onChange={(e) => setHackEdition(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1 text-left">Launch Date</label>
                        <input 
                          type="datetime-local" 
                          value={hackDate} 
                          onChange={(e) => setHackDate(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1 text-left">Description</label>
                      <textarea 
                        rows="3" 
                        placeholder="State problem statements and guidelines..." 
                        value={hackDesc} 
                        onChange={(e) => setHackDesc(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase text-left">Assignment Targeting Filters</label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-left">Target College</label>
                          <select 
                            value={targetCollege} 
                            onChange={(e) => setTargetCollege(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                          >
                            <option value="">All Colleges (Public)</option>
                            {Array.from(new Set(usersList.map(u => u.institution).filter(Boolean))).map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-left">Target Department</label>
                          <select 
                            value={targetDept} 
                            onChange={(e) => setTargetDept(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                          >
                            <option value="">All Departments (Public)</option>
                            {Array.from(new Set(usersList.map(u => u.department).filter(Boolean))).map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-left">Specific Student Email</label>
                          <select 
                            value={targetStudentEmail} 
                            onChange={(e) => setTargetStudentEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                          >
                            <option value="">All Students (Public)</option>
                            {usersList.filter(u => u.role === 'student' || !u.role).map(u => (
                              <option key={u.email} value={u.email}>{u.fullName} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-left">Specific Trainer Email</label>
                          <select 
                            value={targetTrainerEmail} 
                            onChange={(e) => setTargetTrainerEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                          >
                            <option value="">All Trainers (Public)</option>
                            {usersList.filter(u => u.role === 'trainer').map(u => (
                              <option key={u.email} value={u.email}>{u.fullName} ({u.email})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md"
                    >
                      Publish Targeted Hackathon
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 text-left">Published Allocations</h3>
                  <div className="space-y-3">
                    {hackathonsList.map((h) => (
                      <div key={h._id} className="p-3 border border-slate-100 rounded-2xl text-left space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-950">{h.title}</h4>
                            <p className="text-[10px] text-slate-400">{h.edition}</p>
                          </div>
                          <button onClick={() => handleDeleteHack(h._id)} className="text-rose-500 hover:text-rose-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[9px] text-slate-500 font-mono">
                          {h.targetCollege && <span className="bg-slate-100 px-1 rounded">College: {h.targetCollege}</span>}
                          {h.targetDepartment && <span className="bg-slate-100 px-1 rounded">Dept: {h.targetDepartment}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left">User Management</h1>
                <p className="text-sm text-slate-500 mt-1 text-left font-semibold font-sans">View, modify access levels, or delete user accounts inside LMS.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-200">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Institution</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Access Level</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {usersList
                        .filter(u => u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                        .map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/50">
                            <td className="p-4 font-bold text-slate-900">{u.fullName}</td>
                            <td className="p-4 font-mono text-slate-500">{u.email}</td>
                            <td className="p-4">{u.institution || 'N/A'}</td>
                            <td className="p-4">{u.department || 'N/A'}</td>
                            <td className="p-4">
                              {editingUserId === u._id ? (
                                <div className="flex items-center gap-1.5">
                                  <select 
                                    value={editingUserRole} 
                                    onChange={(e) => setEditingUserRole(e.target.value)}
                                    className="p-1 border border-slate-200 rounded"
                                  >
                                    <option value="student">student</option>
                                    <option value="trainer">trainer</option>
                                    <option value="admin">admin</option>
                                  </select>
                                  <button onClick={() => handleUpdateUserRole(u._id)} className="p-1 text-emerald-600">
                                    <Check size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                                  u.role === 'admin' ? 'bg-blue-50 text-blue-700' : u.role === 'trainer' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {u.role || 'student'}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingUserId(u._id);
                                  setEditingUserRole(u.role || 'student');
                                }} 
                                className="p-1 text-slate-400 hover:text-slate-800"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteUser(u._id)} className="p-1 text-rose-500 hover:text-rose-700">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left">Course Management</h1>
                <p className="text-sm text-slate-500 mt-1 text-left font-semibold">Publish curricula, codebases, and subject material to respective departments.</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 text-left">Add New Course</h3>
                  <form onSubmit={handleCreateCourse} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Course Title</label>
                      <input 
                        type="text" 
                        value={courseTitle} 
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Course Code</label>
                      <input 
                        type="text" 
                        value={courseCode} 
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
                      <input 
                        type="text" 
                        value={courseDept} 
                        onChange={(e) => setCourseDept(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                      <textarea 
                        rows="3"
                        value={courseDesc} 
                        onChange={(e) => setCourseDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800">
                      Publish Course
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 text-left">Active Course Registry</h3>
                  <div className="space-y-3">
                    {coursesList.map((course) => (
                      <div key={course._id} className="p-4 border border-slate-100 rounded-2xl text-left flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{course.code}</span>
                            <h4 className="text-sm font-bold text-slate-950">{course.title}</h4>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{course.department}</p>
                        </div>
                        <button onClick={() => handleDeleteCourse(course._id)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'live-learning' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left">Live Learning Classes</h1>
                <p className="text-sm text-slate-500 mt-1 text-left font-semibold">Schedule, assign links, and host virtual classrooms for real-time instruction.</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 text-left">Schedule Virtual Session</h3>
                  <form onSubmit={handleCreateSession} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Session Topic</label>
                      <input 
                        type="text" 
                        value={sessionTitle} 
                        onChange={(e) => setSessionTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Trainer Name</label>
                      <input 
                        type="text" 
                        value={sessionTrainer} 
                        onChange={(e) => setSessionTrainer(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                        required
                      />
                    </div>
                    <div className="grid gap-2 grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Date</label>
                        <input type="date" value={sessionDate} onChange={(e)=>setSessionDate(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time</label>
                        <input type="text" placeholder="10:00 AM" value={sessionTime} onChange={(e)=>setSessionTime(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Classroom URL / Meeting Link</label>
                      <input 
                        type="text" 
                        value={sessionLink} 
                        onChange={(e)=>setSessionLink(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none" 
                      />
                    </div>
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                      Launch Class Session
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 text-left">Classroom Schedules</h3>
                  <div className="space-y-3">
                    {sessionsList.map((session) => (
                      <div key={session._id} className="p-4 border border-slate-100 rounded-2xl text-left flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-slate-950">{session.title}</h4>
                          <div className="flex gap-3 text-xs text-slate-400 mt-1 font-semibold">
                            <span>Trainer: {session.trainer}</span>
                            <span>·</span>
                            <span>{session.date} @ {session.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {session.link && (
                            <a href={session.link} target="_blank" rel="noreferrer" className="p-1.5 border border-slate-200 rounded-lg text-blue-600 hover:bg-slate-50">
                              <Eye size={14} />
                            </a>
                          )}
                          <button onClick={() => handleDeleteSession(session._id)} className="p-1.5 border border-slate-200 rounded-lg text-rose-500 hover:bg-slate-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div style={{ padding: '32px 40px' }}>
              <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: '#111827' }}>Student Feedback</h1>
              <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14.5 }}>
                Responses submitted from the student feedback form appear here in real time.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,220px))', gap: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={18} color="#2323b8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{feedbackEntries ? feedbackEntries.length : 0}</div>
                    <div style={{ fontSize: 12.5, color: '#6b7280' }}>Total responses</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users2 size={18} color="#2323b8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                      {feedbackEntries ? new Set(feedbackEntries.map((e) => e.student)).size : 0}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#6b7280' }}>Members who sent feedback</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                  { key: 'all', label: 'All Feedback' },
                  { key: 'great', label: 'Great' },
                  { key: 'okay', label: 'Okay' },
                  { key: 'needs_work', label: 'Needs Work' }
                ].map((f) => {
                  const isActive = feedbackFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFeedbackFilter(f.key)}
                      style={{
                        padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                        border: isActive ? '1px solid #2323b8' : '1px solid #e5e7eb',
                        background: '#fff',
                        color: isActive ? '#111827' : '#6b7280',
                        fontWeight: isActive ? 700 : 500, fontSize: 13.5,
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              {feedbackEntries === null && <div style={{ color: '#6b7280', fontSize: 14 }}>Loading feedback...</div>}

              {feedbackEntries !== null && feedbackEntries.filter((e) => feedbackFilter === 'all' || e.rating === feedbackFilter).length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: 12 }}>
                  No feedback yet in this category.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {feedbackEntries &&
                  feedbackEntries
                    .filter((e) => feedbackFilter === 'all' || e.rating === feedbackFilter)
                    .map((entry) => {
                      const RATINGS = {
                        great: { label: 'Great', color: '#16a34a', bg: '#dcfce7' },
                        okay: { label: 'Okay', color: '#a16207', bg: '#fef9c3' },
                        needs_work: { label: 'Needs Work', color: '#dc2626', bg: '#fee2e2' },
                      };
                      const r = RATINGS[entry.rating] || RATINGS.okay;
                      return (
                        <div key={entry._id} style={{ border: '1px solid #eee', borderRadius: 14, padding: 20, background: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3', fontWeight: 700, fontSize: 14 }}>
                                {(entry.student || '?')[0].toLowerCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14.5, color: '#111827' }}>{entry.student}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>
                                  {new Date(entry.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 20, background: r.bg, color: r.color, fontSize: 12.5, fontWeight: 700 }}>
                              ✓ {r.label}
                            </span>
                          </div>

                          {entry.text || entry.message ? (
                            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#4338ca', lineHeight: 1.5 }}>{entry.text || entry.message}</p>
                          ) : (
                            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No written comments.</p>
                          )}

                          {entry.adminReply ? (
                            <div style={{ display: 'flex', gap: 8, background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 10, padding: 12 }}>
                              <CornerDownRight size={15} color="#6d28d9" style={{ marginTop: 2, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', marginBottom: 2 }}>
                                  Your reply · {new Date(entry.adminReplyAt).toLocaleString()}
                                </div>
                                <div style={{ fontSize: 13.5, color: '#4b5563' }}>{entry.adminReply}</div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 10 }}>
                              <input
                                type="text"
                                value={feedbackDrafts[entry._id] || ''}
                                onChange={(e) =>
                                  setFeedbackDrafts((prev) => ({
                                    ...prev,
                                    [entry._id]: e.target.value
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') sendFeedbackReply(entry);
                                }}
                                placeholder="Write a reply..."
                                style={{
                                  flex: 1, borderRadius: 8, border: '1px solid #e5e7eb',
                                  padding: '10px 14px', fontSize: 13.5, fontFamily: 'inherit',
                                }}
                              />
                              <button
                                onClick={() => sendFeedbackReply(entry)}
                                disabled={feedbackSendingId === entry._id || !(feedbackDrafts[entry._id] || '').trim()}
                                style={{
                                  padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
                                  border: '1px solid #e5e7eb',
                                  background: (feedbackDrafts[entry._id] || '').trim() ? '#111827' : '#f3f4f6',
                                  color: (feedbackDrafts[entry._id] || '').trim() ? '#fff' : '#9ca3af',
                                  fontSize: 13.5, fontWeight: 600,
                                }}
                              >
                                {feedbackSendingId === entry._id ? 'Sending...' : 'Reply'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            </div>
          )}

          {activeTab === 'university-practical' && (
            <AdminPracticalExamination />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left">Portal Settings</h1>
                <p className="text-sm text-slate-500 mt-1 text-left font-semibold">Configure global branding headers, notification flags, and system access.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-left">
                <div className="grid gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Branding Name</label>
                    <input 
                      type="text" 
                      value={settingsBrand} 
                      onChange={(e)=>setSettingsBrand(e.target.value)} 
                      className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Helpdesk Support Email</label>
                    <input 
                      type="email" 
                      value={settingsSupport} 
                      onChange={(e)=>setSettingsSupport(e.target.value)} 
                      className="w-full max-w-md px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Global Dashboard Broadcast Banner</label>
                    <textarea 
                      rows="2"
                      value={settingsNotify} 
                      onChange={(e)=>setSettingsNotify(e.target.value)} 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex justify-end">
                  <button 
                    onClick={() => {
                      setNotifMessage('System configurations saved successfully.');
                      setTimeout(() => setNotifMessage(''), 3000);
                    }} 
                    className="px-6 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
