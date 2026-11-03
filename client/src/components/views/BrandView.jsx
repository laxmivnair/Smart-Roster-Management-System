import React, { useState } from 'react';
import { Building2, CheckCircle2, AlertOctagon, AlertTriangle, Minus, Filter } from 'lucide-react';

export default function BrandView({ roster, brands, processes, employees }) {
  const [tierFilter, setTierFilter] = useState('ALL');

  if (!roster || !brands || !processes) return null;

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const empMap = new Map(employees.map((e) => [e._id, e]));

  // Index entries by `${date}_${brandId}` -> list of working employees
  const workingByDateBrand = new Map();
  roster.entries.forEach((e) => {
    if (e.status === 'WORKING' && e.brandId) {
      const key = `${e.date}_${e.brandId}`;
      if (!workingByDateBrand.has(key)) workingByDateBrand.set(key, []);
      workingByDateBrand.get(key).push(e);
    }
  });

  const filteredBrands = brands.filter((b) => {
    if (tierFilter === 'ALL') return true;
    return b.tier === tierFilter;
  });

  return (
    <div className="space-y-4">
      {/* Tier Filter & Legend */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">Filter Tier:</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setTierFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                tierFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Brands (15)
            </button>
            <button
              onClick={() => setTierFilter('SINGLE_RESOURCE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                tierFilter === 'SINGLE_RESOURCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Single-Resource (80% / 12)
            </button>
            <button
              onClick={() => setTierFilter('MULTI_RESOURCE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                tierFilter === 'MULTI_RESOURCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Multi-Resource (20% / 3)
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-[11px] font-medium text-slate-600">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fully Covered</span>
          </span>
          <span className="flex items-center space-x-1">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            <span>Critical Gap (0 Staff)</span>
          </span>
          <span className="flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Understaffed</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-400">
            <Minus className="w-3.5 h-3.5 text-slate-300" />
            <span>Closed</span>
          </span>
        </div>
      </div>

      {/* Brand Compliance Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[640px]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-20 border-b border-slate-200">
              <tr>
                <th className="p-3 sticky left-0 z-30 bg-slate-50 min-w-[260px] font-bold text-slate-800 border-r border-slate-200">
                  Brand & Process Operations
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const dateObj = new Date(roster.year, roster.month - 1, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <th
                      key={day}
                      className={`p-2 min-w-[38px] text-center font-semibold border-r border-slate-100 ${
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
              {filteredBrands.map((brand) => {
                const brandProcs = processes.filter(
                  (p) => p.brandId?._id === brand._id || p.brandId === brand._id
                );

                return brandProcs.map((proc, pIdx) => {
                  const isSingle = brand.tier === 'SINGLE_RESOURCE';
                  return (
                    <tr key={`${brand._id}_${proc._id}`} className="hover:bg-slate-50/60">
                      {/* Brand Info Cell */}
                      <td className="p-2.5 sticky left-0 z-10 bg-white border-r border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{brand.name}</span>
                              <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                {proc.processType}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {isSingle ? '80% Dedicated Staff' : 'Multi-Staff'} • {proc.operatingCalendar.replace('_EXCEPT_HOLIDAYS', '').replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Daily Coverage Status Cells */}
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const d = String(day).padStart(2, '0');
                        const m = String(roster.month).padStart(2, '0');
                        const dateStr = `${roster.year}-${m}-${d}`;

                        const procKey = `${brand._id}_${proc.processType}`;
                        const required = roster.demandMatrix?.[dateStr]?.[procKey] || 0;

                        if (required === 0) {
                          // Closed today
                          return (
                            <td key={day} className="p-1 text-center border-r border-slate-100 text-slate-300">
                              <Minus className="w-3.5 h-3.5 mx-auto" />
                            </td>
                          );
                        }

                        // Count working staff
                        const workingEntries = workingByDateBrand.get(`${dateStr}_${brand._id}`) || [];
                        const activeCount = isSingle
                          ? workingEntries.length
                          : workingEntries.filter((e) => e.processId === proc._id).length;

                        if (activeCount === 0) {
                          return (
                            <td
                              key={day}
                              className="p-1 text-center border-r border-slate-100 bg-rose-50/70"
                              title={`CRITICAL GAP on ${dateStr}: 0/${required} staff present for ${brand.name} ${proc.processType}`}
                            >
                              <div className="w-5 h-5 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[9px] shadow-sm">
                                0
                              </div>
                            </td>
                          );
                        }

                        if (activeCount < required) {
                          return (
                            <td
                              key={day}
                              className="p-1 text-center border-r border-slate-100 bg-amber-50/70"
                              title={`UNDERSTAFFED on ${dateStr}: ${activeCount}/${required} staff present`}
                            >
                              <div className="w-5 h-5 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[9px]">
                                {activeCount}
                              </div>
                            </td>
                          );
                        }

                        // Fully covered
                        const coveringEmp = empMap.get(workingEntries[0]?.employeeId);
                        const initials = coveringEmp ? coveringEmp.name.split(' ').map((n) => n[0]).join('') : '✓';

                        return (
                          <td
                            key={day}
                            className="p-1 text-center border-r border-slate-100"
                            title={`Covered by: ${coveringEmp?.name || 'Staff'}`}
                          >
                            <div className="w-5 h-5 mx-auto rounded bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold text-[9px]">
                              {initials}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
