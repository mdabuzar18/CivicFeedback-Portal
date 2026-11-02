import React, { useState } from 'react';

const Signup = ({ apiBaseUrl, onSignupSuccess, onNavigateToLogin, showAlert }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      return showAlert('Please fill in all fields', 'error');
    }

    if (password.length < 6) {
      return showAlert('Password must be at least 6 characters long', 'error');
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace('/api', '')}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('Account created successfully!', 'success');
        onSignupSuccess(data.token, data);
      } else {
        showAlert(data.message || 'Registration failed. Try again.', 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showAlert('Could not connect to the registration server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card auth-card" style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <h2 className="section-title" style={{ textAlign: 'center' }}>Create Account</h2>
      <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Register to submit public issues or manage reports.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="signup-name">Full Name</label>
          <input
            type="text"
            id="signup-name"
            className="form-control"
            placeholder="e.g. Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-email">Email Address</label>
          <input
            type="email"
            id="signup-email"
            className="form-control"
            placeholder="e.g. jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-password">Password (min. 6 characters)</label>
          <input
            type="password"
            id="signup-password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="signup-role">Account Type</label>
          <select
            id="signup-role"
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="citizen">Citizen (Submit Issues)</option>
            <option value="admin">Administrator (Track/Resolve)</option>
          </select>
        </div>

        <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <span 
          onClick={onNavigateToLogin} 
          style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}
        >
          Log In
        </span>
      </div>
    </div>
  );
};

export default Signup;
