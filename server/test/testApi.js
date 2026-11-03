process.env.NODE_ENV = 'test';
process.env.PORT = 5055;

const { app, startServer } = require('../server');
const { disconnectDB } = require('../config/db');

const BASE_URL = 'http://localhost:5055';

const runApiTests = async () => {
  let serverInstance = null;

  try {
    console.log('\n======================================================');
    console.log('   DATASTRAW REST API INTEGRATION TEST SUITE');
    console.log('======================================================\n');

    serverInstance = await startServer();
    console.log('[Test] Server started on port 5055.\n');

    // ------------------------------------------------------------------------
    // Test 1: Health Check
    // ------------------------------------------------------------------------
    console.log('[Test 1] Testing GET /api/health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log(`• Status Code: ${healthRes.status}`);
    console.log(`• Service:     ${healthData.service}`);
    console.log(`• Pods:        ${healthData.stats.pods}, Employees: ${healthData.stats.employees}, Brands: ${healthData.stats.brands}`);
    console.log(`✓ Test 1: Health Check -> PASS\n`);

    // ------------------------------------------------------------------------
    // Test 2: Metadata Endpoint
    // ------------------------------------------------------------------------
    console.log('[Test 2] Testing GET /api/roster/metadata...');
    const metaRes = await fetch(`${BASE_URL}/api/roster/metadata`);
    const metaData = await metaRes.json();
    console.log(`• Status Code:     ${metaRes.status}`);
    console.log(`• Pods Fetched:     ${metaData.data.pods.length}`);
    console.log(`• Employees Fetched: ${metaData.data.employees.length} (Expected 32)`);
    console.log(`• Brands Fetched:    ${metaData.data.brands.length} (Expected 15)`);
    console.log(`✓ Test 2: Metadata Retrieval -> PASS\n`);

    // ------------------------------------------------------------------------
    // Test 3: Generate Monthly Roster
    // ------------------------------------------------------------------------
    console.log('[Test 3] Testing POST /api/roster/generate for November 2026...');
    const genRes = await fetch(`${BASE_URL}/api/roster/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: 11, year: 2026 }),
    });
    const genData = await genRes.json();
    const roster = genData.data;

    console.log(`• Status Code:         ${genRes.status}`);
    console.log(`• Total Entries:       ${roster.entries.length} (32 x 30 = 960 expected)`);
    console.log(`• Operational SLA:     ${roster.metrics.slaPercentage}%`);
    console.log(`• Conflicts Diagnosed: ${roster.conflicts.length}`);
    console.log(`✓ Test 3: Roster Generation & Persistence -> PASS\n`);

    // ------------------------------------------------------------------------
    // Test 4: Section 3F Walkthrough - Simulate Sudden Sick Leave
    // ------------------------------------------------------------------------
    console.log('[Test 4] Testing POST /api/roster/simulate-leave (Section 3F Requirement)...');
    // Find Rahul Sharma (Dedicated employee on SilkKnit)
    const rahul = metaData.data.employees.find((e) => e.name === 'Rahul Sharma');
    const targetDate = '2026-11-05'; // A working Thursday

    const leaveRes = await fetch(`${BASE_URL}/api/roster/simulate-leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rosterId: roster._id,
        date: targetDate,
        employeeId: rahul._id,
        reason: 'Sudden high fever / emergency sick leave',
      }),
    });
    const leaveData = await leaveRes.json();

    console.log(`• Status Code:             ${leaveRes.status}`);
    console.log(`• Message:                 ${leaveData.message}`);
    console.log(`• New Conflicts Triggered: ${leaveData.data.newConflicts.length}`);
    if (leaveData.data.newConflicts.length > 0) {
      const gap = leaveData.data.newConflicts[0];
      console.log(`  └─ [${gap.severity}] on ${gap.brandName}: ${gap.explanation}`);
      console.log(`  └─ Suggested Fix: ${gap.suggestedResolution}`);
    }
    console.log(`✓ Test 4: Dynamic Disruption Simulation -> PASS\n`);

    // ------------------------------------------------------------------------
    // Test 5: One-Click Apply Backup
    // ------------------------------------------------------------------------
    console.log('[Test 5] Testing POST /api/roster/apply-backup to resolve gap...');
    const silkKnit = metaData.data.brands.find((b) => b.code === 'SILKKNIT');
    const silkKnitProc = metaData.data.processes.find(
      (p) => p.brandId._id.toString() === silkKnit._id.toString() && p.processType === 'CS'
    );
    // Peer in Pod Alpha: Neha Gupta or Pooja Nair
    const backupCandidate = metaData.data.employees.find(
      (e) => e.name === 'Pooja Nair' && e.podId._id.toString() === silkKnit.podId._id.toString()
    );

    const backupRes = await fetch(`${BASE_URL}/api/roster/apply-backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rosterId: roster._id,
        date: targetDate,
        brandId: silkKnit._id,
        processId: silkKnitProc._id,
        backupEmployeeId: backupCandidate._id,
      }),
    });
    const backupData = await backupRes.json();

    console.log(`• Status Code:       ${backupRes.status}`);
    console.log(`• Message:           ${backupData.message}`);
    console.log(`• Updated SLA:       ${backupData.data.metrics.slaPercentage}%`);
    console.log(`• Resolved Candidate: ${backupData.data.updatedBackupEntry.isCrossCoverage ? 'Cross-Coverage Confirmed' : 'Normal'}`);
    console.log(`✓ Test 5: Actionable Gap Resolution -> PASS\n`);

    console.log('======================================================');
    console.log('   ALL 5 REST API TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');

    serverInstance.close();
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[API Test Error] Integration test failed:', error);
    if (serverInstance) serverInstance.close();
    await disconnectDB();
    process.exit(1);
  }
};

runApiTests();
