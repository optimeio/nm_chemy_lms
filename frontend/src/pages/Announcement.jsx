import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const announcementsData = [
  {
    id: 1,
    category: 'IMPORTANT',
    dotColor: '#f2994a',
    textColor: '#d97706',
    title: 'Practical exam venue changed for Day 3',
    description: 'The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A – 305. Please update your calendar.',
    time: '2 hours ago',
    by: 'Examination Office',
    pinned: true,
    type: 'important',
  },
  {
    id: 2,
    category: 'EVENT',
    dotColor: '#0fa39a',
    textColor: '#0fa39a',
    title: 'Webinar: Future of Data Science',
    description: 'Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session on where the field is heading next.',
    time: '6 hours ago',
    by: 'Career Services',
    pinned: false,
    type: 'event',
  },
  {
    id: 3,
    category: 'COURSE',
    dotColor: '#4a3aff',
    textColor: '#4a3aff',
    title: 'New assignment posted in Data Structures',
    description: 'Assignment 4 covering binary trees and traversal algorithms is now available. Due 28 Jul 2026, 11:59 PM.',
    time: 'Yesterday',
    by: 'Prof. Menon',
    pinned: false,
    type: 'course',
  },
  {
    id: 4,
    category: 'SYSTEM',
    dotColor: '#7c8291',
    textColor: '#7c8291',
    title: 'Scheduled maintenance this weekend',
    description: 'The portal will be briefly unavailable on 19 Jul 2026, 1:00–2:00 AM IST, for routine maintenance.',
    time: '2 days ago',
    by: 'IT Support',
    pinned: false,
    type: 'system',
  },
];

const filters = ['All', 'Important', 'Events', 'Courses', 'System'];

export default function Announcement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [pinnedItems, setPinnedItems] = useState(
    announcementsData.filter((item) => item.pinned).map((item) => item.id)
  );

  const filteredAnnouncements = announcementsData.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Important') return item.type === 'important';
    if (activeFilter === 'Events') return item.type === 'event';
    if (activeFilter === 'Courses') return item.type === 'course';
    if (activeFilter === 'System') return item.type === 'system';
    return true;
  });

  const togglePin = (id) => {
    setPinnedItems((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-full bg-[#faf9f7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
          <div>
            <div className="text-[11px] tracking-[0.32em] uppercase text-[#4a3aff] mb-2">
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
            className="inline-flex items-center gap-2 rounded-full border border-[#eae8e3] bg-white px-4 py-2 text-sm font-semibold text-[#161522] hover:bg-[#f5f5f5]"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_0.9fr] gap-6">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4a3aff] to-[#241a8f] p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Featured
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Course Update
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3">📊 New Power BI course is now live</h2>
              <p className="max-w-xl text-sm text-white/80 leading-7 mb-6">
                Master data visualization and business intelligence with our comprehensive Power BI course. Enrollment is open — build your first dashboard this week.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/75 mb-8">
                <span>Learning Team</span>
                <span>July 12, 2026</span>
              </div>
              <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#241a8f] transition hover:bg-[#f3f3f3]">
                View course →
              </button>
            </div>

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

            <div className="space-y-4">
              {filteredAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-[18px] border border-[#eae8e3] bg-white p-5 shadow-sm"
                >
                  <div className="absolute -left-4 top-6 h-3.5 w-3.5 rounded-full" style={{ backgroundColor: item.dotColor }} />
                  <div className="mb-3">
                    <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: item.textColor }}>
                      <span>●</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-[#161522] mb-2">{item.title}</h3>
                  <p className="text-sm leading-6 text-[#5b5a6e] mb-4">{item.description}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-[#7c7b8a]">
                    <div className="flex flex-wrap gap-3">
                      <span>⏱️ {item.time}</span>
                      <span>👤 By {item.by}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePin(item.id)}
                      className={`text-lg transition ${
                        pinnedItems.includes(item.id) ? 'text-[#4a3aff]' : 'text-[#c8c6d4] hover:text-[#4a3aff]'
                      }`}
                      aria-label={pinnedItems.includes(item.id) ? 'Unpin announcement' : 'Pin announcement'}
                    >
                      🔖
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="w-full rounded-3xl border border-[#eae8e3] bg-white px-5 py-4 text-sm font-semibold text-[#5b5a6e] transition hover:bg-[#f8f8f8]">
              Load more announcements ⬇️
            </button>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-[#eae8e3] bg-white p-6 shadow-sm">
              <h4 className="text-base font-semibold text-[#161522] mb-4">Announcement stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#f2efff] p-4">
                  <div className="text-2xl font-bold text-[#161522]">24</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">Total</div>
                </div>
                <div className="rounded-2xl bg-[#fff4e7] p-4">
                  <div className="text-2xl font-bold text-[#161522]">5</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">Important</div>
                </div>
                <div className="rounded-2xl bg-[#e7f6f3] p-4">
                  <div className="text-2xl font-bold text-[#161522]">8</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">This week</div>
                </div>
                <div className="rounded-2xl bg-[#f1f2f5] p-4">
                  <div className="text-2xl font-bold text-[#161522]">3</div>
                  <div className="text-xs text-[#5b5a6e] mt-1">Pinned</div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#eae8e3] bg-white p-6 shadow-sm">
              <h4 className="text-base font-semibold text-[#161522] mb-4">Quick links</h4>
              <a href="#" className="flex items-center justify-between border-t border-[#eae8e3] pt-4 first:border-t-0 first:pt-0 text-sm text-[#161522] transition hover:text-[#4a3aff]">
                <div>
                  <div className="font-semibold">Academic calendar</div>
                  <div className="text-[#5b5a6e] text-sm">View important dates and deadlines</div>
                </div>
                <div className="text-[#c8c6d4]">›</div>
              </a>
              <a href="#" className="flex items-center justify-between border-t border-[#eae8e3] pt-4 text-sm text-[#161522] transition hover:text-[#4a3aff]">
                <div>
                  <div className="font-semibold">Exam schedule</div>
                  <div className="text-[#5b5a6e] text-sm">Check upcoming exams</div>
                </div>
                <div className="text-[#c8c6d4]">›</div>
              </a>
              <a href="#" className="flex items-center justify-between border-t border-[#eae8e3] pt-4 text-sm text-[#161522] transition hover:text-[#4a3aff]">
                <div>
                  <div className="font-semibold">Assignment submission</div>
                  <div className="text-[#5b5a6e] text-sm">View pending submissions</div>
                </div>
                <div className="text-[#c8c6d4]">›</div>
              </a>
            </div>

            <div className="rounded-[24px] border border-[#eae8e3] bg-gradient-to-br from-[#efedff] to-[#f7eefb] p-6 shadow-sm">
              <h3 className="text-base font-semibold text-[#161522] mb-3">Stay in the loop</h3>
              <p className="text-sm text-[#5b5a6e] mb-5">
                Turn on notifications so you never miss an important campus announcement or timeline update.
              </p>
              <button className="inline-flex rounded-full bg-[#161522] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5b5a6e]">
                Enable notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
