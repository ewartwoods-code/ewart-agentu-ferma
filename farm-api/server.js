const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
let pool = new Pool({ connectionString: DATABASE_URL, max: 5 });

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, apikey, content-type, prefer, range');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

const TABLES = new Set([
  'agents','agent_status','agent_usage','agent_workspace_map','agent_events',
  'agent_skills','skills','chat_messages','commands','farm_plan','subscriptions','tasks',
  'token_budgets','agent_scene_positions','agent_module_usage'
]);

// ---------------------------------------------------------------------------
// Scoped write credentials (least privilege).
//
// Every database-mutating collection route is gated here. Each scope carries
// its own credential and its own table/operation allowlist, so a leaked agent
// credential cannot rewrite tasks and a leaked Hermes credential cannot touch
// billing rows. The RPC admin token (ADMIN_TOKEN) stays separate and is NOT
// accepted on these routes. Credential values are never logged.
//
// See farm-api/README.md for the variable names and the rollout order.
// ---------------------------------------------------------------------------
const WRITE_SCOPES = {
  admin: {
    env: 'FARM_ADMIN_WRITE_TOKEN',
    insert: '*',
    update: '*'
  },
  hermes: {
    env: 'FARM_HERMES_WRITE_TOKEN',
    insert: ['tasks', 'agent_events', 'agent_status', 'commands', 'farm_plan', 'skills', 'agent_skills', 'token_budgets'],
    update: ['tasks', 'agent_events', 'agent_status', 'commands', 'farm_plan', 'skills', 'agent_skills', 'token_budgets']
  },
  agent: {
    env: 'FARM_AGENT_WRITE_TOKEN',
    insert: ['agent_events', 'agent_usage', 'agent_module_usage'],
    update: ['agent_status', 'agent_usage', 'agent_module_usage']
  },
  // The ewart-agentu-ferma web service writes exactly two things through this
  // API: it persists Herme chat turns and syncs Anthropic usage counters.
  app: {
    env: 'FARM_APP_WRITE_TOKEN',
    insert: ['chat_messages'],
    update: ['agent_usage']
  }
};

function timingSafeEq(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function presentedCredential(req) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
         String(req.headers['x-api-key'] || '');
}

function configuredScopes() {
  const out = [];
  for (const [name, def] of Object.entries(WRITE_SCOPES)) {
    const value = process.env[def.env] || '';
    if (value) out.push({ name, def, value });
  }
  return out;
}

function resolveScope(credential) {
  if (!credential) return null;
  for (const scope of configuredScopes()) {
    if (timingSafeEq(credential, scope.value)) return scope;
  }
  return null;
}

// Two scopes sharing one credential would silently collapse the privilege
// boundary: whichever scope matched first would decide the allowlist. Refuse to
// start instead. Values are compared by digest and are never logged.
function assertDistinctScopeCredentials(scopes = configuredScopes()) {
  const seen = new Map();
  for (const scope of scopes) {
    const digest = crypto.createHash('sha256').update(String(scope.value)).digest('hex');
    if (seen.has(digest)) {
      throw new Error(
        `farm-api refusing to start: scopes "${seen.get(digest)}" and "${scope.name}" ` +
        `share the same credential. Give ${WRITE_SCOPES[seen.get(digest)].env} and ` +
        `${WRITE_SCOPES[scope.name].env} distinct values.`
      );
    }
    seen.set(digest, scope.name);
  }
  return true;
}

function scopeAllows(scope, op, table) {
  const allowed = scope.def[op];
  if (!allowed) return false;
  return allowed === '*' || allowed.includes(table);
}

// Gate a db-mutating collection route. Every rejection happens before any
// database access, so an unauthorized caller never reaches Postgres.
function requireWriteScope(op) {
  return (req, res, next) => {
    // Fail closed: an unconfigured deployment must never accept anonymous writes.
    if (!configuredScopes().length) {
      return res.status(403).json({ code: 'FARM_AUTH', message: 'write credentials are not configured' });
    }
    const scope = resolveScope(presentedCredential(req));
    // Authenticate before revealing whether a table exists.
    if (!scope) {
      return res.status(401).json({ code: 'FARM_AUTH', message: 'missing or invalid write credential' });
    }
    const table = req.params.table;
    if (!TABLES.has(table)) {
      return res.status(404).json({ code: 'FARM_API', message: 'table not exposed' });
    }
    if (!scopeAllows(scope, op, table)) {
      return res.status(403).json({ code: 'FARM_AUTH', message: `scope is not permitted to ${op} ${table}` });
    }
    req.writeScope = scope.name;
    next();
  };
}

// Repeat-safe inserts. Mirrors the agent bridge: an identical row written
// again inside the window reuses the existing record instead of duplicating it.
const IDEMPOTENT_INSERT_TABLES = new Set(['tasks', 'agent_events']);
const IDEMPOTENCY_WINDOW = '10 minutes';

async function findRecentDuplicate(table, row, keys) {
  const cols = keys.filter(k => row[k] !== undefined && row[k] !== null && typeof row[k] !== 'object');
  if (!cols.length) return null;
  const values = [];
  const where = cols.map(k => { values.push(row[k]); return `${ident(k)} = $${values.length}`; });
  const sql = `SELECT * FROM ${tableName(table)} WHERE ${where.join(' AND ')}` +
              ` AND created_at > now() - interval '${IDEMPOTENCY_WINDOW}'` +
              ' ORDER BY created_at DESC LIMIT 1';
  const out = await pool.query(sql, values);
  return out.rows[0] || null;
}

function ident(v) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(String(v || ''))) throw new Error('invalid identifier');
  return '"' + String(v) + '"';
}

function tableName(v) {
  if (!TABLES.has(v)) {
    const e = new Error('table not exposed'); e.status = 404; throw e;
  }
  return `farm.${ident(v)}`;
}

function parseFilter(raw, col, values) {
  const s = String(raw == null ? '' : raw);
  if (s.startsWith('eq.')) { values.push(s.slice(3)); return `${ident(col)} = $${values.length}`; }
  if (s.startsWith('neq.')) { values.push(s.slice(4)); return `${ident(col)} <> $${values.length}`; }
  if (s === 'is.null') return `${ident(col)} IS NULL`;
  if (s === 'not.is.null') return `${ident(col)} IS NOT NULL`;
  if (s.startsWith('in.(') && s.endsWith(')')) {
    const items = s.slice(4, -1).split(',').filter(Boolean);
    if (!items.length) return 'FALSE';
    const ps = items.map(x => { values.push(x); return `$${values.length}`; });
    return `${ident(col)} IN (${ps.join(',')})`;
  }
  throw new Error(`unsupported filter for ${col}`);
}

function buildWhere(query, values) {
  const skip = new Set(['select','order','limit','offset']);
  const parts = [];
  for (const [k, v] of Object.entries(query || {})) {
    if (skip.has(k)) continue;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) continue;
    parts.push(parseFilter(v, k, values));
  }
  return parts.length ? ' WHERE ' + parts.join(' AND ') : '';
}

function buildOrder(raw) {
  if (!raw) return '';
  const parts = String(raw).split(',').map(x => {
    const [col, dir] = x.split('.');
    return `${ident(col)} ${String(dir || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC'}`;
  });
  return ' ORDER BY ' + parts.join(', ');
}

function selectList(raw) {
  if (!raw || raw === '*') return '*';
  const cols = String(raw).split(',').filter(x => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(x));
  return cols.length ? cols.map(ident).join(',') : '*';
}

async function genericGet(req, res) {
  try {
    const table = req.params.table;
    const values = [];
    let sql;
    if (table === 'agent_skills' && String(req.query.select || '').includes('skills(name)')) {
      sql = `SELECT a.agent_id, a.level, json_build_object('name', s.name) AS skills
             FROM farm.agent_skills a LEFT JOIN farm.skills s ON s.id = a.skill_id`;
      sql += buildWhere(req.query, values).replace(/"agent_id"/g, 'a.agent_id').replace(/"level"/g, 'a.level');
    } else {
      sql = `SELECT ${selectList(req.query.select)} FROM ${tableName(table)}` + buildWhere(req.query, values);
    }
    sql += buildOrder(req.query.order);
    if (req.query.limit) { values.push(Math.max(0, Math.min(500, Number(req.query.limit) || 0))); sql += ` LIMIT $${values.length}`; }
    if (req.query.offset) { values.push(Math.max(0, Number(req.query.offset) || 0)); sql += ` OFFSET $${values.length}`; }
    const out = await pool.query(sql, values);
    res.json(out.rows);
  } catch (err) {
    console.error('GET failed', err);
    res.status(err.status || (err.code === '42P01' ? 404 : 400)).json({ code: err.code || 'FARM_API', message: err.message });
  }
}

app.get('/rest/v1/:table', genericGet);

app.post('/rest/v1/:table', requireWriteScope('insert'), async (req, res) => {
  try {
    const table = req.params.table;
    tableName(table);
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    if (!rows.length) return res.status(204).end();
    const inserted = [];
    let reused = 0;
    for (const row of rows) {
      const keys = Object.keys(row || {}).filter(k => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k));
      if (!keys.length) continue;
      if (IDEMPOTENT_INSERT_TABLES.has(table)) {
        const duplicate = await findRecentDuplicate(table, row, keys);
        if (duplicate) { inserted.push(duplicate); reused++; continue; }
      }
      const vals = keys.map(k => row[k]);
      const ps = vals.map((_, i) => `$${i + 1}`).join(',');
      const q = `INSERT INTO ${tableName(table)} (${keys.map(ident).join(',')}) VALUES (${ps}) RETURNING *`;
      const r = await pool.query(q, vals);
      inserted.push(...r.rows);
    }
    res.setHeader('X-Idempotent-Reuse', String(reused));
    if (String(req.headers.prefer || '').includes('return=minimal')) return res.status(204).end();
    res.status(reused ? 200 : 201).json(inserted);
  } catch (err) {
    console.error('POST table failed', err);
    res.status(err.code === '42P01' ? 404 : 400).json({ code: err.code || 'FARM_API', message: err.message });
  }
});

app.patch('/rest/v1/:table', requireWriteScope('update'), async (req, res) => {
  try {
    const table = req.params.table;
    tableName(table);
    const keys = Object.keys(req.body || {}).filter(k => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k));
    if (!keys.length) return res.status(400).json({ message: 'empty patch' });
    const values = keys.map(k => req.body[k]);
    const set = keys.map((k, i) => `${ident(k)}=$${i + 1}`).join(',');
    const where = buildWhere(req.query, values);
    const q = `UPDATE ${tableName(table)} SET ${set}${where} RETURNING *`;
    const r = await pool.query(q, values);
    if (String(req.headers.prefer || '').includes('return=minimal')) return res.status(204).end();
    res.json(r.rows);
  } catch (err) {
    console.error('PATCH table failed', err);
    res.status(err.code === '42P01' ? 404 : 400).json({ code: err.code || 'FARM_API', message: err.message });
  }
});

function requireAdmin(body) {
  if (!ADMIN_TOKEN || !body || body.p_token !== ADMIN_TOKEN) {
    const e = new Error('invalid token'); e.status = 401; throw e;
  }
}

async function tx(fn) {
  const c = await pool.connect();
  try { await c.query('BEGIN'); const v = await fn(c); await c.query('COMMIT'); return v; }
  catch (e) { await c.query('ROLLBACK'); throw e; }
  finally { c.release(); }
}

async function event(c, agentId, text) {
  await c.query('INSERT INTO farm.agent_events(agent_id,event_text) VALUES($1,$2)', [agentId || null, text]);
}

const rpc = {
  admin_create_task: async b => {
    requireAdmin(b);
    return tx(async c => {
      const r = await c.query(`INSERT INTO farm.tasks(agent_id,title,description,status,started_at)
        VALUES($1,$2,$3,'active',now()) RETURNING *`, [b.p_agent_id, b.p_title, b.p_description || '']);
      await c.query(`INSERT INTO farm.agent_status(agent_id,status,current_task,quote,updated_at)
        VALUES($1,'working',$2,'',now()) ON CONFLICT(agent_id) DO UPDATE SET status='working',current_task=EXCLUDED.current_task,updated_at=now()`, [b.p_agent_id, b.p_title]);
      await event(c, b.p_agent_id, `Saņēma uzdevumu: ${b.p_title}`);
      return r.rows[0];
    });
  },
  admin_mark_task_review: async b => {
    requireAdmin(b);
    return tx(async c => {
      const r = await c.query(`UPDATE farm.tasks SET status='review',result_summary=$2,reviewed_at=now() WHERE id=$1 RETURNING *`, [b.p_task_id, b.p_result_summary || '']);
      const t = r.rows[0]; if (!t) throw new Error('task not found');
      await c.query(`UPDATE farm.agent_status SET status='review',current_task=$2,updated_at=now() WHERE agent_id=$1`, [t.agent_id, t.title]);
      await event(c, t.agent_id, `Pabeidza darbu, gaida apstiprinājumu: ${b.p_result_summary || t.title}`);
      return t;
    });
  },
  admin_approve_task: async b => {
    requireAdmin(b);
    return tx(async c => {
      const r = await c.query(`UPDATE farm.tasks SET status='done',completed_at=now() WHERE id=$1 RETURNING *`, [b.p_task_id]);
      const t = r.rows[0]; if (!t) throw new Error('task not found');
      await c.query(`UPDATE farm.agent_status SET status='resting',current_task='',updated_at=now() WHERE agent_id=$1`, [t.agent_id]);
      await event(c, t.agent_id, `Darbs apstiprināts: ${t.title}`);
      return t;
    });
  },
  admin_reject_task: async b => {
    requireAdmin(b);
    return tx(async c => {
      const r = await c.query(`UPDATE farm.tasks SET status='active',reject_note=$2,reviewed_at=NULL WHERE id=$1 RETURNING *`, [b.p_task_id, b.p_note || '']);
      const t = r.rows[0]; if (!t) throw new Error('task not found');
      await c.query(`UPDATE farm.agent_status SET status='working',current_task=$2,updated_at=now() WHERE agent_id=$1`, [t.agent_id, t.title]);
      await event(c, t.agent_id, `Darbs sūtīts atpakaļ pārtaisīšanai: ${b.p_note || ''}`);
      return t;
    });
  },
  admin_save_plan: async b => {
    requireAdmin(b);
    const r = await pool.query(`INSERT INTO farm.farm_plan(id,content,updated_at) VALUES(1,$1,now())
      ON CONFLICT(id) DO UPDATE SET content=EXCLUDED.content,updated_at=now() RETURNING *`, [b.p_content || '']);
    return r.rows[0];
  },
  admin_upsert_agent_skill: async b => {
    requireAdmin(b);
    return tx(async c => {
      let s = await c.query('SELECT id FROM farm.skills WHERE lower(name)=lower($1) ORDER BY id LIMIT 1', [b.p_skill_name]);
      let id;
      if (!s.rows[0]) {
        const n = await c.query('INSERT INTO farm.skills(name,description) VALUES($1,$2) RETURNING id', [b.p_skill_name, b.p_description || '']);
        id = n.rows[0].id;
      } else { id = s.rows[0].id; await c.query('UPDATE farm.skills SET description=$2 WHERE id=$1', [id, b.p_description || '']); }
      await c.query(`INSERT INTO farm.agent_skills(agent_id,skill_id,level,updated_at) VALUES($1,$2,$3,now())
        ON CONFLICT(agent_id,skill_id) DO UPDATE SET level=EXCLUDED.level,updated_at=now()`, [b.p_agent_id, id, b.p_level || 'proficient']);
      await event(c, b.p_agent_id, `Skils atjaunināts: ${b.p_skill_name} (${b.p_level || 'proficient'})`);
      return { agent_id: b.p_agent_id, skill_id: id };
    });
  },
  admin_set_workspace_map: async b => {
    requireAdmin(b);
    const r = await pool.query(`INSERT INTO farm.agent_workspace_map(agent_id,anthropic_workspace_id,anthropic_api_key_id,updated_at)
      VALUES($1,$2,$3,now()) ON CONFLICT(agent_id) DO UPDATE SET anthropic_workspace_id=EXCLUDED.anthropic_workspace_id,anthropic_api_key_id=EXCLUDED.anthropic_api_key_id,updated_at=now() RETURNING *`, [b.p_agent_id, b.p_workspace_id || null, b.p_api_key_id || null]);
    return r.rows[0];
  },
  admin_upsert_platform_agent: async b => {
    requireAdmin(b);
    const r = await pool.query(`INSERT INTO farm.agents(id,name,role,tier,cutout_url,video_url,pos_x,pos_y,created_at)
      VALUES($1,$2,$3,'platform','','',50,50,now()) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,role=EXCLUDED.role,tier='platform' RETURNING *`, [b.p_id, b.p_name, b.p_role || 'AI platforma']);
    return r.rows[0];
  },
  admin_set_agent_parent: async b => {
    requireAdmin(b);
    const r = await pool.query('UPDATE farm.agents SET parent_id=$2 WHERE id=$1 RETURNING *', [b.p_agent_id, b.p_parent_id || null]);
    return r.rows[0] || null;
  },
  admin_set_token_budget: async b => {
    requireAdmin(b);
    const r = await pool.query(`INSERT INTO farm.token_budgets(agent_id,plan_label,budget_tokens,window_label,window_started_at,updated_at)
      VALUES($1,$2,$3,$4,$5,now()) ON CONFLICT(agent_id) DO UPDATE SET plan_label=EXCLUDED.plan_label,budget_tokens=EXCLUDED.budget_tokens,window_label=EXCLUDED.window_label,window_started_at=EXCLUDED.window_started_at,updated_at=now() RETURNING *`, [b.p_agent_id, b.p_plan_label || '', b.p_budget_tokens, b.p_window_label || '', b.p_window_started_at || null]);
    return r.rows[0];
  },
  admin_set_agent_scene_position: async b => {
    requireAdmin(b);
    const r = await pool.query(`INSERT INTO farm.agent_scene_positions(scene_id,agent_id,pos_x,pos_y,updated_at)
      VALUES($1,$2,$3,$4,now()) ON CONFLICT(scene_id,agent_id) DO UPDATE SET pos_x=EXCLUDED.pos_x,pos_y=EXCLUDED.pos_y,updated_at=now() RETURNING *`, [b.p_scene_id, b.p_agent_id, b.p_pos_x, b.p_pos_y]);
    return r.rows[0];
  }
};

app.post('/rest/v1/rpc/:fn', async (req, res) => {
  try {
    const fn = rpc[req.params.fn];
    if (!fn) return res.status(404).json({ code: 'PGRST202', message: 'function not exposed' });
    const out = await fn(req.body || {});
    res.json(out == null ? null : out);
  } catch (err) {
    console.error('RPC failed', req.params.fn, err);
    res.status(err.status || 400).json({ code: err.code || 'FARM_RPC', message: err.message });
  }
});

app.get('/healthz', async (_req, res) => {
  try {
    const q = await pool.query(`SELECT (SELECT count(*)::int FROM farm.agents) agents,
      (SELECT count(*)::int FROM farm.agent_status) statuses,
      (SELECT count(*)::int FROM farm.subscriptions) subscriptions`);
    res.json({ ok: true, db: 'central-postgres', schema: 'farm', ...q.rows[0] });
  } catch (err) { res.status(500).json({ ok: false, error: err.message }); }
});

if (require.main === module) {
  assertDistinctScopeCredentials();
  app.listen(PORT, () => console.log(`EWART farm-api listening on ${PORT}`));
}

module.exports = {
  app,
  assertDistinctScopeCredentials,
  WRITE_SCOPES,
  // Test seam only: never used by the running service.
  __setPoolForTests: p => { pool = p; }
};
