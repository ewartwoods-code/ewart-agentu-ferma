'use strict';
// Local security tests for the scoped write credentials on farm-api.
// All credential strings below are throwaway local fixtures, not real values.

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://local-test/local-test';
process.env.FARM_ADMIN_WRITE_TOKEN = 'local-test-admin-scope-placeholder';
process.env.FARM_HERMES_WRITE_TOKEN = 'local-test-hermes-scope-placeholder';
process.env.FARM_AGENT_WRITE_TOKEN = 'local-test-agent-scope-placeholder';
process.env.ADMIN_TOKEN = 'local-test-rpc-admin-placeholder';
process.env.FARM_APP_WRITE_TOKEN = 'local-test-app-scope-placeholder';

const test = require('node:test');
const assert = require('node:assert');
const { app, __setPoolForTests } = require('../server');
const { makeFakePool } = require('./fake-pool');

const ADMIN = process.env.FARM_ADMIN_WRITE_TOKEN;
const HERMES = process.env.FARM_HERMES_WRITE_TOKEN;
const AGENT = process.env.FARM_AGENT_WRITE_TOKEN;
const RPC_ADMIN = process.env.ADMIN_TOKEN;

const pool = makeFakePool();
__setPoolForTests(pool);

let server, base;
test.before(async () => {
  await new Promise(resolve => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server && server.close());

async function call(method, path, { cred, body, headers } = {}) {
  const h = { 'content-type': 'application/json', ...(headers || {}) };
  if (cred) h.authorization = `Bearer ${cred}`;
  const res = await fetch(base + path, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  return { status: res.status, json, headers: res.headers };
}

// ---------------------------------------------------------------- NEGATIVE --
test('NEGATIVE: unauthenticated POST is rejected before any database access', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/tasks', { body: [{ agent_id: 'gatis', title: 'x', status: 'queued' }] });
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403, got ${r.status}`);
  assert.strictEqual(pool.calls.length, 0, 'database was touched on a rejected request');
  assert.strictEqual(pool.store.tasks.length, 0);
});

test('NEGATIVE: unauthenticated PATCH is rejected before any database access', async () => {
  pool.reset();
  const r = await call('PATCH', '/rest/v1/tasks?id=eq.1', { body: { status: 'done' } });
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403, got ${r.status}`);
  assert.strictEqual(pool.calls.length, 0);
});

test('NEGATIVE: an invalid credential is rejected on every mutating route', async () => {
  pool.reset();
  for (const [method, path, body] of [
    ['POST', '/rest/v1/tasks', [{ agent_id: 'gatis', title: 'x' }]],
    ['PATCH', '/rest/v1/agents?id=eq.gatis', { name: 'x' }]
  ]) {
    const r = await call(method, path, { cred: 'not-a-valid-credential', body });
    assert.strictEqual(r.status, 401, `${method} ${path} -> ${r.status}`);
  }
  assert.strictEqual(pool.calls.length, 0);
});

test('NEGATIVE: x-api-key carrying an invalid credential is rejected', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/tasks', {
    body: [{ agent_id: 'gatis', title: 'x' }],
    headers: { 'x-api-key': 'wrong-value' }
  });
  assert.strictEqual(r.status, 401);
  assert.strictEqual(pool.calls.length, 0);
});

test('NEGATIVE: least privilege — the agent scope cannot write tasks or agents', async () => {
  pool.reset();
  const t = await call('POST', '/rest/v1/tasks', { cred: AGENT, body: [{ agent_id: 'gatis', title: 'x' }] });
  assert.strictEqual(t.status, 403);
  const a = await call('PATCH', '/rest/v1/agents?id=eq.gatis', { cred: AGENT, body: { name: 'x' } });
  assert.strictEqual(a.status, 403);
  assert.strictEqual(pool.calls.length, 0, 'a forbidden scope reached the database');
});

test('NEGATIVE: least privilege — the hermes scope cannot write subscriptions', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/subscriptions', { cred: HERMES, body: [{ name: 'x' }] });
  assert.strictEqual(r.status, 403);
  assert.strictEqual(pool.calls.length, 0);
});

test('NEGATIVE: the RPC admin token is not accepted on the collection routes', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/tasks', { cred: RPC_ADMIN, body: [{ agent_id: 'gatis', title: 'x' }] });
  assert.strictEqual(r.status, 401, 'RPC admin token must not authorize collection writes');
  assert.strictEqual(pool.calls.length, 0);
});

test('NEGATIVE: RPC without the admin token is still rejected', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/rpc/admin_create_task', {
    body: { p_agent_id: 'gatis', p_title: 'x' }
  });
  assert.strictEqual(r.status, 401);
  assert.strictEqual(pool.calls.length, 0);
});

// ---------------------------------------------------------------- POSITIVE --
test('POSITIVE: authorized Hermes task creation still works', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/tasks', {
    cred: HERMES,
    body: [{ agent_id: 'koderis', title: 'Authorized Hermes task', status: 'queued' }]
  });
  assert.strictEqual(r.status, 201);
  assert.strictEqual(pool.store.tasks.length, 1);
  assert.strictEqual(pool.store.tasks[0].title, 'Authorized Hermes task');
});

test('POSITIVE: permitted agent operations still work', async () => {
  pool.reset();
  const e = await call('POST', '/rest/v1/agent_events', {
    cred: AGENT,
    body: [{ agent_id: 'gatis', event_text: 'agent progress note' }]
  });
  assert.strictEqual(e.status, 201);
  assert.strictEqual(pool.store.agent_events.length, 1);

  pool.store.agent_status.push({ agent_id: 'gatis', status: 'resting' });
  const s = await call('PATCH', '/rest/v1/agent_status?agent_id=eq.gatis', {
    cred: AGENT,
    body: { status: 'working' }
  });
  assert.strictEqual(s.status, 200);
});

test('POSITIVE: the admin scope may write any exposed table', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/subscriptions', { cred: ADMIN, body: [{ name: 'Test subscription' }] });
  assert.strictEqual(r.status, 201);
});

test('POSITIVE: RPC admin_create_task still works with the RPC admin token', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/rpc/admin_create_task', {
    body: { p_token: RPC_ADMIN, p_agent_id: 'koderis', p_title: 'RPC created task' }
  });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(pool.store.tasks.length, 1);
});

// -------------------------------------------------------------- REGRESSION --
test('REGRESSION: the read path is unchanged and needs no credential', async () => {
  pool.reset();
  pool.store.agents.push({ id: 'gatis', name: 'Gatis' });
  const r = await call('GET', '/rest/v1/agents?select=id,name');
  assert.strictEqual(r.status, 200);
  assert.ok(Array.isArray(r.json));
});

test('REGRESSION: healthz is unauthenticated and still responds', async () => {
  const r = await call('GET', '/healthz');
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.json.ok, true);
});

test('REGRESSION: an unexposed table is still refused for an authorized scope', async () => {
  pool.reset();
  const r = await call('POST', '/rest/v1/pg_catalog_hack', { cred: ADMIN, body: [{ a: 1 }] });
  assert.strictEqual(r.status, 404);
  assert.strictEqual(pool.calls.length, 0);
});

test('REGRESSION: an unknown RPC is still refused', async () => {
  const r = await call('POST', '/rest/v1/rpc/not_a_function', { body: { p_token: RPC_ADMIN } });
  assert.strictEqual(r.status, 404);
});

// ------------------------------------------------------------- IDEMPOTENCY --
test('IDEMPOTENCY: an identical authorized task insert creates no duplicate', async () => {
  pool.reset();
  const body = [{ agent_id: 'gatis', title: 'Repeat safe task', status: 'queued' }];
  const first = await call('POST', '/rest/v1/tasks', { cred: HERMES, body });
  const second = await call('POST', '/rest/v1/tasks', { cred: HERMES, body });
  assert.strictEqual(first.status, 201);
  assert.strictEqual(second.status, 200);
  assert.strictEqual(second.headers.get('x-idempotent-reuse'), '1');
  assert.strictEqual(pool.store.tasks.length, 1, 'retry duplicated a task row');
  assert.strictEqual(first.json[0].id, second.json[0].id);
});

test('IDEMPOTENCY: an identical authorized event insert creates no duplicate', async () => {
  pool.reset();
  const body = [{ agent_id: 'gatis', event_text: 'repeat safe event' }];
  const first = await call('POST', '/rest/v1/agent_events', { cred: AGENT, body });
  const second = await call('POST', '/rest/v1/agent_events', { cred: AGENT, body });
  assert.strictEqual(first.status, 201);
  assert.strictEqual(second.status, 200);
  assert.strictEqual(pool.store.agent_events.length, 1, 'retry duplicated an event row');
});

test('IDEMPOTENCY: a genuinely different row is still inserted', async () => {
  pool.reset();
  await call('POST', '/rest/v1/agent_events', { cred: AGENT, body: [{ agent_id: 'gatis', event_text: 'first' }] });
  await call('POST', '/rest/v1/agent_events', { cred: AGENT, body: [{ agent_id: 'gatis', event_text: 'second' }] });
  assert.strictEqual(pool.store.agent_events.length, 2);
});

// ------------------------------------------------- DISTINCT CREDENTIALS --
const { assertDistinctScopeCredentials, WRITE_SCOPES } = require('../server');

function withScopeEnv(values, fn) {
  const saved = {};
  for (const def of Object.values(WRITE_SCOPES)) { saved[def.env] = process.env[def.env]; }
  try {
    for (const [k, v] of Object.entries(values)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
}

test('DISTINCT: configuration with all-distinct credentials is accepted', () => {
  withScopeEnv({
    FARM_ADMIN_WRITE_TOKEN: 'distinct-a',
    FARM_HERMES_WRITE_TOKEN: 'distinct-b',
    FARM_AGENT_WRITE_TOKEN: 'distinct-c',
    FARM_APP_WRITE_TOKEN: 'distinct-d'
  }, () => {
    assert.strictEqual(assertDistinctScopeCredentials(), true);
  });
});

test('DISTINCT: two scopes sharing a credential is refused', () => {
  withScopeEnv({
    FARM_ADMIN_WRITE_TOKEN: 'shared-value',
    FARM_HERMES_WRITE_TOKEN: 'shared-value',
    FARM_AGENT_WRITE_TOKEN: 'distinct-c',
    FARM_APP_WRITE_TOKEN: 'distinct-d'
  }, () => {
    assert.throws(() => assertDistinctScopeCredentials(), /share the same credential/);
  });
});

test('DISTINCT: the refusal names the two variables and never the value', () => {
  withScopeEnv({
    FARM_ADMIN_WRITE_TOKEN: 'super-secret-shared',
    FARM_AGENT_WRITE_TOKEN: 'super-secret-shared',
    FARM_HERMES_WRITE_TOKEN: 'distinct-b',
    FARM_APP_WRITE_TOKEN: 'distinct-d'
  }, () => {
    let message = '';
    try { assertDistinctScopeCredentials(); } catch (e) { message = e.message; }
    assert.match(message, /FARM_ADMIN_WRITE_TOKEN/);
    assert.match(message, /FARM_AGENT_WRITE_TOKEN/);
    assert.ok(!message.includes('super-secret-shared'), 'the shared value leaked into the error');
  });
});

test('DISTINCT: a partially configured deployment is still validated', () => {
  withScopeEnv({
    FARM_ADMIN_WRITE_TOKEN: 'only-one',
    FARM_HERMES_WRITE_TOKEN: undefined,
    FARM_AGENT_WRITE_TOKEN: undefined,
    FARM_APP_WRITE_TOKEN: 'only-one'
  }, () => {
    assert.throws(() => assertDistinctScopeCredentials(), /share the same credential/);
  });
});

// --------------------------------------------------------------- APP SCOPE --
test('POSITIVE: the app scope may persist chat turns and sync usage', async () => {
  pool.reset();
  const c = await call('POST', '/rest/v1/chat_messages', {
    cred: process.env.FARM_APP_WRITE_TOKEN,
    body: [{ session_id: 's1', role: 'user', content: 'hello' }]
  });
  assert.strictEqual(c.status, 201);
  const u = await call('PATCH', '/rest/v1/agent_usage?agent_id=eq.gatis', {
    cred: process.env.FARM_APP_WRITE_TOKEN,
    body: { input_tokens: 5 }
  });
  assert.strictEqual(u.status, 200);
});

test('NEGATIVE: the app scope cannot write tasks or agents', async () => {
  pool.reset();
  const t = await call('POST', '/rest/v1/tasks', {
    cred: process.env.FARM_APP_WRITE_TOKEN,
    body: [{ agent_id: 'gatis', title: 'x' }]
  });
  assert.strictEqual(t.status, 403);
  assert.strictEqual(pool.calls.length, 0);
});
