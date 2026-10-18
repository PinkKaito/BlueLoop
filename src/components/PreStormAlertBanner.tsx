'use client';

import React from 'react';
import { AlertTriangle, ShieldCheck, CloudRain, Zap } from 'lucide-react';
import { StormScenario } from '@/types';

interface PreStormAlertBannerProps {
  rainfallMm: number;
  onRainfallChange: (val: number) => void;
  selectedScenario: StormScenario;
  onSelectScenario: (scenario: StormScenario) => void;
  isDrawdownExecuted: boolean;
  unmanagedPeak: number;
  managedPeak: number;
}

export const PreStormAlertBanner: React.FC<PreStormAlertBannerProps> = ({
  rainfallMm,
  onRainfallChange,
  selectedScenario,
  onSelectScenario,
  isDrawdownExecuted,
  unmanagedPeak,
  managedPeak,
}) => {
  const isSurgeOverflow = unmanagedPeak >= 100;

  return (
    <div
      className={`rounded-2xl p-3 sm:px-4 sm:py-3 transition-all duration-500 shadow-xl ${
        isDrawdownExecuted ? 'alert-banner-mitigated' : 'alert-banner-high'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left Headline & Beacon */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isDrawdownExecuted ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
              }`}
            />
            <span
              className={`text-[11px] font-extrabold uppercase tracking-wider font-mono ${
                isDrawdownExecuted ? 'text-emerald-300' : 'text-orange-300'
              }`}
            >
              {isDrawdownExecuted
                ? 'PRE-STORM HEADROOM SECURED • DRAWDOWN COMPLETE'
                : 'PRE-STORM ACTION ALERT • HIGH OVERFLOW RISK'}
            </span>
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
            {isDrawdownExecuted ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 inline" />
                <span>Pond Buffer Created (55% Level) • Max Surge Capped at {managedPeak}%</span>
              </>
            ) : (
              <>
                <CloudRain className="w-5 h-5 text-amber-300 inline" />
                <span>Heavy Rain Forecast (6 Hours) • Unmanaged Surge: {unmanagedPeak}%</span>
              </>
            )}
          </h2>
        </div>

        {/* Right Preset Pills for Hackathon Judges */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => onSelectScenario('moderate')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              selectedScenario === 'moderate'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            45mm
          </button>
          <button
            onClick={() => onSelectScenario('heavy')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              selectedScenario === 'heavy'
                ? 'bg-orange-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            85mm (Default)
          </button>
          <button
            onClick={() => onSelectScenario('extreme')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
              selectedScenario === 'extreme'
                ? 'bg-rose-600 text-white shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            120mm Surge
          </button>
        </div>
      </div>

      {/* Dynamic Rainfall Intensity Slider */}
      <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-slate-200 font-medium text-[11px]">Forecast Intensity:</span>
          <span className="font-extrabold text-white font-mono bg-black/40 px-2 py-0.5 rounded border border-white/10 text-[11px] tabular-nums">
            {rainfallMm} mm / 3h
          </span>
          {isSurgeOverflow && !isDrawdownExecuted && (
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              BREACH &gt; 100%
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <span className="text-[10px] text-slate-300 font-mono">40mm</span>
          <input
            type="range"
            min={40}
            max={130}
            value={rainfallMm}
            onChange={(e) => onRainfallChange(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <span className="text-[10px] text-slate-300 font-mono">130mm</span>
        </div>
      </div>
    </div>
  );
};
