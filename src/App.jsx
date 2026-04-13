import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import TrackIssues from './pages/TrackIssues';
import Login from './pages/Login';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [auth, setAuth] = useState({ isAuthenticated: false, role: null });

  if (!auth.isAuthenticated) {
    return <Login onLogin={(role) => setAuth({ isAuthenticated: true, role })} />;
  }

  return (
    <Router>
      <ToastProvider>
        <div className="app-container">
          <Sidebar role={auth.role} onLogout={() => setAuth({ isAuthenticated: false, role: null })} />
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
