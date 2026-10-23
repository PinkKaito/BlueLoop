'use client';

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Projection } from '@/lib/simulation';

export function ForecastPanel({
  points,
  approved,
}: {
  points: Projection[];
  approved: boolean;
}) {
  return (
    <section
      className="panel forecast-panel"
      aria-labelledby="forecast-heading"
    >
      <div className="panel-heading">
        <div>
          <h2 id="forecast-heading">Pond forecast</h2>
          <p>
            Next 12 hours with {approved ? 'approved' : 'proposed'} controls
          </p>
        </div>
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`Forecast storage demand: unmanaged peak ${Math.max(...points.map((p) => p.unmanaged)).toFixed(1)} percent, BlueLoop peak ${Math.max(...points.map((p) => p.managed)).toFixed(1)} percent. Values above 100 percent indicate overflow demand.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={points}
            margin={{ top: 15, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeWidth={0.5}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
              minTickGap={22}
            />
            <YAxis
              domain={[
                0,
                (max: number) => Math.max(120, Math.ceil(max / 20) * 20),
              ]}
              tickFormatter={(n) => `${n}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--muted)' }}
            />
            <YAxis yAxisId="rain" orientation="right" hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '0.5px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}${name === 'Rainfall' ? ' mm/h' : '%'}`,
                name,
              ]}
              labelFormatter={(label) => `Forecast ${label}`}
            />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Area
              yAxisId="rain"
              type="stepAfter"
              dataKey="rain"
              name="Rainfall"
              fill="var(--water)"
              fillOpacity={0.07}
              stroke="none"
              isAnimationActive={false}
            />
            <ReferenceLine
              y={100}
              strokeWidth={0.5}
              stroke="var(--red)"
              strokeDasharray="5 4"
              label={{
                value: '100% overflow threshold',
                position: 'insideTopLeft',
                fill: 'var(--red)',
                fontSize: 12,
              }}
            />
            <Line
              type="linear"
              dataKey="unmanaged"
              name="Unmanaged runoff"
              stroke="var(--sage-9)"
              strokeWidth={0.5}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="managed"
              name={approved ? 'BlueLoop approved' : 'BlueLoop proposed'}
              stroke="var(--water)"
              strokeWidth={0.5}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
