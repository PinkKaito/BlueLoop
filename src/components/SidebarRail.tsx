'use client';

import React from 'react';
import { 
  Activity, 
  Droplets, 
  CloudRain, 
  Sliders, 
  ShieldCheck, 
  FileText,
  Radio
} from 'lucide-react';

interface SidebarRailProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  latencyMs: number;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeTab,
  setActiveTab,
  latencyMs,
}) => {
  const navItems = [
    { id: 'overview', label: 'Hydraulic Overview', icon: Activity },
    { id: 'topology', label: 'Network Schematic', icon: Droplets },
    { id: 'forecast', label: 'Storm Radar', icon: CloudRain },
    { id: 'controls', label: 'Supervised Control', icon: Sliders },
    { id: 'esg', label: 'ESG Impact Audit', icon: ShieldCheck },
  ];

  return (
    <aside className="w-16 hidden lg:flex flex-col items-center justify-between py-4 bg-[#0D1424] border-r border-slate-800/80 z-20 select-none">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group cursor-pointer" title="BlueLoop — Smart Township Water Intelligence">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-900/60 to-blue-950/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.35)] group-hover:border-cyan-400 transition-all">
            <Droplets className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <span className="absolute left-14 top-2 px-2.5 py-1 bg-slate-900 text-cyan-300 text-xs font-semibold rounded-md border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            BlueLoop OS v2.4
          </span>
        </div>

        <div className="w-8 h-[1px] bg-slate-800 my-1" />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(14,165,233,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>

                {/* Active Left Indicator Bar */}
                {isActive && (
                  <div className="absolute -left-3 top-2.5 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#0ea5e9]" />
                )}

                {/* Tooltip */}
                <span className="absolute left-14 top-2 px-2.5 py-1 bg-slate-900 text-slate-200 text-xs font-medium rounded-md border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom PLC Status Node */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative group cursor-pointer flex flex-col items-center">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] font-mono text-emerald-400/90 font-bold">PLC</span>
          </div>

          {/* Hover card */}
          <div className="absolute left-14 bottom-2 p-2.5 bg-slate-900 text-slate-300 text-xs rounded-lg border border-slate-700 shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            <div className="font-semibold text-white mb-0.5">Elmina Wetland RTU-01</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span>Status: Online</span> • <span>Sync: {latencyMs}ms</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
