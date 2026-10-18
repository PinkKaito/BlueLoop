# BLUE LOOP: SMART TOWNSHIP WATER INTELLIGENCE
**System Specification, Architectural Topology & Functional Requirements**  
*Document Target:* AI Developer Agents, System Architecture, & Hackathon Evaluation  
*Competition Context:* Sime Darby Property University Hackathon — "Township of Tomorrow"  
*Primary Track:* PLANET (Water Conservation, Climate Resilience, Smart Infrastructure, ESG)  
*Target Environments:* Bandar Bukit Raja (125-acre Flood-Mitigation Town Park) & City of Elmina (Central Park Wetlands)

---

## 1. Executive Summary & Problem Formulation

### 1.1 The Operational Paradox
Master-planned townships in tropical climates face a critical water management contradiction:
1. **Severe Storm Surge Vulnerability:** During heavy precipitation events, high-volume runoff rapidly saturates retention ponds and civil drainage, threatening urban areas with flash floods.
2. **Potable Water Misallocation:** Under baseline (non-storm) conditions, municipal treated (potable) water is purchased at commercial utility rates (Air Selangor) to irrigate landscape networks, parks, and recreational turf.
3. **Reactive Hydraulic Design:** Traditional township stormwater civil assets (sluice gates, detention basins, weirs) respond purely post-inflow. Ponds remain static until runoff physically arrives, discharging potentially reusable water directly into regional rivers without capture.

### 1.2 Core Objective
To convert passive detention infrastructure into an autonomous, predictive water management network that:
- Pre-emptively calculates flood risk using weather forecast horizon vectors.
- Proactively draws down retention ponds prior to storm onset.
- Diverts extracted water into non-potable irrigation storage tanks and dry soil networks, reserving maximum surge headroom before precipitation begins.

---

## 2. Core Operating Principle & State Machine

The BlueLoop engine executes an event-driven loop across four cyclical phases:

$$\text{SENSE} \longrightarrow \text{PREDICT} \longrightarrow \text{ACT} \longrightarrow \text{MEASURE}$$

### State Transition Sequence
- **STATE 0 (IDLE / OPTIMAL):** Pond capacity $\le 75\%$, Forecast Rainfall $< 15\text{ mm}$. Routine telemetry logging.
- **STATE 1 (RISK DETECTED):** Upcoming Storm Forecast $\ge 40\text{ mm}$ within $T \le 12\text{ hours}$ AND Pond Storage $\ge 70\%$. Dynamic Risk Engine predicts capacity breach ($> 100\%$).
- **STATE 2 (PROACTIVE DRAWDOWN / DISPATCH):** System triggers automated transfer valves/pumps. Executes Tiered Discharge Protocol to reduce pond volume down to safety buffer level ($50\% - 55\%$).
- **STATE 3 (STORM INGESTION):** Storm arrives. Inflow fills the reserved headroom safely. Peak retention levels remain capped below critical threshold ($\le 85\%$).
- **STATE 4 (RECOVERY & ESG RECONCILIATION):** Normalization, audit logging, utility savings calculations, and return to STATE 0.

---

## 3. Detailed Functional Specifications

### Feature 1: Multi-Vector Hydrological Telemetry (SENSE)
- **Telemetry Inputs:**
  - `Pond_Level_Pct`: Real-time fill percentage of the central retention wetland.
  - `Irrigation_Storage_Pct`: Current capacity of underground buffer cisterns.
  - `Soil_Moisture_Pct`: Landscape turf saturation index across township green zones.
  - `Main_Canal_Headroom_Pct`: Available depth in the external civil stormwater canal.
- **Data Frequency:** Polled at 1 Hz in simulation (representing 5-minute sampling intervals in real deployments).

### Feature 2: Predictive Storm Runoff & Risk Assessment (PREDICT)
- **Rainfall Ingestion:** Integrates scheduled rainfall horizon ($t + 2\text{h}$ to $t + 12\text{h}$) via meteorological precipitation APIs.
- **Hydraulic Headroom Equation:**
  $$V_{\text{peak}} = V_{\text{current}} + (A_{\text{catchment}} \times P_{\text{forecast}} \times C_{\text{runoff}}) - Q_{\text{passive\_out}}$$
  *Where $A_{\text{catchment}}$ is the sub-basin area, $P_{\text{forecast}}$ is expected rainfall depth, and $C_{\text{runoff}}$ is the watershed runoff coefficient.*
- **Risk Thresholds:**
  - `NORMAL`: Expected peak $< 85\%$ of pond maximum capacity.
  - `ELEVATED`: Expected peak between $85\%$ and $99\%$.
  - `CRITICAL OVERFLOW RISK`: Expected peak $\ge 100\%$ capacity. Triggers immediate drawdown recommendations.

### Feature 3: Smart Tiered Drawdown & Multi-Sink Routing (ACT)
To address edge cases where storage buffers are saturated, BlueLoop enforces a **Three-Tier Discharge Protocol**:
1. **Tier 1 (Internal Reuse - Default):** Pumping water from the retention pond into township irrigation tanks and irrigating parched green fields (if soil moisture $< 60\%$).
2. **Tier 2 (Controlled Downstream Pre-Release):** If irrigation tanks are full ($\ge 90\%$) and landscape soil is saturated, BlueLoop initiates a controlled low-flow release into downstream civil canals 6–10 hours *before* storm landfall—taking advantage of completely empty external canals before regional runoff gathers.
3. **Tier 3 (Emergency Retention):** Closes external sluices during peak storm hours to protect downstream residential developments from sudden surge flooding.

### Feature 4: Human-in-the-Loop Supervisory Governance
- **Supervised Mode (Default):** BlueLoop generates a cryptographic "Action Dispatch Card" detailing required drawdown volume and target storage sink. Requires single-click operator authorization.
- **Autonomous Mode (Fail-Safe):** Automated trigger if high-risk alerts remain unacknowledged within 60 minutes of the storm event horizon.

### Feature 5: Dual-Path Simulation & Operational Analytics (MEASURE)
- Real-time simulation showing side-by-side hydrographs:
  - **Status Quo (Passive):** Pond begins storm at $80\%$ capacity $\rightarrow$ reaches peak at **$105\%$ (Flash Flood / Overflow)**.
  - **BlueLoop (Proactive):** Pond pre-emptively drops from $80\%$ to $55\%$ $\rightarrow$ reaches peak at **$82\%$ (Safe Containment)**.
- **ESG / Cost Benefit Engine:**
  - `Potable Water Displaced (Liters)` = Total stormwater routed to irrigation sinks.
  - `Financial Savings (RM)` = Liters Displaced $\times$ Commercial Utility Baseline Tariff ($\sim \text{RM } 2.50/\text{m}^3$).
  - `Flood Damages Prevented` = Qualitative and historical damage risk avoidance score.

---

## 4. Software Architecture & Implementation Blueprint

### 4.1 System Topology & Data Flow

| Layer | Technology Stack | Core Workloads & Responsibilities |
| :--- | :--- | :--- |
| **Telemetry & Simulation Layer** | Python (FastAPI) or Node.js Engine | • Generates synthetic sensor telemetry (`Pond_Level_Pct`, `Irrigation_Storage_Pct`, `Soil_Moisture_Pct`).<br>• Injects deterministic storm profiles (e.g., $65\text{ mm}$ convective downpour over 4 hours).<br>• Streams real-time payloads via WebSockets or REST endpoints. |
| **BlueLoop Decision & Hydraulic Engine** | Rule-Based State Machine & Predictor | • Computes inflow volume using catchment runoff equations.<br>• Identifies threshold breaches ($V_{\text{peak}} \ge 100\%$).<br>• Evaluates sink availability and assigns discharge tiers (Tier 1 vs. Tier 2).<br>• Manages governance states (`Supervised Mode` vs. `Autonomous Mode`). |
| **Operator Command Dashboard** | React, Tailwind CSS, Recharts / Lucide | • Visualizes live infrastructure topology (Pond $\rightarrow$ Sluice Gates $\rightarrow$ Tanks $\rightarrow$ Turf).<br>• Renders interactive state-change dispatch cards (`[Approve Drawdown]`).<br>• Plots the dual hydrograph comparison curve (Unmanaged $105\%$ vs. BlueLoop $82\%$).<br>• Updates live ESG accounting metrics (RM saved, $m^3$ retained). |

### 4.2 Module Interconnects & Event Pipeline

```
[Simulation & Telemetry Engine]
         │
         │  (1) Sensor Telemetry + Rainfall Forecast Payloads
         ▼
[BlueLoop Decision & Hydraulic Engine]
         │
         │  (2) Runoff Calculations & Drawdown Trigger Commands
         ▼
[Operator Command Center Dashboard]
         │
         │  (3) Operator Click: [Approve Drawdown]
         ▼
[Actuator Execution State] ──► (Pond Drops 78% → 54% | Tank Fills 28% → 88%)
```

### 4.3 Data Contract (JSON Payload Schema)

AI agents can reference this exact JSON schema for system state transmission:

```json
{
  "timestamp": "2026-10-18T15:00:00Z",
  "simulation_phase": "PRE_STORM_ALERT",
  "weather": {
    "forecast_rainfall_mm": 65.0,
    "time_to_landfall_hours": 6.0,
    "confidence_score": 0.94
  },
  "telemetry": {
    "pond_level_pct": 78.0,
    "irrigation_tank_pct": 28.0,
    "soil_moisture_pct": 35.0,
    "external_canal_headroom_pct": 92.0
  },
  "prediction": {
    "unmanaged_peak_pct": 105.0,
    "blueloop_managed_peak_pct": 82.0,
    "risk_level": "CRITICAL_OVERFLOW"
  },
  "action_dispatch": {
    "required_drawdown_volume_m3": 4500,
    "recommended_sink": "TIER_1_INTERNAL_IRRIGATION",
    "gate_id": "SLUICE_VALVE_02",
    "status": "AWAITING_OPERATOR_APPROVAL"
  },
  "impact_metrics": {
    "water_reused_liters": 4500000,
    "utility_cost_saved_myr": 11250.00,
    "flood_incidents_mitigated": 1
  }
}
```

---

## 5. Demonstration Scenario Script (For Live Judging)

For an effective live pitch demo, run the pre-scripted 3-phase sequence:

1. **Phase 1: Baseline Stability ($T - 12\text{h}$)**
   - Dashboard indicators: Pond at $78\%$, Irrigation Tank at $28\%$, Soil is Dry ($35\%$). Weather forecast is clear. System status is "OPTIMAL".
2. **Phase 2: Predictive Storm Warning & Action Trigger ($T - 6\text{h}$)**
   - Synthetic Weather API injects a $65\text{ mm}$ tropical convective rain event arriving at $T - 0\text{h}$.
   - System flags a **CRITICAL OVERFLOW RISK (Estimated Surge: 105%)**.
   - Action Dispatch Card displays: *"Transfer 4,500 m³ to Irrigation Buffer & Open Valve 02"*.
   - Presenter clicks `[Approve Drawdown]`. Pond level visibly drops from $78\% \rightarrow 54\%$, while Irrigation Storage rises to $88\%$.
3. **Phase 3: Storm Arrival & Outcome Verification ($T - 0\text{h}$)**
   - Storm hits. Dual-line graph animates live:
     - **Red Line (Without BlueLoop):** Breaches the $100\%$ danger line, peaking at $105\%$.
     - **Green Line (With BlueLoop):** Comfortably absorbs incoming surge, topping out at $82\%$.
   - Summary ticker updates: **$4.5\text{ Million Liters}$ of potable water saved (RM 11,250)** and **Zero Overflows Recorded**.