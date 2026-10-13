const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sourcePath = path.join(__dirname, '..', 'assets', 'cfs-panel.js');
// Before implementation the suite deliberately exercises an empty API.
const api = fs.existsSync(sourcePath) ? require(sourcePath) : {};
const live = require('./synthetic-printer.json');

test('preserves a detected but unconfigured 1D slot as editable, not empty', () => {
  const box = api.normalizeBoxes(live.boxsInfo)[0];
  assert.equal(box.slots[3].status, 'unconfigured');
  assert.equal(box.slots[3].editable, true);
  assert.equal(box.slots[3].label, '1D');
  assert.equal(box.slots[3].color, null);
});

test('uses device IDs rather than the array position and omits the external rack', () => {
  const boxes = api.normalizeBoxes({ materialBoxs: [
    { id: 0, type: 1, materials: [] },
    { id: 2, type: 0, state: 1, temp: 0, humidity: 0,
      materials: [{ id: 3, state: 0, editStatus: 2 }, { id: 0, state: 2, editStatus: 0, type: 'PETG', color: '#0fa7c0c', selected: 1 }] }
  ] });
  assert.equal(boxes.length, 1);
  assert.equal(boxes[0].temp, 0);
  assert.equal(boxes[0].humidity, 0);
  assert.equal(boxes[0].slots[0].label, '2A');
  assert.equal(boxes[0].slots[0].color, '#FA7C0C');
  assert.equal(boxes[0].slots[0].selected, true);
  assert.equal(boxes[0].slots[0].editable, false);
  assert.equal(boxes[0].slots[3].status, 'empty');
  assert.equal(boxes[0].slots[3].editable, false);
});

test('rejects malformed colors instead of emitting invalid printer metadata', () => {
  for (const bad of ['', '#12', 'red', '#ff00ff<script>', '#0xyzxyz']) assert.equal(api.normalizeColor(bad), null);
  assert.equal(api.normalizeColor('#0000000'), '#000000');
  assert.equal(api.normalizeColor('#0ffffff'), '#FFFFFF');
});

test('selects Generic metadata from the current printer, including its PA value', () => {
  const slot = api.normalizeBoxes(live.boxsInfo)[0].slots[3];
  const presets = api.genericPresets(live.retMaterials);
  const petg = presets.find(p => p.name === 'Generic PETG');
  assert.equal(petg.pressure, 0.1);
  assert.deepEqual(api.buildEdit(slot, petg, '#FA7C0C'), {
    method: 'set', params: { modifyMaterial: {
      boxId: 1, id: 3, rfid: '00003', type: 'PETG', vendor: 'Generic',
      name: 'Generic PETG', color: '#0fa7c0c', minTemp: 220 + 1e-8, maxTemp: 270 + 1e-8, pressure: 0.1
    } }
  });
});

test('refuses edits to a real empty slot, an RFID locked slot, or invalid colors', () => {
  const preset = api.genericPresets(live.retMaterials)[0];
  const slot = api.normalizeBoxes(live.boxsInfo)[0].slots[0];
  assert.throws(() => api.buildEdit({ ...slot, editable: false }, preset, '#FFFFFF'), /편집/);
  assert.throws(() => api.buildEdit(slot, preset, 'not-a-color'), /색상/);
  assert.throws(() => api.buildEdit(slot, { ...preset, minTemp: NaN }, '#FFFFFF'), /재질/);
});

test('readback verifies the addressed slot, Generic identity, type, and color', () => {
  const edit = { params: { modifyMaterial: { boxId: 1, id: 3, type: 'PETG', color: '#0ff8800', rfid: '00003', name: 'Generic PETG', vendor: 'Generic' } } };
  const status = { materialBoxs: [{ id: 1, type: 0, state: 1, materials: [
    { id: 3, state: 1, editStatus: 1, type: 'PETG', color: '#0ff8800', rfid: '00003', name: 'Generic PETG', vendor: 'Generic' }
  ] }] };
  assert.equal(api.editConfirmed(status, edit), true);
  assert.equal(api.editConfirmed(live.boxsInfo, edit), false);
  status.materialBoxs[0].materials[0].rfid = '01001';
  assert.equal(api.editConfirmed(status, edit), false);
});

test('color-only saves use the printer primary Generic PLA metadata', () => {
  const slot = api.normalizeBoxes(live.boxsInfo)[0].slots[0];
  const preset = api.genericPresets(live.retMaterials).find(p => p.name === 'Generic PLA');
  const edit = api.buildEdit(slot, preset, '#112233');
  assert.equal(edit.params.modifyMaterial.rfid, '00001');
  assert.equal(edit.params.modifyMaterial.pressure, 0.04);
});

test('serializes temperature limits as decimal JSON numbers accepted by K2 firmware', () => {
  const slot = api.normalizeBoxes(live.boxsInfo)[0].slots[0];
  const preset = api.genericPresets(live.retMaterials).find(p => p.name === 'Generic PETG');
  const edit = api.buildEdit(slot, preset, '#FF9500');
  const wire = JSON.stringify(edit);
  assert.match(wire, /"minTemp":220\.00000001/);
  assert.match(wire, /"maxTemp":270\.00000001/);
  const raw = { ...slot.raw, ...edit.params.modifyMaterial, minTemp: 220, maxTemp: 270 };
  const readback = { materialBoxs: [{ id: 1, type: 0, state: 1, materials: [raw] }] };
  assert.equal(api.editConfirmed(readback, edit), true);
});

test('editing stays blocked until the current connection has printer and feed telemetry', () => {
  const ready = { connected: true, cfsConnected: true, boxConnected: true, editable: true,
    hasPresets: true, readOnly: false, printing: false, busy: false, pending: false,
    stateKnown: true, feedKnown: true };
  assert.equal(api.editingAllowed(ready), true);
  for (const property of ['stateKnown', 'feedKnown', 'connected', 'cfsConnected', 'boxConnected']) {
    assert.equal(api.editingAllowed({ ...ready, [property]: false }), false);
  }
  for (const property of ['readOnly', 'printing', 'busy', 'pending']) {
    assert.equal(api.editingAllowed({ ...ready, [property]: true }), false);
  }
});

test('uses touchscreen material temperature limits when slicer kv values differ', () => {
  const preset = api.genericPresets([{ base: { id: '00015', brand: 'Generic', name: 'Generic PA6-CF', meterialType: 'PA-CF', minTemp: 280, maxTemp: 300 },
    kvParam: { nozzle_temperature_range_low: '240', nozzle_temperature_range_high: '290', pressure_advance: '0.048' } }])[0];
  assert.equal(preset.minTemp, 280);
  assert.equal(preset.maxTemp, 300);
});

test('does not confirm an edit when the printer kept a different PA or temperature', () => {
  const edit = { params: { modifyMaterial: { boxId: 1, id: 0, type: 'PLA', color: '#0ffffff', rfid: '00001', name: 'Generic PLA', vendor: 'Generic', minTemp: 190, maxTemp: 240, pressure: 0.04 } } };
  const info = { materialBoxs: [{ id: 1, type: 0, state: 1, materials: [
    { id: 0, state: 1, editStatus: 1, type: 'PLA', color: '#0ffffff', rfid: '00001', name: 'Generic PLA', vendor: 'Generic', minTemp: 190, maxTemp: 240, pressure: 0.044 }
  ] }] };
  assert.equal(api.editConfirmed(info, edit), false);
  info.materialBoxs[0].materials[0].pressure = 0.04;
  assert.equal(api.editConfirmed(info, edit), true);
  info.materialBoxs[0].materials[0].maxTemp = 220;
  assert.equal(api.editConfirmed(info, edit), false);
});

test('partial telemetry preserves known status but explicit malformed telemetry blocks editing', () => {
  const idle = { stateKnown: true, feedKnown: true, printing: false, busy: false };
  assert.deepEqual(api.updateTelemetry(idle, { nozzleTemp: '30' }), idle);
  const bad = api.updateTelemetry(idle, { state: 'invalid', feedState: null });
  assert.equal(bad.stateKnown, false);
  assert.equal(bad.feedKnown, false);
  assert.equal(api.updateTelemetry(bad, { state: 0, feedState: 0 }).stateKnown, true);
  assert.equal(api.updateTelemetry(idle, { state: 5 }).printing, true);
});

test('script also exports its pure helpers when loaded as a browser script', () => {
  assert.equal(fs.existsSync(sourcePath), true);
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(sourcePath, 'utf8'), context);
  assert.equal(typeof context.globalThis.NoyeahCFS.normalizeBoxes, 'function');
});
