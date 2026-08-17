const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
// Service role key: server-side only, never sent to the browser. Needed to
// write chat_messages (no public insert policy) and to read app_secrets for
// admin-token checks on the usage-sync endpoint. Optional — chat/usage-sync
// simply report "not configured" until it's set in Railway.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Herme chat: server-side only key, never sent to the browser. Optional —
// the chat button explains itself as unavailable until this is set.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL || 'claude-3-5-haiku-latest';

// Admin API key for the Anthropic Console usage/cost report — separate from
// the chat key above, and optional. Only needed for the "Sinhronizēt
// tokenus" button in the control panel.
const ANTHROPIC_ADMIN_API_KEY = process.env.ANTHROPIC_ADMIN_API_KEY || '';

app.use(express.json());

// Resolve a template file, tolerating it living at public/<name> or the repo root
// (guards against file-structure mistakes from manual uploads).
function resolveTemplate(name) {
  const candidates = [
    path.join(__dirname, 'public', name),
    path.join(__dirname, name),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Template not found: ${name} (looked in ${candidates.join(', ')})`);
}

function renderTemplate(name, res) {
  try {
    let html = fs.readFileSync(resolveTemplate(name), 'utf8');
    html = html
      .replace(/__SUPABASE_URL__/g, SUPABASE_URL)
      .replace(/__SUPABASE_ANON_KEY__/g, SUPABASE_ANON_KEY);
    res.type('html').send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server configuration error: ' + err.message);
  }
}

// Serve pages with the Supabase URL/anon key injected at request time,
// so the values can be changed via Railway env vars without rebuilding.
app.get('/', (req, res) => renderTemplate('index.html', res));
app.get('/admin', (req, res) => renderTemplate('admin.html', res));
app.get('/control', (req, res) => renderTemplate('control.html', res));

app.get('/healthz', (req, res) => res.status(200).send('ok'));

// EWART BRAIN — the generated report journal (static, section-coded).
app.get('/brain', (req, res) => renderTemplate(path.join('brain','index.html'), res));
app.get('/brain/*', (req, res) => {
  const rel = decodeURIComponent(req.params[0] || '');
  const candidate = path.join(__dirname, 'public', 'brain', rel);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return res.type(path.extname(candidate) || 'html').send(fs.readFileSync(candidate));
  }
  res.status(404).send('not found');
});

// ---------- Supabase REST helpers (server-side; service role bypasses RLS) ----------

async function sbServiceFetch(pathAndQuery, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role key not configured');
  }
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + pathAndQuery, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${options.method || 'GET'} ${pathAndQuery} failed: ${res.status} ${body}`);
  }
  return res.status === 204 ? null : res.json().catch(() => null);
}

async function checkAdminToken(token) {
  if (!token) return false;
  try {
    const rows = await sbServiceFetch('app_secrets?select=value&key=eq.admin_token');
    return !!(rows && rows[0] && rows[0].value === token);
  } catch (err) {
    console.error('admin token check failed', err);
    return false;
  }
}

// ---------- Herme chat ----------
// POST { session_id, message } -> { reply }
// Open to any visitor (no admin token) — this is the public "talk to the
// boss" feature, not a privileged action. Persists both sides of the
// conversation via the service role key (chat_messages has no public
// insert policy, only public read, so the client can poll/read it back).

app.post('/api/herme-chat', async (req, res) => {
  const sessionId = String((req.body && req.body.session_id) || '').slice(0, 128);
  const message = String((req.body && req.body.message) || '').trim().slice(0, 2000);

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'session_id un message ir obligāti.' });
  }
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'Herme čats vēl nav pieslēgts (trūkst ANTHROPIC_API_KEY servera iestatījumos).',
    });
  }

  try {
    // Pull recent history for this visitor's session for context (best effort).
    let history = [];
    try {
      if (SUPABASE_SERVICE_ROLE_KEY) {
        history = await sbServiceFetch(
          `chat_messages?select=role,content&session_id=eq.${encodeURIComponent(sessionId)}&order=created_at.asc&limit=30`
        ) || [];
      }
    } catch (err) {
      console.error('chat history fetch failed', err);
    }

    const anthropicMessages = history
      .map(m => ({ role: m.role === 'herme' ? 'assistant' : 'user', content: m.content }))
      .concat([{ role: 'user', content: message }]);

    const systemPrompt = [
      'Tu esi Herme — jautrais, sirsnīgais fermas boss no "EWART WOODS Aģentu Fermas",',
      'kur mazi AI aģenti ("minjoni") strādā pie koka izstrādājumu biznesa uzdevumiem.',
      'Runā latviski, draudzīgi un ar vieglu fermas/koka tematikas humoru, bet īsi',
      '(2-5 teikumi). Tu vari runāt par fermas darbu, minjoniem, uzdevumiem un plāniem,',
      'bet nekad neizdomā konkrētus biznesa skaitļus, kurus nezini — ja nezini, saki to godīgi.',
    ].join(' ');

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_CHAT_MODEL,
        max_tokens: 400,
        system: systemPrompt,
        messages: anthropicMessages,
      }),
    });

    if (!apiRes.ok) {
      const body = await apiRes.text().catch(() => '');
      throw new Error(`Anthropic API ${apiRes.status}: ${body}`);
    }
    const data = await apiRes.json();
    const reply = (data.content || []).map(b => b.text || '').join('').trim()
      || 'Hmm, pagaidām nav ko teikt — pamēģini vēlreiz.';

    // Persist both sides (best effort — chat still works even if this fails).
    try {
      if (SUPABASE_SERVICE_ROLE_KEY) {
        await sbServiceFetch('chat_messages', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify([
            { session_id: sessionId, role: 'user', content: message },
            { session_id: sessionId, role: 'herme', content: reply },
          ]),
        });
      }
    } catch (err) {
      console.error('chat persist failed', err);
    }

    res.json({ reply });
  } catch (err) {
    console.error('herme-chat failed', err);
    res.status(500).json({ error: 'Herme pašlaik neatbild — pamēģini vēlreiz vēlāk.' });
  }
});

// ---------- Usage sync (Anthropic Console usage report -> agent_usage cache) ----------
// POST { token } — admin-token gated. Pulls token counts for every agent that
// has a row in agent_workspace_map with a workspace / api-key id and updates
// agent_usage.
//
// HONESTY CONTRACT — read before changing anything here:
//
//  * TOKENS ONLY. This endpoint never writes cost_usd. Anthropic's usage report
//    does not carry cost, and the previous version wrote a hardcoded 0, which
//    the UI then rendered as "$0.00" as if it had been measured. Cost stays
//    "not tracked" until somebody adds a verified cost-report call against a
//    real Admin key. An empty field beats a confident wrong number.
//
//  * PROVENANCE. Every row written records agent_usage.source = the constant
//    below, so the UI can label the number instead of implying it was always
//    measured.
//
//  * SELF-VERIFYING FIRST RUN. This code has never run against a real Admin API
//    key (no key is configured, and enabling one is an owner decision). So the
//    response echoes `fields_seen` — the numeric keys the API actually returned
//    in the first result row. If those names differ from the ones summed below,
//    the very first real run says so instead of silently producing a wrong
//    total. Treat the numbers as unverified until that check has been made.
//
//  * SUBSCRIPTION USAGE IS NOT HERE. This reports a Console API organization's
//    usage. Tokens the Mac autopilot spends through a Claude subscription are a
//    different billing surface and no API exposes them — that is why the meter
//    shows "left" against an owner-declared budget, never a fetched balance.

const USAGE_SOURCE = 'anthropic_admin_api';

// Field names summed into input_tokens. `input_tokens` and
// `uncached_input_tokens` name the SAME quantity in different revisions of the
// report, so at most one of them is counted — summing both would double it.
// The cache fields are separate quantities and are added on top, because they
// are input tokens the account really spent.
const INPUT_FIELDS_EXCLUSIVE = ['input_tokens', 'uncached_input_tokens'];
const INPUT_FIELDS_ADDITIVE = ['cache_creation_input_tokens', 'cache_read_input_tokens'];
const OUTPUT_FIELDS_EXCLUSIVE = ['output_tokens'];

app.post('/api/usage/sync', async (req, res) => {
  const token = (req.body && req.body.token) || '';
  if (!(await checkAdminToken(token))) {
    return res.status(401).json({ error: 'invalid token' });
  }
  if (!ANTHROPIC_ADMIN_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_ADMIN_API_KEY nav iestatīts serverī.' });
  }
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(503).json({ error: 'SUPABASE_SERVICE_ROLE_KEY nav iestatīts serverī.' });
  }
  // agent_usage.source arrives with migration 20260816190000. Without it the
  // PATCH below would fail per agent with an opaque PostgREST error, so say it
  // once, up front.
  if (!(await hasUsageSourceColumn())) {
    return res.status(503).json({
      error: 'Datubaze vel nav migreta: truukst agent_usage.source '
        + '(migration 20260816190000_agent_hierarchy_and_token_budgets.sql).',
    });
  }

  try {
    const mappings = await sbServiceFetch(
      'agent_workspace_map?select=agent_id,anthropic_workspace_id,anthropic_api_key_id'
    ) || [];

    const results = [];
    for (const m of mappings) {
      if (!m.anthropic_workspace_id && !m.anthropic_api_key_id) continue;
      try {
        const usage = await fetchAnthropicUsageFor(m);
        await sbServiceFetch(`agent_usage?agent_id=eq.${encodeURIComponent(m.agent_id)}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            input_tokens: usage.inputTokens,
            output_tokens: usage.outputTokens,
            source: USAGE_SOURCE,
            last_synced_at: new Date().toISOString(),
          }),
        });
        results.push({ agent_id: m.agent_id, ok: true, ...usage });
      } catch (err) {
        console.error('usage sync failed for', m.agent_id, err);
        results.push({ agent_id: m.agent_id, ok: false, error: String(err.message || err) });
      }
    }
    res.json({
      synced: results,
      cost_tracked: false,
      note: 'Token counts only. Cost is not tracked by this endpoint; '
        + 'check fields_seen against the summed fields on the first real run.',
    });
  } catch (err) {
    console.error('usage sync failed', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// True when migration 20260816190000 has been applied. A failure to read the
// column (missing column, or Supabase unreachable) is reported as "not ready"
// rather than thrown, so the caller gets one clear message.
async function hasUsageSourceColumn() {
  try {
    await sbServiceFetch('agent_usage?select=source&limit=1');
    return true;
  } catch (err) {
    console.error('agent_usage.source probe failed', err);
    return false;
  }
}

// Sum one exclusive group (first field present wins) plus any additive fields.
function sumTokenFields(rows, exclusive, additive) {
  return rows.reduce((sum, r) => {
    const key = exclusive.find(k => typeof r[k] === 'number');
    let n = key ? r[key] : 0;
    for (const k of additive) {
      if (typeof r[k] === 'number') n += r[k];
    }
    return sum + n;
  }, 0);
}

// Call Anthropic's Admin usage report, filtered by workspace or API key id.
// Returns token counts plus the numeric field names actually present, so the
// first run against a real key proves (or disproves) the field mapping above.
async function fetchAnthropicUsageFor(mapping) {
  const params = new URLSearchParams();
  params.set('limit', '1');
  if (mapping.anthropic_workspace_id) params.append('workspace_ids[]', mapping.anthropic_workspace_id);
  if (mapping.anthropic_api_key_id) params.append('api_key_ids[]', mapping.anthropic_api_key_id);

  const res = await fetch(`https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`, {
    headers: {
      'x-api-key': ANTHROPIC_ADMIN_API_KEY,
      'anthropic-version': '2023-06-01',
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic usage API ${res.status}: ${body}`);
  }
  const data = await res.json();
  const rows = (data.data || []).flatMap(bucket => bucket.results || []);

  return {
    inputTokens: sumTokenFields(rows, INPUT_FIELDS_EXCLUSIVE, INPUT_FIELDS_ADDITIVE),
    outputTokens: sumTokenFields(rows, OUTPUT_FIELDS_EXCLUSIVE, []),
    rowCount: rows.length,
    fields_seen: rows.length
      ? Object.keys(rows[0]).filter(k => typeof rows[0][k] === 'number')
      : [],
  };
}

// ---------- EWART BRAIN task inbox ----------
// POST { code?, msg } -> appends a task request to a local inbox file the
// farm's Hermes sync reads, then writes a task file + picks it up.
// Read-only-safe: this only records a *request*; actually creating the task
// and its execution is the farm's job. No Supabase needed.
const INBOX = path.join(__dirname, 'state', 'task-inbox.ndjson');

app.post('/api/task-inbox', (req, res) => {
  const code = String(req.body && req.body.code || '').slice(0, 40);
  const msg = String(req.body && req.body.msg || '').trim().slice(0, 4000);
  if (!msg) return res.status(400).json({ ok: false, error: 'Uzdevuma apraksts ir obligāts.' });
  try {
    fs.mkdirSync(path.dirname(INBOX), { recursive: true });
    const rec = { at: new Date().toISOString(), code: code || null, msg, from: 'brain' };
    fs.appendFileSync(INBOX, JSON.stringify(rec) + '\n', 'utf8');
    res.json({ ok: true, message: 'Iesniegts u uzdevuma virkni.', id: rec.at });
  } catch (err) {
    console.error('task-inbox failed', err);
    res.status(500).json({ ok: false, error: String(err.message || err) });
  }
});

// ================= GATIS BRIDGE (Custom GPT <-> Hermes farm) =============
// Lets Hermes hand tasks to the owner's subscription Custom GPT "Gatis" via
// his GPT "Action" (webhook): Gatis polls for a task, works it, and posts the
// result back. Files live in exchange/gatis/ (inbox.ndjson / outbox.ndjson).
const GATIS_DIR = process.env.GATIS_DIR || (() => {
  // The app ships its own synced copy of the gatis channel at <app>/exchange/gatis
  // (kept in sync with the farm repo by Hermes). Fallbacks for local dev:
  //  - farm repo app/src → ../.. /exchange/gatis
  //  - app repo root     → ./exchange/gatis
  const inApp = path.join(__dirname, '..', 'exchange', 'gatis');          // app/exchange/gatis
  if (fs.existsSync(inApp)) return inApp;
  const inFarm = path.join(__dirname, '..', '..', 'exchange', 'gatis');   // farm repo
  return fs.existsSync(inFarm) ? inFarm : inApp;
})();
const gatisPath = (f) => path.join(GATIS_DIR, f);
function gatisRead(f){ try { return require('fs').readFileSync(gatisPath(f),'utf8').trim().split('\n').filter(Boolean); } catch(_){ return []; } }
function gatisAppend(f, obj){ require('fs').appendFileSync(gatisPath(f), JSON.stringify(obj)+'\n', 'utf8'); }

// GET /api/gatis/next  -> { task } : the next un-done inbox task for Gatis
app.get('/api/gatis/next', (req, res) => {
  try {
    const tasks = gatisRead('inbox.ndjson').map((l,i)=>{ try{return JSON.parse(l);}catch(_){return null;} }).filter(Boolean);
    const pending = tasks.filter(t => !(t.__done));
    const out = gatisRead('outbox.ndjson').map(l=>{try{return JSON.parse(l);}catch(_){return null;}}).filter(Boolean);
    const doneIds = new Set(out.map(o=>o.id));
    const next = (pending.find(t => !doneIds.has(t.id)) || null);
    res.json({ ok: true, task: next });
  } catch (err) { res.status(500).json({ ok:false, error:String(err.message||err) }); }
});

// POST /api/gatis/result  { id, status, summary, artifacts? }  -> writes outbox
app.post('/api/gatis/result', (req, res) => {
  const id = String(req.body && req.body.id || '').slice(0,40);
  const status = String(req.body && req.body.status || '').slice(0,20);
  const summary = String(req.body && req.body.summary || '').slice(0,2000);
  if (!id || !status) return res.status(400).json({ ok:false, error:'id un status obligāti.' });
  try {
    gatisAppend('outbox.ndjson', { id, at:new Date().toISOString(), from:'gatis', to:'herme', status, summary, artifacts:(req.body && req.body.artifacts)||[] });
    res.json({ ok:true });
  } catch (err) { res.status(500).json({ ok:false, error:String(err.message||err) }); }
});

// GET /api/gatis/context  -> the shared knowledge (skill) Gatis should keep
app.get('/api/gatis/context', (req, res) => {
  try { res.type('text').send(require('fs').readFileSync(gatisPath('context.md'),'utf8')); }
  catch (err) { res.status(500).send(String(err.message||err)); }
});

// POST /api/gatis/skill  { text } -> append/update Gatis' skill note (his "prasmes")
app.post('/api/gatis/skill', (req, res) => {
  const text = String(req.body && req.body.text || '').trim().slice(0,4000);
  if (!text) return res.status(400).json({ ok:false, error:'text obligāts.' });
  const file = gatisPath('skills.md');
  require('fs').appendFileSync(file, '- ' + text + '\n', 'utf8');
  res.json({ ok:true });
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`EWART WOODS Agentu Ferma running on port ${PORT}`);
});
