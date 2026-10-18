import { ForecastDataPoint, StormScenario, TelemetryData, ImpactMetrics } from '@/types';

// Tariff constants: Air Selangor commercial non-potable baseline
export const COMMERCIAL_WATER_TARIFF_MYR_PER_M3 = 2.28;

// Initial baseline values
export const INITIAL_TELEMETRY: TelemetryData = {
  pondLevel: 78,
  tankLevel: 32,
  soilMoisture: 38,
  canalHeadroom: 92,
  pumpFlowRate: 0,
};

export const MITIGATED_TELEMETRY: TelemetryData = {
  pondLevel: 55,
  tankLevel: 75,
  soilMoisture: 62,
  canalHeadroom: 82,
  pumpFlowRate: 380,
};

export const INITIAL_METRICS: ImpactMetrics = {
  runoffVolume: 4120,
  waterBillSaved: 14350,
  floodRiskPercent: 85,
  potableDisplacedLiters: 4120000,
};

export const MITIGATED_METRICS: ImpactMetrics = {
  runoffVolume: 5270,
  waterBillSaved: 16970,
  floodRiskPercent: 22,
  potableDisplacedLiters: 5270000,
};

/**
 * Calculates peak pond level capacity based on rainfall depth (mm)
 * Catchment equation: V_peak = V_current + (A * P * C) - Q_out
 */
export function calculatePeaks(rainfallMm: number) {
  // At 85mm -> unmanaged is 105% (over 100% danger), managed is 82% (safe)
  // Dynamic scaling:
  const unmanagedPeak = Math.round(74 + rainfallMm * 0.365);
  const managedPeak = Math.max(52, Math.round(unmanagedPeak - 23));
  return { unmanagedPeak, managedPeak };
}

/**
 * Generates 13 time points (T+0h to T+12h) for Recharts AreaChart
 */
export function generateForecastData(rainfallMm: number, isMitigated: boolean): ForecastDataPoint[] {
  const { unmanagedPeak, managedPeak } = calculatePeaks(rainfallMm);

  // 12-hour hourly timeline
  const baseHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  
  // Normalized storm distribution peaking at hour 6
  // Rain arrives around hour 2-3, peaks at hour 6, recedes by hour 10-12
  const unmanagedRatios = [
    0.74, // T+0: initial 78%
    0.75, // T+1: slight baseline
    0.78, // T+2: rain onset begins
    0.85, // T+3: runoff rapidly entering
    0.93, // T+4: pond fills fast
    0.98, // T+5: approaching threshold
    1.00, // T+6: PEAK (e.g. 105%)
    0.95, // T+7: peak draining slowly
    0.89, // T+8: rain subsidies
    0.84, // T+9: passive discharge
    0.80, // T+10
    0.76, // T+11
    0.73  // T+12
  ];

  // Proactive drawdown curve:
  // T+0: 78% -> T+1: 70% -> T+2: 55% (drawdown safe buffer created!) -> T+3: 58% -> T+6: peaks at managedPeak (82%) -> safe!
  const managedRatios = [
    0.78, // T+0: initial
    0.69, // T+1: drawdown pumping initiated
    0.55, // T+2: buffer secured (55%)
    0.60, // T+3: absorbs first surge
    0.68, // T+4: controlled accumulation
    0.76, // T+5: storm ingestion
    0.82, // T+6: PEAK SAFELY CAPPED (e.g. 82%)
    0.78, // T+7: post-peak
    0.73, // T+8
    0.68, // T+9
    0.64, // T+10
    0.60, // T+11
    0.57  // T+12
  ];

  return baseHours.map((hour, idx) => {
    // If not mitigated yet, managed curve shows the potential plan if executed now
    const unmanagedVal = Math.round((unmanagedRatios[idx] / 1.0) * unmanagedPeak);
    const managedVal = Math.round((managedRatios[idx] / 0.82) * managedPeak);

    const rainIntensity = hour >= 2 && hour <= 8 
      ? Math.round(rainfallMm * Math.exp(-Math.pow(hour - 5.5, 2) / 3)) 
      : Math.max(0, Math.round(rainfallMm * 0.05));

    return {
      hour,
      label: `T+${hour}h`,
      timeStr: `${(15 + hour) % 24}:00`,
      unmanaged: unmanagedVal,
      managed: managedVal,
      dangerThreshold: 100,
      rainMm: rainIntensity,
      drawdownActive: hour >= 1 && hour <= 3,
    };
  });
}

export const SCENARIO_PRESETS: Record<StormScenario, { mm: number; name: string; tag: string }> = {
  moderate: { mm: 45, name: 'Moderate Rain', tag: '45mm / 3h' },
  heavy: { mm: 85, name: 'Heavy Storm', tag: '85mm (Default)' },
  extreme: { mm: 120, name: 'Extreme Monsoon Surge', tag: '120mm Surge' },
};
