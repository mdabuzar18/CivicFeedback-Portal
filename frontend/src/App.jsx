import React, { useState } from 'react';
import Navbar from './components/Navbar';
import FeedbackForm from './components/FeedbackForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

// Set API URL base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  // Read existing token & user from localStorage on initialization
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.role === 'admin' ? 'admin' : 'home';
    }
    return 'home';
  });
  
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  const [timeoutId, setTimeoutId] = useState(null);

  const showAlert = (message, type = 'success') => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setAlert({ message, type, visible: true });
    
    // We set longer timeouts for emails to give users time to click links
    const duration = type === 'success' && typeof message !== 'string' ? 10000 : 5000;
    const id = setTimeout(() => {
      setAlert(prev => ({ ...prev, visible: false }));
    }, duration);
    setTimeoutId(id);
  };

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    // Redirect based on role
    setActiveTab(newUser.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    showAlert('Session logged out successfully', 'success');
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Institutional GIGW Department & Service Banner */}
      {token && (
        <div className="dept-banner">
          <div className="dept-info">
            <div className="dept-emblem-placeholder">🏛️</div>
            <div className="dept-titles">
              <span className="dept-name">Department of Administrative Reforms & Public Grievances</span>
              <span className="service-title">Public Service Grievance Redressal System</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Ministry of Personnel, Public Grievances & Pensions</strong>
            <br />Government of India
          </div>
        </div>
      )}

      <main className="main-content">
        {alert.visible && (
          <div className={`alert alert-${alert.type}`} style={{ zIndex: 1000, position: 'relative' }}>
            <span>{alert.type === 'success' ? '⚡' : '⚠️'}</span>
            <span>{alert.message}</span>
          </div>
        )}

        {!token ? (
          authView === 'login' ? (
            <Login
              apiBaseUrl={API_BASE_URL}
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignup={() => setAuthView('signup')}
              showAlert={showAlert}
            />
          ) : (
            <Signup
              apiBaseUrl={API_BASE_URL}
              onSignupSuccess={handleLoginSuccess}
              onNavigateToLogin={() => setAuthView('login')}
              showAlert={showAlert}
            />
          )
        ) : activeTab === 'home' ? (
          /* UX4G Visual Navigation Cards Dashboard */
          <div className="dashboard-home">
            <h2 className="section-title">Select Grievance Service</h2>
            <p className="section-subtitle">
              Welcome to the unified redressal mechanism. Select a module below to proceed.
            </p>

            <div className="cards-nav-grid">
              {user.role === 'citizen' ? (
                <>
                  {/* File New Grievance Card */}
                  <div className="nav-card" onClick={() => setActiveTab('citizen')}>
                    <div className="nav-card-icon">✍️</div>
                    <h3 className="nav-card-title">File Grievance</h3>
                    <p className="nav-card-desc">
                      Submit a new public service grievance regarding infrastructure, sanitation, utilities, safety, or other civic issues.
                    </p>
                    <button className="nav-card-btn">File Report</button>
                  </div>

                  {/* Track Status Card */}
                  <div className="nav-card" onClick={() => setActiveTab('admin')}>
                    <div className="nav-card-icon">🔍</div>
                    <h3 className="nav-card-title">Track History</h3>
                    <p className="nav-card-desc">
                      Monitor and review status updates of grievances submitted by you to local municipal authorities.
                    </p>
                    <button className="nav-card-btn">View Queue</button>
                  </div>
                </>
              ) : (
                <>
                  {/* Admin Resolution Dashboard Card */}
                  <div className="nav-card" onClick={() => setActiveTab('admin')}>
                    <div className="nav-card-icon">⚙️</div>
                    <h3 className="nav-card-title">Resolve Grievances</h3>
                    <p className="nav-card-desc">
                      Access lists of filed public complaints, filter by category/ward, and dispatch status transitions.
                    </p>
                    <button className="nav-card-btn">Open Dashboard</button>
                  </div>

                  {/* Institution stats view card (informative placeholder) */}
                  <div className="nav-card" onClick={() => setActiveTab('admin')} style={{ cursor: 'pointer' }}>
                    <div className="nav-card-icon">📊</div>
                    <h3 className="nav-card-title">Review Statistics</h3>
                    <p className="nav-card-desc">
                      Assess resolving stats, municipal ward performance, and trigger database seed resets for presentation testing.
                    </p>
                    <button className="nav-card-btn">Analyze Data</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : activeTab === 'citizen' && user.role === 'citizen' ? (
          <FeedbackForm
            apiBaseUrl={API_BASE_URL}
            token={token}
            user={user}
            showAlert={showAlert}
          />
        ) : (
          <AdminDashboard
            apiBaseUrl={API_BASE_URL}
            token={token}
            user={user}
            showAlert={showAlert}
          />
        )}
      </main>

      <footer>
        <p>
          <strong>CivicFeedback Redressal Portal (CPGRAMS Mock)</strong> — Developed under GIGW & UX4G Guidelines
        </p>
        <p style={{ marginTop: '0.25rem', opacity: 0.7, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          National Informatics Centre (NIC) • Ministry of Electronics & IT • Government of India
        </p>
      </footer>
    </div>
  );
}

export default App;
