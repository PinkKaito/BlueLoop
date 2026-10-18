# BlueLoop — Smart Township Water Intelligence
**Sime Darby Property University Hackathon (Track: PLANET)**  
*Deployment Targets: City of Elmina (Central Wetland Retention • PLC-01) & Bandar Bukit Raja (125-Acre Flood-Mitigation Town Park • PLC-02)*

---

## 🌊 Overview
**BlueLoop** is an autonomous, predictive township water intelligence platform that resolves the fundamental operational paradox of master-planned tropical townships:
1. **Severe Flash Floods:** Tropical convective storms overwhelm retention ponds and civil canals during heavy downpours ($> 85\text{ mm}$).
2. **Potable Water Waste:** During dry periods, municipal treated water is purchased at commercial utility rates (Air Selangor) to irrigate township parks, landscape turf, and recreational grounds.
3. **Passive Hydraulic Inefficiencies:** Traditional civil sluice gates and ponds operate reactively post-inflow, failing to reserve surge buffer capacity before storms hit.

BlueLoop transforms passive detention basins into proactive, autonomous water networks executing a real-time event-driven loop:
$$\mathbf{SENSE} \longrightarrow \mathbf{PREDICT} \longrightarrow \mathbf{ACT} \longrightarrow \mathbf{MEASURE}$$

---

## ⚡ Core Features & Innovations

### 1. Multi-Vector Hydrological Telemetry (`SENSE`)
- **Pond Level Sensor (`Node P-01`):** Real-time percentage tracking of central retention wetland capacity.
- **Irrigation Storage Level (`Cistern T-01`):** Subterranean cistern buffer monitoring.
- **Soil Moisture Sensor Network (`Sensor S-04`):** Real-time landscape turf saturation across township green zones.
- **Civil Canal Headroom:** Downstream regional canal capacity index.

### 2. Predictive Storm Runoff & Risk Assessment (`PREDICT`)
- Ingests meteorological radar and forecast horizon vectors ($T + 2\text{h}$ to $T + 12\text{h}$).
- Evaluates the **Hydraulic Headroom Equation**:
  $$V_{\text{peak}} = V_{\text{current}} + (A_{\text{catchment}} \times P_{\text{forecast}} \times C_{\text{runoff}}) - Q_{\text{passive\_out}}$$
- Forecasts catastrophic breaches ($> 100\%$ capacity) hours before storm landfall.

### 3. Smart Tiered Drawdown Protocol (`ACT`)
- **Tier 1 (Internal Non-Potable Reuse - Default):** Activates transfer pumps ($380\text{ m}^3/\text{h}$) to draw retention pond levels down from $78\% \rightarrow 55\%$, routing harvested stormwater into storage cisterns ($32\% \rightarrow 75\%$) and irrigating parched green fields ($38\% \rightarrow 62\%$).
- **Tier 2 (Controlled Downstream Canal Pre-Release):** If storage buffers and landscape turf are saturated, BlueLoop initiates a controlled low-flow staged release ($15\%$) into empty regional civil canals 6–10 hours *before* the storm.
- **Tier 3 (Emergency Retention):** Closes external sluice gates during peak storm hours to protect downstream residential communities.

### 4. Human-in-the-Loop & Supervised Autonomy
- **Supervised Mode (Default):** Interactive operator dispatch with a single-click authorization card (`[APPROVE DRAWDOWN]`).
- **Autonomous Mode (Fail-Safe):** Automated trigger if high-risk alerts remain unacknowledged within 60 minutes of the storm event horizon.

### 5. ESG Accounting & Impact Ledger (`MEASURE`)
- **Runoff Volume Retained:** $+1,150\text{ m}^3$ surge buffer created ($5,270\text{ m}^3$ total captured).
- **Water Bill Saved:** $\text{RM } 16,970$ monthly utility offset ($\text{RM } 2.28/\text{m}^3$ Air Selangor commercial tariff).
- **Flood Risk Index:** Mitigated from $\mathbf{85\%} \rightarrow \mathbf{22\%}$ ($23\%$ peak surge reduction).

---

## 🛠️ Tech Stack & Architecture
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Custom Industrial Midnight Design System (`#0B0F19` canvas, `#131B2E` cards)
- **Data Visualization:** Recharts `<AreaChart>` with custom dual-curve hydrograph simulation and glassmorphic tooltip
- **Icons & Telemetry:** Lucide React (`Droplets`, `Waves`, `CloudRain`, `ShieldCheck`, `Sliders`, `Sparkles`)
- **Interactive SVG:** Vector hydraulic topology schematic with dynamic liquid wave levels and animated pipe flow dashes

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v22.12.0)
- npm 9+

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/PinkKaito/BlueLoop.git
cd BlueLoop

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the dashboard.

---

## 🏆 Hackathon Demonstration Guide (For Judges)
1. **Phase 1 (Baseline Stability):** Pond at $78\%$, Tank at $32\%$, Soil at $38\%$. Status is `STANDBY // POND HIGH`.
2. **Phase 2 (Pre-Storm Alert):** Select between `45mm Moderate`, `85mm Heavy [Default]`, or `120mm Extreme Surge` using the interactive scenario pills or intensity slider. Notice the red curve spiking over the $100\%$ danger threshold to $105\%$.
3. **Phase 3 (Approve Drawdown):** Click the glowing emerald **`APPROVE DRAWDOWN`** button. Watch the SVG pipelines animate water transfer, the gauges drop the pond to $55\%$ while filling the tank to $75\%$ and irrigating turf to $62\%$.
4. **Phase 4 (Outcome Verification):** The hydrograph updates to show peak surge capped at $82\%$, flood risk mitigated by $23\%$, $+1,150\text{ m}^3$ buffer created, and $\text{RM } 16,970$ saved.

---

## 👥 Team & Task Distribution

| **Kyzer Phneh**<br>*(Lead Systems & Functional Build)* | **Lau Jun Hao**<br>*(UI/UX Design & High-Fi Assets)* | **Yap Han Lim**<br>*(Pitch Lead, Deck & Storytelling)* |
| :--- | :--- | :--- |
| • Next.js + Tailwind environment setup<br>• State machine & simulation logic<br>• Interactive chart & dynamic demo curves<br>• Live demo stability & production deployment | • High-fidelity UI layout & aesthetics via AI tools<br>• Township hydraulic topology vector graphic<br>• Static mockups of "future" vision & states<br>• Frontend styling & Tailwind component system | • 10-slide hackathon pitch deck formulation<br>• Financial ROI & ESG impact model (RM & $m^3$)<br>• 5-minute pitch script & judge Q&A preparation<br>• Live demo narration & driver during presentation |

