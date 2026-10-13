const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../assets/cfs-panel.js');
const live = require('./synthetic-printer.json');
const preset = api.genericPresets(live.retMaterials).find(p => p.name === 'Generic PETG');
const external = { id: 0, type: 1, state: 0, materials: [{ id: 0, state: 1, selected: 0, editStatus: 2 }] };
const ready = { connected: true, cfsConnected: false, boxConnected: true, stateKnown: true,
  feedKnown: true, fresh: true, hasPresets: true };

test('external spool is a single real slot independent of CFS enclosure state', () => {
  const sources = api.normalizeSources({ materialBoxs: [external, { id: 3, type: 0, state: 1 }] });
  assert.deepEqual(sources.map(s => s.id), [3, 0]);
  const ext = sources[1];
  assert.equal(ext.kind, 'external');
  assert.equal(ext.connected, true);
  assert.equal(ext.slots.length, 1);
  assert.equal(ext.slots[0].label, 'Ext.');
  assert.equal(ext.slots[0].editable, true);
  assert.equal(ext.slots[0].status, 'unconfigured');
});

test('missing external slot is not fabricated as editable or present', () => {
  assert.equal(api.normalizeSources({ materialBoxs: [] }).length, 0);
  const ext = api.normalizeSources({ materialBoxs: [{ ...external, materials: [] }] })[0];
  assert.equal(ext.slots[0].editable, false);
  assert.equal(ext.slots[0].state, 0);
});

test('malformed external device or material IDs cannot create a writable box zero address', () => {
  for (const id of [null, '', undefined]) {
    assert.equal(api.normalizeSources({ materialBoxs: [{ ...external, id }] }).length, 0);
    const box = { ...external, materials: [{ ...external.materials[0], id }] };
    assert.equal(api.normalizeSources({ materialBoxs: [box] })[0].slots[0].editable, false);
  }
  const box = { ...external, materials: [{ id: null, state: 2, editStatus: 0 }, ...external.materials] };
  assert.equal(api.normalizeSources({ materialBoxs: [box] })[0].slots[0].editable, true);
});

test('external edits address only box zero slot zero and confirm printer readback', () => {
  const slot = api.normalizeSources({ materialBoxs: [external] })[0].slots[0];
  const edit = api.buildEdit(slot, preset, '#FF8800');
  assert.equal(edit.params.modifyMaterial.boxId, 0);
  assert.equal(edit.params.modifyMaterial.id, 0);
  assert.equal(edit.params.modifyMaterial.rfid, '00003');
  const info = { materialBoxs: [{ ...external, materials: [{ ...external.materials[0], ...edit.params.modifyMaterial, editStatus: 1 }] }] };
  assert.equal(api.editConfirmed(info, edit), true);
  info.materialBoxs[0].materials[0].color = '#0112233';
  assert.equal(api.editConfirmed(info, edit), false);
  assert.throws(() => api.buildEdit({ ...slot, index: 1 }, preset, '#FF8800'));
  assert.throws(() => api.buildEdit({ ...slot, kind: 'cfs' }, preset, '#FF8800'));
});

test('external editing works without CFS but still blocks printing, stale status and locked metadata', () => {
  const slot = api.normalizeSources({ materialBoxs: [external] })[0].slots[0];
  assert.equal(api.actionReason(ready, slot, 'edit'), '');
  for (const change of [{ printing: true }, { fresh: false }, { connected: false }, { busy: true }])
    assert.notEqual(api.actionReason({ ...ready, ...change }, slot, 'edit'), '');
  assert.match(api.actionReason(ready, { ...slot, editable: false }, 'edit'), /읽기 전용/);
});

test('external panel does not reuse automatic CFS transport commands', () => {
  const slot = api.normalizeSources({ materialBoxs: [external] })[0].slots[0];
  assert.notEqual(api.actionReason(ready, slot, 'load'), '');
  assert.equal(api.transportAllowed(ready, slot, 'load'), false);
  assert.throws(() => api.buildTransport(slot, 'load'));
});

test('external touchscreen metadata changes are merged into the addressed source', () => {
  const info = { materialBoxs: [external] };
  const result = api.applyMaterialState(info, { boxId: 0, materialId: 0, type: 'PETG', color: '#000aaff', selected: 1, editStatus: 1 });
  const slot = api.normalizeSources(result)[0].slots[0];
  assert.equal(slot.type, 'PETG');
  assert.equal(slot.color, '#00AAFF');
  assert.equal(slot.selected, true);
});
