'use client';

import React, { useState, useEffect } from 'react';
import { 
  getTaskProfiles, 
  createTaskProfile, 
  getTaskProfileSubmissions, 
  getSubmissions,
  getCurrentUser
} from '@/lib/services/dbService';
import Link from 'next/link';

export default function TaskProfilesPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [supportingSubmissions, setSupportingSubmissions] = useState<any[]>([]);

  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [occupation, setOccupation] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState('');
  const [conditions, setConditions] = useState('');
  const [tools, setTools] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [inputs, setInputs] = useState('');
  const [outputs, setOutputs] = useState('');
  const [performance, setPerformance] = useState('');
  const [commonErrors, setCommonErrors] = useState('');
  const [safetyErrors, setSafetyErrors] = useState('');
  const [successIndicators, setSuccessIndicators] = useState('');
  const [independence, setIndependence] = useState('');
  const [frequency, setFrequency] = useState('');
  const [notes, setNotes] = useState('');
  const [linkSubIds, setLinkSubIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setProfiles(await getTaskProfiles());
        const subs = await getSubmissions();
        // Only allow mapping accepted evidence
        setSubmissions(subs.filter(s => s.status === 'accepted' || s.status === 'accepted_with_restrictions'));
      } catch (e) {
        console.error('Error loading task profiles', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectProfile = async (profile: any) => {
    setSelectedProfile(profile);
    const mapped = await getTaskProfileSubmissions(profile.id);
    setSupportingSubmissions(mapped);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !occupation || !description) return;

    try {
      const user = await getCurrentUser();
      const newProfile = await createTaskProfile({
        organization_id: 'org-demo-dtc',
        title,
        occupation,
        task_description: description,
        job_trigger: trigger,
        typical_conditions: conditions,
        available_tools: tools,
        available_documentation: documentation,
        worker_inputs: inputs,
        expected_outputs: outputs,
        observable_performance: performance,
        common_errors: commonErrors,
        critical_safety_errors: safetyErrors,
        success_indicators: successIndicators,
        expected_independence: independence,
        typical_frequency: frequency,
        notes,
        created_by: user?.id || 'usr-id',
        supportingSubmissionIds: linkSubIds,
      });

      // Reload
      setProfiles(await getTaskProfiles());
      setShowCreate(false);
      
      // Reset Form
      setTitle('');
      setOccupation('');
      setDescription('');
      setTrigger('');
      setConditions('');
      setTools('');
      setDocumentation('');
      setInputs('');
      setOutputs('');
      setPerformance('');
      setCommonErrors('');
      setSafetyErrors('');
      setSuccessIndicators('');
      setIndependence('');
      setFrequency('');
      setNotes('');
      setLinkSubIds([]);

      // Select new profile
      handleSelectProfile(newProfile);
    } catch (e) {
      alert('Error creating task profile');
    }
  };

  const handleToggleSubLink = (subId: string) => {
    if (linkSubIds.includes(subId)) {
      setLinkSubIds(linkSubIds.filter(id => id !== subId));
    } else {
      setLinkSubIds([...linkSubIds, subId]);
    }
  };

  if (loading) {
    return <p>Loading task profiles...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Occupational Task Profiles</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Human-authored definitions of standard workplace operations built upon real industry evidence.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
          {showCreate ? 'View Profiles' : '+ Create Task Profile'}
        </button>
      </header>

      {showCreate ? (
        /* Create Task Profile Form */
        <form onSubmit={handleCreateProfile} className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Author New Task Profile</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="title-input">Task Profile Title *</label>
              <input id="title-input" type="text" className="input" placeholder="e.g. Diagnose Loader Flow Loss" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="occupation-input">Target Occupation / Role *</label>
              <input id="occupation-input" type="text" className="input" placeholder="e.g. Heavy Equipment Technician" value={occupation} onChange={(e) => setOccupation(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="desc-input">Task Description *</label>
            <textarea id="desc-input" className="textarea" placeholder="Detailed outline of the task scope..." value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Structured Field Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="trigger-input">Job Trigger (What initiates the task?)</label>
              <textarea id="trigger-input" className="textarea" placeholder="e.g. Work order complaints or warning lamp status..." value={trigger} onChange={(e) => setTrigger(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="conditions-input">Typical Environmental Conditions</label>
              <textarea id="conditions-input" className="textarea" placeholder="e.g. Outdoor field service, shop temperature, active site noise..." value={conditions} onChange={(e) => setConditions(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="tools-input">Available Tools & Equipment</label>
              <textarea id="tools-input" className="textarea" placeholder="e.g. flow tester gauges, standard metric tools..." value={tools} onChange={(e) => setTools(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="docs-input">Available Documentation</label>
              <textarea id="docs-input" className="textarea" placeholder="e.g. manufacturer hydraulic circuit diagrams..." value={documentation} onChange={(e) => setDocumentation(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="inputs-input">Worker Inputs (Parts, data, symptoms)</label>
              <textarea id="inputs-input" className="textarea" value={inputs} onChange={(e) => setInputs(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="outputs-input">Expected Outputs (Documentation, repairs)</label>
              <textarea id="outputs-input" className="textarea" value={outputs} onChange={(e) => setOutputs(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="errors-input">Common Worker Errors</label>
              <textarea id="errors-input" className="textarea" value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="safety-input">Critical Safety Errors</label>
              <textarea id="safety-input" className="textarea" value={safetyErrors} onChange={(e) => setSafetyErrors(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="label" htmlFor="ind-input">Expected Level of Independence</label>
              <input id="ind-input" type="text" className="input" placeholder="e.g. Under limited supervision" value={independence} onChange={(e) => setIndependence(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="freq-input">Frequency of Occurrence</label>
              <input id="freq-input" type="text" className="input" placeholder="e.g. Weekly" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
            </div>
          </div>

          {/* Linking Evidence Submissions */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Link Supporting Evidence Records</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Select one or more accepted evidence submissions that support this profile definition.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              {submissions.map(sub => {
                const isLinked = linkSubIds.includes(sub.id);
                return (
                  <label key={sub.id} className="checkbox-label" style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <input
                      type="checkbox"
                      className="checkbox-input"
                      checked={isLinked}
                      onChange={() => handleToggleSubLink(sub.id)}
                    />
                    <div>
                      <strong style={{ fontSize: '0.85rem', display: 'block' }}>{sub.reference_id}</strong>
                      <span style={{ fontSize: '0.75rem', display: 'block' }}>{sub.title}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-accent">Save Task Profile</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        /* Profiles split view */
        <div style={{ display: 'grid', gridTemplateColumns: selectedProfile ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Profiles list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {profiles.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No task profiles created yet.</p>
            ) : (
              profiles.map(p => {
                const isSelected = selectedProfile?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className="card"
                    onClick={() => handleSelectProfile(p)}
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-surface)'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{p.occupation}</span>
                    <h3 style={{ fontSize: '1rem', margin: '0.25rem 0 0 0' }}>{p.title}</h3>
                  </div>
                );
              })
            )}
          </div>

          {/* Profile detailed display */}
          {selectedProfile && (
            <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{selectedProfile.occupation} Task Profile</span>
                  <h2 style={{ fontSize: '1.5rem', margin: '0.25rem 0 0 0' }}>{selectedProfile.title}</h2>
                </div>
                <button onClick={() => setSelectedProfile(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                  ✕ Close Profile
                </button>
              </div>

              {/* Grid of structured parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Task Description</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.task_description}</p>
                </div>
                {selectedProfile.job_trigger && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Trigger Event</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.job_trigger}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
                {selectedProfile.typical_conditions && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Working Conditions</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.typical_conditions}</p>
                  </div>
                )}
                {selectedProfile.available_tools && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Tools / Equipment Used</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.available_tools}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
                {selectedProfile.available_documentation && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Required Documentation</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.available_documentation}</p>
                  </div>
                )}
                {selectedProfile.expected_independence && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Expected Independence Level</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.expected_independence}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
                {selectedProfile.common_errors && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--status-review)' }}>Common Mistakes</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.common_errors}</p>
                  </div>
                )}
                {selectedProfile.critical_safety_errors && (
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--status-danger)' }}>Critical Safety Hazards</strong>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProfile.critical_safety_errors}</p>
                  </div>
                )}
              </div>

              {/* Supporting evidence provenance record list */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Evidence Provenance Trail</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  This task profile was human-distilled directly from the following original workplace evidence:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {supportingSubmissions.map(sub => (
                    <div
                      key={sub.id}
                      style={{
                        background: 'var(--bg-base)',
                        padding: '0.75rem 1rem',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}>{sub.reference_id}</strong>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{sub.title}</span>
                      </div>
                      <Link href={`/inbox`} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        👁 View Evidence
                      </Link>
                    </div>
                  ))}
                  {supportingSubmissions.length === 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No supporting evidence records linked to this profile.</span>
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
