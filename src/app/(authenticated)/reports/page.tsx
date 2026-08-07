'use client';

import React, { useState, useEffect } from 'react';
import { 
  generateCompetencyCoverageReport, 
  getFreshnessStats, 
  getEmployerDiversityStats, 
  getEvidenceGapReport,
  getCompetencies,
  getSubmissions,
  getCurriculumActions,
  getTaskProfiles,
  getPartners,
  getContributors,
  CompetencyReportRow
} from '@/lib/services/dbService';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('matrix'); // matrix, freshness, diversity, gaps, packet
  const [coverageData, setCoverageData] = useState<CompetencyReportRow[]>([]);
  const [freshness, setFreshness] = useState<any>(null);
  const [diversity, setDiversity] = useState<any[]>([]);
  const [gaps, setGaps] = useState<CompetencyReportRow[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  
  // Packet assembler state
  const [selectedCompId, setSelectedCompId] = useState('');
  const [assembledPacket, setAssembledPacket] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cov = await generateCompetencyCoverageReport();
        setCoverageData(cov);
        setFreshness(await getFreshnessStats());
        setDiversity(await getEmployerDiversityStats());
        setGaps(await getEvidenceGapReport());
        setCompetencies(await getCompetencies());
      } catch (e) {
        console.error('Error loading reports', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAssemblePacket = async () => {
    if (!selectedCompId) return;
    
    setLoading(true);
    try {
      const comp = competencies.find(c => c.id === selectedCompId);
      const subs = await getSubmissions();
      const actions = await getCurriculumActions();
      const profiles = await getTaskProfiles();
      const contrs = await getContributors();
      const parts = await getPartners();
      
      // Load mappings from localStorage
      const ihMappings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ih_submission_competencies') || '[]') : [];
      const subIds = ihMappings.filter((m: any) => m.competency_id === selectedCompId).map((m: any) => m.submission_id);
      
      const compSubs = subs.filter(s => subIds.includes(s.id) && (s.status === 'accepted' || s.status === 'accepted_with_restrictions'));
      const compActions = actions.filter(a => a.competency_id === selectedCompId);
      const compProfiles = profiles.filter(p => {
        return true; // Mock link
      });

      // Aggregate lists
      const uniquePartners = Array.from(new Set(compSubs.map(s => {
        const c = contrs.find(x => x.id === s.contributor_id);
        const p = c ? parts.find(x => x.id === c.industry_partner_id) : null;
        return p ? p.organization_name : null;
      }).filter(Boolean)));

      const uniqueRoles = Array.from(new Set(compSubs.map(s => s.job_role)));
      
      // Collect common mistakes and tools directly without AI translation
      const tools = Array.from(new Set(compSubs.map(s => s.tools_resources).filter(Boolean)));
      const mistakes = compSubs.map(s => ({
        ref: s.reference_id,
        mistake: s.common_mistakes,
        unsafe: s.unsafe_unacceptable
      })).filter(item => item.mistake || item.unsafe);

      setAssembledPacket({
        competency: comp,
        evidenceCount: compSubs.length,
        partners: uniquePartners,
        roles: uniqueRoles,
        submissions: compSubs,
        actions: compActions,
        profiles: compProfiles,
        tools,
        mistakes
      });
    } catch (e) {
      console.error('Error assembling packet', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && coverageData.length === 0) {
    return <p>Loading analytics reports...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Curriculum Audit Reports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review coverage matrices, freshness stats, diversity indicators, and assemble printable evidence packets.</p>
      </header>

      {/* Selector Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'matrix', label: '📋 Coverage Matrix' },
          { id: 'freshness', label: '⏳ Evidence Freshness' },
          { id: 'diversity', label: '📊 Employer Diversity' },
          { id: 'gaps', label: '⚠️ Evidence Gaps' },
          { id: 'packet', label: '📦 Evidence Packet Assembler' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className="btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              backgroundColor: activeReport === tab.id ? 'var(--primary)' : 'var(--bg-surface)',
              color: activeReport === tab.id ? 'white' : 'var(--text-secondary)',
              border: activeReport === tab.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Display Section */}
      <div className="card">
        
        {/* REPORT 1: COVERAGE MATRIX */}
        {activeReport === 'matrix' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Competency Evidence Coverage Matrix</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Summary of documented repository evidence. Status indicators denote general coverage density, not objective course quality.
            </p>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Competency</th>
                    <th style={{ textAlign: 'center' }}>Evidence Records</th>
                    <th style={{ textAlign: 'center' }}>Employers Represented</th>
                    <th style={{ textAlign: 'center' }}>Current Evidence</th>
                    <th style={{ textAlign: 'center' }}>Stale Evidence</th>
                    <th style={{ textAlign: 'center' }}>Curriculum Actions</th>
                    <th>Status Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {coverageData.map((row) => (
                    <tr key={row.competency.id}>
                      <td style={{ fontWeight: 600 }}>{row.competency.code}: {row.competency.title}</td>
                      <td style={{ textAlign: 'center' }}>{row.evidenceCount}</td>
                      <td style={{ textAlign: 'center' }}>{row.employerCount}</td>
                      <td style={{ textAlign: 'center', color: 'var(--status-success)' }}>{row.currentCount}</td>
                      <td style={{ textAlign: 'center', color: 'var(--status-danger)' }}>{row.staleCount}</td>
                      <td style={{ textAlign: 'center' }}>{row.actionCount}</td>
                      <td>
                        <span className={`badge badge-${row.status === 'strong' ? 'success' : row.status === 'moderate' ? 'new' : 'danger'}`}>
                          {row.status === 'strong' ? 'Strong base' : row.status === 'moderate' ? 'Moderate base' : row.status === 'none' ? 'No evidence base' : 'Additional evidence recommended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: EVIDENCE FRESHNESS */}
        {activeReport === 'freshness' && freshness && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Evidence Freshness Distribution</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Breakdown of active evidence based on date rules.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div className="card" style={{ background: 'var(--bg-base)' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>Current</span>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{freshness.current}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&lt; 24 months old</span>
              </div>
              <div className="card" style={{ background: 'var(--bg-base)' }}>
                <span className="badge badge-review" style={{ marginBottom: '0.5rem' }}>Warning</span>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{freshness.warning}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>24 - 48 months old</span>
              </div>
              <div className="card" style={{ background: 'var(--bg-base)' }}>
                <span className="badge badge-danger" style={{ marginBottom: '0.5rem' }}>Stale</span>
                <h3 style={{ fontSize: '2.5rem', margin: 0 }}>{freshness.stale}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&gt; 48 months old</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 3: EMPLOYER DIVERSITY */}
        {activeReport === 'diversity' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Employer Contribution Diversity</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Ensures that training programs are aligned with a broad sector profile rather than relying on submissions from a single firm.
            </p>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Industry Partner / Organization</th>
                    <th>Accepted Evidence Contributed</th>
                  </tr>
                </thead>
                <tbody>
                  {diversity.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>🏢 {row.name}</td>
                      <td><strong>{row.count} records</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 4: EVIDENCE GAPS */}
        {activeReport === 'gaps' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Identified Curriculum Evidence Gaps</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Competencies currently lacking recent, verified industry context. Sourcing requests should be launched for these targets.
            </p>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Competency Code</th>
                    <th>Title</th>
                    <th>Evidence Count</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((row) => (
                    <tr key={row.competency.id}>
                      <td style={{ fontWeight: 600, color: 'var(--status-danger)' }}>{row.competency.code}</td>
                      <td>{row.competency.title}</td>
                      <td>{row.evidenceCount} records</td>
                      <td>
                        <span className="badge badge-danger">Additional evidence recommended</span>
                      </td>
                    </tr>
                  ))}
                  {gaps.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>All competencies meet minimum evidence coverage thresholds!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 5: EVIDENCE PACKET ASSEMBLER */}
        {activeReport === 'packet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Evidence Packet Assembler</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Select a target competency to compile all supporting evidence reports, situations, errors, tools, and actions into a print-friendly packet.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                id="packet-comp-select"
                className="select"
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
              >
                <option value="">Select competency...</option>
                {competencies.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                ))}
              </select>
              <button
                onClick={handleAssemblePacket}
                className="btn btn-accent"
                style={{ whiteSpace: 'nowrap' }}
                disabled={!selectedCompId}
              >
                Assemble Packet
              </button>
            </div>

            {/* Assembled Packet Output */}
            {assembledPacket && (
              <div 
                id="printable-evidence-packet"
                className="animate-fade-in"
                style={{
                  background: 'var(--bg-base)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginTop: '1rem',
                  color: 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Curriculum Audit packet</span>
                    <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{assembledPacket.competency.code} Evidence Summary</h2>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Title: {assembledPacket.competency.title}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    🖨 Print / Save PDF
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Sourcing Stats</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <li>Accepted Evidence Count: <strong>{assembledPacket.evidenceCount} records</strong></li>
                      <li>Employers Represented: <strong>{assembledPacket.partners.join(', ') || 'None'}</strong></li>
                      <li>Job Roles Sourced: <strong>{assembledPacket.roles.join(', ') || 'None'}</strong></li>
                    </ul>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Workplace Tools</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {assembledPacket.tools.map((t: string, i: number) => (
                        <span key={i} style={{ background: 'var(--bg-surface-elevated)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>🛠 {t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Common errors list */}
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>Common Mistakes & Unacceptable Work</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assembledPacket.mistakes.map((m: any, idx: number) => (
                      <div key={idx} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--status-danger)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source Code: {m.ref}</span>
                        {m.mistake && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Struggle:</strong> {m.mistake}</p>}
                        {m.unsafe && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Unacceptable Limit:</strong> {m.unsafe}</p>}
                      </div>
                    ))}
                    {assembledPacket.mistakes.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No common errors recorded in evidence base.</span>}
                  </div>
                </div>

                {/* Actions history */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>Curriculum Actions Influenced</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assembledPacket.actions.map((act: any) => (
                      <div key={act.id} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '4px' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{act.title}</strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{act.description}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rationale: "{act.rationale}" • Effective {act.effective_term}</span>
                      </div>
                    ))}
                    {assembledPacket.actions.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No curriculum actions recorded for this competency.</span>}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
