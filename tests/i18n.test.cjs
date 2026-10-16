const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bundle = path.join(__dirname, '../assets/cfs-panel.js');
const api = fs.existsSync(bundle) ? require(bundle) : {};

test('language aliases and unknown values resolve to complete supported catalogs', () => {
  assert.equal(typeof api.setLanguage, 'function');
  for (const [input, expected] of [['ko-KR','ko'],['JA_jp','ja'],['zh-CN','zh'],['zh-Hans','zh'],['es-MX','es'],['en-US','en'],['fr','en'],['','en']]) {
    assert.equal(api.setLanguage(input), expected);
  }
});
test('all five catalogs have identical keys and named interpolation arguments', () => {
  assert.equal(fs.existsSync(path.join(__dirname, '../locales/panel/en.json')), true);
  const catalogs = ['en','ko','ja','zh','es'].map(lang => JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/panel/', lang + '.json'))));
  const placeholders = value => [...value.matchAll(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g)].map(m => m[1]).sort();
  for (const catalog of catalogs) {
    assert.deepEqual(Object.keys(catalog).sort(), Object.keys(catalogs[0]).sort());
    for (const [key, value] of Object.entries(catalog)) {
      assert.equal(typeof value, 'string'); assert.ok(value.trim(), key);
      assert.deepEqual(placeholders(value), placeholders(catalogs[0][key]), key);
    }
  }
});
test('missing keys and parameters fail explicitly rather than leaking text into UI', () => {
  assert.equal(typeof api.t, 'function');
  assert.throws(() => api.t('missing.key'), /translation/i);
  assert.throws(() => api.t('error.printer.detail'), /parameter/i);
});
test('browser defaults to English and exposes preferred API with compatibility alias', () => {
  assert.equal(fs.existsSync(bundle), true);
  const context = {globalThis: {}};
  vm.runInNewContext(fs.readFileSync(bundle, 'utf8'), context);
  assert.equal(context.globalThis.CFSail, context.globalThis.NoyeahCFS);
  assert.equal(context.globalThis.CFSail.nozzleText({nozzle:20,target:0}), 'Nozzle 20°C · Heating off');
});
test('localized errors keep printer descriptions and codes verbatim', () => {
  assert.equal(typeof api.setLanguage, 'function');
  for (const lang of ['en','ko','ja','zh','es']) {
    api.setLanguage(lang);
    const report=api.errorText({key:2864,value:'Original 原文 <b>'});
    assert.ok(report.includes('2864') && report.includes('Original 原文 <b>'));
    assert.equal(api.errorText({key:0,value:'unused'}), '');
    assert.throws(() => api.buildEdit({}, {}, '#000000'), err => !!err.message && !err.message.includes('undefined'));
  }
  api.setLanguage('ko');
});
test('language cannot change official wire payloads or transport guards', () => {
  assert.equal(typeof api.setLanguage, 'function');
  const slot = {editable:true, boxId:1,index:0,state:1,type:'PLA',color:'#FFFFFF',status:'manual',selected:false,raw:{minTemp:190,maxTemp:240}};
  const preset = {id:'00001',type:'PLA',name:'Generic PLA',vendor:'Generic',minTemp:190,maxTemp:240,pressure:0.04};
  for (const lang of ['en','ko','ja','zh','es']) {
    api.setLanguage(lang);
    assert.deepEqual(api.buildTransport(slot,'load'), {method:'set',params:{feedInOrOut:{boxId:1,materialId:0,isFeed:1}}});
    assert.deepEqual(api.buildEdit(slot,preset,'#123456'), {method:'set',params:{modifyMaterial:{boxId:1,id:0,rfid:'00001',type:'PLA',vendor:'Generic',name:'Generic PLA',color:'#0123456',minTemp:190.00000001,maxTemp:240.00000001,pressure:0.04}}});
    assert.equal(api.transportAllowed({connected:false},slot,'load'),false);
  }
  api.setLanguage('ko');
});
