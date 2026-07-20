import React, { useState, useEffect } from "react";
import { Eye, Download, ChevronLeft, ChevronRight, X, FileText, Menu, Bell } from "lucide-react";

const PAGE_SIZE = 5;

// Responsive CSS for mobile-friendly layout
const styles = `
.upe-row {
  display: grid;
  grid-template-columns: 70px minmax(0,1fr) minmax(0,1fr) minmax(0,1.3fr) auto;
  align-items: center;
  gap: 12px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.15s, background 0.15s;
}
.upe-row:hover {
  border-color: #4F46E5;
  background: #EEF2FF;
}
.upe-day { font-weight: 700; color: #4338CA; font-size: 14px; }
.upe-actions { display: flex; gap: 8px; flex-shrink: 0; }
.upe-actions button {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
  cursor: pointer; white-space: nowrap; border: 1px solid #D1D5DB;
}
.upe-view { border: 1px solid #4F46E5; background: #4F46E5; color: #fff; }
.upe-dl { border: 1px solid #D1D5DB; background: #F3F4F6; color: #374151; }
.upe-pdf-section { grid-column: 1 / -1; border-top: 1px solid #E5E7EB; margin-top: 4px; padding-top: 12px; }
.upe-pdf-info { display: flex; align-items: center; gap: 12px; font-size: 12.5px; }
.upe-pdf-name { display: flex; align-items: center; gap: 8px; }
.upe-pdf-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 7px; border: 1px solid #4F46E5; background: #4F46E5; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.upe-no-pdf { font-size: 12.5px; color: #9CA3AF; font-style: italic; }

@media (max-width: 640px) {
  .upe-row {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 12px 12px;
  }
  .upe-row > div:not(.upe-actions):not(.upe-pdf-section) { padding: 2px 0; }
  .upe-day { font-weight: 700; color: #4338CA; font-size: 14px; margin-bottom: 2px; }
  .upe-meta { font-size: 12px; color: #6B7280; margin-bottom: 1px; }
  .upe-time { word-wrap: break-word; overflow-wrap: break-word; }
  .upe-actions { width: 100%; margin-top: 8px; gap: 6px; }
  .upe-actions button { flex: 1; justify-content: center; font-size: 12px; padding: 7px 8px; }
  .upe-pdf-section { margin-top: 8px; padding-top: 8px; }
  .upe-pdf-info { flex-direction: column; gap: 8px; }
  .upe-pdf-name { flex-direction: column; gap: 4px; align-items: flex-start; }
  .upe-pdf-btn { width: 100%; justify-content: center; font-size: 11px; padding: 6px 10px; }
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

export default function UniversityPractical() {
  useGoogleFont();
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(records.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageRecords = records.slice(start, start + PAGE_SIZE);

  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

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
        <div style={{ fontSize: 16, fontWeight: 600, color: "#6B7280" }}>Loading examination schedule...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#F9FAFB", minHeight: 720, overflowX: "hidden",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: "#111827",
    }}>
      <style>{styles}</style>

      <div style={{ padding: "20px", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, color: "#4338CA", marginBottom: 8 }}>
          STUDENT PORTAL
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700,
          fontSize: "clamp(22px, 6vw, 30px)", margin: "0 0 10px", lineHeight: 1.25, color: "#111827",
        }}>
          University Practical Examination
        </h1>
        <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
          View your examination schedule across all 12 days. Review venue assignments and download examination materials and PDFs published by the administration.
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 12,
          padding: "14px 18px", marginBottom: 20, flexWrap: "wrap", gap: 6
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{records.length}</span>
            <span style={{ fontSize: 13, color: "#6B7280" }}>Examinations</span>
          </div>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>
            Showing {Math.min(start + 1, records.length)}–{Math.min(start + PAGE_SIZE, records.length)} of {records.length}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {pageRecords.map((r) => (
            <div key={r.id}>
              <div className="upe-row">
                <div className="upe-day">Day {r.day}</div>
                <div style={{ fontSize: 13.5 }}>{r.date}</div>
                <div className="upe-time" style={{ fontSize: 13.5, color: "#6B7280" }}>{r.time}</div>
                <div style={{ fontSize: 13.5, color: "#111827" }}>{r.venue}</div>
                <div className="upe-actions">
                  <button className="upe-dl" onClick={() => handleDownload(r)} title="Download record">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
              <div className="upe-pdf-section">
                {r.hasPdf ? (
                  <div className="upe-pdf-info">
                    <div className="upe-pdf-name">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={15} color="#4338CA" />
                        <span>{r.pdfName}</span>
                      </div>
                      <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>({formatSize(r.pdfSize)})</span>
                    </div>
                    <button
                      className="upe-pdf-btn"
                      onClick={() => window.open(`/api/university-practical/${r.id}/pdf`, '_blank')}
                    >
                      <Eye size={13} /> View PDF
                    </button>
                  </div>
                ) : (
                  <div className="upe-no-pdf">
                    No examination PDF available yet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => goTo(page - 1)} disabled={page === 1} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "transparent", fontSize: 13, color: page === 1 ? "#D1D5DB" : "#374151", cursor: page === 1 ? "default" : "pointer" }}>Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => goTo(p)} style={{ width: 32, height: 32, borderRadius: 8, border: p === page ? "1px solid #4F46E5" : "1px solid #E5E7EB", background: p === page ? "#4F46E5" : "transparent", color: p === page ? "#fff" : "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{p}</button>
          ))}
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #E5E7EB", background: "transparent", fontSize: 13, color: page === totalPages ? "#D1D5DB" : "#374151", cursor: page === totalPages ? "default" : "pointer" }}>Next</button>
        </div>
      </div>

      {viewing && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
          <div style={{
            background: "#FFFFFF", borderRadius: 12, padding: "28px", maxWidth: 500, width: "90%", maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, margin: 0 }}>Day {viewing.day}</h2>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                <X size={20} color="#6B7280" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 4 }}>DATE</div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: "#111827" }}>{viewing.date}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 4 }}>TIME</div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: "#111827" }}>{viewing.time}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 4 }}>VENUE</div>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: "#111827" }}>{viewing.venue}</div>
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.5, marginBottom: 4 }}>PDF</div>
                {viewing.hasPdf ? (
                  <div style={{ fontSize: 13.5, color: "#4F46E5", textDecoration: "underline", cursor: "pointer" }} onClick={() => window.open(`/api/university-practical/${viewing.id}/pdf`, '_blank')}>
                    {viewing.pdfName} ({formatSize(viewing.pdfSize)})
                  </div>
                ) : (
                  <div style={{ fontSize: 13.5, color: "#9CA3AF" }}>Not available</div>
                )}
              </div>
            </div>
            <button onClick={() => setViewing(null)} style={{ width: "100%", marginTop: 20, padding: "10px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#FFFFFF", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
