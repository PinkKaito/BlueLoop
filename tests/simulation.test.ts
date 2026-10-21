import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { advance, approve, gateInterlock, initialSimulation, project, SCENARIOS, ScenarioId, SITES, syntheticDataset, validateDataset, waterBalanceError } from '../src/lib/simulation';
import { createSession, validateSession } from '../src/lib/session';

for (const site of Object.values(SITES)) {
  for (const scenario of Object.keys(SCENARIOS) as ScenarioId[]) {
    test(`${site.id}/${scenario}: conserve water and enforce storage limits throughout the run`, () => {
      const dataset = syntheticDataset(scenario, site.id);
      let state = { ...initialSimulation(site, scenario), automatic: true, canalEnabled: true };
      for (let i = 0; i < dataset.points.length * 4; i++) {
        state = advance(state, site, dataset, 0.25);
        assert.ok(Math.abs(waterBalanceError(state)) < 1e-5);
        assert.ok(state.pond >= 0 && state.pond <= site.pondCapacity);
        assert.ok(state.tank >= 0 && state.tank <= site.tankCapacity * .95 + 1e-6);
        assert.ok(state.soil >= 0 && state.soil <= 100);
      }
      assert.equal(state.hour, dataset.points.length);
      assert.equal(state.transferFlow, 0);
      assert.equal(state.canalFlow, 0);
      if (scenario === 'extreme') assert.ok(state.overflow > 0, 'An extreme storm must not receive manufactured success');
      if (scenario === 'normal') { assert.equal(state.irrigated, 0); assert.equal(state.transferred, 0); }
    });
  }
  test(`${site.id}: bundled historical replay is valid and balances after 72h`, () => {
    const dataset = JSON.parse(readFileSync(new URL(`../public/data/${site.id}-dec2021.json`, import.meta.url), 'utf8'));
    assert.ok(validateDataset(dataset));
    const state = advance({ ...initialSimulation(site, 'heavy'), automatic: true, canalEnabled: true }, site, dataset, 72);
    assert.ok(Math.abs(waterBalanceError(state)) < 1e-5);
    assert.equal(state.hour, 72);
    assert.ok(validateSession({ ...createSession(site.id, 'heavy'), dataset, simulation: state }));
  });
}
const site = SITES.elmina;
const rain = syntheticDataset('heavy', 'elmina');
test('supervised mode never actuates before approval', () => {
  const state = advance(initialSimulation(site, 'heavy'), site, rain, 4);
  assert.equal(state.transferred, 0); assert.equal(state.canalReleased, 0); assert.equal(state.irrigated, 0);
  const approved = advance(approve(state), site, rain, 1);
  assert.ok(approved.transferred > 0); assert.ok(approved.irrigated > 0);
});
test('heavy rain closes the external gate even when release is authorized', () => {
  const before = advance({ ...approve(initialSimulation(site, 'heavy')), canalEnabled: true }, site, rain, 6);
  assert.match(gateInterlock(before, rain)!, /Heavy rain/);
  const during = advance(before, site, rain, 3);
  assert.equal(during.canalFlow, 0); assert.equal(during.canalReleased, before.canalReleased);
});
test('blocked downstream canal preserves internal reuse', () => {
  const state = advance({ ...approve(initialSimulation(site, 'heavy')), fault: 'canal-blocked', canalEnabled: true }, site, rain, 1);
  assert.equal(state.canalReleased, 0); assert.ok(state.transferred > 0); assert.ok(state.irrigated > 0);
});
for (const fault of ['sensor-offline', 'actuator-failure'] as const) {
  test(`${fault}: fail-safe stops controlled flows while rainfall continues`, () => {
    const base = { ...approve(initialSimulation(site, 'heavy')), fault, canalEnabled: true };
    const state = advance(base, site, rain, 9);
    assert.equal(state.transferred, 0); assert.equal(state.canalReleased, 0); assert.equal(state.irrigated, 0);
    assert.ok(state.rainInflow > 0); assert.ok(Math.abs(waterBalanceError(state)) < 1e-5);
  });
}
test('emergency stop blocks automatic approval and all controlled flows', () => {
  const state = advance({ ...initialSimulation(site, 'heavy'), automatic: true, emergencyStop: true, canalEnabled: true }, site, rain, 10);
  assert.equal(state.approved, false); assert.equal(state.transferred, 0); assert.equal(state.canalReleased, 0);
  assert.ok(state.rainInflow > 0);
});
test('repeated playback and large time jumps produce consistent physical outcomes', () => {
  const initial = { ...approve(initialSimulation(site, 'heavy')), canalEnabled: true };
  const jumped = advance(initial, site, rain, 18);
  let replayed = initial;
  for (let i = 0; i < 180; i++) replayed = advance(replayed, site, rain, .1);
  for (const key of ['pond', 'tank', 'rainInflow', 'irrigated', 'canalReleased', 'overflow'] as const) assert.ok(Math.abs(jumped[key] - replayed[key]) < 1e-5, `${key} depends on playback speed: ${jumped[key]} vs ${replayed[key]}`);
});
test('forecasts show overflow demand without mutating the actual run', () => {
  const state = initialSimulation(site, 'heavy');
  const before = JSON.stringify(state);
  const forecast = project(state, site, rain);
  assert.equal(JSON.stringify(state), before);
  assert.ok(Math.max(...forecast.map(p => p.unmanaged)) > 100);
  assert.equal(forecast[0].unmanaged, 78);
});
test('session restore rejects non-finite, out-of-balance, or invalid data', () => {
  const valid = createSession('elmina', 'heavy'); assert.ok(validateSession(valid));
  assert.equal(validateSession({ ...valid, simulation: { ...valid.simulation, pond: NaN } }), false);
  assert.equal(validateSession({ ...valid, simulation: { ...valid.simulation, pond: 500 } }), false);
  assert.equal(validateSession({ ...valid, dataset: { ...valid.dataset, points: [] } }), false);
  assert.equal(validateSession({ ...valid, township: 'unsupported-township' }), false);
  assert.equal(validateDataset({ ...valid.dataset, township: 'unsupported-township' }), false);
});
