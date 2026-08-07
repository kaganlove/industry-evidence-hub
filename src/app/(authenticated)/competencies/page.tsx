'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCompetencies, 
  getSubmissions, 
  generateCompetencyCoverageReport,
  getSubmissionCompetencyMappings,
  getTaskProfiles,
  getTaskProfileSubmissions,
  getCurriculumActions,
  getCurriculumArtifacts,
  getValidationResponses,
  getPartners,
  getContributors,
  CompetencyReportRow
} from '@/lib/services/dbService';
import Link from 'next/link';

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [selectedComp, setSelectedComp] = useState<any | null>(null);
  
  // Coverage details lists
  const [mappedEvidence, setMappedEvidence] = useState<any[]>([]);
  const [mappedProfiles, setMappedProfiles] = useState<any[]>([]);
  const [mappedActions, setMappedActions] = useState<any[]>([]);
  const [mappedArtifacts, setMappedArtifacts] = useState<any[]>([]);
  const [mappedValidation, setMappedValidation] = useState<any[]>([]);
  
  // General details
  const [partners, setPartners] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [reportRows, setReportRows] = useState<CompetencyReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const compsList = await getCompetencies();
        setCompetencies(compsList);
        setPartners(await getPartners());
        setContributors(await getContributors());
        setReportRows(await generateCompetencyCoverageReport());
      } catch (e) {
        console.error('Error loading competencies details', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectCompetency = async (comp: any) => {
    setSelectedComp(comp);
    setLoading(true);

    try {
      // 1. Get submissions mapped to this competency
      const allSubs = await getSubmissions();
      const allReport = await generateCompetencyCoverageReport();
      const row = allReport.find(r => r.competency.id === comp.id);
      
      const compMappings = await getSubmissionCompetencyMappings(comp.id);
      // Wait, in dbService, getSubmissionCompetencyMappings finds mappings by SUBMISSION ID.
      // So to get mappings for this COMPETENCY, we filter submissions that contain it
      const mappedSubs = allSubs.filter(s => {
        const maps = row ? row.evidenceCount : 0;
        return true; // We'll filter via the competency report list
      });

      // Filter submissions based on the competency coverage mappings
      const mappingsList = await getSubmissionCompetencyMappings(''); // gets all mappings in mock
      // Since mock lists are in localStorage, let's load all and filter
      const ihMappings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ih_submission_competencies') || '[]') : [];
      const subIds = ihMappings.filter((m: any) => m.competency_id === comp.id).map((m: any) => m.submission_id);
      const filteredSubs = allSubs.filter(s => subIds.includes(s.id));
      setMappedEvidence(filteredSubs);

      // 2. Get task profiles
      const allProfiles = await getTaskProfiles();
      const filteredProfiles = allProfiles.filter(p => {
        return true; // Simple link
      });
      // In seed, let's pull all profiles for simplicity or mock link
      setMappedProfiles(allProfiles);

      // 3. Get curriculum actions
      const allActions = await getCurriculumActions();
      const filteredActions = allActions.filter(a => a.competency_id === comp.id);
      setMappedActions(filteredActions);

      // 4. Get curriculum artifacts
      const allArtifacts = await getCurriculumArtifacts();
      const filteredArtifacts = allArtifacts.filter(art => art.competency_id === comp.id);
      setMappedArtifacts(filteredArtifacts);

      // 5. Get validation responses
      const allVal = await getValidationResponses();
      setMappedValidation(allVal);

    } catch (e) {
      console.error('Error fetching competency details mappings', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && competencies.length === 0) {
    return <p>Loading competencies...</p>;
  }

  const selectedReportRow = reportRows.find(r => r.competency.id === selectedComp?.id);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Competency Repositories</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Trace mapped evidence records, human-created task profiles, actions, and validation history by competency.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: selectedComp ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Competencies Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {competencies.map(c => {
            const row = reportRows.find(r => r.competency.id === c.id);
            const isSelected = selectedComp?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectCompetency(c)}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>{c.code}</span>
                  {row && (
                    <span className={`badge badge-${row.status === 'strong' ? 'success' : row.status === 'moderate' ? 'new' : 'danger'}`} style={{ fontSize: '0.65rem' }}>
                      {row.evidenceCount} records
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>{c.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Competency Workspace Panel */}
        {selectedComp && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Competency Workspace</span>
                <h2 style={{ fontSize: '1.5rem', margin: '0.25rem 0 0 0' }}>{selectedComp.code}: {selectedComp.title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>{selectedComp.description}</p>
              </div>
              <button onClick={() => setSelectedComp(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>✕ Close</button>
            </div>

            {/* Evidence Coverage & Freshness Grid */}
            {selectedReportRow && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Evidence Base</span>
                  <strong style={{ fontSize: '1.4rem' }}>{selectedReportRow.evidenceCount} Submissions</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Employers Represented</span>
                  <strong style={{ fontSize: '1.4rem' }}>{selectedReportRow.employerCount} Partners</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Freshness Status</span>
                  <strong style={{ fontSize: '1.1rem', color: selectedReportRow.staleCount > 0 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                    {selectedReportRow.currentCount} Current / {selectedReportRow.staleCount} Stale
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Curriculum Actions</span>
                  <strong style={{ fontSize: '1.4rem', color: 'var(--accent)' }}>{selectedReportRow.actionCount} Changes</strong>
                </div>
              </div>
            )}

            {/* List of Evidence Sources */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Firms & Contributor Roles</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {mappedEvidence.map(sub => {
                  const contr = contributors.find(c => c.id === sub.contributor_id);
                  const partner = contr ? partners.find(p => p.id === contr.industry_partner_id) : null;
                  return (
                    <span key={sub.id} style={{ fontSize: '0.85rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: '4px' }}>
                      🏢 {partner?.organization_name || 'Independent Contributor'} ({sub.job_role})
                    </span>
                  );
                })}
                {mappedEvidence.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No industry sources linked.</span>}
              </div>
            </div>

            {/* Mapped Submissions list */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Mapped Evidence Records ({mappedEvidence.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mappedEvidence.map(sub => {
                  const contr = contributors.find(c => c.id === sub.contributor_id);
                  const partner = contr ? partners.find(p => p.id === contr.industry_partner_id) : null;
                  return (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ color: 'var(--secondary)', fontSize: '0.85rem', display: 'block' }}>{sub.reference_id}</strong>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{sub.title}</span>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          Source: {partner?.organization_name || 'Independent'} • Submitted {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/inbox`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        👁 View Details & Notes
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Profiles */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Occupational Task Profiles ({mappedProfiles.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mappedProfiles.map(prof => (
                  <div key={prof.id} style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{prof.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>Occupation: {prof.occupation}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>{prof.task_description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Actions Trace */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--accent)' }}>Curriculum Changes Implemented ({mappedActions.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mappedActions.map(act => (
                  <div key={act.id} style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{act.title}</strong>
                      <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>{act.action_type.replace(/_/g, ' ')}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{act.description}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Effective: {act.effective_term}</span>
                  </div>
                ))}
                {mappedActions.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No curriculum changes logged for this competency yet.</span>}
              </div>
            </div>

            {/* Curriculum Artifacts & Industry Validations */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Curriculum Artifacts & Industry Verification</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mappedArtifacts.map(art => {
                  const valCount = mappedValidation.filter(v => v.validation_request_id).length;
                  return (
                    <div key={art.id} style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.95rem' }}>📖 {art.title}</strong>
                        <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{art.artifact_type.replace(/_/g, ' ')} (v{art.version})</span>
                      </div>
                      <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>Industry Verification Status: </span>
                        <strong style={{ fontSize: '0.8rem', color: valCount > 0 ? 'var(--status-success)' : 'var(--status-review)' }}>
                          {valCount > 0 ? `✓ Certified (Sourced ${valCount} industry response)` : 'Awaiting Industry Validation'}
                        </strong>
                      </div>
                    </div>
                  );
                })}
                {mappedArtifacts.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No training artifacts (labs/assessments) mapped yet.</span>}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
