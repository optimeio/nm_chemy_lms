import { useState, useEffect, useRef } from 'react';
import { Bell, X, Megaphone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentHeader() {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Derive initial from stored name or email
  const stored = (() => {
    try {
      const d = localStorage.getItem('studentData');
      if (d) return JSON.parse(d);
    } catch { /* ignore */ }
    return null;
  })();
  const email = localStorage.getItem('userEmail') || '';
  const fullName = stored?.fullName || email.split('@')[0] || 'Student';
  const initial = fullName.trim()[0]?.toUpperCase() || 'S';

  // Fetch announcements to use as notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = token && token !== 'demo-token'
        ? { Authorization: `Bearer ${token}` }
        : {};
      const res = await fetch('/api/announcements', { headers });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      // Support both { announcements: [...] } and plain array responses
      const list = Array.isArray(data) ? data : (data.announcements || []);
      // Sort newest first
      const sorted = [...list].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(sorted.slice(0, 10)); // cap at 10
      setUnreadCount(sorted.length > 0 ? Math.min(sorted.length, 9) : 0);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when panel opens
  useEffect(() => {
    if (notifOpen) {
      fetchNotifications();
    }
  }, [notifOpen]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Also close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleBellClick = () => {
    setNotifOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    navigate('/dashboard/student/profile');
  };

  const handleNotifItemClick = (notif) => {
    setNotifOpen(false);
    navigate('/dashboard/student/announcement');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>

      {/* ── Notification Bell ── */}
      <button
        ref={bellRef}
        aria-label="Notifications"
        aria-expanded={notifOpen}
        onClick={handleBellClick}
        style={{
          position: 'relative',
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: notifOpen ? '#EFF6FF' : '#F3F4F6',
          border: `1px solid ${notifOpen ? '#93C5FD' : '#E5E7EB'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s, border-color 0.15s',
          outline: 'none',
        }}
      >
        <Bell size={15} color={notifOpen ? '#2563EB' : '#6B7280'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            background: '#EF4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            minWidth: 14,
            height: 14,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: '0 2px',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Notification Dropdown Panel ── */}
      {notifOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 340,
            maxHeight: 420,
            background: '#ffffff',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            boxShadow: '0 12px 40px rgba(15,23,42,0.14)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 10px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={15} color="#2563EB" />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: 99,
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setNotifOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Panel body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: 10,
                color: '#6B7280',
              }}>
                <Loader2
                  size={24}
                  color="#2563EB"
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                <span style={{ fontSize: 13 }}>Loading notifications…</span>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              </div>
            )}

            {!loading && error && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '32px 20px',
                gap: 8,
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 28 }}>⚠️</span>
                <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 600 }}>
                  Could not load notifications
                </span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>{error}</span>
                <button
                  onClick={fetchNotifications}
                  style={{
                    marginTop: 8,
                    padding: '6px 14px',
                    background: '#2563EB',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 20px',
                gap: 8,
                textAlign: 'center',
              }}>
                <span style={{ fontSize: 36 }}>🔕</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  No notifications yet
                </span>
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                  New announcements will appear here.
                </span>
              </div>
            )}

            {!loading && !error && notifications.map((notif, idx) => (
              <button
                key={notif._id || idx}
                onClick={() => handleNotifItemClick(notif)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: idx < notifications.length - 1 ? '1px solid #F9FAFB' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Icon */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: notif.category === 'Important' ? '#FEF2F2' : '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  <Megaphone size={15} color={notif.category === 'Important' ? '#EF4444' : '#2563EB'} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {notif.title || 'Announcement'}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#6B7280',
                    marginTop: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {notif.content || notif.message || ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                    {formatDate(notif.createdAt)}
                    {notif.category && (
                      <span style={{
                        marginLeft: 6,
                        background: '#F3F4F6',
                        padding: '1px 6px',
                        borderRadius: 99,
                        fontSize: 10,
                        color: '#6B7280',
                        fontWeight: 600,
                      }}>
                        {notif.category}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Panel footer */}
          {!loading && !error && notifications.length > 0 && (
            <div style={{
              borderTop: '1px solid #F1F5F9',
              padding: '10px 16px',
            }}>
              <button
                onClick={() => { setNotifOpen(false); navigate('/dashboard/student/announcement'); }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#2563EB',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
              >
                View all announcements →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Profile Avatar ── */}
      <button
        aria-label="Profile"
        onClick={handleProfileClick}
        title={fullName}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB 0%, #0B3D91 100%)',
          border: '2px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          letterSpacing: 0,
          outline: 'none',
        }}
      >
        {initial}
      </button>
    </div>
  );
}
