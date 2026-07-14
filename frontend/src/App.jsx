import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import SignInLayout from './SignInLayout';
import StudentDashboard from "./StudentDashboard";
import AdminPortal from "./pages/AdminPortal";
import Hackathon from "./pages/Hackathon";
import Announcement from "./pages/Announcement";
import Feedback from "./pages/Feedback";
import Certificates from "./pages/Certificates";
import UniversityPractical from "./pages/UniversityPractical";
import Profile from "./pages/Profile";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || 'http://localhost:5000';

function ChemyAuth() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpFields, setOtpFields] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [authAlert, setAuthAlert] = useState(null); // { type: 'error'|'success', message: string }

  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({
    fullName: "",
    fatherName: "",
    gender: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
    collegeName: "",
    collegeCode: "",
    registerNo: "",
    department: "",
    year: "",
    district: "",
  });

  const inputClass =
    "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  const handleSignInChange = (field) => (e) =>
    setSignInData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleRegChange = (field) => (e) =>
    setRegData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSignInSubmit = (e) => {
    e.preventDefault();

    const email = signInData.email.trim();
    const password = signInData.password;

    if (!email || !password) {
      return;
    }
    // Call backend login
    // Clear previous alerts
    setAuthAlert(null);

    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Invalid credentials');
        }
        return res.json();
      })
      .then((data) => {
        const token = data.token;
        const role = data.role || 'student';
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
        // show a brief success message then navigate
        setAuthAlert({ type: 'success', message: 'Signed in successfully. Redirecting…' });
        setTimeout(() => {
          if (role === 'admin') navigate('/dashboard/admin');
          else navigate('/dashboard/student');
        }, 500);
      })
      .catch((err) => {
        const msg = err && err.message ? err.message : 'Login failed';
        // map common network errors to friendlier messages
        const friendly = msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Unable to reach server. Please check your network or backend server.'
          : msg;
        setAuthAlert({ type: 'error', message: friendly });
      });
  };

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleForgotPasswordRequest = (e) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();

    if (!email) {
      setResetMessage("Please enter your student email.");
      return;
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    localStorage.setItem(`passwordOtp:${email}`, otp);
    localStorage.setItem(`passwordOtpExpiry:${email}`, expiresAt.toString());
    setOtpFields(["", "", "", "", "", ""]);
    setOtpSent(true);
    setOtpVerified(false);
    setOtpTimer(60);
    setResetMessage(`A 6-digit verification code has been sent to ${email}.`);
    setScreen("verifyOtp");
  };

  const handleOtpFieldChange = (index) => (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const nextFields = [...otpFields];
    nextFields[index] = value;
    setOtpFields(nextFields);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();
    const enteredCode = otpFields.join("");
    const storedOtp = localStorage.getItem(`passwordOtp:${email}`);
    const expiry = Number(localStorage.getItem(`passwordOtpExpiry:${email}`) || "0");

    if (!enteredCode || enteredCode.length !== 6) {
      setResetMessage("Enter the full 6-digit code.");
      return;
    }

    if (Date.now() > expiry) {
      setResetMessage("OTP expired. Request a new code.");
      setScreen("forgotEmail");
      setOtpSent(false);
      return;
    }

    if (enteredCode !== storedOtp) {
      setResetMessage("Incorrect code. Please try again.");
      return;
    }

    setOtpVerified(true);
    setResetMessage("Code verified. Enter your new password below.");
    setScreen("resetPassword");
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();

    if (!otpVerified) {
      setResetMessage("Verify your OTP before resetting the password.");
      return;
    }

    if (!newPassword.trim()) {
      setResetMessage("Please enter a new password.");
      return;
    }

    localStorage.setItem(`userPassword:${email}`, newPassword);
    setSignInData({ email, password: newPassword });
    setScreen("signin");
    setOtpSent(false);
    setOtpVerified(false);
    setOtpFields(["", "", "", "", "", ""]);
    setNewPassword("");
    setResetMessage(`Password updated for ${email}. You can sign in now.`);
  };

  const handleResendOtp = () => {
    if (!resetEmail.trim()) return;
    const email = resetEmail.trim().toLowerCase();
    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    localStorage.setItem(`passwordOtp:${email}`, otp);
    localStorage.setItem(`passwordOtpExpiry:${email}`, expiresAt.toString());
    setOtpFields(["", "", "", "", "", ""]);
    setOtpTimer(60);
    setResetMessage(`A new OTP was sent to ${email}.`);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (!regData.fullName.trim() || !regData.email.trim() || !regData.password.trim()) {
      return;
    }

    setAuthAlert(null);

    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: regData.fullName,
        email: regData.email,
        password: regData.password
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Registration failed');
        }
        return res.json();
      })
      .then((data) => {
        const token = data.token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', regData.email);
        localStorage.setItem('studentData', JSON.stringify(regData));
        setAuthAlert({ type: 'success', message: 'Account created successfully. Redirecting…' });
        setTimeout(() => {
          navigate('/dashboard/student');
        }, 500);
      })
      .catch((err) => {
        const msg = err && err.message ? err.message : 'Registration failed';
        const friendly = msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Unable to reach server. Please check your network or backend server.'
          : msg;
        setAuthAlert({ type: 'error', message: friendly });
      });
  };

  const handleBackToSignIn = () => {
    setScreen("signin");
    setResetMessage("");
    setOtpFields(["", "", "", "", "", ""]);
    setOtpVerified(false);
    setOtpSent(false);
    setNewPassword("");
  };

  useEffect(() => {
    if (screen !== "verifyOtp" || otpTimer <= 0) {
      return;
    }

    const timerId = setTimeout(() => setOtpTimer((time) => Math.max(time - 1, 0)), 1000);
    return () => clearTimeout(timerId);
  }, [screen, otpTimer]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {screen === 'signin' && (
          <SignInLayout
            signInData={signInData}
            handleSignInChange={handleSignInChange}
            handleSignInSubmit={handleSignInSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            resetMessage={resetMessage}
            authAlert={authAlert}
            setScreen={setScreen}
          />
        )}

        {screen === "register" && (
          <form onSubmit={handleRegisterSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
              <p className="text-gray-500 text-sm mt-1">to get started with Chemy LMS</p>
            </div>

            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-3">PERSONAL DETAILS</p>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <input placeholder="Full Name" className={inputClass} value={regData.fullName} onChange={handleRegChange("fullName")} />
              <input placeholder="Father's Name" className={inputClass} value={regData.fatherName} onChange={handleRegChange("fatherName")} />
              <select className={inputClass} value={regData.gender} onChange={handleRegChange("gender")}>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input type="date" className={inputClass} value={regData.dob} onChange={handleRegChange("dob")} />
            </div>

            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-3">CONTACT & SECURITY</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Mobile" className={inputClass} value={regData.mobile} onChange={handleRegChange("mobile")} />
              <input type="email" placeholder="your@email.com" className={inputClass} value={regData.email} onChange={handleRegChange("email")} />
            </div>
            <div className="relative mb-5">
              <input type={showPassword ? "text" : "password"} placeholder="Create a password" className={inputClass + " pr-10"} value={regData.password} onChange={handleRegChange("password")} />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>

            <p className="text-xs font-semibold tracking-wider text-gray-400 mb-3">ACADEMIC DETAILS</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input placeholder="College Name" className={inputClass} value={regData.collegeName} onChange={handleRegChange("collegeName")} />
              <input placeholder="College Code" className={inputClass} value={regData.collegeCode} onChange={handleRegChange("collegeCode")} />
              <input placeholder="Register No." className={inputClass} value={regData.registerNo} onChange={handleRegChange("registerNo")} />
              <input placeholder="Department" className={inputClass} value={regData.department} onChange={handleRegChange("department")} />
              <select className={inputClass} value={regData.year} onChange={handleRegChange("year")}>
                <option value="">Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              <input placeholder="District" className={inputClass} value={regData.district} onChange={handleRegChange("district")} />
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition">Create Account <ArrowRight size={16} /></button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-500">Already have an account? <button type="button" onClick={() => setScreen("signin")} className="font-semibold text-blue-600 hover:text-blue-700">Sign in</button></p>
          </form>
        )}

        {screen === "forgotEmail" && (
          <form onSubmit={handleForgotPasswordRequest} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
              <p className="text-gray-500 text-sm mt-1">Enter your student email to receive an OTP.</p>
            </div>

            <div className="mb-5">
              <label className={labelClass}>Email</label>
              <input type="email" placeholder="Enter your student email" className={inputClass} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            </div>

            {resetMessage && (<div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{resetMessage}</div>)}

            <button type="submit" className="w-full rounded-lg bg-blue-600 px-3 py-3 font-medium text-white">Send OTP</button>

            <div className="mt-6 text-center text-sm text-gray-500"><button type="button" onClick={handleBackToSignIn} className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</button></div>
          </form>
        )}

        {screen === "verifyOtp" && (
          <form onSubmit={handleVerifyOtp} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
              <p className="text-gray-500 text-sm mt-1">We sent a 6-digit code to <span className="font-semibold">{resetEmail}</span>.</p>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
              {otpFields.map((value, index) => (
                <input key={index} type="text" value={value} onChange={handleOtpFieldChange(index)} className={inputClass + " text-center text-lg font-semibold"} maxLength={1} />
              ))}
            </div>

            {otpTimer > 0 ? (<p className="text-sm text-gray-500 mb-4">Code expires in {otpTimer}s.</p>) : (<p className="text-sm text-red-500 mb-4">OTP expired. Resend to get a new code.</p>)}

            {resetMessage && (<div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{resetMessage}</div>)}

            <button type="submit" className="w-full rounded-lg bg-blue-600 px-3 py-3 font-medium text-white mb-3">Verify OTP</button>

            <button type="button" onClick={handleResendOtp} className="w-full rounded-lg border border-blue-600 bg-white px-3 py-3 font-medium text-blue-600">Resend OTP</button>

            <div className="mt-6 text-center text-sm text-gray-500"><button type="button" onClick={handleBackToSignIn} className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</button></div>
          </form>
        )}

        {screen === "resetPassword" && (
          <form onSubmit={handlePasswordReset} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6"><h1 className="text-2xl font-bold text-gray-900">Reset password</h1><p className="text-gray-500 text-sm mt-1">Create a new password for your student account.</p></div>

            <div className="mb-5"><label className={labelClass}>New Password</label><input type="password" placeholder="New password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>

            {resetMessage && (<div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{resetMessage}</div>)}

            <button type="submit" className="w-full rounded-lg bg-blue-600 px-3 py-3 font-medium text-white">Reset Password</button>

            <div className="mt-6 text-center text-sm text-gray-500"><button type="button" onClick={handleBackToSignIn} className="font-semibold text-blue-600 hover:text-blue-700">Back to sign in</button></div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChemyAuth />} />
        <Route path="/login" element={<ChemyAuth />} />
        <Route path="/dashboard/student/*" element={<StudentDashboard />} />
        <Route path="/dashboard/admin/*" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}