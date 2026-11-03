import React from 'react';
import {
  Calendar,
  Users,
  Building2,
  Layers,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Download,
  Activity,
  Flame,
} from 'lucide-react';

export default function Header({
  month,
  year,
  onMonthChange,
  roster,
  loading,
  onGenerate,
  onResetSeed,
  onExportCSV,
  onOpenSimulateModal,
  onOpenConflictDrawer,
}) {
  const metrics = roster?.metrics || {
    slaPercentage: 100,
    criticalGapsCount: 0,
    understaffedCount: 0,
    totalConflicts: 0,
  };

  const sla = metrics.slaPercentage || 0;
  const slaColor =
    sla >= 90 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    sla >= 75 ? 'text-amber-600 bg-amber-50 border-amber-200' :
    'text-rose-600 bg-rose-50 border-rose-200';

  const progressBarColor =
    sla >= 90 ? 'bg-emerald-500' :
    sla >= 75 ? 'bg-amber-500' :
    'bg-rose-500';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">DataStraw Operations</h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                Smart Roster v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500">Autonomous Monthly Roster & Multi-Account SLA Engine</p>
          </div>
        </div>

        {/* Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month Picker */}
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={month}
              onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value={10}>October 2026</option>
              <option value={11}>November 2026</option>
              <option value={12}>December 2026</option>
            </select>
          </div>

          {/* Simulate Disruption Button (Section 3F) */}
          <button
            onClick={onOpenSimulateModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            title="Simulate sudden sick leave on a single-resource brand"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Simulate Disruption (3F)</span>
          </button>

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Solving...' : 'Generate Roster'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            title="Export roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetSeed}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs transition-colors"
            title="Reset to clean 32-employee seed dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {/* SLA Health & KPI Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* SLA Progress Bar */}
          <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
            <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${slaColor}`}>
              <Activity className="w-3.5 h-3.5" />
              <span>{sla}% SLA Met</span>
            </div>
            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden max-w-xs">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                style={{ width: `${Math.min(sla, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 hidden md:inline">
              {metrics.coveredSlots || 0} / {metrics.totalRequiredSlots || 0} required shifts fulfilled
            </span>
          </div>

          {/* KPI Chips */}
          <div className="flex items-center space-x-3 text-slate-600">
            <span className="flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-800">32</strong> Staff
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-800">15</strong> Brands (80% Single)
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-800">3</strong> Pods
            </span>
            <span className="text-slate-300">•</span>

            {/* Conflict Drawer Trigger */}
            <button
              onClick={onOpenConflictDrawer}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full font-semibold transition-colors ${
                metrics.totalConflicts > 0
                  ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 animate-pulse'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{metrics.totalConflicts} Conflicts</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
