'use client';

import React from 'react';
import { DischargeTier } from '@/types';
import { ActionApprovalCard } from '../ActionApprovalCard';
import { Sliders, ArrowLeft, ShieldCheck, Cpu, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

interface ControlsViewProps {
  isDrawdownExecuted: boolean;
  isSimulating: boolean;
  onApproveDrawdown: () => void;
  onReset: () => void;
  supervisedAutonomy: boolean;
  onToggleAutonomy: () => void;
  activeTier: DischargeTier;
  onSelectTier: (tier: DischargeTier) => void;
  onBackToOverview: () => void;
}

export const ControlsView: React.FC<ControlsViewProps> = ({
  isDrawdownExecuted,
  isSimulating,
  onApproveDrawdown,
  onReset,
  supervisedAutonomy,
  onToggleAutonomy,
  activeTier,
  onSelectTier,
  onBackToOverview,
}) => {
  const policies = [
    {
      title: 'Policy 01: Pre-Storm Predictive Trigger',
      condition: 'Forecast Rainfall ≥ 40mm within 12h horizon AND Pond Level ≥ 70%',
      action: 'Dispatches automated drawdown dispatch card to operator console.',
      status: 'ACTIVE & MONITORING',
    },
    {
      title: 'Policy 02: Three-Tier Discharge Routing Protocol',
      condition: 'Tier 1 (Internal Reuse) preferred. If cistern ≥ 90% and soil saturated, shifts to Tier 2 (Canal pre-release).',
      action: 'Routes 380 m³/h transfer to parched green zones or empty downstream civil canal.',
      status: activeTier === 'tier1_irrigation' ? 'ROUTED TO TIER 1' : 'ROUTED TO TIER 2',
    },
    {
      title: 'Policy 03: Fail-Safe Supervisory Autonomy',
      condition: 'High-risk breach alerts unacknowledged within 60 minutes of landfall.',
      action: 'Automatically engages transfer actuators to protect downstream communities from flash flood.',
      status: supervisedAutonomy ? 'AUTO-TRIGGER ARMED' : 'MANUAL APPROVAL ONLY',
    },
  ];

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
            <Sliders className="w-4 h-4 text-emerald-400" />
            Supervised Autonomy &amp; SCADA Actuator Governance
          </h2>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Column (7 cols): Control Action Card + Actuator Matrix */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3 h-full">
          <ActionApprovalCard
            isDrawdownExecuted={isDrawdownExecuted}
            isSimulating={isSimulating}
            onApproveDrawdown={onApproveDrawdown}
            onReset={onReset}
            supervisedAutonomy={supervisedAutonomy}
            onToggleAutonomy={onToggleAutonomy}
            activeTier={activeTier}
            onSelectTier={onSelectTier}
          />

          {/* Actuator Status Matrix */}
          <div className="exec-card accent-top-cyan rounded-2xl p-4 flex-1 flex flex-col justify-between shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Sime Darby Property PLC Actuator Matrix
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Transfer Pump A (Primary)</span>
                <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                  {isSimulating ? 'RUNNING (380 m³/h)' : isDrawdownExecuted ? 'COMPLETE' : 'STANDBY (0 m³/h)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Modbus ID: 0x01A</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Transfer Pump B (Redundant)</span>
                <span className="text-xs font-mono font-bold text-slate-400 block mt-0.5">HOT STANDBY</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Modbus ID: 0x01B</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Irrigation Manifold Valve</span>
                <span className="text-xs font-mono font-bold text-cyan-300 block mt-0.5">
                  {isDrawdownExecuted ? 'POSITION: OPEN' : 'POSITION: CLOSED'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Linear Actuator 24V</span>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Downstream Sluice Gate</span>
                <span className="text-xs font-mono font-bold text-amber-300 block mt-0.5">
                  {activeTier === 'tier2_canal' ? 'THROTTLED (15%)' : 'SEALED'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">Hydraulic Ram 3kW</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>PLC Heartbeat: 14ms (IEC 61131-3 Compliant)</span>
              <span className="text-emerald-400 font-bold font-mono">ENCRYPTED SSL/TLS</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Operational Policy Rules */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 h-full">
          <div className="exec-card accent-top-emerald rounded-2xl p-4 flex-1 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Autonomous Hydraulic Policy Rules
              </h3>

              <div className="space-y-3">
                {policies.map((p, idx) => (
                  <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.title}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-cyan-800">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-1">
                      <strong className="text-slate-300">Condition:</strong> {p.condition}
                    </p>
                    <p className="text-[11px] text-emerald-400/90 font-medium">
                      <strong>Action:</strong> {p.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              Complies with Sime Darby Property ESG Smart Infrastructure Guidelines.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
