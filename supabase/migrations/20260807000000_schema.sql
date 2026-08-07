-- Database Schema for Industry Evidence Hub
-- Multi-tenant schema separated by organization_id

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Organization Settings
CREATE TABLE organization_settings (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    default_retention_policy TEXT NOT NULL DEFAULT 'permanent',
    evidence_freshness_months INT NOT NULL DEFAULT 24,
    review_warning_months INT NOT NULL DEFAULT 36,
    default_submission_permission TEXT NOT NULL DEFAULT 'internal_review',
    public_submission_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Users (linked to Supabase Auth profiles)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- references auth.users(id) in live Supabase env
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    email TEXT NOT NULL,
    title TEXT,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system_admin', 'institution_admin', 'instructional_designer', 'sme', 'faculty', 'industry_partner_manager', 'reviewer')),
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role, organization_id)
);

-- 5. Programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

-- 6. Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

-- 7. Program Courses (Junction Table)
CREATE TABLE program_courses (
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, course_id)
);

-- 8. Competencies
CREATE TABLE competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sequence INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    effective_start TIMESTAMPTZ,
    effective_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

-- 9. Course Competencies (Junction Table)
CREATE TABLE course_competencies (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, competency_id)
);

-- 10. Industry Partners
CREATE TABLE industry_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    industry_sector TEXT,
    website TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Industry Contributors
CREATE TABLE industry_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    industry_partner_id UUID REFERENCES industry_partners(id) ON DELETE SET NULL,
    first_name TEXT,
    last_name TEXT,
    job_title TEXT NOT NULL,
    department TEXT,
    email TEXT,
    phone TEXT,
    years_in_industry INT,
    contributor_type TEXT NOT NULL DEFAULT 'technician',
    allow_follow_up BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Evidence Requests
CREATE TABLE evidence_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    opens_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closes_at TIMESTAMPTZ,
    token TEXT UNIQUE NOT NULL,
    allow_anonymous BOOLEAN NOT NULL DEFAULT true,
    maximum_submissions INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Evidence Request Competencies (Junction)
CREATE TABLE evidence_request_competencies (
    evidence_request_id UUID REFERENCES evidence_requests(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (evidence_request_id, competency_id)
);

-- 14. Evidence Request Artifact Types
CREATE TABLE evidence_request_artifact_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evidence_request_id UUID REFERENCES evidence_requests(id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL
);

-- 15. Submissions (Evidence Records)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    evidence_request_id UUID REFERENCES evidence_requests(id) ON DELETE SET NULL,
    reference_id TEXT NOT NULL UNIQUE, -- e.g. DET-EV-2026-0482
    title TEXT NOT NULL,
    evidence_type TEXT NOT NULL,
    job_role TEXT NOT NULL,
    task_description TEXT NOT NULL,
    frequency TEXT NOT NULL,
    entry_level_expectation TEXT NOT NULL,
    tools_resources TEXT,
    success_description TEXT,
    common_mistakes TEXT,
    unsafe_unacceptable TEXT,
    additional_comments TEXT,
    contributor_id UUID REFERENCES industry_contributors(id) ON DELETE SET NULL,
    permission_internal_review BOOLEAN NOT NULL DEFAULT true,
    permission_curriculum_adaptation BOOLEAN NOT NULL DEFAULT false,
    permission_classroom_distribution BOOLEAN NOT NULL DEFAULT false,
    permission_public_distribution BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'needs_clarification', 'needs_sme_review', 'accepted', 'accepted_with_restrictions', 'rejected', 'archived', 'withdrawn')),
    assigned_reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Submission Artifacts (Files)
CREATE TABLE submission_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    display_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_extension TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    version_number INT NOT NULL DEFAULT 1,
    is_sanitized BOOLEAN NOT NULL DEFAULT false,
    parent_artifact_id UUID REFERENCES submission_artifacts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_type TEXT NOT NULL CHECK (review_type IN ('id_review', 'sme_review', 'faculty_review', 'permission_review', 'administrative_review')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    technical_relevance TEXT,
    authenticity_relevance TEXT,
    notes TEXT,
    recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Review Comments
CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Submission Programs (Junction)
CREATE TABLE submission_programs (
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    mapped_by UUID REFERENCES users(id) ON DELETE SET NULL,
    mapped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    PRIMARY KEY (submission_id, program_id)
);

-- 20. Submission Courses (Junction)
CREATE TABLE submission_courses (
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    mapped_by UUID REFERENCES users(id) ON DELETE SET NULL,
    mapped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    PRIMARY KEY (submission_id, course_id)
);

-- 21. Submission Competencies (Junction)
CREATE TABLE submission_competencies (
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    mapped_by UUID REFERENCES users(id) ON DELETE SET NULL,
    mapped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    relevance_rating INT,
    notes TEXT,
    PRIMARY KEY (submission_id, competency_id)
);

-- 22. Task Profiles
CREATE TABLE task_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    occupation TEXT NOT NULL,
    task_description TEXT NOT NULL,
    job_trigger TEXT,
    typical_conditions TEXT,
    available_tools TEXT,
    available_documentation TEXT,
    worker_inputs TEXT,
    expected_outputs TEXT,
    observable_performance TEXT,
    common_errors TEXT,
    critical_safety_errors TEXT,
    success_indicators TEXT,
    expected_independence TEXT,
    typical_frequency TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. Task Profile Submissions (Junction)
CREATE TABLE task_profile_submissions (
    task_profile_id UUID REFERENCES task_profiles(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    relationship_notes TEXT,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (task_profile_id, submission_id)
);

-- 24. Curriculum Artifacts
CREATE TABLE curriculum_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    artifact_type TEXT NOT NULL CHECK (artifact_type IN ('lab', 'assessment', 'mastery_assessment', 'rubric', 'instructor_guide', 'worksheet')),
    title TEXT NOT NULL,
    external_url TEXT,
    file_storage_path TEXT,
    version TEXT NOT NULL DEFAULT '1.0',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 25. Curriculum Actions
CREATE TABLE curriculum_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    competency_id UUID REFERENCES competencies(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    effective_term TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'implemented')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 26. Curriculum Action Submissions (Junction for evidence links)
CREATE TABLE curriculum_action_submissions (
    curriculum_action_id UUID REFERENCES curriculum_actions(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    evidence_role TEXT,
    notes TEXT,
    linked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (curriculum_action_id, submission_id)
);

-- 27. Curriculum Action Artifacts (Junction linking actions to labs/MAs)
CREATE TABLE curriculum_action_artifacts (
    curriculum_action_id UUID REFERENCES curriculum_actions(id) ON DELETE CASCADE,
    curriculum_artifact_id UUID REFERENCES curriculum_artifacts(id) ON DELETE CASCADE,
    PRIMARY KEY (curriculum_action_id, curriculum_artifact_id)
);

-- 28. Validation Requests
CREATE TABLE validation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    curriculum_artifact_id UUID NOT NULL REFERENCES curriculum_artifacts(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'expired'))
);

-- 29. Validation Responses
CREATE TABLE validation_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    validation_request_id UUID NOT NULL REFERENCES validation_requests(id) ON DELETE CASCADE,
    contributor_id UUID REFERENCES industry_contributors(id) ON DELETE SET NULL,
    industry_partner_id UUID REFERENCES industry_partners(id) ON DELETE SET NULL,
    encounter_rating TEXT NOT NULL, -- 'yes', 'sometimes', 'no', 'unsure'
    skill_rating TEXT NOT NULL,     -- 'yes', 'partially', 'no', 'unsure'
    resources_rating TEXT NOT NULL, -- 'yes', 'partially', 'no', 'unsure'
    independence_rating TEXT NOT NULL, -- 'yes', 'partially', 'no', 'unsure'
    preparedness_rating TEXT NOT NULL, -- 'yes', 'somewhat', 'no', 'unsure'
    unrealistic_missing_comments TEXT,
    general_comments TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 30. Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (organization_id, name)
);

-- 31. Submission Tags
CREATE TABLE submission_tags (
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    tagged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    tagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (submission_id, tag_id)
);

-- 32. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL, -- 'system', 'user', 'public'
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
