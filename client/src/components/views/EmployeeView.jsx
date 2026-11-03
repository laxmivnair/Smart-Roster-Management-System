import React, { useState } from 'react';
import { UserCheck, Calendar, Briefcase, Award, Star, Clock } from 'lucide-react';

export default function EmployeeView({ roster, employees, brands, onCellClick }) {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?._id || '');

  if (!roster || !employees) return null;

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const brandMap = new Map(brands.map((b) => [b._id, b.name]));

  const employee = employees.find((e) => e._id === selectedEmpId) || employees[0];

  // Employee entries
  const empEntries = roster.entries.filter((e) => e.employeeId === employee?._id);

  const workingShifts = empEntries.filter((e) => e.status === 'WORKING').length;
  const weeklyOffs = empEntries.filter((e) => e.status === 'WEEKLY_OFF').length;
  const leaves = empEntries.filter((e) => e.status === 'LEAVE' || e.status === 'COMP_OFF').length;
  const backupShifts = empEntries.filter((e) => e.isCrossCoverage).length;

  return (
    <div className="space-y-4">
      {/* Employee Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            {employee?.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{employee?.name}</h2>
            <p className="text-xs text-slate-500">{employee?.role} • {employee?.podId?.name}</p>
          </div>
        </div>

        {/* Dropdown to switch employee */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">Select Employee:</span>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.podId?.code?.replace('POD_', '')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-blue-600 font-semibold mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Working Shifts</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{workingShifts}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Assigned client shifts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-slate-600 font-semibold mb-1">
            <Clock className="w-4 h-4" />
            <span>Weekly Offs</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{weeklyOffs}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Pref: {employee?.defaultWeeklyOffDays?.join(', ')}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-600 font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>Leaves & Comp-Offs</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{leaves}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Approved time off</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-purple-600 font-semibold mb-1">
            <Star className="w-4 h-4 fill-purple-600" />
            <span>Backup Shifts</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{backupShifts}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Cross-coverage assists</p>
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Personal Schedule: November 2026
        </h3>

        {/* 7 Day Column Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 text-xs">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const d = String(day).padStart(2, '0');
            const m = String(roster.month).padStart(2, '0');
            const dateStr = `${roster.year}-${m}-${d}`;
            const dateObj = new Date(roster.year, roster.month - 1, day);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            const entry = empEntries.find((e) => e.date === dateStr);

            let bgClass = 'bg-slate-50 border-slate-200 text-slate-700';
            let statusText = 'Working';

            if (entry) {
              if (entry.status === 'WORKING') {
                bgClass = entry.isCrossCoverage
                  ? 'bg-purple-50 border-purple-300 text-purple-900 ring-1 ring-purple-200'
                  : 'bg-blue-50 border-blue-200 text-blue-900';
                statusText = entry.brandId ? brandMap.get(entry.brandId) || 'Active Shift' : 'Shift';
              } else if (entry.status === 'WEEKLY_OFF') {
                bgClass = 'bg-slate-100 border-slate-200 text-slate-500';
                statusText = 'Weekly Off';
              } else if (entry.status === 'LEAVE' || entry.status === 'COMP_OFF') {
                bgClass = 'bg-amber-50 border-amber-300 text-amber-900';
                statusText = entry.status === 'COMP_OFF' ? 'Comp-Off' : 'Leave';
              } else if (entry.status === 'PUBLIC_HOLIDAY') {
                bgClass = 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold';
                statusText = 'Public Holiday';
              }
            }

            return (
              <div
                key={day}
                onClick={() => onCellClick({ date: dateStr, employee, entry })}
                className={`min-h-[72px] p-2.5 rounded-lg border cursor-pointer hover:shadow-sm transition-all flex flex-col justify-between ${bgClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${isWeekend ? 'text-indigo-600' : 'text-slate-800'}`}>
                    {day}
                  </span>
                  {entry?.isCrossCoverage && (
                    <span className="p-0.5 bg-purple-200 rounded text-purple-700" title="Cross-Coverage Backup">
                      <Star className="w-2.5 h-2.5 fill-purple-600" />
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  <p className="text-[11px] font-semibold truncate leading-tight">{statusText}</p>
                  {entry?.notes && (
                    <p className="text-[9px] text-slate-400 truncate mt-0.5">{entry.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
