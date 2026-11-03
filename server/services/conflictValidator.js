const Pod = require('../models/Pod');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const BrandProcess = require('../models/BrandProcess');
const ResourceAllocation = require('../models/ResourceAllocation');

/**
 * Validates a monthly roster against client operational demand, labor constraints, and team availability.
 * Generates natural language root-cause explanations and attaches actionable pod candidate replacements.
 *
 * @param {Array} rosterEntries - List of all daily employee schedule entries
 * @param {Object} demandMatrix - Map of dateStr -> { brandProcKey: requiredHeadcount }
 * @param {Number} month - Month (1-12)
 * @param {Number} year - Year
 * @returns {Object} { conflicts, metrics }
 */
const validateRoster = async (rosterEntries, demandMatrix, month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Fetch relevant metadata from DB
  const [pods, employees, brands, processes, allocations] = await Promise.all([
    Pod.find({}).lean(),
    Employee.find({ isActive: true }).lean(),
    Brand.find({}).lean(),
    BrandProcess.find({}).lean(),
    ResourceAllocation.find({}).lean(),
  ]);

  const podMap = new Map(pods.map((p) => [p._id.toString(), p]));
  const employeeMap = new Map(employees.map((e) => [e._id.toString(), e]));
  const brandMap = new Map(brands.map((b) => [b._id.toString(), b]));
  const processMap = new Map(processes.map((p) => [p._id.toString(), p]));

  // Brand-process primary allocation map: `${brandId}_${procType}` -> primary employee
  const brandProcPrimaryEmpMap = new Map();
  allocations.forEach((alloc) => {
    const proc = processMap.get(alloc.processId.toString());
    if (proc && alloc.roleType === 'PRIMARY') {
      const key = `${alloc.brandId.toString()}_${proc.processType}`;
      if (!brandProcPrimaryEmpMap.has(key)) {
        brandProcPrimaryEmpMap.set(key, alloc.employeeId.toString());
      }
    }
  });

  // Index entries by `${date}_${empId}`
  const entryByDateEmp = new Map();
  // Index working entries by date: dateStr -> [entries]
  const workingEntriesByDate = new Map();

  rosterEntries.forEach((entry) => {
    const empId = entry.employeeId.toString();
    entryByDateEmp.set(`${entry.date}_${empId}`, entry);

    if (entry.status === 'WORKING') {
      if (!workingEntriesByDate.has(entry.date)) {
        workingEntriesByDate.set(entry.date, []);
      }
      workingEntriesByDate.get(entry.date).push(entry);
    }
  });

  const conflicts = [];
  let totalRequiredSlots = 0;
  let coveredSlots = 0;

  // --------------------------------------------------------------------------
  // AUDIT 1: Daily Process Coverage Verification
  // --------------------------------------------------------------------------
  for (let day = 1; day <= daysInMonth; day++) {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const dateStr = `${year}-${m}-${d}`;

    const dailyDemand = demandMatrix[dateStr] || {};
    const dailyWorkingEntries = workingEntriesByDate.get(dateStr) || [];

    for (const proc of processes) {
      const brand = brandMap.get(proc.brandId.toString());
      if (!brand) continue;

      const procKey = `${proc.brandId.toString()}_${proc.processType}`;
      const required = dailyDemand[procKey] || 0;
      if (required === 0) continue; // Brand process is closed today

      totalRequiredSlots += required;

      // Count working employees for this brand/process on dateStr
      const activeWorking = dailyWorkingEntries.filter((e) => {
        if (!e.brandId || e.brandId.toString() !== proc.brandId.toString()) return false;
        if (brand.tier === 'SINGLE_RESOURCE') return true;
        return e.processId && e.processId.toString() === proc._id.toString();
      });

      const activeCount = activeWorking.length;
      coveredSlots += Math.min(activeCount, required);

      // A. Critical Coverage Gap (0 staff present)
      if (activeCount === 0) {
        const primaryEmpId = brandProcPrimaryEmpMap.get(procKey);
        const primaryEmp = primaryEmpId ? employeeMap.get(primaryEmpId) : null;
        const primaryEntry = primaryEmpId ? entryByDateEmp.get(`${dateStr}_${primaryEmpId}`) : null;

        let primaryReason = 'Unassigned';
        if (primaryEntry) {
          if (primaryEntry.status === 'LEAVE') {
            primaryReason = `on approved leave (${primaryEntry.notes || 'Personal Leave'})`;
          } else if (primaryEntry.status === 'WEEKLY_OFF') {
            primaryReason = 'on mandatory weekly off';
          } else if (primaryEntry.status === 'PUBLIC_HOLIDAY') {
            primaryReason = 'on public holiday';
          }
        }

        const pod = podMap.get(brand.podId.toString());
        const podName = pod ? pod.name : 'Operational Pod';

        // Find candidate replacements in the same Pod
        const podPeers = employees.filter((e) => e.podId.toString() === brand.podId.toString());
        const candidates = [];

        podPeers.forEach((peer) => {
          const peerId = peer._id.toString();
          if (primaryEmpId && peerId === primaryEmpId) return;

          const hasSkill = peer.skills.includes(proc.processType);
          const peerEntry = entryByDateEmp.get(`${dateStr}_${peerId}`);
          const isCurrentlyWorking = peerEntry && peerEntry.status === 'WORKING';

          if (hasSkill && !isCurrentlyWorking) {
            candidates.push({
              employeeId: peer._id,
              name: peer.name,
              podName: podName,
              skills: peer.skills,
              currentStatus: peerEntry ? peerEntry.status : 'AVAILABLE',
              reason: `Pod teammate, certified in ${proc.processType}, available on this date`,
            });
          }
        });

        const suggestedResolution =
          candidates.length > 0
            ? `Assign ${candidates[0].name} (${podName}, ${proc.processType}-certified) as cross-coverage backup.`
            : `Escalate to ${podName} Lead: No available peer with ${proc.processType} skill found. External cross-pod backup required.`;

        conflicts.push({
          id: `GAP_${brand.code}_${proc.processType}_${dateStr}`,
          date: dateStr,
          severity: 'CRITICAL_GAP',
          brandId: brand._id,
          brandName: brand.name,
          processType: proc.processType,
          employeeId: primaryEmp ? primaryEmp._id : null,
          employeeName: primaryEmp ? primaryEmp.name : 'Dedicated Staff',
          explanation: `Brand ${brand.name} requires ${required} staff for ${proc.processType} on ${dateStr}, but primary dedicated employee ${
            primaryEmp ? primaryEmp.name : 'Staff'
          } is ${primaryReason}. Zero staff currently present.`,
          suggestedResolution,
          candidateReplacements: candidates,
        });
      }

      // B. Understaffed (Some staff present, but below minimum daily requirement)
      else if (activeCount < required) {
        const pod = podMap.get(brand.podId.toString());
        const podName = pod ? pod.name : 'Operational Pod';

        conflicts.push({
          id: `UNDERSTAFFED_${brand.code}_${proc.processType}_${dateStr}`,
          date: dateStr,
          severity: 'UNDERSTAFFED',
          brandId: brand._id,
          brandName: brand.name,
          processType: proc.processType,
          employeeId: null,
          employeeName: 'Team',
          explanation: `Brand ${brand.name} requires ${required} staff for ${proc.processType} on ${dateStr}, but only ${activeCount} active staff scheduled (Deficit of ${
            required - activeCount
          }).`,
          suggestedResolution: `Assign an additional ${proc.processType}-certified associate from ${podName} to satisfy SLA.`,
          candidateReplacements: [],
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // AUDIT 2: Employee Fatigue & Overload Check (>6 consecutive working days)
  // --------------------------------------------------------------------------
  employees.forEach((emp) => {
    const empId = emp._id.toString();
    let consecutiveCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;

      const entry = entryByDateEmp.get(`${dateStr}_${empId}`);
      if (entry && entry.status === 'WORKING') {
        consecutiveCount++;
        if (consecutiveCount > (emp.maxConsecutiveDays || 6)) {
          conflicts.push({
            id: `OVERLOAD_${empId}_${dateStr}`,
            date: dateStr,
            severity: 'OVERLOAD',
            brandId: entry.brandId,
            brandName: entry.brandId && brandMap.has(entry.brandId.toString()) ? brandMap.get(entry.brandId.toString()).name : 'Assigned Brand',
            processType: entry.processId && processMap.has(entry.processId.toString()) ? processMap.get(entry.processId.toString()).processType : 'General',
            employeeId: emp._id,
            employeeName: emp.name,
            explanation: `Employee ${emp.name} has been scheduled for ${consecutiveCount} consecutive days without a rest day, exceeding the policy limit of ${
              emp.maxConsecutiveDays || 6
            } days.`,
            suggestedResolution: `Insert a mandatory weekly off on ${dateStr} and reassign shift to an available pod peer.`,
            candidateReplacements: [],
          });
        }
      } else {
        consecutiveCount = 0; // Reset upon off or leave
      }
    }
  });

  // --------------------------------------------------------------------------
  // AUDIT 3: Overall Operational Metrics & SLA Health
  // --------------------------------------------------------------------------
  const criticalGapsCount = conflicts.filter((c) => c.severity === 'CRITICAL_GAP').length;
  const understaffedCount = conflicts.filter((c) => c.severity === 'UNDERSTAFFED').length;
  const overloadCount = conflicts.filter((c) => c.severity === 'OVERLOAD').length;

  const slaPercentage = totalRequiredSlots > 0 ? parseFloat(((coveredSlots / totalRequiredSlots) * 100).toFixed(1)) : 100.0;

  return {
    conflicts,
    metrics: {
      totalRequiredSlots,
      coveredSlots,
      slaPercentage,
      criticalGapsCount,
      understaffedCount,
      overloadCount,
      totalConflicts: conflicts.length,
    },
  };
};

module.exports = { validateRoster };
