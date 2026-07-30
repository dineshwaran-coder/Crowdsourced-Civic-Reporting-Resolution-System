import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Mail, Lock, CheckCircle2, AlertCircle, Building } from 'lucide-react';

export default function Register() {
  const { register, user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    department: 'Sanitation & Waste Management'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync role from query parameters
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'official' || roleParam === 'citizen') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'official') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registeredUser = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.role === 'official' ? formData.department : null
      );
      if (registeredUser.role === 'official') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px'
      }} className="animate-fade">
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Create Account</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Join us to report civic issues or verify resolutions
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
              fontSize: '0.85rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Role Switcher tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              backgroundColor: 'var(--bg-input)',
              padding: '6px',
              borderRadius: 'var(--radius-md)'
            }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'citizen' }))}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  backgroundColor: formData.role === 'citizen' ? 'var(--bg-surface-solid)' : 'transparent',
                  color: formData.role === 'citizen' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: formData.role === 'citizen' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'official' }))}
                style={{
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  backgroundColor: formData.role === 'official' ? 'var(--bg-surface-solid)' : 'transparent',
                  color: formData.role === 'official' ? 'var(--text-main)' : 'var(--text-muted)',
                  boxShadow: formData.role === 'official' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
              >
                Govt Official
              </button>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  className="form-control" 
                  placeholder="John Doe"
                  style={{ paddingLeft: '44px' }}
                  value={formData.name}
                  onChange={onChange}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  className="form-control" 
                  placeholder="john@example.com"
                  style={{ paddingLeft: '44px' }}
                  value={formData.email}
                  onChange={onChange}
                  required 
                />
              </div>
            </div>

            {formData.role === 'official' && (
              <div className="input-group animate-slide">
                <label className="input-label" htmlFor="department">Department</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    zIndex: 2
                  }} />
                  <select 
                    name="department" 
                    id="department" 
                    className="form-control"
                    style={{ paddingLeft: '44px', appearance: 'none', cursor: 'pointer' }}
                    value={formData.department}
                    onChange={onChange}
                    required
                  >
                    <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                    <option value="Roads & Transport">Roads & Transport</option>
                    <option value="Electricity & Power">Electricity & Power</option>
                    <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                    <option value="Forestry & Environment">Forestry & Environment</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}>▼</div>
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input 
                  type="password" 
                  name="password" 
                  id="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  style={{ paddingLeft: '44px' }}
                  value={formData.password}
                  onChange={onChange}
                  minLength={6}
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
              disabled={loading}
            >
              <CheckCircle2 size={18} /> {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '5px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
