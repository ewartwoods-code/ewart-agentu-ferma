const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL || '';
const SHARED_AGENT_API_TOKEN = process.env.AGENT_API_TOKEN || '';
const GATIS_API_TOKEN = process.env.GATIS_API_TOKEN || '';

if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!SHARED_AGENT_API_TOKEN && !GATIS_API_TOKEN && !process.env.AGENT_API_TOKENS) {
  throw new Error('At least one agent API token is required');
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 10 });
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-api-key, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function normalizeAgentId(value) {
  const id = String(value || '').trim().toLowerCase();
  if (!/^[a-z0-9_-]{1,64}$/.test(id)) return null;
  return id;
}

function parseTokenMap() {
  if (!process.env.AGENT_API_TOKENS) return {};
  try {
    const value = JSON.parse(process.env.AGENT_API_TOKENS);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (_) {
    return {};
  }
}

const TOKEN_MAP = parseTokenMap();

function tokenForAgent(agentId) {
  const envName = `${agentId.toUpperCase().replace(/-/g, '_')}_API_TOKEN`;
  return String(
    TOKEN_MAP[agentId] ||
    process.env[envName] ||
    (agentId === 'gatis' ? GATIS_API_TOKEN : '') ||
    SHARED_AGENT_API_TOKEN ||
    ''
  );
}

function suppliedToken(req) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '') || String(req.headers['x-api-key'] || '');
}

function requireAgentToken(req, res, next) {
  const agentId = normalizeAgentId(req.params.agentId || req.agentId);
  if (!agentId) return res.status(400).json({ ok: false, error: 'invalid agent id' });
  const expected = tokenForAgent(agentId);
  if (!expected || suppliedToken(req) !== expected) return res.status(401).json({ ok: false, error: 'unauthorized' });
  req.agentId = agentId;
  next();
}

async function queryOptional(sql, values = [], fallback = null) {
  try { return await pool.query(sql, values); }
  catch (e) {
    if (e.code === '42P01' || e.code === '42703') return fallback;
    throw e;
  }
}

async function addEvent(agentId, text) {
  const existing = await queryOptional(
    `SELECT id,agent_id,event_text,created_at FROM farm.agent_events
     WHERE agent_id=$1 AND event_text=$2 AND created_at > now() - interval '10 minutes'
     ORDER BY created_at DESC LIMIT 1`,
    [agentId, text],
    { rows: [] }
  );
  if (existing?.rows?.[0]) return { rows: existing.rows, idempotent: true };
  const created = await queryOptional(
    'INSERT INTO farm.agent_events(agent_id,event_text) VALUES($1,$2) RETURNING *',
    [agentId, text],
    { rows: [] }
  );
  return { ...created, idempotent: false };
}

app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      ok: true,
      service: 'agent-bridge',
      compatibility: ['gatis-bridge'],
      db: 'central-postgres',
      protocol_version: '2.0'
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const agentRouter = express.Router({ mergeParams: true });
agentRouter.use(requireAgentToken);

agentRouter.get('/context', async (req, res) => {
  const agentId = req.agentId;
  try {
    const [agents, tasks, events, customer, analytics] = await Promise.all([
      queryOptional(`SELECT a.*, s.status, s.current_task, s.updated_at AS status_updated_at
                     FROM farm.agents a LEFT JOIN farm.agent_status s ON s.agent_id=a.id
                     WHERE lower(a.id::text)=$1 OR lower(a.name)=$1 LIMIT 1`, [agentId], { rows: [] }),
      queryOptional(`SELECT id,agent_id,title,description,status,started_at,reviewed_at,completed_at,result_summary,result_url
                     FROM farm.tasks WHERE lower(coalesce(agent_id::text,''))=$1
                     ORDER BY id DESC LIMIT 20`, [agentId], { rows: [] }),
      queryOptional(`SELECT id,agent_id,event_text,created_at FROM farm.agent_events
                     WHERE lower(coalesce(agent_id::text,''))=$1 ORDER BY id DESC LIMIT 20`, [agentId], { rows: [] }),
      queryOptional(`SELECT count(*)::int AS open_conversations FROM customer_service.conversations WHERE status='open'`, [], { rows: [{ open_conversations: 0 }] }),
      queryOptional(`SELECT max(metric_date) AS latest_metric_date FROM website_analytics.daily_metrics`, [], { rows: [{ latest_metric_date: null }] })
    ]);

    res.json({
      ok: true,
      fetched_at: new Date().toISOString(),
      agent_id: agentId,
      agent: agents?.rows?.[0] || null,
      tasks: tasks?.rows || [],
      recent_events: events?.rows || [],
      customer_service: customer?.rows?.[0] || { open_conversations: 0 },
      website_analytics: analytics?.rows?.[0] || { latest_metric_date: null }
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

agentRouter.get('/tasks', async (req, res) => {
  const agentId = req.agentId;
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 25)));
    const values = [agentId];
    let where = `lower(coalesce(agent_id::text,''))=$1`;
    if (req.query.status) {
      values.push(String(req.query.status));
      where += ` AND status=$${values.length}`;
    }
    values.push(limit);
    const out = await pool.query(`SELECT * FROM farm.tasks WHERE ${where} ORDER BY id DESC LIMIT $${values.length}`, values);
    res.json({ ok: true, agent_id: agentId, tasks: out.rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

agentRouter.get('/next', async (req, res) => {
  const agentId = req.agentId;
  try {
    const out = await pool.query(`SELECT * FROM farm.tasks
      WHERE lower(coalesce(agent_id::text,''))=$1
        AND status IN ('pending','queued','active')
      ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, id ASC
      LIMIT 1`, [agentId]);
    res.json({ ok: true, agent_id: agentId, task: out.rows[0] || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

agentRouter.post('/claim', async (req, res) => {
  const agentId = req.agentId;
  const requestedId = req.body?.task_id ?? req.body?.id ?? null;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const params = [agentId];
    let idClause = '';
    if (requestedId != null) {
      params.push(requestedId);
      idClause = ` AND id=$${params.length}`;
    }
    const selected = await client.query(`SELECT * FROM farm.tasks
      WHERE lower(coalesce(agent_id::text,''))=$1
        AND status IN ('pending','queued','active')${idClause}
      ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, id ASC
      FOR UPDATE SKIP LOCKED LIMIT 1`, params);
    const task = selected.rows[0];
    if (!task) {
      await client.query('COMMIT');
      return res.status(404).json({ ok: false, error: 'no claimable task' });
    }
    const updated = await client.query(`UPDATE farm.tasks
      SET status='active', started_at=COALESCE(started_at,now())
      WHERE id=$1 RETURNING *`, [task.id]);
    await client.query(`INSERT INTO farm.agent_status(agent_id,status,current_task,quote,updated_at)
      VALUES($1,'working',$2,'',now())
      ON CONFLICT(agent_id) DO UPDATE SET
        status='working', current_task=EXCLUDED.current_task, updated_at=now()`,
      [agentId, task.title]);
    await client.query('COMMIT');
    await addEvent(agentId, `Uzdevums paņemts izpildei: ${task.title}`);
    res.json({ ok: true, agent_id: agentId, task: updated.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, error: e.message });
  } finally {
    client.release();
  }
});

agentRouter.post('/tasks', async (req, res) => {
  const agentId = req.agentId;
  try {
    const title = String(req.body?.title || '').trim();
    if (!title) return res.status(400).json({ ok: false, error: 'title is required' });
    const description = String(req.body?.description || '');
    const initialStatus = ['pending','queued','active'].includes(String(req.body?.status || ''))
      ? String(req.body.status)
      : 'active';
    const startedAt = initialStatus === 'active' ? 'now()' : 'NULL';
    const out = await pool.query(`INSERT INTO farm.tasks(agent_id,title,description,status,started_at)
                                  VALUES($1,$2,$3,$4,${startedAt}) RETURNING *`,
                                  [agentId, title, description, initialStatus]);
    await addEvent(agentId, `Saņēma uzdevumu: ${title}`);
    res.status(201).json({ ok: true, agent_id: agentId, task: out.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

agentRouter.post('/result', async (req, res) => {
  const agentId = req.agentId;
  try {
    const taskId = req.body?.task_id ?? req.body?.id;
    const status = String(req.body?.status || 'review');
    const allowed = new Set(['done','review','blocked','active']);
    if (!taskId) return res.status(400).json({ ok: false, error: 'task_id is required' });
    if (!allowed.has(status)) return res.status(400).json({ ok: false, error: 'invalid status' });

    const summary = String(req.body?.summary || req.body?.result_summary || '');
    const resultUrl = req.body?.result_url || null;
    const current = await pool.query(`SELECT * FROM farm.tasks
      WHERE id=$1 AND lower(coalesce(agent_id::text,''))=$2 LIMIT 1`, [taskId, agentId]);
    if (!current.rows[0]) return res.status(404).json({ ok: false, error: 'task not found for agent' });
    if (current.rows[0].status === status && String(current.rows[0].result_summary || '') === summary) {
      return res.json({ ok: true, idempotent: true, agent_id: agentId, task: current.rows[0] });
    }
    const out = await pool.query(`UPDATE farm.tasks
      SET status=$3,
          result_summary=$4,
          result_url=COALESCE($5,result_url),
          completed_at=CASE WHEN $3='done' THEN now() ELSE completed_at END,
          reviewed_at=CASE WHEN $3='review' THEN now() ELSE reviewed_at END
      WHERE id=$1 AND lower(coalesce(agent_id::text,''))=$2 RETURNING *`,
      [taskId, agentId, status, summary, resultUrl]);

    if (!out.rows[0]) return res.status(404).json({ ok: false, error: 'task not found for agent' });
    const agentStatus = status === 'review' ? 'review'
      : status === 'blocked' ? 'blocked'
      : status === 'active' ? 'working'
      : 'resting';
    const currentTask = status === 'done' ? '' : out.rows[0].title;
    await pool.query(`INSERT INTO farm.agent_status(agent_id,status,current_task,quote,updated_at)
      VALUES($1,$2,$3,'',now())
      ON CONFLICT(agent_id) DO UPDATE SET
        status=EXCLUDED.status, current_task=EXCLUDED.current_task, updated_at=now()`,
      [agentId, agentStatus, currentTask]);
    await addEvent(agentId, `Rezultāts: ${status} — ${summary}`);
    res.json({ ok: true, agent_id: agentId, task: out.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

agentRouter.post('/events', async (req, res) => {
  const agentId = req.agentId;
  try {
    const text = String(req.body?.event_text || req.body?.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'event_text is required' });
    const out = await addEvent(agentId, text);
    res.status(out?.idempotent ? 200 : 201).json({
      ok: true,
      idempotent: !!out?.idempotent,
      agent_id: agentId,
      event: out?.rows?.[0] || null
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/api/agents/:agentId', agentRouter);

// Backward-compatible Gatis API aliases.
app.use('/api/gatis', (req, _res, next) => {
  req.agentId = 'gatis';
  next();
}, agentRouter);

// Legacy event endpoint used by older clients.
app.post('/api/events', (req, res, next) => {
  req.agentId = normalizeAgentId(req.body?.agent_id || 'gatis');
  next();
}, requireAgentToken, async (req, res) => {
  try {
    const text = String(req.body?.event_text || req.body?.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'event_text is required' });
    const out = await addEvent(req.agentId, text);
    res.status(201).json({ ok: true, agent_id: req.agentId, event: out?.rows?.[0] || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const DATASETS = {
  'farm/tasks': 'farm.tasks',
  'farm/agents': 'farm.agents',
  'farm/events': 'farm.agent_events',
  'customer-service/conversations': 'customer_service.conversations',
  'customer-service/messages': 'customer_service.messages',
  'customer-service/actions': 'customer_service.agent_actions',
  'website-analytics/daily-metrics': 'website_analytics.daily_metrics',
  'helium10/keywords': 'helium10.keyword_metrics',
  'helium10/ranks': 'helium10.keyword_rank_history',
  'helium10/products': 'helium10.product_snapshots',
  'helium10/competitors': 'helium10.competitor_snapshots'
};

app.get('/api/data/:area/:resource', (req, _res, next) => {
  req.agentId = normalizeAgentId(req.query.agent_id || 'gatis');
  next();
}, requireAgentToken, async (req, res) => {
  try {
    const key = `${req.params.area}/${req.params.resource}`;
    const table = DATASETS[key];
    if (!table) return res.status(404).json({ ok: false, error: 'dataset not exposed' });
    const limit = Math.max(1, Math.min(500, Number(req.query.limit || 100)));
    const out = await queryOptional(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT $1`, [limit], { rows: [] });
    res.json({ ok: true, dataset: key, rows: out?.rows || [] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`EWART agent-bridge listening on ${PORT}`));
