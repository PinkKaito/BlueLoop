import assert from 'node:assert/strict';
import { test } from 'node:test';
import { syntheticDataset, rainfallAt } from '../src/lib/simulation';
import { sceneWeather } from '../src/lib/weather';

test('weather follows the same hourly rain input as the water model', () => {
  const data = syntheticDataset('extreme', 'elmina');
  for (const hour of [0, 5.99, 6, 7.25, 8, 10.99, 11, 18])
    assert.equal(sceneWeather(data, hour).rate, rainfallAt(data, hour));
  assert.equal(sceneWeather(data, 8).label, 'Heavy rain');
  assert.equal(
    sceneWeather(syntheticDataset('moderate', 'elmina'), 6).label,
    'Light rain'
  );
});
test('forecast rain does not wet the scene before it falls', () => {
  const data = syntheticDataset('extreme', 'elmina');
  assert.equal(sceneWeather(data, 5.9).wetness, 0);
  assert.equal(sceneWeather(data, 6).wetness, 0);
  assert.ok(sceneWeather(data, 6.5).wetness > 0);
});
test('surfaces stay wet after rain, then dry without changing the rainfall dataset', () => {
  const data = syntheticDataset('heavy', 'elmina');
  const original = JSON.stringify(data);
  const after = sceneWeather(data, 11);
  assert.equal(after.rate, 0);
  assert.ok(after.wetness > 0.9);
  assert.ok(sceneWeather(data, 14).wetness < after.wetness);
  assert.ok(sceneWeather(data, 20).wetness < 0.02);
  assert.equal(JSON.stringify(data), original);
});
test('reconstructed weather is independent of playback history and bounded at extreme inputs', () => {
  const data = syntheticDataset('extreme', 'elmina');
  const expected = sceneWeather(data, 8.75);
  for (let t = 0; t < 18; t += 0.25) sceneWeather(data, t);
  assert.deepEqual(sceneWeather(data, 8.75), expected);
  data.points[8].rainMm = 500;
  const peak = sceneWeather(data, 8.75);
  assert.equal(peak.intensity, 1);
  assert.ok(peak.wetness >= 0 && peak.wetness <= 1);
  assert.equal(
    sceneWeather(syntheticDataset('normal', 'elmina'), 18).wetness,
    0
  );
});
