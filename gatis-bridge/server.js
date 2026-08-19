const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL || '';
const GATIS_API_TOKEN = process.env.GATIS_API_TOKEN || '';

if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!GATIS_API_TOKEN) throw new Error('GATIS_API_TOKEN is required');

const pool = new Pool({ connectionString: DATABASE_URL, max: 5 });
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-api-key, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function requireToken(req, res, next) {
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const apiKey = String(req.headers['x-api-key'] || '');
  if ((bearer || apiKey) !== GATIS_API_TOKEN) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

async function queryOptional(sql, values = [], fallback = null) {
  try { return await pool.query(sql, values); }
  catch (e) {
    if (e.code === '42P01' || e.code === '42703') return fallback;
    throw e;
  }
}

app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'gatis-bridge', db: 'central-postgres' });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.use('/api', requireToken);

app.get('/api/gatis/context', async (_req, res) => {
  try {
    const [agents, tasks, events, customer, analytics] = await Promise.all([
      queryOptional(`SELECT a.*, s.status, s.current_task, s.updated_at AS status_updated_at
                     FROM farm.agents a LEFT JOIN farm.agent_status s ON s.agent_id=a.id
                     WHERE lower(a.id::text)='gatis' OR lower(a.name)='gatis' LIMIT 1`, [], { rows: [] }),
      queryOptional(`SELECT id,agent_id,title,description,status,started_at,reviewed_at,completed_at,result_summary,result_url
                     FROM farm.tasks WHERE lower(coalesce(agent_id::text,''))='gatis'
                     ORDER BY id DESC LIMIT 20`, [], { rows: [] }),
      queryOptional(`SELECT id,agent_id,event_text,created_at FROM farm.agent_events
                     WHERE lower(coalesce(agent_id::text,''))='gatis' ORDER BY id DESC LIMIT 20`, [], { rows: [] }),
      queryOptional(`SELECT count(*)::int AS open_conversations FROM customer_service.conversations WHERE status='open'`, [], { rows: [{ open_conversations: 0 }] }),
      queryOptional(`SELECT max(metric_date) AS latest_metric_date FROM website_analytics.daily_metrics`, [], { rows: [{ latest_metric_date: null }] })
    ]);
    res.json({
      ok: true,
      fetched_at: new Date().toISOString(),
      agent: agents?.rows?.[0] || null,
      tasks: tasks?.rows || [],
      recent_events: events?.rows || [],
      customer_service: customer?.rows?.[0] || { open_conversations: 0 },
      website_analytics: analytics?.rows?.[0] || { latest_metric_date: null }
    });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/gatis/tasks', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 25)));
    const values = ['gatis'];
    let where = `lower(coalesce(agent_id::text,''))=$1`;
    if (req.query.status) { values.push(String(req.query.status)); where += ` AND status=$${values.length}`; }
    values.push(limit);
    const out = await pool.query(`SELECT * FROM farm.tasks WHERE ${where} ORDER BY id DESC LIMIT $${values.length}`, values);
    res.json({ ok: true, tasks: out.rows });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/gatis/tasks', async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    if (!title) return res.status(400).json({ ok: false, error: 'title is required' });
    const description = String(req.body?.description || '');
    const out = await pool.query(`INSERT INTO farm.tasks(agent_id,title,description,status,started_at)
                                  VALUES('gatis',$1,$2,'active',now()) RETURNING *`, [title, description]);
    await queryOptional(`INSERT INTO farm.agent_events(agent_id,event_text) VALUES('gatis',$1)`, [`Saņēma uzdevumu: ${title}`], { rows: [] });
    res.status(201).json({ ok: true, task: out.rows[0] });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/gatis/result', async (req, res) => {
  try {
    const taskId = req.body?.task_id ?? req.body?.id;
    const status = String(req.body?.status || 'review');
    const allowed = new Set(['done','review','blocked','active']);
    if (!taskId) return res.status(400).json({ ok: false, error: 'task_id is required' });
    if (!allowed.has(status)) return res.status(400).json({ ok: false, error: 'invalid status' });
    const summary = String(req.body?.summary || req.body?.result_summary || '');
    const resultUrl = req.body?.result_url || null;
    const completed = status === 'done' ? 'now()' : 'completed_at';
    const reviewed = status === 'review' ? 'now()' : 'reviewed_at';
    const out = await pool.query(`UPDATE farm.tasks
      SET status=$2,result_summary=$3,result_url=COALESCE($4,result_url),completed_at=${completed},reviewed_at=${reviewed}
      WHERE id=$1 RETURNING *`, [taskId, status, summary, resultUrl]);
    if (!out.rows[0]) return res.status(404).json({ ok: false, error: 'task not found' });
    await queryOptional(`INSERT INTO farm.agent_events(agent_id,event_text) VALUES('gatis',$1)`, [`Rezultāts: ${status} — ${summary}`], { rows: [] });
    res.json({ ok: true, task: out.rows[0] });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/events', async (req, res) => {
  try {
    const agentId = String(req.body?.agent_id || 'gatis');
    const text = String(req.body?.event_text || req.body?.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'event_text is required' });
    const out = await pool.query(`INSERT INTO farm.agent_events(agent_id,event_text) VALUES($1,$2) RETURNING *`, [agentId, text]);
    res.status(201).json({ ok: true, event: out.rows[0] });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
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

app.get('/api/data/:area/:resource', async (req, res) => {
  try {
    const key = `${req.params.area}/${req.params.resource}`;
    const table = DATASETS[key];
    if (!table) return res.status(404).json({ ok: false, error: 'dataset not exposed' });
    const limit = Math.max(1, Math.min(500, Number(req.query.limit || 100)));
    const out = await queryOptional(`SELECT * FROM ${table} ORDER BY 1 DESC LIMIT $1`, [limit], { rows: [] });
    res.json({ ok: true, dataset: key, rows: out?.rows || [] });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.listen(PORT, () => console.log(`EWART gatis-bridge listening on ${PORT}`));
