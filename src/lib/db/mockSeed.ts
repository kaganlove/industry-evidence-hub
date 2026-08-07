// Mock Seed Data for Development and Demo
// All entities correspond to the database schema

export interface Organization {
  id: string;
  name: string;
  short_name: string;
  slug: string;
  status: string;
  created_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  title: string;
  department: string;
  status: string;
  role: 'system_admin' | 'institution_admin' | 'instructional_designer' | 'sme' | 'faculty' | 'industry_partner_manager' | 'reviewer';
}

export interface Program {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string;
  department: string;
  active: boolean;
}

export interface Course {
  id: string;
  organization_id: string;
  program_id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Competency {
  id: string;
  organization_id: string;
  code: string;
  title: string;
  description: string;
  sequence: number;
  active: boolean;
}

export interface IndustryPartner {
  id: string;
  organization_id: string;
  organization_name: string;
  industry_sector: string;
  website?: string;
  city: string;
  state: string;
  country: string;
  notes?: string;
  active: boolean;
}

export interface IndustryContributor {
  id: string;
  organization_id: string;
  industry_partner_id: string;
  first_name?: string;
  last_name?: string;
  job_title: string;
  department?: string;
  email?: string;
  phone?: string;
  years_in_industry?: number;
  contributor_type: string;
  allow_follow_up: boolean;
}

export interface EvidenceRequest {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  purpose?: string;
  program_id?: string;
  course_id?: string;
  status: 'draft' | 'open' | 'closed';
  created_by: string;
  token: string;
  allow_anonymous: boolean;
  maximum_submissions?: number;
  created_at: string;
}

export interface Submission {
  id: string;
  organization_id: string;
  evidence_request_id?: string;
  reference_id: string; // e.g. DET-EV-2026-0482
  title: string;
  evidence_type: string; // work_order, inspection_sheet, schematic, tech_notes, photo, video, error_record
  job_role: string;
  task_description: string;
  frequency: string;
  entry_level_expectation: string;
  tools_resources?: string;
  success_description?: string;
  common_mistakes?: string;
  unsafe_unacceptable?: string;
  additional_comments?: string;
  contributor_id?: string;
  permission_internal_review: boolean;
  permission_curriculum_adaptation: boolean;
  permission_classroom_distribution: boolean;
  permission_public_distribution: boolean;
  status: 'new' | 'in_review' | 'needs_clarification' | 'needs_sme_review' | 'accepted' | 'accepted_with_restrictions' | 'rejected' | 'archived' | 'withdrawn';
  assigned_reviewer_id?: string;
  created_at: string;
  updated_at: string;
  attachments?: {
    id: string;
    original_filename: string;
    display_filename: string;
    mime_type: string;
    file_extension: string;
    storage_path: string;
    file_size: number;
  }[];
}

export interface TaskProfile {
  id: string;
  organization_id: string;
  title: string;
  occupation: string;
  task_description: string;
  job_trigger?: string;
  typical_conditions?: string;
  available_tools?: string;
  available_documentation?: string;
  worker_inputs?: string;
  expected_outputs?: string;
  observable_performance?: string;
  common_errors?: string;
  critical_safety_errors?: string;
  success_indicators?: string;
  expected_independence?: string;
  typical_frequency?: string;
  notes?: string;
  created_by: string;
  status: string;
  created_at: string;
}

export interface CurriculumArtifact {
  id: string;
  organization_id: string;
  course_id?: string;
  competency_id?: string;
  artifact_type: 'lab' | 'assessment' | 'mastery_assessment' | 'rubric' | 'instructor_guide' | 'worksheet';
  title: string;
  external_url?: string;
  file_storage_path?: string;
  version: string;
  status: string;
  created_at: string;
}

export interface CurriculumAction {
  id: string;
  organization_id: string;
  program_id: string;
  course_id?: string;
  competency_id?: string;
  action_type: string;
  title: string;
  description: string;
  rationale: string;
  effective_term?: string;
  status: 'draft' | 'approved' | 'implemented';
  created_by: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  supporting_evidence_ids: string[]; // submission references or IDs
  linked_artifact_ids: string[]; // curriculum artifact IDs
}

export interface ValidationRequest {
  id: string;
  organization_id: string;
  curriculum_artifact_id: string;
  token: string;
  status: 'open' | 'completed' | 'expired';
  created_by: string;
  created_at: string;
}

export interface ValidationResponse {
  id: string;
  validation_request_id: string;
  contributor_id?: string;
  industry_partner_id?: string;
  encounter_rating: string;
  skill_rating: string;
  resources_rating: string;
  independence_rating: string;
  preparedness_rating: string;
  unrealistic_missing_comments?: string;
  general_comments?: string;
  submitted_at: string;
}

export interface Tag {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string;
  actor_type: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  created_at: string;
}

// ----------------------------------------------------
// SEED INSTANCES (Fictional Demo Data)
// ----------------------------------------------------

export const MOCK_ORGANIZATION: Organization = {
  id: 'org-demo-dtc',
  name: 'Demo Technical College',
  short_name: 'DTC',
  slug: 'demo-tech',
  status: 'active',
  created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
};

export const MOCK_USERS: User[] = [
  {
    id: 'usr-admin',
    organization_id: 'org-demo-dtc',
    first_name: 'Alice',
    last_name: 'Vance',
    display_name: 'Alice Vance (Admin)',
    email: 'admin@demo-tech.edu',
    title: 'Dean of Workforce Education',
    department: 'Administration',
    status: 'active',
    role: 'institution_admin',
  },
  {
    id: 'usr-id',
    organization_id: 'org-demo-dtc',
    first_name: 'Clara',
    last_name: 'Barton',
    display_name: 'Clara Barton (ID)',
    email: 'id@demo-tech.edu',
    title: 'Senior Lead Instructional Designer',
    department: 'Instructional Design Dept',
    status: 'active',
    role: 'instructional_designer',
  },
  {
    id: 'usr-sme',
    organization_id: 'org-demo-dtc',
    first_name: 'Marcus',
    last_name: 'Aurelius',
    display_name: 'Marcus Aurelius (SME)',
    email: 'sme@demo-tech.edu',
    title: 'Diesel Systems Subject Matter Expert',
    department: 'Heavy Equipment Department',
    status: 'active',
    role: 'sme',
  },
  {
    id: 'usr-faculty',
    organization_id: 'org-demo-dtc',
    first_name: 'Robert',
    last_name: 'Diesel',
    display_name: 'Robert Diesel (Instructor)',
    email: 'faculty@demo-tech.edu',
    title: 'Lead Diesel Instructor',
    department: 'Transportation Division',
    status: 'active',
    role: 'faculty',
  },
];

export const MOCK_PROGRAMS: Program[] = [
  {
    id: 'prg-det',
    organization_id: 'org-demo-dtc',
    code: 'DET',
    name: 'Diesel Equipment Technology',
    description: 'Fictional demo program preparing students to service, troubleshoot, and repair heavy machinery, diesel trucks, and mobile hydraulic equipment.',
    department: 'Transportation Technology',
    active: true,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'crs-ids',
    organization_id: 'org-demo-dtc',
    program_id: 'prg-det',
    code: 'DET-101',
    name: 'Introduction to Diesel Systems',
    description: 'Fundamental principles of heavy diesel engines, workspace safety, tooling, basic electrical circuits, and preventative maintenance inspections.',
    active: true,
  },
  {
    id: 'crs-hs',
    organization_id: 'org-demo-dtc',
    program_id: 'prg-det',
    code: 'DET-140',
    name: 'Hydraulic Systems',
    description: 'Study of mobile fluid power systems, fluid properties, pumps, actuators, valves, schematics, and hands-on pressure and flow diagnostics.',
    active: true,
  },
  {
    id: 'crs-ad',
    organization_id: 'org-demo-dtc',
    program_id: 'prg-det',
    code: 'DET-220',
    name: 'Advanced Diagnostics',
    description: 'System-level troubleshooting including electronic engines, CAN-bus communication diagnostics, and complex hydrostatic power transmission systems.',
    active: true,
  },
];

export const MOCK_COMPETENCIES: Competency[] = [
  {
    id: 'comp-cc11',
    organization_id: 'org-demo-dtc',
    code: 'CC1.1',
    title: 'Perform required safety procedures',
    description: 'Correctly implement shop safety precautions, including wearing proper PPE, utilizing high-pressure fluid safety practices, and establishing proper lockout/tagout operations on mobile heavy machinery.',
    sequence: 1,
    active: true,
  },
  {
    id: 'comp-cc21',
    organization_id: 'org-demo-dtc',
    code: 'CC2.1',
    title: 'Interpret technical service information and system schematics',
    description: 'Locate, interpret, and apply manufacturer service manuals, electrical schematics, and hydraulic circuit diagrams to correctly trace pressure, flow, and electronic control signals.',
    sequence: 2,
    active: true,
  },
  {
    id: 'comp-cc31',
    organization_id: 'org-demo-dtc',
    code: 'CC3.1',
    title: 'Identify, diagnose, and repair hydrostatic drive systems',
    description: 'Perform advanced diagnostics on closed-loop hydrostatic drives, including charge-pressure tests, main pump output evaluations, and system flushing after catastrophic wear occurrences.',
    sequence: 3,
    active: true,
  },
  {
    id: 'comp-cc41',
    organization_id: 'org-demo-dtc',
    code: 'CC4.1',
    title: 'Identify, diagnose, and repair hydraulic systems',
    description: 'Diagnose malfunctions in open-loop mobile hydraulic circuits containing pilot control valves, load-sensing pumps, directional controls, and pressure-compensating components.',
    sequence: 4,
    active: true,
  },
];

// Relationships between Course and Competency (represented as arrays in memory DB)
export const MOCK_COURSE_COMPETENCY_MAPPINGS = [
  { course_id: 'crs-ids', competency_id: 'comp-cc11' },
  { course_id: 'crs-ids', competency_id: 'comp-cc21' },
  { course_id: 'crs-hs', competency_id: 'comp-cc21' },
  { course_id: 'crs-hs', competency_id: 'comp-cc41' },
  { course_id: 'crs-ad', competency_id: 'comp-comp-cc31' },
  { course_id: 'crs-ad', competency_id: 'comp-cc41' },
];

export const MOCK_INDUSTRY_PARTNERS: IndustryPartner[] = [
  {
    id: 'partner-titan',
    organization_id: 'org-demo-dtc',
    organization_name: 'Titan Heavy Machinery Inc.',
    industry_sector: 'Heavy Machinery & Earthmoving Sales/Service',
    website: 'https://fictional-titan-machinery.com',
    city: 'Fargo',
    state: 'ND',
    country: 'USA',
    notes: 'Primary regional dealer for heavy excavation and forestry equipment. Actively hires 4-6 graduates annually.',
    active: true,
  },
  {
    id: 'partner-metro',
    organization_id: 'org-demo-dtc',
    organization_name: 'Metro Public Transit Authority',
    industry_sector: 'Municipal Transit Systems',
    website: 'https://fictional-metro-transit.gov',
    city: 'Minneapolis',
    state: 'MN',
    country: 'USA',
    notes: 'Public agency managing urban bus fleets. Strong interest in CAN-bus wiring troubleshooting and safety compliance.',
    active: true,
  },
  {
    id: 'partner-apex',
    organization_id: 'org-demo-dtc',
    organization_name: 'Apex Hydraulics Corp.',
    industry_sector: 'Industrial Hydraulic System Engineering & Rebuilding',
    website: 'https://fictional-apex-hydraulics.com',
    city: 'Duluth',
    state: 'MN',
    country: 'USA',
    notes: 'Specialist workshop focusing on rebuilding heavy pistons, high-pressure pumps, and custom valving.',
    active: true,
  },
];

export const MOCK_CONTRIBUTORS: IndustryContributor[] = [
  {
    id: 'contr-john',
    organization_id: 'org-demo-dtc',
    industry_partner_id: 'partner-titan',
    first_name: 'John',
    last_name: 'Miller',
    job_title: 'Heavy Equipment Service Manager',
    department: 'Maintenance and Overhaul Shop',
    email: 'john.miller@fictional-titan.com',
    phone: '555-019-2834',
    years_in_industry: 18,
    contributor_type: 'supervisor',
    allow_follow_up: true,
  },
  {
    id: 'contr-sarah',
    organization_id: 'org-demo-dtc',
    industry_partner_id: 'partner-metro',
    first_name: 'Sarah',
    last_name: 'Vance',
    job_title: 'Lead Fleet Diagnostic Specialist',
    department: 'Electrical Division',
    email: 's.vance@fictional-metro-transit.org',
    phone: '555-014-9988',
    years_in_industry: 12,
    contributor_type: 'technician',
    allow_follow_up: true,
  },
  {
    id: 'contr-dave',
    organization_id: 'org-demo-dtc',
    industry_partner_id: 'partner-apex',
    first_name: 'Dave',
    last_name: 'Kroll',
    job_title: 'Owner and Lead Rebuild Engineer',
    department: 'Rebuild Workshop',
    email: 'dave@fictional-apex-hyd.com',
    phone: '555-012-4411',
    years_in_industry: 25,
    contributor_type: 'executive',
    allow_follow_up: false,
  },
];

export const MOCK_EVIDENCE_REQUESTS: EvidenceRequest[] = [
  {
    id: 'req-hydraulic-diag',
    organization_id: 'org-demo-dtc',
    title: 'Hydraulic Diagnostic Evidence Seeking',
    description: 'We are seeking actual diagnostic forms, service log sheets, or descriptions of loader boom failures and pilot control faults where technicians must isolate flow issues rather than replacing parts randomly.',
    purpose: 'Updating the mastery assessment for course DET-140 to require custom diagnostic testing checklists.',
    program_id: 'prg-det',
    course_id: 'crs-hs',
    status: 'open',
    created_by: 'usr-id',
    token: 'req-token-hydraulic-diag',
    allow_anonymous: true,
    created_at: new Date('2026-03-10T09:00:00Z').toISOString(),
  },
  {
    id: 'req-newhire-problems',
    organization_id: 'org-demo-dtc',
    title: 'New-Hire Performance & Safety Struggles',
    description: 'Please share examples of common mistakes new technicians make during their first 90 days, especially regarding electrical meter settings or hydraulic high-pressure fluid safety checks.',
    purpose: 'Revising lab safety guidelines and lockout checklists across the program.',
    program_id: 'prg-det',
    status: 'open',
    created_by: 'usr-id',
    token: 'req-token-newhire-problems',
    allow_anonymous: true,
    created_at: new Date('2026-04-01T10:30:00Z').toISOString(),
  },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-ev-01',
    organization_id: 'org-demo-dtc',
    evidence_request_id: 'req-hydraulic-diag',
    reference_id: 'DET-EV-2026-0482',
    title: 'Loader Boom Lift Power Loss at Operating Temp',
    evidence_type: 'failure_report',
    job_role: 'Heavy Equipment Technician',
    task_description: 'Loader boom loses lifting force gradually after operating for 30 minutes. Customer reports lift speed drops from 5 seconds to 15 seconds under full load when hydraulic oil reaches 180°F.',
    frequency: 'weekly',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Analog pressure gauges (0-5000 PSI), flow meter, manufacturer specifications manual, infrared temperature gun.',
    success_description: 'Technician measures cylinder bypass flow and relief valve dump pressure. Correctly identifies a blown spool-to-body clearance limit in the control valve rather than condemning the main gear pump.',
    common_mistakes: 'Apprentices frequently assume a failed pump or cylinder seals first, resulting in expensive, unnecessary component swaps without checking pressure relief valve integrity or system temperature variables.',
    unsafe_unacceptable: 'Uncoupling hydraulic cylinders while under suspended load, or overriding mechanical control linkages to force movement.',
    additional_comments: 'This happens often on older loaders. Understanding spool-to-bore clearance leakage behavior at high heat is critical.',
    contributor_id: 'contr-john',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-05-12T14:22:00Z').toISOString(),
    updated_at: new Date('2026-05-15T10:00:00Z').toISOString(),
    attachments: [
      {
        id: 'att-01',
        original_filename: 'fictional_loader_flow_leak_test.pdf',
        display_filename: 'Loader Bypass Leak Test Datasheet',
        mime_type: 'application/pdf',
        file_extension: 'pdf',
        storage_path: 'org-demo-dtc/submissions/fictional_loader_flow_leak_test.pdf',
        file_size: 1450000,
      },
    ],
  },
  {
    id: 'sub-ev-02',
    organization_id: 'org-demo-dtc',
    evidence_request_id: 'req-newhire-problems',
    reference_id: 'DET-EV-2026-0491',
    title: 'Apprentice Multimeter Setting Error causing Fusible Link Failure',
    evidence_type: 'error_record',
    job_role: 'Apprentice Fleet Technician',
    task_description: 'Diagnosing an engine crank circuit failure on a city transit bus. Apprentice attempted to check voltage across starter contacts using an ammeter setting instead of voltmeter setting.',
    frequency: 'monthly',
    entry_level_expectation: 'yes_direct_supervision',
    tools_resources: 'Fluke 87V Digital Multimeter, bus wiring schematic.',
    success_description: 'Set meter correctly to DC voltage, confirm proper ground line reference, trace battery voltage to ignition relay switch pins.',
    common_mistakes: 'New-hires regularly plug leads into the 10A current port and try to measure voltage, creating a short circuit path that blows the internal meter fuse or destroys thin vehicle wiring links.',
    unsafe_unacceptable: 'Creating short-circuits in high-amperage starting loops. Fire hazard.',
    additional_comments: 'They know how to read a voltmeter theoretically, but fail to check their plug ports when switching tasks in a rush under a bus.',
    contributor_id: 'contr-sarah',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-05-18T08:45:00Z').toISOString(),
    updated_at: new Date('2026-05-20T11:30:00Z').toISOString(),
  },
  {
    id: 'sub-ev-03',
    organization_id: 'org-demo-dtc',
    evidence_request_id: 'req-newhire-problems',
    reference_id: 'DET-EV-2026-0497',
    title: 'Accumulator Pressure Discharge Neglect',
    evidence_type: 'error_record',
    job_role: 'Shop Technician',
    task_description: 'Performing maintenance on a pilot-operated hydraulic system. Technician attempted to replace a solenoid control block without bleeding down the stored accumulator pressure.',
    frequency: 'rare_but_important',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Accummulator safety discharge tool, lock-out tags.',
    success_description: 'Fully dump pilot accumulator pressure by cycling auxiliary controls 20 times with engine off, and confirming line gauge reads 0 PSI before breaking any seals.',
    common_mistakes: 'New workers assume that once the diesel engine is shut down, the hydraulic circuit is completely safe. They neglect stored potential energy in bladder accumulators.',
    unsafe_unacceptable: 'Opening high-pressure fittings containing up to 3000 PSI stored fluid. Can cause severe skin puncture injections.',
    additional_comments: 'This is a critical safety item. Failure is immediate grounds for dismissal.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: false,
    permission_public_distribution: false,
    status: 'accepted_with_restrictions',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-06-01T15:10:00Z').toISOString(),
    updated_at: new Date('2026-06-03T16:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-04',
    organization_id: 'org-demo-dtc',
    evidence_request_id: 'req-hydraulic-diag',
    reference_id: 'DET-EV-2026-0505',
    title: 'Incorrect Pump Flow Path Setup During Flow Meter Install',
    evidence_type: 'failure_report',
    job_role: 'Hydraulic System Rebuild Apprentice',
    task_description: 'Plumbing a hydraulic flow meter into a load-sensing pump outlet. Contributor observed an apprentice block the external pilot drain line, causing the internal pump housing gasket to rupture.',
    frequency: 'rare_but_important',
    entry_level_expectation: 'usually_additional_experience',
    tools_resources: 'Wrenches, block plugs, flow testing manifolds.',
    success_description: 'Ensuring pilot lines and internal leak drain ports always connect back directly to the tank before system startup.',
    common_mistakes: 'Plugging drain lines by confusing them with main pressure ports on complex axial piston pumps.',
    unsafe_unacceptable: 'Over-pressurizing pump housings, causing structural casting failure or catastrophic metal rupture.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-06-10T11:00:00Z').toISOString(),
    updated_at: new Date('2026-06-12T09:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-05',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0005',
    title: 'John Deere 850K Dozer 500-Hour PM checklist',
    evidence_type: 'inspection_sheet',
    job_role: 'PM Lube Technician',
    task_description: 'Perform standard 500-hour machine maintenance including final drive oil analysis sampling, cabin filter swap, fuel water separator service, and main circuit relief pressure checks.',
    frequency: 'daily',
    entry_level_expectation: 'yes_independently',
    tools_resources: 'Fluid pump, oil sample vials, filter wrenches, standard tool chest.',
    success_description: 'Complete all steps on the checklist, collect uncontaminated oil samples, and record exact serial numbers and engine hours.',
    common_mistakes: 'Neglecting to clean the sample valve before drawing oil, which contaminates the sample and shows fake high metal wear counts in lab results.',
    unsafe_unacceptable: 'Drawing hot fluids without safety gloves or climbing on tracks without utilizing 3-point contact principles.',
    contributor_id: 'contr-john',
    permission_internal_review: true,
    permission_curriculum_adaptation: false,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-02-14T08:00:00Z').toISOString(),
    updated_at: new Date('2026-02-16T14:00:00Z').toISOString(),
    attachments: [
      {
        id: 'att-02',
        original_filename: 'fictional_dozer_500hr_pm.xlsx',
        display_filename: 'JD850K Dozer PM Inspection Sheet',
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        file_extension: 'xlsx',
        storage_path: 'org-demo-dtc/submissions/fictional_dozer_500hr_pm.xlsx',
        file_size: 89000,
      },
    ],
  },
  {
    id: 'sub-ev-06',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0006',
    title: 'Standard Operating Procedure (SOP) for Hydraulic Cylinder Disassembly',
    evidence_type: 'procedure',
    job_role: 'Component Rebuild Technician',
    task_description: 'Disassembling heavy double-acting hydraulic cylinders to inspect rod straightness and replace damaged gland seals.',
    frequency: 'daily',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Hydraulic cylinder disassembly bench, spanner wrenches, dial indicators.',
    success_description: 'Unthread gland collar without damaging rod surface, extract rod smoothly, utilize plastic scraper tools to remove seals, inspect barrel inner walls for scoring.',
    common_mistakes: 'Using metal screwdrivers to pry rubber seals out of the piston groove, scratching the brass backing seats and creating permanent bypass leak paths.',
    unsafe_unacceptable: 'Using impact hammers directly on rod chrome surfaces.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-03-20T10:00:00Z').toISOString(),
    updated_at: new Date('2026-03-22T08:30:00Z').toISOString(),
  },
  {
    id: 'sub-ev-07',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0007',
    title: 'Intermittent J1939 CAN-Bus Bus Fleet Starting Circuit Failure',
    evidence_type: 'diagnostic_request',
    job_role: 'Lead Electrical Technician',
    task_description: 'Transit bus occasionally refuses to crank and throws multiple fault codes indicating loss of communication with the Transmission Control Module (TCM).',
    frequency: 'occasionally',
    entry_level_expectation: 'not_typically_entry_level',
    tools_resources: 'CAN breakdown box, digital storage oscilloscope, laptop with diagnostics software.',
    success_description: 'Measures bus resistance across pins 6 and 14 to check terminating resistors (expected 60 ohms), locates wiring harness chafe point behind transmission bracket.',
    common_mistakes: 'Replacing the TCM immediately (costing $2500) without measuring harness circuit integrity or terminal block connections first.',
    unsafe_unacceptable: 'Overriding vehicle interlock lines to force vehicle cranking.',
    contributor_id: 'contr-sarah',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-04-12T13:40:00Z').toISOString(),
    updated_at: new Date('2026-04-15T09:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-08',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0008',
    title: 'Incorrect Hydraulic Hose Routing on Excavator Swing Motor',
    evidence_type: 'failure_report',
    job_role: 'Heavy Machinery Assembly Mechanic',
    task_description: 'Routing replacement high-pressure hydraulic hoses through the articulating joint frame of a crawler excavator.',
    frequency: 'weekly',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Hose sleeves, protective spiral wrap, mounting clamps.',
    success_description: 'Install hoses with correct bend radii, ensuring no abrasion contacts on metal edges during boom articulation.',
    common_mistakes: 'Routing hoses too tight with zero slack, causing them to pull out of fittings when the cylinder expands, or neglecting friction protection pads.',
    unsafe_unacceptable: 'Allowing pressure lines to rub against sharp battery frames or engine blocks.',
    contributor_id: 'contr-john',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-04-28T09:15:00Z').toISOString(),
    updated_at: new Date('2026-05-02T10:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-09',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0009',
    title: 'High-Pressure Common Rail Diesel Engine Diagnostic Log',
    evidence_type: 'tech_notes',
    job_role: 'Diesel Engine Technician',
    task_description: 'A Detroit DD15 engine exhibits a hard start/no start complaint. Technician must verify whether fuel rail pressure meets the minimum threshold to enable injector firing.',
    frequency: 'daily',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Electronic diagnostic link, fuel pressure gauge blocks.',
    success_description: 'Monitors fuel pressure parameter during cranking (expects > 4350 PSI), isolates issues to pump solenoid command circuit or excessive injector leak-back.',
    common_mistakes: 'Spraying starting fluid into intake manifold to force engine startup, which creates extreme piston compression spikes and causes block fractures.',
    unsafe_unacceptable: 'Loosening high-pressure fuel rail fittings (at > 30,000 PSI) while the engine is cranking to check for fuel flow.',
    contributor_id: 'contr-john',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-05-05T16:20:00Z').toISOString(),
    updated_at: new Date('2026-05-08T11:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-10',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0010',
    title: 'Hydraulic Schematic Symbol Misinterpretation on Load Sensing Valves',
    evidence_type: 'error_record',
    job_role: 'Apprentice Hydraulic Repairer',
    task_description: 'Trace pilot circuit pressure supply through a load-sensing steering valve using standard hydraulic schematic layout page.',
    frequency: 'monthly',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Paper schematic, color highlighters.',
    success_description: 'Correctly identify dynamic load-sensing feedback orifice paths and distinguish pilot pressure feeds from internal return tank paths.',
    common_mistakes: 'Confusing load-signal line (dotted/dashed) with pilot lines or drain lines, leading to incorrect pressure gauge tapping points and inaccurate diagnostics.',
    unsafe_unacceptable: 'Unsure.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-05-22T10:12:00Z').toISOString(),
    updated_at: new Date('2026-05-25T08:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-11',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0011',
    title: 'Diagnostic Checksheet: Hydrostatic Pump Neutral Charge Slippage',
    evidence_type: 'inspection_sheet',
    job_role: 'Hydrostatic Shop Technician',
    task_description: 'Test a Sauer-Danfoss 90-Series hydrostatic pump for internal charge pump slippage and verify neutral bypass valve adjustment limits.',
    frequency: 'occasionally',
    entry_level_expectation: 'not_typically_entry_level',
    tools_resources: 'Charge pressure test gauges, temperature probes, tachometer.',
    success_description: 'Validate neutral charge pressure limits (320 PSI at 1500 RPM) and perform manual mechanical controls centering.',
    common_mistakes: 'Adjusting displacement settings without checking charge system pressure first. This burns out internal pump rotating groups within seconds.',
    unsafe_unacceptable: 'Overriding system mechanical relief valves.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: false,
    permission_classroom_distribution: false,
    permission_public_distribution: false,
    status: 'accepted_with_restrictions',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-06-05T13:00:00Z').toISOString(),
    updated_at: new Date('2026-06-08T10:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-12',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0012',
    title: 'Detroit Diesel Injector Wiring Harness Oil Intrusion',
    evidence_type: 'tech_notes',
    job_role: 'Fleet Diagnostic Specialist',
    task_description: 'Bus engine develops a rough running complaint under full load with intermittent single-cylinder misfire faults.',
    frequency: 'weekly',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Diagnostic link software, digital ohmmeter.',
    success_description: 'Unplug under-valve-cover engine harness, check electrical pins for engine oil contamination which bypasses impedance parameters.',
    common_mistakes: 'Condemning high-cost fuel injectors without cleaning/testing internal electrical plugs and checking harness continuity.',
    unsafe_unacceptable: 'Unsure.',
    contributor_id: 'contr-sarah',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-06-18T14:50:00Z').toISOString(),
    updated_at: new Date('2026-06-20T11:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-13',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0013',
    title: 'Hydraulic Motor Shaft Seal Blowout from Restricted Tank Return Line',
    evidence_type: 'failure_report',
    job_role: 'Hydraulic Repair Tech',
    task_description: 'A replacement hydraulic motor shaft seal blew out immediately upon starting the machine circuit.',
    frequency: 'rare_but_important',
    entry_level_expectation: 'yes_limited_supervision',
    tools_resources: 'Pressure gauges, replacement seals, micrometer.',
    success_description: 'Examine return path to reservoir. Locate crushed return tube causing extreme backpressure exceeding seal limits (100 PSI max).',
    common_mistakes: 'Replacing the shaft seal multiple times, assuming defective seal parts, without measuring downstream return line flow path pressure.',
    unsafe_unacceptable: 'Operating hydraulic pumps with closed system gate valves.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: false,
    status: 'accepted',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-07-02T10:00:00Z').toISOString(),
    updated_at: new Date('2026-07-05T09:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-14',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0014',
    title: 'Wrong Hydraulic Oil Viscosity Refill causing Pilot Control Sticking',
    evidence_type: 'error_record',
    job_role: 'Lube Facility Worker',
    task_description: 'Excavator controls became extremely slow and sticky in cold winter temperatures (-5°F) after a system fluid change.',
    frequency: 'monthly',
    entry_level_expectation: 'yes_independently',
    tools_resources: 'Refill manual, storage drum labels.',
    success_description: 'Verify machinery specification book. Refill with ISO 32 Low Temp fluid rather than standard summer weight ISO 68 fluid.',
    common_mistakes: 'Assuming all hydraulic fluids are identical. Pouring high-viscosity oil into close-tolerance pilot controls in cold regions.',
    unsafe_unacceptable: 'Ignoring fluid safety sheets and pouring toxic waste fluids.',
    contributor_id: 'contr-john',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: false,
    permission_public_distribution: false,
    status: 'accepted_with_restrictions',
    assigned_reviewer_id: 'usr-id',
    created_at: new Date('2026-07-15T08:30:00Z').toISOString(),
    updated_at: new Date('2026-07-17T14:00:00Z').toISOString(),
  },
  {
    id: 'sub-ev-15',
    organization_id: 'org-demo-dtc',
    reference_id: 'DET-EV-2026-0015',
    title: 'Excavator Hydraulic Control Valve Bank schematic',
    evidence_type: 'schematic',
    job_role: 'Diagnostic Engineer',
    task_description: 'System documentation of fictional crawler crane pilot valve connections, flow orifices, and solenoid triggers.',
    frequency: 'occasionally',
    entry_level_expectation: 'not_typically_entry_level',
    tools_resources: 'Schematic drawings, circuit design specifications.',
    success_description: 'Trace spool movement command ports and relief safety check orifices accurately.',
    common_mistakes: 'Mismating pressure feed lines on valve blocks during installation.',
    unsafe_unacceptable: 'Modifying port sizing without engineering authorization.',
    contributor_id: 'contr-dave',
    permission_internal_review: true,
    permission_curriculum_adaptation: true,
    permission_classroom_distribution: true,
    permission_public_distribution: true,
    status: 'accepted',
    assigned_reviewer_id: 'usr-sme',
    created_at: new Date('2026-07-20T11:00:00Z').toISOString(),
    updated_at: new Date('2026-07-22T10:00:00Z').toISOString(),
  },
];

// Mapping submissions to competencies (represented as simple records)
export const MOCK_SUBMISSION_COMPETENCY_MAPPINGS = [
  { submission_id: 'sub-ev-01', competency_id: 'comp-cc41', relevance_rating: 5, notes: 'Direct evidence of technician diagnostic behavior on pilot systems.' },
  { submission_id: 'sub-ev-02', competency_id: 'comp-cc11', relevance_rating: 4, notes: 'Safety and tool verification behavior.' },
  { submission_id: 'sub-ev-03', competency_id: 'comp-cc11', relevance_rating: 5, notes: 'High-pressure accumulator discharge safety.' },
  { submission_id: 'sub-ev-04', competency_id: 'comp-cc41', relevance_rating: 4, notes: 'Open-loop pump installation constraints.' },
  { submission_id: 'sub-ev-05', competency_id: 'comp-cc11', relevance_rating: 3, notes: 'PM standard procedures.' },
  { submission_id: 'sub-ev-06', competency_id: 'comp-cc41', relevance_rating: 4, notes: 'Cylinder repair guidelines.' },
  { submission_id: 'sub-ev-07', competency_id: 'comp-cc21', relevance_rating: 5, notes: 'Tracing CAN circuits using schematics.' },
  { submission_id: 'sub-ev-08', competency_id: 'comp-cc41', relevance_rating: 3, notes: 'Hose mechanical installations.' },
  { submission_id: 'sub-ev-09', competency_id: 'comp-cc21', relevance_rating: 4, notes: 'Using specifications to troubleshoot starting pressures.' },
  { submission_id: 'sub-ev-10', competency_id: 'comp-cc21', relevance_rating: 5, notes: 'Schematic flow path tracing errors.' },
  { submission_id: 'sub-ev-11', competency_id: 'comp-cc31', relevance_rating: 5, notes: 'Hydrostatic pump charge pressures.' },
  { submission_id: 'sub-ev-12', competency_id: 'comp-cc21', relevance_rating: 3, notes: 'Reading engine terminal outputs.' },
  { submission_id: 'sub-ev-13', competency_id: 'comp-cc41', relevance_rating: 5, notes: 'Diagnosing return line obstructions.' },
  { submission_id: 'sub-ev-14', competency_id: 'comp-cc11', relevance_rating: 3, notes: 'Using correct fluids.' },
  { submission_id: 'sub-ev-15', competency_id: 'comp-cc21', relevance_rating: 5, notes: 'Schematic diagrams.' }
];

export const MOCK_CURRICULUM_ARTIFACTS: CurriculumArtifact[] = [
  {
    id: 'art-lab1',
    organization_id: 'org-demo-dtc',
    course_id: 'crs-hs',
    competency_id: 'comp-cc41',
    artifact_type: 'lab',
    title: 'Mobile Loader Boom Lift Valve Diagnostic Lab',
    external_url: 'https://fictional-lms.demo-tech.edu/courses/det140/labs/boom-lift',
    version: '1.2',
    status: 'active',
    created_at: new Date('2026-02-01T09:00:00Z').toISOString(),
  },
  {
    id: 'art-ma1',
    organization_id: 'org-demo-dtc',
    course_id: 'crs-hs',
    competency_id: 'comp-cc41',
    artifact_type: 'mastery_assessment',
    title: 'Hydraulic System Troubleshooting Mastery Assessment',
    external_url: 'https://fictional-lms.demo-tech.edu/courses/det140/assessments/hydraulic-ma',
    version: '2026.1',
    status: 'active',
    created_at: new Date('2026-02-10T10:00:00Z').toISOString(),
  },
];

export const MOCK_CURRICULUM_ACTIONS: CurriculumAction[] = [
  {
    id: 'act-01',
    organization_id: 'org-demo-dtc',
    program_id: 'prg-det',
    course_id: 'crs-hs',
    competency_id: 'comp-cc41',
    action_type: 'mastery_assessment_revised',
    title: 'Revised Hydraulic System Troubleshooting Mastery Assessment',
    description: 'Removed the step-by-step diagnostic guide from the exam prompt. Students are now given the system complaint (e.g. loader loses lift power when hot) and must choose where to tap gauges and construct their own pressure log checklist.',
    rationale: 'Fictional evidence from industry partners (DET-EV-2026-0482, DET-EV-2026-0505) notes that new graduates struggle to select pressure tap points independently and rely too much on pre-formulated sequences.',
    effective_term: 'Fall 2026',
    status: 'implemented',
    created_by: 'usr-id',
    created_at: new Date('2026-06-15T09:00:00Z').toISOString(),
    approved_by: 'usr-admin',
    approved_at: new Date('2026-06-16T14:00:00Z').toISOString(),
    supporting_evidence_ids: ['sub-ev-01', 'sub-ev-04'],
    linked_artifact_ids: ['art-ma1'],
  },
];

export const MOCK_VALIDATION_REQUESTS: ValidationRequest[] = [
  {
    id: 'val-req-01',
    organization_id: 'org-demo-dtc',
    curriculum_artifact_id: 'art-ma1',
    token: 'val-token-hydraulic-ma',
    status: 'completed',
    created_by: 'usr-id',
    created_at: new Date('2026-06-20T08:00:00Z').toISOString(),
  },
];

export const MOCK_VALIDATION_RESPONSES: ValidationResponse[] = [
  {
    id: 'val-resp-01',
    validation_request_id: 'val-req-01',
    contributor_id: 'contr-john',
    industry_partner_id: 'partner-titan',
    encounter_rating: 'yes',
    skill_rating: 'yes',
    resources_rating: 'yes',
    independence_rating: 'yes',
    preparedness_rating: 'yes',
    unrealistic_missing_comments: 'No, this is highly realistic. Evaluating if they can pick their own test points will save us hours of service supervisor handholding.',
    general_comments: 'Fully support this change. It forces students to think critically about system schematics instead of just clicking next.',
    submitted_at: new Date('2026-06-25T11:30:00Z').toISOString(),
  },
];

export const MOCK_TAGS: Tag[] = [
  { id: 'tag-hydraulics', organization_id: 'org-demo-dtc', name: 'hydraulics', description: 'Fluid power systems and components', active: true },
  { id: 'tag-diagnostics', organization_id: 'org-demo-dtc', name: 'diagnostics', description: 'Troubleshooting and isolation tasks', active: true },
  { id: 'tag-safety', organization_id: 'org-demo-dtc', name: 'safety', description: 'Workspace safety compliance and checks', active: true },
  { id: 'tag-new-hire-error', organization_id: 'org-demo-dtc', name: 'new-hire-error', description: 'Common errors made by fresh graduates', active: true },
  { id: 'tag-schematics', organization_id: 'org-demo-dtc', name: 'schematics', description: 'Circuit diagrams and drawings', active: true },
];

export const MOCK_SUBMISSION_TAG_MAPPINGS = [
  { submission_id: 'sub-ev-01', tag_id: 'tag-hydraulics' },
  { submission_id: 'sub-ev-01', tag_id: 'tag-diagnostics' },
  { submission_id: 'sub-ev-02', tag_id: 'tag-safety' },
  { submission_id: 'sub-ev-02', tag_id: 'tag-new-hire-error' },
  { submission_id: 'sub-ev-03', tag_id: 'tag-safety' },
  { submission_id: 'sub-ev-03', tag_id: 'tag-new-hire-error' },
  { submission_id: 'sub-ev-04', tag_id: 'tag-hydraulics' },
  { submission_id: 'sub-ev-04', tag_id: 'tag-diagnostics' },
  { submission_id: 'sub-ev-05', tag_id: 'tag-safety' },
  { submission_id: 'sub-ev-06', tag_id: 'tag-hydraulics' },
  { submission_id: 'sub-ev-07', tag_id: 'tag-schematics' },
  { submission_id: 'sub-ev-07', tag_id: 'tag-diagnostics' },
  { submission_id: 'sub-ev-08', tag_id: 'tag-hydraulics' },
  { submission_id: 'sub-ev-09', tag_id: 'tag-diagnostics' },
  { submission_id: 'sub-ev-10', tag_id: 'tag-schematics' },
  { submission_id: 'sub-ev-10', tag_id: 'tag-new-hire-error' },
  { submission_id: 'sub-ev-11', tag_id: 'tag-hydraulics' },
  { submission_id: 'sub-ev-11', tag_id: 'tag-diagnostics' },
  { submission_id: 'sub-ev-12', tag_id: 'tag-diagnostics' },
  { submission_id: 'sub-ev-13', tag_id: 'tag-hydraulics' },
  { submission_id: 'sub-ev-13', tag_id: 'tag-new-hire-error' },
  { submission_id: 'sub-ev-14', tag_id: 'tag-safety' },
  { submission_id: 'sub-ev-14', tag_id: 'tag-new-hire-error' },
  { submission_id: 'sub-ev-15', tag_id: 'tag-schematics' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    organization_id: 'org-demo-dtc',
    user_id: 'usr-id',
    actor_type: 'user',
    action: 'submission_approved',
    entity_type: 'submissions',
    entity_id: 'sub-ev-01',
    new_value: { status: 'accepted' },
    created_at: new Date('2026-05-15T10:00:00Z').toISOString(),
  },
  {
    id: 'log-02',
    organization_id: 'org-demo-dtc',
    user_id: 'usr-id',
    actor_type: 'user',
    action: 'curriculum_action_created',
    entity_type: 'curriculum_actions',
    entity_id: 'act-01',
    new_value: { title: 'Revised Hydraulic System Troubleshooting Mastery Assessment' },
    created_at: new Date('2026-06-15T09:00:00Z').toISOString(),
  },
];
