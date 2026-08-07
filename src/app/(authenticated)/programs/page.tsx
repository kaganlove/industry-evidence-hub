'use client';

import React, { useState, useEffect } from 'react';
import { getPrograms, getCourses, getSubmissions } from '@/lib/services/dbService';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedProg, setSelectedProg] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setPrograms(await getPrograms());
        setCourses(await getCourses());
        setSubmissions(await getSubmissions());
      } catch (e) {
        console.error('Error loading programs workspace', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <p>Loading programs...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Programs</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track academic training programs and their integration with industry source evidence.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: selectedProg ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Programs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {programs.map(p => (
            <div
              key={p.id}
              className="card"
              onClick={() => setSelectedProg(p)}
              style={{
                cursor: 'pointer',
                borderColor: selectedProg?.id === p.id ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: selectedProg?.id === p.id ? 'var(--primary-glow)' : 'var(--bg-surface)'
              }}
            >
              <span className="badge badge-success" style={{ fontSize: '0.65rem', marginBottom: '0.5rem' }}>{p.code}</span>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{p.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>Dept: {p.department}</span>
            </div>
          ))}
        </div>

        {/* Selected Program Details */}
        {selectedProg && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Program Workspace</span>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedProg.code} - {selectedProg.name}</h2>
              </div>
              <button onClick={() => setSelectedProg(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>✕ Close</button>
            </div>

            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Program Description</strong>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedProg.description}</p>
            </div>

            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>Associated Courses</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {courses.filter(c => c.program_id === selectedProg.id).map(course => {
                  return (
                    <div key={course.id} style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{course.code}: {course.name}</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>{course.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Program Evidence Rolled Up</strong>
              <div style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Total accepted evidence files mapped to this program: <strong>{submissions.filter(s => s.status === 'accepted').length} records</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
