const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const GATIS_AGENT_ID = process.env.GATIS_AGENT_ID || 'gatis';

if (!DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!ADMIN_TOKEN) throw new Error('ADMIN_TOKEN is required');

const pool = new Pool({ connectionString: DATABASE_URL, max: 5 });
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function bearer(req) {
  const h = String(req.headers.authorization || '');
  return h.toLowerCase().startsWith('bearer ') ? h.slice(7).trim() : '';
}

function requireAuth(req) {
  const token = bearer(req) || String(req.body?.token || req.body?.p_token || '');
  if (token !== ADMIN_TOKEN) {
    const e = new Error('invalid token');
    e.status = 401;
    throw e;
  }
}

async function tx(fn) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    c.release();
  }
}

async function addEvent(c, agentId, text) {
  await c.query('INSERT INTO farm.agent_events(agent_id,event_text) VALUES($1,$2)', [agentId || null, text]);
}

async function resolveGatisId() {
  const byId = await pool.query('SELECT id FROM farm.agents WHERE id::text=$1 LIMIT 1', [GATIS_AGENT_ID]);
  if (byId.rows[0]) return byId.rows[0].id;
  const byName = await pool.query("SELECT id FROM farm.agents WHERE lower(name)=lower('Gatis') ORDER BY created_at NULLS LAST LIMIT 1");
  return byName.rows[0]?.id || GATIS_AGENT_ID;
}

app.get('/healthz', async (_req, res) => {
  try {
    const r = await pool.query('SELECT now() AS now');
    res.json({ ok: true, service: 'gatis-api', db: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/data/health', async (_req, res) => {
  try {
    const r = await pool.query(`SELECT
      (SELECT count(*)::int FROM farm.agents) agents,
      (SELECT count(*)::int FROM farm.tasks) tasks,
      (SELECT count(*)::int FROM farm.agent_events) events,
      (SELECT count(*)::int FROM farm.skills) skills,
      (SELECT count(*)::int FROM farm.chat_messages) chat_messages`);
    res.json({ ok: true, schema: 'farm', ...r.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/gatis/context', async (_req, res) => {
  try {
    const agentId = await resolveGatisId();
    const [agent, status, tasks, events, skills] = await Promise.all([
      pool.query('SELECT id,name,role,tier,parent_id,room,created_at FROM farm.agents WHERE id=$1 LIMIT 1', [agentId]),
      pool.query('SELECT agent_id,status,current_task,quote,updated_at FROM farm.agent_status WHERE agent_id=$1 LIMIT 1', [agentId]),
      pool.query(`SELECT id,agent_id,title,description,status,started_at,reviewed_at,completed_at,result_summary,result_url,model_used,provider,reject_note
                  FROM farm.tasks WHERE agent_id=$1 AND status IN ('active','review') ORDER BY started_at ASC NULLS LAST LIMIT 50`, [agentId]),
      pool.query('SELECT id,agent_id,event_text,created_at FROM farm.agent_events WHERE agent_id=$1 ORDER BY created_at DESC LIMIT 30', [agentId]),
      pool.query(`SELECT s.id,s.name,s.description,aks.level,aks.updated_at
                  FROM farm.agent_skills aks JOIN farm.skills s ON s.id=aks.skill_id
                  WHERE aks.agent_id=$1 ORDER BY s.name`, [agentId])
    ]);
    res.json({ ok: true, agent: agent.rows[0] || null, status: status.rows[0] || null, tasks: tasks.rows, recent_events: events.rows, skills: skills.rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/gatis/tasks', async (_req, res) => {
  try {
    const agentId = await resolveGatisId();
    const r = await pool.query(`SELECT id,agent_id,title,description,status,started_at,reviewed_at,completed_at,result_summary,result_url,model_used,provider,reject_note
      FROM farm.tasks WHERE agent_id=$1
      ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'review' THEN 1 WHEN 'done' THEN 2 ELSE 3 END,
               started_at DESC NULLS LAST, id DESC LIMIT 200`, [agentId]);
    res.json({ ok: true, agent_id: agentId, tasks: r.rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/gatis/result', async (req, res) => {
  try {
    requireAuth(req);
    const { id, task_id, status, summary, result_url, model_used, provider } = req.body || {};
    const taskId = task_id || id;
    if (!taskId) return res.status(400).json({ ok: false, error: 'task id required' });
    const allowed = new Set(['active','review','done','blocked']);
    const nextStatus = allowed.has(status) ? status : 'review';

    const result = await tx(async c => {
      const r = await c.query(`UPDATE farm.tasks SET
        status=$2,
        result_summary=COALESCE($3,result_summary),
        result_url=COALESCE($4,result_url),
        model_used=COALESCE($5,model_used),
        provider=COALESCE($6,provider),
        reviewed_at=CASE WHEN $2='review' THEN now() ELSE reviewed_at END,
        completed_at=CASE WHEN $2='done' THEN now() ELSE completed_at END
        WHERE id=$1 RETURNING *`, [taskId, nextStatus, summary || null, result_url || null, model_used || null, provider || null]);
      const task = r.rows[0];
      if (!task) { const e = new Error('task not found'); e.status = 404; throw e; }

      const agentStatus = nextStatus === 'done' ? 'resting' : nextStatus === 'review' ? 'review' : nextStatus === 'blocked' ? 'blocked' : 'working';
      await c.query(`INSERT INTO farm.agent_status(agent_id,status,current_task,quote,updated_at)
        VALUES($1,$2,$3,'',now())
        ON CONFLICT(agent_id) DO UPDATE SET status=EXCLUDED.status,current_task=EXCLUDED.current_task,updated_at=now()`,
        [task.agent_id, agentStatus, nextStatus === 'done' ? '' : task.title]);
      await addEvent(c, task.agent_id, `Gatis result: ${task.title} → ${nextStatus}${summary ? ` — ${summary}` : ''}`);
      return task;
    });
    res.json({ ok: true, task: result });
  } catch (e) {
    res.status(e.status || 400).json({ ok: false, error: e.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    requireAuth(req);
    const agentId = req.body?.agent_id || await resolveGatisId();
    const text = String(req.body?.event_text || req.body?.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'event text required' });
    const r = await pool.query('INSERT INTO farm.agent_events(agent_id,event_text) VALUES($1,$2) RETURNING *', [agentId, text]);
    res.status(201).json({ ok: true, event: r.rows[0] });
  } catch (e) {
    res.status(e.status || 400).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`EWART Gatis API listening on ${PORT}`));
