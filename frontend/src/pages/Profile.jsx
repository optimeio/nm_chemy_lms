import React, { useEffect, useState } from 'react';
import { User, Mail, Building2, ShieldCheck, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isDemo = token === 'demo-token';
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    if (isDemo) {
      // Load demo data from localStorage for demo sessions. If missing, derive a minimal profile from userEmail.
      const stored = localStorage.getItem('studentData');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        } catch (e) {
          setError('Invalid demo profile data');
        }
        setLoading(false);
        return;
      }

      const email = localStorage.getItem('userEmail');
      if (email) {
        const namePart = email.split('@')[0] || 'student';
        const fullName = namePart.split(/[._-]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        const derived = {
          fullName,
          email,
          phone: 'N/A',
          institution: 'N/A',
          department: 'N/A',
          registerNo: 'N/A',
          role: localStorage.getItem('userRole') || 'student',
          createdAt: new Date().toISOString(),
          bio: '',
        };
        setUser(derived);
        setLoading(false);
        return;
      }

      setError('No demo profile data found');
      setLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          // unauthorized, redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          navigate('/login');
          throw new Error('Unauthorized');
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to fetch profile');
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => setError(err.message || 'Error'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const display = (val) => (val ? val : 'N/A');

  if (loading) return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-red-600">{error}</div>
    </div>
  );

  const startEdit = () => {
    setDraft({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      institution: user.institution || '',
      role: user.role || '',
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(null);
  };

  const saveEdit = () => {
    const token = localStorage.getItem('authToken');
    fetch('/api/auth/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(draft),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to save');
        }
        return res.json();
      })
      .then((updated) => {
        setUser(updated);
        setIsEditing(false);
        setDraft(null);
      })
      .catch((err) => setError(err.message || 'Save failed'));
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your professional identity and account settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700" />
            <div className="flex flex-col items-center px-6 pb-6 -mt-12">
            <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center text-3xl font-bold text-blue-600">
              {display(user.fullName)[0]}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{display(user.fullName)}</h2>
            <p className="text-gray-500 text-sm">{display(user.email)}</p>
            {isEditing ? (
              <div className="mt-5 flex items-center gap-2">
                <button onClick={saveEdit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">Save</button>
                <button onClick={cancelEdit} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition">Cancel</button>
              </div>
            ) : (
              <button onClick={startEdit} className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition">
                <Settings size={16} />
                Edit profile
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
              <span className="text-xs font-semibold tracking-wide text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{display(user.role).toString().toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">Full name</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={draft.fullName} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">Email address</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">Phone number</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">Institutional affiliation</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={draft.institution} onChange={(e) => setDraft((d) => ({ ...d, institution: e.target.value }))} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">Access level</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} />
                  </div>
                </>
              ) : (
                <>
                  <InfoRow icon={<User size={18} />} label="Full name" value={display(user.fullName)} />
                  <InfoRow icon={<Mail size={18} />} label="Email address" value={display(user.email)} />
                  <InfoRow icon={<Mail size={18} />} label="Phone number" value={display(user.phone)} />
                  <InfoRow icon={<Building2 size={18} />} label="Institutional affiliation" value={display(user.institution)} />
                  <InfoRow icon={<ShieldCheck size={18} />} label="Access level" value={display(user.role)} />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Security & Privacy</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">Your data is secured with industry-standard encryption and following Naan Mudhalvan integration protocols.</p>
            <button className="text-blue-600 text-sm font-medium hover:underline">Change password</button>
          </div>
        </div>
      </div>
    </div>
  );
}
