# BlueLoop design system

Reference: the user-supplied BlueLoop prototype at ais-pre-2xgyvtumt6pl5q3trc3q75-717004562667.asia-southeast1.run.app.

## Scene and theme

A township operator and presenter read water levels on a laptop in a lit meeting room. Use the prototype's light canvas, white tinted surfaces, slate text, red active navigation, blue pond water, green reuse, and amber canal states.

## Typography

Inter with system sans fallback. Monospace for timestamps, volumes, and telemetry. Body 14px, panel titles 15px, page identity 25px. Numeric values use tabular figures.

## Layout

Maximum width 1500px. Header contains a fixed City of Elmina label and five operating conditions. An always-visible playback toolbar precedes a 40/60 hydraulic and forecast layout. Three circular gauges sit below the schematic. Benefits, event log, and data provenance follow. Stack structurally on small screens.

The header identifies the Malaysian hackathon and Planet theme. Elmina Central Park is the single reference setting, displayed as a fixed site label. A compact contextual row ties the real park reference to the proposed mock use case. Data sources separates public asset evidence from invented model assets. Preserve this distinction in schematic labels and exports.

## Components and tokens

Use restrained OKLCH tokens in globals.css. Surface corners 14px, controls 7px, one-pixel borders. Use semantic text plus color for alarms. Native select, range, and file inputs; ordinary buttons for commands. Avoid decorative motion. Animate only flowing pipes while transfer is active. Respect prefers-reduced-motion.
