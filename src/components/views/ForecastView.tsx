'use client';

import React from 'react';
import { ForecastDataPoint, StormScenario } from '@/types';
import { StormForecastChart } from '../StormForecastChart';
import { PreStormAlertBanner } from '../PreStormAlertBanner';
import { CloudRain, ArrowLeft, TrendingUp, Info, Zap } from 'lucide-react';

interface ForecastViewProps {
  rainfallMm: number;
  onRainfallChange: (val: number) => void;
  selectedScenario: StormScenario;
  onSelectScenario: (scen: StormScenario) => void;
  isDrawdownExecuted: boolean;
  unmanagedPeak: number;
  managedPeak: number;
  chartData: ForecastDataPoint[];
  onBackToOverview: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  rainfallMm,
  onRainfallChange,
  selectedScenario,
  onSelectScenario,
  isDrawdownExecuted,
  unmanagedPeak,
  managedPeak,
  chartData,
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
            <CloudRain className="w-4 h-4 text-cyan-400" />
            Predictive Storm Radar &amp; Hydrological Inundation Modeling
          </h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Column (8 cols): Top Alert + Expanded Chart */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-3 h-full">
          <PreStormAlertBanner
            rainfallMm={rainfallMm}
            onRainfallChange={onRainfallChange}
            selectedScenario={selectedScenario}
            onSelectScenario={onSelectScenario}
            isDrawdownExecuted={isDrawdownExecuted}
            unmanagedPeak={unmanagedPeak}
            managedPeak={managedPeak}
          />

          <div className="flex-1 min-h-[280px]">
            <StormForecastChart
              data={chartData}
              unmanagedPeak={unmanagedPeak}
              managedPeak={managedPeak}
              isDrawdownExecuted={isDrawdownExecuted}
            />
          </div>
        </div>

        {/* Right Column (4 cols): Hydrological Equations & Catchment Diagnostics */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 h-full">
          <div className="exec-card accent-top-cyan rounded-2xl p-4 flex-1 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Hydraulic Headroom Equation
              </h3>
              <p className="text-xs text-slate-300 mb-3">
                Calculates sub-basin runoff inflow using continuous convective radar vectors:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 mb-3">
                V_peak = V_current + (A_catchment × P_rain × C_runoff) - Q_out
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Catchment Area (A):</span>
                  <span className="font-mono font-bold text-white">120 Hectares (1.2 km²)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Runoff Coefficient (C):</span>
                  <span className="font-mono font-bold text-white">0.65 (Urban/Park)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Forecast Depth (P):</span>
                  <span className="font-mono font-bold text-amber-300">{rainfallMm} mm / 3h</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Passive Weir Outflow:</span>
                  <span className="font-mono font-bold text-white">450 m³/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Drawdown Headroom Created:</span>
                  <span className="font-mono font-bold text-emerald-400">1,150 m³ (45% Buffer)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Model synchronized with MET Malaysia Doppler Radar API (Subang Station).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
