import React from 'react';
import { CheckCircle, Clock, AlertCircle, BarChart2 } from 'lucide-react';

export default function StatsChart({ reports = [] }) {
  // 1. Calculate Metrics
  const total = reports.length;
  const pending = reports.filter(r => r.status === 'Pending').length;
  const progress = reports.filter(r => r.status === 'In Progress').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;

  // 2. Category distribution
  const categories = {};
  reports.forEach(r => {
    categories[r.category] = (categories[r.category] || 0) + 1;
  });

  const maxCategoryCount = Math.max(...Object.values(categories), 1);

  // 3. Donut chart parameters
  const resolvedPct = total > 0 ? (resolved / total) * 100 : 0;
  const progressPct = total > 0 ? (progress / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  // SVG Circle stroke dash calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  
  const strokeResolved = (resolvedPct / 100) * circumference;
  const strokeProgress = (progressPct / 100) * circumference;
  const strokePending = (pendingPct / 100) * circumference;

  const offsetResolved = 0;
  const offsetProgress = strokeResolved;
  const offsetPending = strokeResolved + strokeProgress;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '20px 0' }}>
      
      {/* Visual Analytics - Status Donut */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} /> Status Analytics
        </h3>
        
        {total === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '180px' }}>
            No report data available
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, minHeight: '180px' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r={radius} 
                  fill="transparent" 
                  stroke="var(--border-color)" 
                  strokeWidth="12" 
                />
                
                {/* Resolved (Green) */}
                {strokeResolved > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--color-resolved)" 
                    strokeWidth="12" 
                    strokeDasharray={`${strokeResolved} ${circumference}`}
                    strokeDashoffset={-offsetResolved}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                )}
                
                {/* In Progress (Orange) */}
                {strokeProgress > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--color-progress)" 
                    strokeWidth="12" 
                    strokeDasharray={`${strokeProgress} ${circumference}`}
                    strokeDashoffset={-offsetProgress}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                )}

                {/* Pending (Red) */}
                {strokePending > 0 && (
                  <circle 
                    cx="60" 
                    cy="60" 
                    r={radius} 
                    fill="transparent" 
                    stroke="var(--color-pending)" 
                    strokeWidth="12" 
                    strokeDasharray={`${strokePending} ${circumference}`}
                    strokeDashoffset={-offsetPending}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                )}
              </svg>
              {/* Center Text */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                lineHeight: 1
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{total}</span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>Issues</span>
              </div>
            </div>

            {/* Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-resolved)' }}></span>
                <span style={{ fontWeight: 500, width: '80px' }}>Resolved</span>
                <strong style={{ color: 'var(--text-main)' }}>{resolved}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round(resolvedPct)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-progress)' }}></span>
                <span style={{ fontWeight: 500, width: '80px' }}>In Progress</span>
                <strong style={{ color: 'var(--text-main)' }}>{progress}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round(progressPct)}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-pending)' }}></span>
                <span style={{ fontWeight: 500, width: '80px' }}>Pending</span>
                <strong style={{ color: 'var(--text-main)' }}>{pending}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round(pendingPct)}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Analytics - Categories Bar Chart */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={18} style={{ color: 'var(--primary)' }} /> Category Distribution
        </h3>
        
        {total === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '180px' }}>
            No report data available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            {Object.entries(categories).map(([category, count]) => {
              const percentage = (count / maxCategoryCount) * 100;
              return (
                <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-main)' }}>{category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({Math.round((count / total) * 100)}%)</span>
                  </div>
                  {/* Progress Bar Container */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {/* Glowing Progress bar */}
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s cubic-bezier(0.1, 1, 0.1, 1)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
