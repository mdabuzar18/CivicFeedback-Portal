import React, { useState } from 'react';

const Login = ({ apiBaseUrl, onLoginSuccess, onNavigateToSignup, showAlert }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      return showAlert('Please enter both email and password', 'error');
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace('/api', '')}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('Logged in successfully!', 'success');
        onLoginSuccess(data.token, data);
      } else {
        showAlert(data.message || 'Invalid email or password', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Could not connect to the authentication server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card auth-card" style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <h2 className="section-title" style={{ textAlign: 'center' }}>Welcome Back</h2>
      <p className="section-subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        Log in to submit public service feedback or manage tickets.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            type="email"
            id="login-email"
            className="form-control"
            placeholder="e.g. citizen@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            type="password"
            id="login-password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-submit" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <span 
          onClick={onNavigateToSignup} 
          style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }}
        >
          Sign Up
        </span>
      </div>
    </div>
  );
};

export default Login;
