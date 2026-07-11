import React from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import BrandLogo from './components/BrandLogo';

const NAV_ITEMS = [
  { icon: 'grid', label: 'Dashboard' },
  { icon: 'book', label: 'My Courses' },
  { icon: 'video', label: 'Live Classes' },
  { icon: 'file-text', label: 'Assignments / Quiz' },
  { icon: 'bell', label: 'Announcement' },
  { icon: 'file-text', label: 'University Practical Examination' },
  { icon: 'award', label: 'Hackathon' },
  { icon: 'shield', label: 'Certificates' },
  { icon: 'message-square', label: 'Feedback' },
  { icon: 'user', label: 'Profile' },
];

function Icon({ name }) {
  const paths = {
    grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    book: 'M4 4h16v16H4z',
    video: 'M4 6h12v12H4zM16 9l4-2v10l-4-2z',
    'file-text': 'M6 3h9l3 3v15H6z',
    bell: 'M6 8a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z',
    award: 'M12 2l2.5 5 5.5.8-4 4 1 5.5L12 15l-5 2.3 1-5.5-4-4 5.5-.8z',
    shield: 'M12 2l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V5z',
    'message-square': 'M4 4h16v12H8l-4 4z',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}

export default function SignInLayout({
  signInData,
  handleSignInChange,
  handleSignInSubmit,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  resetMessage,
  authAlert,
  setScreen,
}) {
  const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <BrandLogo size="lg" showTagline className="mb-1" />
        </div>

        {authAlert && <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${authAlert.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>{authAlert.message}</div>}

        <form onSubmit={handleSignInSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          </div>

          <div className="mb-5">
            <label className={labelClass}>Email</label>
            <input type="email" placeholder="your@email.com" className={inputClass} value={signInData.email} onChange={handleSignInChange('email')} />
          </div>

          <div className="mb-4">
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className={inputClass + ' pr-10'} value={signInData.password} onChange={handleSignInChange('password')} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Remember me
            </label>
            <button type="button" onClick={() => setScreen('forgotEmail')} className="text-sm font-medium text-blue-600 hover:text-blue-700">Forgot password?</button>
          </div>

          {resetMessage && <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{resetMessage}</div>}

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">Sign In <ArrowRight size={16} /></button>

          <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-gray-200" /></div>

          <p className="text-center text-sm text-gray-500">Don't have an account? <button type="button" onClick={() => setScreen('register')} className="font-semibold text-blue-600 hover:text-blue-700">Register</button></p>
        </form>
      </div>
    </div>
  );
}
