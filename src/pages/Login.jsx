import React, { useState } from 'react';
import { LayoutDashboard, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      // Demo mode: simulate a small delay, then store user in localStorage
      await new Promise((r) => setTimeout(r, 600));

      const user = {
        name: 'Demo User',
        email,
        role: role === 'official' ? 'admin' : 'citizen',
      };

      localStorage.setItem('token', 'demo-token-xyz');
      localStorage.setItem('user', JSON.stringify(user));

      // Map to frontend role
      const frontendRole = role === 'official' ? 'official' : 'citizen';
      onLogin(frontendRole);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="login-card glass-panel animate-fade-in">
        {/* Demo Mode Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <AlertCircle size={14} />
          Demo Mode — No backend connected
        </div>

        <div className="login-header">
          <div className="brand-logo">
            <LayoutDashboard size={28} />
          </div>
          <h1>Welcome Back</h1>
          <p className="text-muted">Sign in to your CivicSense portal</p>
        </div>

        <div className="role-selector">
          <button 
            className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setRole('citizen'); }}
          >
            Citizen
          </button>
          <button 
            className={`role-btn ${role === 'official' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setRole('official'); }}
          >
            Official
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="form-control" 
                placeholder="officer@municipality.gov" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="form-control" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required 
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <span className="loader-spinner"></span>
            ) : (
              <>
                <LogIn size={18} />
                Sign In securely
              </>
            )}
          </button>
        </form>

        <div className="login-footer-text">
          <p className="text-muted" style={{ fontSize: '0.78rem' }}>
            💡 Enter any email & password to log in (demo mode)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
