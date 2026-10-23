# BlueLoop dashboard redesign proposal

Status: implemented following acceptance of the structure, the request for a realistic Three.js view, and the subsequent interface guidelines. Final visual rules are recorded in DESIGN.md.

## Goal

Turn the current demonstration into a polished water-intelligence workspace, with distinct pages for understanding the site, exploring scenarios, following water movement, and presenting results. Prioritize presentation quality and a clear hackathon story. Elmina Central Park remains the reference location.

## Findings from the current dashboard

- At 1280 × 800, the hydraulic visualization starts 566px below the top; the approval action starts at 1108px and outcomes at 1200px. Header, condition shortcuts, playback, notices, tabs, and location context consume the first screen.
- The five condition buttons reset a run, while three nearby workspace buttons change the view. These two navigation models look similar but do different things.
- The current Operations view combines monitoring, forecasting, dispatch, results, scenario setup, fault injection, and an event ledger.
- The same storage percentages appear in both the vessel diagram and circular gauges. Repeated rounded containers and small labels weaken the hierarchy.
- Browser inspection at 1440, 768, and 390px found text below 11px, repeated icon containers, misaligned panel heights, and phone margins of 10px. The tablet and phone preserve too much header chrome before showing the main content.
- Baseline screenshots and machine measurements are in `.taste-skill/before/`. These are design-review findings, not a functional test result.

## Art direction: a water-intelligence atlas

Use the design-taste-frontend app-screen workflow. The dealt options were Accent ladder, Framed sheet, and Achromatic ledger. Choose **Framed sheet** (seed 51927594), because one shared frame gives the expanded application a consistent identity and lets each page carry a different main composition. No redraws.

The product's face is a very pale water-grey frame, a white working sheet, and BlueLoop blue on the principal water data. Its signature element is the Elmina demonstration's **pond → reuse tank → park irrigation / controlled canal** flow. This becomes a readable spatial diagram, with movement only when the simulated flow is active.

- A labelled sidebar around 228px wide and a compact 48px context bar; a white sheet inset 8px with a quiet edge and 16px outer corners.
- Six primary destinations grouped into Workspace and Evidence. A neutral selected navigation state; red is reserved for warnings, faults, and stop actions.
- IBM Plex Sans at 12/14/16/22/28px, with tabular figures. IBM Plex Mono only for asset IDs and event identifiers. Load the actual fonts rather than relying on a fallback.
- White surfaces, ink text, blue water data, restrained green reuse and amber release states. Flat fills and quiet borders, with one dominant visual per page.
- Consistent 16px panel gaps, 24px canvas padding, and generous but purposeful spacing. Remove repeated cards within cards and redundant gauges.
- One primary action per page. Comfortable labels, visible keyboard focus, readable contrast, and clear text alongside status colors.
- Short transitions for selection, drawers, and flow feedback. Reduced-motion mode removes optional movement.

## Page structure

| Destination | Route | Main question | Composition and primary action |
| --- | --- | --- | --- |
| Overview | `/` | What is happening at Elmina, and what needs attention? | Compact site context; a spatial water-loop summary; pond headroom and reuse availability; next decision and recent events. **Open scenario studio.** |
| Scenario studio | `/scenarios` | What changes under each operating condition? | A scenario library with five dedicated chapters, descriptive previews, and a focused replay workspace. **Start guided demo.** |
| Water network | `/network` | Where is the water going, and why? | A large diagram of the mock pond, tank, irrigation, and canal. Select an asset to open its level, flow, capacity, and interlock details. **Inspect an asset.** |
| Impact & results | `/impact` | What did this run achieve? | Water delivered, illustrative RM savings, peak storage, overflow, and managed versus unmanaged comparison. Show baseline or in-progress states honestly. **View run summary.** |
| Telemetry & events | `/activity` | What happened during this run? | Readings and event timeline as local tabs, with aligned numbers, severity filters, and existing exports. **Export the current view.** |
| Data sources | `/data` | What evidence drives the demonstration? | Elmina location context, active rainfall dataset, offline December 2021 replay, historical/forecast inputs, CSV import, and model assumptions. **Load rainfall replay.** |

Each destination is an actual route with its own title and content. The five conditions are nested scenario views, not global tabs that compete with page navigation.

## Five scenario chapters

| Chapter | Route | What leads the page |
| --- | --- | --- |
| Normal baseline | `/scenarios/baseline` | Retained storage, clear weather, and normal standby. Establish the initial state. |
| Pre-storm alert | `/scenarios/pre-storm` | Rainfall forecast, projected pond demand, and headroom. Put **Approve drawdown** beside the forecast. |
| Internal reuse | `/scenarios/reuse` | Pond-to-tank flow and delivered irrigation; show tank capacity and soil constraints beside the routing diagram. |
| Staged canal release | `/scenarios/canal-release` | Downstream headroom, release flow, and the interlock checklist. Put release and fault demonstrations beside their consequences. |
| Post-storm results | `/scenarios/results` | Actual computed delivery, savings, peak storage, and any overflow, with the same-rainfall unmanaged comparator. |

Each chapter gets a different emphasis and composition. Loading a chapter starts a named preset and pauses it; this reset is explicit. Navigating between primary pages preserves the selected run. A guided demo follows the existing simulation's actual condition changes; opening an explanatory chapter does not imply the running model has reached that condition.

## Prototype behavior and data

- Make navigation, chapter selection, guided playback, basic asset selection, and the existing core controls work. Focus polish on those presentation paths.
- Keep one shared simulation session above the route pages so navigation preserves rainfall, approvals, playback, readings, and events. Preserve the current local-storage restore behavior.
- Keep the existing water-balance model, datasets, weather endpoint, CSV handling, and exports. Derive repeated figures from shared selectors so pages agree.
- Use the bundled Elmina rainfall as the dependable offline presentation input. Retain on-demand weather loading and source attribution.
- Use concise `Simulation` / `Historical replay` context in the frame. Keep detailed evidence and assumptions on Data sources and in relevant exports. Do not present modeled assets or readings as measured park infrastructure.
- Draw an illustrative asset layout from the existing model; it is a schematic, not a surveyed map. No dependency on new photographs, live map tiles, or live device feeds.
- Any added presentation fixtures must be deterministic and identified as demonstration data. Do not invent measured savings, flood probability, or installed hardware.

## Implementation sequence

1. Establish the shared session provider, route structure, visual tokens, typography, and responsive application frame.
2. Build the Overview and Water network around the distinctive water-loop illustration and asset details.
3. Build the Scenario studio and its five chapters, simplify playback, and place each decision beside its evidence.
4. Build Impact, Activity, and Data sources by redistributing and restyling existing content and controls.
5. Polish responsive layouts, keyboard states, loading/empty/error states, and motion. Update `DESIGN.md` and the demo walkthrough to match the approved design.

The implementation stays in the existing Next.js, React, TypeScript, Tailwind/CSS, Lucide, and Recharts stack. Restyle chart primitives rather than accepting library defaults.

## Acceptance checks

- At laptop sizes, the page question, lead visualization, and primary action are visible on the first screen. A page should not require scrolling past global explanatory panels before showing its subject.
- Every primary destination and scenario deep link works, including browser back/forward navigation. Changing ordinary pages preserves the active run; loading a scenario resets it explicitly.
- Scenario approval, safety interlocks, replay, imports, and exports retain their current model behavior.
- Figures agree across pages and retain MYT, RM, mm, m³, and m³/h units. Incomplete runs and zero results are shown honestly.
- Inspect and visually review desktop, tablet, and phone layouts at 1440, 768, and 390px, plus the 1280 × 800 presentation laptop. No page-level horizontal overflow; mobile navigation folds away and uses readable labels and touch targets.
- Run the existing test suite, lint, TypeScript checks, and production build after implementation, followed by browser checks of the main demonstration path.

## Approval scope

Approve the six-section information architecture, five scenario chapters, Framed sheet visual direction, and the prototype behavior above. The user accepted this structure and requested a more realistic Three.js scene. Implementation includes the six destinations and five chapters, with optimized local vegetation models, PBR surfaces, HDR daylight, shadows, reflective water, asset close-ups, orbit/zoom, and fullscreen. The scene replaces the proposed schematic as the leading visualization; engineering logic remains in the existing simulation.
