-- Seed data for Industry Evidence Hub
-- Minnesota's Demo Technical College (Diesel Equipment Technology)

-- 1. Insert Organization
INSERT INTO organizations (id, name, short_name, slug, status, created_at)
VALUES (
  'org-demo-dtc',
  'Minnesota Demo Technical College',
  'Demo Tech',
  'demo-tech',
  'active',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Programs
INSERT INTO programs (id, organization_id, code, name, department, description, created_at)
VALUES (
  'prog-det',
  'org-demo-dtc',
  'DET',
  'Diesel Equipment Technology',
  'Heavy Transportation',
  'Two-year Associate of Applied Science degree covering medium and heavy-duty truck diagnostics, diesel engines, hydraulic circuits, power transmissions, and electronic systems.',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Courses
INSERT INTO courses (id, program_id, code, name, description, active, created_at)
VALUES 
(
  'course-det120',
  'prog-det',
  'DET 120',
  'Hydraulic System Troubleshooting',
  'Study of hydraulic circuit design, safety valves, pump displacement, flow sensors, and hands-on diagnostic testing of heavy equipment control valves.',
  TRUE,
  NOW()
),
(
  'course-det130',
  'prog-det',
  'DET 130',
  'Heavy Duty Powertrains',
  'In-depth study of mechanical power transmission, gear configurations, torque converters, automatic and manual power transmissions, and differential locks.',
  TRUE,
  NOW()
),
(
  'course-det210',
  'prog-det',
  'DET 210',
  'Advanced Electronic Engine Diagnostics',
  'Electronic engine control module diagnostic software, common-rail injection wiring, CAN-bus multiplex troubleshooting, and electronic sensor diagnostics.',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Competencies
INSERT INTO competencies (id, course_id, code, title, description, sequence, active, created_at)
VALUES
(
  'comp-cc41',
  'course-det120',
  'CC4.1',
  'Identify, diagnose, and repair hydraulic system faults',
  'Perform system flow and pressure tests, identify pump cavitation, read schematic valve circuits, adjust relief valve settings, and repair control valve failures.',
  1,
  TRUE,
  NOW()
),
(
  'comp-cc42',
  'course-det120',
  'CC4.2',
  'Interpret fluid power symbols and schematic drawings',
  'Trace pressure, pilot, and return lines on complex industrial blueprints, identifying spool positions, accumulator charges, and feedback loops.',
  2,
  TRUE,
  NOW()
),
(
  'comp-cc51',
  'course-det130',
  'CC5.1',
  'Overhaul torque converters and multi-speed power transmissions',
  'Disassemble, inspect, measure component clearance, replace clutch packs, and test transmission assembly operation.',
  3,
  TRUE,
  NOW()
),
(
  'comp-cc62',
  'course-det210',
  'CC6.2',
  'Troubleshoot CAN-bus controller networks and sensors',
  'Diagnose termination resistor open circuits, analyze J1939 network waveforms, trace wiring harness breaks, and calibrate pressure sensors.',
  4,
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert Mock Users
INSERT INTO users (id, organization_id, email, role, first_name, last_name, title, status, created_at)
VALUES
(
  'usr-id',
  'org-demo-dtc',
  'clara.barton@demo-dtc.edu',
  'instructional_designer',
  'Clara',
  'Barton',
  'Lead Instructional Designer',
  'active',
  NOW()
),
(
  'usr-dean',
  'org-demo-dtc',
  'arthur.pendelton@demo-dtc.edu',
  'dean',
  'Arthur',
  'Pendelton',
  'Director of Curriculum & Alignment',
  'active',
  NOW()
),
(
  'usr-sme',
  'org-demo-dtc',
  'marcus.aurelius@demo-dtc.edu',
  'sme',
  'Marcus',
  'Aurelius',
  'Heavy Machinery Subject Matter Expert',
  'active',
  NOW()
),
(
  'usr-faculty',
  'org-demo-dtc',
  'george.washington@demo-dtc.edu',
  'faculty',
  'George',
  'Washington',
  'Diesel Technology Faculty Lead',
  'active',
  NOW()
),
(
  'usr-admin',
  'org-demo-dtc',
  'jane.doe@demo-dtc.edu',
  'admin',
  'Jane',
  'Doe',
  'System Administrator',
  'active',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert Industry Partners
INSERT INTO industry_partners (id, organization_id, organization_name, industry_sector, city, state, country, active, created_at)
VALUES
(
  'part-titan',
  'org-demo-dtc',
  'Titan Heavy Machinery',
  'Construction Equipment Service',
  'Bloomington',
  'MN',
  'USA',
  TRUE,
  NOW()
),
(
  'part-linder',
  'org-demo-dtc',
  'Linder Trucking Logistics',
  'Fleet Logistics & Maintenance',
  'St. Paul',
  'MN',
  'USA',
  TRUE,
  NOW()
),
(
  'part-ziegler',
  'org-demo-dtc',
  'Ziegler CAT Repair',
  'Heavy Equipment Dealership',
  'Minneapolis',
  'MN',
  'USA',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert Industry Contributors
INSERT INTO industry_contributors (id, industry_partner_id, first_name, last_name, job_title, years_in_industry, contributor_type, active, created_at)
VALUES
(
  'contr-titan-lead',
  'part-titan',
  'Robert',
  'Smith',
  'Senior Hydraulics Specialist',
  18,
  'technician',
  TRUE,
  NOW()
),
(
  'contr-linder-manager',
  'part-linder',
  'Sarah',
  'Jenkins',
  'Fleet Maintenance Manager',
  12,
  'manager',
  TRUE,
  NOW()
),
(
  'contr-ziegler-foreman',
  'part-ziegler',
  'David',
  'Miller',
  'Shop Foreman & Lead Trainer',
  25,
  'supervisor',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert Evidence Requests (Campaigns)
INSERT INTO evidence_requests (id, organization_id, course_id, title, request_code, status, description, created_by, created_at)
VALUES
(
  'req-hydraulic-diag',
  'org-demo-dtc',
  'course-det120',
  'Diesel Hydraulics Diagnostic Logs',
  'req-token-hydraulic-diag',
  'active',
  'Seeking diagnostic logs, flow meter reports, and valve wear pictures from hydraulic troubleshooting tasks performed on commercial excavation and farm equipment.',
  'usr-id',
  NOW() - INTERVAL '10 days'
),
(
  'req-newhire-problems',
  'org-demo-dtc',
  'course-det130',
  'New Hire Powertrain Troubles',
  'req-token-newhire-problems',
  'active',
  'Seeking examples of struggle areas, clearance measurement errors, or component damage caused by apprentice techs working on heavy transmission rebuilds.',
  'usr-id',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- 9. Insert Submissions (Accepted and New Sourced Evidence)
INSERT INTO submissions (
  id, organization_id, contributor_id, reference_id, title, evidence_type, job_role, 
  task_description, tools_resources, frequency, entry_level_expectation, common_mistakes, 
  unsafe_unacceptable, status, permission_internal_review, permission_curriculum_adaptation, 
  permission_classroom_distribution, permission_public_distribution, created_at
)
VALUES
(
  'sub-2026-0001',
  'org-demo-dtc',
  'contr-titan-lead',
  'DET-EV-2026-0001',
  'Hydraulic Pump Displacement Test Log',
  'process_log',
  'Hydraulics Technician',
  'Conducted flow and pressure testing on a CAT 320 excavator hydraulic pump because the operator reported sluggish boom controls. Hooked up a pressure gauge and flow meter at the pump output.',
  'Flow Meter, Pressure Gauges, Hydraulic Tee Fittings',
  'daily',
  'yes_direct_supervision',
  'Forgetting to bleed pressure from the hydraulic accumulator before connecting line fittings. This causes fluid spray.',
  'Starting the diesel engine with the flow-control valve fully closed, which causes high pressure buildup and hose explosion.',
  'accepted',
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  NOW() - INTERVAL '15 days'
),
(
  'sub-2026-0002',
  'org-demo-dtc',
  'contr-linder-manager',
  'DET-EV-2026-0002',
  'Overheated Transmission Inspection Report',
  'inspection_report',
  'Shop Fleet Mechanic',
  'Inspected an Allison 4500 transmission showing diagnostic fault codes for high temperature. Disassembled clutch packs and found friction plate peeling.',
  'Micrometer, Feeler Gauges, Allison DOC Software',
  'weekly',
  'yes_direct_supervision',
  'Mismeasuring endplay clearances. If the spacer is too thick, it binds the clutch and burns out the unit in under 50 miles.',
  'Forgetting to flush the transmission cooler lines, leaving metal debris that ruins the new replacement transmission.',
  'accepted',
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  NOW() - INTERVAL '30 days'
),
(
  'sub-2026-0003',
  'org-demo-dtc',
  'contr-ziegler-foreman',
  'DET-EV-2026-0003',
  'CAN J1939 Waveform Diagnostic Chart',
  'photo',
  'Master Diagnostic Tech',
  'Diagnosed a complete communication lockout on a scraper. CAN network J1939 pins measured 120 ohms instead of 60 ohms. Found a wiring break.',
  'Digital Oscilloscope, Multimeter, J1939 Breakout Box',
  'monthly',
  'no_experienced_only',
  'Using cheap wire taps or simple electrical tape on datalink wires instead of waterproof heat-shrink terminals. Water enters and ruins signal.',
  'Running replacement datalink wiring without twisting the CAN-high and CAN-low lines. Leads to signal interference and engine codes.',
  'new',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  NOW() - INTERVAL '1 day'
) ON CONFLICT (id) DO NOTHING;

-- 10. Insert Submission-Competency Mappings
INSERT INTO submission_competencies (submission_id, competency_id, rationale, relevance_rating, mapped_by, created_at)
VALUES
(
  'sub-2026-0001',
  'comp-cc41',
  'Directly describes flow meter tests, hydraulic pressures, and controls troubleshooting.',
  5,
  'usr-id',
  NOW()
),
(
  'sub-2026-0002',
  'comp-cc51',
  'Shows real inspection clearances, gear clearance limits, and torque converter details.',
  4,
  'usr-id',
  NOW()
) ON CONFLICT (submission_id, competency_id) DO NOTHING;

-- 11. Insert Curriculum Artifacts
INSERT INTO curriculum_artifacts (id, organization_id, competency_id, title, artifact_type, version, active, created_at)
VALUES
(
  'art-hydraulic-ma',
  'org-demo-dtc',
  'comp-cc41',
  'DET 120 Hydraulic Diagnostics Mastery Assessment',
  'mastery_assessment',
  '2.0',
  TRUE,
  NOW() - INTERVAL '60 days'
),
(
  'art-powertrain-lab',
  'org-demo-dtc',
  'comp-cc51',
  'DET 130 Torque Converter Overhaul Lab Guide',
  'lab_sheet',
  '1.1',
  TRUE,
  NOW() - INTERVAL '90 days'
) ON CONFLICT (id) DO NOTHING;

-- 12. Insert Curriculum Actions (Trace Log)
INSERT INTO curriculum_actions (
  id, organization_id, program_id, course_id, competency_id, action_type, 
  title, description, rationale, effective_term, status, created_by, created_at
)
VALUES
(
  'act-hydraulic-rev',
  'org-demo-dtc',
  'prog-det',
  'course-det120',
  'comp-cc41',
  'mastery_assessment_revised',
  'Revised Hydraulic Diagnostic MA and Safety Rubric',
  'Added a mandatory pressure-relief valve adjustment task and an accumulator line safety checklist to the final diagnostic mastery assessment.',
  'Updated because Titan Machinery lead technician (`DET-EV-2026-0001`) reported apprentices frequently fail to bleed accumulator circuit safety pressure, causing high-pressure oil spraying hazards.',
  'Fall 2026',
  'approved',
  'usr-id',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- 13. Insert Validation Requests
INSERT INTO validation_requests (id, curriculum_artifact_id, token, expires_at, created_by, created_at)
VALUES
(
  'val-req-hydraulic',
  'art-hydraulic-ma',
  'val-token-hydraulic-ma',
  NOW() + INTERVAL '30 days',
  'usr-id',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (id) DO NOTHING;

-- 14. Insert Validation Responses
INSERT INTO validation_responses (
  id, validation_request_id, industry_partner_id, reviewer_name, review_status, 
  clarity_rating, completeness_rating, preparedness_rating, unrealistic_missing_comments, 
  general_comments, created_at
)
VALUES
(
  'val-resp-hydraulic',
  'val-req-hydraulic',
  'part-titan',
  'Robert Smith',
  'certified',
  'clear',
  'complete',
  'prepared',
  'The pressure test points match exactly what we do on Caterpillar and John Deere machinery.',
  'This is a much-needed improvement. If student candidates can perform this accumulator discharge sequence safely, we can hire them immediately.',
  NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;

-- 15. Insert Task Profiles
INSERT INTO task_profiles (
  id, organization_id, title, occupation, task_description, safety_precautions, 
  tools_required, typical_duration_minutes, created_by, created_at
)
VALUES
(
  'prof-hydraulic-displacement',
  'org-demo-dtc',
  'Hydraulic Pump Displacement Flow Testing',
  'Diesel Equipment Technician',
  'Connect external flow meter and pressure dials to primary pump output, start engine, run at 1800 RPM, cycle directional boom control valve, record flow rate, and check valve slip tolerances.',
  'Accidental hydraulic spray hazard. Wear high-impact safety goggles and thick gloves. Always discharge accumulators before breaking hoses.',
  'Flow Meter (0-50 GPM), 10,000 PSI Pressure Gauge, Tee-Fittings, Safety Glasses',
  45,
  'usr-id',
  NOW() - INTERVAL '12 days'
) ON CONFLICT (id) DO NOTHING;
