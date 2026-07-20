import React, { useState } from "react";
import {
  Bell,
  ArrowLeft,
  ChevronRight,
  Clock,
  Pin,
  Calendar,
  ClipboardList,
  FileText,
  User,
} from "lucide-react";

const FILTERS = ["All", "Important", "Events", "Courses", "System"];

const ANNOUNCEMENTS = [
  {
    tag: "Important",
    color: "text-amber-600",
    dot: "bg-amber-500",
    title: "Practical exam venue changed for Day 3",
    body: "The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A – 305. Please update your calendar.",
    time: "2 hours ago",
    by: "Examination Office",
  },
  {
    tag: "Event",
    color: "text-teal-600",
    dot: "bg-teal-500",
    title: "Webinar: Future of Data Science",
    body: "Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session on where the field is heading next.",
    time: "6 hours ago",
    by: "Career Services",
  },
  {
    tag: "Course",
    color: "text-indigo-600",
    dot: "bg-indigo-500",
    title: "New assignment posted in Data Structures",
    body: "Assignment 4 covering binary trees and traversal algorithms is now available. Due 28 Jul 2026, 11:59 PM.",
    time: "Yesterday",
    by: "Prof. Menon",
  },
  {
    tag: "System",
    color: "text-slate-500",
    dot: "bg-slate-400",
    title: "Scheduled maintenance this weekend",
    body: "The portal will be briefly unavailable on 19 Jul 2026, 1:00–2:00 AM IST, for routine maintenance.",
    time: "2 days ago",
    by: "IT Support",
  },
];

const STATS = [
  { label: "Total", value: 24, bg: "bg-violet-50", text: "text-violet-900" },
  { label: "Important", value: 5, bg: "bg-orange-50", text: "text-orange-900" },
  { label: "This week", value: 8, bg: "bg-emerald-50", text: "text-emerald-900" },
  { label: "Pinned", value: 3, bg: "bg-rose-50", text: "text-rose-900" },
];

const QUICK_LINKS = [
  { title: "Academic calendar", sub: "View important dates and deadlines", icon: Calendar },
  { title: "Exam schedule", sub: "Check upcoming exams", icon: ClipboardList },
  { title: "Assignment submission", sub: "View pending submissions", icon: FileText },
];

function TopBar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-[11px] tracking-wide text-slate-400 font-medium">
          STUDENT · CHEMY LMS
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">
          Everything you need to know, in the order it happened.
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* We can keep this empty or rely on StudentHeader from the parent */}
      </div>
    </div>
  );
}

function FeaturedBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-6 mb-6">
      <div className="flex gap-2 mb-4">
        <span className="text-[11px] font-medium bg-white/15 px-2.5 py-1 rounded-full">
          FEATURED
        </span>
        <span className="text-[11px] font-medium bg-white/15 px-2.5 py-1 rounded-full">
          COURSE UPDATE
        </span>
      </div>
      <h2 className="text-xl font-semibold mb-2">📊 New Power BI course is now live</h2>
      <p className="text-sm text-indigo-100 max-w-xl leading-relaxed mb-4">
        Master data visualization and business intelligence with our comprehensive
        Power BI course. Enrollment is open — build your first dashboard this week.
      </p>
      <p className="text-xs text-indigo-200 mb-4">Learning Team · July 12, 2026</p>
      <button className="bg-white text-indigo-700 text-sm font-medium px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors">
        View course →
      </button>
    </div>
  );
}

function FilterPills({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
            active === f
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function AnnouncementCard({ item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
        <span className={`text-[11px] font-semibold tracking-wide uppercase ${item.color}`}>
          {item.tag}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-1.5">{item.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{item.body}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {item.time}
            </span>
            <span className="flex items-center gap-1">
              <User size={12} /> By {item.by}
            </span>
          </div>
        </div>
        <Pin size={16} className="text-rose-400 shrink-0 mt-1" />
      </div>
    </div>
  );
}

function StatsPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
      <h4 className="font-semibold text-slate-900 mb-4">Announcement stats</h4>
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickLinksPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
      <h4 className="font-semibold text-slate-900 mb-3">Quick links</h4>
      <div className="flex flex-col divide-y divide-slate-100">
        {QUICK_LINKS.map(({ title, sub, icon: Icon }) => (
          <button
            key={title}
            className="flex items-center justify-between py-3 text-left group"
          >
            <div className="flex items-center gap-3">
              <Icon size={16} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-800">{title}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-300 group-hover:text-slate-500 transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function NotificationPanel() {
  return (
    <div className="rounded-2xl bg-violet-50 p-5">
      <h4 className="font-semibold text-slate-900 mb-1.5">Stay in the loop</h4>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        Turn on notifications so you never miss an important campus announcement or
        timeline update.
      </p>
      <button className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-full hover:bg-slate-800 transition-colors">
        Enable notifications
      </button>
    </div>
  );
}

export default function ChemyAnnouncements() {
  const [filter, setFilter] = useState("All");

  const visible =
    filter === "All"
      ? ANNOUNCEMENTS
      : ANNOUNCEMENTS.filter((a) => a.tag === filter.replace(/s$/, ""));

  return (
    <div className="min-h-full bg-slate-50 flex text-slate-800">
      <main className="flex-1 px-6 lg:px-10 py-8 max-w-7xl mx-auto w-full">
        <TopBar />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <FeaturedBanner />

            <div className="flex items-center justify-between mb-1">
              <FilterPills active={filter} onChange={setFilter} />
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
              <ArrowLeft size={14} />
              <span>Back to dashboard</span>
            </div>

            {visible.map((item) => (
              <AnnouncementCard key={item.title} item={item} />
            ))}

            {visible.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-10">
                No announcements in this category yet.
              </p>
            )}

            <button className="w-full text-center text-sm text-indigo-600 font-medium border border-slate-200 rounded-xl py-3 bg-white hover:bg-slate-50 transition-colors">
              Load more announcements ↓
            </button>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <StatsPanel />
            <QuickLinksPanel />
            <NotificationPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
