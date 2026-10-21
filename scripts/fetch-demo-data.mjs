import { mkdir, writeFile } from 'node:fs/promises';

await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
for (const site of [{ id: 'elmina', lat: 3.176, lon: 101.513 }]) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${site.lat}&longitude=${site.lon}&start_date=2021-12-17&end_date=2021-12-19&hourly=precipitation&timezone=Asia%2FKuala_Lumpur&models=era5`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Fetch failed for ${site.id}: ${response.status}`);
  const raw = await response.json();
  if (!raw.hourly?.time?.length || raw.hourly.precipitation.some(p => !Number.isFinite(p))) throw new Error('Incomplete provider data');
  const dataset = { id: `era5-dec2021-${site.id}`, name: 'December 2021 · Selangor rainfall replay', kind: 'historical',
    source: 'Open-Meteo / ERA5 reanalysis', sourceUrl: url, license: 'CC BY 4.0',
    attribution: 'Weather data by Open-Meteo.com, derived from ERA5. Rainfall amounts are unscaled; timestamps are shifted to the start of each preceding one-hour interval. Township hydraulic readings are simulated, not observed.',
    township: site.id, fetchedAt: new Date().toISOString(),
    grid: { latitude: raw.latitude, longitude: raw.longitude },
    points: raw.hourly.time.map((time, i) => ({ time: new Date(Date.parse(`${time}:00+08:00`) - 3600000).toISOString(), rainMm: raw.hourly.precipitation[i] })) };
  await writeFile(new URL(`../public/data/${site.id}-dec2021.json`, import.meta.url), `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(`${site.id}: ${dataset.points.length} hours, ${dataset.points.reduce((sum, p) => sum + p.rainMm, 0).toFixed(1)} mm, grid ${raw.latitude}, ${raw.longitude}`);
}
