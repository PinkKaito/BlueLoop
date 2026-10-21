# BlueLoop hackathon demonstration

## Positioning

BlueLoop explores a practical question for Sime Darby Property township teams: can retained stormwater irrigate shared landscapes while creating storage space before the next storm? The concept connects **water conservation**, **circular reuse**, and **climate resilience**, all listed under the official hackathon's [Planet theme](https://www.simedarbyproperty.com/universityhackathon/).

The single reference setting is [Elmina Central Park](https://www.simedarbyproperty.com/city-of-elmina/) in City of Elmina, Shah Alam, Selangor. Its park landscaping provides the context for the proposed water-reuse concept. The routing system is mock infrastructure, with no claimed installation at the park.

## Three-minute walkthrough

1. **Set the local problem (20 seconds).** Introduce Elmina Central Park, the fixed reference setting. Explain that a township landscape team needs irrigation water and pre-storm storage headroom. Identify the park reference and the mock pond and tank in the schematic.
2. **Run the mechanism (45 seconds).** Click **Guided demo**. It runs a synthetic 65 mm storm at 1,800×, completing an 18-hour cycle in about 36 seconds. Show the predicted storage demand, internal reuse, constrained canal release, and the computed result. Pause to explain a decision if needed. Storage remains bounded and any overflow is recorded.
3. **Explain value (25 seconds).** Point to delivered irrigation volume, retained storage, and the unmanaged comparator. Savings use delivered irrigation and an illustrative RM/m³ tariff; this is potential operating value, not validated company savings. Residents and nearby businesses are the intended beneficiaries of better township stormwater management.
4. **Show a limit (30 seconds).** Choose condition 4 to start a fresh saturated-storage case. Inject **Downstream canal blocked**, then step 15 minutes: the external gate remains closed. Clear the fault and reset before the next demonstration. The prototype exposes constraints instead of promising every storm can be mitigated.
5. **Ground the evidence (30 seconds).** Open **Data sources** and load **offline Dec 2021 replay**. Show the 72 hourly records and source attribution. Rainfall comes from regional ERA5 reanalysis for Elmina coordinates in Selangor; all derived telemetry is simulated. The bundled rain totals 138.7 mm over the 72-hour interval. Do not describe these as park rain-gauge measurements.
6. **Close on repeatability (20 seconds).** Explain that every scenario uses the same Elmina reference setting and that reset produces a fresh run. Export the run to retain assumptions, provenance, decisions, and the water balance. The hackathon deliverable is a self-contained, reproducible demonstration, with no connected devices.

## Source and evidence boundaries

- The official City of Elmina page supports the park reference, not the invented infrastructure dimensions or routing scheme.
- The [Open-Meteo historical API](https://open-meteo.com/en/docs/historical-weather-api) supplies rainfall, not operational asset telemetry. JPS Public Infobanjir and MET Malaysia links in the app provide additional Malaysian reference sources.
- Monsoon and extreme-rain presets are scripted stress cases. Their totals are scenario inputs, not Malaysian warning categories or return-period estimates.
- All timestamps display Malaysia time (UTC+08:00). The tariff is editable and illustrative. No claim of current utility pricing, calibrated flood probability, or measured Sime Darby Property savings is made.
