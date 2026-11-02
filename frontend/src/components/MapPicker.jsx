import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapPicker = ({ onLocationSelect, initialLocation, showAlert }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Default coordinate center (New York City for the seeder data alignment, or fallback)
  const defaultLat = 40.7128;
  const defaultLng = -74.0060;

  // Modern SVG Pin design to bypass Leaflet's broken default image path issues
  const customIcon = L.divIcon({
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #06b6d4;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -15px 0 0 -15px;
        box-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
        border: 2px solid #ffffff;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #0f172a;
          border-radius: 50%;
          margin: 8px 0 0 8px;
        "></div>
      </div>
      <div style="
        width: 14px;
        height: 14px;
        background: rgba(6, 182, 212, 0.3);
        border-radius: 50%;
        position: absolute;
        left: 50%;
        top: 50%;
        margin: 5px 0 0 -7px;
        animation: map-pulsate 1.5s ease-out infinite;
      "></div>
    `,
    className: 'custom-map-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
  });

  const updateLocation = (lat, lng, fly = false) => {
    const fixedLat = parseFloat(lat.toFixed(6));
    const fixedLng = parseFloat(lng.toFixed(6));

    if (markerRef.current) {
      markerRef.current.setLatLng([fixedLat, fixedLng]);
    }

    if (mapRef.current && fly) {
      mapRef.current.flyTo([fixedLat, fixedLng], 14);
    }

    onLocationSelect(fixedLat, fixedLng);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showAlert('Geolocation is not supported by your browser', 'error');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude, true);
        showAlert('Location successfully auto-detected!', 'success');
        setGpsLoading(false);
      },
      (error) => {
        console.error('GPS detection error:', error);
        showAlert('Could not detect location. Please click the map manually.', 'error');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    // Determine starting position
    const startLat = initialLocation?.latitude || defaultLat;
    const startLng = initialLocation?.longitude || defaultLng;

    // Initialize Map
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([startLat, startLng], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      // Create main marker
      const marker = L.marker([startLat, startLng], {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      // Save references
      mapRef.current = map;
      markerRef.current = marker;

      // Handle drag end events
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateLocation(position.lat, position.lng);
      });

      // Handle map click events
      map.on('click', (e) => {
        updateLocation(e.latlng.lat, e.latlng.lng);
      });

      // Propagate initial values if not set
      if (!initialLocation?.latitude) {
        onLocationSelect(startLat, startLng);
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="map-picker-wrapper" style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Click on the map or drag the pin to mark coordinates
        </span>
        <button
          type="button"
          onClick={detectLocation}
          className="filter-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderColor: 'var(--color-primary)' }}
          disabled={gpsLoading}
        >
          {gpsLoading ? '📡 Locating...' : '📍 Auto-detect GPS'}
        </button>
      </div>

      <div
        ref={mapContainerRef}
        style={{
          height: '240px',
          width: '100%',
          borderRadius: '8px',
          border: '1px solid var(--border-glass)',
          background: '#0b0f19',
          overflow: 'hidden',
          zIndex: 10
        }}
      ></div>
    </div>
  );
};

export default MapPicker;
