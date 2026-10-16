/* SPDX-License-Identifier: GPL-3.0-only
 * Local-only CFSail demonstration. Never forwards data to a printer.
 */
'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const initial = require('./sample.json');
let snapshot = structuredClone(initial), writes = [], motions = [], recoveries = [], recoveryMode = 'success';
let generation = 0;
const peers = new Set();
const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || 8788);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid demo port');
function frame(value, opcode = 1) {
  const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if (data.length < 126) return Buffer.concat([Buffer.from([0x80 | opcode, data.length]), data]);
  const header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 126; header.writeUInt16BE(data.length, 2);
  return Buffer.concat([header, data]);
}
function send(peer, data) { if (!peer.destroyed) peer.write(frame(JSON.stringify(data))); }
function broadcast(data) { for (const peer of peers) send(peer, data); }
function respond(peer, text) {
  let data; try { data = JSON.parse(text); } catch { return; }
  if (data?.method === 'get') {
    if (data.params?.ReqPrinterPara) send(peer, { cfsConnect: snapshot.cfsConnect });
    if (data.params?.boxsInfo) send(peer, { boxsInfo: snapshot.boxsInfo });
    if (data.params?.reqMaterials) send(peer, { retMaterials: snapshot.retMaterials });
    return;
  }
  if (data?.method !== 'set') return;
  if (data.params?.modifyMaterial) {
    const value = data.params.modifyMaterial;
    const box = snapshot.boxsInfo.materialBoxs.find(b => b.id === value.boxId);
    const slot = box?.materials.find(m => m.id === value.id);
    if (!slot) return;
    writes.push(value); Object.assign(slot, value, { state: 1, editStatus: 1 });
    broadcast({ boxsInfo: snapshot.boxsInfo });
  } else if (data.params?.feedInOrOut) {
    const value = data.params.feedInOrOut;
    const box = snapshot.boxsInfo.materialBoxs.find(b => b.id === value.boxId && b.type === 0);
    const slot = box?.materials.find(m => m.id === value.materialId);
    if (!slot || ![0, 1].includes(value.isFeed) || ![0, 3, 14].includes(snapshot.feedState)) return;
    motions.push(value); const oldState = slot.state;
    slot.state = value.isFeed ? 3 : 4; snapshot.feedState = value.isFeed ? 1 : 11;
    broadcast({ feedState: snapshot.feedState, boxsInfo: snapshot.boxsInfo });
    setTimeout(() => {
      snapshot.feedState = value.isFeed ? 2 : 13; broadcast({ feedState: snapshot.feedState });
    }, 500);
    setTimeout(() => {
      if (value.isFeed) for (const b of snapshot.boxsInfo.materialBoxs) for (const m of b.materials) m.selected = 0;
      slot.state = oldState; slot.selected = value.isFeed;
      snapshot.feedState = value.isFeed ? 3 : 14;
      broadcast({ feedState: snapshot.feedState, boxsInfo: snapshot.boxsInfo });
    }, 1400);
  }
}
const files = new Map([['/', 'demo/index.html'], ['/demo/', 'demo/index.html'], ['/assets/cfs-panel.js', 'assets/cfs-panel.js'], ['/assets/cfs.png', 'assets/cfs.png']]);
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/__demo/status') {
    response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ snapshot, writes, motions, recoveries, recoveryMode })); return;
  }
  if (pathname === '/__demo/reset' && request.method === 'POST') {
    generation++; snapshot = structuredClone(initial); writes = []; motions = []; recoveries = []; recoveryMode = 'success';
    broadcast(snapshot); response.end('ok'); return;
  }
  if (pathname === '/__demo/recovery' && request.method === 'POST') {
    let body = ''; request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        const input = JSON.parse(body);
        if (!['success','reject','disconnect','unconfirmed','printing'].includes(input.mode)) throw new Error('Invalid mode');
        const code = input.code ?? 2865;
        if (![2836,2837,2839,2841,2853,2865,2999].includes(code)) throw new Error('Invalid error code');
        generation++; recoveryMode = input.mode;
        snapshot.state = input.mode === 'printing' ? 1 : 2; snapshot.feedState = 105;
        snapshot.err = { key: code, value: code === 2999 ? 'Unmapped simulated printer fault' : '[1,"A"]' };
        snapshot.boxsInfo.materialBoxs.find(b => b.type === 0).materials[0].state = 3;
        broadcast(snapshot); response.end('ok');
      } catch (_) { response.writeHead(400); response.end('Invalid simulation'); }
    }); return;
  }
  if (pathname === '/printer/objects/query' && request.method === 'GET') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ result: { status: { webhooks: { state: 'ready' },
      print_stats: { state: recoveryMode === 'printing' ? 'printing' : 'paused' },
      pause_resume: { is_paused: recoveryMode !== 'printing' } } } })); return;
  }
  if (pathname === '/printer/gcode/script' && request.method === 'POST') {
    let body = ''; request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      response.setHeader('Content-Type', 'application/json');
      let input; try { input = JSON.parse(body); } catch (_) { /* Refuse malformed requests. */ }
      if (input?.script !== 'BOX_ERROR_RESUME_PROCESS' || recoveryMode === 'printing') {
        response.writeHead(400); response.end(JSON.stringify({ error: { message: 'Unsupported mock command or active print' } })); return;
      }
      recoveries.push({ script: input.script });
      if (recoveryMode === 'reject') {
        response.writeHead(400); response.end(JSON.stringify({ error: { message: 'Simulated CFS recovery rejection' } })); return;
      }
      if (recoveryMode === 'disconnect') {
        for (const peer of peers) peer.destroy(); request.socket.destroy(); return;
      }
      response.end(JSON.stringify({ result: 'ok' }));
      if (recoveryMode !== 'success') return;
      const currentGeneration = generation;
      setTimeout(() => {
        if (currentGeneration !== generation) return;
        snapshot.feedState = 106; broadcast({ feedState: 106 });
      }, 300);
      setTimeout(() => {
        if (currentGeneration !== generation) return;
        snapshot.feedState = 0; snapshot.err = { key: 0, value: '' };
        for (const box of snapshot.boxsInfo.materialBoxs) for (const slot of box.materials)
          if ([3,4].includes(slot.state)) slot.state = 1;
        broadcast({ err: snapshot.err, feedState: 0, boxsInfo: snapshot.boxsInfo });
      }, 1800);
    }); return;
  }
  const file = files.get(pathname);
  if (!file) { response.writeHead(404); response.end('Not found'); return; }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };
  response.setHeader('Content-Type', types[path.extname(file)]); response.setHeader('Cache-Control', 'no-store');
  const stream = fs.createReadStream(path.join(root, file));
  stream.on('error', () => { if (!response.headersSent) response.writeHead(503); response.end('Build the panel first.'); });
  stream.pipe(response);
});
server.on('upgrade', (request, peer) => {
  if (request.url !== '/mock-cfs') { peer.destroy(); return; }
  const accept = crypto.createHash('sha1').update(request.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  peer.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  peers.add(peer); let buffer = Buffer.alloc(0);
  peer.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const opcode = buffer[0] & 15; let size = buffer[1] & 127, offset = 2;
      if (size === 126) { if (buffer.length < 4) return; size = buffer.readUInt16BE(2); offset = 4; }
      if (size === 127 || !(buffer[1] & 128) || size > 50000) { peer.destroy(); return; }
      if (buffer.length < offset + 4 + size) return;
      const mask = buffer.subarray(offset, offset + 4); offset += 4;
      const payload = Buffer.from(buffer.subarray(offset, offset + size));
      for (let i = 0; i < size; i++) payload[i] ^= mask[i % 4];
      buffer = buffer.subarray(offset + size);
      if (opcode === 8) { peer.end(); return; }
      if (opcode === 9) peer.write(frame(payload, 10));
      if (opcode === 1) respond(peer, payload.toString());
    }
  });
  peer.on('close', () => peers.delete(peer)); peer.on('error', () => peers.delete(peer));
  send(peer, snapshot);
});
server.listen(port, '127.0.0.1', () => console.log('CFSail demo: http://127.0.0.1:' + port + '/'));
