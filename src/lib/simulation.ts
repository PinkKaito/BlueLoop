export type TownshipId = 'elmina';
export type Condition = 1 | 2 | 3 | 4 | 5;
export type Fault = 'none' | 'sensor-offline' | 'actuator-failure' | 'canal-blocked';
export type ScenarioId = 'normal' | 'moderate' | 'heavy' | 'extreme' | 'saturated';
export interface Site {
  id: TownshipId; name: string; latitude: number; longitude: number;
  pondCapacity: number; tankCapacity: number; catchmentArea: number;
  runoffCoefficient: number; transferRate: number; canalRate: number;
  irrigationRate: number; passiveRate: number; targetPondPercent: number;
}
export const SITES: Record<TownshipId, Site> = {
  elmina: { id: 'elmina', name: 'City of Elmina', latitude: 3.176, longitude: 101.513,
    pondCapacity: 150000, tankCapacity: 10000, catchmentArea: 900000,
    runoffCoefficient: 0.75, transferRate: 750, canalRate: 1200,
    irrigationRate: 600, passiveRate: 200, targetPondPercent: 65 },
};
export interface RainPoint { time: string; rainMm: number }
export interface RainDataset {
  id: string; name: string; kind: 'synthetic' | 'historical' | 'forecast' | 'imported';
  source: string; sourceUrl: string; license: string; attribution: string;
  township: TownshipId; fetchedAt: string; points: RainPoint[];
}
export const SCENARIOS: Record<ScenarioId, { name: string; rain: number; pond: number; tank: number; soil: number }> = {
  normal: { name: 'Clear weather', rain: 0, pond: 50, tank: 60, soil: 55 },
  moderate: { name: 'Moderate rain · 35 mm', rain: 35, pond: 70, tank: 40, soil: 45 },
  heavy: { name: 'Monsoon storm · 65 mm', rain: 65, pond: 78, tank: 32, soil: 38 },
  extreme: { name: 'Extreme surge · 120 mm', rain: 120, pond: 85, tank: 60, soil: 68 },
  saturated: { name: 'Saturated storage · 65 mm', rain: 65, pond: 78, tank: 95, soil: 88 },
};
export function syntheticDataset(scenario: ScenarioId, township: TownshipId): RainDataset {
  const distribution = [0, 0, 0, 0, 0, 0, 0.08, 0.22, 0.35, 0.25, 0.1, 0, 0, 0, 0, 0, 0, 0];
  return { id: `demo-${scenario}-${township}`, name: SCENARIOS[scenario].name,
    kind: 'synthetic', source: 'BlueLoop scripted weather', sourceUrl: '', license: 'Project demo data',
    attribution: 'Synthetic rainfall; all hydraulic readings are simulated.', township,
    fetchedAt: '2026-01-01T00:00:00.000Z', points: distribution.map((weight, hour) => ({
      time: new Date(Date.UTC(2026, 0, 1, hour)).toISOString(), rainMm: weight * SCENARIOS[scenario].rain,
    })) };
}
export interface SimulationEvent { id: number; hour: number; level: 'info' | 'warning' | 'critical'; message: string }
export interface Simulation {
  hour: number; pond: number; tank: number; soil: number; unmanagedPond: number;
  initialVolume: number; rainInflow: number; passiveReleased: number;
  transferred: number; irrigated: number; canalReleased: number; overflow: number;
  unmanagedOverflow: number; peakPond: number; unmanagedPeak: number;
  approved: boolean; canalEnabled: boolean; automatic: boolean; emergencyStop: boolean;
  fault: Fault; transferFlow: number; canalFlow: number; irrigationFlow: number;
  condition: Condition; events: SimulationEvent[];
}
export const DEMO_TARIFF = 3.2;
export const MAX_DURATION_HOURS = 168;
const clamp = (x: number, low: number, high: number) => Math.max(low, Math.min(high, x));
export const percent = (volume: number, capacity: number) => volume / capacity * 100;
export function addEvent(state: Simulation, message: string, level: SimulationEvent['level'] = 'info'): Simulation {
  const id = (state.events.at(-1)?.id ?? 0) + 1;
  return { ...state, events: [...state.events, { id, hour: state.hour, level, message }].slice(-500) };
}
export function initialSimulation(site: Site, scenario: ScenarioId = 'normal'): Simulation {
  const preset = SCENARIOS[scenario];
  const pond = preset.pond / 100 * site.pondCapacity;
  const tank = preset.tank / 100 * site.tankCapacity;
  return { hour: 0, pond, tank, soil: preset.soil, unmanagedPond: pond,
    initialVolume: pond + tank, rainInflow: 0, passiveReleased: 0, transferred: 0,
    irrigated: 0, canalReleased: 0, overflow: 0, unmanagedOverflow: 0,
    peakPond: pond, unmanagedPeak: pond, approved: false, canalEnabled: false,
    automatic: false, emergencyStop: false, fault: 'none', transferFlow: 0,
    canalFlow: 0, irrigationFlow: 0, condition: scenario === 'normal' ? 1 : 2,
    events: [{ id: 1, hour: 0, level: 'info', message: `New ${site.name} simulation: ${preset.name}.` }] };
}
export function rainfallAt(dataset: RainDataset, hour: number): number {
  return dataset.points[Math.floor(hour + 1e-9)]?.rainMm ?? 0;
}
export function upcomingRain(dataset: RainDataset, hour: number, horizon = 6): number {
  let total = 0;
  const end = Math.min(hour + horizon, dataset.points.length);
  for (let h = hour; h < end - 1e-9;) {
    const next = Math.min(Math.floor(h + 1e-9) + 1, end);
    total += rainfallAt(dataset, h) * (next - h);
    h = next;
  }
  return total;
}
export function canalHeadroom(state: Simulation, dataset: RainDataset): number {
  if (state.fault === 'canal-blocked') return 8;
  return clamp(92 - rainfallAt(dataset, state.hour) * 3 - state.canalFlow / 150, 5, 95);
}
export function gateInterlock(state: Simulation, dataset: RainDataset): string | null {
  if (state.emergencyStop) return 'Emergency stop is engaged';
  if (state.fault === 'sensor-offline') return 'Sensor offline: fail-safe hold';
  if (state.fault === 'actuator-failure') return 'Valve actuator unavailable';
  if (canalHeadroom(state, dataset) < 30) return 'Downstream headroom below 30%';
  if (rainfallAt(dataset, state.hour) >= 5) return 'Heavy rain: external gate locked closed';
  return null;
}
export function approve(state: Simulation): Simulation {
  if (state.approved || state.emergencyStop || state.fault === 'sensor-offline' || state.fault === 'actuator-failure') return state;
  return addEvent({ ...state, approved: true, condition: 3 }, 'Operator approved internal reuse drawdown.');
}
function step(state: Simulation, site: Site, dataset: RainDataset, dt: number, log: boolean): Simulation {
  let s = { ...state };
  const rain = rainfallAt(dataset, s.hour);
  const upcoming = upcomingRain(dataset, s.hour);
  const projected = percent(s.pond + upcoming * site.catchmentArea * site.runoffCoefficient / 1000, site.pondCapacity);
  if (s.automatic && !s.approved && !s.emergencyStop && s.fault !== 'sensor-offline' && s.fault !== 'actuator-failure' && projected > 85) {
    s = { ...s, approved: true };
    if (log) s = addEvent(s, 'Automatic mode authorized drawdown: projected storage above 85%.', 'warning');
  }
  if (s.automatic && s.approved && s.tank >= site.tankCapacity * 0.9 && s.soil >= 80 && !s.canalEnabled && !gateInterlock(s, dataset)) {
    s.canalEnabled = true;
    if (log) s = addEvent(s, 'Storage saturated: automatic staged canal release enabled.', 'warning');
  }
  const inflow = rain / 1000 * site.catchmentArea * site.runoffCoefficient * dt;
  let pond = s.pond + inflow;
  let tank = s.tank;
  const passive = Math.min(Math.max(0, pond - site.pondCapacity * 0.5), site.passiveRate * dt);
  pond -= passive;
  const working = s.approved && !s.emergencyStop && s.fault !== 'sensor-offline' && s.fault !== 'actuator-failure';
  // Soil moisture is an illustrative index; irrigation is a metered outflow from the tank.
  const soilDemand = Math.max(0, (80 - s.soil + 0.3 * dt - rain * dt * 0.7) * 150);
  const irrigation = working && rain < 1 ? Math.min(tank, site.irrigationRate * dt, soilDemand) : 0;
  tank -= irrigation;
  const transfer = working ? Math.min(Math.max(0, pond - site.pondCapacity * site.targetPondPercent / 100), Math.max(0, site.tankCapacity * 0.95 - tank), site.transferRate * dt) : 0;
  pond -= transfer;
  tank += transfer;
  const canal = working && s.canalEnabled && !gateInterlock(s, dataset)
    ? Math.min(Math.max(0, pond - site.pondCapacity * site.targetPondPercent / 100), site.canalRate * dt) : 0;
  pond -= canal;
  const overflow = Math.max(0, pond - site.pondCapacity);
  pond -= overflow;
  let unmanaged = s.unmanagedPond + inflow;
  unmanaged -= Math.min(Math.max(0, unmanaged - site.pondCapacity * 0.5), site.passiveRate * dt);
  const unmanagedOverflow = Math.max(0, unmanaged - site.pondCapacity);
  unmanaged = Math.min(unmanaged, site.pondCapacity);
  const nextCondition: Condition = canal > 0 ? 4 : transfer > 0 || irrigation > 0 ? 3
    : rain > 0 || upcoming > 0 ? 2 : s.rainInflow > 0 ? 5 : s.condition;
  s = { ...s, hour: s.hour + dt, pond, tank,
    soil: clamp(s.soil + irrigation / 150 + rain * dt * 0.7 - 0.3 * dt, 0, 100),
    unmanagedPond: unmanaged, rainInflow: s.rainInflow + inflow,
    passiveReleased: s.passiveReleased + passive, transferred: s.transferred + transfer,
    irrigated: s.irrigated + irrigation, canalReleased: s.canalReleased + canal,
    overflow: s.overflow + overflow, unmanagedOverflow: s.unmanagedOverflow + unmanagedOverflow,
    peakPond: Math.max(s.peakPond, pond + overflow), unmanagedPeak: Math.max(s.unmanagedPeak, unmanaged + unmanagedOverflow),
    transferFlow: transfer / dt, canalFlow: canal / dt, irrigationFlow: irrigation / dt,
    condition: nextCondition };
  if (log && state.condition !== nextCondition) s = addEvent(s, `Operating condition changed to ${CONDITION_NAMES[nextCondition]}.`);
  if (log && state.canalFlow > 0 && canal === 0) s = addEvent(s, gateInterlock(s, dataset) ?? 'Canal gate closed: target reached.', 'warning');
  if (log && state.overflow === 0 && overflow > 0) s = addEvent(s, 'Pond capacity exceeded: overflow recorded. Available mitigation is insufficient.', 'critical');
  return s;
}
export function advance(state: Simulation, site: Site, dataset: RainDataset, hours: number, log = true): Simulation {
  let s = state;
  const end = Math.min(dataset.points.length, state.hour + Math.max(0, hours));
  // A fixed integration boundary makes speed changes and large jumps equivalent.
  while (s.hour < end - 1e-8) {
    const boundary = (Math.floor(s.hour * 60 + 1e-6) + 1) / 60;
    s = step(s, site, dataset, Math.min(boundary - s.hour, end - s.hour), log);
  }
  if (s.hour >= dataset.points.length - 1e-8) {
    s = { ...s, hour: dataset.points.length, transferFlow: 0, canalFlow: 0, irrigationFlow: 0, condition: s.rainInflow > 0 ? 5 : 1 };
  }
  return s;
}
export const CONDITION_NAMES: Record<Condition, string> = {
  1: 'Normal Baseline', 2: 'Pre-Storm Alert', 3: 'Active Internal Reuse',
  4: 'Pre-Storm Canal Release', 5: 'Post-Storm Mitigated',
};
export interface Projection { hour: number; label: string; managed: number; unmanaged: number; rain: number }
export function project(state: Simulation, site: Site, dataset: RainDataset): Projection[] {
  let managed = { ...state, approved: true };
  let unmanaged = { ...state, pond: state.unmanagedPond, overflow: state.unmanagedOverflow, approved: false, automatic: false, canalEnabled: false };
  const rows: Projection[] = [];
  const horizon = Math.min(12, dataset.points.length - state.hour);
  for (let hour = 0; hour <= horizon; hour++) {
    rows.push({ hour: state.hour + hour, label: `+${hour}h`, managed: percent(managed.pond + managed.overflow - state.overflow, site.pondCapacity),
      unmanaged: percent(unmanaged.pond + unmanaged.overflow - state.unmanagedOverflow, site.pondCapacity), rain: rainfallAt(dataset, state.hour + hour) });
    managed = advance(managed, site, dataset, 1, false);
    unmanaged = advance(unmanaged, site, dataset, 1, false);
  }
  return rows;
}
export function waterBalanceError(state: Simulation): number {
  return state.initialVolume + state.rainInflow - state.pond - state.tank - state.irrigated - state.passiveReleased - state.canalReleased - state.overflow;
}
export function simulatedTime(dataset: RainDataset, hour: number): string {
  return new Date(Date.parse(dataset.points[0].time) + hour * 3600000).toISOString();
}
export function validateDataset(input: unknown): input is RainDataset {
  if (!input || typeof input !== 'object') return false;
  const d = input as RainDataset;
  return typeof d.id === 'string' && typeof d.name === 'string' && d.name.length <= 200 &&
    ['synthetic', 'historical', 'forecast', 'imported'].includes(d.kind) &&
    d.township === 'elmina' && typeof d.source === 'string' &&
    typeof d.sourceUrl === 'string' && typeof d.license === 'string' && typeof d.attribution === 'string' &&
    typeof d.fetchedAt === 'string' && Array.isArray(d.points) && d.points.length >= 2 && d.points.length <= MAX_DURATION_HOURS &&
    d.points.every((p, i) => p && typeof p.time === 'string' && Number.isFinite(Date.parse(p.time)) &&
      Number.isFinite(p.rainMm) && p.rainMm >= 0 && p.rainMm <= 500 &&
      (i === 0 || Date.parse(p.time) - Date.parse(d.points[i - 1].time) === 3600000));
}
