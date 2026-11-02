import React from 'react';

const Navbar = ({ activeTab, setActiveTab, user, onLogout }) => {
  return (
    <>
      {/* Official GIGW Header Band */}
      <div className="gov-header-band">
        <div>भारत सरकार | GOVERNMENT OF INDIA</div>
        <div>
          <a href="#skip">Skip to Main Content</a>
          <a href="#feedback">Feedback</a>
          <a href="#contact">Contact</a>
        </div>
      </div>

      <nav className="navbar">
        <div className="nav-brand" onClick={() => user && setActiveTab(user.role === 'admin' ? 'admin' : 'home')} style={{ cursor: 'pointer' }}>
          {/* Ashoka Wheel SVG logo */}
          <svg className="nav-logo-svg" viewBox="0 0 100 100" style={{ width: '45px', height: '45px' }}>
            <circle cx="50" cy="50" r="45" stroke="#ffffff" strokeWidth="3" fill="none" />
            <circle cx="50" cy="50" r="10" stroke="#ffffff" strokeWidth="2" fill="none" />
            {/* 24 spokes representation */}
            {[...Array(24)].map((_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              const x2 = 50 + 45 * Math.cos(rad);
              const y2 = 50 + 45 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={x2}
                  y2={y2}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
          <div className="nav-brand-text">
            <span className="nav-brand-title">Public Issue Feedback Portal</span>
            {/* <span className="nav-brand-subtitle">Public Grievance Redressal</span> */}
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="nav-links">
              {/* Home navigation dashboard link */}
              <button
                className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </button>

              {/* Submit Grievance - Hidden for Admins */}
              {user.role === 'citizen' && (
                <button
                  className={`nav-btn ${activeTab === 'citizen' ? 'active' : ''}`}
                  onClick={() => setActiveTab('citizen')}
                >
                  Submit Issue
                </button>
              )}  

              <button
                className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                {user.role === 'admin' ? 'Grievance Dashboard' : 'Track Issue'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                Welcome, <span style={{ fontWeight: '700', color: '#ff9933' }}>{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={onLogout}
                className="filter-btn"
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  borderColor: 'transparent',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
