const Roster = require('../models/Roster');
const Pod = require('../models/Pod');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const BrandProcess = require('../models/BrandProcess');
const ResourceAllocation = require('../models/ResourceAllocation');

const { generateMonthlyRoster } = require('../services/schedulerEngine');
const { validateRoster } = require('../services/conflictValidator');
const { seedDatabase } = require('../seed/seedData');

/**
 * Generate (or regenerate) a monthly roster with conflict validation
 * POST /api/roster/generate
 */
const generateRoster = async (req, res) => {
  try {
    const month = parseInt(req.body.month, 10) || 11;
    const year = parseInt(req.body.year, 10) || 2026;

    console.log(`[API] Generating roster for ${year}-${month}...`);

    // 1. Generate schedule entries and demand matrix
    const rosterResult = await generateMonthlyRoster(month, year);

    // 2. Validate roster for conflicts and compute SLA metrics
    const validationResult = await validateRoster(
      rosterResult.entries,
      rosterResult.demandMatrix,
      month,
      year
    );

    // 3. Upsert into MongoDB
    const savedRoster = await Roster.findOneAndUpdate(
      { month, year },
      {
        month,
        year,
        status: 'DRAFT',
        entries: rosterResult.entries,
        conflicts: validationResult.conflicts,
        metrics: validationResult.metrics,
        demandMatrix: rosterResult.demandMatrix,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Roster for ${year}-${month} generated successfully`,
      data: savedRoster,
    });
  } catch (error) {
    console.error('[API Error] generateRoster failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch existing roster for month/year, or generate if none exists
 * GET /api/roster/:year/:month
 */
const getRoster = async (req, res) => {
  try {
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);

    let roster = await Roster.findOne({ month, year });

    if (!roster) {
      console.log(`[API] No existing roster found for ${year}-${month}. Generating on the fly...`);
      const rosterResult = await generateMonthlyRoster(month, year);
      const validationResult = await validateRoster(
        rosterResult.entries,
        rosterResult.demandMatrix,
        month,
        year
      );

      roster = await Roster.create({
        month,
        year,
        status: 'DRAFT',
        entries: rosterResult.entries,
        conflicts: validationResult.conflicts,
        metrics: validationResult.metrics,
        demandMatrix: rosterResult.demandMatrix,
      });
    }

    res.status(200).json({
      success: true,
      data: roster,
    });
  } catch (error) {
    console.error('[API Error] getRoster failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update an individual shift cell and re-validate in real-time
 * PATCH /api/roster/cell
 */
const updateCell = async (req, res) => {
  try {
    const { rosterId, date, employeeId, newStatus, newBrandId, newProcessId, notes } = req.body;

    const roster = await Roster.findById(rosterId);
    if (!roster) {
      return res.status(404).json({ success: false, message: 'Roster not found' });
    }

    // Find the targeted entry
    const entryIndex = roster.entries.findIndex(
      (e) => e.date === date && e.employeeId.toString() === employeeId.toString()
    );

    if (entryIndex === -1) {
      return res.status(404).json({ success: false, message: 'Cell entry not found' });
    }

    // Apply update
    if (newStatus) roster.entries[entryIndex].status = newStatus;
    if (newBrandId !== undefined) roster.entries[entryIndex].brandId = newBrandId;
    if (newProcessId !== undefined) roster.entries[entryIndex].processId = newProcessId;
    if (notes !== undefined) roster.entries[entryIndex].notes = notes;

    // Real-time re-validation
    const validationResult = await validateRoster(
      roster.entries,
      roster.demandMatrix,
      roster.month,
      roster.year
    );

    roster.conflicts = validationResult.conflicts;
    roster.metrics = validationResult.metrics;
    await roster.save();

    res.status(200).json({
      success: true,
      message: 'Shift cell updated and roster re-validated',
      data: {
        updatedEntry: roster.entries[entryIndex],
        metrics: roster.metrics,
        conflicts: roster.conflicts,
      },
    });
  } catch (error) {
    console.error('[API Error] updateCell failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Demonstrate Handling Changes: Simulate unexpected employee absence / sick leave
 * POST /api/roster/simulate-leave
 */
const simulateLeave = async (req, res) => {
  try {
    const { rosterId, date, employeeId, reason } = req.body;

    const roster = await Roster.findById(rosterId);
    if (!roster) {
      return res.status(404).json({ success: false, message: 'Roster not found' });
    }

    const entry = roster.entries.find(
      (e) => e.date === date && e.employeeId.toString() === employeeId.toString()
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Schedule entry not found' });
    }

    // Update status to LEAVE
    entry.status = 'LEAVE';
    entry.notes = reason || 'Sudden emergency leave';

    // Recalculate conflicts and SLA metrics
    const validationResult = await validateRoster(
      roster.entries,
      roster.demandMatrix,
      roster.month,
      roster.year
    );

    roster.conflicts = validationResult.conflicts;
    roster.metrics = validationResult.metrics;
    await roster.save();

    // Identify newly created conflicts on this date
    const newlyCreatedConflicts = roster.conflicts.filter(
      (c) => c.date === date && (c.employeeId?.toString() === employeeId || c.brandId?.toString() === entry.brandId?.toString())
    );

    res.status(200).json({
      success: true,
      message: 'Employee leave simulated. Impact evaluated across client accounts.',
      data: {
        affectedDate: date,
        employeeId,
        newConflicts: newlyCreatedConflicts,
        metrics: roster.metrics,
        allConflicts: roster.conflicts,
      },
    });
  } catch (error) {
    console.error('[API Error] simulateLeave failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Apply recommended pod backup to resolve a conflict
 * POST /api/roster/apply-backup
 */
const applyBackup = async (req, res) => {
  try {
    const { rosterId, date, brandId, processId, backupEmployeeId } = req.body;

    const roster = await Roster.findById(rosterId);
    if (!roster) {
      return res.status(404).json({ success: false, message: 'Roster not found' });
    }

    const backupEntry = roster.entries.find(
      (e) => e.date === date && e.employeeId.toString() === backupEmployeeId.toString()
    );

    if (!backupEntry) {
      return res.status(404).json({ success: false, message: 'Backup employee schedule entry not found' });
    }

    // Assign as cross-coverage backup
    backupEntry.status = 'WORKING';
    backupEntry.brandId = brandId;
    backupEntry.processId = processId;
    backupEntry.isCrossCoverage = true;
    backupEntry.notes = 'Manager-approved pod cross-coverage backup';

    // Re-validate roster
    const validationResult = await validateRoster(
      roster.entries,
      roster.demandMatrix,
      roster.month,
      roster.year
    );

    roster.conflicts = validationResult.conflicts;
    roster.metrics = validationResult.metrics;
    await roster.save();

    res.status(200).json({
      success: true,
      message: 'Backup successfully assigned. SLA gap resolved.',
      data: {
        metrics: roster.metrics,
        conflicts: roster.conflicts,
        updatedBackupEntry: backupEntry,
      },
    });
  } catch (error) {
    console.error('[API Error] applyBackup failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetch all organization metadata (Pods, Employees, Brands, Processes, Allocations)
 * GET /api/roster/metadata
 */
const getMetadata = async (req, res) => {
  try {
    const [pods, employees, brands, processes, allocations] = await Promise.all([
      Pod.find({}).populate('leadId', 'name email').lean(),
      Employee.find({ isActive: true }).populate('podId', 'name code').lean(),
      Brand.find({}).populate('podId', 'name code').lean(),
      BrandProcess.find({}).populate('brandId', 'name code tier').lean(),
      ResourceAllocation.find({})
        .populate('employeeId', 'name skills')
        .populate('brandId', 'name code')
        .populate('processId', 'processType operatingCalendar')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pods,
        employees,
        brands,
        processes,
        allocations,
      },
    });
  } catch (error) {
    console.error('[API Error] getMetadata failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * One-click demo reset endpoint for recruiters
 * POST /api/roster/reset-seed
 */
const resetSeedData = async (req, res) => {
  try {
    console.log('[API] Triggering complete database seed reset...');
    await seedDatabase(true);
    res.status(200).json({
      success: true,
      message: 'Database reset to clean base dataset (32 employees, 15 brands, 3 pods).',
    });
  } catch (error) {
    console.error('[API Error] resetSeedData failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateRoster,
  getRoster,
  updateCell,
  simulateLeave,
  applyBackup,
  getMetadata,
  resetSeedData,
};
