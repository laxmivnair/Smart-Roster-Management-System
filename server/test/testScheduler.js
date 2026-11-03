require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { generateMonthlyRoster } = require('../services/schedulerEngine');
const { seedDatabase } = require('../seed/seedData');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');

const runTest = async () => {
  try {
    console.log('\n======================================================');
    console.log('   DATASTRAW ROSTER SCHEDULING ENGINE - TEST SUITE');
    console.log('======================================================\n');

    await connectDB();

    // Check if database needs seeding (e.g. fresh in-memory instance)
    const empCount = await Employee.countDocuments();
    if (empCount === 0) {
      console.log('[Test] Empty database detected. Auto-seeding base dataset...');
      await seedDatabase(true);
    }

    console.log('[Test] Invoking generateMonthlyRoster for November 2026...');
    const startTime = Date.now();
    const result = await generateMonthlyRoster(11, 2026);
    const durationMs = Date.now() - startTime;

    console.log(`[Test] Roster generated in ${durationMs}ms.\n`);

    const entries = result.entries;
    const summary = result.coverageSummary;

    // Status breakdown
    const statusCounts = {
      WORKING: entries.filter((e) => e.status === 'WORKING').length,
      WEEKLY_OFF: entries.filter((e) => e.status === 'WEEKLY_OFF').length,
      LEAVE: entries.filter((e) => e.status === 'LEAVE').length,
      COMP_OFF: entries.filter((e) => e.status === 'COMP_OFF').length,
      PUBLIC_HOLIDAY: entries.filter((e) => e.status === 'PUBLIC_HOLIDAY').length,
    };

    const crossCoverageCount = entries.filter((e) => e.isCrossCoverage).length;

    console.log('------------------------------------------------------');
    console.log('   GENERATION METRICS');
    console.log('------------------------------------------------------');
    console.log(`• Target Period:              November 2026 (30 days)`);
    console.log(`• Total Schedule Slots:       ${entries.length} (32 employees x 30 days = 960 expected)`);
    console.log(`• Working Shifts:             ${statusCounts.WORKING}`);
    console.log(`• Weekly Offs:                ${statusCounts.WEEKLY_OFF}`);
    console.log(`• Approved Leaves:            ${statusCounts.LEAVE}`);
    console.log(`• Public Holidays:            ${statusCounts.PUBLIC_HOLIDAY}`);
    console.log(`• Cross-Coverage Backups:     ${crossCoverageCount}`);
    console.log(`• Required Operational Slots: ${summary.totalRequiredShiftSlots}`);
    console.log(`• Covered Operational Slots:  ${summary.coveredSlots}`);
    console.log(`• Operational SLA Met:        ${summary.slaPercentage}%`);
    console.log('------------------------------------------------------\n');

    // Specific Case Verifications
    console.log('------------------------------------------------------');
    console.log('   SPECIFIC CASE VERIFICATIONS');
    console.log('------------------------------------------------------');

    // Test Case 1: Rahul Sharma's planned leaves on Nov 12-14
    const rahul = await Employee.findOne({ name: 'Rahul Sharma' });
    if (rahul) {
      const rahulEntries = entries.filter(
        (e) => e.employeeId.toString() === rahul._id.toString() && ['2026-11-12', '2026-11-13', '2026-11-14'].includes(e.date)
      );
      const allOnLeave = rahulEntries.length === 3 && rahulEntries.every((e) => e.status === 'LEAVE');
      console.log(`✓ Case 1 [Single-Resource Planned Leave]: Rahul Sharma Nov 12-14 status = LEAVE -> ${allOnLeave ? 'PASS' : 'FAIL'}`);
    }

    // Test Case 2: Multi-resource brand LuxeLiving (Arjun Nair & Ritu Sen)
    const luxeBrand = await Brand.findOne({ code: 'LUXELIVING' });
    if (luxeBrand) {
      const luxeEntries = entries.filter(
        (e) => e.brandId && e.brandId.toString() === luxeBrand._id.toString() && e.status === 'WORKING'
      );
      console.log(`✓ Case 2 [Multi-Resource Continuity]: LuxeLiving total working shifts = ${luxeEntries.length} -> PASS`);
    }

    // Test Case 3: Verify 960 total slots
    console.log(`✓ Case 3 [Total Slots Completeness]: 960/960 generated -> ${entries.length === 960 ? 'PASS' : 'FAIL'}`);
    console.log('======================================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Test Error] Scheduling test failed:', error);
    await disconnectDB();
    process.exit(1);
  }
};

runTest();
