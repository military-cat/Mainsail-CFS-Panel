const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const fixture=require('./synthetic-printer.json');
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
function browser(lang, mount='cfsail', storage, mainsailLanguage, options = {}) {
  const document={currentScript:{src:'http://localhost/cfsail/cfs-panel.js',dataset:{lang,...options.dataset}},activeElement:null};
  document.createElement=tag=>new Element(tag,document); document.createElementNS=(_,tag)=>document.createElement(tag);
  document.body=document.createElement('body'); document.head=document.createElement('head');
  document.querySelector=selector=>document.body.querySelector(selector); document.querySelectorAll=selector=>document.body.querySelectorAll(selector);
  if (mainsailLanguage) { const app=document.createElement('div');app.id='app';app.__vue__={$store:{state:{gui:{general:{language:mainsailLanguage}}}}};document.body.append(app); }
  const host=document.createElement('div'); host.dataset[mount==='cfsail' ? 'cfsailMount' : 'noyeahCfsMount']=''; document.body.append(host);
  const sockets=[];
  class Socket { static OPEN=1; constructor(url){ this.url=url; this.readyState=1; this.sent=[]; sockets.push(this); } send(data){this.sent.push(data);} close(){} }
  const timers=new Map(); let nextTimer=0;
  const context={document,fetch:options.fetch,AbortController,localStorage:storage,location:{href:'http://localhost/',hostname:'localhost',pathname:'/'},URL,WebSocket:Socket,MutationObserver:class {observe(){} disconnect(){}},setTimeout(fn,ms){const id=++nextTimer;timers.set(id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);},setInterval(){return 1;},clearInterval(){},addEventListener(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/cfs-panel.js'),'utf8'),context);
  const socket=sockets[0]; socket.onopen();
  socket.onmessage({data:JSON.stringify({...fixture,cfsConnect:1,nozzleTemp:25,targetNozzleTemp:0})});
  return {document,host,socket,context,timers};
}

module.exports={browser};
