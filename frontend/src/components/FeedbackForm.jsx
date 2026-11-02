import React, { useState } from 'react';
import MapPicker from './MapPicker';

const FeedbackForm = ({ apiBaseUrl, token, user, showAlert }) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    ward: '',
  });
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Infrastructure', 'Sanitation', 'Public Safety', 'Utilities', 'Other'];
  const wards = ['Ward 10', 'Ward 11', 'Ward 12', 'Ward 13', 'Ward 14', 'Ward 15'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (lat, lng) => {
    setLocation({ latitude: lat, longitude: lng });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Photo size exceeds 5MB limit', 'error');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.category) return showAlert('Please select an issue category', 'error');
    if (!formData.ward) return showAlert('Please select an administrative ward', 'error');
    if (location.latitude === null || location.longitude === null) {
      return showAlert('Please pick a location coordinates pin on the map', 'error');
    }
    if (!formData.description.trim()) return showAlert('Please provide a detailed description of the issue', 'error');

    setIsSubmitting(true);

    try {
      // Prepare Multipart Form Data
      const sendData = new FormData();
      sendData.append('category', formData.category);
      sendData.append('description', formData.description);
      sendData.append('ward', formData.ward);
      sendData.append('latitude', location.latitude);
      sendData.append('longitude', location.longitude);
      
      if (photo) {
        sendData.append('photo', photo);
      }

      const response = await fetch(`${apiBaseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Content-Type is set automatically by the browser for FormData (multipart)
        },
        body: sendData,
      });

      const data = await response.json();

      if (response.ok) {
        showAlert('Report successfully filed! Municipal authorities have been notified.', 'success');
        setFormData({
          category: '',
          description: '',
          ward: '',
        });
        setPhoto(null);
        setPhotoPreview('');
        // Map will reset center on re-render, location will trigger default
      } else {
        showAlert(data.message || 'Error uploading report. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      showAlert('Could not connect to the API. Make sure the backend is running.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card">
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h2 className="section-title">File Public Service Report</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600' }}>
          Authenticated as: {user?.name} ({user?.email}) • Role: Citizen
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Category Dropdown */}
          <div className="form-group">
            <label htmlFor="category">Issue Category</label>
            <select
              id="category"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Ward Dropdown */}
          <div className="form-group">
            <label htmlFor="ward">Administrative Ward</label>
            <select
              id="ward"
              name="ward"
              className="form-control"
              value={formData.ward}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">-- Select Ward Sector --</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          {/* Map Location Picker */}
          <div className="form-group full-width">
            <label>Incident Geolocation Pinned Location</label>
            <MapPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={location}
              showAlert={showAlert}
            />
            {location.latitude && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Selected Coordinates: <span style={{ color: 'var(--color-primary)' }}>{location.latitude}, {location.longitude}</span>
              </p>
            )}
          </div>

          {/* Photo Upload Input */}
          <div className="form-group full-width">
            <label htmlFor="photo">Attach Photo Proof (Optional)</label>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <input
                type="file"
                id="photo"
                accept="image/*"
                className="form-control"
                style={{ flex: 1, minWidth: '220px' }}
                onChange={handlePhotoChange}
                disabled={isSubmitting}
              />
              {photoPreview && (
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'rgba(239, 68, 68, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description Textarea */}
          <div className="form-group full-width">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              placeholder="Describe the complaint in detail. Provide nearby landmarks, hazards, or size references..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
              Submitting Report...
            </>
          ) : (
            'File Incident Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
