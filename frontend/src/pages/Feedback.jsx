import { useState } from "react";
import { Send, Smile, Meh, Frown, Star, MessagesSquare } from "lucide-react";

const MOODS = [
  { key: "great", label: "Great", icon: Smile, color: "#16A34A", border: "border-emerald-200" },
  { key: "okay", label: "Okay", icon: Meh, color: "#EA580C", border: "border-orange-200" },
  { key: "needs_work", label: "Needs work", icon: Frown, color: "#DC2626", border: "border-red-200" },
];

function SectionBadge({ children }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-white">
      {children}
    </div>
  );
}

export default function Feedback() {
  const [mood, setMood] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail') || 'Anonymous Student';

      const feedbackData = {
        student: userEmail,
        email: userEmail,
        rating: mood,
        text: comment,
        message: comment
      };

      console.log('=== FEEDBACK SUBMISSION DEBUG ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Token exists:', !!token);
      console.log('User Email:', userEmail);
      console.log('Feedback Data:', feedbackData);
      console.log('Request URL:', `${API_BASE_URL}/api/announcements/feedback/submit`);
      console.log('Request Headers:', { 'Content-Type': 'application/json' });

      const response = await fetch(`${API_BASE_URL}/api/announcements/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Response Headers:', Object.fromEntries(response.headers));

      let responseData;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          const text = await response.text();
          console.error('❌ Response is not JSON. Content-Type:', contentType);
          console.error('Response text (first 500 chars):', text.substring(0, 500));
          throw new Error(`Server returned ${contentType || 'unknown'} instead of JSON`);
        }
      } catch (parseErr) {
        console.error('❌ Failed to parse response:', parseErr.message);
        throw parseErr;
      }

      console.log('Response Body:', responseData);

      if (!response.ok) {
        const errorMessage = responseData?.message || responseData?.error || `HTTP ${response.status}`;
        console.error('API Error Response:', responseData);
        throw new Error(`Failed to submit feedback: ${errorMessage}`);
      }

      console.log('✅ Feedback submitted successfully');
      setSubmitted(true);
    } catch (err) {
      const errorMsg = err.message || 'Failed to submit feedback. Please try again.';
      console.error('❌ Feedback submission error:', errorMsg);
      console.error('Error details:', err);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 px-8 py-10 text-white shadow-lg shadow-indigo-200">
          <h1
            className="flex items-center gap-2 text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            We'd love your feedback <span>✨</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-indigo-100">
            Two minutes from you helps us improve every course on Fermion Mirror LMS.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-8 py-14 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Send size={22} className="text-emerald-500" />
            </div>
            <h2
              className="mt-4 text-xl font-semibold text-slate-800"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Thanks for sharing that
            </h2>
            <p className="mt-1 text-sm text-slate-500">Your response has been recorded.</p>
            <button
              type="button"
              onClick={() => {
                setMood(null);
                setComment("");
                setSubmitted(false);
              }}
              className="mt-6 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              Submit another response
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-semibold">
                {error}
              </div>
            )}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <SectionBadge>
                  <Star size={14} className="fill-blue-600 text-blue-600" />
                </SectionBadge>
                <h2 className="text-base font-semibold text-slate-800">
                  1. How would you rate your learning experience?
                </h2>
              </div>
              <p className="mb-4 pl-9 text-sm text-slate-500">
                Your rating helps us understand what we're doing well and where we can improve.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {MOODS.map(({ key, label, icon: Icon, color, border }) => {
                  const active = mood === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMood(key)}
                      className={`flex flex-col items-center gap-2 rounded-xl border py-6 transition-all ${
                        active ? `${border} bg-slate-50 shadow-sm` : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon size={30} strokeWidth={1.75} color={color} />
                      <span className="text-sm font-medium" style={{ color }}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div>
              <div className="mb-1 flex items-center gap-2">
                <SectionBadge>
                  <MessagesSquare size={14} className="text-blue-600" />
                </SectionBadge>
                <h2 className="text-base font-semibold text-slate-800">
                  2. Share your feedback or suggestions
                </h2>
              </div>
              <p className="mb-4 pl-9 text-sm text-slate-500">
                Your feedback helps us improve the learning experience for everyone.
              </p>

              <textarea
                rows={8}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please share your feedback, suggestions, or any issues you faced during the course..."
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={16} />
                  Submit feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
