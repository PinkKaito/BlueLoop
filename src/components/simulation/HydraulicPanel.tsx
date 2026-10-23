'use client';

import { Droplets, Waves } from 'lucide-react';
import { canalHeadroom, percent, RainDataset, Simulation, Site } from '@/lib/simulation';
import { TOWNSHIP_CONTEXT } from '@/lib/township-context';

const number = (n: number) => Math.round(n).toLocaleString('en-MY');
export function HydraulicPanel({ state: s, site, dataset, playing }: { state: Simulation; site: Site; dataset: RainDataset; playing: boolean }) {
  const pond = percent(s.pond, site.pondCapacity);
  const tank = percent(s.tank, site.tankCapacity);
  const stale = s.fault === 'sensor-offline';
  const active = s.transferFlow > 0;
  const canal = s.canalFlow > 0;
  return <div className="hydraulic-column" data-playing={playing}>
    <section className="panel hydraulic-panel" aria-labelledby="hydraulic-heading">
      <div className="panel-heading"><div><h2 id="hydraulic-heading">Hydraulic Routing Flow Schematic</h2><p>Mock retention pond, park reuse storage & canal</p></div><Waves size={20} className="blue" /></div>
      <div className="schematic">
        <svg viewBox="0 0 560 285" role="img" aria-label={`Simulated pond ${pond.toFixed(1)} percent, tank ${tank.toFixed(1)} percent. Transfer ${number(s.transferFlow)} cubic metres per hour. Canal ${number(s.canalFlow)} cubic metres per hour.`}>
          <defs><clipPath id="pond-clip"><rect x="26" y="38" width="160" height="186" rx="10" /></clipPath><clipPath id="tank-clip"><rect x="368" y="38" width="160" height="186" rx="10" /></clipPath></defs>
          <rect x="25" y="37" width="162" height="188" rx="11" className="vessel" />
          <g clipPath="url(#pond-clip)"><rect x="26" y={224 - pond * 1.86} width="160" height={pond * 1.86} fill="var(--water)" opacity=".85" /></g>
          <path d="M30 36 H182" stroke="var(--red)" strokeWidth="2" strokeDasharray="4 4" />
          <text x="106" y="23" textAnchor="middle" className="svg-small" fill="var(--red)">100% OVERFLOW THRESHOLD</text>
          <rect x="36" y="47" width="140" height="36" rx="5" className="svg-label" />
          <text x="106" y="63" textAnchor="middle" className="svg-title">RETENTION POND</text>
          <text x="106" y="77" textAnchor="middle" className="svg-small">{TOWNSHIP_CONTEXT[site.id].pondLabel}</text>
          <rect x="49" y="101" width="114" height="57" rx="7" className="svg-label" />
          <text x="106" y="128" textAnchor="middle" className="svg-value" fill="var(--water)">{pond.toFixed(1)}%</text>
          <text x="106" y="146" textAnchor="middle" className="svg-small">{stale ? 'SENSOR OFFLINE' : 'SIMULATED LEVEL'}</text>
          <rect x="34" y="197" width="144" height="20" rx="4" className="svg-label" />
          <text x="106" y="211" textAnchor="middle" className="svg-small">{number(s.pond)} / {number(site.pondCapacity)} m³</text>
          <path d="M188 174 H367" className="pipe-base" />
          <path d="M188 174 H367" className={active ? 'pipe-moving transfer' : 'pipe-still'} />
          <path d="M277 174 V253 H474" className="pipe-base" />
          <path d="M277 174 V253 H474" className={canal ? 'pipe-moving canal' : 'pipe-still'} />
          <circle cx="277" cy="174" r="17" className="valve-symbol" />
          <path d="M270 165 L284 183 M284 165 L270 183" stroke={active ? 'var(--green)' : 'var(--muted)'} strokeWidth="3" />
          <rect x="212" y="111" width="131" height="40" rx="6" className="svg-label" />
          <text x="277" y="128" textAnchor="middle" className="svg-title">VALVE V-02</text>
          <text x="277" y="143" textAnchor="middle" className="svg-small">{number(s.transferFlow)} m³/h</text>
          <rect x="367" y="37" width="162" height="188" rx="11" className="vessel" />
          <g clipPath="url(#tank-clip)"><rect x="368" y={224 - tank * 1.86} width="160" height={tank * 1.86} fill="var(--green)" opacity=".82" /></g>
          <rect x="378" y="47" width="140" height="36" rx="5" className="svg-label" />
          <text x="448" y="63" textAnchor="middle" className="svg-title">IRRIGATION TANK</text>
          <text x="448" y="77" textAnchor="middle" className="svg-small">{TOWNSHIP_CONTEXT[site.id].tankLabel}</text>
          <rect x="391" y="101" width="114" height="57" rx="7" className="svg-label" />
          <text x="448" y="128" textAnchor="middle" className="svg-value" fill="var(--green)">{tank.toFixed(1)}%</text>
          <text x="448" y="146" textAnchor="middle" className="svg-small">CISTERN BUFFER</text>
          <rect x="376" y="197" width="144" height="20" rx="4" className="svg-label" />
          <text x="448" y="211" textAnchor="middle" className="svg-small">{number(s.tank)} / {number(site.tankCapacity)} m³</text>
          <rect x="392" y="240" width="143" height="27" rx="5" className="svg-label" />
          <text x="463" y="257" textAnchor="middle" className="svg-small" fill={canal ? 'var(--amber)' : 'var(--muted)'}>CANAL, {number(s.canalFlow)} m³/h</text>
        </svg>
      </div>
      <div className="schematic-meta"><span>Transfer mode <strong>{s.emergencyStop ? 'Emergency hold' : active ? 'Internal reuse' : canal ? 'Canal bypass' : 'Standby'}</strong></span><span className={canalHeadroom(s, dataset) < 30 ? 'red' : 'blue'}>Canal headroom {canalHeadroom(s, dataset).toFixed(0)}%</span></div>
    </section>
    <div className="gauge-grid">
      <Gauge label="Pond storage" value={pond} color={pond >= 90 ? 'var(--red)' : 'var(--water)'} sub={`${number(s.pond)} m³`} stale={stale} />
      <Gauge label="Irrigation tank" value={tank} color="var(--green)" sub={`${number(s.tank)} m³`} stale={stale} />
      <Gauge label="Soil moisture" value={s.soil} color={s.soil >= 80 ? 'var(--amber)' : 'var(--water)'} sub={s.soil >= 80 ? 'Irrigation held' : 'Reuse available'} stale={stale} />
    </div>
    <div className="telemetry-note"><Droplets size={14} /><span>{stale ? 'Device loss injected. Controls held; model readings shown for diagnosis.' : 'Simulated telemetry, volumes follow a shared water balance'}</span></div>
  </div>;
}
function Gauge({ label, value, color, sub, stale }: { label: string; value: number; color: string; sub: string; stale: boolean }) {
  const radius = 38, circumference = 2 * Math.PI * radius;
  return <section className={`panel gauge ${stale ? 'stale' : ''}`} aria-label={`${label}: ${value.toFixed(1)} percent, simulated`}><h3>{label}</h3>
    <div className="gauge-graphic"><svg viewBox="0 0 92 92" aria-hidden="true"><circle cx="46" cy="46" r={radius} fill="none" stroke="var(--border)" strokeWidth="7" /><circle cx="46" cy="46" r={radius} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.min(value, 100) / 100)} transform="rotate(-90 46 46)" /></svg><strong>{value.toFixed(1)}<small>%</small></strong></div>
    <span className="gauge-sub">{sub}</span>
  </section>;
}
