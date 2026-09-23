import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { AlertCircle, PlusCircle, ArrowRight, Eye, Calendar, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user, token, API_URL } = useContext(AuthContext);
  const serverBaseUrl = API_URL.replace('/api', '');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  // Redirect if not logged in or if they are an official
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (user && user.role !== 'citizen') {
      navigate('/admin');
    }
  }, [token, user, navigate]);

  useEffect(() => {
    const fetchMyReports = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/reports/my-reports`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (err) {
        console.error('Error fetching citizen reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReports();
  }, [token, API_URL]);

  // Aggregate stats
  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Pending').length;
  const progress = reports.filter(r => r.status === 'In Progress').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  const filteredReports = reports.filter(r => {
    if (filter === 'All') return true;
    return r.status === filter;
  });

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Navbar />

      <main style={{
        maxWidth: '1100px',
        margin: '40px auto 0',
        padding: '0 20px'
      }} className="animate-slide">
        
        {/* Header row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '35px'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Citizen Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage and track the status of your reported civic issues.
            </p>
          </div>
          
          <Link to="/report" className="btn btn-primary pulse-glow-green">
            <PlusCircle size={18} /> Report New Issue
          </Link>
        </div>

        {/* Aggregate Stats Cards */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '35px'
        }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Filed</span>
            <strong style={{ fontSize: '1.8rem', fontWeight: 800 }}>{loading ? '...' : total}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--color-pending)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pending Verification</span>
            <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-pending)' }}>{loading ? '...' : pending}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--color-progress)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>In Progress</span>
            <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-progress)' }}>{loading ? '...' : progress}</strong>
          </div>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '4px solid var(--color-resolved)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Resolved</span>
            <strong style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-resolved)' }}>{loading ? '...' : resolved}</strong>
          </div>
        </section>

        {/* Filter Toolbar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '15px',
          overflowX: 'auto'
        }}>
          {['All', 'Pending', 'In Progress', 'Resolved'].map(tab => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-input)',
                  color: isActive ? 'var(--text-on-primary)' : 'var(--text-main)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Reports Listing Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading your reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No Reports Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                {filter === 'All' 
                  ? "You haven't reported any civic issues yet." 
                  : `You don't have any reports currently marked as "${filter}".`}
              </p>
            </div>
            {filter === 'All' && (
              <Link to="/report" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                File First Report
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredReports.map(report => {
              const progressPercent = report.status === 'Resolved' ? 100 : (report.status === 'In Progress' ? 60 : 15);
              const progressColor = report.status === 'Resolved' ? 'var(--color-resolved)' : (report.status === 'In Progress' ? 'var(--color-progress)' : 'var(--color-pending)');
              const latestHistory = report.history && report.history.length > 0 ? report.history[report.history.length - 1] : null;
              const badgeClass = report.status === 'Resolved' ? 'badge-resolved' : (report.status === 'In Progress' ? 'badge-progress' : 'badge-pending');

              return (
                <div 
                  className="glass-panel card-hover" 
                  key={report._id || report.id} 
                  style={{
                    padding: '20px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* Thumbnail */}
                  {report.imageUrl ? (
                    <img 
                      src={report.imageUrl.startsWith('/') ? `${serverBaseUrl}${report.imageUrl}` : report.imageUrl} 
                      alt={report.title} 
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-input)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-input)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      No Image
                    </div>
                  )}

                  {/* Body details */}
                  <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge ${badgeClass}`}>{report.status}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{report.category}</span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>{report.title}</h3>
                    
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.location.address && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={report.location.address}>
                          <MapPin size={14} /> {report.location.address}
                        </span>
                      )}
                    </div>

                    {/* Visual Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', maxWidth: '400px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Resolution Progress</span>
                        <span style={{ color: progressColor }}>{progressPercent}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressColor, borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>

                    {/* Latest Progress Comment */}
                    {latestHistory && (
                      <div style={{
                        marginTop: '6px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-input)',
                        fontSize: '0.8rem',
                        borderLeft: `3px solid ${progressColor}`,
                        color: 'var(--text-muted)',
                        maxWidth: '500px'
                      }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.75rem', marginBottom: '2px' }}>
                          Latest Update ({latestHistory.updatedBy}):
                        </strong>
                        {latestHistory.comment}
                      </div>
                    )}
                  </div>

                  {/* Actions column */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to={`/reports/${report._id || report.id}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      <Eye size={16} /> Track Status
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
