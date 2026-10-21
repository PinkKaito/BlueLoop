# BlueLoop demonstration contract

This specification describes the functioning implementation. It supersedes the old fixed-value dark dashboard.

## Challenge context

The fully mock project addresses the Sime Darby Property University Hackathon's Planet theme through water conservation, circular reuse, and climate resilience. Elmina Central Park in City of Elmina, Shah Alam, Selangor, Malaysia is the single reference setting. `src/lib/township-context.ts` records the source links, proposed use case, and demo asset labels. It provides presentation context without altering the hydraulic model. The modeled pond, tank, valves, capacities, and operating rules are invented; park telemetry is not used. Run exports include this context alongside assumptions and rainfall provenance. There is no physical integration in scope. Only Elmina datasets and saved sessions are accepted.

## Inputs and time

`RainDataset` contains 2–168 consecutive hourly interval-start timestamps and precipitation totals in mm. The simulation treats each total as a constant rate during its hour. Supported sources are synthetic presets, bundled historical reanalysis, newly fetched historical/forecast data, and uploaded CSV.

Open-Meteo timestamps represent the end of the preceding accumulation hour; the adapter shifts those labels back one hour, preserving rainfall values. Display time is always Asia/Kuala_Lumpur. The clock stops at the end of the dataset. Playback speed changes simulated time per real second; it does not multiply rainfall or flow rates.

## State and mass accounting

`Simulation` stores pond/tank volumes (m³), soil index (%), elapsed hours, controlled flow rates (m³/h), cumulative inflow and outflows, unmanaged comparison storage, approvals, faults, condition, and up to 500 events. No fixed success metrics are used.

At each integration step:

1. Evaluate automatic approval if projected storage exceeds 85% and controls are available.
2. Add runoff: precipitation depth × catchment area × runoff coefficient.
3. Apply passive discharge above 50% pond capacity.
4. Irrigate from the tank while soil demand exists and rainfall is below 1 mm/h.
5. Transfer from pond to tank, bounded by transfer rate, 95% tank capacity, and a 65% pond target.
6. Apply staged canal release if approved and allowed by interlocks, bounded by canal rate and the pond target.
7. Record and remove any pond overflow. Advance the unmanaged baseline with only rainfall and passive drainage.
8. Update the illustrative soil index, physical peaks, condition, and audit events.

Internal transfer is never counted as an external outflow. The water-balance residual is exposed in the UI and JSON export.

## Interlocks

| Constraint | Effect |
| --- | --- |
| Supervised mode, no approval | No controlled transfer, irrigation, or canal release |
| Emergency stop | All commanded flows stopped; approval, bypass permission, and automatic mode cleared by the UI command |
| Sensor offline | Controlled flows held; model readings still visible for diagnosis |
| Actuator failure | Controlled flows held |
| Downstream canal blocked | No external release; internal reuse remains available |
| Modeled canal headroom <30% | External gate closed |
| Rainfall ≥5 mm/h | External gate closed |
| Tank ≥95% | Internal transfer constrained by remaining tank capacity |
| Soil index ≥80% | Irrigation restricted to incremental soil demand |

The gate permission checkbox remains permission only; the engine reevaluates interlocks during every step. Passive drainage and rain continue during an emergency hold.

## Five conditions

The headings follow the supplied prototype: Normal Baseline, Pre-Storm Alert, Active Internal Reuse, Pre-Storm Canal Release, Post-Storm Mitigated. Actual flows determine active conditions; when rainfall/replay ends, results disclose whether overflow occurred. The fifth label does not guarantee successful mitigation.

Condition shortcuts load independent scenarios and reset run counters. The post-storm shortcut computes the entire storm under approved reuse and staged canal release. Guided demo enables automatic approval and gate permission, then plays at 1,800×.

## Forecast and outcomes

The forecast compares the following 12 hours under approval now with a parallel no-intervention run. The unmanaged baseline includes only passive drainage. Excess storage demand is displayed above the 100% line; actual water storage is bounded and overflow is accounted for separately.

Water savings count delivered irrigation, not tank transfers or external release. Monetary savings use a configurable illustrative tariff. The risk index is `clamp(2 × (peak storage demand % − 50), 0, 100)`, using current approved or proposed risk state. It is not a flood probability. Infrastructure dimensions, runoff coefficient, soil response, and downstream-headroom formula require calibration for real sites.

## Persistence and exports

Browser local storage retains the validated current run, dataset, settings, and event ledger. Restoring always pauses playback. No shared operational database exists. The per-visit telemetry trace holds up to 2,000 rows. Run JSON contains source attribution, dataset, model parameters, cumulative volumes, events, trace, and conservation residual. CSV output escapes quotes and protects text cells from spreadsheet formula injection.

## Weather endpoint

`GET /api/weather?township=elmina&mode=forecast|historical`

Historical mode optionally accepts `start` and `end` (ISO dates), up to seven inclusive days, from 1940 to five days ago. Invalid parameters return 400. Provider timeout, malformed data, or upstream errors return 502 with an offline-replay alternative. Requests use a fixed upstream host and 12-second timeout. Forecast data is cached for 15 minutes; historical data for 24 hours.
