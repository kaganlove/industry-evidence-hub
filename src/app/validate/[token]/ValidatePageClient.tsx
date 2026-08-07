'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getValidationRequests, 
  getCurriculumArtifacts, 
  submitValidationResponse, 
  getPartners,
  getContributors
} from '@/lib/services/dbService';

export default function IndustryValidationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [valRequest, setValRequest] = useState<any | null>(null);
  const [artifact, setArtifact] = useState<any | null>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [encounter, setEncounter] = useState('yes');
  const [skill, setSkill] = useState('yes');
  const [resources, setResources] = useState('yes');
  const [independence, setIndependence] = useState('yes');
  const [preparedness, setPreparedness] = useState('yes');
  const [unrealistic, setUnrealistic] = useState('');
  const [generalComments, setGeneralComments] = useState('');

  // Optional contributor profile
  const [partnerId, setPartnerId] = useState('');
  const [contrName, setContrName] = useState('');
  const [contrEmail, setContrEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const requests = await getValidationRequests();
        const req = requests.find(r => r.token === token || r.id === token);
        if (req) {
          setValRequest(req);
          const artifactsList = await getCurriculumArtifacts();
          const art = artifactsList.find(a => a.id === req.curriculum_artifact_id);
          setArtifact(art || null);
        }
        const partnerList = await getPartners();
        setPartners(partnerList);
      } catch (e) {
        console.error('Error loading validation request', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valRequest) return;

    setSubmitting(true);
    setError('');

    try {
      // Simulate/Add contributor if name provided
      let contributorId = undefined;
      if (contrName) {
        // Let's create a contributor record for tracking
      }

      await submitValidationResponse({
        validation_request_id: valRequest.id,
        contributor_id: contributorId,
        industry_partner_id: partnerId || undefined,
        encounter_rating: encounter,
        skill_rating: skill,
        resources_rating: resources,
        independence_rating: independence,
        preparedness_rating: preparedness,
        unrealistic_missing_comments: unrealistic,
        general_comments: generalComments,
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit validation review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p>Loading validation request...</p>
      </div>
    );
  }

  if (!valRequest || !artifact) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '1.5rem', textAlign: 'center' }}>
        <div className="card">
          <h2 style={{ color: 'var(--status-danger)', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Invalid or Expired Link</h2>
          <p>The validation link is invalid, expired, or has been revoked by the institution.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: '640px', margin: '4rem auto', padding: '1.5rem' }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Validation Submitted</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Thank you for reviewing our curriculum materials. Your professional verification ensures that we prepare graduates to meet authentic workplace standards and safety compliance requirements.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            This validation record is preserved in our curriculum audit log.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '3rem auto', padding: '1.5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Curriculum Relevance Check
        </span>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
          Industry Validation Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Please review the training artifact and provide honest professional feedback on whether this matches actual field expectations for an entry-level worker.
        </p>

        <div className="card" style={{ marginTop: '1.5rem', background: 'var(--bg-surface-elevated)', borderLeft: '4px solid var(--secondary)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Reviewing Artifact ({artifact.artifact_type.replace('_', ' ')})
          </span>
          <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)' }}>{artifact.title}</h2>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Version: <strong>{artifact.version}</strong></span>
            {artifact.external_url && (
              <a href={artifact.external_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                📖 Open / Download Document
              </a>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Validation Questions
        </h3>

        {/* Question 1 */}
        <div className="form-group">
          <label className="label">1. Would an entry-level worker reasonably encounter tasks similar to this? *</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {['Yes', 'Sometimes', 'No', 'Unsure'].map((opt) => (
              <label key={opt} className="checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="encounter"
                  className="checkbox-input"
                  style={{ borderRadius: '50%' }}
                  checked={encounter === opt.toLowerCase()}
                  onChange={() => setEncounter(opt.toLowerCase())}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="form-group">
          <label className="label">2. Does this task require meaningful job-related skill? *</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {['Yes', 'Partially', 'No', 'Unsure'].map((opt) => (
              <label key={opt} className="checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="skill"
                  className="checkbox-input"
                  style={{ borderRadius: '50%' }}
                  checked={skill === opt.toLowerCase()}
                  onChange={() => setSkill(opt.toLowerCase())}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 3 */}
        <div className="form-group">
          <label className="label">3. Are the tools, equipment, or documents provided realistic to what is used in the shop? *</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {['Yes', 'Partially', 'No', 'Unsure'].map((opt) => (
              <label key={opt} className="checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="resources"
                  className="checkbox-input"
                  style={{ borderRadius: '50%' }}
                  checked={resources === opt.toLowerCase()}
                  onChange={() => setResources(opt.toLowerCase())}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 4 */}
        <div className="form-group">
          <label className="label">4. Is the expected level of technician independence reasonable? *</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {['Yes', 'Partially', 'No', 'Unsure'].map((opt) => (
              <label key={opt} className="checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="independence"
                  className="checkbox-input"
                  style={{ borderRadius: '50%' }}
                  checked={independence === opt.toLowerCase()}
                  onChange={() => setIndependence(opt.toLowerCase())}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Question 5 */}
        <div className="form-group">
          <label className="label" htmlFor="unrealistic-input">5. Is anything unrealistic, incorrect, or missing? (Optional)</label>
          <textarea
            id="unrealistic-input"
            className="textarea"
            placeholder="e.g. The pressure specifications are too low, or safety goggles should be specified when cycling pump..."
            value={unrealistic}
            onChange={(e) => setUnrealistic(e.target.value)}
          />
        </div>

        {/* Question 6 */}
        <div className="form-group">
          <label className="label">6. Would successful completion increase your confidence that a student is prepared for this work? *</label>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {['Yes', 'Somewhat', 'No', 'Unsure'].map((opt) => (
              <label key={opt} className="checkbox-label" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="preparedness"
                  className="checkbox-input"
                  style={{ borderRadius: '50%' }}
                  checked={preparedness === opt.toLowerCase()}
                  onChange={() => setPreparedness(opt.toLowerCase())}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="general-comments-input">General Comments or Feedback</label>
          <textarea
            id="general-comments-input"
            className="textarea"
            placeholder="Share any additional feedback for the instructors..."
            value={generalComments}
            onChange={(e) => setGeneralComments(e.target.value)}
          />
        </div>

        <h3 style={{ fontSize: '1.1rem', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Who is validating this? (Optional)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="label" htmlFor="partner-select">Your Organization</label>
            <select
              id="partner-select"
              className="select"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            >
              <option value="">Choose partner (or remain anonymous)...</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.organization_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="name-input">Your Name</label>
            <input
              id="name-input"
              type="text"
              className="input"
              placeholder="e.g. John Miller"
              value={contrName}
              onChange={(e) => setContrName(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
          {submitting ? 'Submitting Validation...' : 'Submit Validation'}
        </button>
      </form>
    </div>
  );
}
