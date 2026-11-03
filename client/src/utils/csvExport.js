/**
 * Formats the monthly roster into CSV and triggers browser download
 */
export const exportRosterToCSV = (roster, employees, brands, processes) => {
  if (!roster || !roster.entries || !employees) return;

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const brandMap = new Map(brands.map((b) => [b._id, b.code || b.name]));

  // CSV Headers
  const headers = ['Employee Name', 'Role', 'Pod'];
  for (let day = 1; day <= daysInMonth; day++) {
    headers.push(`Day ${day}`);
  }
  headers.push('Total Working', 'Total Offs', 'Total Leaves');

  const rows = [headers];

  // Group entries by employeeId
  const entriesByEmp = new Map();
  roster.entries.forEach((e) => {
    const empId = e.employeeId;
    if (!entriesByEmp.has(empId)) entriesByEmp.set(empId, []);
    entriesByEmp.get(empId).push(e);
  });

  employees.forEach((emp) => {
    const empEntries = entriesByEmp.get(emp._id) || [];
    let workingCount = 0;
    let offCount = 0;
    let leaveCount = 0;

    const row = [
      `"${emp.name}"`,
      `"${emp.role}"`,
      `"${emp.podId?.name || 'General Pod'}"`,
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = String(day).padStart(2, '0');
      const m = String(roster.month).padStart(2, '0');
      const dateStr = `${roster.year}-${m}-${d}`;

      const entry = empEntries.find((e) => e.date === dateStr);
      let cellText = '-';

      if (entry) {
        if (entry.status === 'WORKING') {
          workingCount++;
          const brandCode = entry.brandId ? brandMap.get(entry.brandId) || 'Brand' : 'W';
          cellText = entry.isCrossCoverage ? `${brandCode}* (Backup)` : brandCode;
        } else if (entry.status === 'WEEKLY_OFF') {
          offCount++;
          cellText = 'OFF';
        } else if (entry.status === 'LEAVE' || entry.status === 'COMP_OFF') {
          leaveCount++;
          cellText = entry.status;
        } else if (entry.status === 'PUBLIC_HOLIDAY') {
          cellText = 'HOLIDAY';
        }
      }

      row.push(`"${cellText}"`);
    }

    row.push(workingCount, offCount, leaveCount);
    rows.push(row);
  });

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DataStraw_Roster_${roster.year}_${roster.month}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
