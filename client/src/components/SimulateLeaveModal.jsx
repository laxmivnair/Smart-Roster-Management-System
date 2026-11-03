import React, { useState } from 'react';
import { X, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function SimulateLeaveModal({
  isOpen,
  onClose,
  employees,
  brands,
  onSimulate,
}) {
  if (!isOpen) return null;

  // Pre-filter dedicated employees for single-resource brands to make the demo impactful!
  const [selectedEmpId, setSelectedEmpId] = useState(employees[1]?._id || '');
  const [date, setDate] = useState('2026-11-06');
  const [reason, setReason] = useState('Sudden acute fever / medical emergency');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSimulate({
        employeeId: selectedEmpId,
        date,
        reason,
      });
      onClose();
    } catch (err) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-600 text-white rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Simulate Operational Disruption</h3>
              <p className="text-xs text-amber-700">Section 3F: Handling Changes Post-Generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Test how the system reacts when an associate managing a brand suddenly becomes unavailable. The algorithm will immediately evaluate client SLA impact, flag coverage gaps, and recommend pod backups.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Employee to Mark as Unavailable</label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.podId?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date of Absence</label>
            <input
              type="date"
              value={date}
              min="2026-11-01"
              max="2026-11-30"
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Disruption Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-sm disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{loading ? 'Simulating...' : 'Simulate & Re-evaluate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
