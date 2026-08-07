// Automated Test Suite for Industry Evidence Hub

import { 
  initializeLocalState,
  getSubmissions, 
  createSubmission, 
  updateSubmission,
  getFreshnessStats, 
  generateCompetencyCoverageReport,
  getSubmissionCompetencyMappings,
  addSubmissionCompetencyMapping,
  getCurrentUser,
  loginAsUser
} from '../services/dbService';
import * as seed from './mockSeed';

async function runTests() {
  console.log('🧪 STARTING VERIFICATION TEST SUITE...');
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failedTests++;
    }
  }

  try {
    // Initialize DB state
    initializeLocalState(true); // reset localStorage simulator

    // ----------------------------------------------------
    // TEST 1: Authentication & Tenant Context Isolation
    // ----------------------------------------------------
    console.log('\n--- Test 1: Session & Tenant Context Isolation ---');
    const defaultUser = await getCurrentUser();
    assert(defaultUser !== null, 'Default session user is loaded');
    assert(defaultUser?.organization_id === 'org-demo-dtc', 'User belongs to Demo Technical College');

    await loginAsUser('usr-sme');
    const smeUser = await getCurrentUser();
    assert(smeUser?.id === 'usr-sme', 'Simulated role changed to SME');
    assert(smeUser?.role === 'sme', 'SME role correctly identified');

    // ----------------------------------------------------
    // TEST 2: Evidence Submission & Reference Formatting
    // ----------------------------------------------------
    console.log('\n--- Test 2: Evidence Submission & Reference Generation ---');
    const initialSubs = await getSubmissions();
    const initialCount = initialSubs.length;

    const newSub = await createSubmission({
      organization_id: 'org-demo-dtc',
      title: 'Excavator Hydraulic Tank Crack',
      evidence_type: 'photo',
      job_role: 'Shop Apprentice',
      task_description: 'Found a crack in the side tank welding joint.',
      frequency: 'occasionally',
      entry_level_expectation: 'yes_direct_supervision',
      permission_internal_review: true,
      permission_curriculum_adaptation: true,
      permission_classroom_distribution: false,
      permission_public_distribution: false,
      fileAttachments: [{ name: 'tank_crack.png', size: 1024000, type: 'image/png' }]
    });

    const updatedSubs = await getSubmissions();
    assert(updatedSubs.length === initialCount + 1, 'Submission successfully prepended to database list');
    assert(newSub.reference_id.startsWith('DET-EV-'), 'Reference ID formatted correctly');
    assert(newSub.attachments?.[0].original_filename === 'tank_crack.png', 'File attachment mapped correctly to evidence record');

    // ----------------------------------------------------
    // TEST 3: Permission Capabilities Boundaries
    // ----------------------------------------------------
    console.log('\n--- Test 3: Permission Capabilities Boundaries ---');
    assert(newSub.permission_internal_review === true, 'Internal Review capability is permitted');
    assert(newSub.permission_classroom_distribution === false, 'Classroom Distribution capability is restricted');

    // ----------------------------------------------------
    // TEST 4: Freshness Calculations Logic
    // ----------------------------------------------------
    console.log('\n--- Test 4: Freshness Calculations ---');
    const stats = await getFreshnessStats();
    assert(stats.total > 0, 'Freshness database scan returns records');
    assert(stats.current + stats.warning + stats.stale === stats.total, 'Freshness subsets sum matches total accepted records');

    // ----------------------------------------------------
    // TEST 5: Closed-Loop Competency Mapping Trace
    // ----------------------------------------------------
    console.log('\n--- Test 5: Closed-Loop Competency Mapping Trace ---');
    await addSubmissionCompetencyMapping(newSub.id, 'comp-cc41', 'Apprentice structural checking check', 5);
    const mappings = await getSubmissionCompetencyMappings(newSub.id);
    const hasMapping = mappings.some(m => m.competency_id === 'comp-cc41');
    assert(hasMapping === true, 'Evidence mapped to CC4.1 successfully');

    // Update status to accepted so it counts in coverage calculations
    await updateSubmission(newSub.id, { status: 'accepted' });

    const report = await generateCompetencyCoverageReport();
    const cc41Row = report.find(r => r.competency.id === 'comp-cc41');
    assert(cc41Row !== undefined, 'CC4.1 row found in coverage reports');
    assert(cc41Row!.evidenceCount > 0, 'CC4.1 reports increased evidence count');

    console.log('\n----------------------------------------------------');
    console.log(`🏁 TEST RUN FINISHED. Passed: ${passedTests}, Failed: ${failedTests}`);
    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test runner error', err);
    process.exit(1);
  }
}

runTests();
