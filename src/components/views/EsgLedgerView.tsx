'use client';

import React from 'react';
import { ImpactMetrics } from '@/types';
import { ShieldCheck, ArrowLeft, DollarSign, Droplets, Leaf, Award, TrendingUp } from 'lucide-react';

interface EsgLedgerViewProps {
  metrics: ImpactMetrics;
  isDrawdownExecuted: boolean;
  onBackToOverview: () => void;
}

export const EsgLedgerView: React.FC<EsgLedgerViewProps> = ({
  metrics,
  isDrawdownExecuted,
  onBackToOverview,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between gap-3 min-h-0 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToOverview}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <span className="text-slate-600">/</span>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ESG Sustainability Ledger &amp; Township Water Economics
          </h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* KPI 1 */}
        <div className="exec-card accent-top-cyan rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Potable Water Offset</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {(metrics.runoffVolume * 1000).toLocaleString()} L
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono block mt-1">
              {metrics.runoffVolume.toLocaleString()} m³ Captured Stormwater
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Replaces treated municipal tap water for landscape irrigation across Central Park.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="exec-card accent-top-emerald rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Monthly Utility Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              RM {metrics.waterBillSaved.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono block mt-1">
              Air Selangor Tariff: RM 2.28/m³
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Direct operational expenditure reduction for Sime Darby Property township facilities.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="exec-card accent-top-amber rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Carbon Avoidance</span>
            <Leaf className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              1.82 tCO₂e
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono block mt-1">
              Reduced Pumping &amp; Treatment Energy
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Avoided municipal energy intensity (0.345 kWh/m³ treatment and grid transmission).
          </p>
        </div>
      </div>

      {/* ESG Alignment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        <div className="lg:col-span-8 exec-card rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-cyan-400" />
              United Nations Sustainable Development Goals (SDG) Alignment
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              BlueLoop directly fulfills three core UN SDG milestones for Sime Darby Property sustainability reporting:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-extrabold text-cyan-400 block">SDG 6</span>
                <span className="text-xs font-bold text-white block mt-0.5">Clean Water &amp; Sanitation</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Target 6.4: Substantially increase water-use efficiency by harvesting non-potable runoff.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-extrabold text-emerald-400 block">SDG 11</span>
                <span className="text-xs font-bold text-white block mt-0.5">Sustainable Cities</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Target 11.5: Reduce the number of people affected by urban flash flood disasters.
                </p>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-extrabold text-amber-400 block">SDG 13</span>
                <span className="text-xs font-bold text-white block mt-0.5">Climate Action</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Target 13.1: Strengthen resilience and adaptive capacity to climate-induced storm surges.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Verified for Sime Darby Property Annual Sustainability Report (Bursa Malaysia ESG Framework)</span>
            <span className="text-emerald-400 font-bold font-mono">AUDIT PASSED</span>
          </div>
        </div>

        {/* Flood Avoidance Value */}
        <div className="lg:col-span-4 exec-card accent-top-emerald rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Township Risk Avoidance Value
            </h3>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 my-2">
              <span className="text-[10px] text-slate-400 block">Estimated Civil Damage Prevention</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono block mt-0.5">
                RM 350,000+
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Per 10-Year Return Period Storm</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 mt-2">
              <li>• Zero road submergence on Persiaran Mokhtar Dahari</li>
              <li>• Protects Central Park civil walking pathways</li>
              <li>• Safeguards residential perimeter drainage</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Node: City of Elmina &amp; Bandar Bukit Raja
          </div>
        </div>
      </div>
    </div>
  );
};
