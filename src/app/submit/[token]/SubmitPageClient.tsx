'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEvidenceRequestByToken, createSubmission, EvidenceRequest } from '@/lib/services/dbService';

export default function PublicSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [request, setRequest] = useState<EvidenceRequest | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const [step, setStep] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [sharingTypes, setSharingTypes] = useState<string[]>([]);
  const [jobRole, setJobRole] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [entryLevel, setEntryLevel] = useState('yes_limited_supervision');
  const [toolsResources, setToolsResources] = useState('');
  const [successDescription, setSuccessDescription] = useState('');
  const [commonMistakes, setCommonMistakes] = useState('');
  const [unsafeUnacceptable, setUnsafeUnacceptable] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');

  // Contributor Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [yearsInIndustry, setYearsInIndustry] = useState('');
  const [contributorType, setContributorType] = useState('technician');
  const [allowFollowUp, setAllowFollowUp] = useState(false);

  // Files
  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const [mockFileName, setMockFileName] = useState('');

  // Permissions
  const [permReview, setPermReview] = useState(true);
  const [permAdapt, setPermAdapt] = useState(false);
  const [permClass, setPermClass] = useState(false);
  const [permPublic, setPermPublic] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const found = await getEvidenceRequestByToken(token);
        setRequest(found);
      } catch (e) {
        console.error('Error loading request info', e);
      } finally {
        setLoadingRequest(false);
      }
    }
    load();
  }, [token]);

  const handleToggleSharingType = (type: string) => {
    if (sharingTypes.includes(type)) {
      setSharingTypes(sharingTypes.filter(t => t !== type));
    } else {
      setSharingTypes([...sharingTypes, type]);
    }
  };

  const handleAddMockFile = () => {
    if (!mockFileName) return;
    const extension = mockFileName.split('.').pop() || 'pdf';
    const fakeType = extension === 'pdf' ? 'application/pdf' : extension === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'image/jpeg';
    setFiles([...files, { name: mockFileName, size: Math.floor(Math.random() * 5000000) + 100000, type: fakeType }]);
    setMockFileName('');
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (sharingTypes.length === 0) {
        setError('Please select at least one item of what you are sharing');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!jobRole || !taskDescription) {
        setError('Job role and task description are required');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('You must confirm sharing authorization before submitting');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await createSubmission({
        organization_id: request?.organization_id || 'org-demo-dtc',
        evidence_request_id: request?.id,
        title: `${sharingTypes.join(', ')} contribution for ${jobRole}`,
        evidence_type: sharingTypes[0]?.toLowerCase().replace(/\s+/g, '_') || 'work_order',
        job_role: jobRole,
        task_description: taskDescription,
        frequency,
        entry_level_expectation: entryLevel,
        tools_resources: toolsResources,
        success_description: successDescription,
        common_mistakes: commonMistakes,
        unsafe_unacceptable: unsafeUnacceptable,
        additional_comments: additionalComments,
        permission_internal_review: permReview,
        permission_curriculum_adaptation: permAdapt,
        permission_classroom_distribution: permClass,
        permission_public_distribution: permPublic,
        contributor: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          job_title: jobTitle || jobRole,
          partner_name: partnerName,
          years_in_industry: yearsInIndustry ? parseInt(yearsInIndustry) : undefined,
          contributor_type: contributorType,
          allow_follow_up: allowFollowUp,
        },
        fileAttachments: files,
      });

      setSubmittedId(result.reference_id);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check files and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingRequest) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p>Loading submission page...</p>
      </div>
    );
  }

  // Confirmation view
  if (step === 4) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '1.5rem' }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Thank You for Sharing!</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your contribution has been successfully received. It will be reviewed by curriculum developers and subject matter experts to align our programs with real workplace practices.
          </p>
          <div style={{
            background: 'var(--bg-base)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-color)',
            marginBottom: '2rem'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>Reference Number</span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{submittedId}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => {
              setStep(1);
              setSharingTypes([]);
              setTaskDescription('');
              setFiles([]);
              setConfirmed(false);
            }} className="btn btn-primary">
              Submit Another Example
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '1.5rem' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          Show Us the Work
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
          Help us better understand what employees actually do on the job. Share a real task, document, problem, process, or example that could help us prepare students for the workplace.
        </p>

        {request && (
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginTop: '1.5rem',
            textAlign: 'left'
          }}>
            <strong style={{ color: 'var(--primary)', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Active Evidence Request
            </strong>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{request.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>{request.description}</p>
          </div>
        )}
      </header>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Progress Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: num <= step ? 'var(--primary)' : 'var(--border-color)',
              transition: 'background-color var(--transition-fast)'
            }}
          />
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Step 1: What are you sharing?</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                'Real workplace task', 'Work order', 'Form or checklist', 
                'Troubleshooting example', 'Photo', 'Video', 
                'SOP or procedure', 'Equipment documentation', 
                'Common new-hire difficulty', 'Example of unacceptable work', 
                'Example of successful work'
              ].map((type) => {
                const isSelected = sharingTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleSharingType(type)}
                    className="btn"
                    style={{
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      padding: '1rem 0.75rem',
                      fontSize: '0.9rem',
                      justifyContent: 'flex-start',
                      height: 'auto'
                    }}
                  >
                    <span style={{ marginRight: '0.5rem' }}>{isSelected ? '✓' : '+'}</span>
                    {type}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNextStep} className="btn btn-primary">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Step 2: Tell us about the work</h2>
            
            <div className="form-group">
              <label className="label" htmlFor="job-role-input">What job role normally performs this work? *</label>
              <input
                id="job-role-input"
                type="text"
                className="input"
                placeholder="e.g., Lead Diesel Field Technician"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="task-desc-input">What does the worker actually need to do? *</label>
              <textarea
                id="task-desc-input"
                className="textarea"
                placeholder="Provide a detailed, step-by-step description of what this job task looks like in practice..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="label" htmlFor="freq-select">How often does this occur?</label>
                <select
                  id="freq-select"
                  className="select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="multiple_times_day">Multiple times per day</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="occasionally">Occasionally</option>
                  <option value="rare_but_important">Rare but important</option>
                  <option value="vars">Varies</option>
                  <option value="unsure">Unsure</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="entry-level-select">Is this expected of an entry-level employee?</label>
                <select
                  id="entry-level-select"
                  className="select"
                  value={entryLevel}
                  onChange={(e) => setEntryLevel(e.target.value)}
                >
                  <option value="yes_independently">Yes, independently</option>
                  <option value="yes_limited_supervision">Yes, with limited supervision</option>
                  <option value="yes_direct_supervision">Yes, with direct supervision</option>
                  <option value="usually_additional_experience">Usually after additional experience</option>
                  <option value="not_typically_entry_level">Not typically entry-level</option>
                  <option value="unsure">Unsure</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="tools-input">What tools, equipment, software, or documents are normally available?</label>
              <textarea
                id="tools-input"
                className="textarea"
                placeholder="e.g., hydraulic schematics, pressure gauge, flow meter"
                value={toolsResources}
                onChange={(e) => setToolsResources(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="success-input">What does successful performance look like?</label>
              <textarea
                id="success-input"
                className="textarea"
                placeholder="How do you evaluate that this task was done correctly?"
                value={successDescription}
                onChange={(e) => setSuccessDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="mistakes-input">What mistakes do inexperienced workers commonly make?</label>
              <textarea
                id="mistakes-input"
                className="textarea"
                placeholder="Describe typical errors or misdiagnoses..."
                value={commonMistakes}
                onChange={(e) => setCommonMistakes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="unsafe-input">What could make the work unsafe or unacceptable?</label>
              <textarea
                id="unsafe-input"
                className="textarea"
                placeholder="Describe critical safety risks or immediate failure terms..."
                value={unsafeUnacceptable}
                onChange={(e) => setUnsafeUnacceptable(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="comments-input">Anything else instructors should understand?</label>
              <textarea
                id="comments-input"
                className="textarea"
                placeholder="Optional notes or industry trends..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button type="button" onClick={handleNextStep} className="btn btn-primary">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Step 3: Materials & Permissions</h2>

            {/* Contributor identification details */}
            <div style={{
              background: 'var(--bg-base)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Your Information (Optional/Secure)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label" htmlFor="firstname-input">First Name</label>
                  <input id="firstname-input" type="text" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="lastname-input">Last Name</label>
                  <input id="lastname-input" type="text" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label" htmlFor="email-input">Email</label>
                  <input id="email-input" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="phone-input">Phone</label>
                  <input id="phone-input" type="text" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label" htmlFor="partner-input">Organization / Employer</label>
                  <input id="partner-input" type="text" className="input" placeholder="e.g. Titan Heavy Machinery" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="job-title-input">Job Title</label>
                  <input id="job-title-input" type="text" className="input" placeholder="e.g. Shop Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="label" htmlFor="years-input">Years in Industry</label>
                  <input id="years-input" type="number" className="input" value={yearsInIndustry} onChange={(e) => setYearsInIndustry(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="type-select">Job Category</label>
                  <select id="type-select" className="select" value={contributorType} onChange={(e) => setContributorType(e.target.value)}>
                    <option value="technician">Technician / Mechanic</option>
                    <option value="supervisor">Shop Supervisor / Foreman</option>
                    <option value="manager">Service Manager</option>
                    <option value="executive">Owner / Director</option>
                  </select>
                </div>
              </div>

              <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={allowFollowUp}
                  onChange={(e) => setAllowFollowUp(e.target.checked)}
                />
                <span>Allow instructors to contact me for technical clarification if needed</span>
              </label>
            </div>

            {/* Mock file attachments */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Upload Supporting Material</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Upload PDF, DOCX, XLSX, images (PNG, JPG), or schematic references. Max limit: 50MB.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  id="mock-file-input"
                  type="text"
                  className="input"
                  placeholder="e.g. hydraulic_schematic_excavator.pdf"
                  value={mockFileName}
                  onChange={(e) => setMockFileName(e.target.value)}
                />
                <button type="button" onClick={handleAddMockFile} className="btn btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  Add Mock File
                </button>
              </div>

              {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-base)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  {files.map((file, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button type="button" onClick={() => handleRemoveFile(idx)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permissions */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Permission & Licensing Levels</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={permReview}
                    disabled
                  />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>Permission Level A: Internal Evidence Only</strong>
                    <span style={{ fontSize: '0.85rem' }}>The institution may review the submission internally for curriculum-development purposes. It will not be distributed directly to students.</span>
                  </div>
                </label>

                <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={permAdapt}
                    onChange={(e) => setPermAdapt(e.target.checked)}
                  />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>Permission Level B: Adaptation Permitted</strong>
                    <span style={{ fontSize: '0.85rem' }}>The institution may create modified, anonymized, or recreated instructional assessments or lab guides based on this document.</span>
                  </div>
                </label>

                <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={permClass}
                    onChange={(e) => setPermClass(e.target.checked)}
                  />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>Permission Level C: Classroom Use Permitted</strong>
                    <span style={{ fontSize: '0.85rem' }}>The institution may distribute this original document to students directly inside classroom activities.</span>
                  </div>
                </label>

                <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={permPublic}
                    onChange={(e) => setPermPublic(e.target.checked)}
                  />
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>Permission Level D: Public Educational Use</strong>
                    <span style={{ fontSize: '0.85rem' }}>The institution may publish the file in public open educational resource repositories.</span>
                  </div>
                </label>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '2rem'
            }}>
              <label className="checkbox-label" style={{ alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  required
                />
                <div>
                  <strong style={{ color: 'var(--status-review)', display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    Confirm Sharing & Security
                  </strong>
                  <span style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                    I confirm that I have permission to share this material at the selected level and understand how the institution may use it.
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    ⚠️ Warning: Do not submit customer private data, credit cards, employee records, passwords, or proprietary credentials.
                  </span>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" disabled={submitting}>
                Back
              </button>
              <button type="submit" className="btn btn-accent" disabled={submitting || !confirmed}>
                {submitting ? 'Submitting...' : 'Submit Evidence'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
