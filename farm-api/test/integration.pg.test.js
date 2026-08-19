'use strict';
// Integration tests against a REAL, disposable PostgreSQL instance.
//
// Never points at production: it boots its own throwaway cluster in a temp
// directory, creates an empty `farm` schema, and destroys it afterwards.
// Skips cleanly when the optional embedded-postgres dev tool is absent:
//   npm install --no-save embedded-postgres

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://placeholder/placeholder';
process.env.FARM_ADMIN_WRITE_TOKEN = 'local-pg-admin-placeholder';
process.env.FARM_HERMES_WRITE_TOKEN = 'local-pg-hermes-placeholder';
process.env.FARM_AGENT_WRITE_TOKEN = 'local-pg-agent-placeholder';
process.env.FARM_APP_WRITE_TOKEN = 'local-pg-app-placeholder';
process.env.ADMIN_TOKEN = 'local-pg-rpc-admin-placeholder';

const test = require('node:test');
const assert = require('node:assert');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

let EmbeddedPostgres = null;
try {
  const mod = require('embedded-postgres');
  EmbeddedPostgres = mod.default || mod;
} catch (_) { /* optional */ }

const SKIP = EmbeddedPostgres ? false : 'embedded-postgres is not installed; run npm install --no-save embedded-postgres';

const { app, __setPoolForTests } = require('../server');
const { Pool } = require('pg');

const HERMES = process.env.FARM_HERMES_WRITE_TOKEN;
const AGENT = process.env.FARM_AGENT_WRITE_TOKEN;
const APP = process.env.FARM_APP_WRITE_TOKEN;
const RPC_ADMIN = process.env.ADMIN_TOKEN;

const PORT = 54329;
const dataDir = path.join(os.tmpdir(), `farm-api-pgtest-${process.pid}`);

let pg, pool, server, base;

const SCHEMA = `
CREATE SCHEMA IF NOT EXISTS farm;
CREATE TABLE farm.tasks (
  id bigserial PRIMARY KEY, agent_id text, title text NOT NULL,
  description text DEFAULT '', status text NOT NULL DEFAULT 'queued',
  result_summary text DEFAULT '', reject_note text DEFAULT '', result_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz, reviewed_at timestamptz, completed_at timestamptz);
CREATE TABLE farm.agent_events (
  id bigserial PRIMARY KEY, agent_id text, event_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE farm.agent_status (
  agent_id text PRIMARY KEY, status text NOT NULL DEFAULT 'resting',
  current_task text NOT NULL DEFAULT '', quote text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE farm.agent_usage (
  agent_id text PRIMARY KEY, input_tokens bigint DEFAULT 0, output_tokens bigint DEFAULT 0,
  cost_usd numeric DEFAULT 0, last_synced_at timestamptz);
CREATE TABLE farm.chat_messages (
  id bigserial PRIMARY KEY, session_id text NOT NULL, role text NOT NULL,
  content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE farm.agents (
  id text PRIMARY KEY, name text NOT NULL, role text NOT NULL DEFAULT '', tier text NOT NULL DEFAULT '');
CREATE TABLE farm.subscriptions (id bigserial PRIMARY KEY, name text NOT NULL);
`;

test.before(async () => {
  if (SKIP) return;
  fs.rmSync(dataDir, { recursive: true, force: true });
  pg = new EmbeddedPostgres({
    databaseDir: dataDir, user: 'postgres', password: 'postgres',
    port: PORT, persistent: false
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase('farmtest');
  pool = new Pool({ connectionString: `postgres://postgres:postgres@127.0.0.1:${PORT}/farmtest` });
  await pool.query(SCHEMA);
  __setPoolForTests(pool);
  await new Promise(r => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
}, { timeout: 180000 });

test.after(async () => {
  if (server) server.close();
  if (pool) await pool.end().catch(() => {});
  if (pg) await pg.stop().catch(() => {});
  fs.rmSync(dataDir, { recursive: true, force: true });
}, { timeout: 60000 });

async function call(method, path, { cred, body } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (cred) headers.authorization = `Bearer ${cred}`;
  const res = await fetch(base + path, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch (_) {}
  return { status: res.status, json };
}

const count = async table => Number((await pool.query(`SELECT count(*)::int c FROM farm.${table}`)).rows[0].c);
const truncate = async () => pool.query('TRUNCATE farm.tasks, farm.agent_events, farm.agent_status, farm.agent_usage, farm.chat_messages, farm.agents, farm.subscriptions');

test('PG NEGATIVE: unauthenticated writes never reach real Postgres', { skip: SKIP }, async () => {
  await truncate();
  const p = await call('POST', '/rest/v1/tasks', { body: [{ agent_id: 'gatis', title: 'unauth' }] });
  const q = await call('PATCH', '/rest/v1/tasks?id=eq.1', { body: { status: 'done' } });
  const bad = await call('POST', '/rest/v1/tasks', { cred: 'wrong', body: [{ agent_id: 'g', title: 'x' }] });
  const scope = await call('POST', '/rest/v1/tasks', { cred: AGENT, body: [{ agent_id: 'g', title: 'x' }] });
  assert.strictEqual(p.status, 401);
  assert.strictEqual(q.status, 401);
  assert.strictEqual(bad.status, 401);
  assert.strictEqual(scope.status, 403);
  assert.strictEqual(await count('tasks'), 0, 'a rejected request wrote a row to real Postgres');
});

test('PG POSITIVE: authorized Hermes, agent and app writes land in real Postgres', { skip: SKIP }, async () => {
  await truncate();
  const t = await call('POST', '/rest/v1/tasks', {
    cred: HERMES, body: [{ agent_id: 'koderis', title: 'real pg task', status: 'queued' }] });
  assert.strictEqual(t.status, 201);
  assert.strictEqual(await count('tasks'), 1);

  const e = await call('POST', '/rest/v1/agent_events', {
    cred: AGENT, body: [{ agent_id: 'gatis', event_text: 'real pg event' }] });
  assert.strictEqual(e.status, 201);
  assert.strictEqual(await count('agent_events'), 1);

  const c = await call('POST', '/rest/v1/chat_messages', {
    cred: APP, body: [{ session_id: 's', role: 'user', content: 'hi' }] });
  assert.strictEqual(c.status, 201);
  assert.strictEqual(await count('chat_messages'), 1);

  await pool.query("INSERT INTO farm.agent_usage(agent_id) VALUES('gatis')");
  const u = await call('PATCH', '/rest/v1/agent_usage?agent_id=eq.gatis', {
    cred: APP, body: { input_tokens: 42 } });
  assert.strictEqual(u.status, 200);
  const row = await pool.query("SELECT input_tokens FROM farm.agent_usage WHERE agent_id='gatis'");
  assert.strictEqual(Number(row.rows[0].input_tokens), 42);
});

test('PG REGRESSION: reads, RPC and healthz still work against real Postgres', { skip: SKIP }, async () => {
  await truncate();
  await pool.query("INSERT INTO farm.agents(id,name) VALUES('gatis','Gatis')");
  const g = await call('GET', '/rest/v1/agents?select=id,name');
  assert.strictEqual(g.status, 200);
  assert.strictEqual(g.json.length, 1);

  const h = await call('GET', '/healthz');
  assert.strictEqual(h.status, 200);
  assert.strictEqual(h.json.ok, true);

  const rpc = await call('POST', '/rest/v1/rpc/admin_create_task', {
    body: { p_token: RPC_ADMIN, p_agent_id: 'koderis', p_title: 'rpc real task' } });
  assert.strictEqual(rpc.status, 200);
  assert.strictEqual(await count('tasks'), 1);

  const denied = await call('POST', '/rest/v1/rpc/admin_create_task', {
    body: { p_agent_id: 'koderis', p_title: 'no token' } });
  assert.strictEqual(denied.status, 401);
  assert.strictEqual(await count('tasks'), 1);
});

test('PG IDEMPOTENCY: identical authorized retries create no duplicate rows', { skip: SKIP }, async () => {
  await truncate();
  const task = [{ agent_id: 'gatis', title: 'repeat safe', status: 'queued' }];
  const a = await call('POST', '/rest/v1/tasks', { cred: HERMES, body: task });
  const b = await call('POST', '/rest/v1/tasks', { cred: HERMES, body: task });
  assert.strictEqual(a.status, 201);
  assert.strictEqual(b.status, 200);
  assert.strictEqual(a.json[0].id, b.json[0].id);
  assert.strictEqual(await count('tasks'), 1, 'retry duplicated a real task row');

  const ev = [{ agent_id: 'gatis', event_text: 'repeat safe event' }];
  await call('POST', '/rest/v1/agent_events', { cred: AGENT, body: ev });
  await call('POST', '/rest/v1/agent_events', { cred: AGENT, body: ev });
  assert.strictEqual(await count('agent_events'), 1, 'retry duplicated a real event row');

  await call('POST', '/rest/v1/agent_events', {
    cred: AGENT, body: [{ agent_id: 'gatis', event_text: 'a different event' }] });
  assert.strictEqual(await count('agent_events'), 2);
});

test('PG DOCUMENTED RISK: a multi-row POST can write partially', { skip: SKIP }, async () => {
  await truncate();
  // Second row violates NOT NULL on title. The route inserts row by row with no
  // surrounding transaction, so the first row stays committed.
  const r = await call('POST', '/rest/v1/tasks', {
    cred: HERMES,
    body: [{ agent_id: 'gatis', title: 'row one survives' }, { agent_id: 'gatis', description: 'no title' }]
  });
  assert.strictEqual(r.status, 400);
  assert.strictEqual(await count('tasks'), 1, 'expected the documented partial-write behaviour');
});
