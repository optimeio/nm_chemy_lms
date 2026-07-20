import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, FileText, Users, BookOpen, Video, ClipboardList, Bell,
  Award, Mail, Settings, LogOut, Plus, Pencil, Trash2, X, Save, Pin,
  PinOff, Megaphone, Link2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// seed data (mirrors the student-facing Announcements page)
// ---------------------------------------------------------------------------

const initialFeatured = {
  badges: ["Featured", "Course update"],
  emoji: "📊",
  title: "New Power BI course is now live",
  description:
    "Master data visualization and business intelligence with our comprehensive Power BI course. Enrollment is open — build your first dashboard this week.",
  author: "Learning Team",
  date: "2026-07-12",
  ctaLabel: "View course",
};

const initialAnnouncements = [
  {
    id: "an1",
    category: "Important",
    title: "Practical exam venue changed for Day 3",
    description: "The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A – 305. Please update your calendar.",
    author: "Examination Office",
    postedAgo: "2 hours ago",
    pinned: true,
  },
  {
    id: "an2",
    category: "Events",
    title: "Webinar: Future of Data Science",
    description: "Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session on where the field is heading next.",
    author: "Career Services",
    postedAgo: "6 hours ago",
    pinned: true,
  },
  {
    id: "an3",
    category: "Courses",
    title: "New assignment posted in Data Structures",
    description: "Assignment 4 covering binary trees and traversal algorithms is now available. Due 28 Jul 2026, 11:59 PM.",
    author: "Prof. Menon",
    postedAgo: "Yesterday",
    pinned: true,
  },
  {
    id: "an4",
    category: "System",
    title: "Scheduled maintenance this weekend",
    description: "The portal will be briefly unavailable on 19 Jul 2026, 1:00–2:00 AM IST, for routine maintenance.",
    author: "IT Support",
    postedAgo: "2 days ago",
    pinned: true,
  },
];

const initialQuickLinks = [
  { id: "q1", title: "Academic calendar", subtitle: "View important dates and deadlines" },
  { id: "q2", title: "Exam schedule", subtitle: "Check upcoming exams" },
  { id: "q3", title: "Assignment submission", subtitle: "View pending submissions" },
];

const uid = (p) => `${p}${Math.random().toString(36).slice(2, 9)}`;
const CATEGORIES = ["Important", "Events", "Courses", "System"];
const categoryDot = {
  Important: "bg-amber-500", Events: "bg-emerald-500", Courses: "bg-indigo-500", System: "bg-slate-400",
};
const categoryText = {
  Important: "text-amber-600", Events: "text-emerald-600", Courses: "text-indigo-600", System: "text-slate-500",
};

const inputCls = "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const labelCls = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, subtitle, onAdd, addLabel }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function RowActions({ onEdit, onDelete, extra }) {
  return (
    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
      {extra}
      <button onClick={onEdit} className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"><Pencil size={14} /></button>
      <button onClick={onDelete} className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"><Trash2 size={14} /></button>
    </div>
  );
}

function EmptyRow({ text }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">{text}</div>;
}

function Modal({ title, onClose, children, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 space-y-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={onSave} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"><Save size={15} /> Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>{children}</label>;
}

// ---------------------------------------------------------------------------
// 1. Featured announcement (single record, edit-in-place)
// ---------------------------------------------------------------------------

function FeaturedSection({ featured, setFeatured }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(featured);

  const openEdit = () => { setDraft(featured); setOpen(true); };
  const save = () => { setFeatured(draft); setOpen(false); };

  return (
    <div>
      <SectionHeader title="Featured announcement" subtitle="The large banner shown at the top of the Announcements page." onAdd={openEdit} addLabel="Edit banner" />
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          {featured.badges.map((b) => (
            <span key={b} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{b}</span>
          ))}
        </div>
        <h3 className="text-xl font-semibold">{featured.emoji} {featured.title}</h3>
        <p className="mt-2 max-w-xl text-sm text-white/85">{featured.description}</p>
        <p className="mt-4 text-xs text-white/70">{featured.author} · {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-600">{featured.ctaLabel} →</span>
      </div>

      {open && (
        <Modal title="Edit featured announcement" onClose={() => setOpen(false)} onSave={save}>
          <Field label="Badges (comma separated)">
            <input className={inputCls} value={draft.badges.join(", ")} onChange={(e) => setDraft({ ...draft, badges: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Featured, Course update" />
          </Field>
          <Field label="Emoji"><input className={inputCls} value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} placeholder="📊" /></Field>
          <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={3} className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Posted by"><input className={inputCls} value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} /></Field>
            <Field label="Date"><input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
          </div>
          <Field label="Button label"><input className={inputCls} value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} placeholder="View course" /></Field>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Announcements list — full CRUD, filterable, pin toggle
// ---------------------------------------------------------------------------

const emptyAnnouncement = { category: "Important", title: "", description: "", author: "", postedAgo: "Just now", pinned: false };

function AnnouncementsSection({ items, setItems }) {
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);

  const openEdit = (item) => { setEditing(item.id); setDraft({ ...item }); };
  const openNew = () => { setEditing("new"); setDraft({ ...emptyAnnouncement }); };
  const save = () => {
    if (!draft.title) return;
    setItems((prev) => (editing === "new" ? [{ ...draft, id: uid("an") }, ...prev] : prev.map((i) => (i.id === draft.id ? draft : i))));
    setEditing(null);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const togglePin = (id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i)));

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div>
      <SectionHeader title="Announcements" subtitle="Everything students see in the feed, in the order it happened." onAdd={openNew} addLabel="Add announcement" />

      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.id} className="group relative rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${categoryDot[a.category]}`} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${categoryText[a.category]}`}>{a.category}</span>
              {a.pinned && <Pin size={12} className="text-rose-400" />}
            </div>
            <h4 className="pr-20 text-base font-semibold text-slate-800">{a.title}</h4>
            <p className="mt-1 text-sm text-slate-500">{a.description}</p>
            <p className="mt-3 text-xs text-slate-400">{a.postedAgo} · By {a.author}</p>
            <RowActions
              onEdit={() => openEdit(a)}
              onDelete={() => remove(a.id)}
              extra={
                <button onClick={() => togglePin(a.id)} className="rounded-lg bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200">
                  {a.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
              }
            />
          </div>
        ))}
        {filtered.length === 0 && <EmptyRow text="No announcements in this category yet." />}
      </div>

      {editing && (
        <Modal title={editing === "new" ? "Add announcement" : "Edit announcement"} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Category">
            <select className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Practical exam venue changed for Day 3" /></Field>
          <Field label="Description"><textarea rows={3} className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Posted by"><input className={inputCls} value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} placeholder="Examination Office" /></Field>
            <Field label="Posted"><input className={inputCls} value={draft.postedAgo} onChange={(e) => setDraft({ ...draft, postedAgo: e.target.value })} placeholder="2 hours ago" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} />
            Pin this announcement
          </label>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Quick links — CRUD for the sidebar shortcuts
// ---------------------------------------------------------------------------

function QuickLinksSection({ items, setItems }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const openEdit = (item) => { setEditing(item.id); setDraft({ ...item }); };
  const openNew = () => { setEditing("new"); setDraft({ id: uid("q"), title: "", subtitle: "" }); };
  const save = () => {
    if (!draft.title) return;
    setItems((prev) => (editing === "new" ? [...prev, draft] : prev.map((i) => (i.id === draft.id ? draft : i))));
    setEditing(null);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      <SectionHeader title="Quick links" subtitle="Shortcut list shown in the sidebar of the Announcements page." onAdd={openNew} addLabel="Add link" />
      <div className="space-y-3">
        {items.map((q) => (
          <div key={q.id} className="group relative flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Link2 size={16} /></div>
            <div className="flex-1 pr-16">
              <p className="text-sm font-semibold text-slate-800">{q.title}</p>
              <p className="text-xs text-slate-400">{q.subtitle}</p>
            </div>
            <RowActions onEdit={() => openEdit(q)} onDelete={() => remove(q.id)} />
          </div>
        ))}
        {items.length === 0 && <EmptyRow text="No quick links yet." />}
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add quick link" : "Edit quick link"} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Academic calendar" /></Field>
          <Field label="Subtitle"><input className={inputCls} value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} placeholder="View important dates and deadlines" /></Field>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// stats — auto-computed from the announcements list, read-only
// ---------------------------------------------------------------------------

function StatsBar({ items }) {
  const stats = useMemo(() => ([
    { label: "Total", value: items.length, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Important", value: items.filter((i) => i.category === "Important").length, tone: "bg-amber-50 text-amber-600" },
    { label: "This week", value: items.filter((i) => /hour|today|yesterday/i.test(i.postedAgo)).length, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Pinned", value: items.filter((i) => i.pinned).length, tone: "bg-rose-50 text-rose-600" },
  ]), [items]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-2xl p-4 ${s.tone}`}>
          <p className="text-2xl font-semibold">{s.value}</p>
          <p className="text-xs font-medium opacity-80">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// app shell
// ---------------------------------------------------------------------------

const SIDE_NAV = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Hackathon Manager", icon: FileText },
  { label: "User Management", icon: Users },
  { label: "Course Management", icon: BookOpen },
  { label: "Live Learning", icon: Video },
  { label: "University Practical", icon: ClipboardList },
  { label: "Announcement Management", icon: Bell, active: true },
  { label: "Certificates", icon: Award },
  { label: "Student Feedback", icon: Mail },
  { label: "Portal Settings", icon: Settings },
];

const TABS = [
  { id: "featured", label: "Featured banner" },
  { id: "announcements", label: "Announcements" },
  { id: "links", label: "Quick links" },
];

export default function AnnouncementManager() {
  const [tab, setTab] = useState("announcements");
  const [featured, setFeatured] = useState(initialFeatured);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [quickLinks, setQuickLinks] = useState(initialQuickLinks);

  return (
    <div className="p-8 w-full text-slate-800">
      <div className="mb-6 flex items-center gap-2">
        <Megaphone size={20} className="text-indigo-500" />
        <h1 className="text-xl font-semibold text-slate-800">Announcement Management</h1>
      </div>

      <div className="mb-6">
        <StatsBar items={announcements} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.id ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "featured" && <FeaturedSection featured={featured} setFeatured={setFeatured} />}
      {tab === "announcements" && <AnnouncementsSection items={announcements} setItems={setAnnouncements} />}
      {tab === "links" && <QuickLinksSection items={quickLinks} setItems={setQuickLinks} />}
    </div>
  );
}
