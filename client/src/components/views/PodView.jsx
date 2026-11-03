import React, { useState } from 'react';
import { Layers, ShieldCheck, UserCheck, Star } from 'lucide-react';

export default function PodView({ roster, pods, employees, brands, onCellClick }) {
  const [selectedPodId, setSelectedPodId] = useState(pods[0]?._id || '');

  if (!roster || !pods || !employees) return null;

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const brandMap = new Map(brands.map((b) => [b._id, b.code || b.name]));

  // Index entries by `${date}_${empId}`
  const entryMap = new Map();
  roster.entries.forEach((e) => {
    entryMap.set(`${e.date}_${e.employeeId}`, e);
  });

  const activePod = pods.find((p) => p._id === selectedPodId) || pods[0];
  const podEmployees = employees.filter((e) => e.podId?._id === activePod?._id || e.podId === activePod?._id);

  // Pod stats
  const podBackupsCount = roster.entries.filter((e) => {
    const emp = podEmployees.find((p) => p._id === e.employeeId);
    return emp && e.isCrossCoverage;
  }).length;

  return (
    <div className="space-y-4">
      {/* Pod Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pods.map((pod) => {
          const isSelected = (activePod?._id === pod._id);
          const members = employees.filter((e) => e.podId?._id === pod._id || e.podId === pod._id);
          return (
            <div
              key={pod._id}
              onClick={() => setSelectedPodId(pod._id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                  {pod.code}
                </span>
                <span className="text-xs text-slate-500 font-medium">{members.length} Associates</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{pod.name}</h3>
              <div className="mt-2 text-xs text-slate-600 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Lead: <strong>{pod.leadId?.name || 'Assigned Lead'}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pod Overview Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">{activePod?.name} Operations Grid</h2>
          <p className="text-xs text-slate-500">{activePod?.description}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg flex items-center space-x-1.5">
            <Star className="w-3.5 h-3.5 fill-purple-600" />
            <span><strong>{podBackupsCount}</strong> Internal Cross-Coverages Deployed</span>
          </div>
        </div>
      </div>

      {/* Pod Members Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-20 border-b border-slate-200">
              <tr>
                <th className="p-3 sticky left-0 z-30 bg-slate-50 min-w-[200px] font-bold text-slate-800 border-r border-slate-200">
                  Associate ({podEmployees.length})
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateObj = new Date(roster.year, roster.month - 1, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <th
                      key={day}
                      className={`p-2 min-w-[40px] text-center font-semibold border-r border-slate-100 ${
                        isWeekend ? 'bg-slate-100 text-slate-800' : ''
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {podEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50/60">
                  <td className="p-2.5 sticky left-0 z-10 bg-white border-r border-slate-200">
                    <p className="font-semibold text-slate-900">{emp.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {emp.role === 'POD_LEAD' ? '⭐ Pod Lead' : emp.role} • Skills: {emp.skills.join(', ')}
                    </p>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const d = String(day).padStart(2, '0');
                    const m = String(roster.month).padStart(2, '0');
                    const dateStr = `${roster.year}-${m}-${d}`;
                    const entry = entryMap.get(`${dateStr}_${emp._id}`);

                    let badgeClass = 'bg-slate-100 text-slate-400';
                    let label = '-';

                    if (entry) {
                      if (entry.status === 'WORKING') {
                        badgeClass = entry.isCrossCoverage
                          ? 'bg-purple-600 text-white font-bold ring-1 ring-purple-300'
                          : 'bg-blue-600 text-white font-medium';
                        const code = entry.brandId ? brandMap.get(entry.brandId) || 'W' : 'W';
                        label = code.slice(0, 3).toUpperCase();
                      } else if (entry.status === 'WEEKLY_OFF') {
                        badgeClass = 'bg-slate-100 text-slate-500 font-semibold';
                        label = 'OFF';
                      } else if (entry.status === 'LEAVE') {
                        badgeClass = 'bg-amber-100 text-amber-800 font-bold';
                        label = 'LV';
                      } else if (entry.status === 'PUBLIC_HOLIDAY') {
                        badgeClass = 'bg-indigo-100 text-indigo-800 font-bold';
                        label = 'PH';
                      }
                    }

                    return (
                      <td
                        key={day}
                        onClick={() => onCellClick({ date: dateStr, employee: emp, entry })}
                        className="p-1 text-center border-r border-slate-100 cursor-pointer hover:opacity-80"
                      >
                        <div className={`w-full py-1 rounded text-[10px] ${badgeClass}`}>
                          {label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
