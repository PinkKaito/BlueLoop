'use client';
import { sage as radixSage, teal as radixTeal } from '@radix-ui/colors';

import Link from 'next/link';
import Image from 'next/image';
import { ReactNode, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  ExternalLink,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  Square,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SceneView } from './SceneView';
import {
  asCsv,
  clockTime,
  uiCopy,
  download,
  number,
  useBlueLoop,
} from './BlueLoopProvider';
import { ForecastPanel } from '@/components/simulation/ForecastPanel';
import {
  CONDITION_NAMES,
  Condition,
  Fault,
  percent,
  SCENARIOS,
  ScenarioId,
  simulatedTime,
  waterBalanceError,
} from '@/lib/simulation';
import { rainfallTemplate } from '@/lib/datasets';

export const chapters = [
  {
    slug: 'baseline',
    title: 'Normal baseline',
    short: 'Baseline',
    condition: 1 as Condition,
    detail: 'Review storage and standby operation.',
    view: 'site' as const,
  },
  {
    slug: 'pre-storm',
    title: 'Pre-storm alert',
    short: 'Pre-storm',
    condition: 2 as Condition,
    detail: 'Compare forecast demand with available pond capacity.',
    view: 'pond' as const,
  },
  {
    slug: 'reuse',
    title: 'Internal reuse',
    short: 'Reuse',
    condition: 3 as Condition,
    detail: 'Inspect transfer to storage and landscape irrigation.',
    view: 'tank' as const,
  },
  {
    slug: 'canal-release',
    title: 'Staged canal release',
    short: 'Canal release',
    condition: 4 as Condition,
    detail: 'Check downstream capacity and release safeguards.',
    view: 'canal' as const,
  },
  {
    slug: 'results',
    title: 'Post-storm results',
    short: 'Results',
    condition: 5 as Condition,
    detail: 'Compare delivery, overflow, and peak storage.',
    view: 'site' as const,
  },
];
function Heading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
function Metric({
  label,
  value,
  unit,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
      {note && <p>{note}</p>}
    </div>
  );
}
function SectionTitle({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
function EventRows({ limit = 4 }: { limit?: number }) {
  const { s, dataset } = useBlueLoop();
  return (
    <ol className="event-list">
      {s.events
        .slice(-limit)
        .reverse()
        .map((e) => (
          <li key={e.id}>
            <i className={e.level} />
            <div>
              <p>{uiCopy(e.message)}</p>
              <time>{clockTime(simulatedTime(dataset, e.hour))} MYT</time>
            </div>
          </li>
        ))}
    </ol>
  );
}
function Decision() {
  const { s, site, forecast, command, gateReason, ended } = useBlueLoop();
  const peak = Math.max(...forecast.map((p) => p.unmanaged));
  const prepare = peak > site.targetPondPercent;
  const blocked =
    s.emergencyStop ||
    s.fault === 'sensor-offline' ||
    s.fault === 'actuator-failure' ||
    ended;
  return (
    <section className="decision-panel">
      <h2>
        {s.emergencyStop
          ? 'Emergency hold is active.'
          : s.approved
            ? 'Drawdown approved.'
            : prepare
              ? 'Pre-storm drawdown.'
              : 'System on standby.'}
      </h2>
      {s.emergencyStop && (
        <p>Clear the hold and approve again to resume routing.</p>
      )}
      <div className="decision-facts">
        <div>
          <span>Projected demand</span>
          <strong>{number(peak, 1)}%</strong>
        </div>
        <div>
          <span>Operating condition</span>
          <strong>{s.condition} of 5</strong>
        </div>
      </div>
      {!s.approved && prepare ? (
        <button
          className="button primary"
          disabled={blocked}
          onClick={() => command(approveDrawdown)}
        >
          <CheckCircle2 size={15} />
          Approve drawdown
        </button>
      ) : (
        <Link className="text-link" href="/scenarios">
          Open scenarios
          <ArrowRight size={15} />
        </Link>
      )}
      {gateReason && (
        <div className="safety-note">
          <ShieldCheck size={15} />
          <span>{gateReason}</span>
        </div>
      )}
    </section>
  );
}
import { approve as approveDrawdown } from '@/lib/simulation';

export function OverviewView() {
  const { s, site, rainNext, tariff, status } = useBlueLoop();
  return (
    <>
      <Heading
        title="Township overview"
        action={
          <Link className="button" href="/network">
            Open water network
            <ArrowUpRight size={15} />
          </Link>
        }
      />
      <div className="overview-context">
        <span>
          <MapPinIcon />
          Elmina Central Park{' '}
          <span className="subtle-text">/ City of Elmina</span>
        </span>
        <span className="system-state">
          <i />
          {status.toLowerCase().replaceAll('_', ' ')}
        </span>
      </div>
      <div className="metrics-strip">
        <Metric
          label="Pond headroom"
          value={number(site.pondCapacity - s.pond)}
          unit=" m³"
          note={`${number(100 - percent(s.pond, site.pondCapacity), 1)}% of total capacity`}
        />
        <Metric
          label="Rain in next 6 hours"
          value={number(rainNext, 1)}
          unit=" mm"
        />
        <Metric
          label="Irrigation delivered"
          value={number(s.irrigated)}
          unit=" m³"
        />
        <Metric
          label="Estimated savings"
          value={`RM ${number(s.irrigated * tariff, 2)}`}
          note={`At RM ${number(tariff, 2)}/m³`}
        />
      </div>
      <div className="overview-grid">
        <SceneView compact />
        <aside className="overview-rail">
          <Decision />
          <section className="recent-panel">
            <SectionTitle title="Latest activity">
              <Link href="/activity" className="subtle-link">
                View all
                <ChevronRight size={13} />
              </Link>
            </SectionTitle>
            <EventRows limit={3} />
          </section>
        </aside>
      </div>
    </>
  );
}
function MapPinIcon() {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 6c0 4-5 8-5 8S2 10 2 6a5 5 0 1 1 10 0Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="7" cy="6" r="1.5" stroke="currentColor" />
    </svg>
  );
}
export function NetworkView() {
  const { s, site } = useBlueLoop();
  return (
    <>
      <Heading title="Water network" />
      <SceneView />
      <div className="network-facts">
        <div>
          <span>Retention pond</span>
          <strong>{number(site.pondCapacity)} m³</strong>
          <p>DEMO-01</p>
        </div>
        <div>
          <span>Combined reuse storage</span>
          <strong>{number(site.tankCapacity)} m³</strong>
          <p>TK-01 / 02</p>
        </div>
        <div>
          <span>Internal transfer</span>
          <strong>{number(s.transferFlow)} m³/h</strong>
          <p>PS-01</p>
        </div>
        <div>
          <span>Controlled canal release</span>
          <strong>{number(s.canalFlow)} m³/h</strong>
          <p>GV-01</p>
        </div>
      </div>
    </>
  );
}

export function ScenariosView() {
  const { guidedDemo } = useBlueLoop();
  return (
    <>
      <Heading
        title="Scenario studio"
        action={
          <Link
            href="/scenarios/pre-storm"
            onClick={guidedDemo}
            className="button primary"
          >
            <Play size={14} />
            Start guided demo
          </Link>
        }
      />
      <div className="chapter-grid">
        {chapters.map((c, i) => (
          <Link
            key={c.slug}
            href={`/scenarios/${c.slug}`}
            className="chapter-card"
          >
            <div className="chapter-image">
              <Image
                src={`/scene/previews/${c.slug}.jpg`}
                alt=""
                width={1148}
                height={560}
                className="chapter-art"
                unoptimized
              />
              <span className="chapter-count">Condition 0{i + 1}</span>
            </div>
            <div className="chapter-copy">
              <h2>
                {c.title}
                <ArrowUpRight size={17} />
              </h2>
              <p>{c.detail}</p>
              <span className="chapter-link">
                Open scenario
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
function OperatorControls() {
  const {
    s,
    scenario,
    dataset,
    tariff,
    setSession,
    resetRun,
    fault,
    command,
    toggleGate,
    gateReason,
    stop,
  } = useBlueLoop();
  return (
    <section className="panel operator-panel">
      <SectionTitle title="Scenario controls">
        <SlidersHorizontal size={16} />
      </SectionTitle>
      <div className="controls-grid">
        <label>
          Weather scenario
          <select
            value={dataset.kind === 'synthetic' ? scenario : 'dataset'}
            onChange={(e) => resetRun(e.target.value as ScenarioId, false)}
          >
            {dataset.kind !== 'synthetic' && (
              <option value="dataset">Loaded rainfall replay</option>
            )}
            {Object.entries(SCENARIOS).map(([id, p]) => (
              <option key={id} value={id}>
                {uiCopy(p.name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Fault demonstration
          <select
            value={s.fault}
            onChange={(e) => fault(e.target.value as Fault)}
          >
            <option value="none">No injected fault</option>
            <option value="sensor-offline">Sensor offline</option>
            <option value="actuator-failure">Actuator failure</option>
            <option value="canal-blocked">Downstream canal blocked</option>
          </select>
        </label>
        <label>
          Illustrative tariff, RM/m³
          <input
            type="number"
            value={tariff}
            min="0"
            max="100"
            step="0.1"
            onChange={(e) => {
              if (
                e.target.value !== '' &&
                Number.isFinite(e.target.valueAsNumber)
              )
                setSession((c) => ({
                  ...c,
                  tariff: Math.max(0, Math.min(100, e.target.valueAsNumber)),
                }));
            }}
          />
        </label>
      </div>
      <div className="operator-switches">
        <label>
          <input
            type="checkbox"
            checked={s.automatic}
            onChange={(e) => {
              const enabled = e.target.checked;
              command((c) =>
                addAudit(
                  { ...c, automatic: enabled },
                  `Automatic supervision ${enabled ? 'enabled' : 'disabled'}.`
                )
              );
            }}
          />
          Automatic approval
        </label>
        <label>
          <input
            type="checkbox"
            checked={s.canalEnabled}
            disabled={!s.canalEnabled && !!gateReason}
            onChange={toggleGate}
          />
          Staged canal release
        </label>
        <button
          className={`button compact ${s.emergencyStop ? 'primary' : 'danger-button'}`}
          onClick={stop}
        >
          <Square size={12} />
          {s.emergencyStop ? 'Release emergency hold' : 'Emergency stop'}
        </button>
      </div>
      <div className="safety-note">
        <ShieldCheck size={15} />
        <span>
          {gateReason ??
            'Canal release requires drawdown approval and downstream headroom.'}
        </span>
      </div>
    </section>
  );
}
import { addEvent as addAudit } from '@/lib/simulation';
export function ChapterView({ slug }: { slug: string }) {
  const chapter = chapters.find((c) => c.slug === slug)!;
  const { s, site, jumpTo, forecast, notice } = useBlueLoop();
  const index = chapters.indexOf(chapter);
  return (
    <>
      <div className="chapter-breadcrumb">
        <Link href="/scenarios">Scenario studio</Link>
        <ChevronRight size={13} />
        <span>Condition 0{index + 1}</span>
      </div>
      <Heading
        title={chapter.title}
        action={
          <button
            className="button primary"
            onClick={() => jumpTo(chapter.condition)}
          >
            Load this preset
            <ArrowRight size={15} />
          </button>
        }
      />
      <nav className="chapter-tabs" aria-label="Scenario chapters">
        {chapters.map((c) => (
          <Link
            key={c.slug}
            href={`/scenarios/${c.slug}`}
            className={c.slug === slug ? 'active' : ''}
            aria-current={c.slug === slug ? 'page' : undefined}
          >
            {c.short}
          </Link>
        ))}
      </nav>
      <div className="chapter-run-state">
        <span>
          <i className="live-dot" />
          Current run: {CONDITION_NAMES[s.condition]}
        </span>
        <span>{uiCopy(notice)}</span>
      </div>
      {slug === 'results' ? (
        <ImpactContent />
      ) : (
        <>
          <div className="scenario-grid">
            <SceneView compact initialView={chapter.view} />
            <aside className="overview-rail">
              <Decision />
              <div className="chapter-explanation">
                <div className="mini-reading">
                  <span>Pond storage</span>
                  <strong>
                    {number(percent(s.pond, site.pondCapacity), 1)}%
                  </strong>
                </div>
                <div className="mini-reading">
                  <span>Reuse storage</span>
                  <strong>
                    {number(percent(s.tank, site.tankCapacity), 1)}%
                  </strong>
                </div>
              </div>
            </aside>
          </div>
          <div className="scenario-bottom">
            <ForecastPanel points={forecast} approved={s.approved} />
            <OperatorControls />
          </div>
        </>
      )}
      <div className="chapter-pagination">
        {index > 0 ? (
          <Link href={`/scenarios/${chapters[index - 1].slug}`}>
            ← {chapters[index - 1].title}
          </Link>
        ) : (
          <span />
        )}
        {index < 4 && (
          <Link href={`/scenarios/${chapters[index + 1].slug}`}>
            {chapters[index + 1].title}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </>
  );
}

function ImpactContent() {
  const { s, tariff, site, dataset } = useBlueLoop();
  const chart = [
    {
      name: 'BlueLoop',
      peak: percent(s.peakPond, site.pondCapacity),
      overflow: s.overflow,
    },
    {
      name: 'Unmanaged',
      peak: percent(s.unmanagedPeak, site.pondCapacity),
      overflow: s.unmanagedOverflow,
    },
  ];
  return (
    <>
      <div className="metrics-strip impact-metrics">
        <Metric
          label="Irrigation delivered"
          value={number(s.irrigated, 1)}
          unit=" m³"
        />
        <Metric
          label="Estimated savings"
          value={`RM ${number(s.irrigated * tariff, 2)}`}
          note={`At an illustrative RM ${number(tariff, 2)}/m³`}
        />
        <Metric
          label="Active drawdown"
          value={number(s.transferred + s.canalReleased)}
          unit=" m³"
          note="Internal transfer + canal release"
        />
        <Metric
          label="Overflow recorded"
          value={number(s.overflow, 1)}
          unit=" m³"
          note={
            s.overflow > 0
              ? 'Mitigation capacity exceeded'
              : 'In the run so far'
          }
        />
      </div>
      <div className="impact-grid">
        <section className="panel impact-chart">
          <SectionTitle title="Peak storage demand">
            <span className="quiet-label">
              Same rainfall and starting storage
            </span>
          </SectionTitle>
          <div className="impact-plot">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart}
                margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeWidth={0.5}
                  stroke={radixSage.sage6}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: radixSage.sage11, fontSize: 12 }}
                />
                <YAxis
                  unit="%"
                  domain={[
                    0,
                    (max: number) => Math.max(120, Math.ceil(max / 20) * 20),
                  ]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: radixSage.sage11, fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: radixSage.sage1,
                    border: '0.5px solid var(--sage-6)',
                    borderRadius: 4,
                    fontSize: 12,
                    color: radixSage.sage12,
                  }}
                  itemStyle={{ color: radixSage.sage12 }}
                  formatter={(value: number) => [
                    `${number(value, 1)}%`,
                    'Peak storage demand',
                  ]}
                  cursor={{ fill: radixSage.sage3 }}
                />
                <Bar
                  dataKey="peak"
                  fill={radixTeal.teal9}
                  maxBarSize={85}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="model-caption">
            Values above 100% include excess demand recorded as overflow.
          </p>
        </section>
        <section className="panel balance-panel">
          <SectionTitle title="Water balance" />
          <dl>
            {[
              ['Rainfall inflow', s.rainInflow],
              ['Internal transfer', s.transferred],
              ['Irrigation delivered', s.irrigated],
              ['Passive drainage', s.passiveReleased],
              ['Controlled release', s.canalReleased],
              ['Overflow', s.overflow],
            ].map(([label, v]) => (
              <div key={String(label)}>
                <dt>{label}</dt>
                <dd>
                  {number(Number(v), 1)} <span>m³</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="balance-check">
            <Check size={14} />
            Water balance residual: {Math.abs(waterBalanceError(s)).toFixed(
              6
            )}{' '}
            m³
          </div>
          <p className="model-caption">
            Internal transfer moves water between storage assets; it is not
            counted as a final outflow.
          </p>
        </section>
      </div>
      <div className="result-state">
        <ShieldCheck size={18} />
        <div>
          <strong>
            {s.hour >= dataset.points.length
              ? 'Replay complete'
              : s.hour === 0
                ? 'Ready to measure'
                : 'Run in progress'}
          </strong>
        </div>
      </div>
    </>
  );
}
export function ImpactView() {
  const { exportRun } = useBlueLoop();
  return (
    <>
      <Heading
        title="Impact & results"
        action={
          <button className="button" onClick={exportRun}>
            <ArrowDownToLine size={15} />
            Export run summary
          </button>
        }
      />
      <ImpactContent />
    </>
  );
}
export function ActivityView() {
  const { s, readings, dataset, exportRun } = useBlueLoop();
  const [tab, setTab] = useState('events'),
    [severity, setSeverity] = useState('all');
  const events = s.events.filter(
    (e) => severity === 'all' || e.level === severity
  );
  const exportCurrent = () =>
    download(
      `blueloop-elmina-${tab}.csv`,
      asCsv(
        tab === 'events'
          ? events.map((e) => ({
              timestamp: simulatedTime(dataset, e.hour),
              severity: e.level,
              event: e.message,
            }))
          : readings
      )
    );
  return (
    <>
      <Heading
        title="Telemetry & events"
        action={
          <button className="button" onClick={exportCurrent}>
            <ArrowDownToLine size={15} />
            Export {tab === 'events' ? 'events' : 'readings'}
          </button>
        }
      />
      <div className="activity-toolbar">
        <div className="local-tabs">
          <button
            className={tab === 'events' ? 'active' : ''}
            onClick={() => setTab('events')}
          >
            Event timeline<span>{events.length}</span>
          </button>
          <button
            className={tab === 'readings' ? 'active' : ''}
            onClick={() => setTab('readings')}
          >
            Model readings<span>{readings.length}</span>
          </button>
        </div>
        {tab === 'events' && (
          <label className="filter-label">
            Severity
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="all">All events</option>
              <option value="info">Information</option>
              <option value="warning">Warnings</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        )}
      </div>
      <section className="panel activity-panel">
        {tab === 'events' ? (
          <>
            <SectionTitle title="Operating timeline">
              <span className="quiet-label">{events.length} events, MYT</span>
            </SectionTitle>
            {events.length ? (
              <ol className="full-events">
                {events
                  .slice(-100)
                  .reverse()
                  .map((e) => (
                    <li key={e.id}>
                      <time>{clockTime(simulatedTime(dataset, e.hour))}</time>
                      <span className={`severity ${e.level}`}>{e.level}</span>
                      <p>{uiCopy(e.message)}</p>
                    </li>
                  ))}
              </ol>
            ) : (
              <p className="empty-state">No {severity} events in this run.</p>
            )}
          </>
        ) : (
          <>
            <SectionTitle title="Simulated readings">
              <span className="quiet-label">
                Latest 60 of {readings.length} samples
              </span>
            </SectionTitle>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Simulation time, MYT</th>
                    <th>Pond, m³</th>
                    <th>Tank, m³</th>
                    <th>Rain, mm/h</th>
                    <th>Transfer, m³/h</th>
                    <th>Canal, m³/h</th>
                  </tr>
                </thead>
                <tbody>
                  {readings
                    .slice(-60)
                    .reverse()
                    .map((r, i) => (
                      <tr key={i}>
                        <td>{clockTime(r.timestamp)}</td>
                        <td>{number(r.pond_m3)}</td>
                        <td>{number(r.tank_m3)}</td>
                        <td>{number(r.rain_mm_h, 1)}</td>
                        <td>{number(r.transfer_m3_h)}</td>
                        <td>{number(r.canal_m3_h)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {!readings.length && (
              <p className="empty-state">
                Advance the replay to collect model readings.
              </p>
            )}
            <p className="model-caption">
              Up to 2,000 samples collected this visit. Exports include all
              collected samples.
            </p>
          </>
        )}
      </section>
      <button className="text-link export-full" onClick={exportRun}>
        Export full run with provenance
        <ArrowUpRight size={14} />
      </button>
    </>
  );
}
export function DataView() {
  const {
    dataset,
    site,
    loading,
    loadWeather,
    importFile,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    notice,
    context,
  } = useBlueLoop();
  const total = dataset.points.reduce((a, p) => a + p.rainMm, 0);
  return (
    <>
      <Heading title="Data sources" />
      <section className="location-panel">
        <div>
          <MapPinIcon />
          <span>Reference site</span>
          <h2>Elmina Central Park</h2>
          <p>City of Elmina, Shah Alam, Selangor, Malaysia</p>
        </div>
        <div>
          <p>{context.proposedUse}</p>
          <a
            href={context.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            City of Elmina reference
            <ExternalLink size={13} />
          </a>
        </div>
      </section>
      <div className="data-grid">
        <section className="panel rainfall-panel">
          <SectionTitle title="Rainfall & replay">
            <CloudRain size={19} />
          </SectionTitle>
          <div className="dataset-summary">
            <span className="quiet-label">
              {dataset.kind === 'synthetic'
                ? 'Scenario input'
                : 'Rainfall replay'}
            </span>
            <h3>{uiCopy(dataset.name)}</h3>
            <p>{uiCopy(dataset.attribution)}</p>
            <div className="dataset-facts">
              <div>
                <strong>{dataset.points.length}</strong>
                <span>hourly records</span>
              </div>
              <div>
                <strong>
                  {number(total, 1)}
                  <small> mm</small>
                </strong>
                <span>total precipitation</span>
              </div>
            </div>
            <span className="quiet-label">
              {dataset.source}, {dataset.license}
            </span>
          </div>
          <div className="data-actions">
            <button
              className="button primary"
              disabled={loading}
              onClick={() => loadWeather('offline')}
            >
              <Play size={14} />
              Load Dec 2021 replay
            </button>
            <button
              className="button"
              disabled={loading}
              onClick={() => loadWeather('forecast')}
            >
              Fetch latest forecast
              <ArrowUpRight size={13} />
            </button>
          </div>
          <p className="inline-notice" role="status">
            {loading ? 'Loading and validating rainfall…' : notice}
          </p>
          <div className="historical-form">
            <label>
              From
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button
              className="button"
              disabled={loading || !startDate || !endDate}
              onClick={() => loadWeather('historical')}
            >
              Load history
            </button>
          </div>
          <p className="model-caption">
            Up to 7 days. Historical dates must be at least 5 days old.
          </p>
        </section>
        <section className="panel assumptions-panel">
          <SectionTitle title="Model assumptions" />
          <p>
            All pond, tank, pump, and gate readings are simulated. Regional ERA5
            rainfall is not a park rain-gauge measurement.
          </p>
          <dl>
            {[
              ['Pond capacity', `${number(site.pondCapacity)} m³`],
              ['Reuse capacity', `${number(site.tankCapacity)} m³`],
              ['Catchment area', `${number(site.catchmentArea)} m²`],
              ['Runoff coefficient', site.runoffCoefficient],
              ['Max transfer', `${number(site.transferRate)} m³/h`],
              ['Max canal release', `${number(site.canalRate)} m³/h`],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section className="panel import-panel">
        <SectionTitle title="Rainfall import">
          <ArrowDownToLine size={16} />
        </SectionTitle>
        <p>
          Import 2–168 consecutive hourly records with{' '}
          <code>timestamp,rain_mm</code>, explicit timezones, and rainfall from
          0–500 mm/h.
        </p>
        <div className="data-actions">
          <label className="button file-button">
            Import rainfall CSV
            <input
              type="file"
              aria-label="Import rainfall CSV"
              accept=".csv,text/csv"
              onChange={(e) => {
                void importFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          <button
            className="button"
            onClick={() =>
              download('blueloop-rainfall-template.csv', rainfallTemplate)
            }
          >
            Download template
          </button>
          <button
            className="text-link"
            onClick={() =>
              download(
                'blueloop-elmina-rainfall.csv',
                asCsv(
                  dataset.points.map((p) => ({
                    timestamp: p.time,
                    rain_mm: p.rainMm,
                  }))
                )
              )
            }
          >
            Export current rainfall
            <ArrowUpRight size={13} />
          </button>
        </div>
      </section>
      <section className="source-references">
        <SectionTitle title="Sources & credits" />
        <Source
          title="Open-Meteo / ERA5"
          href="https://open-meteo.com/"
          text="Hourly weather input. The bundled December 2021 dataset works offline. CC BY 4.0 attribution; regional reanalysis, not device telemetry."
        />
        <Source
          title="Poly Haven, CC0 assets"
          href="https://polyhaven.com/"
          text="Island Tree 01 and Shrub 01 models; Grass Ground and Concrete Floor Worn 001 materials; Kloofendal daylight environment. Locally bundled and optimized for this scene."
        />
        <Source
          title="Three.js"
          href="https://threejs.org/"
          text="Interactive 3D rendering and the example water normal texture, under the MIT license. Infrastructure meshes are authored for this prototype."
        />
        <Source
          title="Sime Darby Property"
          href="https://www.simedarbyproperty.com/universityhackathon/"
          text="University hackathon, Planet theme: water conservation, circular reuse, and climate resilience."
        />
        <Source
          title="JPS Public Infobanjir"
          href="https://publicinfobanjir.water.gov.my/laporan-harian/?lang=en"
          text="Malaysian station rainfall and water-level reference. Not integrated as a live data feed."
        />
        <Source
          title="MET Malaysia / data.gov.my"
          href="https://developer.data.gov.my/realtime-api/weather"
          text="Official forecast and weather advisory reference; not the quantitative rainfall input for this model."
        />
      </section>
    </>
  );
}
function Source({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="source-row">
      <a href={href} target="_blank" rel="noreferrer">
        {title}
        <ExternalLink size={13} />
      </a>
      <p>{text}</p>
    </div>
  );
}
