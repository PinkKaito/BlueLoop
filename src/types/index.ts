export type SimulationPhase = 'SENSE' | 'PREDICT' | 'ACT' | 'MEASURE';

export type StormScenario = 'moderate' | 'heavy' | 'extreme';

export type DischargeTier = 'tier1_irrigation' | 'tier2_canal' | 'tier3_emergency';

export interface TelemetryData {
  pondLevel: number; // in percentage, e.g. 78% -> 55%
  tankLevel: number; // in percentage, e.g. 32% -> 75%
  soilMoisture: number; // in percentage, e.g. 38% -> 62%
  canalHeadroom: number; // in percentage, e.g. 92% -> 80%
  pumpFlowRate: number; // in m3/h, e.g. 0 -> 380
}

export interface ImpactMetrics {
  runoffVolume: number; // in m3 (e.g. 4,120 -> 5,270)
  waterBillSaved: number; // in MYR (e.g. 14,350 -> 16,970)
  floodRiskPercent: number; // in % (e.g. 85 -> 22)
  potableDisplacedLiters: number; // in Liters
}

export interface ForecastDataPoint {
  hour: number;
  label: string; // "T+0h", "T+1h", ...
  timeStr: string; // "15:00", "16:00", ...
  unmanaged: number; // % capacity without BlueLoop
  managed: number; // % capacity with BlueLoop proactive drawdown
  dangerThreshold: number; // 100%
  rainMm: number; // rainfall intensity in mm
  drawdownActive?: boolean;
}

export interface DashboardState {
  // Scenario & Storm Controls
  rainfallMm: number;
  selectedScenario: StormScenario;
  isDrawdownExecuted: boolean;
  isSimulating: boolean;
  supervisedAutonomy: boolean;
  canalReleaseOpen: boolean;
  activeDischargeTier: DischargeTier;
  
  // Real-time Telemetry
  telemetry: TelemetryData;
  metrics: ImpactMetrics;
  
  // Peak projections
  unmanagedPeak: number;
  managedPeak: number;
  
  // Active workflow phase
  currentPhase: SimulationPhase;
}
