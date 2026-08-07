'use client';

import React, { useState } from 'react';
import { createSubmission } from '@/lib/services/dbService';

export default function FailureEvidencePage() {
  const [whatHappened, setWhatHappened] = useState('');
  const [whyIncorrect, setWhyIncorrect] = useState('');
  const [expectedApproach, setExpectedApproach] = useState('');
  const [consequence, setConsequence] = useState('');
  const [entryLevel, setEntryLevel] = useState('yes_limited_supervision');
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [mockFileName, setMockFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddMockFile = () => {
    if (!mockFileName) return;
    setFiles([...files, { name: mockFileName, size: 4096000, type: 'image/jpeg' }]);
    setMockFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatHappened || !whyIncorrect || !expectedApproach) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await createSubmission({
        organization_id: 'org-demo-dtc',
        title: `Failure Evidence: Common Misdiagnosis / Incorrect Repair`,
        evidence_type: 'error_record',
        job_role: 'Apprentice / Technician',
        task_description: `What happened (Incorrect repair): ${whatHappened}\n\nWhy it was incorrect: ${whyIncorrect}\n\nExpected correct approach: ${expectedApproach}`,
        frequency: 'monthly',
        entry_level_expectation: entryLevel,
        common_mistakes: whatHappened,
        success_description: expectedApproach,
        unsafe_unacceptable: consequence,
        permission_internal_review: true,
        permission_curriculum_adaptation: true,
        permission_classroom_distribution: true,
        permission_public_distribution: false,
        contributor: {
          job_title: 'Shop Technician',
          partner_name: partnerName,
          email,
          allow_follow_up: true,
        },
        fileAttachments: files,
      });

      setSubmittedId(result.reference_id);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '1.5rem' }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Thank You for the Report!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your submission has been captured. This helps us design realistic labs where students must identify pre-existing failures or incorrect repairs before starting work.
          </p>
          <div style={{
            background: 'var(--bg-base)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-color)',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Reference Number</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{submittedId}</strong>
          </div>
          <button onClick={() => {
            setSubmittedId(null);
            setWhatHappened('');
            setWhyIncorrect('');
            setExpectedApproach('');
            setConsequence('');
          }} className="btn btn-primary">
            Submit Another Case
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '3rem auto', padding: '1.5rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Submit Failure or Unacceptable Work Evidence</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Show us an example of something inexperienced workers commonly get wrong, such as an incorrect repair, safety breach, or common misdiagnosis.
        </p>
      </header>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="label" htmlFor="wrong-repair-input">What happened? (Describe the incorrect repair or procedure) *</label>
          <textarea
            id="wrong-repair-input"
            className="textarea"
            placeholder="Describe the incorrect action performed, parts swapped unnecessarily, or safety steps bypassed..."
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="why-incorrect-input">Why was it incorrect or unacceptable? *</label>
          <textarea
            id="why-incorrect-input"
            className="textarea"
            placeholder="Explain what the negative technical impact was..."
            value={whyIncorrect}
            onChange={(e) => setWhyIncorrect(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="correct-approach-input">What was the expected, correct approach? *</label>
          <textarea
            id="correct-approach-input"
            className="textarea"
            placeholder="Explain the correct diagnosis flow or repair method..."
            value={expectedApproach}
            onChange={(e) => setExpectedApproach(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="consequence-input">What was the consequence of this mistake?</label>
          <textarea
            id="consequence-input"
            className="textarea"
            placeholder="e.g. Blown hydraulic housing, safety hazard, engine cylinder head crack, expensive component replacement..."
            value={consequence}
            onChange={(e) => setConsequence(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="entry-select">Relevance to an entry-level worker</label>
          <select id="entry-select" className="select" value={entryLevel} onChange={(e) => setEntryLevel(e.target.value)}>
            <option value="yes_independently">Expected of entry-level workers to get right independently</option>
            <option value="yes_limited_supervision">Expected with limited supervision</option>
            <option value="usually_additional_experience">Usually expected after additional experience</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="partner-name-input">Your Organization Name (Optional)</label>
          <input id="partner-name-input" type="text" className="input" placeholder="e.g. Apex Hydraulics" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="email-input">Your Contact Email (Optional)</label>
          <input id="email-input" type="email" className="input" placeholder="tech@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Optional file */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="label" htmlFor="photo-input">Attach Photo of damaged component or incorrect assembly (Optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input id="photo-input" type="text" className="input" placeholder="e.g. gear_cavitation.jpg" value={mockFileName} onChange={(e) => setMockFileName(e.target.value)} />
            <button type="button" onClick={handleAddMockFile} className="btn btn-secondary">Attach</button>
          </div>
          {files.map((f, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>📎 {f.name}</div>)}
        </div>

        <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
          {submitting ? 'Submitting...' : 'Submit Failure Case'}
        </button>
      </form>
    </div>
  );
}
