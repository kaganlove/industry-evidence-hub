'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getSubmissions,
  updateSubmission,
  getPrograms,
  getCourses,
  getCompetencies,
  getSubmissionCompetencyMappings,
  addSubmissionCompetencyMapping,
  removeSubmissionCompetencyMapping,
  getTags,
  getSubmissionTags,
  toggleSubmissionTag,
  createTag,
  MOCK_USERS,
  getPartners,
  getContributors
} from '@/lib/services/dbService';

export default function EvidenceInboxPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams?.get('status') || 'new';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  
  // Mappings and tagging lists
  const [programsList, setProgramsList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [competenciesList, setCompetenciesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [contributorsList, setContributorsList] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);

  // Selected Submission Detail States
  const [subCompMappings, setSubCompMappings] = useState<any[]>([]);
  const [subTags, setSubTags] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [assignedReviewer, setAssignedReviewer] = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [mapCompId, setMapCompId] = useState('');
  const [mapCompNotes, setMapCompNotes] = useState('');
  const [mapCompRating, setMapCompRating] = useState('5');
  const [newTagName, setNewTagName] = useState('');

  const [loading, setLoading] = useState(true);

  // Tabs layout configuration
  const tabs = [
    { id: 'all', label: 'All Submissions' },
    { id: 'new', label: 'New' },
    { id: 'review', label: 'In Review' },
    { id: 'sme', label: 'SME Review' },
    { id: 'clarification', label: 'Needs Clarification' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'rejected', label: 'Rejected' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const subs = await getSubmissions();
        setSubmissions(subs);
        setProgramsList(await getPrograms());
        setCoursesList(await getCourses());
        setCompetenciesList(await getCompetencies());
        setPartnersList(await getPartners());
        setContributorsList(await getContributors());
        setTagsList(await getTags());
      } catch (e) {
        console.error('Error loading inbox submittals', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update detail states when a submission is clicked
  const handleSelectSubmission = async (sub: any) => {
    setSelectedSub(sub);
    setSubStatus(sub.status);
    setAssignedReviewer(sub.assigned_reviewer_id || '');
    setNewNote(sub.additional_comments || '');
    
    // Load mappings & tags
    const mappings = await getSubmissionCompetencyMappings(sub.id);
    setSubCompMappings(mappings);
    const tags = await getSubmissionTags(sub.id);
    setSubTags(tags);
  };

  const handleUpdateStatus = async (status: any) => {
    if (!selectedSub) return;
    try {
      const updated = await updateSubmission(selectedSub.id, { status });
      setSubStatus(status);
      setSelectedSub(updated);
      
      // Update item in list
      setSubmissions(submissions.map(s => s.id === selectedSub.id ? updated : s));
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleUpdateReviewer = async (reviewerId: string) => {
    if (!selectedSub) return;
    try {
      const updated = await updateSubmission(selectedSub.id, { 
        assigned_reviewer_id: reviewerId || undefined 
      });
      setAssignedReviewer(reviewerId);
      setSelectedSub(updated);
      setSubmissions(submissions.map(s => s.id === selectedSub.id ? updated : s));
    } catch (e) {
      alert('Error assigning reviewer');
    }
  };

  const handleAddCompetencyMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !mapCompId) return;
    try {
      await addSubmissionCompetencyMapping(
        selectedSub.id, 
        mapCompId, 
        mapCompNotes, 
        parseInt(mapCompRating)
      );
      // Reload mappings
      const mappings = await getSubmissionCompetencyMappings(selectedSub.id);
      setSubCompMappings(mappings);
      setMapCompId('');
      setMapCompNotes('');
    } catch (e) {
      alert('Error mapping competency');
    }
  };

  const handleRemoveCompetencyMapping = async (compId: string) => {
    if (!selectedSub) return;
    try {
      await removeSubmissionCompetencyMapping(selectedSub.id, compId);
      const mappings = await getSubmissionCompetencyMappings(selectedSub.id);
      setSubCompMappings(mappings);
    } catch (e) {
      alert('Error unmapping competency');
    }
  };

  const handleToggleTag = async (tagId: string) => {
    if (!selectedSub) return;
    try {
      await toggleSubmissionTag(selectedSub.id, tagId);
      const tags = await getSubmissionTags(selectedSub.id);
      setSubTags(tags);
    } catch (e) {
      alert('Error toggling tag');
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !selectedSub) return;
    try {
      const created = await createTag(newTagName);
      // Refresh tag list
      const allTags = await getTags();
      setTagsList(allTags);
      
      // Automatically toggle it for this submission
      await toggleSubmissionTag(selectedSub.id, created.id);
      const subT = await getSubmissionTags(selectedSub.id);
      setSubTags(subT);
      setNewTagName('');
    } catch (e) {
      alert('Error creating tag');
    }
  };

  // Filters logic
  const filteredSubmissions = submissions.filter(sub => {
    // Search match
    const searchMatch = 
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.reference_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.task_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.job_role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!searchMatch) return false;

    // Tab match
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return sub.status === 'new';
    if (activeTab === 'review') return ['in_review', 'needs_clarification'].includes(sub.status);
    if (activeTab === 'sme') return sub.status === 'needs_sme_review';
    if (activeTab === 'clarification') return sub.status === 'needs_clarification';
    if (activeTab === 'accepted') return ['accepted', 'accepted_with_restrictions'].includes(sub.status);
    if (activeTab === 'rejected') return sub.status === 'rejected';

    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Evidence Inbox</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review original workplace submissions and map them to curricula.</p>
      </header>

      {/* Main Inbox Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedSub ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Submissions List Side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              id="search-inbox-input"
              type="text"
              className="input"
              placeholder="🔍 Search title, ref, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tab buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {filteredSubmissions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No evidence submissions found.</p>
            ) : (
              filteredSubmissions.map(sub => {
                const contr = contributorsList.find(c => c.id === sub.contributor_id);
                const partner = contr ? partnersList.find(p => p.id === contr.industry_partner_id) : null;
                const isSelected = selectedSub?.id === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="card"
                    onClick={() => handleSelectSubmission(sub)}
                    style={{
                      cursor: 'pointer',
                      padding: '1rem',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>{sub.reference_id}</span>
                      <span className={`badge badge-${sub.status === 'accepted' ? 'success' : sub.status === 'new' ? 'new' : 'review'}`} style={{ fontSize: '0.65rem' }}>
                        {sub.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>🏢 {partner?.organization_name || 'Independent Contributor'}</span>
                      <span style={{ display: 'block', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Role: {sub.job_role}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Submission Detail Panel (Side-by-Side Split Workspace) */}
        {selectedSub && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Header control buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <strong style={{ color: 'var(--secondary)' }}>{selectedSub.reference_id}</strong>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedSub.title}</h2>
              </div>
              <button onClick={() => setSelectedSub(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                ✕ Close Detail
              </button>
            </div>

            {/* Core Two-Panel Split Layout */}
            <div className="split-layout">
              
              {/* Left Panel: Source Evidence */}
              <div className="card panel-source" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>Layer 1: Source Evidence</span>
                  <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>Industry Evidence</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Original unedited facts provided by industry.</span>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Job Role Expected</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedSub.job_role}</p>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Workplace Task / Situation</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>{selectedSub.task_description}</p>
                </div>

                {selectedSub.tools_resources && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Tools & Resources Available</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedSub.tools_resources}</p>
                  </div>
                )}

                {selectedSub.success_description && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Successful Performance Indicators</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedSub.success_description}</p>
                  </div>
                )}

                {selectedSub.common_mistakes && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--status-review)', display: 'block' }}>Common Mistakes / Pitfalls</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedSub.common_mistakes}</p>
                  </div>
                )}

                {selectedSub.unsafe_unacceptable && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--status-danger)', display: 'block' }}>Unsafe / Unacceptable Limits</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedSub.unsafe_unacceptable}</p>
                  </div>
                )}

                {/* Attachments */}
                {selectedSub.attachments && selectedSub.attachments.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Original Uploaded Artifacts</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {selectedSub.attachments.map((file: any) => (
                        <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-base)', padding: '0.5rem', borderRadius: '4px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>📎 {file.display_filename} ({file.file_extension.toUpperCase()})</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contributor Profile */}
                <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contributor Info</strong>
                  {(() => {
                    const contr = contributorsList.find(c => c.id === selectedSub.contributor_id);
                    const partner = contr ? partnersList.find(p => p.id === contr.industry_partner_id) : null;
                    if (!contr) return <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Anonymous Submission</span>;
                    return (
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ display: 'block', fontWeight: 600 }}>{contr.first_name || 'Anonymous'} {contr.last_name || ''}</span>
                        <span style={{ display: 'block', color: 'var(--text-secondary)' }}>🏢 {partner?.organization_name || 'Independent Contributor'}</span>
                        <span style={{ display: 'block', color: 'var(--text-muted)' }}>Job Title: {contr.job_title} ({contr.contributor_type})</span>
                        <span style={{ display: 'block', color: 'var(--text-muted)' }}>Email: {contr.email || 'Not Provided'}</span>
                        <span style={{ display: 'block', color: contr.allow_follow_up ? 'var(--secondary)' : 'var(--status-neutral)', fontWeight: 600, marginTop: '0.25rem' }}>
                          {contr.allow_follow_up ? '✓ Follow-up Clarification Authorized' : '✗ Follow-up Clarification Restricted'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Permissions Info */}
                <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Authorized Permissions</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level A (Internal Review):</span>
                      <strong style={{ color: selectedSub.permission_internal_review ? 'var(--secondary)' : 'var(--text-muted)' }}>
                        {selectedSub.permission_internal_review ? 'AUTHORIZED' : 'RESTRICTED'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level B (Adaptation):</span>
                      <strong style={{ color: selectedSub.permission_curriculum_adaptation ? 'var(--secondary)' : 'var(--text-muted)' }}>
                        {selectedSub.permission_curriculum_adaptation ? 'AUTHORIZED' : 'RESTRICTED'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level C (Classroom Distribution):</span>
                      <strong style={{ color: selectedSub.permission_classroom_distribution ? 'var(--secondary)' : 'var(--text-muted)' }}>
                        {selectedSub.permission_classroom_distribution ? 'AUTHORIZED' : 'RESTRICTED'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level D (Public Distribution):</span>
                      <strong style={{ color: selectedSub.permission_public_distribution ? 'var(--secondary)' : 'var(--text-muted)' }}>
                        {selectedSub.permission_public_distribution ? 'AUTHORIZED' : 'RESTRICTED'}
                      </strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Panel: Institutional Interpretation */}
              <div className="card panel-interpretation" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>Layer 2: Human Interpretation</span>
                  <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>ID / SME Interpretation</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All connections and metadata must be determined by qualified humans.</span>
                </div>

                {/* Workflow Status */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <label className="label" htmlFor="status-select">Review Status</label>
                  <select
                    id="status-select"
                    className="select"
                    value={subStatus}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="in_review">In Review</option>
                    <option value="needs_sme_review">Needs SME Review</option>
                    <option value="needs_clarification">Needs Clarification</option>
                    <option value="accepted">Accepted</option>
                    <option value="accepted_with_restrictions">Accepted with Restrictions</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Reviewer Assignment */}
                <div>
                  <label className="label" htmlFor="reviewer-select">Assigned Reviewer</label>
                  <select
                    id="reviewer-select"
                    className="select"
                    value={assignedReviewer}
                    onChange={(e) => handleUpdateReviewer(e.target.value)}
                  >
                    <option value="">Choose reviewer...</option>
                    {MOCK_USERS.map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role.replace('_', ' ')})</option>
                    ))}
                  </select>
                </div>

                {/* Competency Mappings */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Mapped Competencies</h3>
                  
                  {/* Current Mappings list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {subCompMappings.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No competencies mapped yet.</span>
                    ) : (
                      subCompMappings.map(map => {
                        const comp = competenciesList.find(c => c.id === map.competency_id);
                        return (
                          <div key={map.competency_id} style={{ background: 'var(--bg-base)', padding: '0.5rem 0.75rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{comp?.code}</strong>
                              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Relevance: {map.relevance_rating}/5</span>
                              {map.notes && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Note: {map.notes}</span>}
                            </div>
                            <button onClick={() => handleRemoveCompetencyMapping(map.competency_id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', fontSize: '0.8rem' }}>
                              Unmap
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Mapping Form */}
                  <form onSubmit={handleAddCompetencyMapping} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-base)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="label" htmlFor="comp-select" style={{ fontSize: '0.8rem' }}>Map New Competency</label>
                      <select id="comp-select" className="select" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={mapCompId} onChange={(e) => setMapCompId(e.target.value)}>
                        <option value="">Select competency...</option>
                        {competenciesList.map(c => (
                          <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '0.5rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          id="map-notes-input"
                          type="text"
                          className="input"
                          placeholder="Mapping rationale note..."
                          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                          value={mapCompNotes}
                          onChange={(e) => setMapCompNotes(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <select
                          id="map-rating-select"
                          className="select"
                          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                          value={mapCompRating}
                          onChange={(e) => setMapCompRating(e.target.value)}
                        >
                          <option value="5">5 ★ (Direct)</option>
                          <option value="4">4 ★</option>
                          <option value="3">3 ★ (Indirect)</option>
                          <option value="2">2 ★</option>
                          <option value="1">1 ★</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem', fontSize: '0.8rem' }} disabled={!mapCompId}>
                      + Map Competency
                    </button>
                  </form>
                </div>

                {/* Tag Manager */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Review Tags</h3>
                  
                  {/* Current Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {subTags.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tags attached.</span>
                    ) : (
                      subTags.map(t => (
                        <span
                          key={t.id}
                          onClick={() => handleToggleTag(t.id)}
                          style={{
                            background: 'var(--primary-glow)',
                            border: '1px solid var(--primary)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: 'white'
                          }}
                        >
                          {t.name} ✕
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Tag selectors */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '1rem' }}>
                    {tagsList.filter(t => !subTags.some(st => st.id === t.id)).map(t => (
                      <span
                        key={t.id}
                        onClick={() => handleToggleTag(t.id)}
                        style={{
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border-color)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        + {t.name}
                      </span>
                    ))}
                  </div>

                  {/* Create tag inline */}
                  <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      id="new-tag-input"
                      type="text"
                      className="input"
                      placeholder="Create tag..."
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Add
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
