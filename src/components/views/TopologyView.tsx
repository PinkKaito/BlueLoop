'use client';

import React, { useState } from 'react';
import { TelemetryData } from '@/types';
import { 
  Droplets, 
  Activity, 
  Gauge, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Waves,
  Zap,
  Power,
  ShieldCheck
} from 'lucide-react';
import { HydraulicSchematic } from '../HydraulicSchematic';

interface TopologyViewProps {
  telemetry: TelemetryData;
  isDrawdownActive: boolean;
  canalReleaseOpen: boolean;
  onToggleCanalRelease: () => void;
  onBackToOverview: () => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  telemetry,
  isDrawdownActive,
  canalReleaseOpen,
  onToggleCanalRelease,
  onBackToOverview,
}) => {
  const [selectedNode, setSelectedNode] = useState<'pond' | 'tank' | 'turf' | 'canal'>('pond');

  const nodes = {
    pond: {
      name: 'Central Retention Wetland (Node P-01)',
      type: 'Stormwater Catchment Basin',
      capacity: '25,000 m³ Design Headroom',
      currentLevel: `${Math.round(telemetry.pondLevel)}%`,
      status: telemetry.pondLevel <= 60 ? 'Optimal Headroom' : 'Elevated Surcharge',
      metrics: [
        { label: 'Surface Elevation', value: '18.42 m AHD' },
        { label: 'Turbidity', value: '4.2 NTU (Good)' },
        { label: 'Dissolved Oxygen', value: '6.8 mg/L' },
        { label: 'Passive Weir Spillway', value: 'Capped at 19.50 m' },
      ],
    },
    tank: {
      name: 'Subterranean Cistern Buffer (Node T-01)',
      type: 'Non-Potable Irrigation Cistern',
      capacity: '4,000 m³ Dedicated Storage',
      currentLevel: `${Math.round(telemetry.tankLevel)}%`,
      status: telemetry.tankLevel >= 60 ? 'High Harvest Reserve' : 'Low Buffer Capacity',
      metrics: [
        { label: 'Pumping Flow Rate', value: isDrawdownActive ? `${telemetry.pumpFlowRate} m³/h` : '0 m³/h (Idle)' },
        { label: 'Hydraulic Pressure', value: isDrawdownActive ? '2.4 bar' : '0.0 bar' },
        { label: 'Filtration Stage', value: 'Hydrodynamic Vortex Sand Trap' },
        { label: 'Power Consumption', value: isDrawdownActive ? '18.5 kW' : '0.4 kW (Standby)' },
      ],
    },
    turf: {
      name: 'Elmina Central Park Landscape (Node S-04)',
      type: 'Urban Green Turf Infiltration Zone',
      capacity: '45,000 m² Landscape Permeable Turf',
      currentLevel: `${Math.round(telemetry.soilMoisture)}% Saturation`,
      status: telemetry.soilMoisture >= 55 ? 'Optimally Irrigated' : 'Parched / Ready to Ingest',
      metrics: [
        { label: 'Volumetric Water Content', value: `${telemetry.soilMoisture}% VWC` },
        { label: 'Field Capacity Index', value: 'Optimal (60-70%)' },
        { label: 'Sprinkler Zone Status', value: isDrawdownActive ? 'ACTIVE (Zones 1-6)' : 'IDLE' },
        { label: 'Nutrient Leaching Risk', value: 'Low (< 2 ppm N)' },
      ],
    },
    canal: {
      name: 'Downstream Civil Canal Bypass (Node C-01)',
      type: 'Regional Stormwater Sluice Interface',
      capacity: 'External Regional Civil Headroom',
      currentLevel: `${telemetry.canalHeadroom}% Headroom`,
      status: canalReleaseOpen ? 'Staged Pre-Release Active (15%)' : 'Sluice Gates Standby',
      metrics: [
        { label: 'Downstream Sluice', value: canalReleaseOpen ? 'OPEN (15% Throttle)' : 'CLOSED' },
        { label: 'Regional River Gauge', value: 'Normal Low Baseflow' },
        { label: 'Tidal Flap Gate', value: 'Free-Draining' },
        { label: 'Emergency Override', value: 'ARMED' },
      ],
    },
  };

  const current = nodes[selectedNode];

  return (
    <div className="flex-1 flex flex-col justify-between gap-3 min-h-0 overflow-y-auto">
      {/* Top Breadcrumb & Controls */}
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
            <Droplets className="w-4 h-4 text-cyan-400" />
            Hydraulic Digital Twin &amp; SCADA Topology
          </h2>
        </div>

        {/* Node Selector Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setSelectedNode('pond')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedNode === 'pond' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pond (P-01)
          </button>
          <button
            onClick={() => setSelectedNode('tank')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedNode === 'tank' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cistern (T-01)
          </button>
          <button
            onClick={() => setSelectedNode('turf')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedNode === 'turf' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Turf (S-04)
          </button>
          <button
            onClick={() => setSelectedNode('canal')}
            className={`px-2.5 py-1 rounded-md transition ${
              selectedNode === 'canal' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Canal (C-01)
          </button>
        </div>
      </div>

      {/* Main Two-Column Topology Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Column (7 cols): Full Interactive SVG Diagram */}
        <div className="lg:col-span-7 h-full">
          <HydraulicSchematic
            telemetry={telemetry}
            isDrawdownActive={isDrawdownActive}
            canalReleaseOpen={canalReleaseOpen}
            onToggleCanalRelease={onToggleCanalRelease}
          />
        </div>

        {/* Right Column (5 cols): Deep Telemetry & Actuator Diagnostics */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3 h-full">
          {/* Active Node Detail Card */}
          <div className="exec-card accent-top-cyan rounded-2xl p-4 flex-1 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    {current.type}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">{current.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {current.currentLevel}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200 font-medium">Operational Status: <strong className="text-emerald-400">{current.status}</strong></span>
              </div>

              {/* Metric Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {current.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">{m.label}</span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5 block">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actuator Override Bar */}
            <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">SCADA RTU: ONLINE (Modbus TCP)</span>
              {selectedNode === 'canal' && (
                <button
                  onClick={onToggleCanalRelease}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
                >
                  {canalReleaseOpen ? 'Close Sluice' : 'Test Sluice (15%)'}
                </button>
              )}
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="exec-card accent-top-emerald rounded-2xl p-4 shadow-xl">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hydraulic Circuit Integrity
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Pipe Flow</span>
                <span className="text-xs font-bold text-cyan-300 block mt-0.5">
                  {isDrawdownActive ? '380 m³/h' : '0 m³/h'}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sluice State</span>
                <span className="text-xs font-bold text-emerald-300 block mt-0.5">
                  {canalReleaseOpen ? 'MODULATING' : 'CLOSED'}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Fail-Safe</span>
                <span className="text-xs font-bold text-emerald-400 block mt-0.5">ARMED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
