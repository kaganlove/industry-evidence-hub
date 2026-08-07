'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCourses, 
  getCompetencies, 
  getSubmissions, 
  getPrograms, 
  getCurrentUser,
  createCourse,
  updateCourse,
  createCompetency,
  updateCompetency 
} from '@/lib/services/dbService';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [editorMode, setEditorMode] = useState<'view' | 'create-course' | 'edit-course' | 'create-comp' | 'edit-comp'>('view');
  const [selectedComp, setSelectedComp] = useState<any | null>(null);

  // Course form state
  const [courseForm, setCourseForm] = useState({
    program_id: '',
    code: '',
    name: '',
    description: '',
    active: true
  });

  // Competency form state
  const [compForm, setCompForm] = useState({
    code: '',
    title: '',
    description: '',
    sequence: 1,
    active: true
  });

  useEffect(() => {
    async function loadData() {
      try {
        setCourses(await getCourses());
        setPrograms(await getPrograms());
        setCompetencies(await getCompetencies());
        setSubmissions(await getSubmissions());
        setCurrentUser(await getCurrentUser());
      } catch (e) {
        console.error('Error loading courses data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Capabilities check
  const canManage = currentUser?.role === 'instructional_designer' || currentUser?.role === 'admin' || currentUser?.role === 'system_admin' || currentUser?.role === 'dean';

  const startCreateCourse = () => {
    setCourseForm({
      program_id: programs[0]?.id || '',
      code: '',
      name: '',
      description: '',
      active: true
    });
    setEditorMode('create-course');
    setSelectedCourse(null);
  };

  const startEditCourse = () => {
    if (!selectedCourse) return;
    setCourseForm({
      program_id: selectedCourse.program_id,
      code: selectedCourse.code,
      name: selectedCourse.name,
      description: selectedCourse.description,
      active: selectedCourse.active
    });
    setEditorMode('edit-course');
  };

  const startCreateComp = () => {
    if (!selectedCourse) return;
    setCompForm({
      code: '',
      title: '',
      description: '',
      sequence: (competencies.filter(c => c.course_id === selectedCourse?.id).length + 1),
      active: true
    });
    setEditorMode('create-comp');
  };

  const startEditComp = (comp: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComp(comp);
    setCompForm({
      code: comp.code,
      title: comp.title,
      description: comp.description,
      sequence: comp.sequence || 1,
      active: comp.active || true
    });
    setEditorMode('edit-comp');
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editorMode === 'create-course') {
        const created = await createCourse(courseForm);
        setCourses([...courses, created]);
        setSelectedCourse(created);
        setEditorMode('view');
      } else if (editorMode === 'edit-course' && selectedCourse) {
        const updated = await updateCourse(selectedCourse.id, courseForm);
        setCourses(courses.map(c => c.id === selectedCourse.id ? updated : c));
        setSelectedCourse(updated);
        setEditorMode('view');
      }
    } catch (err) {
      console.error('Error saving course', err);
    }
  };

  const handleSaveComp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      if (editorMode === 'create-comp') {
        const created = await createCompetency({
          ...compForm,
          course_id: selectedCourse.id
        });
        setCompetencies([...competencies, created]);
        setEditorMode('view');
      } else if (editorMode === 'edit-comp' && selectedComp) {
        const updated = await updateCompetency(selectedComp.id, compForm);
        setCompetencies(competencies.map(c => c.id === selectedComp.id ? updated : c));
        setEditorMode('view');
      }
    } catch (err) {
      console.error('Error saving competency', err);
    }
  };

  if (loading) {
    return <p style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading courses...</p>;
  }

  // Filter competencies to only those of the selected course
  const courseCompetencies = selectedCourse 
    ? competencies.filter(comp => comp.course_id === selectedCourse.id) 
    : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>Courses & Competencies</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage course catalogs and map industrial core competencies (CCs).</p>
        </div>
        {canManage && (
          <button onClick={startCreateCourse} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontWeight: 600 }}>
            + Create Course
          </button>
        )}
      </header>

      {/* Role Notice */}
      {canManage && (
        <div className="alert alert-info" style={{ margin: 0, padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
          ℹ️ <strong>Instructional Designer Mode:</strong> You have permission to create courses, add competencies, and update details.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedCourse || editorMode !== 'view' ? '320px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Courses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses.map(c => {
            const prog = programs.find(p => p.id === c.program_id);
            const ccCount = competencies.filter(comp => comp.course_id === c.id).length;
            return (
              <div
                key={c.id}
                className="card"
                onClick={() => {
                  setSelectedCourse(c);
                  setEditorMode('view');
                }}
                style={{
                  cursor: 'pointer',
                  borderColor: selectedCourse?.id === c.id ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: selectedCourse?.id === c.id ? 'var(--primary-glow)' : 'var(--bg-surface)',
                  padding: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{c.code}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prog?.code || 'Catalog'}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontWeight: 600 }}>{c.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>{ccCount} Competencies</span>
                  <span style={{ color: c.active ? 'var(--status-success)' : 'var(--text-muted)' }}>
                    ● {c.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Workspace (Forms or Detail View) */}
        {(selectedCourse || editorMode !== 'view') && (
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--bg-surface)' }}>
            
            {/* VIEW COURSE DETAILS */}
            {editorMode === 'view' && selectedCourse && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Profile</span>
                    <h2 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{selectedCourse.code}: {selectedCourse.name}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {canManage && (
                      <button onClick={startEditCourse} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                        ✏️ Edit Course
                      </button>
                    )}
                    <button onClick={() => setSelectedCourse(null)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Course Catalog Description</strong>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>{selectedCourse.description}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>Associated Core Competencies (CCs)</h3>
                    {canManage && (
                      <button onClick={startCreateComp} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        + Add Competency
                      </button>
                    )}
                  </div>

                  {courseCompetencies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-base)' }}>
                      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No competencies mapped to this course yet.</p>
                      {canManage && (
                        <button onClick={startCreateComp} className="btn btn-secondary" style={{ marginTop: '0.75rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Add First Competency
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {courseCompetencies.sort((a,b) => a.sequence - b.sequence).map(comp => (
                        <div 
                          key={comp.id} 
                          style={{ 
                            background: 'var(--bg-base)', 
                            padding: '1rem 1.25rem', 
                            borderRadius: 'var(--radius-md)', 
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span className="badge badge-new" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>Seq {comp.sequence}</span>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{comp.code}</strong>
                            </div>
                            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.25rem 0', fontWeight: 600 }}>{comp.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{comp.description}</p>
                          </div>
                          {canManage && (
                            <button 
                              onClick={(e) => startEditComp(comp, e)} 
                              className="btn btn-secondary" 
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                            >
                              ✏️ Edit
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* CREATE / EDIT COURSE FORM */}
            {(editorMode === 'create-course' || editorMode === 'edit-course') && (
              <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>
                    {editorMode === 'create-course' ? 'Create New Catalog Course' : 'Edit Course Details'}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Associated Program</label>
                  <select
                    value={courseForm.program_id}
                    onChange={e => setCourseForm({ ...courseForm, program_id: e.target.value })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)'
                    }}
                    required
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. DET 140"
                      value={courseForm.code}
                      onChange={e => setCourseForm({ ...courseForm, code: e.target.value })}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--text-primary)'
                      }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Course Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Diesel Engine Systems II"
                      value={courseForm.name}
                      onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--text-primary)'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Course Catalog Description</label>
                  <textarea
                    placeholder="Enter official course guidelines, topics covered, and prerequisite statements..."
                    rows={4}
                    value={courseForm.description}
                    onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="courseActive"
                    checked={courseForm.active}
                    onChange={e => setCourseForm({ ...courseForm, active: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="courseActive" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Course Active & Enabled in Curriculum Planner
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEditorMode('view');
                      if (editorMode === 'create-course') setSelectedCourse(null);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Save Course
                  </button>
                </div>
              </form>
            )}

            {/* CREATE / EDIT COMPETENCY FORM */}
            {(editorMode === 'create-comp' || editorMode === 'edit-comp') && (
              <form onSubmit={handleSaveComp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>
                    {editorMode === 'create-comp' ? `Add Competency to ${selectedCourse.code}` : `Edit Competency ${selectedComp?.code}`}
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Competency Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CC4.3"
                      value={compForm.code}
                      onChange={e => setCompForm({ ...compForm, code: e.target.value })}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--text-primary)'
                      }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sequence Order</label>
                    <input
                      type="number"
                      min={1}
                      value={compForm.sequence}
                      onChange={e => setCompForm({ ...compForm, sequence: parseInt(e.target.value) || 1 })}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--text-primary)'
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Competency Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Perform high pressure fuel rail safety diagnostic checks"
                    value={compForm.title}
                    onChange={e => setCompForm({ ...compForm, title: e.target.value })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Detailed Learning Statement / Description</label>
                  <textarea
                    placeholder="Detail specific performance criteria, required industry standards, and evaluation criteria..."
                    rows={4}
                    value={compForm.description}
                    onChange={e => setCompForm({ ...compForm, description: e.target.value })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditorMode('view')}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Save Competency
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
