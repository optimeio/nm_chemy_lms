import React, { useState, useEffect } from "react";
import {
  FileText, Plus, Trash2, X, Save, Search, Download,
  Zap, ZapOff, CheckCircle2, Circle, GraduationCap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// seed data (mirrors your screenshot)
// ---------------------------------------------------------------------------

const initialCertificates = [
  { id: "c1", serial: "NM-2026-001", recipient: "Arjun Mehta", course: "Data Structures", issuer: "Prof. Menon", date: "2026-06-15", status: "Issued", auto: false },
  { id: "c2", serial: "NM-2026-002", recipient: "Priya Sharma", course: "Machine Learning", issuer: "Prof. Rao", date: "2026-06-20", status: "Issued", auto: false },
  { id: "c3", serial: "NM-2026-003", recipient: "Ravi Kumar", course: "Web Development", issuer: "Prof. Menon", date: "2026-07-01", status: "Draft", auto: false },
  { id: "c4", serial: "NM-2026-004", recipient: "Sneha Iyer", course: "EV Design Sprint", issuer: "Career Services", date: "2026-07-10", status: "Pending", auto: false },
];

// student progress that drives auto-generation
const initialCompletions = [
  { id: "p1", student: "Karthik Raj", course: "Data Structures", issuer: "Prof. Menon", courseDone: true, assessmentDone: false, certId: null },
  { id: "p2", student: "Divya Nair", course: "Machine Learning", issuer: "Prof. Rao", courseDone: true, assessmentDone: true, certId: null },
  { id: "p3", student: "Mohammed Ali", course: "Web Development", issuer: "Prof. Menon", courseDone: false, assessmentDone: false, certId: null },
];

const STATUSES = ["Issued", "Draft", "Pending"];
const statusStyles = {
  Issued: "bg-emerald-50 text-emerald-600",
  Draft: "bg-amber-50 text-amber-600",
  Pending: "bg-slate-100 text-slate-500",
};

const uid = (p) => `${p}${Math.random().toString(36).slice(2, 9)}`;
const nextSerial = (list) => `NM-2026-${String(list.length + 1).padStart(3, "0")}`;
const today = () => new Date().toISOString().slice(0, 10);

const inputCls = "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

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

function StatusBadge({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${statusStyles[status]}`}>{status.toUpperCase()}</span>;
}

// ---------------------------------------------------------------------------
// Certificates table — matches your screenshot, full CRUD
// ---------------------------------------------------------------------------

const emptyForm = { recipient: "", course: "", issuer: "", date: today(), status: "Draft" };

function CertificatesTable({ certificates, setCertificates, toast }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(emptyForm);

  const openNew = () => { setEditing("new"); setDraft(emptyForm); };
  const save = () => {
    if (!draft.recipient || !draft.course) return;
    if (editing === "new") {
      setCertificates((prev) => [
        { id: uid("c"), serial: nextSerial(prev), auto: false, ...draft },
        ...prev,
      ]);
      toast("Certificate created");
    } else {
      setCertificates((prev) => prev.map((c) => (c.id === editing ? { ...c, ...draft } : c)));
      toast("Certificate updated");
    }
    setEditing(null);
  };
  const remove = (id) => { setCertificates((prev) => prev.filter((c) => c.id !== id)); toast("Certificate deleted"); };
  const download = (c) => toast(`Downloading ${c.serial}.pdf`);

  const filtered = certificates
    .filter((c) => (filter === "All" ? true : c.status === filter))
    .filter((c) => {
      const q = query.toLowerCase();
      return !q || c.recipient.toLowerCase().includes(q) || c.course.toLowerCase().includes(q) || c.serial.toLowerCase().includes(q);
    });

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-indigo-500" />
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Certificates</h1>
            <p className="text-sm text-slate-400">Issue, manage, and track course completion certificates.</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <FileText size={16} /> New Certificate
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by recipient, course, or serial..." className="w-full text-sm outline-none placeholder:text-slate-400" />
        </div>
        <div className="flex gap-2">
          {["All", ...STATUSES].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-4 py-2.5 text-sm font-medium ${filter === f ? "bg-indigo-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3">Serial</th>
              <th className="px-6 py-3">Recipient</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Issuer</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.serial}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">{c.recipient}</td>
                <td className="px-6 py-4 text-indigo-600">{c.course}</td>
                <td className="px-6 py-4 text-slate-500">{c.issuer}</td>
                <td className="px-6 py-4 text-slate-400">{c.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    {c.auto && <span title="Auto-generated" className="text-indigo-400"><Zap size={13} /></span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => download(c)} className="mr-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">
                    <Download size={14} /> Download
                  </button>
                  <button onClick={() => remove(c.id)} className="text-sm font-medium text-rose-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">No certificates match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="New certificate" onClose={() => setEditing(null)} onSave={save}>
          <Field label="Recipient"><input className={inputCls} value={draft.recipient} onChange={(e) => setDraft({ ...draft, recipient: e.target.value })} placeholder="Arjun Mehta" /></Field>
          <Field label="Course"><input className={inputCls} value={draft.course} onChange={(e) => setDraft({ ...draft, course: e.target.value })} placeholder="Data Structures" /></Field>
          <Field label="Issuer"><input className={inputCls} value={draft.issuer} onChange={(e) => setDraft({ ...draft, issuer: e.target.value })} placeholder="Prof. Menon" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date"><input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
            <Field label="Status">
              <select className={inputCls} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-generation — course + assessment completion tracker
// ---------------------------------------------------------------------------

function AutoGenerationSection({ completions, setCompletions, autoEnabled, setAutoEnabled, certificates, setCertificates, toast }) {
  const toggleField = (id, field) => {
    setCompletions((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p)));
  };

  // whenever a student finishes both course + assessment, auto-issue a certificate
  useEffect(() => {
    if (!autoEnabled) return;
    completions.forEach((p) => {
      if (p.courseDone && p.assessmentDone && !p.certId) {
        const newCert = { id: uid("c"), serial: nextSerial(certificates), recipient: p.student, course: p.course, issuer: p.issuer, date: today(), status: "Issued", auto: true };
        setCertificates((prev) => [newCert, ...prev]);
        setCompletions((prev) => prev.map((x) => (x.id === p.id ? { ...x, certId: newCert.id } : x)));
        toast(`Auto-issued certificate for ${p.student}`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completions, autoEnabled]);

  const addStudent = () => {
    setCompletions((prev) => [
      { id: uid("p"), student: "", course: "", issuer: "", courseDone: false, assessmentDone: false, certId: null },
      ...prev,
    ]);
  };
  const updateStudent = (id, key, val) => setCompletions((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: val } : p)));
  const removeStudent = (id) => setCompletions((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Auto-generation from progress</h2>
          <p className="text-sm text-slate-400">When a student completes both the course and its assessment, a certificate is issued automatically.</p>
        </div>
        <button
          onClick={() => setAutoEnabled((v) => !v)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${autoEnabled ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
        >
          {autoEnabled ? <Zap size={16} /> : <ZapOff size={16} />}
          Auto-generate {autoEnabled ? "ON" : "OFF"}
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <button onClick={addStudent} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> Track student
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Issuer</th>
              <th className="px-6 py-3">Course complete</th>
              <th className="px-6 py-3">Assessment complete</th>
              <th className="px-6 py-3">Certificate</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {completions.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-6 py-3"><input className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={p.student} onChange={(e) => updateStudent(p.id, "student", e.target.value)} placeholder="Student name" /></td>
                <td className="px-6 py-3"><input className="w-36 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={p.course} onChange={(e) => updateStudent(p.id, "course", e.target.value)} placeholder="Course" /></td>
                <td className="px-6 py-3"><input className="w-32 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" value={p.issuer} onChange={(e) => updateStudent(p.id, "issuer", e.target.value)} placeholder="Issuer" /></td>
                <td className="px-6 py-3">
                  <button onClick={() => toggleField(p.id, "courseDone")} className="flex items-center gap-1.5 text-sm">
                    {p.courseDone ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}
                    {p.courseDone ? "Done" : "Pending"}
                  </button>
                </td>
                <td className="px-6 py-3">
                  <button onClick={() => toggleField(p.id, "assessmentDone")} className="flex items-center gap-1.5 text-sm">
                    {p.assessmentDone ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-slate-300" />}
                    {p.assessmentDone ? "Done" : "Pending"}
                  </button>
                </td>
                <td className="px-6 py-3">
                  {p.certId ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">ISSUED</span> : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-400">WAITING</span>}
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => removeStudent(p.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {completions.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">No students being tracked yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component — embeds inside AdminPortal's tab system
// ---------------------------------------------------------------------------

export default function CertificatesAdmin() {
  const [tab, setTab] = useState("certificates");
  const [certificates, setCertificates] = useState(initialCertificates);
  const [completions, setCompletions] = useState(initialCompletions);
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const toast = (msg) => {
    setToastMsg(msg);
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => setToastMsg(""), 2200);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button onClick={() => setTab("certificates")} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "certificates" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
          Certificates
        </button>
        <button onClick={() => setTab("auto")} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === "auto" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
          Auto-generation rules
        </button>
      </div>

      {tab === "certificates" && (
        <CertificatesTable certificates={certificates} setCertificates={setCertificates} toast={toast} />
      )}
      {tab === "auto" && (
        <AutoGenerationSection
          completions={completions}
          setCompletions={setCompletions}
          autoEnabled={autoEnabled}
          setAutoEnabled={setAutoEnabled}
          certificates={certificates}
          setCertificates={setCertificates}
          toast={toast}
        />
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
