import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LeafletMap from '../components/LeafletMap';
import { Camera, MapPin, Send, AlertCircle, UploadCloud } from 'lucide-react';

const ALL_CATEGORIES = [
  'Sanitation & Waste Management',
  'Roads & Transport',
  'Electricity & Power',
  'Water Supply & Sewage',
  'Forestry & Environment'
];

const CATEGORY_KEYWORDS = {
  'Sanitation & Waste Management': ['waste', 'garbage', 'trash', 'dump', 'dustbin', 'refuse', 'sanitation', 'litter', 'smell', 'debris', 'rubbish', 'sewer'],
  'Roads & Transport': ['road', 'pothole', 'street', 'highway', 'traffic', 'transport', 'path', 'lane', 'pavement', 'asphalt', 'tar', 'concrete', 'bridge'],
  'Electricity & Power': ['light', 'streetlight', 'electricity', 'wire', 'power', 'cable', 'blackout', 'pole', 'transformer', 'electrical', 'bulb'],
  'Water Supply & Sewage': ['water', 'sewage', 'drain', 'leak', 'pipeline', 'clog', 'flood', 'tap', 'gutter', 'drainage', 'supply', 'pipe'],
  'Forestry & Environment': ['tree', 'forest', 'park', 'green', 'planting', 'branch', 'environmental', 'nature', 'leaves', 'forestry', 'soil', 'garden']
};

export default function ReportIssue() {
  const { token, API_URL, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not logged in or if they are an official
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (user && user.role !== 'citizen') {
      navigate('/admin');
    }
  }, [token, user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sanitation & Waste Management',
    lat: '',
    lng: '',
    address: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const titleLower = formData.title.toLowerCase().trim();
    if (!titleLower) return;

    const matchedCategories = ALL_CATEGORIES.filter(cat => {
      const keywords = CATEGORY_KEYWORDS[cat];
      return keywords.some(keyword => titleLower.includes(keyword));
    });

    if (matchedCategories.length > 0) {
      if (!matchedCategories.includes(formData.category)) {
        setFormData(prev => ({
          ...prev,
          category: matchedCategories[0]
        }));
      }
    }
  }, [formData.title]);

  const filteredCategories = (() => {
    const titleLower = formData.title.toLowerCase().trim();
    if (!titleLower) return ALL_CATEGORIES;

    const matched = ALL_CATEGORIES.filter(cat => {
      const keywords = CATEGORY_KEYWORDS[cat];
      return keywords.some(keyword => titleLower.includes(keyword));
    });

    return matched.length > 0 ? matched : ALL_CATEGORIES;
  })();

  // Handles Leaflet coordinate selection
  const handleLocationSelect = async (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6)
    }));

    // Fetch address using Nominatim (reverse geocoding)
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          address: data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      // Fallback
      setFormData(prev => ({
        ...prev,
        address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.lat || !formData.lng) {
      setError('Please click on the map to pinpoint the issue location.');
      return;
    }

    if (!imageFile) {
      setError('Please upload an image proof of the issue.');
      return;
    }

    setLoading(true);
    
    // Create multipart form body
    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('category', formData.category);
    uploadData.append('lat', formData.lat);
    uploadData.append('lng', formData.lng);
    uploadData.append('address', formData.address);
    uploadData.append('image', imageFile);

    try {
      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setError(data.msg || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError('Network connection error. Server might be offline.');
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location to center map
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          alert('Could not fetch location. Please pick manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Navbar />

      <div style={{
        maxWidth: '1100px',
        margin: '40px auto 0',
        padding: '0 20px'
      }} className="animate-slide">
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Report a Civic Issue</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Submit details, upload image evidence, and pinpoint the location on the map.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-pending)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          
          {/* Left Column: Form Fields */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="title">Issue Title</label>
              <input 
                type="text" 
                name="title" 
                id="title" 
                className="form-control" 
                placeholder="Brief title (e.g., Garbage piled on corner)"
                value={formData.title}
                onChange={onChange}
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="category">Category</label>
              <div style={{ position: 'relative' }}>
                <select 
                  name="category" 
                  id="category" 
                  className="form-control"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                  value={formData.category}
                  onChange={onChange}
                  required
                >
                  {filteredCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)'
                }}>▼</div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="description">Detailed Description</label>
              <textarea 
                name="description" 
                id="description" 
                className="form-control" 
                rows="4"
                placeholder="Explain the severity, impact, or specific context..."
                value={formData.description}
                onChange={onChange}
                required
              />
            </div>

            {/* Photo Upload area */}
            <div className="input-group">
              <label className="input-label">Image Proof</label>
              
              <div style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'border-color var(--transition-fast)'
              }}
              onClick={() => document.getElementById('photo-input').click()}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <UploadCloud size={36} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload file</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPEG, JPG, PNG, WEBP up to 5MB</span>
                  </div>
                )}
                <input 
                  type="file" 
                  id="photo-input" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={onFileChange}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Map & Address Pinning */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} /> Pinpoint Location
              </label>
              
              <button 
                type="button" 
                onClick={handleUseCurrentLocation} 
                className="btn btn-secondary" 
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                Use Current GPS
              </button>
            </div>

            {/* Map Container */}
            <div style={{
              width: '100%',
              height: '240px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <LeafletMap 
                isEditable={true} 
                onLocationSelect={handleLocationSelect}
                selectedLocation={formData.lat ? { lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } : null}
              />
            </div>

            {/* Coordinate display / geocoding */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <span className="input-label">Latitude</span>
                <input type="text" className="form-control" value={formData.lat} readOnly placeholder="Click map..." />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <span className="input-label">Longitude</span>
                <input type="text" className="form-control" value={formData.lng} readOnly placeholder="Click map..." />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="address">Detected Address</label>
              <input 
                type="text" 
                name="address" 
                id="address" 
                className="form-control" 
                value={isGeocoding ? 'Loading address details...' : formData.address} 
                onChange={onChange}
                placeholder="Click map to autofill, or enter manually..."
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={loading}
            >
              <Send size={18} /> {loading ? 'Submitting Report...' : 'Submit Civic Report'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
