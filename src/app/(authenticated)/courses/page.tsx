'use client';

import React, { useState, useEffect } from 'react';
import { getCourses, getCompetencies, getSubmissions, getPrograms } from '@/lib/services/dbService';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setCourses(await getCourses());
        setPrograms(await getPrograms());
        setCompetencies(await getCompetencies());
        setSubmissions(await getSubmissions());
      } catch (e) {
        console.error('Error loading courses data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <p>Loading courses...</p>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Courses</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage course catalogs and track competencies mapped to each catalog course.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCourse ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Courses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(c => {
            const prog = programs.find(p => p.id === c.program_id);
            return (
              <div
                key={c.id}
                className="card"
                onClick={() => setSelectedCourse(c)}
                style={{
                  cursor: 'pointer',
                  borderColor: selectedCourse?.id === c.id ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: selectedCourse?.id === c.id ? 'var(--primary-glow)' : 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{c.code}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prog?.code}</span>
                </div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{c.name}</h3>
              </div>
            );
          })}
        </div>

        {/* Selected Course Detail */}
        {selectedCourse && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Course Workspace</span>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedCourse.code}: {selectedCourse.name}</h2>
              </div>
              <button onClick={() => setSelectedCourse(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>✕ Close</button>
            </div>

            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Course Catalog Description</strong>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{selectedCourse.description}</p>
            </div>

            <div>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.75rem' }}>Associated Competencies</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {competencies.map(comp => (
                  <div key={comp.id} style={{ background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{comp.code} - {comp.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>{comp.description}</p>
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
