import React, { useState, useEffect } from 'react';

const AdminDashboard = ({ apiBaseUrl, token, user, showAlert }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['Infrastructure', 'Sanitation', 'Public Safety', 'Utilities', 'Other'];
  const serverHost = apiBaseUrl.replace('/api', ''); // e.g. http://localhost:5000

  const isAdmin = user?.role === 'admin';

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setFeedbacks(data);
      } else {
        showAlert(data.message || 'Failed to retrieve reports list', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert('Could not connect to the API. Make sure the backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/status/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const updated = await response.json();

      if (response.ok) {
        // Since the response body spreads populated fields and adds emailPreviewUrl
        // we can safely extract it here
        setFeedbacks(feedbacks.map(fb => fb._id === id ? updated : fb));
        if (updated.emailPreviewUrl) {
          showAlert(
            <span>
              Status successfully updated to "{newStatus}"!{' '}
              <a href={updated.emailPreviewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: '700' }}>
                ✉️ Click here to view sent Email (Test Inbox)
              </a>
            </span>,
            'success'
          );
        } else {
          showAlert(`Status successfully updated to "${newStatus}"`, 'success');
        }
      } else {
        showAlert(updated.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Update status error:', error);
      showAlert('Failed to contact server to update status', 'error');
    }
  };

  const handleSeedData = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/feedback/seed`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('Database successfully seeded with demo users and reports!', 'success');
        fetchFeedbacks();
      } else {
        showAlert(data.message || 'Seeding failed', 'error');
      }
    } catch (error) {
      console.error('Seed error:', error);
      showAlert('Error connecting to the database seeder endpoint', 'error');
    }
  };

  // Compute stats
  const totalCount = feedbacks.length;
  const pendingCount = feedbacks.filter(fb => fb.status === 'Pending').length;
  const progressCount = feedbacks.filter(fb => fb.status === 'In Progress').length;
  const resolvedCount = feedbacks.filter(fb => fb.status === 'Resolved').length;

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(fb => {
    const statusMatch = statusFilter === 'All' || fb.status === statusFilter;
    const categoryMatch = categoryFilter === 'All' || fb.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="admin-dashboard">
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 className="section-title">
          {isAdmin ? 'Municipal Administrator Dashboard' : 'Your Submitted Feedback Reports'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>
          Authenticated as: {user?.name} ({user?.email}) • Role: {isAdmin ? 'Administrator' : 'Citizen'}
        </p>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">📋</div>
          <div className="stat-info">
            <h4>{isAdmin ? 'Total Reports' : 'My Reports'}</h4>
            <p>{totalCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <h4>Pending</h4>
            <p>{pendingCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon progress">⚙️</div>
          <div className="stat-info">
            <h4>In Progress</h4>
            <p>{progressCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon resolved">✅</div>
          <div className="stat-info">
            <h4>Resolved</h4>
            <p>{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <select
            className="form-control filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No feedback entries found</h3>
            <p>
              {feedbacks.length === 0
                ? (isAdmin ? "No citizens have submitted feedback yet." : "You have not submitted any reports yet.")
                : "No items match your active filter criteria."}
            </p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {isAdmin && <th>Citizen Details</th>}
                <th>Photo</th>
                <th>Category / Ward</th>
                <th>Description</th>
                <th>Location GPS</th>
                <th>Date Submitted</th>
                <th>Status / Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((fb) => (
                <tr key={fb._id}>
                  {isAdmin && (
                    <td>
                      <div className="citizen-info">
                        <span className="citizen-name">{fb.user?.name || 'Anonymous'}</span>
                        <span className="citizen-email">{fb.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                  )}
                  <td>
                    {fb.photoUrl ? (
                      <a href={`${serverHost}${fb.photoUrl}`} target="_blank" rel="noopener noreferrer">
                        <img
                          src={`${serverHost}${fb.photoUrl}`}
                          alt="Incident proof"
                          style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--border-glass)',
                            display: 'block',
                            transition: 'var(--transition-smooth)'
                          }}
                          className="hover-scale"
                        />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Photo</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="badge badge-category" style={{ width: 'fit-content' }}>
                        {fb.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {fb.ward || 'General'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="feedback-desc">{fb.description}</div>
                  </td>
                  <td>
                    {fb.location?.latitude ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${fb.location.latitude},${fb.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="filter-btn"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--color-primary)', display: 'inline-block', textDecoration: 'none' }}
                      >
                        📍 View Map ({fb.location.latitude.toFixed(4)}, {fb.location.longitude.toFixed(4)})
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {formatDate(fb.createdAt)}
                  </td>
                  <td>
                    {isAdmin ? (
                      <div className="status-select-wrapper">
                        <select
                          className={`form-control status-select ${fb.status.toLowerCase().replace(' ', '')}`}
                          value={fb.status}
                          onChange={(e) => handleStatusChange(fb._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    ) : (
                      <span className={`badge badge-status-${fb.status.toLowerCase().replace(' ', '')}`}>
                        {fb.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Helper utility box for demo seeding (Only visible to Admin if DB is empty) */}
      {feedbacks.length === 0 && !loading && isAdmin && (
        <div className="seed-box animate-pulse">
          <div className="seed-info">
            <h4>Ready to Present?</h4>
            <p>Instantly seed the database with mock reports and create login credentials (`admin@example.com` and `citizen@example.com` with password `password123`).</p>
          </div>
          <button className="btn-seed" onClick={handleSeedData}>
            🌱 Seed Demo Data
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
