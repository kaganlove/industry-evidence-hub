'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getSubmissions, 
  getEvidenceRequests, 
  getCurriculumActions, 
  getFreshnessStats, 
  getPrograms, 
  getPartners, 
  getAuditLogs,
  generateCompetencyCoverageReport,
  getCurrentUser,
  User,
  AuditLog
} from '@/lib/services/dbService';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [freshness, setFreshness] = useState({ current: 0, warning: 0, stale: 0, total: 0 });
  const [programs, setPrograms] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [coverageData, setCoverageData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);

        const subList = await getSubmissions();
        setSubmissions(subList);

        const reqList = await getEvidenceRequests();
        setRequests(reqList.filter(r => r.status === 'open'));

        const actionList = await getCurriculumActions();
        setActions(actionList);

        const freshStats = await getFreshnessStats();
        setFreshness(freshStats);

        const progList = await getPrograms();
        setPrograms(progList);

        const partList = await getPartners();
        setPartners(partList);

        const logs = await getAuditLogs();
        setAuditLogs(logs.slice(0, 5));

        const cov = await generateCompetencyCoverageReport();
        setCoverageData(cov);
      } catch (e) {
        console.error('Error loading dashboard statistics', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <p>Loading dashboard data...</p>;
  }

  // Count subsets
  const newSubCount = submissions.filter(s => s.status === 'new').length;
  const reviewSubCount = submissions.filter(s => ['in_review', 'needs_sme_review', 'needs_clarification'].includes(s.status)).length;
  const acceptedSubCount = submissions.filter(s => s.status === 'accepted' || s.status === 'accepted_with_restrictions').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
            Evidence Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
            Trace real workplace feedback directly to competencies and curriculum actions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/requests" className="btn btn-secondary">
            📢 Create Request
          </Link>
          <Link href="/inbox" className="btn btn-primary">
            📥 View Inbox
          </Link>
        </div>
      </header>

      {/* Metrics Cards Grid */}
      <section className="dashboard-grid">
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => router.push('/inbox?status=new')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>New Evidence</span>
            <span style={{ fontSize: '1.5rem' }}>📥</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--status-new)' }}>
            {newSubCount}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Submissions awaiting review</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => router.push('/inbox?status=review')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>In Review</span>
            <span style={{ fontSize: '1.5rem' }}>🔍</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--status-review)' }}>
            {reviewSubCount}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Needs ID or SME review</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Accepted Evidence</span>
            <span style={{ fontSize: '1.5rem' }}>✓</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--status-success)' }}>
            {acceptedSubCount}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Mapped to training programs</p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => router.push('/curriculum-actions')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Curriculum Actions</span>
            <span style={{ fontSize: '1.5rem' }}>🔄</span>
          </div>
          <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
            {actions.length}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Traceable adjustments log</p>
        </div>
      </section>

      {/* Main split sections */}
      <div className="split-layout">
        {/* Left Side: Program Coverage & Freshness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Freshness Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Evidence Freshness Status
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              We enforce freshness guidelines (Current: &lt;24 months, Warning: 24-48 months, Stale: &gt;48 months).
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', height: '24px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ flex: freshness.current || 1, backgroundColor: 'var(--status-success)', title: 'Current' }} />
              <div style={{ flex: freshness.warning || 0, backgroundColor: 'var(--status-review)', title: 'Review Recommended' }} />
              <div style={{ flex: freshness.stale || 0, backgroundColor: 'var(--status-danger)', title: 'Stale' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', gap: '1rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-success)' }}>{freshness.current}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-review)' }}>{freshness.warning}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Warning</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-danger)' }}>{freshness.stale}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stale</span>
              </div>
            </div>
          </div>

          {/* Program List */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Active Training Programs
            </h3>
            {programs.map(prog => {
              const activeRequests = requests.length;
              return (
                <div key={prog.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <div>
                    <Link href={`/programs`} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {prog.code} - {prog.name}
                    </Link>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prog.department}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      {coverageData.length} Competencies
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Industry Partners represented */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Industry Partners Network ({partners.length})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {partners.map(p => (
                <span
                  key={p.id}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  🏢 {p.organization_name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Competency Coverage Stats & Audit Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Competency Evidence Coverage Status */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Competency Mappings & Coverage Gaps
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {coverageData.map((row) => {
                const percentage = Math.min(100, (row.evidenceCount / 5) * 100);
                return (
                  <div key={row.competency.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <Link href="/competencies" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {row.competency.code}: {row.competency.title}
                      </Link>
                      <span style={{ fontWeight: 600, color: row.evidenceCount > 0 ? 'var(--secondary)' : 'var(--status-danger)' }}>
                        {row.evidenceCount} records ({row.employerCount} employers)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${percentage || 5}%`, 
                        backgroundColor: row.status === 'strong' ? 'var(--status-success)' : row.status === 'moderate' ? 'var(--status-new)' : 'var(--status-danger)',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Recent System Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.map((log) => (
                <div key={log.id} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                    <strong>{log.action.replace(/_/g, ' ').toUpperCase()}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Entity: {log.entity_type} ({log.entity_id.split('-')[0]}...)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
