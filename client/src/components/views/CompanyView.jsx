import React, { useState } from 'react';
import { Search, Star, Filter } from 'lucide-react';

export default function CompanyView({ roster, employees, brands, onCellClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPod, setSelectedPod] = useState('ALL');

  if (!roster || !employees) return null;

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const brandMap = new Map(brands.map((b) => [b._id, b.code || b.name]));

  // Index entries by `${date}_${empId}`
  const entryMap = new Map();
  roster.entries.forEach((e) => {
    entryMap.set(`${e.date}_${e.employeeId}`, e);
  });

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPod = selectedPod === 'ALL' || emp.podId?._id === selectedPod || emp.podId === selectedPod;
    return matchesSearch && matchesPod;
  });

  return (
    <div className="space-y-4">
      {/* Search & Legend Controls */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by employee name or skill (e.g. CS, Rahul, NDR)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedPod}
            onChange={(e) => setSelectedPod(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Pods (Alpha, Beta, Gamma)</option>
            <option value="POD_ALPHA">Pod Alpha</option>
            <option value="POD_BETA">Pod Beta</option>
            <option value="POD_GAMMA">Pod Gamma</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>Working</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
            <span>Cross-Backup ⭐</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
            <span>Off</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
            <span>Leave</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-indigo-400 inline-block" />
            <span>Holiday</span>
          </span>
        </div>
      </div>

      {/* Roster Grid Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full border-collapse text-left text-xs">
            {/* Header: Days of the Month */}
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-20 shadow-sm border-b border-slate-200">
              <tr>
                <th className="p-3 sticky left-0 z-30 bg-slate-50 min-w-[220px] font-bold text-slate-800 border-r border-slate-200">
                  Employee ({filteredEmployees.length})
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateObj = new Date(roster.year, roster.month - 1, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  const dayLetters = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dateObj.getDay()];

                  return (
                    <th
                      key={day}
                      className={`p-2 min-w-[44px] text-center font-semibold border-r border-slate-100 ${
                        isWeekend ? 'bg-slate-100/70 text-slate-800' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-bold">{dayLetters}</div>
                      <div>{day}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Body: Employees */}
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => {
                const podCode = emp.podId?.code || 'POD';
                return (
                  <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee Profile Cell */}
                    <td className="p-2.5 sticky left-0 z-10 bg-white border-r border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{emp.name}</p>
                          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                            <span className="font-mono text-slate-500">{podCode.replace('POD_', '')}</span>
                            <span>•</span>
                            <span>{emp.role === 'POD_LEAD' ? 'Lead' : emp.role === 'SENIOR_ASSOCIATE' ? 'Sr. Assoc' : 'Assoc'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const d = String(day).padStart(2, '0');
                      const m = String(roster.month).padStart(2, '0');
                      const dateStr = `${roster.year}-${m}-${d}`;
                      const entry = entryMap.get(`${dateStr}_${emp._id}`);

                      let badgeClass = 'bg-slate-100 text-slate-400';
                      let label = '-';
                      let isBackup = false;

                      if (entry) {
                        if (entry.status === 'WORKING') {
                          isBackup = entry.isCrossCoverage;
                          badgeClass = isBackup
                            ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-300'
                            : 'bg-blue-600 text-white font-medium';
                          const code = entry.brandId ? brandMap.get(entry.brandId) || 'W' : 'W';
                          label = code.slice(0, 3).toUpperCase();
                        } else if (entry.status === 'WEEKLY_OFF') {
                          badgeClass = 'bg-slate-100 text-slate-500 font-semibold';
                          label = 'OFF';
                        } else if (entry.status === 'LEAVE' || entry.status === 'COMP_OFF') {
                          badgeClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
                          label = entry.status === 'COMP_OFF' ? 'CO' : 'LV';
                        } else if (entry.status === 'PUBLIC_HOLIDAY') {
                          badgeClass = 'bg-indigo-100 text-indigo-800 font-bold';
                          label = 'PH';
                        }
                      }

                      return (
                        <td
                          key={day}
                          onClick={() => onCellClick({ date: dateStr, employee: emp, entry })}
                          className="p-1 text-center border-r border-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
                          title={`${emp.name} on ${dateStr}: ${entry?.status || 'Unknown'} ${entry?.notes ? `(${entry.notes})` : ''}`}
                        >
                          <div
                            className={`w-full py-1 rounded text-[10px] tracking-tight flex items-center justify-center space-x-0.5 ${badgeClass}`}
                          >
                            <span>{label}</span>
                            {isBackup && <Star className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
