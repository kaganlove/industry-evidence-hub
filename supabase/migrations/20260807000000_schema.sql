-- Database Schema for Industry Evidence Hub
-- Aligned with the direct relation model of Next.js dbService

-- Drop tables if they exist
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS submission_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS validation_responses CASCADE;
DROP TABLE IF EXISTS validation_requests CASCADE;
DROP TABLE IF EXISTS curriculum_actions CASCADE;
DROP TABLE IF EXISTS curriculum_artifacts CASCADE;
DROP TABLE IF EXISTS submission_competencies CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS evidence_requests CASCADE;
DROP TABLE IF EXISTS industry_contributors CASCADE;
DROP TABLE IF EXISTS industry_partners CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS competencies CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. Organizations
CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Users (linked to Supabase Auth profiles)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- matches auth.uid() string
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'faculty',
    title TEXT,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Programs
CREATE TABLE programs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

-- 4. Courses
CREATE TABLE courses (
    id TEXT PRIMARY KEY,
    program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (program_id, code)
);

-- 5. Competencies
CREATE TABLE competencies (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sequence INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, code)
);

-- 6. Industry Partners
CREATE TABLE industry_partners (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    industry_sector TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Industry Contributors
CREATE TABLE industry_contributors (
    id TEXT PRIMARY KEY,
    industry_partner_id TEXT REFERENCES industry_partners(id) ON DELETE SET NULL,
    first_name TEXT,
    last_name TEXT,
    job_title TEXT,
    years_in_industry INT,
    contributor_type TEXT NOT NULL DEFAULT 'technician',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Evidence Requests (Campaigns)
CREATE TABLE evidence_requests (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    request_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    description TEXT,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Submissions (Sourced Evidence)
CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contributor_id TEXT REFERENCES industry_contributors(id) ON DELETE SET NULL,
    reference_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    evidence_type TEXT NOT NULL DEFAULT 'work_sample',
    job_role TEXT,
    task_description TEXT,
    tools_resources TEXT,
    frequency TEXT,
    entry_level_expectation TEXT,
    common_mistakes TEXT,
    unsafe_unacceptable TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    permission_internal_review BOOLEAN NOT NULL DEFAULT true,
    permission_curriculum_adaptation BOOLEAN NOT NULL DEFAULT false,
    permission_classroom_distribution BOOLEAN NOT NULL DEFAULT false,
    permission_public_distribution BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Submission-Competency Mappings (Junction)
CREATE TABLE submission_competencies (
    submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
    competency_id TEXT REFERENCES competencies(id) ON DELETE CASCADE,
    rationale TEXT,
    relevance_rating INT DEFAULT 5,
    mapped_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (submission_id, competency_id)
);

-- 11. Curriculum Artifacts
CREATE TABLE curriculum_artifacts (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    competency_id TEXT REFERENCES competencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artifact_type TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Curriculum Actions (Trace Log)
CREATE TABLE curriculum_actions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
    competency_id TEXT REFERENCES competencies(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    effective_term TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Validation Requests
CREATE TABLE validation_requests (
    id TEXT PRIMARY KEY,
    curriculum_artifact_id TEXT NOT NULL REFERENCES curriculum_artifacts(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Validation Responses
CREATE TABLE validation_responses (
    id TEXT PRIMARY KEY,
    validation_request_id TEXT NOT NULL REFERENCES validation_requests(id) ON DELETE CASCADE,
    industry_partner_id TEXT REFERENCES industry_partners(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    review_status TEXT NOT NULL DEFAULT 'completed',
    clarity_rating TEXT,
    completeness_rating TEXT,
    preparedness_rating TEXT,
    unrealistic_missing_comments TEXT,
    general_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Task Profiles
CREATE TABLE task_profiles (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    occupation TEXT,
    task_description TEXT,
    safety_precautions TEXT,
    tools_required TEXT,
    typical_duration_minutes INT,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Tags
CREATE TABLE tags (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, name)
);

-- 17. Submission Tags (Junction)
CREATE TABLE submission_tags (
    submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
    tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
    tagged_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    tagged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (submission_id, tag_id)
);

-- 18. Audit Logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
