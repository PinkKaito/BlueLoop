import assert from 'node:assert/strict';
import { test } from 'node:test';
import { NextRequest } from 'next/server';
import { GET } from '../src/app/api/weather/route';

for (const query of [
  'township=unknown', 'mode=unknown', 'mode=historical&start=2021-02-30&end=2021-03-01',
  'mode=historical&start=2021-01-10&end=2021-01-01',
  'mode=historical&start=2021-01-01&end=2021-02-01',
  'mode=historical&start=2099-01-01&end=2099-01-02',
]) test(`API rejects invalid query: ${query}`, async () => {
  const response = await GET(new NextRequest(`http://localhost/api/weather?${query}`));
  assert.equal(response.status, 400);
});
test('weather service failure returns an actionable error and does not fabricate data', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response('unavailable', { status: 503 });
  const response = await GET(new NextRequest('http://localhost/api/weather?township=elmina&mode=forecast'));
  assert.equal(response.status, 502);
  assert.match((await response.json()).error, /offline rainfall replay/);
});
test('weather service results are validated, attributed, and timestamped', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => Response.json({ hourly: { time: ['2021-12-17T00:00', '2021-12-17T01:00'], precipitation: [1, 2] } });
  const response = await GET(new NextRequest('http://localhost/api/weather?township=elmina&mode=forecast'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.township, 'elmina'); assert.equal(body.points[0].rainMm, 1);
  assert.equal(body.points[0].time, '2021-12-16T15:00:00.000Z');
  assert.equal(body.license, 'CC BY 4.0');
});
