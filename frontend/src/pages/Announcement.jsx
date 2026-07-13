import React from 'react';
import { useNavigate } from 'react-router-dom';

const announcements = [
  {
    category: 'IMPORTANT',
    dot: '#ef4444',
    text: '#dc2626',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
    iconBg: 'bg-indigo-50',
    title: 'Practical exam venue changed for Day 3',
    body: 'The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A - 305.',
    time: '2 hours ago',
    by: 'Examination Office',
    pinned: true,
  },
  {
    category: 'EVENT',
    dot: '#3b82f6',
    text: '#2563eb',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    iconBg: 'bg-blue-50',
    title: 'Webinar: Future of Data Science',
    body: 'Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session.',
    time: '5 hours ago',
    by: 'Learning Team',
    pinned: false,
  },
  {
    category: 'COURSE UPDATE',
    dot: '#10b981',
    text: '#059669',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    iconBg: 'bg-emerald-50',
    title: 'UI/UX Design Course Updated',
    body: 'New modules on Figma Advanced and Design Systems have been added.',
    time: '1 day ago',
    by: 'Design Faculty',
    pinned: false,
  },
  {
    category: 'SYSTEM',
    dot: '#8b5cf6',
    text: '#7c3aed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    iconBg: 'bg-purple-50',
    title: 'Scheduled Maintenance',
    body: 'System maintenance scheduled for 15 Jul 2026 from 2:00 AM to 4:00 AM IST.',
    time: '2 days ago',
    by: 'System Admin',
    pinned: false,
  },
];

export default function Announcement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-8 md:px-10 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900">Announcements</h1>
            <p className="text-indigo-600 text-sm mt-1">Stay updated with the latest news and important information.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 transition"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 transition">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden mb-6 rounded-[16px] border border-[#ECEDF5] bg-[linear-gradient(120deg,_#EFF1FF_0%,_#F7EEFB_60%,_#FDF3F8_100%)] p-6 md:p-7">
              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-indigo-600 text-white mb-3">FEATURED</span>
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2">
                  <path d="M3 11l18-5v12L3 14v-3z" />
                  <path d="M11 13v5a2 2 0 0 0 4 0v-1" />
                </svg>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">New Power BI Course Now Live!</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4 max-w-md">Master data visualization and business intelligence with our comprehensive Power BI course. Enroll now and boost your career!</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> Learning Team</span>
                <span className="flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> July 12, 2026</span>
                <span className="flex items-center gap-1.5"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg> Course Update</span>
              </div>
              <button className="absolute bottom-6 right-6 hidden md:flex items-center gap-1.5 bg-indigo-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-900 transition">
                View Course
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-1 mb-4">
              <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-[#EEF0FF] text-[#4338CA]">All</button>
              <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100">Important</button>
              <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100">Events</button>
              <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100">Courses</button>
              <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100">System Updates</button>
            </div>

            <div className="rounded-[16px] border border-[#ECEDF5] bg-white divide-y divide-gray-100" id="announcementList">
              {announcements.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex items-start gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: item.dot }} />
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: item.text }}>{item.category}</span>
                    </div>
                    <p className="text-[15px] font-semibold text-gray-900 mb-1">{item.title}</p>
                    <p className="text-sm text-gray-500 mb-2">{item.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> {item.time}</span>
                      <span className="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> By {item.by}</span>
                    </div>
                  </div>
                  <button className="shrink-0 text-gray-300 hover:text-indigo-600 transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={item.pinned ? '#4338CA' : 'none'} stroke={item.pinned ? '#4338CA' : 'currentColor'} strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 py-4 flex items-center justify-center gap-1.5">
              Load more announcements
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#ECEDF5] bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Announcement Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="w-9 h-9 rounded-[10px] bg-indigo-50 mb-2 flex items-center justify-center">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18" /></svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <div className="w-9 h-9 rounded-[10px] bg-emerald-50 mb-2 flex items-center justify-center">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900">5</p>
                  <p className="text-xs text-gray-500">Important</p>
                </div>
                <div>
                  <div className="w-9 h-9 rounded-[10px] bg-orange-50 mb-2 flex items-center justify-center">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900">8</p>
                  <p className="text-xs text-gray-500">This Week</p>
                </div>
                <div>
                  <div className="w-9 h-9 rounded-[10px] bg-blue-50 mb-2 flex items-center justify-center">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.5-6.3 4.5 2.3-7.2-6-4.4h7.6z" /></svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900">3</p>
                  <p className="text-xs text-gray-500">Pinned</p>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#ECEDF5] bg-white p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
              <div className="divide-y divide-gray-100">
                <a href="#" className="flex items-center gap-3 py-3 group">
                  <div className="w-9 h-9 rounded-[10px] bg-indigo-50 shrink-0 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Academic Calendar</p>
                    <p className="text-xs text-gray-500">View important dates and deadlines</p>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="group-hover:translate-x-0.5 transition"><path d="M9 18l6-6-6-6" /></svg>
                </a>
                <a href="#" className="flex items-center gap-3 py-3 group">
                  <div className="w-9 h-9 rounded-[10px] bg-emerald-50 shrink-0 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Exam Schedule</p>
                    <p className="text-xs text-gray-500">Check upcoming exams</p>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="group-hover:translate-x-0.5 transition"><path d="M9 18l6-6-6-6" /></svg>
                </a>
                <a href="#" className="flex items-center gap-3 py-3 group">
                  <div className="w-9 h-9 rounded-[10px] bg-amber-50 shrink-0 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Assignment Submission</p>
                    <p className="text-xs text-gray-500">View pending assignments</p>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="group-hover:translate-x-0.5 transition"><path d="M9 18l6-6-6-6" /></svg>
                </a>
                <a href="#" className="flex items-center gap-3 py-3 group">
                  <div className="w-9 h-9 rounded-[10px] bg-blue-50 shrink-0 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Library Resources</p>
                    <p className="text-xs text-gray-500">Access study materials</p>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className="group-hover:translate-x-0.5 transition"><path d="M9 18l6-6-6-6" /></svg>
                </a>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#ECEDF5] bg-[linear-gradient(135deg,_#EFF1FF,_#F7EEFB)] p-5 relative overflow-hidden">
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5">Never Miss an Update!</h3>
              <p className="text-xs text-gray-600 mb-4 max-w-[180px]">Enable notifications to get instant alerts about important announcements.</p>
              <button className="flex items-center gap-2 bg-indigo-950 text-white text-xs font-medium px-3.5 py-2 rounded-lg hover:bg-indigo-900 transition">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
