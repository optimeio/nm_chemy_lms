import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UniversityPractical() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>University Practical Examination</h1>
      <p>Information and schedules for university practical exams will be here.</p>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>Back</button>
      </div>
    </div>
  );
}
