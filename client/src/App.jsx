import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ViewSelector from './components/ViewSelector';
import EditCellModal from './components/EditCellModal';
import SimulateLeaveModal from './components/SimulateLeaveModal';
import ConflictDrawer from './components/ConflictDrawer';

// 5 Views
import CompanyView from './components/views/CompanyView';
import PodView from './components/views/PodView';
import BrandView from './components/views/BrandView';
import ProcessView from './components/views/ProcessView';
import EmployeeView from './components/views/EmployeeView';

// API & Export
import {
  getMetadata,
  getRoster,
  generateRoster,
  updateShiftCell,
  simulateLeave,
  applyBackup,
  resetSeedData,
} from './services/api';
import { exportRosterToCSV } from './utils/csvExport';

export default function App() {
  const [month, setMonth] = useState(11);
  const [year, setYear] = useState(2026);
  const [activeTab, setActiveTab] = useState('company');

  // Server data
  const [metadata, setMetadata] = useState({
    pods: [],
    employees: [],
    brands: [],
    processes: [],
    allocations: [],
  });
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals & Drawers
  const [editCellData, setEditCellData] = useState(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isConflictDrawerOpen, setIsConflictDrawerOpen] = useState(false);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const meta = await getMetadata();
        setMetadata(meta);

        const currentRoster = await getRoster(year, month);
        setRoster(currentRoster);
      } catch (err) {
        showToast(`Failed to load data: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [month, year]);

  // Handle Roster Generation
  const handleGenerate = async () => {
    try {
      setLoading(true);
      const newRoster = await generateRoster(month, year);
      setRoster(newRoster);
      showToast(`Roster for ${month}/${year} generated successfully! SLA: ${newRoster.metrics.slaPercentage}%`);
    } catch (err) {
      showToast(`Generation failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Seed
  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to clean 32-employee seed dataset?')) return;
    try {
      setLoading(true);
      await resetSeedData();
      const meta = await getMetadata();
      setMetadata(meta);
      const newRoster = await generateRoster(month, year);
      setRoster(newRoster);
      showToast('Database reset to clean base dataset.');
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cell Update
  const handleSaveCell = async (payload) => {
    if (!roster) return;
    const res = await updateShiftCell({
      rosterId: roster._id,
      ...payload,
    });
    // Update local state
    setRoster((prev) => ({
      ...prev,
      entries: prev.entries.map((e) =>
        e.date === payload.date && e.employeeId === payload.employeeId ? res.updatedEntry : e
      ),
      metrics: res.metrics,
      conflicts: res.conflicts,
    }));
    showToast('Shift cell updated and SLA re-evaluated.');
  };

  // Handle Simulate Leave (Section 3F Walkthrough)
  const handleSimulateLeave = async ({ employeeId, date, reason }) => {
    if (!roster) return;
    const res = await simulateLeave({
      rosterId: roster._id,
      employeeId,
      date,
      reason,
    });
    // Refresh roster
    const updatedRoster = await getRoster(year, month);
    setRoster(updatedRoster);
    setIsConflictDrawerOpen(true);
    showToast(`Leave simulated for ${date}. Opening Conflict Center with candidate replacements.`, 'warning');
  };

  // Handle Apply Backup
  const handleApplyBackup = async ({ date, brandId, processId, backupEmployeeId }) => {
    if (!roster) return;
    const res = await applyBackup({
      rosterId: roster._id,
      date,
      brandId,
      processId,
      backupEmployeeId,
    });
    const updatedRoster = await getRoster(year, month);
    setRoster(updatedRoster);
    showToast('Pod backup successfully assigned! SLA gap resolved.');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!roster) return;
    exportRosterToCSV(roster, metadata.employees, metadata.brands, metadata.processes);
    showToast('Roster exported as CSV.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        month={month}
        year={year}
        onMonthChange={setMonth}
        roster={roster}
        loading={loading}
        onGenerate={handleGenerate}
        onResetSeed={handleResetSeed}
        onExportCSV={handleExportCSV}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onOpenConflictDrawer={() => setIsConflictDrawerOpen(true)}
      />

      {/* View Selector Tabs */}
      <ViewSelector activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {loading && !roster ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-600">Initializing Roster & Constraint Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'company' && (
              <CompanyView
                roster={roster}
                employees={metadata.employees}
                brands={metadata.brands}
                onCellClick={(cell) => setEditCellData(cell)}
              />
            )}

            {activeTab === 'pod' && (
              <PodView
                roster={roster}
                pods={metadata.pods}
                employees={metadata.employees}
                brands={metadata.brands}
                onCellClick={(cell) => setEditCellData(cell)}
              />
            )}

            {activeTab === 'brand' && (
              <BrandView
                roster={roster}
                brands={metadata.brands}
                processes={metadata.processes}
                employees={metadata.employees}
              />
            )}

            {activeTab === 'process' && (
              <ProcessView
                roster={roster}
                processes={metadata.processes}
                brands={metadata.brands}
                employees={metadata.employees}
              />
            )}

            {activeTab === 'employee' && (
              <EmployeeView
                roster={roster}
                employees={metadata.employees}
                brands={metadata.brands}
                onCellClick={(cell) => setEditCellData(cell)}
              />
            )}
          </>
        )}
      </main>

      {/* Edit Shift Modal */}
      {editCellData && (
        <EditCellModal
          cellData={editCellData}
          brands={metadata.brands}
          processes={metadata.processes}
          onClose={() => setEditCellData(null)}
          onSave={handleSaveCell}
        />
      )}

      {/* Simulate Disruption Modal (Section 3F) */}
      <SimulateLeaveModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        employees={metadata.employees}
        brands={metadata.brands}
        onSimulate={handleSimulateLeave}
      />

      {/* Conflict Resolution Drawer */}
      <ConflictDrawer
        isOpen={isConflictDrawerOpen}
        onClose={() => setIsConflictDrawerOpen(false)}
        conflicts={roster?.conflicts}
        onApplyBackup={handleApplyBackup}
      />
    </div>
  );
}
