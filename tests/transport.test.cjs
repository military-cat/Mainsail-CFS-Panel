const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../assets/cfs-panel.js');
const live = require('./synthetic-printer.json');
const ready = { connected: true, cfsConnected: true, boxConnected: true, stateKnown: true,
  feedKnown: true, fresh: true, readOnly: false, printing: false, busy: false, pending: false, printerError: false };
const slot = api.normalizeBoxes(live.boxsInfo)[0].slots[0];

test('builds the official LAN feedInOrOut payload with actual box and zero-based slot IDs', () => {
  assert.deepEqual(api.buildTransport({ ...slot, boxId: 3, index: 2 }, 'load'),
    { method: 'set', params: { feedInOrOut: { boxId: 3, materialId: 2, isFeed: 1 } } });
  assert.deepEqual(api.buildTransport({ ...slot, selected: true }, 'unload'),
    { method: 'set', params: { feedInOrOut: { boxId: 1, materialId: 0, isFeed: 0 } } });
  assert.throws(() => api.buildTransport(slot, 'unload'));
  assert.throws(() => api.buildTransport(slot, 'other'));
  assert.throws(() => api.buildTransport({ ...slot, index: 4 }, 'load'));
});
test('RFID locked but configured filament can be loaded; empty or unknown filament cannot', () => {
  assert.equal(api.transportAllowed(ready, { ...slot, editable: false }, 'load'), true);
  for (const change of [{ state: 0 }, { state: 3 }, { status: 'unconfigured' }, { color: null }])
    assert.equal(api.transportAllowed(ready, { ...slot, ...change }, 'load'), false);
  assert.equal(api.transportAllowed(ready, { ...slot, raw: { ...slot.raw, maxTemp: 0 } }, 'load'), false);
});
test('transport blocks stale, disconnected, printing, busy, pending, read-only and error states', () => {
  for (const property of ['connected','cfsConnected','boxConnected','stateKnown','feedKnown','fresh'])
    assert.equal(api.transportAllowed({ ...ready, [property]: false }, slot, 'load'), false, property);
  for (const property of ['readOnly','printing','busy','pending','printerError'])
    assert.equal(api.transportAllowed({ ...ready, [property]: true }, slot, 'load'), false, property);
  assert.equal(api.transportAllowed(ready, slot, 'unload'), false);
  assert.equal(api.transportAllowed(ready, { ...slot, selected: true }, 'unload'), true);
  assert.equal(api.transportAllowed(ready, { ...slot, selected: true }, 'load'), false);
});
test('official terminal feed states 0, 3, 14 are idle; heating and motion are busy', () => {
  for (const feedState of [0,3,14]) assert.equal(api.updateTelemetry({}, { feedState }).busy, false);
  for (const feedState of [1,2,11,12,13,101,107,113]) assert.equal(api.updateTelemetry({}, { feedState }).busy, true);
});
test('materialState delta updates only the addressed slot and preserves absent fields', () => {
  const before = structuredClone(live.boxsInfo);
  const next = api.applyMaterialState(before, { boxId: 1, materialId: 1, selected: 1, state: 2 });
  const slots = api.normalizeBoxes(next)[0].slots;
  assert.equal(slots[1].selected, true);
  assert.equal(slots[1].color, '#FFFFFF');
  assert.equal(slots[0].selected, false);
  assert.equal(api.normalizeBoxes(before)[0].slots[1].selected, false);
  assert.deepEqual(api.applyMaterialState(before, { boxId: 9, materialId: 1, selected: 1 }), before);
});
test('completion requires printer-reported selection and idle state, not sending or merely starting', () => {
  const before = structuredClone(live.boxsInfo);
  const operation = { action: 'load', boxId: 1, index: 0 };
  assert.equal(api.transportConfirmed(before, operation, 0), false);
  const after = api.applyMaterialState(before, { boxId: 1, materialId: 0, selected: 1, state: 1 });
  assert.equal(api.transportConfirmed(after, operation, 3), true);
  assert.equal(api.transportConfirmed(after, operation, 2), false);
  assert.equal(api.transportConfirmed(after, { ...operation, index: 1 }, 3), false);
  assert.equal(api.transportConfirmed(after, { ...operation, action: 'unload' }, 14), false);
  assert.equal(api.transportConfirmed(before, { ...operation, action: 'unload' }, 14), true);
});
test('green outline represents reported loaded filament, never transit, local clicking or stale connection', () => {
  const loaded = { ...slot, selected: true };
  assert.equal(api.isLoaded(loaded, { online: true, fresh: true }), true);
  assert.equal(api.isLoaded(slot, { online: true, fresh: true }), false);
  for (const state of [0,3,4]) assert.equal(api.isLoaded({ ...loaded, state }, { online: true, fresh: true }), false);
  assert.equal(api.isLoaded(loaded, { online: false, fresh: true }), false);
  assert.equal(api.isLoaded(loaded, { online: true, fresh: false }), false);
});
test('K2 sends initial state then only deltas: fresh box replies keep known status usable', () => {
  // Synthetic firmware sequence: ReqPrinterPara does not repeat unchanged state/feedState.
  const status = { connected: true, stateKnown: true, feedKnown: true, lastBoxAt: 120000 };
  assert.equal(api.statusFresh(status, 120001), true);
  assert.equal(api.statusFresh(status, 130001), false);
  for (const key of ['connected','stateKnown','feedKnown'])
    assert.equal(api.statusFresh({ ...status, [key]: false }, 120001), false);
  assert.equal(api.statusFresh({ ...status, lastBoxAt: 0 }, 120001), false);
});
