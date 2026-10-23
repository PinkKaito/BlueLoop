'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { csvCell, parseRainCsv, rainfallTemplate } from '@/lib/datasets';
import {
  createSession,
  Session,
  SPEEDS,
  STORAGE_KEY,
  validateSession,
} from '@/lib/session';
import { HACKATHON_CONTEXT, TOWNSHIP_CONTEXT } from '@/lib/township-context';
import {
  addEvent,
  advance,
  approve,
  canalHeadroom,
  Condition,
  CONDITION_NAMES,
  Fault,
  gateInterlock,
  initialSimulation,
  percent,
  project,
  rainfallAt,
  ScenarioId,
  SCENARIOS,
  simulatedTime,
  Simulation,
  SITES,
  syntheticDataset,
  TownshipId,
  upcomingRain,
  validateDataset,
  waterBalanceError,
} from '@/lib/simulation';

export const uiCopy = (text: string) =>
  text.replaceAll(String.fromCharCode(183), ',').replace(/\s+,/g, ',');
export const number = (n: number, decimals = 0) =>
  n.toLocaleString('en-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
export const clockTime = (iso: string) =>
  new Date(iso).toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
export type Reading = {
  timestamp: string;
  hour: number;
  pond_m3: number;
  tank_m3: number;
  soil_pct: number;
  rain_mm_h: number;
  transfer_m3_h: number;
  canal_m3_h: number;
  overflow_m3: number;
};
function reading(s: Session): Reading {
  const m = s.simulation;
  return {
    timestamp: simulatedTime(s.dataset, m.hour),
    hour: m.hour,
    pond_m3: m.pond,
    tank_m3: m.tank,
    soil_pct: m.soil,
    rain_mm_h: rainfallAt(s.dataset, m.hour),
    transfer_m3_h: m.transferFlow,
    canal_m3_h: m.canalFlow,
    overflow_m3: m.overflow,
  };
}
export function download(
  name: string,
  content: string,
  type = 'text/csv;charset=utf-8'
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function asCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  return [
    keys.map(csvCell).join(','),
    ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(',')),
  ].join('\r\n');
}

function useSessionState() {
  const [session, setSession] = useState<Session>(() => createSession());
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('Elmina reference model ready.');
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
        if (validateSession(restored)) {
          setSession(restored);
          setNotice(
            'Previous run restored and paused. Press Play to continue.'
          );
        } else
          setNotice(
            'An incompatible saved run was ignored. A fresh demo is ready.'
          );
      }
    } catch {
      setNotice(
        'Browser storage is unavailable. This demo still works; export your run to keep it.'
      );
    }
    setReady(true);
    return () => {
      loadController.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (playing && Date.now() - lastSaved.current < 1000) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      lastSaved.current = Date.now();
    } catch {
      setNotice(
        'Run could not be saved in this browser. Export it to keep a copy.'
      );
    }
  }, [session, ready, playing]);

  useEffect(() => {
    if (!ready) return;
    const previous = previousReading.current;
    const id = `${dataset.id}-${s.initialVolume}`;
    const row = reading(session);
    if (previous.id !== id || s.hour < previous.hour) {
      setReadings([row]);
      previousReading.current = { id, hour: s.hour };
    } else if (s.hour - previous.hour >= 1 / 6 || s.hour === 0 || ended) {
      setReadings((rows) =>
        [...rows.filter((r) => r.hour !== row.hour), row].slice(-2000)
      );
      previousReading.current = { id, hour: s.hour };
    }
  }, [session, dataset.id, ended, ready, s.hour, s.initialVolume]);

  useEffect(() => {
    if (!playing || !ready || ended) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const hours = (Math.min((now - last) / 1000, 1) * speed) / 3600;
      last = now;
      setSession((current) => ({
        ...current,
        simulation: advance(
          current.simulation,
          SITES[current.township],
          current.dataset,
          hours
        ),
      }));
    }, 250);
    const visibility = () => {
      if (document.hidden) {
        setPlaying(false);
        setNotice('Playback paused while the tab is hidden.');
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [playing, ready, speed, ended]);
  useEffect(() => {
    if (ended) setPlaying(false);
  }, [ended]);

  const forecast = useMemo(() => project(s, site, dataset), [s, site, dataset]);
  const unmanagedPeak = Math.max(...forecast.map((p) => p.unmanaged));
  const managedPeak = Math.max(...forecast.map((p) => p.managed));
  const gateReason = gateInterlock(s, dataset);
  const currentRain = rainfallAt(dataset, s.hour);
  const rainNext = upcomingRain(dataset, s.hour, 6);
  const riskIndex = Math.round(
    Math.min(
      100,
      Math.max(
        0,
        (Math.max(
          percent(s.pond, site.pondCapacity),
          s.approved ? managedPeak : unmanagedPeak
        ) -
          50) *
          2
      )
    )
  );
  const tone =
    s.emergencyStop || s.fault !== 'none' || s.overflow > 0
      ? 'danger'
      : s.canalFlow > 0
        ? 'warning'
        : s.condition === 3 || s.condition === 5
          ? 'success'
          : s.condition === 2
            ? 'danger'
            : 'neutral';
  const status = s.emergencyStop
    ? 'EMERGENCY HOLD'
    : s.fault === 'sensor-offline'
      ? 'SENSOR OFFLINE'
      : s.fault === 'actuator-failure'
        ? 'ACTUATOR FAULT'
        : s.fault === 'canal-blocked'
          ? 'CANAL BLOCKED'
          : s.overflow > 0
            ? 'OVERFLOW RECORDED'
            : ended
              ? 'REPLAY COMPLETE'
              : s.canalFlow > 0
                ? 'STAGED CANAL RELEASE'
                : s.transferFlow > 0
                  ? 'ACTIVE INTERNAL REUSE'
                  : s.condition === 2
                    ? 'STORM ADVISORY'
                    : 'SYSTEM NOMINAL';

  const invalidateLoad = useCallback(() => {
    requestId.current += 1;
    loadController.current?.abort();
    setLoading(false);
  }, []);
  function resetRun(nextScenario = scenario, preserveDataset = true) {
    invalidateLoad();
    setPlaying(false);
    setSession((current) => ({
      ...current,
      scenario: nextScenario,
      dataset: preserveDataset
        ? current.dataset
        : syntheticDataset(nextScenario, township),
      simulation: initialSimulation(site, nextScenario),
    }));
    previousReading.current = { id: '', hour: -1 };
    setNotice(
      'Run reset. Counters, controls, faults, and audit events start fresh.'
    );
  }
  function jumpTo(condition: Condition) {
    invalidateLoad();
    setPlaying(false);
    const nextScenario: ScenarioId =
      condition === 1 ? 'normal' : condition === 4 ? 'saturated' : 'heavy';
    const rain = syntheticDataset(nextScenario, township);
    let sim = initialSimulation(site, nextScenario);
    if (condition >= 3) sim = approve(sim);
    if (condition === 4 || condition === 5)
      sim = { ...sim, canalEnabled: true };
    if (condition === 3) sim = advance(sim, site, rain, 1);
    if (condition === 4) sim = advance(sim, site, rain, 0.5);
    if (condition === 5) sim = advance(sim, site, rain, rain.points.length);
    sim = addEvent(
      sim,
      `Demo jump loaded: ${CONDITION_NAMES[condition]}. Results computed from the scenario start.`
    );
    setSession((current) => ({
      ...current,
      scenario: nextScenario,
      dataset: rain,
      simulation: sim,
    }));
    previousReading.current = { id: '', hour: -1 };
    setNotice(
      `Loaded ${CONDITION_NAMES[condition]}. This starts a fresh scenario; press Play to continue.`
    );
  }
  function command(update: (state: Simulation) => Simulation) {
    setSession((current) => ({
      ...current,
      simulation: update(current.simulation),
    }));
  }
  function toggleGate() {
    if (!s.canalEnabled && gateReason) {
      setNotice(`Canal release blocked: ${gateReason}.`);
      return;
    }
    command((current) =>
      addEvent(
        { ...current, canalEnabled: !current.canalEnabled, canalFlow: 0 },
        current.canalEnabled
          ? 'Operator disabled canal release.'
          : 'Operator enabled staged canal release; interlocks remain enforced.',
        'warning'
      )
    );
  }
  function stop() {
    command((current) =>
      addEvent(
        {
          ...current,
          emergencyStop: !current.emergencyStop,
          approved: false,
          canalEnabled: false,
          automatic: false,
          transferFlow: 0,
          canalFlow: 0,
          irrigationFlow: 0,
        },
        current.emergencyStop
          ? 'Emergency hold cleared. A new drawdown approval is required.'
          : 'Emergency stop: all commanded flows stopped; rainfall and passive drainage continue.',
        'critical'
      )
    );
    setNotice(
      s.emergencyStop
        ? 'Emergency hold cleared. Approve drawdown again before water can be routed.'
        : 'Emergency hold engaged. The weather simulation continues.'
    );
  }
  function fault(value: Fault) {
    command((current) =>
      addEvent(
        {
          ...current,
          fault: value,
          transferFlow: 0,
          canalFlow: 0,
          irrigationFlow: 0,
        },
        value === 'none'
          ? 'Fault cleared; telemetry and actuator checks restored.'
          : `Demo fault injected: ${value}. Safety interlocks applied.`,
        value === 'none' ? 'info' : 'critical'
      )
    );
  }
  function guidedDemo() {
    invalidateLoad();
    const rain = syntheticDataset('heavy', township);
    const sim = addEvent(
      {
        ...initialSimulation(site, 'heavy'),
        automatic: true,
        canalEnabled: true,
      },
      'Guided demo: automatic approval and staged canal release enabled.'
    );
    setSession((current) => ({
      ...current,
      scenario: 'heavy',
      dataset: rain,
      simulation: sim,
      speed: 1800,
    }));
    previousReading.current = { id: '', hour: -1 };
    setPlaying(true);
    setNotice(
      'Guided demo running at 1,800×: 30 simulated minutes per second. Pause at any point to explain a decision.'
    );
  }
  async function loadWeather(mode: 'offline' | 'historical' | 'forecast') {
    invalidateLoad();
    const id = requestId.current;
    const controller = new AbortController();
    loadController.current = controller;
    setLoading(true);
    try {
      const url =
        mode === 'offline'
          ? `/data/${township}-dec2021.json`
          : `/api/weather?${new URLSearchParams({ township, mode, start: startDate, end: endDate })}`;
      const response = await fetch(url, { signal: controller.signal });
      const body: unknown = await response.json();
      if (!response.ok)
        throw new Error(
          (body as { error?: string }).error ?? 'Dataset could not be loaded.'
        );
      if (!validateDataset(body) || body.township !== township)
        throw new Error(
          'Dataset validation failed. Your current run is unchanged.'
        );
      if (requestId.current !== id) return;
      const sim = addEvent(
        initialSimulation(site, 'heavy'),
        `Loaded ${body.source}: ${body.points.length} hourly rainfall records.`
      );
      setPlaying(false);
      setSession((current) => ({
        ...current,
        scenario: 'heavy',
        dataset: body,
        simulation: sim,
      }));
      previousReading.current = { id: '', hour: -1 };
      setNotice(
        `${body.points.length} hours loaded. Rainfall is ${mode === 'forecast' ? 'forecast model output' : 'historical reanalysis'}; hydraulic telemetry remains simulated. Press Play to replay.`
      );
    } catch (error) {
      if (!controller.signal.aborted && requestId.current === id)
        setNotice(
          error instanceof Error ? error.message : 'Could not load dataset.'
        );
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    invalidateLoad();
    const id = requestId.current;
    try {
      if (file.size > 250000)
        throw new Error('File too large. Use a rainfall CSV under 250 KB.');
      const imported = parseRainCsv(await file.text(), township);
      if (id !== requestId.current) return;
      setPlaying(false);
      setSession((current) => ({
        ...current,
        dataset: imported,
        scenario: 'heavy',
        simulation: initialSimulation(site, 'heavy'),
      }));
      previousReading.current = { id: '', hour: -1 };
      setNotice(
        `Imported ${imported.points.length} hourly rainfall records. Press Play to replay.`
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Import failed.');
    }
  }
  function exportRun() {
    download(
      `blueloop-${township}-run.json`,
      JSON.stringify(
        {
          ...session,
          exportedAt: new Date().toISOString(),
          assumptions: site,
          context: {
            ...context,
            hackathon: HACKATHON_CONTEXT,
            assetBasis:
              'Public township reference; all pond, tank, valve and capacity values are mock.',
          },
          monetaryBasis:
            'Irrigated water volume × configurable illustrative tariff; canal release earns no savings.',
          readings,
          waterBalanceErrorM3: waterBalanceError(s),
        },
        null,
        2
      ),
      'application/json'
    );
    setNotice(
      'Run exported with assumptions, rainfall provenance, readings, and audit events.'
    );
  }

  return {
    session,
    setSession,
    s,
    dataset,
    township,
    scenario,
    speed,
    tariff,
    site,
    context,
    ended,
    playing,
    setPlaying,
    ready,
    notice,
    setNotice,
    loading,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    readings,
    forecast,
    unmanagedPeak,
    managedPeak,
    gateReason,
    currentRain,
    rainNext,
    riskIndex,
    tone,
    status,
    resetRun,
    jumpTo,
    command,
    toggleGate,
    stop,
    fault,
    guidedDemo,
    loadWeather,
    importFile,
    exportRun,
  };
}
const BlueLoopContext = createContext<ReturnType<
  typeof useSessionState
> | null>(null);
export function BlueLoopProvider({ children }: { children: ReactNode }) {
  const value = useSessionState();
  return (
    <BlueLoopContext.Provider value={value}>
      {children}
    </BlueLoopContext.Provider>
  );
}
export function useBlueLoop() {
  const context = useContext(BlueLoopContext);
  if (!context) throw new Error('BlueLoop workspace provider is missing.');
  return context;
}
