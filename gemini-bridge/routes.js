const express = require('express');
const { requireGeminiAuth } = require('./auth');

function makeRoutes(pool) {
  const router = express.Router();
  router.use(requireGeminiAuth);

  const allowedResources = {
    farm: { schema: 'farm', tables: ['agents','agent_status','skills','agent_skills','tasks','agent_events'] },
    customer_service: { schema: 'customer_service', tables: ['conversations','messages','agent_actions'] },
    website_analytics: { schema: 'website_analytics', tables: ['daily_metrics','sync_runs'] },
    ecommerce: { schema: 'public', tables: [] },
    production_data: { schema: 'public', tables: [] },
    inventory_data: { schema: 'public', tables: [] }
  };

  router.get('/context', async (_req, res, next) => {
    try {
      const [agent, status, skills, tasks] = await Promise.all([
        pool.query("SELECT * FROM farm.agents WHERE lower(id::text)=lower('gemini') OR lower(name)=lower('gemini') ORDER BY created_at NULLS LAST LIMIT 1"),
        pool.query("SELECT * FROM farm.agent_status WHERE lower(agent_id::text)=lower('gemini') LIMIT 1"),
        pool.query("SELECT s.name, aks.level FROM farm.agent_skills aks JOIN farm.skills s ON s.id=aks.skill_id WHERE lower(aks.agent_id::text)=lower('gemini') ORDER BY s.name"),
        pool.query("SELECT * FROM farm.tasks WHERE lower(agent_id::text)=lower('gemini') AND status IN ('active','pending','review') ORDER BY started_at DESC NULLS LAST LIMIT 25")
      ]);
      res.json({ source: 'gemini', agent: agent.rows[0] || null, status: status.rows[0] || null, skills: skills.rows, tasks: tasks.rows, timestamp: new Date().toISOString() });
    } catch (e) { next(e); }
  });

  router.get('/tasks', async (_req, res, next) => {
    try {
      const q = await pool.query("SELECT * FROM farm.tasks WHERE lower(agent_id::text)=lower('gemini') AND status IN ('active','pending','review') ORDER BY started_at ASC NULLS LAST, id ASC LIMIT 100");
      res.json(q.rows);
    } catch (e) { next(e); }
  });

  router.get('/tasks/:id', async (req, res, next) => {
    try {
      const q = await pool.query("SELECT * FROM farm.tasks WHERE id::text=$1 AND lower(agent_id::text)=lower('gemini') LIMIT 1", [req.params.id]);
      if (!q.rows[0]) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
      res.json(q.rows[0]);
    } catch (e) { next(e); }
  });

  router.post('/result', async (req, res, next) => {
    const b = req.body || {};
    if (!b.task_id) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'task_id is required' } });
    const status = (b.is_financial === true || b.is_deletion === true) ? 'needs_review' : String(b.status || 'done');
    if (!['done','blocked','needs_review'].includes(status)) return res.status(400).json({ error: { code: 'BAD_STATUS', message: 'Invalid status' } });
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const exists = await c.query("SELECT id FROM farm.tasks WHERE id::text=$1 AND lower(agent_id::text)=lower('gemini') LIMIT 1", [String(b.task_id)]);
      if (!exists.rows[0]) { await c.query('ROLLBACK'); return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } }); }
      const r = await c.query(`INSERT INTO gemini_bridge.task_results(task_id,source,status,summary,artifacts,data,error,is_financial,is_deletion)
        VALUES($1,'gemini',$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7,$8)
        ON CONFLICT(task_id,source) DO UPDATE SET status=EXCLUDED.status,summary=EXCLUDED.summary,artifacts=EXCLUDED.artifacts,data=EXCLUDED.data,error=EXCLUDED.error,is_financial=EXCLUDED.is_financial,is_deletion=EXCLUDED.is_deletion,updated_at=now()
        RETURNING *`, [String(b.task_id), status, b.summary || '', JSON.stringify(b.artifacts || []), JSON.stringify(b.data || {}), JSON.stringify(b.error || null), !!b.is_financial, !!b.is_deletion]);
      const farmStatus = status === 'done' ? 'done' : status === 'needs_review' ? 'review' : 'blocked';
      await c.query("UPDATE farm.tasks SET status=$2, result_summary=$3, completed_at=CASE WHEN $2='done' THEN now() ELSE completed_at END WHERE id::text=$1", [String(b.task_id), farmStatus, b.summary || '']);
      await c.query("INSERT INTO farm.agent_events(agent_id,event_text) VALUES('gemini',$1)", [`Gemini result: ${status} — ${b.summary || b.task_id}`]);
      await c.query(`INSERT INTO gemini_bridge.audit_logs(type,message,task_id,metadata,source) VALUES('task_result',$1,$2,$3::jsonb,'gemini')`, [b.summary || status, String(b.task_id), JSON.stringify({ requested_status: b.status || null, effective_status: status })]);
      await c.query('COMMIT');
      res.json(r.rows[0]);
    } catch (e) { await c.query('ROLLBACK'); next(e); } finally { c.release(); }
  });

  router.post('/events', async (req, res, next) => {
    try {
      const b = req.body || {};
      if (!b.type || !b.message) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'type and message are required' } });
      const q = await pool.query(`INSERT INTO gemini_bridge.audit_logs(type,message,task_id,metadata,source) VALUES($1,$2,$3,$4::jsonb,'gemini') RETURNING *`, [String(b.type), String(b.message), b.task_id ? String(b.task_id) : null, JSON.stringify(b.metadata || {})]);
      res.status(201).json(q.rows[0]);
    } catch (e) { next(e); }
  });

  router.get('/data/:resource', async (req, res, next) => {
    try {
      const cfg = allowedResources[req.params.resource];
      if (!cfg) return res.status(403).json({ error: { code: 'RESOURCE_NOT_ALLOWED', message: 'Resource is not whitelisted' } });
      if (!cfg.tables.length) return res.json({ resource: req.params.resource, rows: [], note: 'Resource reserved; no tables exposed yet' });
      const table = String(req.query.table || cfg.tables[0]);
      if (!cfg.tables.includes(table)) return res.status(403).json({ error: { code: 'TABLE_NOT_ALLOWED', message: 'Table is not whitelisted' } });
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 25));
      const sql = `SELECT * FROM "${cfg.schema}"."${table}" LIMIT $1`;
      const q = await pool.query(sql, [limit]);
      res.json({ resource: req.params.resource, table, rows: q.rows });
    } catch (e) { next(e); }
  });

  return router;
}

module.exports = { makeRoutes };
