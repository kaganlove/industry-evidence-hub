'use client';

import React, { useState } from 'react';
import { createSubmission } from '@/lib/services/dbService';

export default function NewHireDifficultyPage() {
  const [jobRole, setJobRole] = useState('');
  const [task, setTask] = useState('');
  const [struggledWith, setStruggledWith] = useState('');
  const [expectedAction, setExpectedAction] = useState('');
  const [consequences, setConsequences] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [entryLevel, setEntryLevel] = useState('yes_limited_supervision');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Contributor details
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
  const [allowFollowUp, setAllowFollowUp] = useState(false);

  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [mockFileName, setMockFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddMockFile = () => {
    if (!mockFileName) return;
    setFiles([...files, { name: mockFileName, size: 2048500, type: 'application/pdf' }]);
    setMockFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole || !task || !struggledWith || !expectedAction) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await createSubmission({
        organization_id: 'org-demo-dtc',
        title: `New-Hire Struggle: ${task} (${jobRole})`,
        evidence_type: 'error_record',
        job_role: jobRole,
        task_description: `Task/Skill: ${task}\n\nWhat they struggled with: ${struggledWith}\n\nWhat they should have done: ${expectedAction}`,
        frequency,
        entry_level_expectation: entryLevel,
        common_mistakes: struggledWith,
        success_description: expectedAction,
        unsafe_unacceptable: consequences,
        permission_internal_review: true,
        permission_curriculum_adaptation: true,
        permission_classroom_distribution: false,
        permission_public_distribution: false,
        contributor: {
          job_title: 'Supervisor',
          partner_name: partnerName,
          email,
          allow_follow_up: allowFollowUp,
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
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Thank You for the Feedback!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            We have captured this new-hire difficulty to improve our mastery assessment standards and hands-on diagnostic checks.
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
            setJobRole('');
            setTask('');
            setStruggledWith('');
            setExpectedAction('');
            setConsequences('');
          }} className="btn btn-primary">
            Submit Another Struggle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '3rem auto', padding: '1.5rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Report a New-Hire Challenge</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Think about a new employee you have worked with recently. What is something they struggled to do that you expected them to already know?
        </p>
      </header>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="label" htmlFor="role-input">Job Role of the Employee *</label>
          <input
            id="role-input"
            type="text"
            className="input"
            placeholder="e.g. Apprentice Diesel Mechanic"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="task-input">What was the task or skill they struggled with? *</label>
          <input
            id="task-input"
            type="text"
            className="input"
            placeholder="e.g. Adjusting relief valve pressure, reading multimeter fuses"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="struggle-input">What did the new employee actually struggle with? *</label>
          <textarea
            id="struggle-input"
            className="textarea"
            placeholder="Describe the struggle, mistakes, or misconceptions they displayed..."
            value={struggledWith}
            onChange={(e) => setStruggledWith(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="expected-input">What should the employee have done? *</label>
          <textarea
            id="expected-input"
            className="textarea"
            placeholder="Describe the correct procedure or critical thinking steps..."
            value={expectedAction}
            onChange={(e) => setExpectedAction(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="conseq-input">What were the consequences of this mistake?</label>
          <textarea
            id="conseq-input"
            className="textarea"
            placeholder="e.g. Blown hydraulic cylinder seals, machine downtime, safety hazard..."
            value={consequences}
            onChange={(e) => setConsequences(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="label" htmlFor="freq-select">How often do you see this issue occur?</label>
            <select id="freq-select" className="select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="multiple_times_day">Multiple times per day</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="occasionally">Occasionally</option>
              <option value="rare_but_important">Rare but important</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="entry-select">Entry-level expectation</label>
            <select id="entry-select" className="select" value={entryLevel} onChange={(e) => setEntryLevel(e.target.value)}>
              <option value="yes_independently">Expected to do independently</option>
              <option value="yes_limited_supervision">Expected with limited supervision</option>
              <option value="yes_direct_supervision">Expected with direct supervision</option>
              <option value="usually_additional_experience">Usually after additional training</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="partner-name-input">Your Organization Name (Optional)</label>
          <input id="partner-name-input" type="text" className="input" placeholder="e.g., Titan Heavy Machinery" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="label" htmlFor="email-input">Your Contact Email (Optional)</label>
          <input id="email-input" type="email" className="input" placeholder="supervisor@employer.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Optional file */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="label" htmlFor="file-input">Add Supporting Document / Image Reference (Optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input id="file-input" type="text" className="input" placeholder="e.g., service_sheet_redacted.pdf" value={mockFileName} onChange={(e) => setMockFileName(e.target.value)} />
            <button type="button" onClick={handleAddMockFile} className="btn btn-secondary">Attach</button>
          </div>
          {files.map((f, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>📎 {f.name}</div>)}
        </div>

        <label className="checkbox-label" style={{ marginBottom: '2rem' }}>
          <input type="checkbox" className="checkbox-input" checked={allowFollowUp} onChange={(e) => setAllowFollowUp(e.target.checked)} />
          <span>Instructors may contact me to clarify this diagnostic issue</span>
        </label>

        <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Struggle Report'}
        </button>
      </form>
    </div>
  );
}
