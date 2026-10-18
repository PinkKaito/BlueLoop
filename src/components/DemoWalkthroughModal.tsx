'use client';

import React from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  DollarSign
} from 'lucide-react';
import { SimulationPhase } from '@/types';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onSelectStep: (step: number) => void;
  onApproveDrawdown: () => void;
  onReset: () => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  currentStep,
  onSelectStep,
  onApproveDrawdown,
  onReset,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      phase: 'SENSE' as SimulationPhase,
      title: 'Phase 1: Baseline Telemetry (T - 12h)',
      summary: 'Township operational status quo before precipitation.',
      details: [
        'Retention pond is sitting at 78% capacity (passive design leaves no surge headroom).',
        'Township landscape irrigation tank is low at 32%, purchasing municipal potable water.',
        'Park soil is dry at 38%, eager to ingest non-potable moisture.',
      ],
      badge: 'STATUS: OPTIMAL / DRY SOIL',
    },
    {
      num: 2,
      phase: 'PREDICT' as SimulationPhase,
      title: 'Phase 2: Predictive Storm Warning (T - 6h)',
      summary: 'Meteorological Radar AI ingests 85mm convective storm forecast.',
      details: [
        'Hydraulic Equation calculates incoming runoff: V_peak = V_current + (A * P * C) - Q_passive.',
        'CRITICAL RISK: Without intervention, pond surges to 105% capacity (Overtopping flood).',
        'Action Dispatch Card generated: Recommend pre-emptively transferring 1,150 m³.',
      ],
      badge: 'ACTION ALERT: 105% OVERFLOW SURGE',
    },
    {
      num: 3,
      phase: 'ACT' as SimulationPhase,
      title: 'Phase 3: Smart Tiered Drawdown (T - 4h)',
      summary: 'Operator or Supervised Autonomy triggers proactive transfer.',
      details: [
        'Transfer pumps ramp to 380 m³/h, routing water through Tier 1 internal manifold.',
        'Retention pond drops from 78% down to 55%, creating a 45% surge buffer.',
        'Irrigation storage fills to 75% and park sprinklers hydrate landscape turf to 62%.',
      ],
      badge: 'DISPATCH: POND HEADROOM CREATED',
    },
    {
      num: 4,
      phase: 'MEASURE' as SimulationPhase,
      title: 'Phase 4: Storm Ingestion & ESG Audit (T - 0h)',
      summary: 'Storm makes landfall; capacity safely absorbed.',
      details: [
        'Stormwater fills the reserved 45% buffer; peak retention stays capped at 82% (Safe).',
        'Zero residential flooding or downstream canal overtopping.',
        'ESG Impact: 5,270 m³ retained (+1,150 m³ harvested), saving RM 16,970 in potable bills.',
      ],
      badge: 'OUTCOME: 23% RISK MITIGATED • ZERO FLOOD',
    },
  ];

  const current = steps[currentStep] || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="exec-card max-w-2xl w-full rounded-2xl p-6 border-slate-700 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">
              BlueLoop Pitch Demonstration Guide
            </h3>
            <p className="text-xs text-slate-400">
              Sime Darby Property Hackathon (Track: PLANET) • Live Judging Script
            </p>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {steps.map((s, idx) => (
            <button
              key={s.num}
              onClick={() => onSelectStep(idx)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                currentStep === idx
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(14,165,233,0.25)]'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="text-[10px] font-mono font-bold text-slate-500">
                STEP 0{s.num}
              </div>
              <div className="text-xs font-bold truncate mt-0.5">{s.phase}</div>
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {current.title}
            </h4>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-800">
              {current.badge}
            </span>
          </div>

          <p className="text-xs text-slate-300 font-medium mb-3">
            {current.summary}
          </p>

          <ul className="space-y-2 text-xs text-slate-400">
            {current.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onReset}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    onApproveDrawdown();
                  }
                  onSelectStep(currentStep + 1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-md flex items-center gap-1.5 transition"
              >
                <span>{currentStep === 1 ? 'Execute Drawdown & Next' : 'Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md transition"
              >
                Done (Back to Dashboard)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
