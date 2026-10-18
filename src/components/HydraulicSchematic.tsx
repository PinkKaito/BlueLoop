'use client';

import React from 'react';
import { TelemetryData } from '@/types';

interface HydraulicSchematicProps {
  telemetry: TelemetryData;
  isDrawdownActive: boolean;
  canalReleaseOpen: boolean;
  onToggleCanalRelease: () => void;
}

export const HydraulicSchematic: React.FC<HydraulicSchematicProps> = ({
  telemetry,
  isDrawdownActive,
  canalReleaseOpen,
  onToggleCanalRelease,
}) => {
  const { pondLevel, tankLevel, soilMoisture, pumpFlowRate } = telemetry;

  // Pond fill: Y goes from 36 (100%) to 115 (0%). Height range = 79
  const pondWaterY = Math.max(36, Math.min(115, 115 - (pondLevel / 100) * 79));
  const pondWaterHeight = (pondLevel / 100) * 79 + 10;

  // Tank fill: Y goes from 196 (100%) to 268 (0%). Height range = 72
  const tankWaterY = Math.max(196, Math.min(268, 268 - (tankLevel / 100) * 72));
  const tankWaterHeight = (tankLevel / 100) * 72 + 12;

  return (
    <div className="exec-card accent-top-cyan rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden h-full shadow-lg">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-1">
        <div>
          <h2 className="text-xs font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#0ea5e9]" />
            Hydraulic Topology
          </h2>
          <p className="text-[10px] text-slate-400">
            Real-time retention &amp; reuse circuit
          </p>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border transition-all ${
            isDrawdownActive
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
              : pondLevel <= 60
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}
        >
          {isDrawdownActive
            ? 'ACTIVE // TRANSFERRING'
            : pondLevel <= 60
            ? 'OPTIMAL // BUFFER READY'
            : 'STANDBY // POND HIGH'}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 flex items-center justify-center my-0.5 min-h-[220px]">
        <svg viewBox="0 0 460 380" className="w-full h-full max-h-[300px]">
          <defs>
            <filter id="cyanGlowSvg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="greenGlowSvg" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <linearGradient id="pondWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={0.4} />
            </linearGradient>

            <linearGradient id="tankWaterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#0369a1" stopOpacity={0.45} />
            </linearGradient>

            <clipPath id="pondClip">
              <polygon points="105,36 305,36 280,115 130,115" />
            </clipPath>

            <clipPath id="tankClip">
              <rect x="148" y="188" width="114" height="86" rx="10" />
            </clipPath>
          </defs>

          {/* Static Pipes */}
          <path
            d="M 155 115 L 155 145 L 70 145 L 70 330 L 145 330"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 70 232 L 148 232" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
          <path d="M 205 115 L 205 180" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <path d="M 205 274 L 205 315" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <path d="M 265 115 L 265 145 L 380 145" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

          {/* Animated Flows */}
          <path
            className={`pipe-flow text-cyan-400 ${isDrawdownActive ? 'active fast' : ''}`}
            d="M 205 115 L 205 180"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className={`pipe-flow text-cyan-400 ${isDrawdownActive ? 'active fast' : ''}`}
            d="M 155 115 L 155 145 L 70 145 L 70 330 L 145 330"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className={`pipe-flow text-cyan-400 ${isDrawdownActive ? 'active fast' : ''}`}
            d="M 70 232 L 148 232"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className={`pipe-flow text-emerald-400 ${isDrawdownActive ? 'active fast' : ''}`}
            d="M 205 274 L 205 315"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className={`pipe-flow text-amber-400 ${canalReleaseOpen ? 'active' : ''}`}
            d="M 265 115 L 265 145 L 380 145"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          />

          {/* 1. Retention Pond */}
          <g>
            <g clipPath="url(#pondClip)">
              <rect
                className="water-wave"
                x="100"
                y={pondWaterY}
                width="210"
                height={pondWaterHeight}
                fill="url(#pondWaterGrad)"
              />
              <line
                className="water-wave"
                x1="100"
                y1={pondWaterY}
                x2="310"
                y2={pondWaterY}
                stroke="#67e8f9"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />
            </g>

            <path
              d="M 98 32 L 105 32 L 130 115 L 280 115 L 305 32 L 312 32"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#cyanGlowSvg)"
            />

            <path
              d="M 108 42 Q 125 36, 142 42 T 176 42 T 210 42 T 244 42 T 278 42 T 302 42"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              opacity="0.5"
            />

            <text x="205" y="85" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
              Retention Pond
            </text>
            <text
              x="205"
              y="101"
              textAnchor="middle"
              fill="#67e8f9"
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight="600"
            >
              {Math.round(pondLevel)}% CAPACITY
            </text>
          </g>

          {/* Valves */}
          <g transform="translate(205, 148)">
            <circle r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <path
              d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
              transform="translate(-5.5, -6) scale(0.45)"
              fill="#38bdf8"
            />
          </g>

          <g transform="translate(108, 232)">
            <circle r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <path
              d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
              transform="translate(-5.5, -6) scale(0.45)"
              fill="#38bdf8"
            />
          </g>

          <g
            transform="translate(382, 145)"
            className="cursor-pointer group"
            onClick={onToggleCanalRelease}
          >
            <rect
              x="-40"
              y="-18"
              width="80"
              height="32"
              rx="6"
              fill="#0f172a"
              stroke={canalReleaseOpen ? '#f59e0b' : '#334155'}
              strokeWidth="1.5"
              className="transition-colors group-hover:stroke-amber-400"
            />
            <text x="0" y="-4" textAnchor="middle" fill="#94a3b8" fontSize="7.5" fontWeight="700">
              CANAL SLUICE
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill={canalReleaseOpen ? '#fbbf24' : '#64748b'}
              fontSize="8.5"
              fontFamily="JetBrains Mono"
              fontWeight="700"
            >
              {canalReleaseOpen ? 'OPEN (15%)' : 'STANDBY'}
            </text>
          </g>

          {/* 2. Irrigation Tank */}
          <g>
            <g clipPath="url(#tankClip)">
              <rect
                className="water-wave"
                x="148"
                y={tankWaterY}
                width="114"
                height={tankWaterHeight}
                fill="url(#tankWaterGrad)"
              />
              <ellipse
                className="water-wave"
                cx="205"
                cy={tankWaterY}
                rx="57"
                ry="8"
                fill="#38bdf8"
                fillOpacity="0.45"
                stroke="#7dd3fc"
                strokeWidth="1.2"
              />
            </g>

            <path
              d="M 148 196 L 148 264 A 57 12 0 0 0 262 264 L 262 196"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              filter="url(#cyanGlowSvg)"
            />
            <ellipse
              cx="205"
              cy="196"
              rx="57"
              ry="12"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="2.5"
              filter="url(#cyanGlowSvg)"
            />

            <text x="205" y="295" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="600">
              Storage Tank ({Math.round(tankLevel)}%)
            </text>
          </g>

          {/* Valve 4 */}
          <g transform="translate(205, 305)">
            <circle r="8" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
            <path
              d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
              transform="translate(-5, -5.5) scale(0.4)"
              fill="#34d399"
            />
          </g>

          {/* 3. Park Grounds */}
          <g transform="translate(145, 320)">
            <path d="M 22 28 L 22 38" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" />
            <circle
              cx="22"
              cy="20"
              r="9"
              fill="#064e3b"
              stroke="#4ade80"
              strokeWidth="2"
              filter="url(#greenGlowSvg)"
            />

            <rect x="44" y="26" width="28" height="3.5" rx="1" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            <line x1="48" y1="28" x2="48" y2="38" stroke="#4ade80" strokeWidth="1.8" />
            <line x1="68" y1="28" x2="68" y2="38" stroke="#4ade80" strokeWidth="1.8" />

            <path d="M 98 28 L 98 38" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" />
            <ellipse
              cx="98"
              cy="18"
              rx="9"
              ry="11"
              fill="#064e3b"
              stroke="#4ade80"
              strokeWidth="2"
              filter="url(#greenGlowSvg)"
            />

            <rect
              x="5"
              y="38"
              width="110"
              height="14"
              rx="3"
              fill="#064e3b"
              fillOpacity="0.6"
              stroke="#4ade80"
              strokeWidth="2"
              filter="url(#greenGlowSvg)"
            />

            <g className={`transition-opacity duration-500 ${isDrawdownActive ? 'opacity-100' : 'opacity-0'}`}>
              <path d="M 35 37 Q 26 26 18 32" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
              <path d="M 60 37 Q 60 24 60 30" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
              <path d="M 85 37 Q 94 26 102 32" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
            </g>

            <text x="60" y="63" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
              Township Park Turf ({Math.round(soilMoisture)}%)
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Pump Status Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDrawdownActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`}
          />
          <span className="font-mono">
            Pumps: {isDrawdownActive ? `ACTIVE (${pumpFlowRate} m³/h)` : 'IDLE (0 m³/h)'}
          </span>
        </div>

        <button
          onClick={onToggleCanalRelease}
          className="text-cyan-400 hover:text-cyan-300 underline font-medium text-[10px]"
        >
          {canalReleaseOpen ? 'Close Valve' : 'Test Valve'}
        </button>
      </div>
    </div>
  );
};
