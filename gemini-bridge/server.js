const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const { makeRoutes } = require('./routes');

const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL || '';
if (!DATABASE_URL) throw new Error('DATABASE_URL is required');

const pool = new Pool({ connectionString: DATABASE_URL, max: 5, idleTimeoutMillis: 30000 });
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: false }));
app.use(express.json({ limit: '256kb' }));

app.get('/healthz', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'gemini-bridge', db: 'connected', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(503).json({ ok: false, service: 'gemini-bridge', error: 'database_unavailable' });
  }
});

app.use('/api/v1/gemini', makeRoutes(pool));

app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
app.use((err, _req, res, _next) => {
  console.error('gemini-bridge error', { code: err.code, message: err.message });
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

app.listen(PORT, () => console.log(`gemini-bridge listening on ${PORT}`));
