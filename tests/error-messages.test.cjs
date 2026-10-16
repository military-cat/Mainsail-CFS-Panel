const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../assets/cfs-panel.js');
const {browser}=require('./browser-fixture.cjs');
const sample=require('./synthetic-printer.json');
const codes=[2831,2832,2833,2834,2835,2836,2837,2838,2839,2840,2841,2843,2844,2846,2847,2848,2849,2850,2851,2852,2853,2854,2855,2856,2857,2858,2859,2860,2861,2862,2863,2864,2865];
test('known K2 error codes distinguish the reported filament-path locations',()=>{
 api.setLanguage('ko');
 assert.match(api.errorText({key:2835}),/로더.*허브/);
 assert.match(api.errorText({key:2836}),/허브.*익스트루더.*센서/);
 assert.match(api.errorText({key:2837}),/센서.*기어/);
 assert.match(api.errorText({key:2839}),/소진.*교체/);
 assert.match(api.errorText({key:2841}),/커터/);
 assert.match(api.errorText({key:2853}),/온습도.*센서/);
 assert.match(api.errorText({key:2865}),/익스트루더.*빠져나오지/);
});
test('all documented CFS codes have localized guidance while preserving the exact code and raw report',()=>{
 for(const lang of ['en','ko','ja','zh','es']) {
  api.setLanguage(lang);
  for(const key of codes) {
   const text=api.errorText({key,value:'[1,"D"]'});
   assert.ok(text.includes(String(key)) && text.includes('[1,"D"]'));
   assert.ok(text.includes(api.t('error.cfs.'+key)),lang+':'+key);
   assert.ok(!text.includes('undefined'));
  }
 }
 api.setLanguage('ko');
});
test('unknown and legacy codes keep raw fallback without borrowing a current-code diagnosis',()=>{
 api.setLanguage('ko');
 assert.equal(api.errorText({key:2999,value:'Unmapped 原文'}),'프린터 오류 2999 · Unmapped 原文');
 assert.equal(api.errorText({key:836,value:'Legacy raw'}),'프린터 오류 836 · Legacy raw');
 assert.match(api.errorText({key:2999}),/프린터 화면/);
 assert.equal(api.errorText({key:0,value:'unused'}),'');
 assert.equal(api.errorText(null),'');
});
test('touchscreen errors update the local panel as text and clear only on an explicit zero error',()=>{
 const b=browser('ko'); b.socket.onopen();
 const push=data=>b.socket.onmessage({data:JSON.stringify(data)});
 push({...sample,state:2,feedState:105,cfsConnect:1});
 push({err:{key:2836,value:'<img src=x onerror=bad>'}});
 const fault=b.document.querySelector('.ncfs-live-status').querySelector('.error');
 assert.match(fault.textContent,/2836.*허브/);
 assert.ok(fault.textContent.includes('<img src=x onerror=bad>'));
 assert.equal(fault.children.length,0);
 push({nozzleTemp:30}); assert.match(fault.textContent,/2836/);
 push({err:{key:2839}}); assert.match(fault.textContent,/소진/);
 push({err:{key:0}}); assert.equal(fault.textContent,'');
});
