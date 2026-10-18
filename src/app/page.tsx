'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SidebarRail } from '@/components/SidebarRail';
import { HeaderBar } from '@/components/HeaderBar';
import { HydraulicSchematic } from '@/components/HydraulicSchematic';
import { SensorGauges } from '@/components/SensorGauges';
import { PreStormAlertBanner } from '@/components/PreStormAlertBanner';
import { StormForecastChart } from '@/components/StormForecastChart';
import { ActionApprovalCard } from '@/components/ActionApprovalCard';
import { ExecutiveKpiBar } from '@/components/ExecutiveKpiBar';
import { DemoWalkthroughModal } from '@/components/DemoWalkthroughModal';
import {
  SimulationPhase,
  StormScenario,
  DischargeTier,
  TelemetryData,
  ImpactMetrics,
} from '@/types';
import {
  INITIAL_TELEMETRY,
  MITIGATED_TELEMETRY,
  INITIAL_METRICS,
  MITIGATED_METRICS,
  calculatePeaks,
  generateForecastData,
  SCENARIO_PRESETS,
} from '@/lib/hydraulics';

export default function BlueLoopDashboard() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedTownship, setSelectedTownship] = useState<string>('elmina');
  const [latencyMs, setLatencyMs] = useState<number>(14);

  // Core Simulation & Scenario state
  const [rainfallMm, setRainfallMm] = useState<number>(85);
  const [selectedScenario, setSelectedScenario] = useState<StormScenario>('heavy');
  const [isDrawdownExecuted, setIsDrawdownExecuted] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [supervisedAutonomy, setSupervisedAutonomy] = useState<boolean>(true);
  const [canalReleaseOpen, setCanalReleaseOpen] = useState<boolean>(false);
  const [activeTier, setActiveTier] = useState<DischargeTier>('tier1_irrigation');
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase>('PREDICT');

  // Telemetry and KPI state
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [metrics, setMetrics] = useState<ImpactMetrics>(INITIAL_METRICS);

  // Demo Walkthrough Modal state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isAutoDemoRunning, setIsAutoDemoRunning] = useState<boolean>(false);

  // Sub-telemetry jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLatencyMs(Math.floor(12 + Math.random() * 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Hydraulic Calculations
  const { unmanagedPeak, managedPeak } = useMemo(() => {
    return calculatePeaks(rainfallMm);
  }, [rainfallMm]);

  // Recharts Data Series
  const forecastChartData = useMemo(() => {
    return generateForecastData(rainfallMm, isDrawdownExecuted);
  }, [rainfallMm, isDrawdownExecuted]);

  // Handle Scenario Change (Pill Buttons)
  const handleSelectScenario = useCallback((scenario: StormScenario) => {
    setSelectedScenario(scenario);
    const mm = SCENARIO_PRESETS[scenario].mm;
    setRainfallMm(mm);

    // If extreme storm and already drawdown, auto-open secondary canal release
    if (mm >= 105 && isDrawdownExecuted) {
      setCanalReleaseOpen(true);
      setActiveTier('tier2_canal');
    } else if (mm < 105 && !canalReleaseOpen) {
      setActiveTier('tier1_irrigation');
    }
  }, [isDrawdownExecuted, canalReleaseOpen]);

  // Handle Dynamic Slider Change
  const handleRainfallChange = useCallback((mm: number) => {
    setRainfallMm(mm);
    if (mm <= 55) {
      setSelectedScenario('moderate');
    } else if (mm <= 100) {
      setSelectedScenario('heavy');
    } else {
      setSelectedScenario('extreme');
    }

    if (mm >= 105 && isDrawdownExecuted) {
      setCanalReleaseOpen(true);
      setActiveTier('tier2_canal');
    }
  }, [isDrawdownExecuted]);

  // Trigger Proactive Drawdown (Hero Action)
  const triggerProactiveDrawdown = useCallback(() => {
    if (isSimulating || isDrawdownExecuted) return;
    setIsSimulating(true);
    setCurrentPhase('ACT');

    // Intermediate state: Pumps ramp up
    setTelemetry(prev => ({
      ...prev,
      pumpFlowRate: 380,
    }));

    // Transition to post-drawdown safe state
    setTimeout(() => {
      setIsSimulating(false);
      setIsDrawdownExecuted(true);
      setCurrentPhase('MEASURE');
      setTelemetry(MITIGATED_TELEMETRY);
      setMetrics(MITIGATED_METRICS);

      if (rainfallMm >= 105) {
        setCanalReleaseOpen(true);
        setActiveTier('tier2_canal');
      }
    }, 1300);
  }, [isSimulating, isDrawdownExecuted, rainfallMm]);

  // Reset to initial baseline
  const handleReset = useCallback(() => {
    setIsDrawdownExecuted(false);
    setIsSimulating(false);
    setCanalReleaseOpen(false);
    setActiveTier('tier1_irrigation');
    setCurrentPhase('PREDICT');
    setTelemetry(INITIAL_TELEMETRY);
    setMetrics(INITIAL_METRICS);
    setDemoStep(0);
    setIsAutoDemoRunning(false);
  }, []);

  // Automated 4-Phase Demo Sequence for Live Pitch
  const runAutoDemo = useCallback(() => {
    handleReset();
    setIsAutoDemoRunning(true);
    setIsDemoModalOpen(true);
    setDemoStep(0);
  }, [handleReset]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F19] text-[#F8FAFC]">
      {/* 1. Slim Left Navigation Rail (64px) */}
      <SidebarRail
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        latencyMs={latencyMs}
      />

      {/* 2. Main Executive Screen Container (16:9 Single-Screen Bento Grid) */}
      <main className="flex-1 flex flex-col justify-between p-2.5 sm:p-3.5 gap-2.5 max-w-[1720px] mx-auto w-full overflow-y-auto 2xl:overflow-hidden h-full">
        {/* A. TOP EXECUTIVE HEADER BAR */}
        <HeaderBar
          currentPhase={currentPhase}
          onReset={handleReset}
          onStartDemo={runAutoDemo}
          isDemoRunning={isAutoDemoRunning}
          selectedTownship={selectedTownship}
          onSelectTownship={setSelectedTownship}
        />

        {/* B. MAIN TWO-COLUMN DASHBOARD BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0">
          {/* ====== LEFT COLUMN (5 cols): HYDRAULIC TOPOLOGY & SENSOR TELEMETRY ====== */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-12 gap-2.5 min-h-0">
            {/* Left Sub-Section (7 cols in subgrid): Vector Schematic Topology */}
            <div className="md:col-span-7 h-full">
              <HydraulicSchematic
                telemetry={telemetry}
                isDrawdownActive={isSimulating || isDrawdownExecuted}
                canalReleaseOpen={canalReleaseOpen}
                onToggleCanalRelease={() => setCanalReleaseOpen(prev => !prev)}
              />
            </div>

            {/* Right Sub-Section (5 cols in subgrid): 3 Stacked Sensor Gauges */}
            <div className="md:col-span-5 h-full">
              <SensorGauges
                telemetry={telemetry}
                isDrawdownExecuted={isDrawdownExecuted}
              />
            </div>
          </div>

          {/* ====== RIGHT COLUMN (7 cols): PREDICTION, RECHARTS SIMULATION & ACTIONS ====== */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-2.5 min-h-0">
            {/* 1. Pre-Storm Action Alert Banner */}
            <div>
              <PreStormAlertBanner
                rainfallMm={rainfallMm}
                onRainfallChange={handleRainfallChange}
                selectedScenario={selectedScenario}
                onSelectScenario={handleSelectScenario}
                isDrawdownExecuted={isDrawdownExecuted}
                unmanagedPeak={unmanagedPeak}
                managedPeak={managedPeak}
              />
            </div>

            {/* 2. Center Hero Card: Recharts Hydrograph Simulation */}
            <div className="flex-1 min-h-[190px]">
              <StormForecastChart
                data={forecastChartData}
                unmanagedPeak={unmanagedPeak}
                managedPeak={managedPeak}
                isDrawdownExecuted={isDrawdownExecuted}
              />
            </div>

            {/* 3. Bottom Control: Smart Action Approval & Autonomy Toggle */}
            <div>
              <ActionApprovalCard
                isDrawdownExecuted={isDrawdownExecuted}
                isSimulating={isSimulating}
                onApproveDrawdown={triggerProactiveDrawdown}
                onReset={handleReset}
                supervisedAutonomy={supervisedAutonomy}
                onToggleAutonomy={() => setSupervisedAutonomy(prev => !prev)}
                activeTier={activeTier}
                onSelectTier={setActiveTier}
              />
            </div>
          </div>
        </div>

        {/* C. BOTTOM EXECUTIVE KPI BAR (3 EQUAL BENTO CARDS) */}
        <div className="shrink-0">
          <ExecutiveKpiBar
            metrics={metrics}
            isDrawdownExecuted={isDrawdownExecuted}
          />
        </div>
      </main>

      {/* Interactive Hackathon Pitch / Demo Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        currentStep={demoStep}
        onSelectStep={setDemoStep}
        onApproveDrawdown={triggerProactiveDrawdown}
        onReset={handleReset}
      />
    </div>
  );
}
