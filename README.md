# BlueLoop · Township Water Intelligence

A working demonstration of the supplied five-condition BlueLoop prototype, built with Next.js, React, TypeScript, Three.js, and Recharts. The multipage workspace models township stormwater storage, internal reuse, staged canal release, safety holds, and computed outcomes.

## Sime Darby Property and Malaysian setting

The concept is framed for the [Sime Darby Property University Hackathon](https://www.simedarbyproperty.com/universityhackathon/) **Planet** theme, particularly water conservation, circular reuse, and climate resilience. Its intended demonstration users are township operations and landscape teams, with potential value for residents and nearby businesses.

**Elmina Central Park, City of Elmina, Shah Alam, Selangor** is the single reference setting. Sime Darby Property describes a [300-acre Central Park](https://www.simedarbyproperty.com/city-of-elmina/) in the township. The proposed demo use case reuses retained stormwater for park landscaping while creating pre-storm pond headroom.

This public asset description provides context. The DEMO-01 pond, reuse tank, valves, dimensions, and operational values are invented mock infrastructure. Regional December 2021 rainfall for Elmina coordinates in Selangor drives the replay; it is not park telemetry. Dates use MYT, money uses RM, and volumes use m³. Source links appear in **Data sources**, and JSON exports include the Elmina context.

See [the presentation walkthrough](docs/hackathon-demo.md) for a short, locally grounded demo script.

Watch the [silent application demo](docs/demo/BlueLoop-application-demo.mp4) (4:49), covering all six pages, five scenarios, light and heavy rain, wet surfaces, 3D asset inspection, safety controls, results, exports, and rainfall imports. [Chapter guide](docs/demo/README.md).

Explore the [mock dashboard UI on Google AI Studio](https://ais-pre-2xgyvtumt6pl5q3trc3q75-717004562667.asia-southeast1.run.app/).

## Run locally

Use Node.js 20+ (verified with Node 24).

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. For a production build, stop the development server first, then run:

```powershell
npm run build
npm start
```

## Workspace and 3D environment

- **Overview**: current water headroom, rainfall, reuse, and the next decision.
- **Scenario studio**: five dedicated chapters, each with an explicit **Load this preset** action.
- **Water network**: an interactive Three.js landscape with selectable pond, tanks, pump station, canal gate, and irrigation.
- **Impact & results**: computed delivery, illustrative RM savings, managed/unmanaged demand, and the water-balance ledger.
- **Telemetry & events**: readings, audit events, severity filters, and exports.
- **Data sources**: rainfall replay, imports, evidence, assumptions, and asset credits.

The shared session persists as you navigate. The 3D model uses local optimized vegetation, photographed PBR textures, daylight lighting, shadows, reflective water, and detailed infrastructure. Drag to orbit, scroll to zoom, and use the asset strip for close-ups. Camera reset, labels, and fullscreen controls are available. WebGL is required; asset readings and the simulation remain available if graphics cannot load. Scene sources and licenses are in [public/scene/CREDITS.md](public/scene/CREDITS.md).

Rainfall drives animated rain streaks, pond and canal impact rings, stronger water ripples, wind movement in vegetation, overcast lighting, and distance haze. Wet ground and reflective path puddles build from elapsed rainfall and dry after the storm. The model header shows the current rate in mm/h. These are illustrative visual effects, not measured wind, visibility, surface wetness, or a separate weather model. Pause freezes motion; reduced-motion mode retains lighting and wet materials without animated rain or foliage.

## Demonstration controls

- **Guided demo** starts a fresh 65 mm storm with automatic approval and staged canal release enabled at 1,800×. An 18-hour cycle takes about 36 seconds in the foreground.
- **Load this preset** inside the five scenario chapters loads fresh, independently computed scenarios: baseline, pre-storm alert, internal reuse, saturated-storage canal release, and post-storm results. They reset the previous run.
- **Play / pause**, **15-minute step**, **reset**, and **1× / 60× / 360× / 1,800× / 7,200×** playback apply to both scripted and public-data replay. 1× is actual wall-clock speed; 7,200× advances two simulated hours per second.
- **Weather scenarios** include clear weather, 35 mm moderate rain, 65 mm monsoon rain, 120 mm extreme surge, and saturated storage. Extreme storms can overflow, including with mitigation active.
- **Approve drawdown** enables reuse; actual volume changes as simulated time advances. Automatic approval triggers above 85% projected storage.
- **Allow staged canal release** enables a bypass while pond storage is above its target. It requires drawdown approval, available downstream headroom, and no heavy rain. Heavy rain (≥5 mm/h), headroom below 30%, sensor loss, actuator failure, and emergency stop prevent external release.
- **Fault injection** demonstrates sensor loss, actuator failure, and downstream blockage. A blocked canal still permits internal reuse. An emergency stop clears approval and automatic mode; release the hold and approve again to restart controlled flows.
- **Elmina Central Park** is the fixed reference setting for every scenario, weather request, and export. All five operating conditions use the same illustrative Elmina model.
- **Telemetry & events** shows sampled model readings and audit events. The water-balance ledger is on **Impact & results**. Export telemetry CSV, events CSV, or a full JSON run with provenance and model assumptions.

The current run and event ledger are saved in browser local storage, at most once per second during playback, and restored paused. The telemetry trace collects up to 2,000 samples during the current page visit. Playback pauses when the tab is hidden. Reset invalidates any pending dataset request.

## Real public weather data

**Data sources → Load Dec 2021 replay** loads 72 bundled hourly ERA5 precipitation totals for Elmina's requested coordinates. No network request is needed at presentation time. These records were fetched from Open-Meteo, with the provider request URL, retrieval time, attribution, and resolved grid coordinates recorded in `public/data/elmina-dec2021.json`.

| Source | Data available | How BlueLoop uses it |
| --- | --- | --- |
| [Open-Meteo historical API](https://open-meteo.com/en/docs/historical-weather-api) | Global hourly reanalysis precipitation | Bundled December 17–19, 2021 provider records and custom 1–7 day historical fetches |
| [Open-Meteo forecast API](https://open-meteo.com/en/docs) | Hourly forecast precipitation | On-demand latest 72-hour forecast, replayed as a simulation |
| [JPS Public Infobanjir](https://publicinfobanjir.water.gov.my/laporan-harian/?lang=en) | Official Malaysian station rainfall/water-level reports; CSV export | Research/reference link; no scraping or unverified API integration |
| [MET Malaysia / data.gov.my](https://developer.data.gov.my/realtime-api/weather) | General forecasts and weather warnings | Research/reference link; not used as quantitative hourly rainfall |

**Attribution:** Weather data by [Open-Meteo.com](https://open-meteo.com/), historical data derived from ERA5, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Rainfall amounts are unscaled. The provider reports accumulated rainfall at each hour's end; BlueLoop shifts timestamps back one hour to label interval starts. Consequently, the bundled replay spans December 16 at 23:00 through December 19 at 23:00 MYT. ERA5 grid cells are regional: the returned coordinates are not pond sensor locations. Open-Meteo's free API is for non-commercial use; check its terms before commercial deployment.

Refresh the bundled data deliberately with `npm run data:refresh`. The existing Elmina fixture already works offline.

**Fetch latest forecast** and **Fetch historical rainfall** use the server-side `/api/weather` endpoint. The provider hosts and site coordinates are fixed, historical intervals are limited to seven days, and requests time out after 12 seconds. Provider errors appear in the dashboard while preserving the current run. Forecast requests are cached for 15 minutes; historical requests for 24 hours. The live forecast is fetched on demand, not automatically polled or represented as live sensor observations.

## Import rainfall CSV

Use **Download template** in Data sources. Files must be under 250 KB with 2–168 consecutive hourly interval-start records and explicit timezone offsets:

```csv
timestamp,rain_mm
2021-12-17T00:00:00+08:00,0
2021-12-17T01:00:00+08:00,1.2
2021-12-17T02:00:00+08:00,5.6
```

Missing, non-numeric, negative, excessive (>500 mm/h), duplicate, or irregular rainfall records are rejected. Standard quoting on the two required columns is accepted, so exported rainfall can be imported again. Convert station water-level readings separately: rainfall and water level use different units and are not interchangeable.

## Model and limits

All hydraulic readings and commands are simulated. There are no physical sensor, PLC, pump, or valve connections, no operator authentication, and no shared server-side operational database. This is a functional demonstration, not a commissioned flood-control system.

The model advances on at most one-minute integration intervals. Runoff is `rain_mm / 1000 × catchment_area_m² × runoff_coefficient`. Internal transfer removes exactly the volume added to the tank; irrigation and external discharge remove metered volumes. Pond and tank bounds are enforced, with excess pond volume explicitly recorded as overflow.

The conservation identity is:

`initial pond + initial tank + runoff = current pond + current tank + irrigation + passive discharge + canal release + overflow`

Benefits are derived from these quantities. **Water reused** is actual modeled irrigation delivery. **Water bill avoided** is that volume multiplied by the configurable illustrative tariff (default RM 3.20/m³). Canal release earns no water-bill credit. The tariff is an assumption, not a claim about the current utility schedule. The storage risk index is a bounded heuristic, not flood probability or a calibrated hydrological risk assessment. Soil moisture is an illustrative index; downstream headroom is also modeled.

Forecasts rerun the same model, proposing approval now when it has not yet been granted. Lines above 100% show excess storage demand, while actual vessel levels remain bounded. The unmanaged comparator follows the same rainfall and passive drainage without active controls. The five prototype headings are preserved; numerical results are computed instead of reproducing its inconsistent fixed volume/percentage pairs.

Site capacities, catchment areas, coefficients, and flow rates in `src/lib/simulation.ts` are explicit demonstration assumptions. Before physical integration, survey and calibrate them, define actual device protocols, and add authenticated commands, durable server-side auditing, and independently validated hydraulic safety logic.

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run build
```

Tests cover conservation and bounds for every Elmina scenario, the bundled historical replay, supervised approval, heavy-rain gate closure, downstream blockage, sensor/actuator faults, emergency hold, playback-speed consistency, forecast isolation, saved-state validation, CSV round trips, invalid records, and weather endpoint validation/failure handling. Datasets and saved sessions for unsupported townships are rejected.

Design context is documented in `PRODUCT.md` and `DESIGN.md`. The detailed model contract is in `blueloop_specification.md`.

## 👥 Team & Task Distribution

| **Kyzer Phneh**<br>*(Lead Systems & Functional Build)* | **Lau Jun Hao**<br>*(UI/UX Design & High-Fi Assets)* | **Yap Han Lim**<br>*(Pitch Lead, Deck & Storytelling)* |
| :--- | :--- | :--- |
| • Next.js + Tailwind environment setup<br>• State machine & simulation logic<br>• Interactive chart & dynamic demo curves<br>• Live demo stability & production deployment | • High-fidelity UI layout & aesthetics via AI tools<br>• Township hydraulic topology vector graphic<br>• Static mockups of "future" vision & states<br>• Frontend styling & Tailwind component system | • 10-slide hackathon pitch deck formulation<br>• Financial ROI & ESG impact model (RM & $m^3$)<br>• 5-minute pitch script & judge Q&A preparation<br>• Live demo narration & driver during presentation |
