const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../assets/cfs-panel.js');
const sample=require('./synthetic-printer.json');
const slot=api.normalizeBoxes(sample.boxsInfo)[0].slots[0];
const ready={connected:true,cfsConnected:true,boxConnected:true,stateKnown:true,feedKnown:true,
 fresh:true,readOnly:false,printing:false,busy:false,pending:false,printerError:false,hasPresets:true};
test('status telemetry retains unchanged fields and accepts zero targets and explicit cleared errors',()=>{
 const original={feedState:101,nozzle:180,target:240,error:{key:2864,value:'Feed blocked'}};
 assert.deepEqual(api.updateDisplayTelemetry(original,{bedTemp0:'30'}),original);
 const next=api.updateDisplayTelemetry(original,{nozzleTemp:'190.5',targetNozzleTemp:0,err:{key:0,value:''}});
 assert.equal(next.nozzle,190.5);assert.equal(next.target,0);assert.equal(api.errorText(next.error),'');
});
test('touchscreen initiated activity is displayed without a local pending command',()=>{
 assert.match(api.activityText(sample.boxsInfo,{feedState:101}),/가열/);
 assert.match(api.activityText(sample.boxsInfo,{feedState:112}),/커팅/);
 assert.match(api.activityText(sample.boxsInfo,{feedState:105}),/새 필라멘트/);
 assert.match(api.activityText(sample.boxsInfo,{feedState:107}),/퍼지/);
 assert.match(api.activityText(sample.boxsInfo,{feedState:14}),/언로딩 완료/);
 assert.match(api.activityText(sample.boxsInfo,{feedState:999}),/999/);
});
test('reported transit slot labels activity, without assuming the selected old spool is the target',()=>{
 const info=api.applyMaterialState(sample.boxsInfo,{boxId:1,materialId:2,state:3});
 assert.match(api.activityText(info,{feedState:105}),/1C/);
 assert.doesNotMatch(api.activityText(sample.boxsInfo,{feedState:101}),/1A/);
});
test('temperature display uses actual nozzle and target and does not invent missing readings',()=>{
 assert.equal(api.nozzleText({nozzle:185.4,target:240}),'노즐 185.4 / 240°C');
 assert.match(api.nozzleText({nozzle:29,target:0}),/가열 꺼짐/);
 assert.match(api.nozzleText({nozzle:null,target:null}),/확인 중/);
});
test('action explanation and eligibility agree for load, unload and edit',()=>{
 assert.equal(api.actionReason(ready,slot,'load'),'');
 assert.match(api.actionReason(ready,slot,'unload'),/로딩/);
 assert.match(api.actionReason(ready,{...slot,selected:true},'load'),/이미/);
 assert.equal(api.actionReason(ready,slot,'edit'),'');
 assert.match(api.actionReason(ready,{...slot,editable:false},'edit'),/읽기 전용/);
 assert.match(api.actionReason({...ready,printing:true},slot,'load'),/출력/);
 assert.match(api.actionReason({...ready,busy:true},slot,'load'),/동작/);
 assert.match(api.actionReason({...ready,fresh:false},slot,'load'),/지연/);
 assert.match(api.actionReason({...ready,connected:false},slot,'load'),/연결/);
 assert.match(api.actionReason(ready,{...slot,status:'unconfigured'},'load'),/종류.*색상/);
});
test('printer error retains a precise code and supplied description without interpreting unknown codes',()=>{
 assert.match(api.errorText({key:2864,value:'Filament blocked'}),/2864.*Filament blocked/);
 assert.match(api.errorText({key:2864,value:''}),/2864/);
 assert.equal(api.errorText({key:0}),'');
 assert.match(api.actionReason({...ready,printerError:true,error:{key:2864,value:'Filament blocked'}},slot,'load'),/2864/);
});
test('full material status deltas synchronize metadata while preserving absent fields',()=>{
 const next=api.applyMaterialState(sample.boxsInfo,{boxId:1,materialId:0,color:'#000aaff',type:'PETG',name:'Generic PETG'});
 const updated=api.normalizeBoxes(next)[0].slots[0];
 assert.equal(updated.color,'#00AAFF');assert.equal(updated.type,'PETG');
 assert.equal(updated.raw.minTemp,190);assert.equal(slot.type,'PLA');
});
