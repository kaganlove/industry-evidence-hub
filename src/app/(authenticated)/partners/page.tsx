'use client';

import React, { useState, useEffect } from 'react';
import { getPartners, getContributors, getSubmissions } from '@/lib/services/dbService';

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setPartners(await getPartners());
        setContributors(await getContributors());
        setSubmissions(await getSubmissions());
      } catch (e) {
        console.error('Error loading partners', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <p>Loading industry partners...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Industry Partners</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track employer organizations, individual technical contributors, and their submitted feedback logs.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPartner ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Partners List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {partners.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPartner(p)}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: selectedPartner?.id === p.id ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: selectedPartner?.id === p.id ? 'var(--primary-glow)' : 'var(--bg-surface)'
              }}
            >
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>🏢 {p.organization_name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>{p.city}, {p.state}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Sector: {p.industry_sector}</span>
            </div>
          ))}
        </div>

        {/* Selected Partner Workspace Detail */}
        {selectedPartner && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Partner Details</span>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🏢 {selectedPartner.organization_name}</h2>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>✕ Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Sector / Branch</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedPartner.industry_sector}</p>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Location</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedPartner.city}, {selectedPartner.state}, {selectedPartner.country}</p>
              </div>
            </div>

            {selectedPartner.notes && (
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Partnership Notes</strong>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{selectedPartner.notes}</p>
              </div>
            )}

            {/* List of individual contributors associated with this partner */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Registered Contributors</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {contributors.filter(c => c.industry_partner_id === selectedPartner.id).map(c => (
                  <div key={c.id} style={{ background: 'var(--bg-base)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '0.9rem' }}>👤 {c.first_name} {c.last_name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                      Job Title: {c.job_title} ({c.contributor_type}) • {c.years_in_industry} yrs experience
                    </span>
                  </div>
                ))}
                {contributors.filter(c => c.industry_partner_id === selectedPartner.id).length === 0 && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No direct contributors logged.</span>
                )}
              </div>
            </div>

            {/* Submissions by this partner */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Sourced Evidence ({
                submissions.filter(s => {
                  const contr = contributors.find(c => c.id === s.contributor_id);
                  return contr && contr.industry_partner_id === selectedPartner.id;
                }).length
              })</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {submissions.filter(s => {
                  const contr = contributors.find(c => c.id === s.contributor_id);
                  return contr && contr.industry_partner_id === selectedPartner.id;
                }).map(sub => (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-base)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.85rem' }}>{sub.reference_id} - {sub.title}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{sub.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
