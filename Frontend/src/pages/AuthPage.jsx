import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

const AuthPage = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [userCredentials, setUserCredentials] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: ''
  });
  const [otpCode, setOtpCode] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (authMode === 'signup' && userCredentials.password !== userCredentials.confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userCredentials.email.trim().toLowerCase(),
            password: userCredentials.password
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Login failed.');
        }

        setMessage('Login successful. Redirecting...');
        setMessageType('success');
        setTimeout(() => navigate('/'), 800);
      } else if (authMode === 'verify-otp') {
        const res = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userCredentials.email.trim().toLowerCase(), otp: otpCode.trim() })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'OTP verification failed.');
        }

        const data = await res.json();
        const user = data.user || data;
        const token = data.token;

        // Persist session locally so App can read it
        try {
          if (token) localStorage.setItem('sriTechToken', token);
          if (user) localStorage.setItem('sriTechUser', JSON.stringify(user));
        } catch (err) {
          console.warn('Unable to persist auth session:', err);
        }

        setMessage('Email verified. Account created. Redirecting...');
        setMessageType('success');
        setTimeout(() => navigate('/'), 800);
      } else {
        const res = await fetch(`${API_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userCredentials.name,
            email: userCredentials.email.trim().toLowerCase(),
            password: userCredentials.password,
            phone: userCredentials.phone,
            address: userCredentials.address
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Signup failed.');
        }

        setAuthMode('verify-otp');
        setMessage('Account request received. Check your email for OTP verification.');
        setMessageType('success');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Submission failed.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-left-pane">
        <div className="auth-left-content">
          <h2>Cook Smarter.<span>Save More.</span></h2>
          <p className="auth-subhead">
            Join thousands of customers using fuel-efficient Rocket Stoves for sustainable cooking and a cleaner future.
          </p>
          <ul className="auth-trust-list">
            <li>✓ Secure Login</li>
            <li>✓ Fast Checkout</li>
            <li>✓ Order Tracking</li>
            <li>✓ 24/7 Customer Support</li>
          </ul>
        </div>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="ember"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${3 + Math.random() * 4}px`,
              height: `${3 + Math.random() * 4}px`
            }}
          />
        ))}
      </div>
      <div className="auth-right-pane">
        <div className="auth-glass-card">
          <button className="auth-close-btn" onClick={() => navigate('/')}>✕</button>
          <div className="auth-header">
            <h3>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
            <p>{authMode === 'login' ? 'Sign in to your premium account' : 'Start your sustainable journey today'}</p>
          </div>
          <div className="auth-toggle-group">
            <button
              className={`auth-toggle-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >Sign In</button>
            <button
              className={`auth-toggle-btn ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => setAuthMode('signup')}
            >Sign Up</button>
          </div>
          <form className="auth-fields-grid" onSubmit={handleSubmit}>
            {authMode === 'signup' && (
              <>
                <div className="auth-form-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrapper">
                    <i className="fa-regular fa-user prefix-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="John Doe"
                      required
                      value={userCredentials.name}
                      onChange={e => setUserCredentials({ ...userCredentials, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="auth-form-group">
                  <label>Mobile Number</label>
                  <div className="auth-input-wrapper">
                    <i className="fa-solid fa-phone prefix-icon" />
                    <input
                      type="tel"
                      className="auth-input"
                      placeholder="+1 (555) 000-0000"
                      required
                      value={userCredentials.phone}
                      onChange={e => setUserCredentials({ ...userCredentials, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="auth-form-group">
                  <label>Address</label>
                  <div className="auth-input-wrapper">
                    <i className="fa-solid fa-map-location-dot prefix-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="123 Street Name"
                      required
                      value={userCredentials.address}
                      onChange={e => setUserCredentials({ ...userCredentials, address: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
            {authMode === 'verify-otp' && (
              <div className="auth-form-group">
                <label>Verification Code</label>
                <div className="auth-input-wrapper">
                  <i className="fa-solid fa-key prefix-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Enter 6-digit code"
                    required
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="auth-form-group">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <i className="fa-regular fa-envelope prefix-icon" />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="hello@example.com"
                  required
                  value={userCredentials.email}
                  onChange={e => setUserCredentials({ ...userCredentials, email: e.target.value })}
                />
              </div>
            </div>
            <div className="auth-form-group">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <i className="fa-solid fa-lock prefix-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="••••••••"
                  required
                  value={userCredentials.password}
                  onChange={e => setUserCredentials({ ...userCredentials, password: e.target.value })}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>
            {authMode === 'signup' && (
              <div className="auth-form-group">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <i className="fa-solid fa-shield-check prefix-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    required
                    value={userCredentials.confirmPassword}
                    onChange={e => setUserCredentials({ ...userCredentials, confirmPassword: e.target.value })}
                  />
                  <button type="button" className="pwd-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>
            )}
            {authMode === 'login' && (
              <div className="auth-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-pwd" onClick={e => e.preventDefault()}>Forgot Password?</a>
              </div>
            )}
            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              {authMode === 'login' ? (isSubmitting ? 'Signing In…' : 'Sign In') : (authMode === 'verify-otp' ? (isSubmitting ? 'Verifying…' : 'Verify Code') : (isSubmitting ? 'Creating Account…' : 'Create Account'))}
            </button>
          </form>
          {message && (
            <div className={`auth-message ${messageType === 'error' ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
