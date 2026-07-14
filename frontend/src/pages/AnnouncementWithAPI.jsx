import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookmarkIcon, Bell, ArrowLeft, Loader, AlertCircle } from 'lucide-react';
import announcementService from '../services/announcementService';

export default function Announcement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const filters = ['All', 'Important', 'Events', 'Courses', 'System'];

  // Map UI filter names to API types
  const filterTypeMap = {
    'All': null,
    'Important': 'important',
    'Events': 'event',
    'Courses': 'course',
    'System': 'system'
  };

  // Stats data structure
  const [stats, setStats] = useState({
    total: 0,
    important: 0,
    thisWeek: 0,
    pinned: 0
  });

  // Color mapping for announcement types
  const colorMap = {
    important: { dot: '#f2994a', text: '#d97706' },
    event: { dot: '#0fa39a', text: '#0fa39a' },
    course: { dot: '#4a3aff', text: '#4a3aff' },
    system: { dot: '#7c8291', text: '#7c8291' }
  };

  const categoryMap = {
    'important': 'IMPORTANT',
    'event': 'EVENT',
    'course': 'COURSE',
    'system': 'SYSTEM'
  };

  // Load announcements on component mount or filter/page change
  useEffect(() => {
    loadAnnouncements();
  }, [activeFilter, page]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const type = filterTypeMap[activeFilter];
      const response = await announcementService.fetchAnnouncements(page, 10, type, 'pinned');

      setAnnouncements(response.data || []);
      setPagination(response.pagination);
      setHasMore(response.pagination.pages > page);

      // Calculate stats
      const total = response.pagination.total;
      const important = response.data.filter(a => a.type === 'important').length;
      const pinned = response.data.filter(a => a.isPinned).length;
      
      // This week calculation (simplified - last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thisWeek = response.data.filter(a => new Date(a.createdAt) > sevenDaysAgo).length;

      setStats({ total, important, thisWeek, pinned });

      // Load pinned state from localStorage
      const savedPinned = JSON.parse(localStorage.getItem('pinnedAnnouncements') || '[]');
      setPinnedItems(savedPinned);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (id) => {
    try {
      const isCurrentlyPinned = pinnedItems.includes(id);
      const newPinnedState = !isCurrentlyPinned;

      // Optimistic update
      setPinnedItems(prev =>
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );

      // API call
      await announcementService.toggleAnnouncementPin(id, newPinnedState);

      // Save to localStorage
      const updatedPinned = isCurrentlyPinned
        ? pinnedItems.filter(p => p !== id)
        : [...pinnedItems, id];
      localStorage.setItem('pinnedAnnouncements', JSON.stringify(updatedPinned));

      // Update stats
      setStats(prev => ({
        ...prev,
        pinned: prev.pinned + (isCurrentlyPinned ? -1 : 1)
      }));
    } catch (err) {
      console.error('Error toggling pin:', err);
      // Revert optimistic update
      setPinnedItems(prev =>
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const filteredAnnouncements = announcements;

  // Featured announcement (first pinned or latest)
  const featuredAnnouncement = announcements.length > 0
    ? announcements.find(a => a.isPinned) || announcements[0]
    : null;

  return (
    <div style={{ backgroundColor: '#faf9f7', minHeight: '100vh', padding: '40px 28px 80px' }}>
      <style>{`
        :root {
          --ink: #161522;
          --ink-soft: #5b5a6e;
          --paper: #faf9f7;
          --card: #ffffff;
          --line: #eae8e3;
          --primary: #4a3aff;
          --primary-deep: #241a8f;
          --amber: #f2994a;
          --teal: #0fa39a;
          --slate: #7c8291;
          --radius: 16px;
        }
        .announcements-wrap { max-width: 1180px; margin: 0 auto; }
        .top-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; gap: 20px; flex-wrap: wrap; }
        .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.12em; color: var(--primary); text-transform: uppercase; margin-bottom: 6px; }
        .header-content h1 { font-family: 'Space Grotesk', sans-serif; font-size: 38px; margin: 0 0 6px; letter-spacing: -0.01em; color: var(--ink); }
        .header-content p { color: var(--ink-soft); margin: 0; font-size: 15px; }
        .back-btn { border: 1px solid var(--line); background: var(--card); padding: 10px 18px; border-radius: 999px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px; color: var(--ink); }
        .back-btn:hover { background: #f5f5f5; }
        .grid-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        @media (max-width: 900px) { .grid-layout { grid-template-columns: 1fr; } }
        .featured-card { position: relative; border-radius: var(--radius); padding: 32px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%); color: #fff; overflow: hidden; margin-bottom: 22px; }
        .featured-card::after { content: ''; position: absolute; right: -60px; top: -60px; width: 220px; height: 220px; border-radius: 50%; background: rgba(255,255,255,0.08); }
        .tag-row { display: flex; gap: 8px; margin-bottom: 14px; position: relative; z-index: 1; }
        .pill { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.06em; padding: 5px 10px; border-radius: 999px; background: rgba(255,255,255,0.18); text-transform: uppercase; }
        .featured-card h2 { font-family: 'Space Grotesk', sans-serif; font-size: 26px; margin: 0 0 10px; line-height: 1.2; position: relative; z-index: 1; }
        .featured-card p { max-width: 560px; color: rgba(255,255,255,0.85); font-size: 15px; line-height: 1.55; margin: 0 0 20px; position: relative; z-index: 1; }
        .featured-meta { display: flex; gap: 18px; flex-wrap: wrap; font-size: 13px; color: rgba(255,255,255,0.75); margin-bottom: 22px; position: relative; z-index: 1; }
        .featured-meta span { display: flex; align-items: center; gap: 6px; }
        .cta { background: #fff; color: var(--primary-deep); border: none; padding: 12px 22px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; position: relative; z-index: 2; }
        .cta:hover { background: #f0f0f0; }
        .filters { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
        .filter-btn { border: 1px solid var(--line); background: var(--card); padding: 9px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--ink-soft); cursor: pointer; }
        .filter-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
        .timeline { position: relative; }
        .timeline-item { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 16px; position: relative; }
        .timeline-item::before { content: ''; position: absolute; left: -28px; top: 24px; width: 12px; height: 12px; border-radius: 50%; background: var(--dot-color); box-shadow: 0 0 0 4px var(--paper); }
        .item-content { flex: 1; }
        .item-category { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--cat-color); display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .item-title { margin: 0 0 6px; font-size: 16.5px; font-family: 'Space Grotesk', sans-serif; color: var(--ink); font-weight: 600; }
        .item-desc { margin: 0 0 10px; color: var(--ink-soft); font-size: 14px; line-height: 1.5; }
        .item-footer { display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: #9a98a8; }
        .item-meta { display: flex; gap: 14px; align-items: center; }
        .save-btn { border: none; background: none; cursor: pointer; color: #c8c6d4; font-size: 18px; }
        .save-btn.pinned { color: var(--primary); }
        .load-more { width: 100%; text-align: center; font-size: 14px; font-weight: 600; color: var(--ink-soft); padding: 16px; border: none; background: none; cursor: pointer; }
        .side-card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 22px; margin-bottom: 20px; }
        .side-card h4 { font-family: 'Space Grotesk', sans-serif; margin: 0 0 16px; font-size: 16px; color: var(--ink); }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .stat { border-radius: 12px; padding: 14px; }
        .stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: var(--ink); }
        .stat-label { font-size: 12px; color: var(--ink-soft); margin-top: 2px; }
        .stat.violet { background: #efedff; }
        .stat.amber { background: #fff3e7; }
        .stat.teal { background: #e6f8f6; }
        .stat.slate { background: #f1f2f5; }
        .error-state { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 16px; display: flex; gap: 12px; margin-bottom: 20px; }
        .error-icon { color: #dc2626; flex-shrink: 0; }
        .error-content { flex: 1; }
        .error-content h3 { margin: 0; color: #dc2626; font-size: 14px; font-weight: 600; }
        .error-content p { margin: 4px 0 0; color: #991b1b; font-size: 13px; }
        .loading-spinner { display: flex; justify-content: center; align-items: center; padding: 40px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .empty-state { text-align: center; padding: 40px 20px; }
        .empty-state h3 { color: var(--ink); margin: 0 0 8px; }
        .empty-state p { color: var(--ink-soft); margin: 0; }
        .notification-card { background: linear-gradient(135deg, #efedff 0%, #f7eefb 100%); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; }
        .notification-card h3 { margin: 0 0 8px; font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: var(--ink); font-weight: 600; }
        .notification-card p { margin: 0 0 16px; font-size: 12px; color: var(--ink-soft); line-height: 1.5; }
        .notify-btn { background: var(--ink); color: #fff; border: none; padding: 10px 16px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .notify-btn:hover { background: var(--ink-soft); }
      `}</style>

      <div className="announcements-wrap">
        <div className="top-section">
          <div className="header-content">
            <div className="eyebrow">Student · Chemy LMS</div>
            <h1>Announcements</h1>
            <p>Everything you need to know, in the order it happened.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="back-btn"
            title="Go back to dashboard"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <div className="grid-layout">
          <div>
            {/* Error State */}
            {error && (
              <div className="error-state">
                <AlertCircle className="error-icon" size={20} />
                <div className="error-content">
                  <h3>Failed to load announcements</h3>
                  <p>{error}</p>
                  <button
                    onClick={() => { setPage(1); loadAnnouncements(); }}
                    style={{ marginTop: '8px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && page === 1 && (
              <div className="loading-spinner">
                <Loader className="spinner" size={32} color="var(--primary)" />
              </div>
            )}

            {/* Featured Card */}
            {!loading && featuredAnnouncement && (
              <div className="featured-card">
                <div className="tag-row">
                  <span className="pill">Featured</span>
                  <span className="pill">{categoryMap[featuredAnnouncement.type] || 'Update'}</span>
                </div>
                <h2>{featuredAnnouncement.title}</h2>
                <p>{featuredAnnouncement.description}</p>
                <div className="featured-meta">
                  <span>{featuredAnnouncement.authorName}</span>
                  <span>{new Date(featuredAnnouncement.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  className="cta"
                  onClick={() => {
                    // Could open detail view in future
                  }}
                >
                  View details →
                </button>
              </div>
            )}

            {/* Filters */}
            <div className="filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPage(1) || setActiveFilter(filter)}
                  className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Announcements Timeline */}
            {!loading && filteredAnnouncements.length > 0 && (
              <div className="timeline">
                {filteredAnnouncements.map((item) => {
                  const colors = colorMap[item.type] || colorMap.system;
                  return (
                    <div
                      key={item._id}
                      className="timeline-item"
                      style={{ '--dot-color': colors.dot, '--cat-color': colors.text }}
                    >
                      <div className="item-content">
                        <div className="item-category">
                          <span>●</span>
                          <span>{categoryMap[item.type]}</span>
                        </div>
                        <h3 className="item-title">{item.title}</h3>
                        <p className="item-desc">{item.description}</p>
                        <div className="item-footer">
                          <div className="item-meta">
                            <span>⏱️ {getRelativeTime(item.createdAt)}</span>
                            <span>👤 {item.authorName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => togglePin(item._id)}
                            className={`save-btn ${pinnedItems.includes(item._id) ? 'pinned' : ''}`}
                            title={pinnedItems.includes(item._id) ? 'Unpin' : 'Pin'}
                            aria-label={pinnedItems.includes(item._id) ? 'Unpin announcement' : 'Pin announcement'}
                          >
                            🔖
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredAnnouncements.length === 0 && !error && (
              <div className="empty-state">
                <h3>No announcements</h3>
                <p>There are no announcements matching the current filter.</p>
              </div>
            )}

            {/* Load More Button */}
            {!loading && hasMore && (
              <button
                type="button"
                className="load-more"
                onClick={handleLoadMore}
              >
                Load more announcements ⬇️
              </button>
            )}
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Stats Card */}
            <div className="side-card">
              <h4>Announcement stats</h4>
              <div className="stat-grid">
                <div className="stat violet">
                  <div className="stat-num">{stats.total}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat amber">
                  <div className="stat-num">{stats.important}</div>
                  <div className="stat-label">Important</div>
                </div>
                <div className="stat teal">
                  <div className="stat-num">{stats.thisWeek}</div>
                  <div className="stat-label">This week</div>
                </div>
                <div className="stat slate">
                  <div className="stat-num">{stats.pinned}</div>
                  <div className="stat-label">Pinned</div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="side-card">
              <h4>Quick links</h4>
              <a href="#" className="qlink" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 0, borderTop: 'none', paddingBottom: '12px', fontSize: '14px', color: '#161522', textDecoration: 'none' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Academic calendar</div>
                  <div style={{ fontSize: '12px', color: '#5b5a6e', marginTop: '2px' }}>View important dates</div>
                </div>
                <div style={{ color: '#c8c6d4' }}>›</div>
              </a>
              <a href="#" className="qlink" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: '1px', borderTopColor: '#eae8e3', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', color: '#161522', textDecoration: 'none' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Exam schedule</div>
                  <div style={{ fontSize: '12px', color: '#5b5a6e', marginTop: '2px' }}>Check upcoming exams</div>
                </div>
                <div style={{ color: '#c8c6d4' }}>›</div>
              </a>
              <a href="#" className="qlink" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: '1px', borderTopColor: '#eae8e3', paddingTop: '12px', fontSize: '14px', color: '#161522', textDecoration: 'none' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Assignment submission</div>
                  <div style={{ fontSize: '12px', color: '#5b5a6e', marginTop: '2px' }}>View pending submissions</div>
                </div>
                <div style={{ color: '#c8c6d4' }}>›</div>
              </a>
            </div>

            {/* Notification Card */}
            <div className="notification-card">
              <h3>Stay in the loop</h3>
              <p>Turn on notifications so you never miss an important announcement.</p>
              <button className="notify-btn">
                <Bell size={14} /> Enable notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) === 1 ? 'Yesterday' : Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return 'Just now';
}
