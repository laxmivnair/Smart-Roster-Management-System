import React, { useState } from 'react';
import { X, Check, Calendar, AlertCircle } from 'lucide-react';

export default function EditCellModal({ cellData, brands, processes, onClose, onSave }) {
  if (!cellData) return null;

  const { date, employee, entry } = cellData;

  const [status, setStatus] = useState(entry?.status || 'WORKING');
  const [brandId, setBrandId] = useState(entry?.brandId || '');
  const [processId, setProcessId] = useState(entry?.processId || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        date,
        employeeId: employee._id,
        newStatus: status,
        newBrandId: status === 'WORKING' ? brandId || null : null,
        newProcessId: status === 'WORKING' ? processId || null : null,
        notes,
      });
      onClose();
    } catch (err) {
      alert(`Failed to update shift: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Edit Shift Assignment</h3>
              <p className="text-xs text-slate-500">{date} • {employee.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Employee Info Card */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800">{employee.name}</p>
              <p className="text-[11px] text-slate-500">{employee.role} • {employee.podId?.name}</p>
            </div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">
              Skills: {employee.skills?.join(', ')}
            </span>
          </div>

          {/* Status Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shift Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="WORKING">WORKING (Active Shift)</option>
              <option value="WEEKLY_OFF">WEEKLY_OFF (Scheduled Rest Day)</option>
              <option value="LEAVE">LEAVE (Approved Planned Leave)</option>
              <option value="COMP_OFF">COMP_OFF (Compensatory Off)</option>
              <option value="PUBLIC_HOLIDAY">PUBLIC_HOLIDAY (National / Gazetted)</option>
            </select>
          </div>

          {/* Brand & Process if WORKING */}
          {status === 'WORKING' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Brand</label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.code} ({b.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Process</label>
                <select
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Process --</option>
                  {processes
                    .filter((p) => !brandId || p.brandId?._id === brandId || p.brandId === brandId)
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.processType}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Manager Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Swapped shift / approved comp-off"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start space-x-2 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Saving will immediately re-validate the entire monthly roster and update SLA metrics in real-time.
            </span>
          </div>

          {/* Actions */}
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
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center space-x-1 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Apply Shift Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
