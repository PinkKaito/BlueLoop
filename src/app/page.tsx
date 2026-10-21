'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertTriangle, Check, CheckCircle2, ChevronRight, CloudRain, Database, Download, Droplets, ExternalLink, Gauge, Info, Pause, Play, RotateCcw, ShieldCheck, SkipForward, Square, Waves, Zap } from 'lucide-react';
import { HydraulicPanel } from '@/components/simulation/HydraulicPanel';
import { ForecastPanel } from '@/components/simulation/ForecastPanel';
import { csvCell, parseRainCsv, rainfallTemplate } from '@/lib/datasets';
import { createSession, Session, SPEEDS, STORAGE_KEY, validateSession } from '@/lib/session';
import { HACKATHON_CONTEXT, TOWNSHIP_CONTEXT } from '@/lib/township-context';
import { addEvent, advance, approve, canalHeadroom, Condition, CONDITION_NAMES, Fault, gateInterlock, initialSimulation, percent, project, rainfallAt, ScenarioId, SCENARIOS, simulatedTime, Simulation, SITES, syntheticDataset, TownshipId, upcomingRain, validateDataset, waterBalanceError } from '@/lib/simulation';

const number = (n: number, decimals = 0) => n.toLocaleString('en-MY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const clockTime = (iso: string) => new Date(iso).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const conditions: Condition[] = [1, 2, 3, 4, 5];
type Reading = { timestamp: string; hour: number; pond_m3: number; tank_m3: number; soil_pct: number; rain_mm_h: number; transfer_m3_h: number; canal_m3_h: number; overflow_m3: number };
function reading(s: Session): Reading {
  const m = s.simulation;
  return { timestamp: simulatedTime(s.dataset, m.hour), hour: m.hour, pond_m3: m.pond, tank_m3: m.tank, soil_pct: m.soil,
    rain_mm_h: rainfallAt(s.dataset, m.hour), transfer_m3_h: m.transferFlow, canal_m3_h: m.canalFlow, overflow_m3: m.overflow };
}
function download(name: string, content: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function asCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  return [keys.map(csvCell).join(','), ...rows.map(row => keys.map(key => csvCell(row[key])).join(','))].join('\r\n');
}

export default function BlueLoopDashboard() {
  const [session, setSession] = useState<Session>(() => createSession());
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('Select a condition to jump into the demo, or choose a storm and press Play.');
  const [view, setView] = useState<'operations' | 'telemetry' | 'data'>('operations');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('2021-12-17');
  const [endDate, setEndDate] = useState('2021-12-19');
  const [readings, setReadings] = useState<Reading[]>([]);
  const requestId = useRef(0);
  const loadController = useRef<AbortController | null>(null);
  const previousReading = useRef({ id: '', hour: -1 });
  const lastSaved = useRef(0);
  const { simulation: s, dataset, township, scenario, speed, tariff } = session;
  const site = SITES[township];
  const context = TOWNSHIP_CONTEXT[township];
  const ended = s.hour >= dataset.points.length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const restored: unknown = JSON.parse(saved);
        if (validateSession(restored)) { setSession(restored); setNotice('Previous run restored and paused. Press Play to continue.'); }
        else setNotice('An incompatible saved run was ignored. A fresh demo is ready.');
      }
    } catch { setNotice('Browser storage is unavailable. This demo still works; export your run to keep it.'); }
    setReady(true);
    return () => { loadController.current?.abort(); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (playing && Date.now() - lastSaved.current < 1000) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); lastSaved.current = Date.now(); }
    catch { setNotice('Run could not be saved in this browser. Export it to keep a copy.'); }
  }, [session, ready, playing]);

  useEffect(() => {
    if (!ready) return;
    const previous = previousReading.current;
    const id = `${dataset.id}-${s.initialVolume}`;
    const row = reading(session);
    if (previous.id !== id || s.hour < previous.hour) {
      setReadings([row]); previousReading.current = { id, hour: s.hour };
    } else if (s.hour - previous.hour >= 1 / 6 || s.hour === 0 || ended) {
      setReadings(rows => [...rows.filter(r => r.hour !== row.hour), row].slice(-2000));
      previousReading.current = { id, hour: s.hour };
    }
  }, [session, dataset.id, ended, ready, s.hour, s.initialVolume]);

  useEffect(() => {
    if (!playing || !ready || ended) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const hours = Math.min((now - last) / 1000, 1) * speed / 3600;
      last = now;
      setSession(current => ({ ...current, simulation: advance(current.simulation, SITES[current.township], current.dataset, hours) }));
    }, 250);
    const visibility = () => { if (document.hidden) { setPlaying(false); setNotice('Playback paused while the tab is hidden.'); } };
    document.addEventListener('visibilitychange', visibility);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', visibility); };
  }, [playing, ready, speed, ended]);
  useEffect(() => { if (ended) setPlaying(false); }, [ended]);

  const forecast = useMemo(() => project(s, site, dataset), [s, site, dataset]);
  const unmanagedPeak = Math.max(...forecast.map(p => p.unmanaged));
  const managedPeak = Math.max(...forecast.map(p => p.managed));
  const gateReason = gateInterlock(s, dataset);
  const currentRain = rainfallAt(dataset, s.hour);
  const rainNext = upcomingRain(dataset, s.hour, 6);
  const riskIndex = Math.round(Math.min(100, Math.max(0, (Math.max(percent(s.pond, site.pondCapacity), s.approved ? managedPeak : unmanagedPeak) - 50) * 2)));
  const tone = s.emergencyStop || s.fault !== 'none' || s.overflow > 0 ? 'danger' : s.canalFlow > 0 ? 'warning' : s.condition === 3 || s.condition === 5 ? 'success' : s.condition === 2 ? 'danger' : 'neutral';
  const status = s.emergencyStop ? 'EMERGENCY HOLD' : s.fault === 'sensor-offline' ? 'SENSOR OFFLINE' : s.fault === 'actuator-failure' ? 'ACTUATOR FAULT' : s.fault === 'canal-blocked' ? 'CANAL BLOCKED' : s.overflow > 0 ? 'OVERFLOW RECORDED' : ended ? 'REPLAY COMPLETE' : s.canalFlow > 0 ? 'STAGED CANAL RELEASE' : s.transferFlow > 0 ? 'ACTIVE INTERNAL REUSE' : s.condition === 2 ? 'STORM ADVISORY' : 'SYSTEM NOMINAL';

  const invalidateLoad = useCallback(() => {
    requestId.current += 1; loadController.current?.abort(); setLoading(false);
  }, []);
  function resetRun(nextScenario = scenario, preserveDataset = true) {
    invalidateLoad(); setPlaying(false);
    setSession(current => ({ ...current, scenario: nextScenario,
      dataset: preserveDataset ? current.dataset : syntheticDataset(nextScenario, township),
      simulation: initialSimulation(site, nextScenario) }));
    previousReading.current = { id: '', hour: -1 };
    setNotice('Run reset. Counters, controls, faults, and audit events start fresh.');
  }
  function jumpTo(condition: Condition) {
    invalidateLoad(); setPlaying(false); setView('operations');
    const nextScenario: ScenarioId = condition === 1 ? 'normal' : condition === 4 ? 'saturated' : 'heavy';
    const rain = syntheticDataset(nextScenario, township);
    let sim = initialSimulation(site, nextScenario);
    if (condition >= 3) sim = approve(sim);
    if (condition === 4 || condition === 5) sim = { ...sim, canalEnabled: true };
    if (condition === 3) sim = advance(sim, site, rain, 1);
    if (condition === 4) sim = advance(sim, site, rain, 0.5);
    if (condition === 5) sim = advance(sim, site, rain, rain.points.length);
    sim = addEvent(sim, `Demo jump loaded: ${CONDITION_NAMES[condition]}. Results computed from the scenario start.`);
    setSession(current => ({ ...current, scenario: nextScenario, dataset: rain, simulation: sim }));
    previousReading.current = { id: '', hour: -1 };
    setNotice(`Loaded ${CONDITION_NAMES[condition]}. This starts a fresh scenario; press Play to continue.`);
  }
  function command(update: (state: Simulation) => Simulation) {
    setSession(current => ({ ...current, simulation: update(current.simulation) }));
  }
  function toggleGate() {
    if (!s.canalEnabled && gateReason) { setNotice(`Canal release blocked: ${gateReason}.`); return; }
    command(current => addEvent({ ...current, canalEnabled: !current.canalEnabled, canalFlow: 0 }, current.canalEnabled ? 'Operator disabled canal release.' : 'Operator enabled staged canal release; interlocks remain enforced.', 'warning'));
  }
  function stop() {
    command(current => addEvent({ ...current, emergencyStop: !current.emergencyStop, approved: false, canalEnabled: false, automatic: false,
      transferFlow: 0, canalFlow: 0, irrigationFlow: 0 }, current.emergencyStop ? 'Emergency hold cleared. A new drawdown approval is required.' : 'Emergency stop: all commanded flows stopped; rainfall and passive drainage continue.', 'critical'));
    setNotice(s.emergencyStop ? 'Emergency hold cleared. Approve drawdown again before water can be routed.' : 'Emergency hold engaged. The weather simulation continues.');
  }
  function fault(value: Fault) {
    command(current => addEvent({ ...current, fault: value, transferFlow: 0, canalFlow: 0, irrigationFlow: 0 }, value === 'none' ? 'Fault cleared; telemetry and actuator checks restored.' : `Demo fault injected: ${value}. Safety interlocks applied.`, value === 'none' ? 'info' : 'critical'));
  }
  function guidedDemo() {
    invalidateLoad();
    const rain = syntheticDataset('heavy', township);
    const sim = addEvent({ ...initialSimulation(site, 'heavy'), automatic: true, canalEnabled: true }, 'Guided demo: automatic approval and staged canal release enabled.');
    setSession(current => ({ ...current, scenario: 'heavy', dataset: rain, simulation: sim, speed: 1800 }));
    previousReading.current = { id: '', hour: -1 }; setPlaying(true); setView('operations');
    setNotice('Guided demo running at 1,800×: 30 simulated minutes per second. Pause at any point to explain a decision.');
  }
  async function loadWeather(mode: 'offline' | 'historical' | 'forecast') {
    invalidateLoad();
    const id = requestId.current;
    const controller = new AbortController(); loadController.current = controller;
    setLoading(true);
    try {
      const url = mode === 'offline' ? `/data/${township}-dec2021.json` : `/api/weather?${new URLSearchParams({ township, mode, start: startDate, end: endDate })}`;
      const response = await fetch(url, { signal: controller.signal });
      const body: unknown = await response.json();
      if (!response.ok) throw new Error((body as { error?: string }).error ?? 'Dataset could not be loaded.');
      if (!validateDataset(body) || body.township !== township) throw new Error('Dataset validation failed. Your current run is unchanged.');
      if (requestId.current !== id) return;
      const sim = addEvent(initialSimulation(site, 'heavy'), `Loaded ${body.source}: ${body.points.length} hourly rainfall records.`);
      setPlaying(false); setSession(current => ({ ...current, scenario: 'heavy', dataset: body, simulation: sim }));
      previousReading.current = { id: '', hour: -1 };
      setNotice(`${body.points.length} hours loaded. Rainfall is ${mode === 'forecast' ? 'forecast model output' : 'historical reanalysis'}; hydraulic telemetry remains simulated. Press Play to replay.`);
    } catch (error) {
      if (!controller.signal.aborted && requestId.current === id) setNotice(error instanceof Error ? error.message : 'Could not load dataset.');
    } finally { if (requestId.current === id) setLoading(false); }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    invalidateLoad(); const id = requestId.current;
    try {
      if (file.size > 250000) throw new Error('File too large. Use a rainfall CSV under 250 KB.');
      const imported = parseRainCsv(await file.text(), township);
      if (id !== requestId.current) return;
      setPlaying(false); setSession(current => ({ ...current, dataset: imported, scenario: 'heavy', simulation: initialSimulation(site, 'heavy') }));
      previousReading.current = { id: '', hour: -1 };
      setNotice(`Imported ${imported.points.length} hourly rainfall records. Press Play to replay.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Import failed.'); }
  }
  function exportRun() {
    download(`blueloop-${township}-run.json`, JSON.stringify({ ...session, exportedAt: new Date().toISOString(), assumptions: site,
      context: { ...context, hackathon: HACKATHON_CONTEXT, assetBasis: 'Public township reference; all pond, tank, valve and capacity values are mock.' },
      monetaryBasis: 'Irrigated water volume × configurable illustrative tariff; canal release earns no savings.',
      readings, waterBalanceErrorM3: waterBalanceError(s) }, null, 2), 'application/json');
    setNotice('Run exported with assumptions, rainfall provenance, readings, and audit events.');
  }

  let alertTitle = 'System Nominal · Clear Weather';
  let alertText = 'Steady retention across the township catchment. Choose a storm to explore proactive water reuse.';
  if (s.condition === 2) { alertTitle = currentRain > 0 ? 'Storm in Progress · Monitor Storage' : 'Pre-Storm Advisory · Create Headroom'; alertText = `${number(rainNext, 1)} mm forecast in the next 6h. Unmanaged storage demand peaks at ${number(unmanagedPeak, 1)}%. Internal reuse requires approval.`; }
  if (s.condition === 3) { alertTitle = 'Active Transfer · Pond to Irrigation Tank'; alertText = `${number(s.transferred)} m³ transferred; ${number(s.irrigated)} m³ used for irrigation. Tank capacity and soil saturation constrain reuse.`; }
  if (s.condition === 4) { alertTitle = 'Staged Canal Release · Interlocks Active'; alertText = `Releasing ${number(s.canalFlow)} m³/h with ${number(canalHeadroom(s, dataset))}% downstream headroom. The gate closes during heavy rainfall.`; }
  if (s.condition === 5) { alertTitle = s.overflow > 0 ? 'Replay Complete · Overflow Recorded' : 'Storm Replay Complete · No Overflow Recorded'; alertText = `${number(s.rainInflow)} m³ modeled runoff received. Pond peak ${number(percent(s.peakPond, site.pondCapacity), 1)}%; ${number(s.overflow)} m³ overflow. Review the event ledger below.`; }
  if (s.emergencyStop || s.fault !== 'none') { alertTitle = s.emergencyStop ? 'Emergency Hold · Controlled Flows Stopped' : 'Injected Fault · Safety Constraints Applied'; alertText = s.emergencyStop ? 'All commanded transfers are stopped. Rainfall and passive drainage continue; release the hold and reapprove to resume.' : `${s.fault.replaceAll('-', ' ')}. ${gateReason ?? 'Inspect the actuator and sensor state before continuing.'} Model levels remain visible for the demonstration.`; }

  return <main className="dashboard">
    <header className="panel app-header">
      <div className="header-main"><div className="brand"><span className="brand-mark"><Droplets size={25} /></span><div><div className="brand-title"><h1>BlueLoop</h1><span className="brand-partner">SIME DARBY PROPERTY</span></div><p>Township Water Intelligence <span className="header-separator">/</span> Hydrological Operations Command</p></div></div>
        <div className="header-right"><span className="site-label" aria-label="Township: City of Elmina">City of Elmina</span><span className={`status-chip ${tone}`}><span />{status}</span></div></div>
      <div className="challenge-context"><span>HACKATHON CONCEPT · SELANGOR, MALAYSIA</span><a href={HACKATHON_CONTEXT.sourceUrl} target="_blank" rel="noreferrer">{HACKATHON_CONTEXT.theme}<ExternalLink size={11} /></a></div>
      <div className="condition-label">JUMP TO DEMO CONDITION <span>Each selection starts a fresh scenario</span></div>
      <nav className="condition-nav" aria-label="Demo condition shortcuts">{conditions.map(condition => <button key={condition} onClick={() => jumpTo(condition)} className={s.condition === condition ? 'active' : ''} aria-current={s.condition === condition ? 'step' : undefined}><span className="condition-number">{condition}</span>{CONDITION_NAMES[condition]}</button>)}</nav>
    </header>

    <section className="panel playback" aria-label="Demo playback controls">
      <div className="playback-top"><div className="playback-identity"><span className={`feed-indicator ${playing ? 'running' : ''}`} /><div><strong>{dataset.kind === 'synthetic' ? 'SCRIPTED DEMO' : dataset.kind === 'forecast' ? 'FORECAST REPLAY' : dataset.kind === 'imported' ? 'CSV REPLAY' : 'HISTORICAL REPLAY'}</strong><span>{dataset.name}</span></div></div>
        <div className="playback-actions"><button className="button primary compact" onClick={() => { if (!ended) setPlaying(!playing); }} disabled={!ready || ended} aria-label={playing ? 'Pause playback' : 'Play playback'}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pause' : ended ? 'Complete' : 'Play'}</button><button className="icon-button" title="Advance 15 simulated minutes" aria-label="Advance 15 minutes" disabled={ended} onClick={() => { setPlaying(false); command(current => advance(current, site, dataset, 0.25)); }}><SkipForward size={17} /></button><button className="icon-button" title="Reset this run" aria-label="Reset run" onClick={() => resetRun()}><RotateCcw size={16} /></button><label className="speed-label">Speed<select aria-label="Playback speed" value={speed} onChange={e => setSession(current => ({ ...current, speed: Number(e.target.value) }))}>{SPEEDS.map(value => <option key={value} value={value}>{number(value)}×{value === 1 ? ' real time' : ''}</option>)}</select></label><button className="button compact guided" onClick={guidedDemo}><Zap size={14} />Guided demo</button></div></div>
      <div className="timeline-row"><span className="sim-clock">{clockTime(simulatedTime(dataset, s.hour))} <small>MYT</small></span><progress aria-label="Replay progress" max={dataset.points.length} value={s.hour} /><span className="timeline-value">{number(s.hour, 1)} / {dataset.points.length} h</span></div>
      <div className="playback-meta"><span><Activity size={12} />{playing ? 'Running' : 'Paused'} · {speed === 1 ? '1 simulated second / second' : `${number(speed / 60)} simulated min / second`}</span><span>Weather-driven simulation · no connected field devices</span></div>
    </section>

    <div className="notice" role="status"><Info size={15} /><span>{notice}</span></div>
    <div className="workspace-tabs" role="group" aria-label="Dashboard views"><button className={view === 'operations' ? 'selected' : ''} onClick={() => setView('operations')}><Gauge size={15} />Operations</button><button className={view === 'telemetry' ? 'selected' : ''} onClick={() => setView('telemetry')}><Activity size={15} />Telemetry & events</button><button className={view === 'data' ? 'selected' : ''} onClick={() => setView('data')}><Database size={15} />Data sources</button><span className="source-hint">{dataset.source}</span></div>

    {view === 'operations' && <>
      <section className="township-context" aria-label="Township asset context"><div><h2>{context.referenceAsset}</h2><p>{context.location} · Reference setting</p></div><p><strong>Demo use case</strong>{context.proposedUse} <span>All hydraulic assets are mock.</span></p></section>
      <div className="operations-grid"><HydraulicPanel state={s} site={site} dataset={dataset} playing={playing} />
        <div className="forecast-column"><section className={`alert-panel ${tone}`} aria-label="Operating advisory"><span className="alert-icon">{tone === 'success' ? <ShieldCheck size={21} /> : tone === 'neutral' ? <Waves size={21} /> : <AlertTriangle size={21} />}</span><div><h2>{alertTitle}</h2><p>{alertText}</p></div></section>
          <ForecastPanel points={forecast} approved={s.approved} />
          <section className="panel dispatch" aria-labelledby="dispatch-heading"><div className="dispatch-title"><span className="dispatch-icon"><Droplets size={19} /></span><div><h2 id="dispatch-heading">Hydrological Dispatch Operations</h2><p>{s.approved ? 'Drawdown authorized' : 'Operator approval required'} · {s.automatic ? 'Automatic supervision' : 'Supervised mode'}</p></div></div><button className={`button ${s.approved ? 'approved' : 'primary'}`} disabled={s.approved || s.emergencyStop || s.fault === 'sensor-offline' || s.fault === 'actuator-failure' || ended || scenario === 'normal'} onClick={() => { command(approve); setNotice('Drawdown approved. Press Play to advance time and observe water transfer.'); }}>{s.approved ? <Check size={16} /> : <ChevronRight size={16} />}{s.approved ? 'Drawdown approved' : 'Approve drawdown'}</button></section>
        </div>
      </div>
      <section className="metrics-strip" aria-label="Computed run outcomes"><Metric icon={<Droplets size={17} />} label="Water reused" value={`${number(s.irrigated)} m³`} detail={`${number(s.transferred)} m³ transferred into storage`} /><Metric icon={<CheckCircle2 size={17} />} label="Water bill avoided" value={`RM ${number(s.irrigated * tariff, 2)}`} detail={`Irrigated volume × RM ${number(tariff, 2)}/m³ demo tariff`} /><Metric icon={<ShieldCheck size={17} />} label="Storage risk index" value={`${riskIndex} / 100`} detail={`${number(s.overflow)} m³ overflow · index, not flood probability`} /><Metric icon={<Waves size={17} />} label="Drawdown volume" value={`${number(s.transferred + s.canalReleased)} m³`} detail={`${number(s.canalReleased)} m³ safely routed to canal`} /></section>
      <section className="panel controls-panel" aria-labelledby="controls-heading"><div className="panel-heading"><div><h2 id="controls-heading">Scenario & Operator Controls</h2><p>Changes apply to the current run; choosing a weather scenario starts a new one.</p></div><button className={`button compact ${s.emergencyStop ? 'primary' : 'stop'}`} onClick={stop}><Square size={13} />{s.emergencyStop ? 'Release emergency hold' : 'Emergency stop'}</button></div>
        <div className="controls-grid"><label>Weather scenario<select value={dataset.kind === 'synthetic' ? scenario : 'dataset'} onChange={e => resetRun(e.target.value as ScenarioId, false)}>{dataset.kind !== 'synthetic' && <option value="dataset">Loaded rainfall dataset</option>}{Object.entries(SCENARIOS).map(([id, preset]) => <option key={id} value={id}>{preset.name}</option>)}</select></label><label>Fault injection<select value={s.fault} onChange={e => fault(e.target.value as Fault)}><option value="none">No injected fault</option><option value="sensor-offline">Sensor offline</option><option value="actuator-failure">Valve actuator failure</option><option value="canal-blocked">Downstream canal blocked</option></select></label><label>Illustrative tariff (RM/m³)<input type="number" min="0" max="100" step="0.1" value={tariff} onChange={e => { if (e.target.value !== '' && Number.isFinite(e.target.valueAsNumber)) setSession(current => ({ ...current, tariff: Math.min(100, Math.max(0, e.target.valueAsNumber)) })); }} /></label></div>
        <div className="control-switches"><label className="checkbox-label"><input type="checkbox" checked={s.automatic} onChange={e => { const enabled = e.target.checked; command(current => addEvent({ ...current, automatic: enabled }, `Operator ${enabled ? 'enabled' : 'disabled'} automatic supervision.`)); }} />Automatic approval <span>Triggers above 85% projected storage</span></label><label className="checkbox-label"><input type="checkbox" checked={s.canalEnabled} disabled={!s.canalEnabled && !!gateReason} onChange={toggleGate} />Allow staged canal release</label></div><div className={`interlock ${gateReason ? 'warning' : ''}`}><ShieldCheck size={14} /><span>{gateReason ? `Canal interlock: ${gateReason}.` : 'Canal release permitted before heavy rain, with ≥30% downstream headroom and drawdown approval.'}</span></div>
      </section>
    </>}

    {view === 'telemetry' && <div className="telemetry-view"><section className="panel"><div className="panel-heading"><div><h2>Simulated Telemetry Stream</h2><p>{readings.length} samples this visit · sampled about every 10 simulated minutes (30 at maximum speed)</p></div><button className="button compact" disabled={!readings.length} onClick={() => download(`blueloop-${township}-telemetry.csv`, asCsv(readings))}><Download size={14} />Export CSV</button></div><div className="table-scroll"><table><thead><tr><th>Simulation time (MYT)</th><th>Pond m³</th><th>Tank m³</th><th>Rain mm/h</th><th>Transfer m³/h</th><th>Canal m³/h</th></tr></thead><tbody>{readings.slice(-60).reverse().map((r, i) => <tr key={`${r.hour}-${i}`}><td>{clockTime(r.timestamp)}</td><td>{number(r.pond_m3)}</td><td>{number(r.tank_m3)}</td><td>{number(r.rain_mm_h, 1)}</td><td>{number(r.transfer_m3_h)}</td><td>{number(r.canal_m3_h)}</td></tr>)}</tbody></table></div><p className="table-footer">Latest 60 shown. Export includes up to 2,000 samples collected in this visit.</p></section>
      <section className="panel"><div className="panel-heading"><div><h2>Water Balance & Run Export</h2><p>Every cubic metre has a source and destination.</p></div><button className="button compact" onClick={exportRun}><Download size={14} />Export run JSON</button></div><dl className="balance-grid"><div><dt>Rainfall inflow</dt><dd>{number(s.rainInflow, 1)} m³</dd></div><div><dt>Irrigation delivered</dt><dd>{number(s.irrigated, 1)} m³</dd></div><div><dt>Passive drainage</dt><dd>{number(s.passiveReleased, 1)} m³</dd></div><div><dt>Controlled canal release</dt><dd>{number(s.canalReleased, 1)} m³</dd></div><div><dt>Overflow recorded</dt><dd className={s.overflow > 0 ? 'red' : ''}>{number(s.overflow, 1)} m³</dd></div><div><dt>Conservation residual</dt><dd>{Math.abs(waterBalanceError(s)).toFixed(6)} m³</dd></div></dl><p className="table-footer">Initial pond + tank + runoff = current pond + tank + irrigation + passive drainage + canal release + overflow. Internal transfer is counted once.</p></section>
      <EventLedger state={s} session={session} onExport={() => download(`blueloop-${township}-events.csv`, asCsv(s.events.map(e => ({ timestamp: simulatedTime(dataset, e.hour), severity: e.level, event: e.message }))))} />
    </div>}

    {view === 'data' && <div className="data-view"><TownshipReferences township={township} /><section className="panel data-intro"><div className="panel-heading"><div><h2>Weather Data & Replay</h2><p>Use real hourly rainfall to drive the same hydraulic model.</p></div><Database size={20} className="blue" /></div><div className="data-current"><span className="eyebrow">CURRENT INPUT</span><h3>{dataset.name}</h3><p>{dataset.attribution}</p><div className="dataset-facts"><span>{dataset.points.length} hourly records</span><span>{number(dataset.points.reduce((total, p) => total + p.rainMm, 0), 1)} mm total rain</span><span>{clockTime(dataset.points[0].time)} to {clockTime(simulatedTime(dataset, dataset.points.length))} MYT</span></div><p className="muted">{dataset.source} · {dataset.license}{dataset.kind !== 'synthetic' && ` · fetched ${new Date(dataset.fetchedAt).toLocaleDateString('en-MY')}`}</p>{dataset.sourceUrl.startsWith('https://') && <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">View source request <ExternalLink size={12} /></a>}</div>
        <div className="data-actions"><button className="button primary" disabled={loading} onClick={() => loadWeather('offline')}><Database size={15} />Load offline Dec 2021 replay</button><button className="button" disabled={loading} onClick={() => loadWeather('forecast')}><CloudRain size={15} />Fetch latest forecast</button><button className="button" onClick={() => download(`blueloop-${township}-rainfall.csv`, asCsv(dataset.points.map(p => ({ timestamp: p.time, rain_mm: p.rainMm }))))}><Download size={15} />Export rainfall</button></div><p className="data-caption">{loading ? 'Loading and validating hourly data…' : 'Offline replay is bundled locally. Latest forecast is fetched on demand; it is not a live rain gauge.'}</p>
        <div className="historical-form"><label>Start date<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label><label>End date<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label><button className="button" disabled={loading || !startDate || !endDate} onClick={() => loadWeather('historical')}>Fetch historical rainfall</button></div><p className="data-caption">Up to 7 days per request. Historical dates must be at least 5 days old.</p>
      </section>
      <section className="panel import-panel"><div className="panel-heading"><div><h2>Bring Your Own Rainfall</h2><p>Import a CSV from a gauge or another public dataset.</p></div></div><p>Use <code>timestamp,rain_mm</code> with consecutive hourly interval-start timestamps, an explicit timezone, and 2–168 records. Rainfall must be 0–500 mm per hour. Missing values are rejected.</p><div className="data-actions"><label className="button file-button">Import rainfall CSV<input type="file" aria-label="Import rainfall CSV" accept=".csv,text/csv" onChange={e => { void importFile(e.target.files?.[0]); e.target.value = ''; }} /></label><button className="button" onClick={() => download('blueloop-rainfall-template.csv', rainfallTemplate)}><Download size={14} />Download template</button></div></section>
      <section className="panel source-panel"><div className="panel-heading"><div><h2>Public Sources for Demonstrations</h2><p>Verified sources, with their practical limits.</p></div></div><Source title="Open-Meteo · integrated" href="https://open-meteo.com/en/docs/historical-weather-api" text="Hourly historical reanalysis and forecast precipitation for Malaysian coordinates. Bundled ERA5 rainfall is unscaled; grid cells are regional, not township rain gauges. CC BY 4.0 attribution applies; the free API is for non-commercial use." /><Source title="JPS Public Infobanjir" href="https://publicinfobanjir.water.gov.my/laporan-harian/?lang=en" text="Official Malaysian rainfall and water-level time-series reports with CSV export. Useful for local station validation. No stable public API or redistribution licence was verified; this app does not scrape it." /><Source title="MET Malaysia via data.gov.my" href="https://developer.data.gov.my/realtime-api/weather" text="Official general forecasts and weather warnings. Suitable for advisory context; the general forecast updates daily and does not provide hourly rainfall depths for the water-balance model." /></section>
      <section className="panel assumptions"><div className="panel-heading"><div><h2>Model Assumptions</h2><p>Illustrative infrastructure values, editable in the code. Calibration requires surveyed site and device data.</p></div></div><dl className="balance-grid"><div><dt>Pond capacity</dt><dd>{number(site.pondCapacity)} m³</dd></div><div><dt>Tank capacity</dt><dd>{number(site.tankCapacity)} m³</dd></div><div><dt>Catchment area</dt><dd>{number(site.catchmentArea)} m²</dd></div><div><dt>Runoff coefficient</dt><dd>{site.runoffCoefficient}</dd></div><div><dt>Transfer / canal maximum</dt><dd>{number(site.transferRate)} / {number(site.canalRate)} m³/h</dd></div><div><dt>Passive discharge</dt><dd>{number(site.passiveRate)} m³/h above 50%</dd></div></dl><p className="table-footer">Runoff = rain depth × catchment area × coefficient. Soil moisture is an illustrative index. Risk index = 2 × (peak storage demand − 50), bounded to 0–100; it is not a calibrated flood probability. Savings count irrigation only, using an illustrative configurable tariff. Forecast lines assume approval now; downstream safety gates still apply.</p></section>
    </div>}

    {view === 'operations' && <EventLedger state={s} session={session} onExport={() => download(`blueloop-${township}-events.csv`, asCsv(s.events.map(e => ({ timestamp: simulatedTime(dataset, e.hour), severity: e.level, event: e.message }))))} compact />}
    <footer className="app-footer"><span><strong>BlueLoop</strong> · Township Water Intelligence</span><span>Demonstration model · {dataset.kind === 'synthetic' ? 'synthetic rainfall' : dataset.kind === 'imported' ? 'CSV rainfall' : <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">weather data by Open-Meteo · CC BY 4.0</a>}</span><button onClick={exportRun}><Download size={12} />Export run</button></footer>
  </main>;
}

function TownshipReferences({ township }: { township: TownshipId }) {
  const context = TOWNSHIP_CONTEXT[township];
  return <section className="panel source-panel"><div className="panel-heading"><div><h2>Malaysian Township & Challenge References</h2><p>Public asset context for a fully mock hackathon demonstration.</p></div></div>
    <Source title={context.referenceAsset} href={context.sourceUrl} text={context.referenceSummary} />
    <Source title="Sime Darby Property hackathon" href={HACKATHON_CONTEXT.sourceUrl} text="The Planet theme includes water conservation, circular economy and climate resilience. BlueLoop demonstrates these through stormwater reuse and simulated storage management." />
    <p className="table-footer">City of Elmina and Elmina Central Park are real references. The DEMO-01 pond, reuse tank, valves, capacities and operating rules are invented for this prototype. The December 2021 replay uses regional rainfall for Elmina coordinates in Selangor, rather than measurements from the park.</p>
  </section>;
}
function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <section className="metric"><div className="metric-label">{label}{icon}</div><strong>{value}</strong><p>{detail}</p></section>;
}
function Source({ title, href, text }: { title: string; href: string; text: string }) {
  return <div className="source-row"><a href={href} target="_blank" rel="noreferrer">{title}<ExternalLink size={13} /></a><p>{text}</p></div>;
}
function EventLedger({ state, session, onExport, compact = false }: { state: Simulation; session: Session; onExport: () => void; compact?: boolean }) {
  const events = state.events.slice(compact ? -5 : -100).reverse();
  return <section className="panel event-ledger"><div className="panel-heading"><div><h2>Operations Event Ledger</h2><p>{state.events.length} events · operator commands, safety holds, and condition changes</p></div><button className="button compact" onClick={onExport}><Download size={14} />Export events</button></div><ol>{events.map(event => <li key={event.id}><time>{clockTime(simulatedTime(session.dataset, event.hour))}</time><span className={`event-level ${event.level}`}>{event.level}</span><span>{event.message}</span></li>)}</ol></section>;
}
