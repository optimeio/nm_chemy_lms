import React, { useState, useMemo, useRef } from 'react';

const CATEGORIES = {
  IMPORTANT: { label: "Important", color: "#f2994a" },
  EVENT: { label: "Event", color: "#0fa39a" },
  COURSE: { label: "Course", color: "#4a3aff" },
  SYSTEM: { label: "System", color: "#7c8291" },
};

const emptyForm = {
  title: "",
  description: "",
  category: "IMPORTANT",
  author: "",
  isPinned: false,
  images: [],
};

function NewAnnouncementModal({
  open = true,
  onClose = () => {},
  onSave = () => {},
  editingItem = null,
}) {
  const [form, setForm] = useState(editingItem || emptyForm);
  const [pendingFiles, setPendingFiles] = useState([]);
  const fileRef = useRef(null);

  if (!open) return null;

  const handleFileChoose = (e) => setPendingFiles(Array.from(e.target.files));

  const handleUploadImages = () => {
    if (pendingFiles.length === 0) return;
    const readers = pendingFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((results) => {
      setForm((f) => ({ ...f, images: [...f.images, ...results] }));
      setPendingFiles([]);
      if (fileRef.current) fileRef.current.value = "";
    });
  };

  const canSave = form.title.trim().length > 0 && form.description.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto">
        <div className="px-8 pt-7 pb-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            {editingItem ? "Edit announcement" : "New announcement"}
          </h2>
        </div>

        {/* Grid mirrors the screenshot exactly: left column is the form fields
            (Title / Description / Category / Author), right column holds
            Published Allocations on top and Slide Showcase Images below it. */}
        <div
          className="px-8 pb-6 grid gap-x-6 gap-y-5 text-left"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gridTemplateAreas: `
              "title       allocations"
              "description allocations"
              "category    images"
              "author      images"
            `,
          }}
        >
          <div style={{ gridArea: "title" }}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g. Practical"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div style={{ gridArea: "allocations" }} className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-800 mb-2">Published Allocations</p>
            <p className="text-sm text-slate-400">
              {form.images.length === 0
                ? "No allocations yet."
                : `${form.images.length} image(s) attached.`}
            </p>
          </div>

          <div style={{ gridArea: "description" }}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows="4"
              placeholder="Details students need to know"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div style={{ gridArea: "category" }}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {Object.entries(CATEGORIES).map(([key, c]) => (
                <option key={key} value={key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridArea: "images" }} className="border border-slate-200 rounded-xl p-4">
            <p className="text-sm font-medium text-slate-800 mb-3">Slide Showcase Images</p>
            <div className="flex items-center gap-2 mb-3">
              <label className="cursor-pointer text-sm px-3 py-1.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 transition">
                Choose Files
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChoose}
                />
              </label>
              <span className="text-xs text-slate-400 truncate">
                {pendingFiles.length > 0 ? `${pendingFiles.length} file(s) selected` : "No file chosen"}
              </span>
            </div>
            <button
              onClick={handleUploadImages}
              disabled={pendingFiles.length === 0}
              className="w-full py-2 rounded-lg font-semibold text-white text-sm transition disabled:opacity-40"
              style={{ background: "linear-gradient(90deg,#ec4899,#f472b6)" }}
            >
              Upload Images
            </button>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {form.images.map((src, i) => (
                  <img key={i} src={src} className="w-12 h-12 object-cover rounded-md border border-slate-200" />
                ))}
              </div>
            )}
          </div>

          <div style={{ gridArea: "author" }}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Author</label>
            <input
              type="text"
              placeholder="e.g. Examination Office"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-8 pb-2 flex items-center gap-2 text-left">
          <input
            id="pin"
            type="checkbox"
            checked={form.isPinned}
            onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="pin" className="text-sm text-slate-700">
            Pin this announcement
          </label>
        </div>

        <div className="px-8 py-5 mt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => canSave && onSave(form)}
            disabled={!canSave}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#4338ca,#6366f1)" }}
          >
            Save announcement
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([
    {id:1, title:"Practical exam venue changed for Day 3", desc:"The Analytics Lab session on 22 Jul 2026 has moved to Lab Block A – 305. Please update your calendar.", cat:"Important", author:"Examination Office", posted:"2 hours ago", pinned:true, images:[]},
    {id:2, title:"Webinar: Future of Data Science", desc:"Join industry experts on 25 Jul 2026 at 4:00 PM IST for an insightful session on where the field is heading next.", cat:"Event", author:"Career Services", posted:"6 hours ago", pinned:true, images:[]},
    {id:3, title:"New assignment posted in Data Structures", desc:"Assignment 4 covering binary trees and traversal algorithms is now available. Due 28 Jul 2026, 11:59 PM.", cat:"Course", author:"Prof. Menon", posted:"Yesterday", pinned:false, images:[]},
    {id:4, title:"Scheduled maintenance this weekend", desc:"The portal will be briefly unavailable on 19 Jul 2026, 1:00–2:00 AM IST, for routine maintenance.", cat:"System", author:"IT Support", posted:"2 days ago", pinned:false, images:[]},
  ]);
  const [nextId, setNextId] = useState(5);
  const [activeFilter, setActiveFilter] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [modalForm, setModalForm] = useState(emptyForm);

  const list = useMemo(() => {
    return announcements.filter(a => activeFilter === "All" || a.cat === activeFilter);
  }, [announcements, activeFilter]);

  const stats = useMemo(() => {
    return {
      total: announcements.length,
      important: announcements.filter(a => a.cat === "Important").length,
      week: announcements.filter(a => ["2 hours ago", "6 hours ago", "Yesterday"].includes(a.posted)).length,
      pinned: announcements.filter(a => a.pinned).length
    };
  }, [announcements]);

  const stripeColor = (cat) => {
    return {Important:"#e6497a", Event:"#0d9488", Course:"#4f3ff0", System:"#64748b"}[cat] || "#64748b";
  };

  const togglePin = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const deleteRow = (id) => {
    if(window.confirm("Delete this announcement?")) {
      setAnnouncements(prev => prev.filter(x => x.id !== id));
    }
  };

  const editRow = (id) => {
    const a = announcements.find(x => x.id === id);
    if(a) {
      setEditId(a.id);
      setModalForm({
        title: a.title,
        description: a.desc || "",
        category: (a.cat || "IMPORTANT").toUpperCase(),
        author: a.author || "",
        isPinned: !!a.pinned,
        images: a.images || []
      });
      setIsModalOpen(true);
    }
  };

  const openModal = () => {
    setEditId(null);
    setModalForm(emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const save = (formData) => {
    const { title, description, category, author, isPinned, images } = formData;
    
    // Map category name back to Title Case for visual badge compatibility
    const visualCat = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const finalAuthor = author.trim() || "Admin";
    
    if(editId) {
      setAnnouncements(prev => prev.map(a => 
        a.id === editId ? { ...a, title, desc: description, cat: visualCat, author: finalAuthor, pinned: isPinned, images } : a
      ));
    } else {
      setAnnouncements(prev => [
        { id: nextId, posted: "Just now", title, desc: description, cat: visualCat, author: finalAuthor, pinned: isPinned, images },
        ...prev
      ]);
      setNextId(n => n + 1);
    }
    closeModal();
  };

  return (
    <>
      <style>{`
        .admin-ann-wrapper {
          --ink:#181524;
          --ink-soft:#5c5876;
          --bg:#f6f5fb;
          --card:#ffffff;
          --line:#e8e6f2;
          --indigo:#4f3ff0;
          --indigo-deep:#2f1fb8;
          --violet:#7c6bf5;
          --amber:#f59e0b;
          --amber-bg:#fff4e0;
          --teal:#0d9488;
          --teal-bg:#e3f6f3;
          --rose:#e6497a;
          --rose-bg:#fde8ef;
          --slate:#64748b;
          --slate-bg:#eef1f6;
          --radius:16px;
          background: var(--bg);
          color: var(--ink);
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          min-height: 100vh;
        }
        .admin-ann-wrapper * { box-sizing: border-box; }
        .admin-ann-wrapper .shell { max-width: 1180px; margin: 0 auto; padding: 36px 28px 80px; }
        .admin-ann-wrapper .topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .admin-ann-wrapper .eyebrow { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--indigo); font-weight: 700; }
        .admin-ann-wrapper h1 { font-size: 32px; margin: 6px 0 4px; letter-spacing: -0.02em; }
        .admin-ann-wrapper .sub { color: var(--ink-soft); font-size: 14.5px; margin: 0; }
        .admin-ann-wrapper .new-btn { background: linear-gradient(135deg, var(--indigo), var(--indigo-deep)); color: #fff; border: none; padding: 13px 22px; border-radius: 12px; font-size: 14.5px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 20px -8px rgba(79,63,240,.55); transition: filter 0.2s; }
        .admin-ann-wrapper .new-btn:hover { filter: brightness(1.05); }
        .admin-ann-wrapper .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
        .admin-ann-wrapper .stat { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; }
        .admin-ann-wrapper .stat .n { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
        .admin-ann-wrapper .stat .l { font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }
        .admin-ann-wrapper .stat.total .n { color: var(--indigo); }
        .admin-ann-wrapper .stat.important .n { color: var(--rose); }
        .admin-ann-wrapper .stat.week .n { color: var(--teal); }
        .admin-ann-wrapper .stat.pinned .n { color: var(--amber); }
        .admin-ann-wrapper .filters { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
        .admin-ann-wrapper .filters button { border: 1px solid var(--line); background: #fff; color: var(--ink-soft); padding: 9px 16px; border-radius: 999px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .admin-ann-wrapper .filters button.active { background: var(--ink); color: #fff; border-color: var(--ink); }
        .admin-ann-wrapper table { width: 100%; border-collapse: collapse; background: var(--card); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--line); }
        .admin-ann-wrapper thead th { text-align: left; font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-soft); padding: 14px 16px; background: #fbfaff; border-bottom: 1px solid var(--line); }
        .admin-ann-wrapper tbody tr { border-bottom: 1px solid var(--line); position: relative; }
        .admin-ann-wrapper tbody tr:last-child { border-bottom: none; }
        .admin-ann-wrapper tbody tr:hover { background: #fbfaff; }
        .admin-ann-wrapper td { padding: 14px 16px; font-size: 14px; vertical-align: top; }
        .admin-ann-wrapper td.stripe-cell { width: 6px; padding: 0; }
        .admin-ann-wrapper .stripe { width: 5px; height: 100%; position: absolute; left: 0; top: 0; bottom: 0; }
        .admin-ann-wrapper .title-cell { max-width: 340px; }
        .admin-ann-wrapper .title-cell .t { font-weight: 700; font-size: 14.5px; margin-bottom: 3px; }
        .admin-ann-wrapper .title-cell .d { color: var(--ink-soft); font-size: 13px; line-height: 1.4; }
        .admin-ann-wrapper .badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .03em; padding: 4px 9px; border-radius: 999px; text-transform: uppercase; }
        .admin-ann-wrapper .badge.Important { background: var(--rose-bg); color: var(--rose); }
        .admin-ann-wrapper .badge.Event { background: var(--teal-bg); color: var(--teal); }
        .admin-ann-wrapper .badge.Course { background: #ecebfd; color: var(--indigo); }
        .admin-ann-wrapper .badge.System { background: var(--slate-bg); color: var(--slate); }
        .admin-ann-wrapper .meta { color: var(--ink-soft); font-size: 12.5px; }
        .admin-ann-wrapper .pin-toggle { background: none; border: none; cursor: pointer; font-size: 16px; color: #cfcbe4; transition: color 0.2s; }
        .admin-ann-wrapper .pin-toggle.pinned { color: var(--amber); }
        .admin-ann-wrapper .row-actions { display: flex; gap: 10px; }
        .admin-ann-wrapper .row-actions button { border: none; background: none; cursor: pointer; font-size: 12.5px; font-weight: 600; color: var(--indigo); padding: 0; transition: color 0.2s; }
        .admin-ann-wrapper .row-actions button.del { color: var(--rose); }
        .admin-ann-wrapper .empty { padding: 50px 20px; text-align: center; color: var(--ink-soft); }
      `}</style>
      
      <div className="admin-ann-wrapper">
        <div className="shell">
          <div className="topbar">
            <div>
              <div className="eyebrow">Student · Chemy LMS · Admin</div>
              <h1>Announcements</h1>
              <p className="sub">Create, pin, and manage everything students see on their announcement feed.</p>
            </div>
            <button className="new-btn" onClick={openModal}>+ New announcement</button>
          </div>

          <div className="stats">
            <div className="stat total"><div className="n">{stats.total}</div><div className="l">Total</div></div>
            <div className="stat important"><div className="n">{stats.important}</div><div className="l">Important</div></div>
            <div className="stat week"><div className="n">{stats.week}</div><div className="l">This week</div></div>
            <div className="stat pinned"><div className="n">{stats.pinned}</div><div className="l">Pinned</div></div>
          </div>

          <div className="filters">
            {['All', 'Important', 'Event', 'Course', 'System'].map(f => (
              <button 
                key={f}
                className={activeFilter === f ? 'active' : ''} 
                onClick={() => setActiveFilter(f)}
              >
                {f === 'Event' ? 'Events' : f === 'Course' ? 'Courses' : f}
              </button>
            ))}
          </div>

          <table>
            <thead>
              <tr>
                <th style={{width: 6}}></th>
                <th>Announcement</th>
                <th>Category</th>
                <th>Author</th>
                <th>Posted</th>
                <th>Pinned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty">No announcements in this category yet. Use "New announcement" to add one.</div>
                  </td>
                </tr>
              ) : (
                list.map(a => (
                  <tr key={a.id}>
                    <td className="stripe-cell"><div className="stripe" style={{background: stripeColor(a.cat)}}></div></td>
                    <td className="title-cell"><div className="t">{a.title}</div><div className="d">{a.desc}</div></td>
                    <td><span className={`badge ${a.cat}`}>{a.cat}</span></td>
                    <td className="meta">{a.author}</td>
                    <td className="meta">{a.posted}</td>
                    <td>
                      <button className={`pin-toggle ${a.pinned ? 'pinned' : ''}`} onClick={() => togglePin(a.id)}>
                        {a.pinned ? '★' : '☆'}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => editRow(a.id)}>Edit</button>
                        <button className="del" onClick={() => deleteRow(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <NewAnnouncementModal
          open={isModalOpen}
          onClose={closeModal}
          onSave={save}
          editingItem={editId ? modalForm : null}
          key={isModalOpen ? (editId || "new") : "closed"}
        />
      </div>
    </>
  );
}
