import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LeafletMap from '../components/LeafletMap';
import { Calendar, User, MapPin, AlertCircle, ArrowLeft, CheckCircle, Clock, Play } from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams();
  const { user, token, API_URL } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_URL}/reports/${id}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {
        console.error('Error fetching report detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
          Loading ticket details...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '20px' }}>
          <AlertCircle size={48} style={{ color: 'var(--color-pending)', marginBottom: '15px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Complaint Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            The complaint ticket does not exist or has been removed.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get status color mappings
  let badgeClass = 'badge-pending';
  let statusColor = 'var(--color-pending)';
  if (report.status === 'In Progress') {
    badgeClass = 'badge-progress';
    statusColor = 'var(--color-progress)';
  } else if (report.status === 'Resolved') {
    badgeClass = 'badge-resolved';
    statusColor = 'var(--color-resolved)';
  }

  const handleBackClick = () => {
    if (user) {
      if (user.role === 'official') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Navbar />

      <main style={{
        maxWidth: '1100px',
        margin: '40px auto 0',
        padding: '0 20px'
      }} className="animate-slide">

        {/* Back navigation */}
        <button 
          onClick={handleBackClick} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={16} /> Go Back to Dashboard
        </button>

        {/* Ticket Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '35px'
        }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className={`badge ${badgeClass}`}>{report.status}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{report.category}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket #{report._id || report.id}</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{report.title}</h1>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          
          {/* Left Panel: Details Card */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Description</h2>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, lineBreak: 'anywhere' }}>
                {report.description}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <User size={18} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Reported By:</span>{' '}
                  <strong style={{ color: 'var(--text-main)' }}>{report.citizen.name}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Date Filed:</span>{' '}
                  <strong style={{ color: 'var(--text-main)' }}>{new Date(report.createdAt).toLocaleString()}</strong>
                </div>
              </div>
              {report.location.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                  <MapPin size={18} style={{ color: 'var(--text-muted)', marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Report Location:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{report.location.address}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Images display */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'grid', gridTemplateColumns: report.resolutionImageUrl ? '1fr 1fr' : '1fr', gap: '15px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Evidence Pictured</span>
                {report.imageUrl ? (
                  <img 
                    src={report.imageUrl.startsWith('/') ? `http://localhost:5000${report.imageUrl}` : report.imageUrl} 
                    alt="Evidence" 
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No Photo Provided
                  </div>
                )}
              </div>

              {report.resolutionImageUrl && (
                <div className="animate-slide">
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Resolution Proof</span>
                  <img 
                    src={report.resolutionImageUrl.startsWith('/') ? `http://localhost:5000${report.resolutionImageUrl}` : report.resolutionImageUrl} 
                    alt="Resolution" 
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Map display */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} style={{ color: 'var(--primary)' }} /> Pinpoint Location
            </h2>
            
            <div style={{
              width: '100%',
              height: '350px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <LeafletMap 
                center={[report.location.lat, report.location.lng]}
                zoom={14}
                markers={[report]}
              />
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
              <span>Latitude: <strong>{report.location.lat}</strong></span>
              <span>Longitude: <strong>{report.location.lng}</strong></span>
            </div>
          </div>

        </div>

        {/* Resolution History Timeline */}
        <section className="glass-panel" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '25px' }}>Resolution Timeline</h2>

          {(!report.history || report.history.length === 0) ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No updates recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '30px' }}>
              {/* Vertical timeline connector line */}
              <div style={{
                position: 'absolute',
                left: '9px',
                top: '5px',
                bottom: '5px',
                width: '2px',
                backgroundColor: 'var(--border-color)',
                zIndex: 0
              }} />

              {report.history.map((step, idx) => {
                const isLatest = idx === report.history.length - 1;
                
                // Icon select based on status
                let stepColor = 'var(--border-color)';
                let isCheck = false;
                
                if (step.status === 'Pending') {
                  stepColor = 'var(--color-pending)';
                } else if (step.status === 'In Progress') {
                  stepColor = 'var(--color-progress)';
                } else if (step.status === 'Resolved') {
                  stepColor = 'var(--color-resolved)';
                  isCheck = true;
                }

                return (
                  <div key={idx} style={{ position: 'relative', marginBottom: idx === report.history.length - 1 ? 0 : '25px' }} className="animate-slide">
                    {/* Timeline Node Icon */}
                    <div style={{
                      position: 'absolute',
                      left: '-30px',
                      top: '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-surface-solid)',
                      border: `3px solid ${stepColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: isLatest ? `0 0 10px ${stepColor}88` : 'none'
                    }} />

                    {/* Timeline Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          Status changed to: <span style={{ color: stepColor }}>{step.status}</span>
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(step.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Updated By: <strong>{step.updatedBy}</strong>
                      </span>
                      
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--text-main)', 
                        marginTop: '6px', 
                        backgroundColor: 'var(--bg-input)', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--radius-sm)',
                        lineBreak: 'anywhere'
                      }}>
                        {step.comment}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
