const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const fixture = require('./synthetic-printer.json');

// Minimal DOM boundary for the actual browser bundle; sockets never contact a device.
class Element {
  constructor(tag, document) { this.tagName=tag; this.document=document; this.children=[]; this.attributes={}; this.dataset={}; this.style={setProperty(){}}; this.classList={add: cls => this.className=(this.className || '')+' '+cls}; this.textContent=''; }
  append(...nodes) { for (const node of nodes) { node.remove(); node.parentElement=this; this.children.push(node); } }
  prepend(node) { node.remove(); node.parentElement=this; this.children.unshift(node); }
  replaceChildren(...nodes) { this.children.forEach(node=>node.parentElement=null); this.children=[]; this.append(...nodes); }
  remove() { if(this.parentElement) this.parentElement.children=this.parentElement.children.filter(node=>node!==this); this.parentElement=null; }
  setAttribute(key,value) { this.attributes[key]=String(value); }
  getAttribute(key) { return this.attributes[key]; }
  addEventListener() {}
  contains(node) { return this===node || this.children.some(child=>child.contains(node)); }
  focus() { this.document.activeElement=this; }
  all() { return this.children.flatMap(child=>[child,...child.all()]); }
  querySelectorAll(selector) { return this.all().filter(node=>selector.split(',').some(part=>{
    const match=part.trim();
    if(match[0]==='#') return node.id===match.slice(1);
    if(match[0]==='.') return (node.className || '').split(' ').includes(match.slice(1));
    if(match[0]==='[') { const [,name,value]=match.match(/^\[([^=\]]+)(?:="([^"]+)")?\]$/)||[]; const actual=name?.startsWith('data-') ? node.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())] : node.attributes[name]; return actual!==undefined && (value===undefined || String(actual)===value); }
    return node.tagName===match;
  })); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}
function browser(lang, mount='cfsail', storage, mainsailLanguage) {
  const document={currentScript:{src:'http://localhost/cfsail/cfs-panel.js',dataset:{lang}},activeElement:null};
  document.createElement=tag=>new Element(tag,document); document.createElementNS=(_,tag)=>document.createElement(tag);
  document.body=document.createElement('body'); document.head=document.createElement('head');
  document.querySelector=selector=>document.body.querySelector(selector); document.querySelectorAll=selector=>document.body.querySelectorAll(selector);
  if (mainsailLanguage) { const app=document.createElement('div');app.id='app';app.__vue__={$store:{state:{gui:{general:{language:mainsailLanguage}}}}};document.body.append(app); }
  const host=document.createElement('div'); host.dataset[mount==='cfsail' ? 'cfsailMount' : 'noyeahCfsMount']=''; document.body.append(host);
  const sockets=[];
  class Socket { static OPEN=1; constructor(url){ this.url=url; this.readyState=1; this.sent=[]; sockets.push(this); } send(data){this.sent.push(data);} close(){} }
  const context={document,localStorage:storage,location:{href:'http://localhost/',hostname:'localhost',pathname:'/'},URL,WebSocket:Socket,MutationObserver:class {observe(){} disconnect(){}},setTimeout(){return 1;},clearTimeout(){},setInterval(){return 1;},clearInterval(){},addEventListener(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/cfs-panel.js'),'utf8'),context);
  const socket=sockets[0]; socket.onopen();
  socket.onmessage({data:JSON.stringify({...fixture,cfsConnect:1,nozzleTemp:25,targetNozzleTemp:0})});
  return {document,host,socket,context};
}
for (const lang of ['en','ko','ja','zh','es']) test(`actual ${lang} UI localizes dialogs, ARIA, feedback and keeps wire values`,()=>{
  const {document,host,socket}=browser(lang);
  const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../locales/panel',lang+'.json')));
  const panel=host.querySelector('#noyeah-cfs-panel'); assert.ok(panel);
  assert.equal(panel.lang,lang==='zh' ? 'zh-Hans' : lang);
  assert.equal(panel.getAttribute('aria-label'),catalog['aria.panel']);
  assert.equal(panel.querySelector('.ncfs-source-tabs').getAttribute('aria-label'),catalog['aria.sources']);
  assert.ok(panel.querySelector('[data-slot-key="1:0"]').getAttribute('aria-label').includes(catalog['slot.manual']));
  panel.querySelector('[data-source-id="0"]').onclick();
  assert.ok(panel.querySelector('.ncfs-ext-title').textContent===catalog['external.title']);
  assert.equal(panel.querySelector('.ncfs-ext-action').textContent,catalog['action.edit']);
  panel.querySelector('[data-source-id="1"]').onclick();
  panel.querySelector('[data-slot-key="1:0"]').onclick();
  assert.equal(document.querySelector('.ncfs-load').textContent,catalog['action.load']);
  document.querySelector('.ncfs-edit').onclick();
  assert.equal(document.querySelector('form').lang,lang==='zh' ? 'zh-Hans' : lang);
  assert.equal(document.querySelector('.ncfs-save').textContent,catalog['action.save']);
  const select=document.querySelector('#ncfs-material-type'); assert.equal(select.value,'PLA');
  const form=document.querySelector('form'); form.onsubmit({preventDefault(){}});
  const sent=JSON.parse(socket.sent.at(-1)); assert.equal(sent.params.modifyMaterial.name,'Generic PLA');
  assert.equal(sent.params.modifyMaterial.type,'PLA');
  assert.ok(document.querySelector('.ncfs-notice').textContent.includes('1A'));
  assert.doesNotMatch(document.querySelector('.ncfs-notice').textContent,/\{slot\}/);
});

test('panel language menu updates the live external view and future dialogs without printer writes',()=>{
  const saved = new Map();
  const storage = {getItem:key=>saved.get(key) || null,setItem:(key,value)=>saved.set(key,value)};
  const {document,host,socket}=browser('ko','cfsail',storage);
  const info = structuredClone(fixture.boxsInfo);
  info.materialBoxs.push({id:0,type:1,state:0,materials:[{
    ...info.materialBoxs[0].materials[0],id:0,state:1,editStatus:1,selected:0
  }]});
  socket.onmessage({data:JSON.stringify({boxsInfo:info})});
  let panel=host.querySelector('#noyeah-cfs-panel');
  panel.querySelector('[data-source-id="0"]').onclick();
  const select=panel.querySelector('#ncfs-language');
  assert.ok(select,'Language menu must be available on the panel');
  assert.equal(select.value,'auto');
  assert.equal(select.children.length,6);
  const sent=JSON.stringify(socket.sent);
  select.value='ja'; select.onchange();
  assert.equal(panel.lang,'ja');
  assert.equal(panel.getAttribute('aria-label'),'CFSail · CFSフィラメント管理');
  assert.equal(panel.querySelector('.ncfs-ext-title').textContent,'Ext.');
  assert.equal(saved.get('cfsail.languageMode'),'ja');
  assert.equal(JSON.stringify(socket.sent),sent,'Language selection must not send commands');
  socket.onmessage({data:JSON.stringify({nozzleTemp:31})});
  assert.equal(panel.querySelector('#ncfs-language'),select,'Telemetry must not recreate the open language menu');
  panel.querySelector('.ncfs-ext-action').onclick();
  assert.equal(document.querySelector('form').lang,'ja');
  assert.equal(document.querySelector('.ncfs-save').textContent,'保存');
  const reloaded=browser('ko','cfsail',storage);
  assert.equal(reloaded.host.querySelector('#noyeah-cfs-panel').lang,'ja','Saved choice takes priority over installer default');
});

test('default follows Mainsail changes, manual choice overrides them, and auto resumes synchronization',()=>{
  const saved=new Map([['cfsail.language','ko']]);
  const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
  const {document,host,socket}=browser('ko','cfsail',storage,'en');
  const panel=host.querySelector('#noyeah-cfs-panel');
  const select=panel.querySelector('#ncfs-language');
  assert.equal(select.value,'auto'); assert.equal(panel.lang,'en');
  const general=document.querySelector('#app').__vue__.$store.state.gui.general;
  general.language='ja'; socket.onmessage({data:JSON.stringify({nozzleTemp:32})});
  assert.equal(panel.lang,'ja');
  const sent=JSON.stringify(socket.sent);
  select.value='es';select.onchange();general.language='ko';
  socket.onmessage({data:JSON.stringify({nozzleTemp:33})});
  assert.equal(panel.lang,'es');
  select.value='auto';select.onchange();assert.equal(panel.lang,'ko');
  assert.equal(saved.get('cfsail.languageMode'),'auto');
  general.language='de';socket.onmessage({data:JSON.stringify({nozzleTemp:34})});
  assert.equal(panel.lang,'en');
  assert.equal(JSON.stringify(socket.sent),sent,'Sync must only read Mainsail language');
});

test('invalid or blocked browser storage does not prevent panel startup or language changes',()=>{
  for(const storage of [
    {getItem:()=> 'invalid',setItem(){}},
    {getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}}
  ]) {
    const {host}=browser('ko','cfsail',storage);
    const panel=host.querySelector('#noyeah-cfs-panel');
    assert.equal(panel.lang,'ko');
    const select=panel.querySelector('#ncfs-language');
    assert.ok(select);
    select.value='es'; select.onchange();
    assert.equal(panel.lang,'es');
  }
});
test('legacy mount remains compatible and unknown script language uses English',()=>{
  const {host}=browser('fr','legacy');
  assert.equal(host.querySelector('#noyeah-cfs-panel').getAttribute('aria-label'),'CFSail · CFS filament management');
});
for (const lang of ['en','ko','ja','zh','es']) test(`${lang} transport waits for readback and preserves supplied errors`,()=>{
  const {document,host,socket}=browser(lang);
  const panel=host.querySelector('#noyeah-cfs-panel');
  const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'../locales/panel',lang+'.json')));
  panel.querySelector('[data-slot-key="1:0"]').onclick();
  document.querySelector('.ncfs-load').onclick();
  assert.deepEqual(JSON.parse(socket.sent.at(-1)),{method:'set',params:{feedInOrOut:{boxId:1,materialId:0,isFeed:1}}});
  assert.equal(panel.querySelector('.ncfs-notice').textContent,catalog['transport.load.sent'].replace('{slot}','1A'));
  socket.onmessage({data:JSON.stringify({feedState:101})});
  assert.equal(panel.querySelector('.ncfs-activity').textContent,catalog['stage.target'].replace('{slot}','1A').replace('{stage}',catalog['stage.load.heat']));
  const status=structuredClone(fixture.boxsInfo); status.materialBoxs[0].materials[0].selected=1;
  socket.onmessage({data:JSON.stringify({boxsInfo:status,feedState:3})});
  assert.equal(panel.querySelector('.ncfs-notice').textContent,catalog['transport.load.done'].replace('{slot}','1A'));
  assert.ok(panel.querySelector('[data-slot-key="1:0"]').getAttribute('aria-label').includes(catalog['slot.loaded']));
  socket.onmessage({data:JSON.stringify({err:{key:2864,value:'Device 原文'}})});
  assert.equal(panel.querySelector('.ncfs-live-status').children[2].textContent,catalog['error.printer.detail'].replace('{code}','2864').replace('{detail}','Device 原文'));
});
