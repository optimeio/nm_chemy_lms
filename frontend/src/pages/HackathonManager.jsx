import React, { useState, useEffect } from "react";
import {
  Sparkles, Trophy, Clock, Image as ImageIcon,
  CalendarClock, HelpCircle, Plus, Pencil, Trash2, X, Save, UploadCloud,
} from "lucide-react";

// ---------------------------------------------------------------------------
// seed data
// ---------------------------------------------------------------------------

const initialStats = [
  { id: "s1", label: "Teams registered", value: "128", icon: "users" },
  { id: "s2", label: "Prize pool", value: "₹2,00,000", icon: "trophy" },
  { id: "s3", label: "Duration", value: "48 Hrs", icon: "clock" },
  { id: "s4", label: "Expert mentors", value: "24+", icon: "sparkles" },
];

const initialSpotlights = [
  {
    id: "sp1",
    tag: "Opening ceremony",
    title: "Naan Mudhalvan Hackathon 2026",
    description:
      "Join the grand opening of Tamil Nadu's premier tech hackathon and kickstart your 48-hour journey.",
  },
];

const initialAgenda = [
  { id: "a1", day: "Day 1", time: "08:00 AM", title: "Registrations & Reporting", description: "Arrive at the Naan Mudhalvan Training Block, collect your kits, and verify team registration." },
  { id: "a2", day: "Day 1", time: "09:30 AM", title: "Inaugural ceremony", description: "Keynote talks by chief guests and release of exact problem statement variations." },
  { id: "a3", day: "Day 1", time: "11:00 AM", title: "Hacking begins!", description: "The countdown starts. Brainstorming, architectural design, and repository setup." },
  { id: "a4", day: "Day 1", time: "04:00 PM", title: "First progress check", description: "Sync with floor mentors for architectural validation and tech-stack review." },
];

const initialFaqs = [
  { id: "f1", question: "What should we bring to the venue?", answer: "Bring your laptops, chargers, extension cords, water bottles, and college identity cards. Wi-Fi credentials will be provided on arrival." },
  { id: "f2", question: "Can we use pre-built components?", answer: "Any open-source library or pre-built component/template is allowed, but all core logic and project integration must be built during the 48 hours." },
  { id: "f3", question: "What is the maximum team size?", answer: "Teams must consist of 2 to 4 members. Individual participants will be assisted in team formulation during the Day 1 morning networking session." },
];

const uid = (p) => `${p}${Math.random().toString(36).slice(2, 9)}`;
const statIcons = { users: Trophy, trophy: Trophy, clock: Clock, sparkles: Sparkles };
const inputCls = "w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelCls = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left";

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, subtitle, onAdd, addLabel }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="text-left">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={16} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function RowActions({ onEdit, onDelete, light }) {
  const base = light ? "bg-white/15 text-white hover:bg-white/25" : "bg-slate-100 text-slate-500 hover:bg-slate-200";
  return (
    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
      <button onClick={onEdit} className={`rounded-lg p-1.5 ${base}`}><Pencil size={14} /></button>
      <button onClick={onDelete} className={`rounded-lg p-1.5 ${base}`}><Trash2 size={14} /></button>
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
          <button onClick={onSave} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Save size={15} /> Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block text-left"><span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>{children}</label>;
}

// ---------------------------------------------------------------------------
// 1. Publish form + Published Allocations
// ---------------------------------------------------------------------------

const emptyForm = {
  title: "",
  edition: "Naan Mudhalvan · 2026 Edition",
  launchDate: "",
  description: "",
  college: "All Colleges (Public)",
  department: "All Departments (Public)",
  studentEmail: "All Students (Public)",
  trainerEmail: "All Trainers (Public)",
};

function PublishSection({ allocations, setAllocations, usersList }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const publish = async () => {
    if (!form.title || !form.launchDate) return;
    const token = localStorage.getItem('authToken');
    
    const payload = {
      title: form.title,
      edition: form.edition,
      description: form.description,
      eventDate: new Date(form.launchDate),
      venue: "Chemy Innovation Campus, Chennai",
      stats: [
        { label: 'Teams Registered', value: '128' },
        { label: 'Prize Pool', value: '₹2,00,000' },
        { label: 'Duration', value: '48 Hrs' },
        { label: 'Expert Mentors', value: '24+' }
      ],
      timeline: [],
      targetCollege: form.college === "All Colleges (Public)" ? "" : form.college,
      targetDepartment: form.department === "All Departments (Public)" ? "" : form.department,
      targetStudentEmail: form.studentEmail === "All Students (Public)" ? "" : form.studentEmail,
      targetTrainerEmail: form.trainerEmail === "All Trainers (Public)" ? "" : form.trainerEmail,
      published: true
    };

    try {
      if (editingId) {
        setAllocations((prev) => prev.map((a) => (a.id === editingId ? { ...form, id: editingId } : a)));
      } else {
        const res = await fetch('/api/hackathon/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const fresh = await res.json();
          setAllocations((prev) => [
            {
              ...form,
              id: fresh._id || uid("alloc"),
              _id: fresh._id
            },
            ...prev
          ]);
        } else {
          setAllocations((prev) => [{ ...form, id: uid("alloc") }, ...prev]);
        }
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setAllocations((prev) => [{ ...form, id: uid("alloc") }, ...prev]);
      setForm(emptyForm);
      setEditingId(null);
    }
  };

  const editAlloc = (a) => {
    setForm({
      ...a,
      launchDate: a.launchDate ? a.launchDate.substring(0, 16) : ""
    });
    setEditingId(a.id);
  };

  const removeAlloc = async (a) => {
    const token = localStorage.getItem('authToken');
    const targetId = a._id || a.id;
    if (!confirm('Remove this hackathon?')) return;
    try {
      await fetch(`/api/hackathon/delete/${targetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
    setAllocations((prev) => prev.filter((item) => item.id !== a.id));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <div className="mb-5 flex items-center gap-2 text-left">
          <Sparkles size={18} className="text-blue-600" />
          <h2 className="text-base font-semibold text-slate-800">{editingId ? "Edit Assigned Hackathon" : "Publish Assigned Hackathon"}</h2>
        </div>

        <div className="space-y-5">
          <div>
            <span className={labelCls}>Hackathon title</span>
            <input className={inputCls} placeholder="e.g. EV Design Sprint 2026" value={form.title} onChange={update("title")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className={labelCls}>Edition</span>
              <input className={inputCls} value={form.edition} onChange={update("edition")} />
            </div>
            <div>
              <span className={labelCls}>Launch date</span>
              <input type="datetime-local" className={inputCls} value={form.launchDate} onChange={update("launchDate")} />
            </div>
          </div>

          <div>
            <span className={labelCls}>Description</span>
            <textarea rows={3} className={inputCls} placeholder="State problem statements and guidelines..." value={form.description} onChange={update("description")} />
          </div>

          <div>
            <p className={labelCls}>Assignment targeting filters</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">Target college</span>
                <select className={inputCls} value={form.college} onChange={update("college")}>
                  <option>All Colleges (Public)</option>
                  {Array.from(new Set(usersList.map(u => u.institution).filter(Boolean))).map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">Target department</span>
                <select className={inputCls} value={form.department} onChange={update("department")}>
                  <option>All Departments (Public)</option>
                  {Array.from(new Set(usersList.map(u => u.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">Specific student email</span>
                <select className={inputCls} value={form.studentEmail} onChange={update("studentEmail")}>
                  <option>All Students (Public)</option>
                  {usersList.filter(u => u.role === 'student' || !u.role).map(u => (
                    <option key={u.email} value={u.email}>{u.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 text-left">Specific trainer email</span>
                <select className={inputCls} value={form.trainerEmail} onChange={update("trainerEmail")}>
                  <option>All Trainers (Public)</option>
                  {usersList.filter(u => u.role === 'trainer').map(u => (
                    <option key={u.email} value={u.email}>{u.email}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={publish} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              {editingId ? "Update Targeted Hackathon" : "Publish Targeted Hackathon"}
            </button>
            {editingId && (
              <button onClick={() => { setForm(emptyForm); setEditingId(null); }} className="rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-500 hover:bg-slate-50">
                Cancel
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-slate-800 text-left">Published Allocations</h3>
        <div className="space-y-3">
          {allocations.map((a) => (
            <div key={a.id} className="group relative rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
              <p className="pr-14 text-sm font-semibold text-slate-800">{a.title}</p>
              <p className="text-xs text-slate-400">{a.edition}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{a.college}</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">{a.department}</span>
              </div>
              {a.launchDate && <p className="mt-2 text-[11px] text-slate-400">Launches {new Date(a.launchDate).toLocaleString()}</p>}
              <RowActions onEdit={() => editAlloc(a)} onDelete={() => removeAlloc(a)} />
            </div>
          ))}
          {allocations.length === 0 && <EmptyRow text="Nothing published yet. Fill the form and publish a targeted hackathon." />}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Slide Showcase Images
// ---------------------------------------------------------------------------

function SlideShowcaseSection({ images, setImages }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const onChoose = (e) => {
    setSelectedFiles(Array.from(e.target.files || []).slice(0, 5));
  };

  const upload = async () => {
    setUploadMessage("");
    setUploadError("");
    if (selectedFiles.length === 0) {
      setUploadError("Please select images first.");
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
        const refreshRes = await fetch('/api/hackathon/images');
        const freshImgs = refreshRes.ok ? await refreshRes.json() : [];
        setImages(freshImgs);
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

  const removeImage = async (id) => {
    if (!id || typeof id === 'number') {
      // Just filter out if it's a local fallback index
      setImages((prev) => prev.filter((i, idx) => idx !== id));
      return;
    }
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`/api/hackathon/images/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setImages((prev) => prev.filter((i) => i._id !== id));
      } else {
        console.error('Failed to delete image');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card>
      <h3 className="text-base font-semibold text-slate-800 text-left">Slide Showcase Images</h3>
      <p className="mb-4 text-sm text-slate-400 text-left">Upload pictures to update the student showcase slideshow.</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          <UploadCloud size={16} /> Choose files
          <input type="file" multiple accept="image/*" onChange={onChoose} className="hidden" />
        </label>
        <span className="text-sm text-slate-400 font-semibold">{selectedFiles.length} file(s) selected</span>
        <button onClick={upload} disabled={uploading} className="ml-auto rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          {uploading ? 'Uploading...' : 'Upload Images'}
        </button>
      </div>
      {uploadMessage && <p className="text-xs text-emerald-600 font-bold mt-1 text-left">{uploadMessage}</p>}
      {uploadError && <p className="text-xs text-rose-600 font-bold mt-1 text-left">{uploadError}</p>}

      {(selectedFiles.length > 0 || images.length > 0) && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {selectedFiles.map((p, idx) => (
            <div key={idx} className="overflow-hidden rounded-xl border-2 border-dashed border-blue-300">
              <p className="truncate px-2 py-6 text-xs text-blue-500 font-mono">Pending — {p.name}</p>
            </div>
          ))}
          {images.map((img, idx) => {
            const imgSrc = img.url || img;
            const imgName = img.name || img.originalName || `Showcase ${idx+1}`;
            return (
              <div key={img._id || idx} className="group relative overflow-hidden rounded-xl border border-slate-100">
                <img src={imgSrc} alt={imgName} className="h-24 w-full object-cover" />
                <p className="truncate px-2 py-1 text-[11px] text-slate-500">{imgName}</p>
                <button onClick={() => removeImage(img._id || idx)} className="absolute right-1.5 top-1.5 rounded-lg bg-black/50 p-1 text-white opacity-0 transition group-hover:opacity-100">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3. Stats / Spotlight / Agenda / FAQ
// ---------------------------------------------------------------------------

function StatsSection({ stats, setStats }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const openEdit = (item) => { setEditing(item.id); setDraft({ ...item }); };
  const openNew = () => { setEditing("new"); setDraft({ id: uid("s"), label: "", value: "", icon: "users" }); };
  const save = () => {
    if (!draft.label || !draft.value) return;
    setStats((prev) => (editing === "new" ? [...prev, draft] : prev.map((s) => (s.id === draft.id ? draft : s))));
    setEditing(null);
  };
  const remove = (id) => setStats((prev) => prev.filter((s) => s.id !== id));

  return (
    <div>
      <SectionHeader title="Overview stats" subtitle="The four highlight cards on the student hackathon page." onAdd={openNew} addLabel="Add stat" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          return (
            <div key={s.id} className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Trophy size={18} /></div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">{s.value}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{s.label}</p>
                </div>
              </div>
              <RowActions onEdit={() => openEdit(s)} onDelete={() => remove(s.id)} />
            </div>
          );
        })}
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add stat" : "Edit stat"} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Label"><input className={inputCls} value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Teams registered" /></Field>
          <Field label="Value"><input className={inputCls} value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value })} placeholder="128" /></Field>
          <Field label="Icon">
            <select className={inputCls} value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })}>
              <option value="users">Users</option><option value="trophy">Trophy</option><option value="clock">Clock</option><option value="sparkles">Sparkles</option>
            </select>
          </Field>
        </Modal>
      )}
    </div>
  );
}

function SpotlightSection({ items, setItems }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const openEdit = (item) => { setEditing(item.id); setDraft({ ...item }); };
  const openNew = () => { setEditing("new"); setDraft({ id: uid("sp"), tag: "", title: "", description: "" }); };
  const save = () => {
    if (!draft.title) return;
    setItems((prev) => (editing === "new" ? [...prev, draft] : prev.map((i) => (i.id === draft.id ? draft : i))));
    setEditing(null);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      <SectionHeader title="Spotlight events" subtitle="Rotating highlight banner on the student hackathon page." onAdd={openNew} addLabel="Add event" />
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="group relative rounded-2xl border border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-sm text-left">
            <span className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{it.tag || "Untitled tag"}</span>
            <h4 className="text-lg font-semibold">{it.title}</h4>
            <p className="mt-1 max-w-xl text-sm text-white/85">{it.description}</p>
            <RowActions light onEdit={() => openEdit(it)} onDelete={() => remove(it.id)} />
          </div>
        ))}
        {items.length === 0 && <EmptyRow text="No spotlight events yet." />}
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add spotlight event" : "Edit spotlight event"} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Tag"><input className={inputCls} value={draft.tag} onChange={(e) => setDraft({ ...draft, tag: e.target.value })} placeholder="Opening ceremony" /></Field>
          <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Naan Mudhalvan Hackathon 2026" /></Field>
          <Field label="Description"><textarea rows={3} className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
        </Modal>
      )}
    </div>
  );
}

function AgendaSection({ items, setItems }) {
  const [day, setDay] = useState("Day 1");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const openEdit = (item) => { setEditing(item.id); setDraft({ ...item }); };
  const openNew = () => { setEditing("new"); setDraft({ id: uid("a"), day, time: "", title: "", description: "" }); };
  const save = () => {
    if (!draft.title || !draft.time) return;
    setItems((prev) => (editing === "new" ? [...prev, draft] : prev.map((i) => (i.id === draft.id ? draft : i))));
    setEditing(null);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const filtered = items.filter((i) => i.day === day).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <SectionHeader title="Agenda & schedule" subtitle="Sessions, ceremonies and checkpoints, grouped by day." onAdd={openNew} addLabel="Add session" />
      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1 flex justify-start">
        {["Day 1", "Day 2", "Day 3"].map((d) => (
          <button key={d} onClick={() => setDay(d)} className={`rounded-lg px-4 py-1 text-sm font-medium ${day === d ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>{d}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((it) => (
          <div key={it.id} className="group relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><CalendarClock size={16} /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between pr-16">
                <h4 className="text-sm font-semibold text-slate-800">{it.title}</h4>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">{it.time}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{it.description}</p>
            </div>
            <RowActions onEdit={() => openEdit(it)} onDelete={() => remove(it.id)} />
          </div>
        ))}
        {filtered.length === 0 && <EmptyRow text={`No sessions added for ${day} yet.`} />}
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add session" : "Edit session"} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Day">
            <select className={inputCls} value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })}>
              <option>Day 1</option><option>Day 2</option><option>Day 3</option>
            </select>
          </Field>
          <Field label="Time"><input className={inputCls} value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} placeholder="08:00 AM" /></Field>
          <Field label="Title"><input className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Registrations & reporting" /></Field>
          <Field label="Description"><textarea rows={3} className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
        </Modal>
      )}
    </div>
  );
}

function FaqSection({ items, setItems }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const openEdit = (item) => { setEditing(item.id); setDraft({ ...item }); };
  const openNew = () => { setEditing("new"); setDraft({ id: uid("f"), question: "", answer: "" }); };
  const save = () => {
    if (!draft.question) return;
    setItems((prev) => (editing === "new" ? [...prev, draft] : prev.map((i) => (i.id === draft.id ? draft : i))));
    setEditing(null);
  };
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      <SectionHeader title="Frequently asked questions" subtitle="Shown in the help panel on the student hackathon page." onAdd={openNew} addLabel="Add question" />
      <div className="space-y-3">
        {items.map((f) => (
          <div key={f.id} className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-left">
            <h4 className="pr-16 text-sm font-semibold text-slate-800">{f.question}</h4>
            <p className="mt-1 text-sm text-slate-500">{f.answer}</p>
            <RowActions onEdit={() => openEdit(f)} onDelete={() => remove(f.id)} />
          </div>
        ))}
        {items.length === 0 && <EmptyRow text="No FAQs added yet." />}
      </div>
      {editing && (
        <Modal title={editing === "new" ? "Add question" : "Edit question"} onClose={() => setEditing(null)} onSave={save}>
          <Field label="Question"><input className={inputCls} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="What should we bring to the venue?" /></Field>
          <Field label="Answer"><textarea rows={4} className={inputCls} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} /></Field>
        </Modal>
      )}
    </div>
  );
}

const TABS = [
  { id: "publish", label: "Publish & allocations" },
  { id: "slides", label: "Slide showcase" },
  { id: "stats", label: "Stats" },
  { id: "spotlight", label: "Spotlight events" },
  { id: "agenda", label: "Agenda & schedule" },
  { id: "faq", label: "FAQs" },
];

export default function HackathonManager({ dbHackathonsList = [], usersList = [] }) {
  const [tab, setTab] = useState("publish");
  const [allocations, setAllocations] = useState([]);
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState(initialStats);
  const [spotlights, setSpotlights] = useState(initialSpotlights);
  const [agenda, setAgenda] = useState(initialAgenda);
  const [faqs, setFaqs] = useState(initialFaqs);

  useEffect(() => {
    if (dbHackathonsList.length > 0) {
      setAllocations(dbHackathonsList.map(h => ({
        id: h._id,
        _id: h._id,
        title: h.title || "",
        edition: h.edition || "",
        launchDate: h.eventDate || "",
        description: h.description || "",
        college: h.targetCollege || "All Colleges (Public)",
        department: h.targetDepartment || "All Departments (Public)",
        studentEmail: h.targetStudentEmail || "All Students (Public)",
        trainerEmail: h.targetTrainerEmail || "All Trainers (Public)"
      })));
    }
  }, [dbHackathonsList]);

  useEffect(() => {
    fetch('/api/hackathon/images')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setImages(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 text-left font-sans">Hackathon Manager</h1>
        <p className="text-sm text-slate-500 mt-1 text-left font-semibold">Assign hackathons targeting specific colleges, departments, trainers, or students.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3 flex-start">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === t.id ? "bg-blue-600 text-white shadow-md font-semibold" : "text-slate-500 hover:bg-slate-100 font-semibold"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "publish" && (
          <PublishSection 
            allocations={allocations} 
            setAllocations={setAllocations} 
            usersList={usersList} 
          />
        )}
        {tab === "slides" && (
          <SlideShowcaseSection 
            images={images} 
            setImages={setImages} 
          />
        )}
        {tab === "stats" && (
          <StatsSection 
            stats={stats} 
            setStats={setStats} 
          />
        )}
        {tab === "spotlight" && (
          <SpotlightSection 
            items={spotlights} 
            setItems={setSpotlights} 
          />
        )}
        {tab === "agenda" && (
          <AgendaSection 
            items={agenda} 
            setItems={setAgenda} 
          />
        )}
        {tab === "faq" && (
          <FaqSection 
            items={faqs} 
            setItems={setFaqs} 
          />
        )}
      </div>
    </div>
  );
}
