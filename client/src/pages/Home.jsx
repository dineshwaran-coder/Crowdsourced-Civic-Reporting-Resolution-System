import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LeafletMap from '../components/LeafletMap';
import { PlusCircle, Shield, AlertTriangle, CheckCircle, Compass, Users } from 'lucide-react';

export default function Home() {
  const { user, API_URL } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${API_URL}/reports`);
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [API_URL]);

  // Aggregate metrics
  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Pending').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '50px auto 20px',
        padding: '0 20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }} className="animate-slide">
        <div style={{
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          Clean & Green Technology Initiative
        </div>
        
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: '800px',
          background: 'linear-gradient(135deg, var(--text-main) 40%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Crowdsourced Civic Reporting & Resolution System
        </h1>
        
        <p style={{
          fontSize: '1.2rem',
          color: 'var(--text-muted)',
          maxWidth: '650px',
          fontWeight: 400,
          marginTop: '10px'
        }}>
          Empowering citizens to report environmental and civic issues directly to municipal authorities. Make your city cleaner, greener, and safer today.
        </p>

        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          {user ? (
            user.role === 'citizen' ? (
              <Link to="/report" className="btn btn-primary pulse-glow-green" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>
                <PlusCircle size={20} /> Report Civic Issue
              </Link>
            ) : (
              <Link to="/admin" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>
                <Shield size={20} /> Go to Admin Dashboard
              </Link>
            )
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>
                <PlusCircle size={20} /> Report Civic Issue
              </Link>
              <Link to="/register?role=official" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>
                Official Registration
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Metrics Banner */}
      <section style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Metric Card 1 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--primary)',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Reports</span>
            <strong style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : total}</strong>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-pending)',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={28} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Issues</span>
            <strong style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : pending}</strong>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-resolved)',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Resolved Issues</span>
            <strong style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : resolved}</strong>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            color: 'var(--secondary)',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Resolution Rate</span>
            <strong style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{loading ? '...' : `${resolutionRate}%`}</strong>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)' }}>Civic Issue Live Map</h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Explore reports filed by citizens across the region. Click on any pin to view basic details and track progress.
            </p>
          </div>
          
          {/* Map wrapper container */}
          <div style={{
            width: '100%',
            height: '450px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-input)' }}>
                Loading Map...
              </div>
            ) : (
              <LeafletMap markers={reports} zoom={5} />
            )}
          </div>
        </div>
      </section>

      {/* Recent Resolved Issues Showcase */}
      <section style={{
        maxWidth: '1200px',
        margin: '50px auto 0',
        padding: '0 20px'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '25px' }}>
          Recent Resolutions
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading recent resolutions...</div>
        ) : reports.filter(r => r.status === 'Resolved').length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No resolved issues found yet. Reports will appear here once department officials update their status.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {reports.filter(r => r.status === 'Resolved').slice(0, 3).map(report => (
              <div className="glass-panel card-hover" key={report._id || report.id} style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-resolved">Resolved</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(report.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{report.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                    {report.category}
                  </span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px', lineBreak: 'anywhere' }}>
                    {report.description.substring(0, 100)}{report.description.length > 100 ? '...' : ''}
                  </p>
                </div>
                
                {/* Images comparison */}
                {report.imageUrl && report.resolutionImageUrl && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Before</span>
                      <img 
                        src={report.imageUrl.startsWith('/') ? `http://localhost:5000${report.imageUrl}` : report.imageUrl} 
                        alt="Before" 
                        style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                      />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>After</span>
                      <img 
                        src={report.resolutionImageUrl.startsWith('/') ? `http://localhost:5000${report.resolutionImageUrl}` : report.resolutionImageUrl} 
                        alt="After" 
                        style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                      />
                    </div>
                  </div>
                )}
                
                {report.officialComment && (
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: 'rgba(16, 185, 129, 0.06)', 
                    borderLeft: '3px solid var(--color-resolved)',
                    fontSize: '0.85rem'
                  }}>
                    <strong style={{ display: 'block', color: 'var(--color-resolved)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Resolution Note</strong>
                    <span style={{ color: 'var(--text-main)' }}>{report.officialComment}</span>
                  </div>
                )}
                
                <Link to={`/reports/${report._id || report.id}`} style={{
                  marginTop: 'auto',
                  textAlign: 'right',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  display: 'inline-block'
                }}>
                  View Details &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
