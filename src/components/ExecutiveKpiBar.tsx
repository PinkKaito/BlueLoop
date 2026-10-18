'use client';

import React, { useEffect, useState } from 'react';
import { ImpactMetrics } from '@/types';
import { Droplets, DollarSign, ShieldAlert, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface ExecutiveKpiBarProps {
  metrics: ImpactMetrics;
  isDrawdownExecuted: boolean;
}

export const ExecutiveKpiBar: React.FC<ExecutiveKpiBarProps> = ({
  metrics,
  isDrawdownExecuted,
}) => {
  const [displayVolume, setDisplayVolume] = useState(metrics.runoffVolume);
  const [displaySavings, setDisplaySavings] = useState(metrics.waterBillSaved);

  // Smooth numeric counter animation
  useEffect(() => {
    let animationFrameId: number;
    const startVolume = displayVolume;
    const endVolume = metrics.runoffVolume;
    const startSavings = displaySavings;
    const endSavings = metrics.waterBillSaved;
    const duration = 1200; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayVolume(Math.round(startVolume + (endVolume - startVolume) * eased));
      setDisplaySavings(Math.round(startSavings + (endSavings - startSavings) * eased));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [metrics.runoffVolume, metrics.waterBillSaved]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
      {/* KPI 1: Retained Runoff Volume */}
      <div className="exec-card accent-top-cyan rounded-xl px-4 py-2.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">
              Retained Runoff Volume
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            METRIC M-01
          </span>
        </div>

        <div className="my-1 flex items-baseline gap-2.5">
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            {displayVolume.toLocaleString()} m³
          </span>
          {isDrawdownExecuted && (
            <span className="text-[11px] font-bold text-cyan-400 font-mono bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40 flex items-center gap-0.5 shadow-[0_0_8px_rgba(14,165,233,0.3)] animate-in fade-in duration-500">
              <ArrowUpRight className="w-3 h-3" />
              +1,150 m³ Buffer
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Captured Stormwater Reused</span>
          <span className="font-mono text-cyan-400 text-[10px]">
            {(displayVolume * 1000).toLocaleString()} L
          </span>
        </div>
      </div>

      {/* KPI 2: Water Bill Saved (RM) */}
      <div className="exec-card accent-top-emerald rounded-xl px-4 py-2.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">
              Water Bill Saved (RM)
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            ESG AUDIT
          </span>
        </div>

        <div className="my-1 flex items-baseline gap-2.5">
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight tabular-nums">
            RM {displaySavings.toLocaleString()}
          </span>
          {isDrawdownExecuted && (
            <span className="text-[11px] font-bold text-emerald-400 font-mono bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-0.5 shadow-[0_0_8px_rgba(16,185,129,0.3)] animate-in fade-in duration-500">
              <ArrowUpRight className="w-3 h-3" />
              +RM 2,620 Saved
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Irrigation Displacement</span>
          <span className="text-slate-500 font-mono text-[10px]">Tariff: RM 2.28/m³</span>
        </div>
      </div>

      {/* KPI 3: Flood Risk Index */}
      <div className="exec-card accent-top-amber rounded-xl px-4 py-2.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isDrawdownExecuted ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="text-xs font-semibold text-slate-300">
              Flood Risk Index
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
            HORIZON 12H
          </span>
        </div>

        <div className="my-1 flex items-center gap-2.5">
          <span
            className={`text-lg sm:text-xl font-extrabold font-mono tracking-wide ${
              isDrawdownExecuted ? 'text-slate-500 line-through text-xs' : 'text-amber-400'
            }`}
          >
            HIGH (85%)
          </span>

          <div className="flex-1 max-w-[80px] flex items-center">
            <div className="h-1.5 w-full rounded-l-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          </div>

          <span
            className={`text-lg sm:text-xl font-extrabold font-mono tracking-wide ${
              isDrawdownExecuted
                ? 'text-emerald-400 glow-emerald'
                : 'text-slate-500'
            }`}
          >
            MITIGATED (22%)
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{isDrawdownExecuted ? 'Overtopping Negligible' : 'Peak overtopping at T+6h'}</span>
          <span className="font-mono text-emerald-400 text-[10px] font-bold">
            {isDrawdownExecuted ? '63% Margin Secured' : 'Action Required'}
          </span>
        </div>
      </div>
    </div>
  );
};
