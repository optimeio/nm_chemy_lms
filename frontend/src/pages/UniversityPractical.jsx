import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UniversityPractical() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const records = [
    { day: 'Day 1', date: '18 Jul 2026', time: '10:00 AM', venue: 'Lab Block A - 204' },
    { day: 'Day 2', date: '20 Jul 2026', time: '01:30 PM', venue: 'CS Lab 3' },
    { day: 'Day 3', date: '22 Jul 2026', time: '09:00 AM', venue: 'Analytics Lab' },
    { day: 'Day 4', date: '25 Jul 2026', time: '11:00 AM', venue: 'Lab Block B - 101' },
    { day: 'Day 5', date: '05 Jul 2026', time: '10:00 AM', venue: 'Lab Block A - 204' },
    { day: 'Day 6', date: '03 Jul 2026', time: '02:00 PM', venue: 'CS Lab 1' },
    { day: 'Day 7', date: '28 Jun 2026', time: '09:30 AM', venue: 'CS Lab 2' },
    { day: 'Day 8', date: '27 Jul 2026', time: '10:00 AM', venue: 'AI Research Lab' },
    { day: 'Day 9', date: '30 Jul 2026', time: '01:00 PM', venue: 'Lab Block A - 301' },
    { day: 'Day 10', date: '01 Aug 2026', time: '10:30 AM', venue: 'Seminar Hall 2' },
    { day: 'Day 11', date: '22 Jun 2026', time: '11:00 AM', venue: 'Cloud Lab' },
    { day: 'Day 12', date: '04 Aug 2026', time: '09:00 AM', venue: 'Lab Block B - 202' },
  ];

  const pageSize = 5;
  const totalPages = Math.ceil(records.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pageRecords = records.slice(start, start + pageSize);

  const goTo = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const IconBtn = ({ type }) => (
    <button
      className="btn-icon inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
      style={
        type === 'view'
          ? { color: '#93c5fd', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }
          : { color: '#d1d5db', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }
      }
    >
      {type === 'view' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          View
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen text-gray-200 px-4 py-10 md:px-10" style={{ backgroundColor: '#0B0F1A' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-indigo-400 font-semibold mb-2">Student Portal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              University Practical Examination
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">Schedules, venues and results for your practical examinations.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Summary bar */}
        <div className="flex flex-wrap items-center gap-3 mt-6 mb-5">
          <div
            className="rounded-xl px-4 py-2.5 text-sm text-gray-300"
            style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <span className="text-white font-semibold">12</span> Records
          </div>
        </div>

        {/* Records table */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(10px)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
                  <th className="px-5 py-4 font-semibold">Days</th>
                  <th className="px-5 py-4 font-semibold">Date</th>
                  <th className="px-5 py-4 font-semibold">Time</th>
                  <th className="px-5 py-4 font-semibold">Venue</th>
                  <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pageRecords.map((record, idx) => (
                  <tr
                    key={idx}
                    className="row-hover transition"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="px-5 py-4 text-white font-medium">{record.day}</td>
                    <td className="px-5 py-4 text-gray-300">{record.date}</td>
                    <td className="px-5 py-4 text-gray-300">{record.time}</td>
                    <td className="px-5 py-4 text-gray-300">{record.venue}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <IconBtn type="view" />
                        <IconBtn type="download" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/10" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <p className="text-xs text-gray-500">
              Showing {start + 1}–{Math.min(start + pageSize, records.length)} of {records.length} records
            </p>
            <div className="flex items-center gap-1.5">
              {/* Previous button */}
              <button
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goTo(page)}
                  className="page-btn w-8 h-8 rounded-lg text-sm font-medium transition"
                  style={
                    page === currentPage
                      ? {
                        background: 'linear-gradient(135deg, #2A4BD9 0%, #4338CA 100%)',
                        color: 'white',
                      }
                      : {
                        color: '#9ca3af',
                      }
                  }
                  onMouseEnter={(e) => page !== currentPage && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => page !== currentPage && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
