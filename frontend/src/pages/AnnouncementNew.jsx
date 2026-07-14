import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, BookmarkIcon, Bell } from 'lucide-react';

const announcements = [
  {
    id: 1,
    category: 'IMPORTANT',
    type: 'important',
    dotColor: '#f2994a',
    textColor: '#d97706',
    title: 'Practical exam venue changed for Day 3',
    description: 'The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A – 305. Please update your calendar.',
    time: '2 hours ago',
    by: 'Examination Office',
    pinned: true,
  },
  {
    id: 2,
    category: 'EVENT',
    type: 'event',
    dotColor: '#0fa39a',
    textColor: '#0fa39a',
    title: 'Webinar: Future of Data Science',
    description: 'Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session on where the field is heading next.',
    time: '6 hours ago',
    by: 'Career Services',
    pinned: false,
  },
  {
    id: 3,
    category: 'COURSE',
    type: 'course',
    dotColor: '#4a3aff',
    textColor: '#4a3aff',
    title: 'New assignment posted in Data Structures',
    description: 'Assignment 4 covering binary trees and traversal algorithms is now available. Due 28 Jul 2026, 11:59 PM.',
    time: 'Yesterday',
    by: 'Prof. Menon',
    pinned: false,
  },
  {
    id: 4,
    category: 'SYSTEM',
    type: 'system',
    dotColor: '#7c8291',
    textColor: '#7c8291',
    title: 'Scheduled maintenance this weekend',
    description: 'The portal will be briefly unavailable on 19 Jul 2026, 1:00–2:00 AM IST, for routine maintenance.',
    time: '2 days ago',
    by: 'IT Support',
    pinned: false,
  },
];

export default function Announcement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pinnedItems, setPinnedItems] = useState(
    announcements.filter(a => a.pinned).map(a => a.id)
  );

  const filters = ['All', 'Important', 'Events', 'Courses', 'System'];

  const filteredAnnouncements = announcements.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Important') return item.type === 'important';
    if (activeFilter === 'Events') return item.type === 'event';
    if (activeFilter === 'Courses') return item.type === 'course';
    if (activeFilter === 'System') return item.type === 'system';
    return true;
  });

  const togglePin = (id) => {
    setPinnedItems(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const stats = [
    { num: '24', label: 'Total', bgColor: 'bg-violet-100', icon: '📋' },
    { num: '5', label: 'Important', bgColor: 'bg-amber-100', icon: '⚠️' },
    { num: '8', label: 'This week', bgColor: 'bg-teal-100', icon: '⏱️' },
    { num: '3', label: 'Pinned', bgColor: 'bg-slate-100', icon: '📌' },
  ];

  const quickLinks = [
    { title: 'Academic calendar', desc: 'View important dates and deadlines', icon: '📅' },
    { title: 'Exam schedule', desc: 'Check upcoming exams', icon: '✓' },
    { title: 'Assignment submission', desc: 'View pending submissions', icon: '📄' },
  ];

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
        .cta { background: #fff; color: var(--primary-deep); border: none; padding: 12px 22px; border-radius: 999px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; position: absolute; bottom: 24px; right: 32px; z-index: 2; }
        .cta:hover { background: #f0f0f0; }
        .filters { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
        .filter-btn { border: 1px solid var(--line); background: var(--card); padding: 9px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--ink-soft); cursor: pointer; }
        .filter-btn.active { background: var(--ink); color: #fff; border-color: var(--ink); }
        .timeline { position: relative; }
        .timeline-item { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; margin-bottom: 14px; display: flex; align-items: flex-start; gap: 16px; position: relative; }
        .timeline-item::before { content: ''; position: absolute; left: -28px; top: 24px; width: 12px; height: 12px; border-radius: 50%; background: var(--dot-color); box-shadow: 0 0 0 4px var(--paper); }
        .item-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 20px; }
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
        .qlink { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid var(--line); font-size: 14px; cursor: pointer; text-decoration: none; color: var(--ink); }
        .qlink:hover .qlink-text { color: var(--primary); }
        .qlink:first-of-type { border-top: none; padding-top: 0; }
        .qlink-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
        .qlink-text { font-weight: 600; }
        .qlink-desc { font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }
        .qlink-arrow { color: #c8c6d4; }
        .notification-card { background: linear-gradient(135deg, #efedff 0%, #f7eefb 100%); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden; }
        .notification-card h3 { margin: 0 0 8px; font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: var(--ink); font-weight: 600; }
        .notification-card p { margin: 0 0 16px; font-size: 12px; color: var(--ink-soft); line-height: 1.5; }
        .notify-btn { background: var(--ink); color: #fff; border: none; padding: 10px 16px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .notify-btn:hover { background: var(--ink-soft); }
      `}