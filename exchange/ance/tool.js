#!/usr/bin/env node
/**
 * exchange/ance/tool.js — tiny CLI to drive the Ance two-way channel.
 *
 * Purpose: keep the round-trip low-latency and consistent for both sides.
 * Ance (Etsy + US/CA Amazon worker) and Hermes/Claude both use this folder; this tool
 * just reads/writes the ndjson lines and lists the channel state, so either
 * side (or the owner) can see what is pending.
 *
 * Usage:
 *   node exchange/ance/tool.js list          # pending inbox tasks + outbox results
 *   node exchange/ance/tool.js enqueue <id> "<task>" [deadline]
 *       # append a task line to inbox.ndjson (Hermes -> Ance)
 *   node exchange/ance/tool.js deliver <id> done "<summary>" "<artifact>"
 *       # append a result line to outbox.ndjson (Ance -> Hermes)
 *   node exchange/ance/tool.js context-oneline   # print latest context.md digest
 *
 * Pure file ops, no auth, no network. No money, no publish — safe to run.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const IB = path.join(DIR, 'inbox.ndjson');
const OB = path.join(DIR, 'outbox.ndjson');
const CTX = path.join(DIR, 'context.md');
const now = () => new Date().toISOString();
const read = p => { try { return fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean); } catch (e) { return []; } };
const append = (p, line) => fs.appendFileSync(p, line + '\n', 'utf8');

function show(note, items){ console.log(`--- ${note} (${items.length}) ---`); items.slice(-6).forEach(l => console.log('  ' + l.slice(0, 220))); }
function enqueue(id, task, deadline){
  const rec = { id, at: now(), from: 'herme', to: 'ance', task, context_ref: 'exchange/ance/context.md', expects: '', deadline: deadline || '' };
  append(IB, JSON.stringify(rec)); console.log('queued', id);
}
function deliver(id, status, summary, artifact){
  const rec = { id, at: now(), from: 'ance', to: 'herme', status, summary, artifacts: artifact ? [artifact] : [] };
  append(OB, JSON.stringify(rec)); console.log('delivered', id, status);
}

const [, , cmd, a, b, c, d] = process.argv;
switch (cmd) {
  case 'status': show('inbox (Hermes -> Ance, newest)', read(IB)); show('outbox (Ance -> Hermes)', read(OB)); break;
  case 'enqueue': enqueue(a, b, c); break;
  case 'deliver': deliver(a, b, c, d); break;
  case 'context': show('context.md', [fs.readFileSync(CTX,'utf8').slice(0,400)]); break;
  default: console.log('usage: tool.js status|enqueue|deliver|context'); }