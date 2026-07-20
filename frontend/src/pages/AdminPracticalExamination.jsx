import React, { useState, useEffect, useRef } from "react";
import { Eye, Download, ChevronLeft, ChevronRight, X, FileUp, FileText, RefreshCw, Trash2 } from "lucide-react";

const PAGE_SIZE = 5;

const styles = `
.upe-container {
  background: #F9FAFB;
  min-height: 720px;
  padding: 40px 48px;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color: #111827;
  box-sizing: border-box;
}
.upe-record {
  display: grid;
  grid-template-columns: 90px 1fr 1fr 1.4fr auto;
  align-items: center;
  gap: 16px;
}
.upe-actions {
  display: flex;
  gap: 8px;
}
.upe-pdf-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.upe-pdf-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .upe-container {
    padding: 24px 16px !important;
  }
  .upe-record {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 16px 14px !important;
  }
  .upe-actions {
    width: 100%;
    margin-top: 8px;
    gap: 8px;
  }
  .upe-actions button {
    flex: 1 1 auto;
    justify-content: center;
  }
  .upe-pdf-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .upe-pdf-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  .upe-pdf-actions button {
    flex: 1 1 auto;
    justify-content: center;
  }
}
`;

function useGoogleFont() {
  useEffect(() => {
    const id = "playfair-display-font";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

export default function AdminPracticalExamination() {
  useGoogleFont();
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [stagedPdfs, setStagedPdfs] = useState({}); // { [recordId]: file }
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const fileInputs = useRef({});

  // Fetch records on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/university-practical');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      flash("Error loading records");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageRecords = records.slice(start, start + PAGE_SIZE);

  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const triggerUpload = (id) => {
    const input = fileInputs.current[id];
    if (input) input.click();
  };

  const onFileSelected = (recordId, file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      flash("Only PDF files are allowed.");
      return;
    }
    setStagedPdfs((prev) => ({ ...prev, [recordId]: file }));
  };

  const submitPdf = async (recordId) => {
    const file = stagedPdfs[recordId];
    if (!file) {
      flash("Please select a PDF before submitting.");
      return;
    }

    setUploadingId(recordId);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/university-practical/${recordId}/pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        flash("PDF uploaded successfully");
        setStagedPdfs((prev) => {
          const next = { ...prev };
          delete next[recordId];
          return next;
        });
        await fetchRecords();
      } else {
        flash("Error uploading PDF");
      }
    } catch (err) {
      console.error('Error uploading PDF:', err);
      flash("Error uploading PDF");
    } finally {
      setUploadingId(null);
    }
  };

  const [pdfViewingUrl, setPdfViewingUrl] = useState(null);

  const viewPdf = async (recordId) => {
    try {
      const url = `/api/university-practical/${recordId}/pdf`;
      setPdfViewingUrl(url);
    } catch (err) {
      console.error('Error viewing PDF:', err);
      flash('Error opening PDF');
    }
  };

  const deletePdf = async (recordId) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/university-practical/${recordId}/pdf`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        flash("PDF deleted successfully");
        await fetchRecords();
      } else {
        flash("Error deleting PDF");
      }
    } catch (err) {
      console.error('Error deleting PDF:', err);
      flash("Error deleting PDF");
    }
  };

  const startEdit = (record) => {
    setEditingRecordId(record.id);
    setEditValues({ day: record.day, date: record.date, time: record.time, venue: record.venue });
  };

  const saveEdit = async (recordId) => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`/api/university-practical/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(editValues)
    });
    if (res.ok) {
      flash('Record updated successfully');
      setEditingRecordId(null);
      await fetchRecords();
    } else {
      flash('Error updating record');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (record) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/university-practical/${record.id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        flash('Error downloading PDF');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = record.pdfName || `Day_${record.day}_examination.pdf`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      flash('Error downloading PDF');
    }
  };

  if (loading) {
    return (
      <div style={{
        background: "#F9FAFB", minHeight: 720, padding: "40px 48px",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: "#111827",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#6B7280" }}>Loading records...</div>
      </div>
    );
  }

  return (
    <div className="upe-container">
      <style>{styles}</style>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, color: "#4338CA", marginBottom: 10 }}>
        ADMIN PORTAL
      </div>
      <h1 style={{
        fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700,
        fontSize: "clamp(26px, 3.4vw, 38px)", margin: "0 0 10px", color: "#111827",
      }}>
        University Practical Examination
      </h1>
      <p className="upe-header-desc" style={{ color: "#6B7280", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 28px" }}>
        Manage examination schedules across all 12 days. Review venue assignments, view full
        details, or download a record for offline reference. PDFs are automatically synchronized with the student dashboard.
      </p>

      <div className="upe-summary" style={{
        background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12,
        padding: "16px 22px", marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{records.length}</span>
          <span style={{ fontSize: 13.5, color: "#6B7280" }}>Records</span>
        </div>
        <span style={{ fontSize: 12.5, color: "#9CA3AF" }}>
          Showing {Math.min(start + 1, records.length)}–{Math.min(start + PAGE_SIZE, records.length)} of {records.length} records
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {pageRecords.map((r) => (
          <div
            key={r.id}
            className="upe-record"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F46E5"; e.currentTarget.style.background = "#EEF2FF"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#FFFFFF"; }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: "#4338CA" }}>Day {r.day}</div>
            <div style={{ fontSize: 13.5, color: "#111827" }}>{r.date}</div>
            <div style={{ fontSize: 13.5, color: "#6B7280" }}>{r.time}</div>
            <div style={{ fontSize: 13.5, color: "#111827" }}>{r.venue}</div>
            <div className="upe-actions">
  {r.day !== 1 && (
    <button
      onClick={() => setViewing(r)}
      title="View"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 8,
        border: "1px solid #4F46E5",
        background: "#4F46E5",
        color: "#fff",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <Eye size={14} /> View
    </button>
  )}
  <button
    onClick={() => handleDownload(r)}
    title="Download"
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "8px 14px",
      borderRadius: 8,
      border: "1px solid #D1D5DB",
      background: "#F3F4F6",
      color: "#374151",
      fontSize: 12.5,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    <Download size={14} /> Download
  </button>
  {!editingRecordId && (
    <button onClick={() => startEdit(r)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: "1px solid #4F46E5", background: "transparent", color: "#4F46E5", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
      Edit
    </button>
  )}
</div>

            <input
              ref={(el) => (fileInputs.current[r.id] = el)}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(ev) => { onFileSelected(r.id, ev.target.files[0]); ev.target.value = ""; }}
            />
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #E5E7EB", marginTop: 4, paddingTop: 12 }}>
              {stagedPdfs[r.id] ? (
                <div className="upe-pdf-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={15} color="#4338CA" />
                    <span style={{ fontSize: 12.5, color: "#111827" }}>{stagedPdfs[r.id].name} (Staged)</span>
                  </div>
                  <div className="upe-pdf-actions">
                    <button
                      onClick={() => {
                        setStagedPdfs((prev) => {
                          const next = { ...prev };
                          delete next[r.id];
                          return next;
                        });
                      }}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1px solid #FCA5A5", background: "transparent", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitPdf(r.id)}
                      disabled={uploadingId === r.id}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1px solid #4F46E5", background: "transparent", color: "#4F46E5", fontSize: 12, fontWeight: 600, cursor: uploadingId === r.id ? "not-allowed" : "pointer", opacity: uploadingId === r.id ? 0.6 : 1 }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : editingRecordId === r.id ? (
                <div className="upe-edit-form" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input type="number" value={editValues.day} onChange={e => setEditValues({ ...editValues, day: Number(e.target.value) })} placeholder="Day" style={{ padding: '4px', borderRadius: 4 }} />
                  <input type="date" value={editValues.date} onChange={e => setEditValues({ ...editValues, date: e.target.value })} style={{ padding: '4px', borderRadius: 4 }} />
                  <input type="time" value={editValues.time} onChange={e => setEditValues({ ...editValues, time: e.target.value })} style={{ padding: '4px', borderRadius: 4 }} />
                  <input type="text" value={editValues.venue} onChange={e => setEditValues({ ...editValues, venue: e.target.value })} placeholder="Venue" style={{ padding: '4px', borderRadius: 4 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => saveEdit(r.id)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #4F46E5', background: 'transparent', color: '#4F46E5', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingRecordId(null)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #FCA5A5', background: 'transparent', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : r.hasPdf ? (
                <div className="upe-pdf-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={15} color="#4338CA" />
                    <span style={{ fontSize: 12.5, color: "#111827" }}>{r.pdfName}</span>
                    <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>({formatSize(r.pdfSize)})</span>
                  </div>
                  <div className="upe-pdf-actions">
                    <button
                      onClick={() => viewPdf(r.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1px solid #D1D5DB", background: "transparent", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => triggerUpload(r.id)}
                      disabled={uploadingId === r.id}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1px solid #D1D5DB", background: "transparent", color: "#6B7280", fontSize: 12, fontWeight: 600, cursor: uploadingId === r.id ? "not-allowed" : "pointer", opacity: uploadingId === r.id ? 0.6 : 1 }}
                    >
                      <RefreshCw size={13} /> {uploadingId === r.id ? "Uploading..." : "Replace"}
                    </button>
                    <button
                      onClick={() => deletePdf(r.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1px solid #FCA5A5", background: "transparent", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => triggerUpload(r.id)}
                  disabled={uploadingId === r.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
                    borderRadius: 7, border: "1px dashed #D1D5DB", background: "transparent",
                    color: "#4338CA", fontSize: 12.5, fontWeight: 600, cursor: uploadingId === r.id ? "not-allowed" : "pointer",
                    opacity: uploadingId === r.id ? 0.6 : 1
                  }}
                >
                  <FileUp size={14} /> {uploadingId === r.id ? "Uploading..." : "Upload exam PDF"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 1}
          style={{
            display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
            borderRadius: 8, border: "1px solid #E5E7EB", background: "transparent",
            color: page === 1 ? "#D1D5DB" : "#374151", fontSize: 13,
            cursor: page === 1 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={15} /> Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            style={{
              width: 34, height: 34, borderRadius: 8, cursor: "pointer",
              border: p === page ? "1px solid #4F46E5" : "1px solid #E5E7EB",
              background: p === page ? "#4F46E5" : "transparent",
              color: p === page ? "#fff" : "#6B7280",
              fontSize: 13, fontWeight: 600,
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === totalPages}
          style={{
            display: "flex", alignItems: "center", gap: 4, padding: "8px 14px",
            borderRadius: 8, border: "1px solid #E5E7EB", background: "transparent",
            color: page === totalPages ? "#D1D5DB" : "#374151", fontSize: 13,
            cursor: page === totalPages ? "default" : "pointer",
          }}
        >
          Next <ChevronLeft size={15} />
        </button>
      </div>

      {viewing && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
          }}
          onClick={() => setViewing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14,
              padding: 28, width: 380, position: "relative",
            }}
          >
            <button
              onClick={() => setViewing(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#9CA3AF", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4338CA", letterSpacing: 1, marginBottom: 8 }}>
              EXAMINATION RECORD
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: "#111827", margin: "0 0 18px" }}>
              Day {viewing.day}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>Date</span>
                <span style={{ color: "#111827" }}>{viewing.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>Time</span>
                <span style={{ color: "#111827" }}>{viewing.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6B7280" }}>Venue</span>
                <span style={{ color: "#111827" }}>{viewing.venue}</span>
              </div>
              {viewing.hasPdf && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6B7280" }}>PDF</span>
                  <span style={{ color: "#111827", fontSize: 12 }}>{viewing.pdfName}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => handleDownload(viewing)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", marginTop: 22, padding: "11px", borderRadius: 8, border: "none",
                background: "#4F46E5", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              }}
            >
              <Download size={15} /> Download record
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "#FFFFFF", border: "1px solid #4F46E5", borderRadius: 10,
          padding: "10px 18px", color: "#111827", fontSize: 13, zIndex: 60,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
