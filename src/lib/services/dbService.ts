// Database Service Layer supporting both Supabase and LocalStorage modes
import { supabase, isSupabaseConfigured } from '../db/client';
import * as seed from '../db/mockSeed';

// Check if we should enforce Mock DB mode
const forceMock = typeof window !== 'undefined' && localStorage.getItem('NEXT_PUBLIC_USE_MOCK_DB') === 'true';
export const isMockMode = !isSupabaseConfigured || forceMock;

// Key prefixes for localStorage storage
const KEYS = {
  ORGANIZATIONS: 'ih_organizations',
  USERS: 'ih_users',
  PROGRAMS: 'ih_programs',
  COURSES: 'ih_courses',
  COMPETENCIES: 'ih_competencies',
  PARTNERS: 'ih_partners',
  CONTRIBUTORS: 'ih_contributors',
  REQUESTS: 'ih_requests',
  SUBMISSIONS: 'ih_submissions',
  SUBMISSION_COMPETENCIES: 'ih_submission_competencies',
  CURRICULUM_ARTIFACTS: 'ih_curriculum_artifacts',
  CURRICULUM_ACTIONS: 'ih_curriculum_actions',
  VALIDATION_REQUESTS: 'ih_validation_requests',
  VALIDATION_RESPONSES: 'ih_validation_responses',
  TASK_PROFILES: 'ih_task_profiles',
  TASK_PROFILE_SUBMISSIONS: 'ih_task_profile_submissions',
  TAGS: 'ih_tags',
  SUBMISSION_TAGS: 'ih_submission_tags',
  AUDIT_LOGS: 'ih_audit_logs',
  CURRENT_USER: 'ih_current_user',
};

// Memory store for server-side environments or testing
const memoryStore: { [key: string]: string } = {};

// Helper to check and initialize localStorage or memoryStore
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    const val = memoryStore[key];
    if (!val) {
      memoryStore[key] = JSON.stringify(defaultValue);
      return defaultValue;
    }
    try {
      return JSON.parse(val) as T;
    } catch {
      return defaultValue;
    }
  }
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(val) as T;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    memoryStore[key] = JSON.stringify(value);
  }
}

// Local State Initialization
let localStateInitialized = false;
export function initializeLocalState(forceReset = false) {
  if (forceReset) {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    } else {
      for (const k in memoryStore) {
        delete memoryStore[k];
      }
    }
    localStateInitialized = false;
  }

  if (localStateInitialized && !forceReset) return;

  // Prepopulate if empty
  getStorageItem(KEYS.ORGANIZATIONS, [seed.MOCK_ORGANIZATION]);
  getStorageItem(KEYS.USERS, seed.MOCK_USERS);
  getStorageItem(KEYS.PROGRAMS, seed.MOCK_PROGRAMS);
  getStorageItem(KEYS.COURSES, seed.MOCK_COURSES);
  getStorageItem(KEYS.COMPETENCIES, seed.MOCK_COMPETENCIES);
  getStorageItem(KEYS.PARTNERS, seed.MOCK_INDUSTRY_PARTNERS);
  getStorageItem(KEYS.CONTRIBUTORS, seed.MOCK_CONTRIBUTORS);
  getStorageItem(KEYS.REQUESTS, seed.MOCK_EVIDENCE_REQUESTS);
  getStorageItem(KEYS.SUBMISSIONS, seed.MOCK_SUBMISSIONS);
  getStorageItem(KEYS.SUBMISSION_COMPETENCIES, seed.MOCK_SUBMISSION_COMPETENCIES);
  getStorageItem(KEYS.CURRICULUM_ARTIFACTS, seed.MOCK_CURRICULUM_ARTIFACTS);
  getStorageItem(KEYS.CURRICULUM_ACTIONS, seed.MOCK_CURRICULUM_ACTIONS);
  getStorageItem(KEYS.VALIDATION_REQUESTS, seed.MOCK_VALIDATION_REQUESTS);
  getStorageItem(KEYS.VALIDATION_RESPONSES, seed.MOCK_VALIDATION_RESPONSES);
  getStorageItem(KEYS.TAGS, seed.MOCK_TAGS);
  getStorageItem(KEYS.SUBMISSION_TAGS, seed.MOCK_SUBMISSION_TAG_MAPPINGS);
  getStorageItem(KEYS.AUDIT_LOGS, seed.MOCK_AUDIT_LOGS);
  
  // Set default current user if none exists
  getStorageItem(KEYS.CURRENT_USER, seed.MOCK_USERS[1]); // Clara Barton (ID) as default

  localStateInitialized = true;
}

// Auto-run on client side load
if (typeof window !== 'undefined') {
  initializeLocalState();
}

// ----------------------------------------------------
// AUDIT LOG SERVICE
// ----------------------------------------------------
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  oldValue?: any,
  newValue?: any
) {
  const currentUser = await getCurrentUser();
  const orgId = currentUser ? currentUser.organization_id : seed.MOCK_ORGANIZATION.id;

  const newLog: seed.AuditLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    organization_id: orgId,
    user_id: currentUser?.id,
    actor_type: currentUser ? 'user' : 'public',
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue,
    new_value: newValue,
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString(),
  };

  if (isMockMode) {
    const logs = getStorageItem<seed.AuditLog[]>(KEYS.AUDIT_LOGS, []);
    logs.unshift(newLog);
    setStorageItem(KEYS.AUDIT_LOGS, logs);
  } else {
    try {
      await supabase!.from('audit_logs').insert([newLog]);
    } catch (e) {
      console.error('Audit logging failed', e);
    }
  }
}

// ----------------------------------------------------
// AUTH & USERS SERVICE
// ----------------------------------------------------
export async function getCurrentUser(): Promise<seed.User | null> {
  if (isMockMode) {
    return getStorageItem<seed.User | null>(KEYS.CURRENT_USER, null);
  }
  // Supabase live check
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return null;
  const { data } = await supabase!
    .from('users')
    .select('*, user_roles(role)')
    .eq('id', user.id)
    .single();
  
  if (!data) return null;
  return {
    ...data,
    role: data.user_roles?.[0]?.role || 'reviewer'
  };
}

export async function loginAsUser(userId: string): Promise<seed.User> {
  initializeLocalState();
  const users = getStorageItem<seed.User[]>(KEYS.USERS, []);
  const found = users.find(u => u.id === userId);
  if (!found) throw new Error('User not found');
  setStorageItem(KEYS.CURRENT_USER, found);
  return found;
}

export async function logoutUser() {
  if (isMockMode) {
    setStorageItem(KEYS.CURRENT_USER, null);
  } else {
    await supabase!.auth.signOut();
  }
}

export async function getOrganizationSettings() {
  if (isMockMode) {
    return {
      organization_id: seed.MOCK_ORGANIZATION.id,
      default_retention_policy: 'permanent',
      evidence_freshness_months: 24,
      review_warning_months: 36,
      default_submission_permission: 'internal_review',
      public_submission_enabled: true,
    };
  }
  const user = await getCurrentUser();
  const { data } = await supabase!
    .from('organization_settings')
    .select('*')
    .eq('organization_id', user!.organization_id)
    .single();
  return data;
}

// ----------------------------------------------------
// CORE ENTITIES (Programs, Courses, Competencies)
// ----------------------------------------------------
export async function getPrograms(): Promise<seed.Program[]> {
  if (isMockMode) {
    return getStorageItem<seed.Program[]>(KEYS.PROGRAMS, []);
  }
  const { data } = await supabase!.from('programs').select('*').eq('active', true);
  return data || [];
}

export async function getCourses(): Promise<seed.Course[]> {
  if (isMockMode) {
    return getStorageItem<seed.Course[]>(KEYS.COURSES, []);
  }
  const { data } = await supabase!.from('courses').select('*').eq('active', true);
  return data || [];
}

export async function getCompetencies(): Promise<seed.Competency[]> {
  if (isMockMode) {
    return getStorageItem<seed.Competency[]>(KEYS.COMPETENCIES, []);
  }
  const { data } = await supabase!.from('competencies').select('*').eq('active', true).order('sequence');
  return data || [];
}

// ----------------------------------------------------
// SUBMISSIONS & EVIDENCE RECORDS
// ----------------------------------------------------
export async function getSubmissions(): Promise<seed.Submission[]> {
  if (isMockMode) {
    return getStorageItem<seed.Submission[]>(KEYS.SUBMISSIONS, []);
  }
  const { data } = await supabase!.from('submissions').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getSubmissionById(id: string): Promise<seed.Submission | null> {
  if (isMockMode) {
    const list = getStorageItem<seed.Submission[]>(KEYS.SUBMISSIONS, []);
    return list.find(s => s.id === id) || null;
  }
  const { data } = await supabase!.from('submissions').select('*').eq('id', id).single();
  return data;
}

export async function getSubmissionByReferenceId(refId: string): Promise<seed.Submission | null> {
  if (isMockMode) {
    const list = getStorageItem<seed.Submission[]>(KEYS.SUBMISSIONS, []);
    return list.find(s => s.reference_id === refId) || null;
  }
  const { data } = await supabase!.from('submissions').select('*').eq('reference_id', refId).single();
  return data;
}

export async function createSubmission(
  submissionData: Omit<seed.Submission, 'id' | 'reference_id' | 'created_at' | 'updated_at' | 'status'> & {
    contributor?: Omit<seed.IndustryContributor, 'id' | 'organization_id'> & { partner_name?: string };
    fileAttachments?: { name: string; size: number; type: string }[];
  }
): Promise<seed.Submission> {
  const submissions = getStorageItem<seed.Submission[]>(KEYS.SUBMISSIONS, []);
  
  // Build reference ID: DET-EV-2026-XXXX
  const nextNumber = String(submissions.length + 482).padStart(4, '0');
  const year = new Date().getFullYear();
  const refId = `DET-EV-${year}-${nextNumber}`;
  const subId = `sub-${Math.random().toString(36).substr(2, 9)}`;

  // Handle contributor creation if provided
  let contributorId = submissionData.contributor_id;
  if (submissionData.contributor) {
    const contributors = getStorageItem<seed.IndustryContributor[]>(KEYS.CONTRIBUTORS, []);
    const partners = getStorageItem<seed.IndustryPartner[]>(KEYS.PARTNERS, []);
    
    let partnerId = '';
    if (submissionData.contributor.partner_name) {
      let partner = partners.find(p => p.organization_name.toLowerCase() === submissionData.contributor!.partner_name!.toLowerCase());
      if (!partner) {
        partner = {
          id: `partner-${Math.random().toString(36).substr(2, 9)}`,
          organization_id: submissionData.organization_id,
          organization_name: submissionData.contributor.partner_name,
          industry_sector: 'Other',
          city: 'Unknown',
          state: 'MN',
          country: 'USA',
          active: true,
        };
        partners.push(partner);
        setStorageItem(KEYS.PARTNERS, partners);
      }
      partnerId = partner.id;
    }

    const newContr: seed.IndustryContributor = {
      id: `contr-${Math.random().toString(36).substr(2, 9)}`,
      organization_id: submissionData.organization_id,
      industry_partner_id: partnerId,
      first_name: submissionData.contributor.first_name,
      last_name: submissionData.contributor.last_name,
      job_title: submissionData.contributor.job_title,
      department: submissionData.contributor.department,
      email: submissionData.contributor.email,
      phone: submissionData.contributor.phone,
      years_in_industry: submissionData.contributor.years_in_industry,
      contributor_type: submissionData.contributor.contributor_type || 'technician',
      allow_follow_up: submissionData.contributor.allow_follow_up || false,
    };
    contributors.push(newContr);
    setStorageItem(KEYS.CONTRIBUTORS, contributors);
    contributorId = newContr.id;
  }

  // Handle mock attachments
  const attachments = (submissionData.fileAttachments || []).map((file, index) => ({
    id: `att-${Math.random().toString(36).substr(2, 9)}`,
    original_filename: file.name,
    display_filename: file.name.split('.')[0] + ' (Uploaded)',
    mime_type: file.type || 'application/octet-stream',
    file_extension: file.name.split('.').pop() || '',
    storage_path: `${submissionData.organization_id}/submissions/${file.name}`,
    file_size: file.size,
  }));

  const newSubmission: seed.Submission = {
    id: subId,
    organization_id: submissionData.organization_id,
    evidence_request_id: submissionData.evidence_request_id,
    reference_id: refId,
    title: submissionData.title,
    evidence_type: submissionData.evidence_type,
    job_role: submissionData.job_role,
    task_description: submissionData.task_description,
    frequency: submissionData.frequency,
    entry_level_expectation: submissionData.entry_level_expectation,
    tools_resources: submissionData.tools_resources,
    success_description: submissionData.success_description,
    common_mistakes: submissionData.common_mistakes,
    unsafe_unacceptable: submissionData.unsafe_unacceptable,
    additional_comments: submissionData.additional_comments,
    contributor_id: contributorId,
    permission_internal_review: submissionData.permission_internal_review,
    permission_curriculum_adaptation: submissionData.permission_curriculum_adaptation,
    permission_classroom_distribution: submissionData.permission_classroom_distribution,
    permission_public_distribution: submissionData.permission_public_distribution,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attachments,
  };

  if (isMockMode) {
    submissions.unshift(newSubmission);
    setStorageItem(KEYS.SUBMISSIONS, submissions);
  } else {
    // Live Supabase implementation
    const { data, error } = await supabase!.from('submissions').insert([newSubmission]).select().single();
    if (error) throw error;
    // Map attachments also if needed
  }

  await logAuditEvent('submission_created', 'submissions', subId, null, { reference_id: refId });
  return newSubmission;
}

export async function updateSubmission(id: string, updates: Partial<seed.Submission>): Promise<seed.Submission> {
  const submissions = getStorageItem<seed.Submission[]>(KEYS.SUBMISSIONS, []);
  const idx = submissions.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Submission not found');

  const oldVal = submissions[idx];
  const updatedVal = {
    ...oldVal,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (isMockMode) {
    submissions[idx] = updatedVal;
    setStorageItem(KEYS.SUBMISSIONS, submissions);
  } else {
    const { error } = await supabase!.from('submissions').update(updates).eq('id', id);
    if (error) throw error;
  }

  // Audit specific triggers
  if (updates.status && updates.status !== oldVal.status) {
    await logAuditEvent('submission_status_changed', 'submissions', id, { status: oldVal.status }, { status: updates.status });
  } else {
    await logAuditEvent('submission_updated', 'submissions', id, null, updates);
  }

  return updatedVal;
}

// ----------------------------------------------------
// MAPPINGS SERVICE (Submission to Competencies, Courses, Programs)
// ----------------------------------------------------
export async function getSubmissionCompetencyMappings(submissionId: string) {
  const mappings = getStorageItem<any[]>(KEYS.SUBMISSION_COMPETENCIES, []);
  return mappings.filter(m => m.submission_id === submissionId);
}

export async function addSubmissionCompetencyMapping(submissionId: string, competencyId: string, notes = '', relevanceRating = 5) {
  const mappings = getStorageItem<any[]>(KEYS.SUBMISSION_COMPETENCIES, []);
  const currentUser = await getCurrentUser();
  
  // Avoid duplicates
  if (mappings.some(m => m.submission_id === submissionId && m.competency_id === competencyId)) {
    return;
  }

  const newMapping = {
    submission_id: submissionId,
    competency_id: competencyId,
    mapped_by: currentUser?.id || 'system',
    mapped_at: new Date().toISOString(),
    relevance_rating: relevanceRating,
    notes,
  };

  mappings.push(newMapping);
  setStorageItem(KEYS.SUBMISSION_COMPETENCIES, mappings);

  await logAuditEvent('submission_competency_mapped', 'submissions', submissionId, null, { competency_id: competencyId });
}

export async function removeSubmissionCompetencyMapping(submissionId: string, competencyId: string) {
  let mappings = getStorageItem<any[]>(KEYS.SUBMISSION_COMPETENCIES, []);
  mappings = mappings.filter(m => !(m.submission_id === submissionId && m.competency_id === competencyId));
  setStorageItem(KEYS.SUBMISSION_COMPETENCIES, mappings);

  await logAuditEvent('submission_competency_unmapped', 'submissions', submissionId, { competency_id: competencyId }, null);
}

// Tags
export async function getTags(): Promise<seed.Tag[]> {
  return getStorageItem<seed.Tag[]>(KEYS.TAGS, []);
}

export async function createTag(name: string, description = ''): Promise<seed.Tag> {
  const tags = getStorageItem<seed.Tag[]>(KEYS.TAGS, []);
  const exists = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
  if (exists) return exists;

  const newTag: seed.Tag = {
    id: `tag-${Math.random().toString(36).substr(2, 9)}`,
    organization_id: seed.MOCK_ORGANIZATION.id,
    name: name.toLowerCase().trim(),
    description,
    active: true,
  };
  tags.push(newTag);
  setStorageItem(KEYS.TAGS, tags);
  return newTag;
}

export async function getSubmissionTags(submissionId: string): Promise<seed.Tag[]> {
  const subTags = getStorageItem<any[]>(KEYS.SUBMISSION_TAGS, []);
  const tags = getStorageItem<seed.Tag[]>(KEYS.TAGS, []);
  
  const mappedTagIds = subTags.filter(st => st.submission_id === submissionId).map(st => st.tag_id);
  return tags.filter(t => mappedTagIds.includes(t.id));
}

export async function toggleSubmissionTag(submissionId: string, tagId: string) {
  let subTags = getStorageItem<any[]>(KEYS.SUBMISSION_TAGS, []);
  const idx = subTags.findIndex(st => st.submission_id === submissionId && st.tag_id === tagId);
  
  if (idx > -1) {
    subTags.splice(idx, 1);
  } else {
    subTags.push({
      submission_id: submissionId,
      tag_id: tagId,
      tagged_by: 'usr-id',
      tagged_at: new Date().toISOString(),
    });
  }
  setStorageItem(KEYS.SUBMISSION_TAGS, subTags);
}

// ----------------------------------------------------
// EVIDENCE REQUESTS SERVICE
// ----------------------------------------------------
export async function getEvidenceRequests(): Promise<seed.EvidenceRequest[]> {
  return getStorageItem<seed.EvidenceRequest[]>(KEYS.REQUESTS, []);
}

export async function getEvidenceRequestByToken(token: string): Promise<seed.EvidenceRequest | null> {
  const requests = getStorageItem<seed.EvidenceRequest[]>(KEYS.REQUESTS, []);
  return requests.find(r => r.token === token || r.id === token) || null;
}

export async function createEvidenceRequest(requestData: Omit<seed.EvidenceRequest, 'id' | 'token' | 'created_at' | 'status'> & { competencyIds?: string[] }): Promise<seed.EvidenceRequest> {
  const requests = getStorageItem<seed.EvidenceRequest[]>(KEYS.REQUESTS, []);
  const token = `req-token-${Math.random().toString(36).substr(2, 9)}`;
  const reqId = `req-${Math.random().toString(36).substr(2, 9)}`;

  const newRequest: seed.EvidenceRequest = {
    ...requestData,
    id: reqId,
    token,
    status: 'open',
    created_at: new Date().toISOString(),
  };

  requests.push(newRequest);
  setStorageItem(KEYS.REQUESTS, requests);

  // Map competencies if any
  if (requestData.competencyIds) {
    // For simplicity, store in junction table if needed or mock it
  }

  await logAuditEvent('evidence_request_created', 'evidence_requests', reqId, null, { token });
  return newRequest;
}

// ----------------------------------------------------
// TASK PROFILES SERVICE
// ----------------------------------------------------
export async function getTaskProfiles(): Promise<seed.TaskProfile[]> {
  return getStorageItem<seed.TaskProfile[]>(KEYS.TASK_PROFILES, []);
}

export async function createTaskProfile(profileData: Omit<seed.TaskProfile, 'id' | 'created_at' | 'status'> & { supportingSubmissionIds?: string[] }): Promise<seed.TaskProfile> {
  const profiles = getStorageItem<seed.TaskProfile[]>(KEYS.TASK_PROFILES, []);
  const profileId = `profile-${Math.random().toString(36).substr(2, 9)}`;

  const newProfile: seed.TaskProfile = {
    ...profileData,
    id: profileId,
    status: 'active',
    created_at: new Date().toISOString(),
  };

  profiles.push(newProfile);
  setStorageItem(KEYS.TASK_PROFILES, profiles);

  // Map submissions
  if (profileData.supportingSubmissionIds) {
    const list = getStorageItem<any[]>(KEYS.TASK_PROFILE_SUBMISSIONS, []);
    profileData.supportingSubmissionIds.forEach(subId => {
      list.push({
        task_profile_id: profileId,
        submission_id: subId,
        relationship_notes: 'Evidence base',
        added_by: profileData.created_by,
        added_at: new Date().toISOString(),
      });
    });
    setStorageItem(KEYS.TASK_PROFILE_SUBMISSIONS, list);
  }

  await logAuditEvent('task_profile_created', 'task_profiles', profileId, null, { title: profileData.title });
  return newProfile;
}

export async function getTaskProfileSubmissions(profileId: string): Promise<seed.Submission[]> {
  const mappings = getStorageItem<any[]>(KEYS.TASK_PROFILE_SUBMISSIONS, []);
  const submissions = getStorageItem<seed.Submission[]>(KEYS.SUBMISSIONS, []);
  const subIds = mappings.filter(m => m.task_profile_id === profileId).map(m => m.submission_id);
  return submissions.filter(s => subIds.includes(s.id));
}

// ----------------------------------------------------
// CURRICULUM ARTIFACTS & ACTIONS SERVICE
// ----------------------------------------------------
export async function getCurriculumArtifacts(): Promise<seed.CurriculumArtifact[]> {
  return getStorageItem<seed.CurriculumArtifact[]>(KEYS.CURRICULUM_ARTIFACTS, []);
}

export async function createCurriculumArtifact(data: Omit<seed.CurriculumArtifact, 'id' | 'created_at' | 'status'>): Promise<seed.CurriculumArtifact> {
  const list = getStorageItem<seed.CurriculumArtifact[]>(KEYS.CURRICULUM_ARTIFACTS, []);
  const newId = `art-${Math.random().toString(36).substr(2, 9)}`;
  const artifact: seed.CurriculumArtifact = {
    ...data,
    id: newId,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  list.push(artifact);
  setStorageItem(KEYS.CURRICULUM_ARTIFACTS, list);
  await logAuditEvent('curriculum_artifact_created', 'curriculum_artifacts', newId, null, { title: data.title });
  return artifact;
}

export async function getCurriculumActions(): Promise<seed.CurriculumAction[]> {
  return getStorageItem<seed.CurriculumAction[]>(KEYS.CURRICULUM_ACTIONS, []);
}

export async function createCurriculumAction(actionData: Omit<seed.CurriculumAction, 'id' | 'created_at' | 'status'>): Promise<seed.CurriculumAction> {
  const actions = getStorageItem<seed.CurriculumAction[]>(KEYS.CURRICULUM_ACTIONS, []);
  const actionId = `action-${Math.random().toString(36).substr(2, 9)}`;

  const newAction: seed.CurriculumAction = {
    ...actionData,
    id: actionId,
    status: 'implemented',
    created_at: new Date().toISOString(),
  };

  actions.push(newAction);
  setStorageItem(KEYS.CURRICULUM_ACTIONS, actions);

  await logAuditEvent('curriculum_action_created', 'curriculum_actions', actionId, null, { title: actionData.title });
  return newAction;
}

// ----------------------------------------------------
// VALIDATION WORKFLOW SERVICE
// ----------------------------------------------------
export async function getValidationRequests(): Promise<seed.ValidationRequest[]> {
  return getStorageItem<seed.ValidationRequest[]>(KEYS.VALIDATION_REQUESTS, []);
}

export async function getValidationResponses(): Promise<seed.ValidationResponse[]> {
  return getStorageItem<seed.ValidationResponse[]>(KEYS.VALIDATION_RESPONSES, []);
}

export async function createValidationRequest(artifactId: string, createdBy: string): Promise<seed.ValidationRequest> {
  const requests = getStorageItem<seed.ValidationRequest[]>(KEYS.VALIDATION_REQUESTS, []);
  const reqId = `val-req-${Math.random().toString(36).substr(2, 9)}`;
  const token = `val-token-${Math.random().toString(36).substr(2, 9)}`;

  const newRequest: seed.ValidationRequest = {
    id: reqId,
    organization_id: seed.MOCK_ORGANIZATION.id,
    curriculum_artifact_id: artifactId,
    token,
    status: 'open',
    created_by: createdBy,
    created_at: new Date().toISOString(),
  };

  requests.push(newRequest);
  setStorageItem(KEYS.VALIDATION_REQUESTS, requests);

  await logAuditEvent('validation_request_sent', 'curriculum_artifacts', artifactId, null, { token });
  return newRequest;
}

export async function submitValidationResponse(responseData: Omit<seed.ValidationResponse, 'id' | 'submitted_at'>): Promise<seed.ValidationResponse> {
  const responses = getStorageItem<seed.ValidationResponse[]>(KEYS.VALIDATION_RESPONSES, []);
  const requests = getStorageItem<seed.ValidationRequest[]>(KEYS.VALIDATION_REQUESTS, []);
  const respId = `val-resp-${Math.random().toString(36).substr(2, 9)}`;

  const newResponse: seed.ValidationResponse = {
    ...responseData,
    id: respId,
    submitted_at: new Date().toISOString(),
  };

  responses.push(newResponse);
  setStorageItem(KEYS.VALIDATION_RESPONSES, responses);

  // Close the validation request
  const reqIdx = requests.findIndex(r => r.id === responseData.validation_request_id);
  if (reqIdx > -1) {
    requests[reqIdx].status = 'completed';
    setStorageItem(KEYS.VALIDATION_REQUESTS, requests);
  }

  await logAuditEvent('validation_response_received', 'validation_responses', respId, null, { request_id: responseData.validation_request_id });
  return newResponse;
}

// ----------------------------------------------------
// REPORTS AND COVERAGE SERVICES (No AI)
// ----------------------------------------------------
export interface CompetencyReportRow {
  competency: seed.Competency;
  evidenceCount: number;
  employerCount: number;
  contributorCount: number;
  currentCount: number;
  staleCount: number;
  artifactCount: number;
  actionCount: number;
  status: 'strong' | 'moderate' | 'gap' | 'none';
}

export async function generateCompetencyCoverageReport(freshnessMonths = 24): Promise<CompetencyReportRow[]> {
  const competencies = await getCompetencies();
  const submissions = await getSubmissions();
  const mappings = getStorageItem<any[]>(KEYS.SUBMISSION_COMPETENCIES, []);
  const contributors = getStorageItem<seed.IndustryContributor[]>(KEYS.CONTRIBUTORS, []);
  const artifacts = await getCurriculumArtifacts();
  const actions = await getCurriculumActions();

  return competencies.map(comp => {
    // Find all accepted evidence mapped to this competency
    const mappedSubIds = mappings
      .filter(m => m.competency_id === comp.id)
      .map(m => m.submission_id);

    const compSubs = submissions.filter(s => 
      mappedSubIds.includes(s.id) && 
      (s.status === 'accepted' || s.status === 'accepted_with_restrictions')
    );

    // Calculate freshness
    const now = new Date();
    let currentCount = 0;
    let staleCount = 0;

    compSubs.forEach(s => {
      const diffMonths = (now.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (diffMonths <= freshnessMonths) {
        currentCount++;
      } else {
        staleCount++;
      }
    });

    // Unique employers & contributors
    const contributorIds = Array.from(new Set(compSubs.map(s => s.contributor_id).filter(Boolean)));
    const compContrs = contributors.filter(c => contributorIds.includes(c.id));
    const partnerIds = Array.from(new Set(compContrs.map(c => c.industry_partner_id).filter(Boolean)));

    // Artifacts & actions referencing this competency
    const compArtifacts = artifacts.filter(art => art.competency_id === comp.id);
    const compActions = actions.filter(act => act.competency_id === comp.id);

    // Coverage category definition
    let status: 'strong' | 'moderate' | 'gap' | 'none' = 'none';
    if (compSubs.length === 0) {
      status = 'none';
    } else if (compSubs.length >= 5 && partnerIds.length >= 3 && currentCount >= 3) {
      status = 'strong';
    } else if (compSubs.length >= 2) {
      status = 'moderate';
    } else {
      status = 'gap';
    }

    return {
      competency: comp,
      evidenceCount: compSubs.length,
      employerCount: partnerIds.length,
      contributorCount: contributorIds.length,
      currentCount,
      staleCount,
      artifactCount: compArtifacts.length,
      actionCount: compActions.length,
      status,
    };
  });
}

export async function getFreshnessStats(freshnessMonths = 24, warningMonths = 48) {
  const submissions = await getSubmissions();
  const accepted = submissions.filter(s => s.status === 'accepted' || s.status === 'accepted_with_restrictions');
  
  let current = 0;
  let warning = 0;
  let stale = 0;

  const now = new Date();
  accepted.forEach(s => {
    const diffMonths = (now.getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths <= freshnessMonths) {
      current++;
    } else if (diffMonths <= warningMonths) {
      warning++;
    } else {
      stale++;
    }
  });

  return { current, warning, stale, total: accepted.length };
}

export async function getEmployerDiversityStats() {
  const submissions = await getSubmissions();
  const accepted = submissions.filter(s => s.status === 'accepted' || s.status === 'accepted_with_restrictions');
  const contributors = getStorageItem<seed.IndustryContributor[]>(KEYS.CONTRIBUTORS, []);
  const partners = getStorageItem<seed.IndustryPartner[]>(KEYS.PARTNERS, []);

  const countsByPartner: { [name: string]: number } = {};
  accepted.forEach(sub => {
    const contr = contributors.find(c => c.id === sub.contributor_id);
    const partner = contr ? partners.find(p => p.id === contr.industry_partner_id) : null;
    const name = partner ? partner.organization_name : 'Independent Contributor';
    countsByPartner[name] = (countsByPartner[name] || 0) + 1;
  });

  return Object.entries(countsByPartner).map(([name, count]) => ({ name, count }));
}

export async function getEvidenceGapReport() {
  const rows = await generateCompetencyCoverageReport();
  return rows.filter(r => r.status === 'gap' || r.status === 'none');
}

export async function getAuditLogs(): Promise<seed.AuditLog[]> {
  return getStorageItem<seed.AuditLog[]>(KEYS.AUDIT_LOGS, []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
