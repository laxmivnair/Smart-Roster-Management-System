import React from 'react';
import { LayoutGrid, Layers, Building, Cpu, UserCheck } from 'lucide-react';

export default function ViewSelector({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'company', label: 'Company-Wide', icon: LayoutGrid, desc: 'Full 32-staff schedule matrix' },
    { id: 'pod', label: 'Pod-Wise', icon: Layers, desc: 'Grouped by Pod Leads & teams' },
    { id: 'brand', label: 'Brand-Wise', icon: Building, desc: 'Client SLA daily coverage status' },
    { id: 'process', label: 'Process-Wise', icon: Cpu, desc: 'Staffing for CS, ACC, NDR' },
    { id: 'employee', label: 'Employee-Wise', icon: UserCheck, desc: 'Individual monthly timesheet' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div className="text-left">
                <span className="font-semibold block">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
