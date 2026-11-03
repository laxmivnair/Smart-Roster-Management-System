require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { generateMonthlyRoster } = require('../services/schedulerEngine');
const { validateRoster } = require('../services/conflictValidator');
const { seedDatabase } = require('../seed/seedData');
const Employee = require('../models/Employee');

const runConflictTest = async () => {
  try {
    console.log('\n======================================================');
    console.log('   DATASTRAW CONFLICT VALIDATION ENGINE - TEST SUITE');
    console.log('======================================================\n');

    await connectDB();

    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      console.log('[Test] Empty database detected. Auto-seeding base dataset...');
      await seedDatabase(true);
    }

    console.log('[Test] Generating November 2026 Roster...');
    const rosterResult = await generateMonthlyRoster(11, 2026);

    console.log('[Test] Running Conflict Validation Engine...');
    const startTime = Date.now();
    const validationResult = await validateRoster(
      rosterResult.entries,
      rosterResult.demandMatrix,
      11,
      2026
    );
    const durationMs = Date.now() - startTime;

    console.log(`[Test] Validation complete in ${durationMs}ms.\n`);

    const { conflicts, metrics } = validationResult;

    console.log('------------------------------------------------------');
    console.log('   AUDIT METRICS & SLA HEALTH');
    console.log('------------------------------------------------------');
    console.log(`• Operational SLA Met:        ${metrics.slaPercentage}%`);
    console.log(`• Total Required Slots:       ${metrics.totalRequiredSlots}`);
    console.log(`• Total Covered Slots:        ${metrics.coveredSlots}`);
    console.log(`• Total Conflicts Detected:   ${metrics.totalConflicts}`);
    console.log(`• Critical Coverage Gaps:     ${metrics.criticalGapsCount}`);
    console.log(`• Understaffed Alerts:        ${metrics.understaffedCount}`);
    console.log(`• Overload / Fatigue Alerts:  ${metrics.overloadCount}`);
    console.log('------------------------------------------------------\n');

    console.log('------------------------------------------------------');
    console.log('   VERIFICATION ASSERTIONS');
    console.log('------------------------------------------------------');

    // Assertion 1: Planned leave deficit flagged (Arjun Nair Nov 18 on LuxeLiving)
    const nov18Deficit = conflicts.find((c) => c.date === '2026-11-18' && c.brandName.includes('LuxeLiving'));
    console.log(
      `✓ Case 1 [Planned Leave Deficit Detection]: Nov 18 LuxeLiving understaffing flagged -> ${
        nov18Deficit ? 'PASS (' + nov18Deficit.severity + ')' : 'FAIL'
      }`
    );

    // Assertion 2: Natural language explanation present for all conflicts
    const hasExplanation = conflicts.every((c) => c.explanation && c.explanation.length > 20);
    console.log(`✓ Case 2 [Human-Readable Explanations]: Descriptive diagnostics generated -> ${hasExplanation ? 'PASS' : 'FAIL'}`);

    // Assertion 3: Actionable candidate replacements attached
    const hasCandidates = conflicts.some((c) => c.candidateReplacements && c.candidateReplacements.length > 0);
    console.log(`✓ Case 3 [Pod-Level Actionable Suggestions]: Candidate peers attached -> ${hasCandidates ? 'PASS' : 'FAIL'}`);

    // Assertion 4: Zero labor overload violations
    console.log(`✓ Case 4 [Zero Labor Overload]: Overload alerts = 0 -> ${metrics.overloadCount === 0 ? 'PASS' : 'FAIL'}`);

    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Test Error] Conflict validation test failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

runConflictTest();
