'use client';

import React from 'react';
import { TelemetryData } from '@/types';
import { Droplet, Waves, Sprout, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface SensorGaugesProps {
  telemetry: TelemetryData;
  isDrawdownExecuted: boolean;
}

export const SensorGauges: React.FC<SensorGaugesProps> = ({
  telemetry,
  isDrawdownExecuted,
}) => {
  const { pondLevel, tankLevel, soilMoisture } = telemetry;
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // 213.63

  // Stroke offsets
  const pondOffset = Math.max(0, circumference - (pondLevel / 100) * circumference);
  const tankOffset = Math.max(0, circumference - (tankLevel / 100) * circumference);
  const soilOffset = Math.max(0, circumference - (soilMoisture / 100) * circumference);

  return (
    <div className="flex flex-col justify-between gap-2.5 h-full">
      {/* GAUGE 1: Retention Pond Level */}
      <div className="exec-card accent-top-cyan rounded-xl p-2.5 flex-1 flex flex-col justify-between relative shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Retention Pond
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            Node P-01
          </span>
        </div>

        <div className="my-0.5 flex items-center justify-center relative">
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle
              className="gauge-ring"
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={pondLevel <= 60 ? '#10b981' : '#0ea5e9'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: pondOffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-extrabold text-cyan-200 font-mono tracking-tight tabular-nums">
              {Math.round(pondLevel)}%
            </span>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-slate-800/60">
          <p className="text-[11px] font-medium text-slate-300 flex items-center justify-center gap-1">
            {pondLevel <= 60 ? (
              <>
                <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">45% Safe Buffer</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-300 font-semibold">High Capacity</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* GAUGE 2: Storage Tank Level */}
      <div className="exec-card accent-top-amber rounded-xl p-2.5 flex-1 flex flex-col justify-between relative shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-sky-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Storage Tank
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/60">
            Cistern T-01
          </span>
        </div>

        <div className="my-0.5 flex items-center justify-center relative">
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle
              className="gauge-ring"
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={tankLevel >= 60 ? '#38bdf8' : '#eab308'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: tankOffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-extrabold text-amber-200 font-mono tracking-tight tabular-nums">
              {Math.round(tankLevel)}%
            </span>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-slate-800/60">
          <p className="text-[11px] font-medium flex items-center justify-center gap-1">
            {tankLevel >= 60 ? (
              <>
                <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">+1,150 m³ Stored</span>
              </>
            ) : (
              <span className="text-amber-300/90 font-medium">Low Storage</span>
            )}
          </p>
        </div>
      </div>

      {/* GAUGE 3: Soil Moisture */}
      <div className="exec-card accent-top-emerald rounded-xl p-2.5 flex-1 flex flex-col justify-between relative shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Soil Moisture
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            Sensor S-04
          </span>
        </div>

        <div className="my-0.5 flex items-center justify-center relative">
          <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle
              className="gauge-ring"
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke={soilMoisture >= 55 ? '#10b981' : '#f97316'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: soilOffset }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-extrabold text-orange-200 font-mono tracking-tight tabular-nums">
              {Math.round(soilMoisture)}%
            </span>
          </div>
        </div>

        <div className="text-center pt-1 border-t border-slate-800/60">
          <p className="text-[11px] font-medium flex items-center justify-center gap-1">
            {soilMoisture >= 55 ? (
              <>
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Irrigated Turf</span>
              </>
            ) : (
              <span className="text-orange-300 font-medium">Dry Landscape</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
