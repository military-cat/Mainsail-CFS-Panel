const {test}=require('node:test');
const assert=require('node:assert/strict');
const {browser}=require('./browser-fixture.cjs');
const fixture=require('./synthetic-printer.json');
const api=require('../assets/cfs-panel.js');
const ready={status:{webhooks:{state:'ready'},print_stats:{state:'paused'},pause_resume:{is_paused:true}}};
const reply=(result,status=200)=>({ok:status<400,status,json:async()=>result});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(fetch,options={}) {
 const calls=[];const b=browser('ko','cfsail',null,null,{...options,fetch:async(url,opts)=>{calls.push({url,opts});return fetch(url,opts);}});
 const push=data=>b.socket.onmessage({data:JSON.stringify(data)});
 push({state:2,feedState:105,err:{key:2865,value:'1D'}});
 return {...b,calls,push,button:()=>b.document.querySelector('.ncfs-recovery-button'),notice:()=>b.document.querySelector('.ncfs-notice')?.textContent||''};
}
test('recovery recognizes known CFS faults without treating arbitrary printer errors as CFS faults',()=>{
 for(const key of [865,2865,836,2836])assert.equal(api.cfsErrorCode({key}),key);
 for(const key of [0,null,'',9999,2507,111])assert.equal(api.cfsErrorCode({key}),null);
});
test('CFS recovery only sends one exact command and requires post-command telemetry for completion',async()=>{
 let accept;const b=setup(async(_,o)=>o.method==='POST'?new Promise(r=>accept=r):reply({result:ready}));
 assert.equal(b.button().hidden,false);assert.equal(b.button().disabled,false);
 const first=b.button().onclick();await tick();b.button().onclick();
 assert.equal(b.calls.length,2);assert.equal(b.calls[0].opts.method,'GET');
 assert.equal(new URL(b.calls[0].url).pathname,'/printer/objects/query');
 assert.equal(new URL(b.calls[1].url).pathname,'/printer/gcode/script');
 assert.deepEqual(JSON.parse(b.calls[1].opts.body),{script:'BOX_ERROR_RESUME_PROCESS'});
 assert.ok(b.button().disabled);
 accept(reply({result:'ok'}));await first;
 assert.match(b.notice(),/명령.*접수/);assert.doesNotMatch(b.notice(),/복구 완료/);
 b.push({boxsInfo:fixture.boxsInfo});assert.doesNotMatch(b.notice(),/복구 완료/);
 b.push({err:{key:0},feedState:0,boxsInfo:fixture.boxsInfo});assert.match(b.notice(),/복구 완료/);
 assert.equal(b.calls.filter(c=>c.opts.method==='POST').length,1);
});
test('normal operation and unrelated faults never show an executable CFS recovery control',()=>{
 const b=setup(async()=>reply({result:ready}));
 for(const key of [0,2507,9999]) {b.push({err:{key}});assert.ok(b.button().disabled);assert.ok(b.button().hidden);}
 assert.equal(b.calls.length,0);
});
test('read-only mode blocks recovery without any HTTP request',async()=>{
 const b=setup(async()=>reply({result:ready}),{dataset:{readOnly:'true'}});
 assert.ok(b.button().disabled);await b.button().onclick();assert.equal(b.calls.length,0);
});
test('Moonraker rejects an actively printing job before any recovery command is sent',async()=>{
 const b=setup(async()=>reply({result:{status:{...ready.status,print_stats:{state:'printing'},pause_resume:{is_paused:false}}}}));
 await b.button().onclick();assert.equal(b.calls.length,1);assert.match(b.notice(),/일시정지/);
});
test('an error cleared during the preflight never sends a recovery command',async()=>{
 let resolve;const b=setup(async()=>new Promise(r=>resolve=r));const attempt=b.button().onclick();
 b.push({err:{key:0}});resolve(reply({result:ready}));await attempt;
 assert.equal(b.calls.length,1);assert.doesNotMatch(b.notice(),/복구 완료/);
});
test('explicit command rejection reports failure and never retries automatically',async()=>{
 const b=setup(async(_,o)=>o.method==='POST'?reply({error:{message:'Mock recovery rejected'}},400):reply({result:ready}));
 await b.button().onclick();assert.match(b.notice(),/Mock recovery rejected/);assert.equal(b.calls.length,2);
 b.push({feedState:105,boxsInfo:fixture.boxsInfo});assert.equal(b.calls.length,2);
});
test('disconnect during preflight prevents POST even if the status reply arrives later',async()=>{
 let resolve;const b=setup(async()=>new Promise(r=>resolve=r));const attempt=b.button().onclick();
 b.socket.onclose();resolve(reply({result:ready}));await attempt;assert.equal(b.calls.length,1);assert.ok(b.button().disabled);
});
test('loss of response after POST keeps the operation uncertain and blocks duplicate execution',async()=>{
 const b=setup(async(_,o)=>{if(o.method==='POST')throw new Error('Mock connection lost');return reply({result:ready});});
 await b.button().onclick();assert.match(b.notice(),/確認|확인/);assert.ok(b.button().disabled);
 await b.button().onclick();assert.equal(b.calls.length,2);
});
test('a missing firmware completion is timed out without replaying the command',async()=>{
 const b=setup(async(_,o)=>reply({result:o.method==='POST'?'ok':ready}));await b.button().onclick();
 const timer=[...b.timers.values()].find(t=>t.ms===90000);assert.ok(timer);timer.fn();
 assert.match(b.notice(),/확인/);assert.ok(b.button().disabled);assert.equal(b.calls.length,2);
});

test('missing, disconnected or incomplete CFS snapshots never confirm recovery',async()=>{
 for(const boxsInfo of [{materialBoxs:[]},{materialBoxs:[{id:1,type:0,state:0,materials:fixture.boxsInfo.materialBoxs[0].materials}]},{materialBoxs:[{id:1,type:0,state:1,materials:[]}]}]) {
  const b=setup(async(_,o)=>reply({result:o.method==='POST'?'ok':ready}));await b.button().onclick();
  b.push({err:{key:0},feedState:0,boxsInfo});assert.doesNotMatch(b.notice(),/복구 완료/);
 }
});
test('a lone clear-error event cannot release an uncertain command lock',async()=>{
 const b=setup(async(_,o)=>{if(o.method==='POST')throw new Error('Mock lost reply');return reply({result:ready});});
 await b.button().onclick();b.push({err:{key:0}});b.push({err:{key:2865}});
 assert.ok(b.button().disabled);await b.button().onclick();assert.equal(b.calls.length,2);
 b.push({err:{key:0},feedState:0,boxsInfo:fixture.boxsInfo});assert.match(b.notice(),/복구 완료/);
});

test('preflight timeout reports that no recovery command was sent and ignores the late reply',async()=>{
 let resolve;const b=setup(async()=>new Promise(r=>resolve=r));const attempt=b.button().onclick();
 [...b.timers.values()].find(t=>t.ms===15000).fn();assert.match(b.notice(),/전송하지 않았/);assert.equal(b.calls.length,1);
 resolve(reply({result:ready}));await attempt;assert.equal(b.calls.length,1);
});
test('POST response timeout stays uncertain even if the late acceptance arrives',async()=>{
 let resolve;const b=setup(async(_,o)=>o.method==='POST'?new Promise(r=>resolve=r):reply({result:ready}));
 const attempt=b.button().onclick();await tick();[...b.timers.values()].find(t=>t.ms===15000).fn();
 assert.ok(b.button().disabled);resolve(reply({result:'ok'}));await attempt;assert.match(b.notice(),/확인/);assert.equal(b.calls.length,2);
});
