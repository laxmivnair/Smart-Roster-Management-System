import React, { useState } from 'react';
import { X, AlertTriangle, AlertOctagon, CheckCircle2, UserPlus, ShieldAlert } from 'lucide-react';

export default function ConflictDrawer({
  isOpen,
  onClose,
  conflicts,
  onApplyBackup,
}) {
  if (!isOpen) return null;

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [applyingId, setApplyingId] = useState(null);

  const filteredConflicts = (conflicts || []).filter((c) => {
    if (severityFilter === 'ALL') return true;
    return c.severity === severityFilter;
  });

  const handleApply = async (conflict, candidate) => {
    setApplyingId(`${conflict.id}_${candidate.employeeId}`);
    try {
      await onApplyBackup({
        date: conflict.date,
        brandId: conflict.brandId,
        processId: candidate.processId || conflict.processId,
        backupEmployeeId: candidate.employeeId,
      });
    } catch (err) {
      alert(`Failed to apply backup: ${err.message}`);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Audit & Conflict Resolution Center
              </h2>
              <p className="text-xs text-slate-500">
                {conflicts?.length || 0} active scheduling issues identified
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Severity Filter Tabs */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-500">Filter:</span>
          {['ALL', 'CRITICAL_GAP', 'UNDERSTAFFED', 'OVERLOAD'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                severityFilter === sev
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Conflict List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100">
          {filteredConflicts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-medium text-xs">No conflicts matching current filter!</p>
            </div>
          ) : (
            filteredConflicts.map((c) => {
              const isCritical = c.severity === 'CRITICAL_GAP';
              const badgeClass = isCritical
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : 'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div key={c.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                  {/* Top line: Date & Severity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeClass}`}>
                        {c.severity.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-slate-800">{c.date}</span>
                    </div>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[10px]">
                      {c.brandName} • {c.processType}
                    </span>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                    <p className="font-medium text-slate-800">{c.explanation}</p>
                    <p className="text-[11px] text-indigo-700 font-semibold mt-1">
                      💡 Recommended Action: {c.suggestedResolution}
                    </p>
                  </div>

                  {/* Candidate Replacement Quick-Assign */}
                  {c.candidateReplacements && c.candidateReplacements.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Available Qualified Pod Candidates:
                      </p>
                      {c.candidateReplacements.slice(0, 3).map((cand) => {
                        const isApplying = applyingId === `${c.id}_${cand.employeeId}`;
                        return (
                          <div
                            key={cand.employeeId}
                            className="p-2 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{cand.name}</p>
                              <p className="text-[10px] text-slate-500">
                                Skills: {cand.skills?.join(', ')} • Status: {cand.currentStatus}
                              </p>
                            </div>
                            <button
                              onClick={() => handleApply(c, cand)}
                              disabled={isApplying}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1 shadow-sm transition-colors disabled:opacity-50"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>{isApplying ? 'Assigning...' : 'Assign Cover'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
