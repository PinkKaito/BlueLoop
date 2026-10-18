'use client';

import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  Sprout,
  Waves
} from 'lucide-react';
import { DischargeTier } from '@/types';

interface ActionApprovalCardProps {
  isDrawdownExecuted: boolean;
  isSimulating: boolean;
  onApproveDrawdown: () => void;
  onReset: () => void;
  supervisedAutonomy: boolean;
  onToggleAutonomy: () => void;
  activeTier: DischargeTier;
  onSelectTier: (tier: DischargeTier) => void;
}

export const ActionApprovalCard: React.FC<ActionApprovalCardProps> = ({
  isDrawdownExecuted,
  isSimulating,
  onApproveDrawdown,
  onReset,
  supervisedAutonomy,
  onToggleAutonomy,
  activeTier,
  onSelectTier,
}) => {
  return (
    <div className="exec-card accent-top-emerald rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col justify-between gap-2.5 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100 tracking-wide uppercase">
            Action Approval &amp; Autonomy
          </h3>
          <span
            className={`px-2 py-0.5 text-[9px] font-bold rounded font-mono border ${
              isDrawdownExecuted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : isSimulating
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            {isDrawdownExecuted
              ? 'CAPACITY SECURED'
              : isSimulating
              ? 'EXECUTING...'
              : 'AWAITING DISPATCH'}
          </span>
        </div>

        {/* Secondary Routing Multi-Sink Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
          <button
            onClick={() => onSelectTier('tier1_irrigation')}
            className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
              activeTier === 'tier1_irrigation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3 h-3" />
            <span>Tier 1: Irrigation Buffer</span>
          </button>

          <button
            onClick={() => onSelectTier('tier2_canal')}
            className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
              activeTier === 'tier2_canal'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3 h-3" />
            <span>Tier 2: Canal Pre-Release</span>
          </button>
        </div>
      </div>

      {/* Main Action Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Primary CTA Buttons */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <button
            onClick={onApproveDrawdown}
            disabled={isDrawdownExecuted || isSimulating}
            className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${
              isDrawdownExecuted
                ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-500/50 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : isSimulating
                ? 'text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-90 cursor-wait'
                : 'text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isDrawdownExecuted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                <span>DRAWDOWN EXECUTED (55% LEVEL READY)</span>
              </>
            ) : isSimulating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>PUMPING STORMWATER (380 m³/h)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>APPROVE DRAWDOWN &amp; DIVERT TO REUSE</span>
              </>
            )}
          </button>

          {isDrawdownExecuted && (
            <button
              onClick={onReset}
              className="py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1"
              title="Reset Simulation to Pre-Storm State"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Supervised Autonomy iOS-Style Toggle Switch */}
        <div className="flex items-center gap-2.5 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="text-right select-none">
            <span className="text-[11px] font-semibold text-slate-200 block">Supervised Autonomy</span>
            <span
              className={`text-[9px] font-mono block ${
                supervisedAutonomy ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {supervisedAutonomy ? 'Auto-Trigger Armed' : 'Manual Approval'}
            </span>
          </div>

          <button
            onClick={onToggleAutonomy}
            role="switch"
            aria-checked={supervisedAutonomy}
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 cursor-pointer relative ${
              supervisedAutonomy
                ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-slate-700'
            }`}
          >
            {supervisedAutonomy && (
              <span className="text-[9px] font-extrabold text-slate-950 ml-1">ON</span>
            )}
            <span
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                supervisedAutonomy ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
            {!supervisedAutonomy && (
              <span className="text-[9px] font-extrabold text-slate-300 mr-1 ml-auto">OFF</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
