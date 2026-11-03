import React, { useState } from 'react';
import { Cpu, Users, Building, CheckCircle2 } from 'lucide-react';

export default function ProcessView({ roster, processes, brands, employees }) {
  const [selectedProcess, setSelectedProcess] = useState('CS');

  if (!roster || !processes) return null;

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const processTypes = ['CS', 'ACC', 'NDR', 'RETENTION'];

  // Brands that run this process
  const relevantProcesses = processes.filter((p) => p.processType === selectedProcess);
  const relevantBrandIds = new Set(relevantProcesses.map((p) => p.brandId?._id || p.brandId));
  const relevantBrands = brands.filter((b) => relevantBrandIds.has(b._id));

  // Compute daily active headcount for this process
  const dailyStats = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = String(day).padStart(2, '0');
    const m = String(roster.month).padStart(2, '0');
    const dateStr = `${roster.year}-${m}-${d}`;

    let totalDemand = 0;
    relevantProcesses.forEach((p) => {
      const bId = p.brandId?._id || p.brandId;
      const key = `${bId}_${p.processType}`;
      totalDemand += roster.demandMatrix?.[dateStr]?.[key] || 0;
    });

    let totalActive = 0;
    roster.entries.forEach((e) => {
      if (e.date === dateStr && e.status === 'WORKING') {
        const b = brands.find((brand) => brand._id === e.brandId);
        if (b && relevantBrandIds.has(b._id)) {
          if (b.tier === 'SINGLE_RESOURCE') {
            totalActive++;
          } else if (e.processId && relevantProcesses.some((p) => p._id === e.processId)) {
            totalActive++;
          }
        }
      }
    });

    dailyStats.push({ day, dateStr, totalDemand, totalActive });
  }

  const processDescriptions = {
    CS: 'Customer Support: 24/7 & daily ticketing, chat, and phone resolution.',
    ACC: 'Abandoned Cart Conversions: Re-engaging dropped checkouts via WhatsApp & SMS.',
    NDR: 'Non-Delivery Report Management: Courier tracking, address re-attempts, and return reductions.',
    RETENTION: 'Customer Retention: Loyalty, VIP support, and re-order campaigns.',
  };

  return (
    <div className="space-y-4">
      {/* Process Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {processTypes.map((proc) => {
          const isSelected = selectedProcess === proc;
          const count = processes.filter((p) => p.processType === proc).length;
          return (
            <button
              key={proc}
              onClick={() => setSelectedProcess(proc)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                  {proc}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{count} Accounts</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                {proc === 'CS' ? 'Customer Support' : proc === 'ACC' ? 'Cart Conversion' : proc === 'NDR' ? 'Non-Delivery' : 'Retention'}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Process Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {selectedProcess} Vertical Daily Staffing Density
          </h2>
          <p className="text-xs text-slate-500">{processDescriptions[selectedProcess]}</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500">Accounts Active: </span>
            <strong className="text-slate-800">{relevantBrands.length} Brands</strong>
          </div>
        </div>
      </div>

      {/* Daily Staffing Density Bar Chart / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          November 2026 Daily Staffing Headcount (Demand vs Active)
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 text-center text-xs">
          {dailyStats.map(({ day, totalDemand, totalActive }) => {
            const isDeficit = totalActive < totalDemand;
            return (
              <div
                key={day}
                className={`p-2 rounded-lg border flex flex-col justify-between ${
                  isDeficit
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold block mb-1">D{day}</span>
                <div className="text-sm font-extrabold my-1">{totalActive}</div>
                <span className="text-[9px] text-slate-500 block">Req: {totalDemand}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brands using this process */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Brands Running {selectedProcess} Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {relevantBrands.map((b) => (
            <div key={b._id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs">
                {b.code.slice(0, 3)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{b.name}</p>
                <p className="text-[10px] text-slate-500">
                  {b.tier === 'SINGLE_RESOURCE' ? 'Dedicated Staff' : 'Multi-Staff'} • {b.podId?.name || 'Pod'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
