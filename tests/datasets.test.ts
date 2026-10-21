import assert from 'node:assert/strict';
import { test } from 'node:test';
import { csvCell, normalizeWeather, parseRainCsv, rainfallTemplate, weatherUrl } from '../src/lib/datasets';

test('rainfall CSV round-trips explicit timezones and values', () => {
  const data = parseRainCsv(rainfallTemplate, 'elmina');
  assert.equal(data.points.length, 3); assert.equal(data.points[1].rainMm, 1.2);
  assert.equal(data.kind, 'imported'); assert.equal(data.township, 'elmina');
});
test('exported quoted rainfall CSV can be imported again', () => {
  const original = parseRainCsv(rainfallTemplate, 'elmina');
  const csv = [[csvCell('timestamp'), csvCell('rain_mm')].join(','), ...original.points.map(p => [csvCell(p.time), csvCell(p.rainMm)].join(','))].join('\r\n');
  assert.deepEqual(parseRainCsv(csv, 'elmina').points, original.points);
});
for (const [name, csv] of [
  ['missing column', 'timestamp,precip\n2021-01-01T00:00:00Z,1\n2021-01-01T01:00:00Z,2'],
  ['missing value', 'timestamp,rain_mm\n2021-01-01T00:00:00Z,\n2021-01-01T01:00:00Z,2'],
  ['timezone ambiguity', 'timestamp,rain_mm\n2021-01-01T00:00:00,1\n2021-01-01T01:00:00,2'],
  ['negative rainfall', 'timestamp,rain_mm\n2021-01-01T00:00:00Z,-1\n2021-01-01T01:00:00Z,2'],
  ['gap in series', 'timestamp,rain_mm\n2021-01-01T00:00:00Z,1\n2021-01-01T02:00:00Z,2'],
  ['non-finite rainfall', 'timestamp,rain_mm\n2021-01-01T00:00:00Z,NaN\n2021-01-01T01:00:00Z,2'],
]) test(`CSV rejects ${name}`, () => assert.throws(() => parseRainCsv(csv, 'elmina')));
test('weather normalization preserves rainfall and Malaysia timezone', () => {
  const data = normalizeWeather({ hourly: { time: ['2021-12-17T00:00', '2021-12-17T01:00'], precipitation: [1.2, 0] } }, 'elmina', 'historical', 'https://example.com');
  assert.equal(data.points[0].rainMm, 1.2);
  assert.equal(Date.parse(data.points[0].time), Date.parse('2021-12-16T15:00:00Z'));
  assert.throws(() => normalizeWeather({ hourly: { time: ['2021-12-17T00:00', '2021-12-17T01:00'], precipitation: [null, 0] } }, 'elmina', 'historical', ''));
});
test('fixed provider hosts and Elmina coordinates', () => {
  const historical = new URL(weatherUrl('elmina', 'historical'));
  const forecast = new URL(weatherUrl('elmina', 'forecast'));
  assert.equal(historical.hostname, 'archive-api.open-meteo.com');
  assert.equal(forecast.hostname, 'api.open-meteo.com');
  assert.equal(historical.searchParams.get('models'), 'era5');
  for (const url of [historical, forecast]) {
    assert.equal(url.searchParams.get('latitude'), '3.176');
    assert.equal(url.searchParams.get('longitude'), '101.513');
  }
});
test('CSV output escapes quotes and protects spreadsheet formula cells', () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell(42), '"42"');
});
