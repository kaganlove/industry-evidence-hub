'use client';

import React, { useState, useEffect } from 'react';
import { 
  getEvidenceRequests, 
  createEvidenceRequest, 
  getPrograms, 
  getCourses, 
  getCompetencies, 
  getSubmissions,
  getCurrentUser
} from '@/lib/services/dbService';

export default function EvidenceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  // New Request Form State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [programId, setProgramId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [selectedCompId, setSelectedCompId] = useState('');
  const [allowAnon, setAllowAnon] = useState(true);

  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    async function loadData() {
      try {
        setRequests(await getEvidenceRequests());
        setSubmissions(await getSubmissions());
        setPrograms(await getPrograms());
        setCourses(await getCourses());
        setCompetencies(await getCompetencies());
      } catch (e) {
        console.error('Error loading request campaigns', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const user = await getCurrentUser();
      const newReq = await createEvidenceRequest({
        organization_id: 'org-demo-dtc',
        title,
        description,
        purpose,
        program_id: programId || undefined,
        course_id: courseId || undefined,
        created_by: user?.id || 'usr-id',
        allow_anonymous: allowAnon,
      });

      // Reload
      setRequests(await getEvidenceRequests());
      setShowCreate(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPurpose('');
      setProgramId('');
      setCourseId('');
      setSelectedReq(newReq);
    } catch (e) {
      alert('Error creating evidence request campaign');
    }
  };

  if (loading) {
    return <p>Loading evidence requests...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Evidence Requests</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Launch targeted campaigns to source specific workplace tasks and artifacts from industry.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          {showCreate ? 'View Campaigns' : '+ Create Request Link'}
        </button>
      </header>

      {showCreate ? (
        /* Create Request Form */
        <form onSubmit={handleCreateRequest} className="card animate-fade-in" style={{ maxWidth: '640px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Create Evidence Request Link</h2>

          <div className="form-group">
            <label className="label" htmlFor="title-input">Request Title *</label>
            <input
              id="title-input"
              type="text"
              className="input"
              placeholder="e.g. Hydrostatic Pump Service Log Examples"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="desc-input">Instructions for Industry (What should they share?) *</label>
            <textarea
              id="desc-input"
              className="textarea"
              placeholder="e.g. We are looking for hydraulic cylinder inspect checklists showing seals leakage scoring specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="purpose-input">Internal Purpose (Why are we seeking this?)</label>
            <textarea
              id="purpose-input"
              className="textarea"
              placeholder="e.g. To verify whether entry-level repair specifications match actual lab tolerances..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="prog-select">Associated Program</label>
              <select id="prog-select" className="select" value={programId} onChange={(e) => setProgramId(e.target.value)}>
                <option value="">Choose program...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="course-select">Associated Course</label>
              <select id="course-select" className="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Choose course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
              </select>
            </div>
          </div>

          <label className="checkbox-label" style={{ marginBottom: '2rem' }}>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={allowAnon}
              onChange={(e) => setAllowAnon(e.target.checked)}
            />
            <span>Allow anonymous industry submissions</span>
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-accent">Generate Secure Link</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        /* Requests Dashboard View */
        <div style={{ display: 'grid', gridTemplateColumns: selectedReq ? '360px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Requests List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map(req => {
              const subCount = submissions.filter(s => s.evidence_request_id === req.id).length;
              const isSelected = selectedReq?.id === req.id;
              
              return (
                <div
                  key={req.id}
                  className="card"
                  onClick={() => setSelectedReq(req)}
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{req.status}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subCount} submissions</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>{req.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                    {req.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Request Details and Sharing Drawer */}
          {selectedReq && (
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{selectedReq.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created {new Date(selectedReq.created_at).toLocaleDateString()}</span>
                </div>
                <button onClick={() => setSelectedReq(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                  ✕ Close Details
                </button>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Target Instructions</strong>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{selectedReq.description}</p>
              </div>

              {selectedReq.purpose && (
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Internal Purpose</strong>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{selectedReq.purpose}</p>
                </div>
              )}

              {/* Secure QR Code & Link sharing section */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Secure Share Link</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Distribute this tokenized link to industry partners to gather feedback without forcing them to create institutional accounts.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      id="share-link-input"
                      type="text"
                      className="input"
                      style={{ padding: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      value={`${origin}/submit/${selectedReq.token}`}
                      readOnly
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${origin}/submit/${selectedReq.token}`);
                        alert('Link copied to clipboard!');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(`${origin}/submit/${selectedReq.token}`)}`}
                    alt="Scan to submit evidence"
                    style={{ background: 'white', padding: '0.35rem', borderRadius: '4px', width: '130px', height: '130px' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Scan QR to Submit</span>
                </div>
              </div>

              {/* Submissions stats */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Submissions Sourced ({submissions.filter(s => s.evidence_request_id === selectedReq.id).length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {submissions.filter(s => s.evidence_request_id === selectedReq.id).map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-base)', borderRadius: '4px' }}>
                      <span style={{ fontSize: '0.85rem' }}>{sub.reference_id} - {sub.title}</span>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{sub.status}</span>
                    </div>
                  ))}
                  {submissions.filter(s => s.evidence_request_id === selectedReq.id).length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No submittals received yet for this campaign.</span>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
