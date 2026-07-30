import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sun, Moon, LogOut, Shield, User, FileText, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '15px',
      margin: '0 20px',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      borderRadius: 'var(--radius-lg)',
      marginTop: '15px'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--text-on-primary)',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '1.2rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          C
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Civic<span style={{ color: 'var(--primary)' }}>Green</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-muted)' }} className="nav-link">
          Home
        </Link>
        
        {user && user.role === 'citizen' && (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <FileText size={16} /> Dashboard
            </Link>
            <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <PlusCircle size={16} /> Report Issue
            </Link>
          </>
        )}

        {user && user.role === 'official' && (
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            <Shield size={16} /> Admin Portal
          </Link>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-secondary btn-icon" 
          style={{ border: 'none', background: 'transparent' }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.role === 'official' ? `${user.department} Dept` : 'Citizen'}
              </span>
            </div>
            
            <button onClick={handleLogout} className="btn btn-secondary btn-icon" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
