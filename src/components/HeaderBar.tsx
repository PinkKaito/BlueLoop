'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Clock, 
  CloudRain, 
  RotateCcw, 
  MapPin, 
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { SimulationPhase } from '@/types';

interface HeaderBarProps {
  currentPhase: SimulationPhase;
  onSetPhase?: (phase: SimulationPhase) => void;
  onReset: () => void;
  onStartDemo: () => void;
  isDemoRunning: boolean;
  selectedTownship: string;
  onSelectTownship: (township: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentPhase,
  onReset,
  onStartDemo,
  isDemoRunning,
  selectedTownship,
  onSelectTownship,
}) => {
  const [timeString, setTimeString] = useState<string>('2026-10-18 15:45:00 MYT');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} MYT`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const phases: { id: SimulationPhase; label: string; desc: string }[] = [
    { id: 'SENSE', label: 'SENSE', desc: 'Hydraulic Telemetry' },
    { id: 'PREDICT', label: 'PREDICT', desc: 'Storm Horizon AI' },
    { id: 'ACT', label: 'ACT', desc: 'Proactive Drawdown' },
    { id: 'MEASURE', label: 'MEASURE', desc: 'ESG & Flood Avoidance' },
  ];

  const townships = [
    { id: 'elmina', name: 'City of Elmina', node: 'Central Wetland Retention • PLC-01' },
    { id: 'bukit-raja', name: 'Bandar Bukit Raja', node: '125-Acre Flood Mitigation Town Park • PLC-02' },
  ];

  return (
    <header className="exec-card rounded-2xl px-4 py-2 sm:px-5 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 border-slate-800/90 relative z-30 shadow-lg">
      {/* LEFT: Brand Title & Township Node Selector */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-950 via-slate-900 to-sky-950 border border-cyan-400/40 shadow-[0_0_15px_rgba(14,165,233,0.35)]">
          <Droplets className="w-4 h-4 text-cyan-400 glow-cyan" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent">
              BlueLoop
            </h1>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          </div>

          {/* Township Node Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span className="font-semibold text-slate-300">Sime Darby Property</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300 font-mono text-[10px] font-medium underline decoration-cyan-500/40 underline-offset-2">
                {townships.find(t => t.id === selectedTownship)?.node || townships[0].node}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-6 left-0 w-80 bg-slate-900/95 border border-slate-700/80 rounded-xl p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Select Deployment Node (Hackathon Pilot)
                </div>
                {townships.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTownship(t.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex flex-col gap-0.5 ${
                      selectedTownship === t.id
                        ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-white">{t.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{t.node}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CENTER: SENSE -> PREDICT -> ACT -> MEASURE Workflow Pill */}
      <div className="hidden xl:flex items-center gap-1 bg-slate-950/80 border border-slate-800 p-1 rounded-xl shadow-inner">
        {phases.map((p, idx) => {
          const isCurrent = currentPhase === p.id;
          const isPassed = 
            (currentPhase === 'PREDICT' && idx === 0) ||
            (currentPhase === 'ACT' && idx <= 1) ||
            (currentPhase === 'MEASURE' && idx <= 2);

          return (
            <React.Fragment key={p.id}>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                    : isPassed
                    ? 'text-emerald-400/90 hover:text-emerald-300'
                    : 'text-slate-500'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                )}
                <span className="font-mono text-[11px]">{p.label}</span>
              </div>
              {idx < phases.length - 1 && (
                <span className="text-slate-700 text-[10px] font-mono select-none">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* RIGHT: Live Clock & Action Quick Bar */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg text-xs text-slate-400">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-emerald-400 font-mono font-semibold text-[11px]">RADAR SYNC</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs text-slate-300 font-mono bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[11px]">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{timeString}</span>
        </div>

        <button
          onClick={onStartDemo}
          disabled={isDemoRunning}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
            isDemoRunning
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_12px_rgba(14,165,233,0.35)]'
          }`}
          title="Run 4-phase automated presentation scenario for judges"
        >
          <Sparkles className="w-3 h-3" />
          <span>{isDemoRunning ? 'SIMULATING...' : 'DEMO WALKTHROUGH'}</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          title="Reset to Pre-Storm State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
