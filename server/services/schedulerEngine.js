const Pod = require('../models/Pod');
const Employee = require('../models/Employee');
const Brand = require('../models/Brand');
const BrandProcess = require('../models/BrandProcess');
const ResourceAllocation = require('../models/ResourceAllocation');
const LeaveSchedule = require('../models/LeaveSchedule');

// Gazetted Public Holidays for 2026 (YYYY-MM-DD)
const GAZETTED_HOLIDAYS_2026 = {
  '2026-01-26': 'Republic Day',
  '2026-03-04': 'Holi',
  '2026-04-03': 'Good Friday',
  '2026-04-14': 'Ambedkar Jayanti',
  '2026-05-01': 'May Day',
  '2026-08-15': 'Independence Day',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-10-20': 'Dussehra',
  '2026-11-01': 'Diwali',
  '2026-11-15': 'Guru Nanak Jayanti',
  '2026-12-25': 'Christmas',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatDate = (year, month, day) => {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const isProcessOperatingOnDate = (operatingCalendar, dateStr, dayOfWeekIndex) => {
  const isHoliday = !!GAZETTED_HOLIDAYS_2026[dateStr];
  const isSunday = dayOfWeekIndex === 0;
  const isSaturday = dayOfWeekIndex === 6;

  switch (operatingCalendar) {
    case 'EVERYDAY_365':
      return true;
    case 'EXCEPT_HOLIDAYS':
      return !isHoliday;
    case 'MON_SAT_EXCEPT_HOLIDAYS':
      return !isSunday && !isHoliday;
    case 'MON_FRI_EXCEPT_HOLIDAYS':
      return !isSunday && !isSaturday && !isHoliday;
    default:
      return true;
  }
};

/**
 * Core Roster Generation Engine
 * Generates an end-to-end schedule honoring strict labor laws (no silent overwork).
 */
const generateMonthlyRoster = async (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. Fetch all collections
  const [pods, employees, brands, processes, allocations, leaves] = await Promise.all([
    Pod.find({}).lean(),
    Employee.find({ isActive: true }).lean(),
    Brand.find({}).lean(),
    BrandProcess.find({}).lean(),
    ResourceAllocation.find({}).lean(),
    LeaveSchedule.find({
      date: { $gte: formatDate(year, month, 1), $lte: formatDate(year, month, daysInMonth) },
      status: 'APPROVED',
    }).lean(),
  ]);

  const employeeMap = new Map(employees.map((e) => [e._id.toString(), e]));
  const brandMap = new Map(brands.map((b) => [b._id.toString(), b]));
  const processMap = new Map(processes.map((p) => [p._id.toString(), p]));

  // Primary allocations per employee
  const empAllocMap = new Map();
  allocations.forEach((alloc) => {
    const empId = alloc.employeeId.toString();
    if (!empAllocMap.has(empId)) empAllocMap.set(empId, []);
    empAllocMap.get(empId).push(alloc);
  });

  // Allocations per brand-process
  const processAllocMap = new Map();
  allocations.forEach((alloc) => {
    const proc = processMap.get(alloc.processId.toString());
    if (proc) {
      const key = `${alloc.brandId.toString()}_${proc.processType}`;
      if (!processAllocMap.has(key)) processAllocMap.set(key, []);
      processAllocMap.get(key).push(alloc);
    }
  });

  // Leave map
  const leaveMap = new Map();
  leaves.forEach((l) => {
    leaveMap.set(`${l.employeeId.toString()}_${l.date}`, l);
  });

  // --------------------------------------------------------------------------
  // STAGE 1: Demand Matrix Calculation
  // --------------------------------------------------------------------------
  const demandMatrix = {};
  let totalRequiredShiftSlots = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    demandMatrix[dateStr] = {};

    processes.forEach((proc) => {
      const brand = brandMap.get(proc.brandId.toString());
      if (!brand) return;

      const isOperating = isProcessOperatingOnDate(proc.operatingCalendar, dateStr, dayOfWeek);
      let required = 0;

      if (isOperating) {
        if (brand.code === 'LUXELIVING' && (dayOfWeek === 0 || dayOfWeek === 6)) {
          required = 1;
        } else {
          required = proc.minDailyStaffing || 1;
        }
      }

      const key = `${proc.brandId.toString()}_${proc.processType}`;
      demandMatrix[dateStr][key] = required;
      totalRequiredShiftSlots += required;
    });
  }

  // --------------------------------------------------------------------------
  // STAGE 2 & 3: Primary Staff Allocation & Guaranteed Weekly Off Planning
  // --------------------------------------------------------------------------
  const entriesMap = new Map();
  const empConsecutiveWorkDays = new Map();
  employees.forEach((e) => empConsecutiveWorkDays.set(e._id.toString(), 0));

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeekIndex = dateObj.getDay();
    const dayOfWeekName = DAY_NAMES[dayOfWeekIndex];
    const isHoliday = !!GAZETTED_HOLIDAYS_2026[dateStr];

    employees.forEach((emp) => {
      const empId = emp._id.toString();
      const currentConsecutive = empConsecutiveWorkDays.get(empId) || 0;
      const leaveRecord = leaveMap.get(`${empId}_${dateStr}`);
      const empAllocs = empAllocMap.get(empId) || [];
      const primaryAlloc = empAllocs.find((a) => a.roleType === 'PRIMARY') || empAllocs[0];

      // A. Hard Constraint: Approved Leave
      if (leaveRecord) {
        entriesMap.set(`${dateStr}_${empId}`, {
          date: dateStr,
          employeeId: emp._id,
          brandId: primaryAlloc ? primaryAlloc.brandId : null,
          processId: primaryAlloc ? primaryAlloc.processId : null,
          status: leaveRecord.type === 'COMP_OFF' ? 'COMP_OFF' : 'LEAVE',
          isCrossCoverage: false,
          notes: leaveRecord.reason || 'Approved leave',
        });
        empConsecutiveWorkDays.set(empId, 0);
        return;
      }

      // B. Public Holiday Check
      let isHolidayOff = false;
      if (isHoliday && primaryAlloc) {
        const proc = processMap.get(primaryAlloc.processId.toString());
        if (proc && proc.operatingCalendar !== 'EVERYDAY_365') {
          isHolidayOff = true;
        }
      }

      if (isHolidayOff) {
        entriesMap.set(`${dateStr}_${empId}`, {
          date: dateStr,
          employeeId: emp._id,
          brandId: primaryAlloc.brandId,
          processId: primaryAlloc.processId,
          status: 'PUBLIC_HOLIDAY',
          isCrossCoverage: false,
          notes: GAZETTED_HOLIDAYS_2026[dateStr],
        });
        empConsecutiveWorkDays.set(empId, 0);
        return;
      }

      // C. Mandatory Weekly Off
      const isDefaultOff = emp.defaultWeeklyOffDays.includes(dayOfWeekName);
      const mustTakeOff = currentConsecutive >= (emp.maxConsecutiveDays || 6);

      let brandClosedToday = false;
      if (primaryAlloc) {
        const proc = processMap.get(primaryAlloc.processId.toString());
        if (proc && !isProcessOperatingOnDate(proc.operatingCalendar, dateStr, dayOfWeekIndex)) {
          brandClosedToday = true;
        }
      }

      if (isDefaultOff || mustTakeOff || brandClosedToday) {
        entriesMap.set(`${dateStr}_${empId}`, {
          date: dateStr,
          employeeId: emp._id,
          brandId: primaryAlloc ? primaryAlloc.brandId : null,
          processId: primaryAlloc ? primaryAlloc.processId : null,
          status: 'WEEKLY_OFF',
          isCrossCoverage: false,
          notes: mustTakeOff ? 'Mandatory Off (Max 6 consecutive work days)' : 'Weekly Off',
        });
        empConsecutiveWorkDays.set(empId, 0);
        return;
      }

      // D. Working Shift
      entriesMap.set(`${dateStr}_${empId}`, {
        date: dateStr,
        employeeId: emp._id,
        brandId: primaryAlloc ? primaryAlloc.brandId : null,
        processId: primaryAlloc ? primaryAlloc.processId : null,
        status: 'WORKING',
        isCrossCoverage: false,
        notes: 'Primary Shift',
      });
      empConsecutiveWorkDays.set(empId, currentConsecutive + 1);
    });
  }

  // --------------------------------------------------------------------------
  // STAGE 4: Pod-Level Backup Discovery (Strict Fatigue/Legal Check)
  // An employee can only be assigned backup if:
  // 1. Their primary brand is closed today (e.g. Mon-Sat brand on Sunday) AND their official weekly off is a different day.
  // 2. OR they are designated as a cross-trained floating backup.
  // 3. AND working today does NOT exceed max 6 consecutive days.
  // --------------------------------------------------------------------------
  let totalSuccessfulBackups = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeekName = DAY_NAMES[dateObj.getDay()];

    for (const proc of processes) {
      const brand = brandMap.get(proc.brandId.toString());
      if (!brand) continue;

      const procKey = `${proc.brandId.toString()}_${proc.processType}`;
      const requiredStaff = demandMatrix[dateStr][procKey] || 0;
      if (requiredStaff === 0) continue;

      // Count working staff
      const assignedAllocs = processAllocMap.get(procKey) || [];
      const currentWorkingStaff = [];

      assignedAllocs.forEach((alloc) => {
        const entry = entriesMap.get(`${dateStr}_${alloc.employeeId.toString()}`);
        if (
          entry &&
          entry.status === 'WORKING' &&
          entry.brandId &&
          entry.brandId.toString() === proc.brandId.toString()
        ) {
          if (brand.tier === 'SINGLE_RESOURCE') {
            currentWorkingStaff.push(alloc.employeeId.toString());
          } else if (entry.processId && entry.processId.toString() === proc._id.toString()) {
            currentWorkingStaff.push(alloc.employeeId.toString());
          }
        }
      });

      const deficit = requiredStaff - currentWorkingStaff.length;
      if (deficit > 0) {
        // Look for pod peers whose assigned brand is closed today,
        // BUT today is NOT their personal contractual weekly off day!
        const podPeers = employees.filter(
          (e) => e.podId.toString() === brand.podId.toString() && !currentWorkingStaff.includes(e._id.toString())
        );

        for (const peer of podPeers) {
          const peerId = peer._id.toString();
          const peerEntry = entriesMap.get(`${dateStr}_${peerId}`);
          if (!peerEntry) continue;

          const hasSkill = peer.skills.includes(proc.processType);
          if (!hasSkill) continue;

          // Crucial: Peer CANNOT work if today is their contractual weekly off day
          const isContractualOff = peer.defaultWeeklyOffDays.includes(dayOfWeekName);
          if (isContractualOff) continue;

          // Peer CANNOT work if they are on leave
          if (peerEntry.status === 'LEAVE' || peerEntry.status === 'COMP_OFF') continue;

          // Peer must have capacity (consecutive work days < 6)
          const peerConsecutive = empConsecutiveWorkDays.get(peerId) || 0;
          if (peerConsecutive >= (peer.maxConsecutiveDays || 6)) continue;

          // If peer's brand was closed, they are available to cover without burnout!
          if (peerEntry.status === 'WEEKLY_OFF' || peerEntry.status === 'PUBLIC_HOLIDAY') {
            const primaryAlloc = assignedAllocs.find((a) => a.roleType === 'PRIMARY') || assignedAllocs[0];

            peerEntry.status = 'WORKING';
            peerEntry.brandId = proc.brandId;
            peerEntry.processId = proc._id;
            peerEntry.isCrossCoverage = true;
            peerEntry.coveredForEmployeeId = primaryAlloc ? primaryAlloc.employeeId : null;
            peerEntry.notes = `Cross-Coverage Backup for ${brand.name} (${proc.processType})`;

            empConsecutiveWorkDays.set(peerId, peerConsecutive + 1);
            totalSuccessfulBackups++;
            currentWorkingStaff.push(peerId);

            if (currentWorkingStaff.length >= requiredStaff) {
              break;
            }
          }
        }
      }
    }
  }

  const entriesArray = Array.from(entriesMap.values());

  // Calculate coverage summary
  let coveredSlots = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);

    for (const proc of processes) {
      const brand = brandMap.get(proc.brandId.toString());
      if (!brand) continue;

      const procKey = `${proc.brandId.toString()}_${proc.processType}`;
      const required = demandMatrix[dateStr][procKey] || 0;
      if (required === 0) continue;

      let workingCount = 0;
      entriesArray.forEach((e) => {
        if (
          e.date === dateStr &&
          e.status === 'WORKING' &&
          e.brandId &&
          e.brandId.toString() === proc.brandId.toString()
        ) {
          if (brand.tier === 'SINGLE_RESOURCE') {
            workingCount++;
          } else if (e.processId && e.processId.toString() === proc._id.toString()) {
            workingCount++;
          }
        }
      });

      coveredSlots += Math.min(workingCount, required);
    }
  }

  const slaPercentage = totalRequiredShiftSlots > 0 ? ((coveredSlots / totalRequiredShiftSlots) * 100).toFixed(1) : 100;

  return {
    month,
    year,
    daysInMonth,
    entries: entriesArray,
    demandMatrix,
    coverageSummary: {
      totalRequiredShiftSlots,
      coveredSlots,
      slaPercentage: parseFloat(slaPercentage),
      totalSuccessfulBackups,
    },
  };
};

module.exports = {
  generateMonthlyRoster,
  GAZETTED_HOLIDAYS_2026,
  isProcessOperatingOnDate,
  formatDate,
};
