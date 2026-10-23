# BlueLoop design system

## Direction

A water-intelligence workspace for presenting Elmina's modeled stormwater cycle. The design-taste-frontend app draw selected **Framed sheet**, seed 51927594, from Accent ladder, Framed sheet, and Achromatic ledger. No redraws. The pale water-grey frame takes a muted landscape tint from the scene; a white working sheet holds the data. The pond, reuse tanks, and controlled canal provide the product's visual identity.

## Information architecture

Six destinations: Overview (`/`), Scenario studio (`/scenarios`), Water network (`/network`), Impact & results (`/impact`), Telemetry & events (`/activity`), and Data sources (`/data`). Five nested scenario chapters explain baseline, pre-storm, reuse, canal release, and results. Opening a chapter preserves the run; **Load this preset** explicitly starts its computed demonstration. One session provider above all routes preserves playback, dataset, approvals, and events.

## Type, color, and space

IBM Plex Sans 400/500/600 with tabular figures; IBM Plex Mono for identifiers and coordinates. Exactly four text sizes: 12px metadata, 14px labels and body, 20px decision headings, and 26px titles and leading figures. Weights and spacing carry the remaining hierarchy.

All authored colors use Radix UI Colors. Sage supplies the frame and neutral surfaces (1-3), selections (4-5), borders (6-8), and text (11-12). Teal supplies water data and links; Jade and Amber indicate operating states, with Red for faults. Grass, Sand, and Bronze are limited to physical scene materials. Photographic texture and HDR pixels retain their source color. Primary buttons use Sage 12; text colors use accessible scale steps. See the [Radix scale guidance](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale).

Sidebar 222px, context bar 60px, content padding 28px, panel gap 20px. Sheet radius 14px, scene 10px, panels 8px, controls 4px. All explicit UI borders and chart rules are 0.5px. No resting shadows or decorative left-edge accents. No UI transitions; camera focus changes immediately. Only active model flow and water motion animate. Scenario images are stills captured from the actual Three.js scene.

Copy stays operational and concise. No middle-dot separators, slogans, repeated page descriptions, or decorative overlines. Asset IDs, scenario conditions, source provenance, safety explanations, and units remain where useful. Phone Overview prioritizes headroom and approaching rainfall; delivery and savings remain on Impact & results.

## Three.js environment

React Three Fiber 8 / Drei 9 / Three.js r170. PBR grass and concrete, optimized vegetation meshes with complete leaf canopies and shrub opacity, HDR daylight, directional shadows, reflective rippled water, detailed tanks, pumps, pipework, gate, and irrigation. Scene assets are local, with sources in `public/scene/CREDITS.md`. The scene is an illustrative site arrangement; model capacities are independent of visual scale.

Drag to orbit, scroll or pinch to zoom, select geometry or the asset strip for a focused camera and current model readings. Camera reset, labels, and fullscreen are real controls. Main scene labels show three assets; focused views show one. Phone labels recede to preserve the landscape; the full asset strip stays accessible. Graphics errors retain the surrounding simulation and offer retry. WebGL is required for the model.

Render on demand while paused, cap device pixel ratio at 1.5, and use simplified local meshes. Rain streaks and surface impact rings use two GPU-instanced draw calls with capped particle counts. Rain density, slant, water disturbance, foliage movement, lighting, and haze follow the simulation's current hourly rainfall. Pond and canal normals animate during playback, with faster canal motion during release. Wet materials and path puddles derive from elapsed rainfall with gradual drying; future rainfall cannot wet the scene early. These visual responses are illustrative, not calibrated environmental readings. Pause freezes motion; reduced-motion mode retains static materials and lighting without animated rain, water, foliage, or flow markers. Gate geometry reflects actual modeled release even when paused.

## Responsive behavior

The sidebar folds under 1000px. Overview columns stack under 900px; the right rail follows the model. Phone margins remain at least 16px inside the sheet, metrics become two columns, asset controls scroll within their own strip, tables scroll inside their frame, and controls use 44px touch targets where practical. A short laptop viewport uses a shorter scene so its controls fit above the replay dock.

## Evidence and review

All values derive from the existing simulation and datasets; there are no invented measured outcomes. Detailed assumptions and source links live on Data sources. Each page retains MYT, RM, mm, m³, and m³/h units and distinguishes replay input from simulated infrastructure.

Visual review uses the skill inspector at 1440, 768, and 390px and a 1280×800 laptop check. The neutral map toolbar is intentionally allowed under `icon-chips`: these are camera tools, not decorative category icons. The remaining `tiny-text` note concerns metadata at the user-requested 12px minimum; primary labels and body copy use 14px. Review artifacts live in ignored `.taste-skill/`.

The production inspector also reports `no-data-hue` on the desktop WebGL view: its screenshot threshold does not recognize the dark Teal 12 pond as a chart series. The scene intentionally uses a natural dark water material; quantitative charts use Teal 9. This finding does not indicate missing data.

Production browser verification covers all 11 destinations, invalid scenario 404 handling, approval and stepping, route persistence, fault controls and gate holds, the 72-record offline replay, a completed guided run, four-size typography, absence of middle-dot separators, and no page overflow on laptop and phone.
