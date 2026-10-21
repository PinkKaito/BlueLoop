import { RainDataset, SITES, TownshipId, validateDataset } from './simulation';

export function weatherUrl(township: TownshipId, mode: 'historical' | 'forecast', start = '2021-12-17', end = '2021-12-19'): string {
  const site = SITES[township];
  const url = new URL(mode === 'historical' ? 'https://archive-api.open-meteo.com/v1/archive' : 'https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({ latitude: String(site.latitude), longitude: String(site.longitude),
    hourly: 'precipitation', timezone: 'Asia/Kuala_Lumpur', ...(mode === 'historical'
      ? { start_date: start, end_date: end, models: 'era5' } : { forecast_days: '3' }) }).toString();
  return url.toString();
}
export function normalizeWeather(raw: unknown, township: TownshipId, mode: 'historical' | 'forecast', sourceUrl: string): RainDataset {
  const body = raw as { hourly?: { time?: unknown[]; precipitation?: unknown[] } };
  if (!Array.isArray(body?.hourly?.time) || !Array.isArray(body?.hourly?.precipitation) || body.hourly.time.length !== body.hourly.precipitation.length) {
    throw new Error('Weather provider returned an incomplete hourly series.');
  }
  // Open-Meteo timestamps hourly accumulated precipitation at the interval end.
  // Replay and CSV inputs use interval starts, so shift labels back one hour.
  const points = body.hourly.time.map((time, i) => ({ time: new Date(Date.parse(`${time}:00+08:00`) - 3600000).toISOString(), rainMm: body.hourly!.precipitation![i] as number }));
  const dataset: RainDataset = { id: `open-meteo-${mode}-${township}-${String(body.hourly.time[0])}`,
    name: mode === 'historical' ? `Historical rainfall · ${points[0].time.slice(0, 10)} to ${points.at(-1)!.time.slice(0, 10)}` : 'Latest 72-hour weather forecast',
    kind: mode, source: mode === 'historical' ? 'Open-Meteo / ERA5 reanalysis' : 'Open-Meteo forecast models',
    sourceUrl, license: 'CC BY 4.0', attribution: 'Weather data by Open-Meteo.com. Rainfall drives the BlueLoop hydraulic simulation; not observed township sensor data.',
    township, fetchedAt: new Date().toISOString(), points };
  if (!validateDataset(dataset)) throw new Error('Weather data contains missing, invalid, or non-hourly observations.');
  return dataset;
}
export function parseRainCsv(csv: string, township: TownshipId): RainDataset {
  const lines = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  if (lines.length < 3 || lines.length > 169) throw new Error('Provide 2 to 168 hourly rows.');
  // The schema contains no embedded commas; accept standard CSV quoting on export.
  const cellsFor = (line: string) => line.split(',').map(cell => cell.trim().replace(/^"(.*)"$/, '$1').replaceAll('""', '"'));
  const headers = cellsFor(lines[0]).map(s => s.toLowerCase());
  const ti = headers.indexOf('timestamp');
  const ri = headers.indexOf('rain_mm');
  if (ti < 0 || ri < 0) throw new Error('CSV needs timestamp and rain_mm columns. Use the downloadable template.');
  const points = lines.slice(1).map((line, i) => {
    const cells = cellsFor(line);
    if (!cells[ti] || !/(?:Z|[+-]\d{2}:\d{2})$/.test(cells[ti]) || !cells[ri]) throw new Error(`Row ${i + 2}: supply an ISO timestamp with timezone and rainfall in mm.`);
    return { time: cells[ti], rainMm: Number(cells[ri]) };
  });
  const dataset: RainDataset = { id: `import-${Date.now()}`, name: 'Imported hourly rainfall', kind: 'imported',
    source: 'User-provided CSV', sourceUrl: '', license: 'Provided by uploader',
    attribution: 'Imported rainfall; hydraulic readings are simulated.', township, fetchedAt: new Date().toISOString(), points };
  if (!validateDataset(dataset)) throw new Error('Rows must be consecutive hourly timestamps with rainfall between 0 and 500 mm.');
  return dataset;
}
export function csvCell(value: string | number): string {
  const text = String(value);
  // Protect spreadsheet viewers from formulas in imported names and event text.
  const safe = /^[=+@-]/.test(text) && typeof value === 'string' ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}
export const rainfallTemplate = 'timestamp,rain_mm\n2021-12-17T00:00:00+08:00,0\n2021-12-17T01:00:00+08:00,1.2\n2021-12-17T02:00:00+08:00,5.6\n';
