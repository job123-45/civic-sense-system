import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import TrackIssues from './pages/TrackIssues';
import Login from './pages/Login';
import { ToastProvider } from './context/ToastContext';

function App() {
  // Check localStorage for persisted auth on initial load
  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const role = user.role === 'admin' ? 'official' : 'citizen';
        return { isAuthenticated: true, role };
      } catch {
        return { isAuthenticated: false, role: null };
      }
    }
    return { isAuthenticated: false, role: null };
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuth({ isAuthenticated: false, role: null });
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={(role) => setAuth({ isAuthenticated: true, role })} />;
  }

  return (
    <Router>
      <ToastProvider>
        <div className="app-container">
          {/* Demo Mode Floating Badge */}
          <div style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
            DEMO MODE
          </div>

          <Sidebar role={auth.role} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard role={auth.role} />} />
              <Route path="/report" element={<ReportIssue role={auth.role} />} />
              <Route path="/track" element={<TrackIssues role={auth.role} />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
