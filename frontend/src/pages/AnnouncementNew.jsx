import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Bell, Search, Loader2, AlertCircle, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import announcementService from '../services/announcementService';

const filters = ['All', 'Important', 'Events', 'Courses', 'System'];

const colorMap = {
  IMPORTANT: { dot: '#f2994a', text: '#d97706', bg: 'bg-[#fff4e7]' },
  EVENT: { dot: '#0fa39a', text: '#0fa39a', bg: 'bg-[#e6f8f6]' },
  COURSE: { dot: '#4a3aff', text: '#4a3aff', bg: 'bg-[#efedff]' },
  SYSTEM: { dot: '#7c8291', text: '#7c8291', bg: 'bg-[#f1f2f5]' }
};

const categoryLabels = {
  IMPORTANT: 'IMPORTANT',
  EVENT: 'EVENT',
  COURSE: 'COURSE',
  SYSTEM: 'SYSTEM'
};

const categoryIcons = {
  IMPORTANT: '⚠️',
  EVENT: '🎯',
  COURSE: '📖',
  SYSTEM: '🔧'
};

export default function Announcement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Load announcements from API
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch a maximum of 100 announcements for the student board
      const response = await announcementService.fetchAnnouncements(1, 100, null, 'newest');
      setAnnouncements(response.data || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    // Auto-refresh every 15 seconds to ensure real-time reflection of changes
    const interval = setInterval(loadAnnouncements, 15000);
    return () => clearInterval(interval);
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('studentBookmarks') || '[]');
    setBookmarkedItems(savedBookmarks);
  }, []);

  const toggleBookmark = (id) => {
    const updated = bookmarkedItems.includes(id)
      ? bookmarkedItems.filter(p => p !== id)
      : [...bookmarkedItems, id];
    setBookmarkedItems(updated);
    localStorage.setItem('studentBookmarks', JSON.stringify(updated));
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = announcements.length;
    const important = announcements.filter(a => a.category === 'IMPORTANT').length;
    const pinned = announcements.filter(a => a.isPinned).length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisWeek = announcements.filter(a => new Date(a.createdAt) > sevenDaysAgo).length;

    return { total, important, thisWeek, pinned };
  }, [announcements]);

  // Featured banner announcement (latest pinned, or latest overall if no pinned)
  const featuredAnnouncement = useMemo(() => {
    if (announcements.length === 0) return null;
    const pinned = announcements.filter(a => a.isPinned);
    if (pinned.length > 0) {
      return [...pinned].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    }
    return [...announcements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [announcements]);

  // Filter & sort logic
  const filteredAndSorted = useMemo(() => {
    let list = [...announcements];

    // Filter by Category
    if (activeFilter !== 'All') {
      const typeMap = {
        'Important': 'IMPORTANT',
        'Events': 'EVENT',
        'Courses': 'COURSE',
        'System': 'SYSTEM'
      };
      list = list.filter(a => a.category === typeMap[activeFilter]);
    }

    // Filter by Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => 
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q) ||
        a.authorName?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }

    // Sort: Pinned first, then latest by date
    list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [announcements, activeFilter, search]);

  // Exclude featured banner announcement from the main timeline scroll to avoid duplication
  const timelineAnnouncements = useMemo(() => {
    return filteredAndSorted.filter(a => a._id !== featuredAnnouncement?._id);
  }, [filteredAndSorted, featuredAnnouncement]);

  const getRelativeTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-full bg-[#faf9f7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div>
            <div className="text-[11px] tracking-[0.32em] uppercase text-[#4a3aff] mb-2 font-semibold">
              Student · Chemy LMS
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#161522] mb-3">
              Announcements
            </h1>
            <p className="max-w-2xl text-sm text-[#5b5a6e]">
              Everything you need to know, in the order it happened.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[#eae8e3] bg-white px-4 py-2 text-sm font-semibold text-[#161522] hover:bg-[#f5f5f5] transition"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements by title, content or author..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#eae8e3] bg-white text-sm text-[#161522] focus:outline-none focus:ring-2 focus:ring-[#4a3aff]/20"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_0.9fr] gap-6">
          <div className="space-y-6">
            
            {/* Loading Featured Skeleton */}
            {loading && (
              <div className="h-56 rounded-[28px] bg-gray-200 animate-pulse" />
            )}

            {/* Featured Banner (Latest Pinned / Latest overall) */}
            {!loading && featuredAnnouncement && (
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4a3aff] to-[#241a8f] p-8 text-white shadow-lg">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    ⭐ Featured
                  </span>
                  {featuredAnnouncement.isPinned && (
                    <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      📌 Pinned
                    </span>
                  )}
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {categoryLabels[featuredAnnouncement.category] || 'NOTICE'}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  {categoryIcons[featuredAnnouncement.category] || '📢'} {featuredAnnouncement.title}
                </h2>
                <p className="max-w-xl text-sm text-white/80 leading-7 mb-6 line-clamp-3">
                  {featuredAnnouncement.description || featuredAnnouncement.content}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-white/75 mb-6">
                  <span>👤 {featuredAnnouncement.authorName}</span>
                  <span>⏱️ {getRelativeTime(featuredAnnouncement.createdAt)}</span>
                </div>
                <button 
                  onClick={() => setSelectedAnnouncement(featuredAnnouncement)}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#241a8f] transition hover:bg-[#f3f3f3] shadow-md"
                >
                  View details →
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? 'bg-[#161522] text-white border border-[#161522]'
                      : 'bg-white text-[#5b5a6e] border border-[#eae8e3] hover:bg-[#f5f5f5]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-[18px] border border-red-200 bg-red-50 p-6 flex flex-col gap-3 items-start">
                <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                  <AlertCircle size={18} />
                  <span>Failed to load announcements</span>
                </div>
                <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                <button
                  onClick={loadAnnouncements}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 bg-white border border-red-200 px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Loader2 size={12} className="animate-spin-slow" /> Try again
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-[18px] border border-[#eae8e3] bg-white p-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-6 bg-gray-200 rounded w-8" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && timelineAnnouncements.length === 0 && !error && (
              <div className="rounded-[18px] border border-[#eae8e3] bg-white p-12 text-center text-[#7c7b8a]">
                <div className="text-4xl mb-3">📭</div>
                <h3 className="font-semibold text-[#161522] mb-1">No announcements found</h3>
                <p className="text-sm">We couldn't find any announcements matching the filters.</p>
              </div>
            )}

            {/* Main Timeline */}
            {!loading && timelineAnnouncements.length > 0 && (
              <div className="space-y-4">
                {timelineAnnouncements.map((item) => {
                  const colors = colorMap[item.category] || colorMap.SYSTEM;
                  return (
                    <div
                      key={item._id}
                      onClick={() => setSelectedAnnouncement(item)}
                      className="relative overflow-hidden rounded-[18px] border border-[#eae8e3] bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="absolute -left-4 top-6 h-3.5 w-3.5 rounded-full" style={{ backgroundColor: colors.dot }} />
                      <div className="mb-3 flex justify-between items-start">
                        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: colors.text }}>
                          <span>{categoryIcons[item.category]}</span>
                          <span>{categoryLabels[item.category]}</span>
                          {item.isPinned && (
                            <span className="ml-2 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] px-1.5 py-0.5 rounded font-bold">
                              📌 PINNED
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-[#161522] mb-2">{item.title}</h3>
                      <p className="text-sm leading-6 text-[#5b5a6e] mb-4 line-clamp-2">{item.description || item.content}</p>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-[#7c7b8a]">
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span>⏱️ {getRelativeTime(item.createdAt)}</span>
                          <span>👤 By {item.authorName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent modal opening
                            toggleBookmark(item._id);
                          }}
                          className={`text-lg transition p-1 hover:bg-gray-50 rounded-full ${
                            bookmarkedItems.includes(item._id) ? 'text-[#4a3aff]' : 'text-[#c8c6d4] hover:text-[#4a3aff]'
                          }`}
                          aria-label={bookmarkedItems.includes(item._id) ? 'Remove bookmark' : 'Bookmark announcement'}
                        >
                          🔖
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            
            {/* Stats Card */}
            <div className="rounded-[24px] border border-[#eae8e3] bg-white p-6 shadow-sm">
              <h4 className="text-base font-semibold text-[#161522] mb-4">Announcement stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f2efff] p-4">
                  <div className="text-2xl font-bold text-[#161522]">{stats.total}</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">Total</div>
                </div>
                <div className="rounded-2xl bg-[#fff4e7] p-4">
                  <div className="text-2xl font-bold text-[#161522]">{stats.important}</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">Important</div>
                </div>
                <div className="rounded-2xl bg-[#e7f6f3] p-4">
                  <div className="text-2xl font-bold text-[#161522]">{stats.thisWeek}</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">This week</div>
                </div>
                <div className="rounded-2xl bg-[#f1f2f5] p-4">
                  <div className="text-2xl font-bold text-[#161522]">{stats.pinned}</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">Pinned</div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="rounded-[24px] border border-[#eae8e3] bg-white p-6 shadow-sm">
              <h4 className="text-base font-semibold text-[#161522] mb-4">Quick links</h4>
              <a href="#" className="flex items-center justify-between border-t border-[#eae8e3] pt-4 first:border-t-0 first:pt-0 text-sm text-[#161522] transition hover:text-[#4a3aff]">
                <div>
                  <div className="font-semibold">Academic calendar</div>
                  <div className="text-[#5b5a6e] text-xs mt-0.5">View important dates and deadlines</div>
                </div>
                <div className="text-[#c8c6d4]">›</div>
              </a>
              <a href="#" className="flex items-center justify-between border-t border-[#eae8e3] pt-4 text-sm text-[#161522] transition hover:text-[#4a3aff]">
                <div>
                  <div className="font-semibold">Exam schedule</div>
                  <div className="text-[#5b5a6e] text-xs mt-0.5">Check upcoming exams</div>
                </div>
                <div className="text-[#c8c6d4]">›</div>
              </a>
              <a href="#" className="flex items-center justify-between border-t border-[#eae8e3] pt-4 text-sm text-[#161522] transition hover:text-[#4a3aff]">
                <div>
                  <div className="font-semibold">Assignment submission</div>
                  <div className="text-[#5b5a6e] text-xs mt-0.5">View pending submissions</div>
                </div>
                <div className="text-[#c8c6d4]">›</div>
              </a>
            </div>

            {/* Stay in the Loop Card */}
            <div className="rounded-[24px] border border-[#eae8e3] bg-gradient-to-br from-[#efedff] to-[#f7eefb] p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#161522] mb-3">Stay in the loop</h3>
              <p className="text-xs text-[#5b5a6e] mb-5 leading-5">
                Turn on notifications so you never miss an important campus announcement or timeline update.
              </p>
              <button className="inline-flex rounded-full bg-[#161522] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#5b5a6e]">
                Enable notifications
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ── Announcement Detail Modal ── */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex flex-wrap gap-2 mb-4 shrink-0">
              <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {selectedAnnouncement.category}
              </span>
              {selectedAnnouncement.isPinned && (
                <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  📌 Pinned
                </span>
              )}
              {featuredAnnouncement?._id === selectedAnnouncement._id && (
                <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-[#161522] mb-3 leading-snug">
              {selectedAnnouncement.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-[#7c7b8a] mb-5 border-b border-gray-100 pb-3 shrink-0">
              <span>👤 {selectedAnnouncement.authorName}</span>
              <span>⏱️ {new Date(selectedAnnouncement.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>

            <div className="text-sm text-[#5b5a6e] leading-relaxed overflow-y-auto flex-1 pr-1 custom-scrollbar">
              {selectedAnnouncement.description || selectedAnnouncement.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}