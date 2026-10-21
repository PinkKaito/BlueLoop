import { initialSimulation, RainDataset, ScenarioId, SCENARIOS, Simulation, SITES, syntheticDataset, TownshipId, validateDataset, waterBalanceError } from './simulation';

export interface Session {
  version: 1; township: TownshipId; scenario: ScenarioId; dataset: RainDataset;
  simulation: Simulation; speed: number; tariff: number;
}
export const STORAGE_KEY = 'blueloop-demo-v1';
export const SPEEDS = [1, 60, 360, 1800, 7200];
export function createSession(township: TownshipId = 'elmina', scenario: ScenarioId = 'normal'): Session {
  return { version: 1, township, scenario, dataset: syntheticDataset(scenario, township),
    simulation: initialSimulation(SITES[township], scenario), speed: 360, tariff: 3.2 };
}
export function validateSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const v = value as Session;
  if (v.version !== 1 || !Object.hasOwn(SITES, v.township) || !Object.hasOwn(SCENARIOS, v.scenario) ||
    !validateDataset(v.dataset) || v.dataset.township !== v.township || !SPEEDS.includes(v.speed) ||
    !Number.isFinite(v.tariff) || v.tariff < 0 || v.tariff > 100 || !v.simulation) return false;
  const s = v.simulation;
  const site = SITES[v.township];
  const numericKeys: (keyof Simulation)[] = ['hour', 'pond', 'tank', 'soil', 'unmanagedPond', 'initialVolume', 'rainInflow', 'passiveReleased',
    'transferred', 'irrigated', 'canalReleased', 'overflow', 'unmanagedOverflow', 'peakPond', 'unmanagedPeak', 'transferFlow', 'canalFlow', 'irrigationFlow'];
  if (!numericKeys.every(key => typeof s[key] === 'number' && Number.isFinite(s[key]) && (s[key] as number) >= 0)) return false;
  return s.hour <= v.dataset.points.length && s.pond <= site.pondCapacity && s.tank <= site.tankCapacity && s.soil <= 100 &&
    s.unmanagedPond <= site.pondCapacity && [1, 2, 3, 4, 5].includes(s.condition) &&
    ['none', 'sensor-offline', 'actuator-failure', 'canal-blocked'].includes(s.fault) &&
    [s.approved, s.canalEnabled, s.automatic, s.emergencyStop].every(x => typeof x === 'boolean') &&
    Array.isArray(s.events) && s.events.length <= 500 && s.events.every(e => e && Number.isFinite(e.id) && Number.isFinite(e.hour) &&
      typeof e.message === 'string' && e.message.length <= 1000 && ['info', 'warning', 'critical'].includes(e.level)) &&
    Math.abs(waterBalanceError(s)) < 0.01;
}
