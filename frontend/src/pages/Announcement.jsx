import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Announcement() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 12 }}>Announcements</h1>
      <p>Latest announcements for students will be shown here.</p>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate(-1)} style={{ padding: '8px 12px' }}>Back</button>
      </div>
    </div>
  );
}
