'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCurriculumActions, 
  createCurriculumAction, 
  getPrograms, 
  getCourses, 
  getCompetencies, 
  getSubmissions,
  getCurriculumArtifacts,
  createValidationRequest,
  getValidationResponses,
  getCurrentUser
} from '@/lib/services/dbService';
import Link from 'next/link';

export default function CurriculumActionsPage() {
  const [actions, setActions] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [validationResponses, setValidationResponses] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);

  // Form State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [actionType, setActionType] = useState('mastery_assessment_revised');
  const [programId, setProgramId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [competencyId, setCompetencyId] = useState('');
  const [description, setDescription] = useState('');
  const [rationale, setRationale] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);
  const [selectedArtIds, setSelectedArtIds] = useState<string[]>([]);

  // Validation Link State
  const [generatedValLink, setGeneratedValLink] = useState<{ [artId: string]: string }>({});

  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('http://localhost:3000');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }

    async function loadData() {
      try {
        setActions(await getCurriculumActions());
        setPrograms(await getPrograms());
        setCourses(await getCourses());
        setCompetencies(await getCompetencies());
        const subs = await getSubmissions();
        setSubmissions(subs.filter(s => s.status === 'accepted' || s.status === 'accepted_with_restrictions'));
        setArtifacts(await getCurriculumArtifacts());
        setValidationResponses(await getValidationResponses());
      } catch (e) {
        console.error('Error loading curriculum actions data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectAction = (action: any) => {
    setSelectedAction(action);
    setGeneratedValLink({});
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !rationale || !programId) return;

    try {
      const user = await getCurrentUser();
      const newAction = await createCurriculumAction({
        organization_id: 'org-demo-dtc',
        program_id: programId,
        course_id: courseId || undefined,
        competency_id: competencyId || undefined,
        action_type: actionType,
        title,
        description,
        rationale,
        effective_term: term,
        created_by: user?.id || 'usr-id',
        supporting_evidence_ids: selectedSubIds,
        linked_artifact_ids: selectedArtIds,
      });

      // Reload list
      setActions(await getCurriculumActions());
      setShowCreate(false);
      
      // Reset
      setTitle('');
      setActionType('mastery_assessment_revised');
      setProgramId('');
      setCourseId('');
      setCompetencyId('');
      setDescription('');
      setRationale('');
      setSelectedSubIds([]);
      setSelectedArtIds([]);

      // Select new action
      handleSelectAction(newAction);
    } catch (e) {
      alert('Error saving curriculum action');
    }
  };

  const handleToggleSubLink = (id: string) => {
    if (selectedSubIds.includes(id)) {
      setSelectedSubIds(selectedSubIds.filter(x => x !== id));
    } else {
      setSelectedSubIds([...selectedSubIds, id]);
    }
  };

  const handleToggleArtLink = (id: string) => {
    if (selectedArtIds.includes(id)) {
      setSelectedArtIds(selectedArtIds.filter(x => x !== id));
    } else {
      setSelectedArtIds([...selectedArtIds, id]);
    }
  };

  const handleGenerateValidationLink = async (artifactId: string) => {
    try {
      const user = await getCurrentUser();
      const req = await createValidationRequest(artifactId, user?.id || 'usr-id');
      const valLink = `${origin}/validate/${req.token}`;
      setGeneratedValLink(prev => ({ ...prev, [artifactId]: valLink }));
    } catch (e) {
      alert('Error creating validation request token');
    }
  };

  if (loading) {
    return <p>Loading curriculum actions log...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Curriculum Action Log</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Document and trace institutional curriculum changes back to the industry evidence that prompted them.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          {showCreate ? 'View Action Log' : '+ Log Curriculum Action'}
        </button>
      </header>

      {showCreate ? (
        /* Create Action Form */
        <form onSubmit={handleCreateAction} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Log Curriculum Change Action</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="title-input">Change Title / Headline *</label>
              <input id="title-input" type="text" className="input" placeholder="e.g. Revised Hydraulic System Troubleshooting Mastery Assessment" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="type-select">Action Type *</label>
              <select id="type-select" className="select" value={actionType} onChange={(e) => setActionType(e.target.value)}>
                <option value="content_added">Content Added</option>
                <option value="content_removed">Content Removed</option>
                <option value="lab_added">Lab Added</option>
                <option value="lab_revised">Lab Revised</option>
                <option value="mastery_assessment_added">Mastery Assessment Added</option>
                <option value="mastery_assessment_revised">Mastery Assessment Revised</option>
                <option value="mastery_assessment_retired">Mastery Assessment Retired</option>
                <option value="sequence_changed">Sequence Changed</option>
                <option value="equipment_recommendation">Equipment Recommendation</option>
                <option value="no_change_required">No Change Required</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="prog-select">Associated Program *</label>
              <select id="prog-select" className="select" value={programId} onChange={(e) => setProgramId(e.target.value)} required>
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
            <div className="form-group">
              <label className="label" htmlFor="comp-select">Associated Competency</label>
              <select id="comp-select" className="select" value={competencyId} onChange={(e) => setCompetencyId(e.target.value)}>
                <option value="">Choose competency...</option>
                {competencies.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="desc-input">Change Description (What was modified?) *</label>
            <textarea id="desc-input" className="textarea" placeholder="Outline the exact curriculum changes implemented..." value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="rationale-input">Traceability Rationale (Why was this changed?) *</label>
            <textarea id="rationale-input" className="textarea" placeholder="Explain the rationale, highlighting the specific industry evidence codes that support this decision..." value={rationale} onChange={(e) => setRationale(e.target.value)} required />
          </div>

          <div className="form-group" style={{ maxWidth: '240px' }}>
            <label className="label" htmlFor="term-input">Effective Calendar Term</label>
            <input id="term-input" type="text" className="input" placeholder="e.g. Fall 2026" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>

          {/* Linking Evidence */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Link Supporting Industry Evidence</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Select the specific industry submittals that justified this change.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              {submissions.map(sub => {
                const isSelected = selectedSubIds.includes(sub.id);
                return (
                  <label key={sub.id} className="checkbox-label" style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" className="checkbox-input" checked={isSelected} onChange={() => handleToggleSubLink(sub.id)} />
                    <div>
                      <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--secondary)' }}>{sub.reference_id}</strong>
                      <span style={{ fontSize: '0.75rem', display: 'block' }}>{sub.title}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Linking Curriculum Artifacts */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Link Modifying Curriculum Artifacts</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Select the training documents (labs, assessments, rubrics) that contain these updates.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              {artifacts.map(art => {
                const isSelected = selectedArtIds.includes(art.id);
                return (
                  <label key={art.id} className="checkbox-label" style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" className="checkbox-input" checked={isSelected} onChange={() => handleToggleArtLink(art.id)} />
                    <div>
                      <strong style={{ fontSize: '0.85rem', display: 'block' }}>{art.title}</strong>
                      <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-muted)' }}>Type: {art.artifact_type} (v{art.version})</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-accent">Save Action to Log</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        /* Action split view */
        <div style={{ display: 'grid', gridTemplateColumns: selectedAction ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Action List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {actions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No curriculum actions logged yet.</p>
            ) : (
              actions.map(act => {
                const isSelected = selectedAction?.id === act.id;
                const dateString = new Date(act.created_at).toLocaleDateString();
                return (
                  <div
                    key={act.id}
                    className="card"
                    onClick={() => handleSelectAction(act)}
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{act.action_type.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateString}</span>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', margin: 0 }}>{act.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', marginTop: '0.25rem' }}>Term: {act.effective_term}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Detail View */}
          {selectedAction && (
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <span className="badge badge-accent" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                    {selectedAction.action_type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{selectedAction.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged by Clara Barton (ID) • Effective {selectedAction.effective_term}</span>
                </div>
                <button onClick={() => setSelectedAction(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                  ✕ Close Details
                </button>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Change Description</strong>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedAction.description}</p>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Traceability Rationale</strong>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedAction.rationale}</p>
              </div>

              {/* Supporting Evidence Provenance */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>Sourced Industry Evidence</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedAction.supporting_evidence_ids.map((subId: string) => {
                    const sub = submissions.find(s => s.id === subId || s.reference_id === subId);
                    if (!sub) return null;
                    return (
                      <div key={subId} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-base)', padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <strong style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{sub.reference_id}</strong>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>{sub.title}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Job role: {sub.job_role}</span>
                        </div>
                        <Link href="/inbox" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                          👁 View Original Evidence
                        </Link>
                      </div>
                    );
                  })}
                  {selectedAction.supporting_evidence_ids.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No supporting evidence records linked to this change.</span>
                  )}
                </div>
              </div>

              {/* Modifying Curriculum Artifacts & Industry Validation checks */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Modifying Curriculum Artifacts & Industry Verification</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedAction.linked_artifact_ids.map((artId: string) => {
                    const art = artifacts.find(a => a.id === artId);
                    if (!art) return null;

                    // Find validations received for this artifact
                    const responses = validationResponses.filter(r => {
                      // Lookup request to match
                      return true; // Simple mock filter
                    });

                    const valLink = generatedValLink[art.id];

                    return (
                      <div key={artId} style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.95rem' }}>📖 {art.title}</strong>
                          <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{art.artifact_type} (v{art.version})</span>
                        </div>

                        {/* Validation Request Action */}
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleGenerateValidationLink(art.id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            🤝 Generate Industry Validation Link
                          </button>
                        </div>

                        {valLink && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '4px' }}>
                            <input
                              id={`val-link-${art.id}`}
                              type="text"
                              className="input"
                              style={{ padding: '0.35rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                              value={valLink}
                              readOnly
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(valLink);
                                alert('Validation link copied to clipboard!');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Copy
                            </button>
                          </div>
                        )}

                        {/* Mock responses list */}
                        <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>Industry Validation Feedback:</span>
                          <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {responses.length > 0 ? (
                              responses.map(resp => (
                                <div key={resp.id} style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: '4px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                                    <strong>{resp.general_comments ? 'Validated' : 'Feedback Received'}</strong>
                                    <span>Preparation: {resp.preparedness_rating.toUpperCase()}</span>
                                  </div>
                                  <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)' }}>"{resp.unrealistic_missing_comments || resp.general_comments}"</p>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No verification responses logged yet.</span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  {selectedAction.linked_artifact_ids.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No curriculum artifacts linked to this change.</span>
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
