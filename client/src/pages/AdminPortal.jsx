import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatsChart from '../components/StatsChart';
import { AlertCircle, Clock, CheckCircle, FileText, Settings, X, UploadCloud, ChevronRight } from 'lucide-react';

export default function AdminPortal() {
  const { user, token, API_URL } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  // Active status action state
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionStatus, setActionStatus] = useState('In Progress');
  const [actionComment, setActionComment] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Redirect if not logged in or not an official
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (user && user.role !== 'official') {
      navigate('/dashboard');
    }
  }, [token, user, navigate]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_URL}/reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token, API_URL]);

  // Set default category filter based on official's department
  useEffect(() => {
    if (user && user.role === 'official' && user.department) {
      setFilterCategory(user.department);
    }
  }, [user]);

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchCategory = filterCategory === 'All' || r.category === filterCategory;
    return matchStatus && matchCategory;
  });

  const handleActionClick = (report) => {
    setSelectedReport(report);
    setActionStatus(report.status === 'Pending' ? 'In Progress' : 'Resolved');
    setActionComment('');
    setResolutionFile(null);
    setResolutionPreview(null);
  };

  const handleResolutionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResolutionFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitLoading(true);

    const updateData = new FormData();
    updateData.append('status', actionStatus);
    updateData.append('comment', actionComment);
    if (actionStatus === 'Resolved' && resolutionFile) {
      updateData.append('resolutionImage', resolutionFile);
    }

    try {
      const res = await fetch(`${API_URL}/reports/${selectedReport._id || selectedReport.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadDataPrep(actionStatus, actionComment, resolutionFile)
      });

      if (res.ok) {
        setSelectedReport(null);
        fetchReports(); // Refresh data
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Network error.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper because FormData construction inside fetch is cleaner
  const uploadDataPrep = (status, comment, file) => {
    const fd = new FormData();
    fd.append('status', status);
    fd.append('comment', comment);
    if (file) {
      fd.append('resolutionImage', file);
    }
    return fd;
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Navbar />

      <main style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        padding: '0 20px'
      }} className="animate-slide">

        {/* Title and stats summary */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Govt Department Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome, <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong>. Managing tickets filed in category <strong style={{ color: 'var(--primary)' }}>{user?.department}</strong>.
          </p>
        </div>

        {/* Embed analytics chart (custom donut / bar charts) */}
        {!loading && <StatsChart reports={reports} />}

        {/* Filters Toolbar */}
        <div className="glass-panel" style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Status filters */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {['All', 'Pending', 'In Progress', 'Resolved'].map(st => {
              const isActive = filterStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '6px 14px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-input)',
                    color: isActive ? 'var(--text-on-primary)' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Department:</span>
            <div style={{ position: 'relative' }}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="form-control"
                style={{ padding: '6px 36px 6px 12px', fontSize: '0.85rem', appearance: 'none', minWidth: '220px' }}
              >
                <option value="All">All Categories</option>
                <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                <option value="Roads & Transport">Roads & Transport</option>
                <option value="Electricity & Power">Electricity & Power</option>
                <option value="Water Supply & Sewage">Water Supply & Sewage</option>
                <option value="Forestry & Environment">Forestry & Environment</option>
              </select>
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '0.7rem' }}>▼</div>
            </div>
          </div>
        </div>

        {/* Complaints Listing */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading tickets...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Tickets Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                There are no civic reports matching your selected criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)' }}>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Report Details</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Reporter</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    let badge = 'badge-pending';
                    if (report.status === 'In Progress') badge = 'badge-progress';
                    if (report.status === 'Resolved') badge = 'badge-resolved';

                    return (
                      <tr key={report._id || report.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)' }} className="table-row-hover">
                        {/* Title & Description */}
                        <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {report.imageUrl && (
                              <img 
                                src={report.imageUrl.startsWith('/') ? `http://localhost:5000${report.imageUrl}` : report.imageUrl} 
                                alt={report.title} 
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                              />
                            )}
                            <div>
                              <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>{report.title}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                                {report.location.address}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Category */}
                        <td style={{ padding: '16px 20px', fontWeight: 500, color: 'var(--primary)' }}>
                          {report.category}
                        </td>
                        
                        {/* Citizen */}
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontWeight: 500, color: 'var(--text-main)', display: 'block' }}>{report.citizen.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.citizen.email}</span>
                        </td>
                        
                        {/* Date */}
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        
                        {/* Status */}
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge ${badge}`}>{report.status}</span>
                        </td>
                        
                        {/* Action buttons */}
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link to={`/reports/${report._id || report.id}`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} title="View details">
                              View
                            </Link>
                            
                            {report.status !== 'Resolved' && (
                              <button 
                                onClick={() => handleActionClick(report)} 
                                className="btn btn-primary" 
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              >
                                {report.status === 'Pending' ? 'Process' : 'Resolve'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Process / Resolve Ticket */}
        {selectedReport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div className="glass-panel animate-slide" style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--bg-surface-solid)',
              padding: '30px',
              position: 'relative',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Close Icon */}
              <button 
                onClick={() => setSelectedReport(null)} 
                style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Update Complaint Status</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket ID: {selectedReport._id || selectedReport.id}</span>
              </div>

              <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Update Status</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value)}
                      className="form-control"
                      required
                    >
                      {selectedReport.status === 'Pending' && <option value="In Progress">Mark In Progress</option>}
                      <option value="Resolved">Mark Resolved</option>
                    </select>
                    <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▼</div>
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="actionComment">Resolution/Official Comment</label>
                  <textarea
                    id="actionComment"
                    className="form-control"
                    rows="3"
                    placeholder={actionStatus === 'In Progress' ? "e.g., Assigned inspector to clean site." : "e.g., Cleanup team completed. Proof attached."}
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    required
                  />
                </div>

                {/* Resolution Image Upload (Only if marking resolved) */}
                {actionStatus === 'Resolved' && (
                  <div className="input-group animate-slide">
                    <label className="input-label">Resolution Image Proof (Optional)</label>
                    <div 
                      style={{
                        width: '100%',
                        height: '130px',
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-input)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                      onClick={() => document.getElementById('res-photo-input').click()}
                    >
                      {resolutionPreview ? (
                        <img src={resolutionPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <UploadCloud size={24} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Click to upload proof image</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        id="res-photo-input" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={handleResolutionFileChange}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedReport(null)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Submitting...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
