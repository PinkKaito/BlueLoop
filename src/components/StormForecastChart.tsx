'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ForecastDataPoint } from '@/types';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StormForecastChartProps {
  data: ForecastDataPoint[];
  unmanagedPeak: number;
  managedPeak: number;
  isDrawdownExecuted: boolean;
}

// Custom Glassmorphic Tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const unmanaged = payload.find((p: any) => p.dataKey === 'unmanaged')?.value;
    const managed = payload.find((p: any) => p.dataKey === 'managed')?.value;
    const rain = payload[0]?.payload?.rainMm;
    const diff = unmanaged && managed ? Math.round(unmanaged - managed) : 0;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-2.5 shadow-2xl backdrop-blur-xl text-xs z-50 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
          <span className="font-bold text-white font-mono">{label} Timeline</span>
          <span className="text-[10px] text-slate-400 font-mono">Rain: {rain}mm</span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-rose-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Without BlueLoop:
            </span>
            <span className="font-bold text-xs tabular-nums">{unmanaged}%</span>
          </div>

          <div className="flex items-center justify-between text-emerald-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              With BlueLoop:
            </span>
            <span className="font-bold text-xs tabular-nums">{managed}%</span>
          </div>

          <div className="mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-cyan-300">
            <span>Buffer Protection:</span>
            <span className="font-bold">+{diff}% Margin</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StormForecastChart: React.FC<StormForecastChartProps> = ({
  data,
  unmanagedPeak,
  managedPeak,
  isDrawdownExecuted,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const riskMitigatedPct = Math.round(unmanagedPeak - managedPeak);

  return (
    <div className="exec-card rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col justify-between h-full relative overflow-hidden shadow-lg">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide uppercase">
              Storm Simulation & Capacity Forecast
            </h3>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            12-Hour Retention (Pre-Storm Drawdown vs. Passive Overflow)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-1 rounded bg-rose-500" />
            <span>Unmanaged ({unmanagedPeak}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-1 rounded bg-emerald-400" />
            <span>With BlueLoop ({managedPeak}%)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 border-t border-dashed border-rose-500" />
            <span className="text-rose-400/90">Danger (100%)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-[160px] max-h-[195px] relative">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="unmanagedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="managedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                fontFamily="JetBrains Mono"
              />

              <YAxis
                domain={[0, 120]}
                stroke="#64748b"
                fontSize={9}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                fontFamily="JetBrains Mono"
                ticks={[0, 20, 40, 60, 80, 100, 120]}
                tickFormatter={(val) => `${val}%`}
              />

              <ReferenceLine
                y={100}
                stroke="#F43F5E"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Danger (100%)',
                  position: 'insideTopRight',
                  fill: '#F43F5E',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: 'Inter',
                }}
              />

              <Tooltip content={<CustomChartTooltip />} />

              <Area
                type="monotone"
                dataKey="unmanaged"
                stroke="#F43F5E"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#unmanagedGrad)"
                name="Without BlueLoop"
                isAnimationActive={true}
              />

              <Area
                type="monotone"
                dataKey="managed"
                stroke="#10B981"
                strokeWidth={2.8}
                fillOpacity={1}
                fill="url(#managedGrad)"
                name="With BlueLoop"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-xs">
            Loading Hydrograph Simulation...
          </div>
        )}
      </div>

      {/* Bottom Comparison Summary Callout */}
      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          {unmanagedPeak >= 100 ? (
            <div className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertTriangle className="w-3 h-3" />
              <span>Unmanaged surge causes {unmanagedPeak}% breach.</span>
            </div>
          ) : (
            <span className="text-slate-400">Peak within safe capacity.</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Flood Risk mitigated by {riskMitigatedPct}%.</span>
        </div>
      </div>
    </div>
  );
};
