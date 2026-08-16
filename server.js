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

// ---------- Usage sync (Anthropic Console usage/cost -> agent_usage cache) ----------
// POST { token } — admin-token gated. Pulls usage for every agent that has a
// row in agent_workspace_map with a workspace/api-key id, and upserts
// agent_usage. Best-effort scaffolding: Anthropic's Admin usage/cost report
// endpoints are still evolving, so this may need adjusting against a real
// Admin API key before it's fully reliable.

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
            cost_usd: usage.costUsd,
            last_synced_at: new Date().toISOString(),
          }),
        });
        results.push({ agent_id: m.agent_id, ok: true, ...usage });
      } catch (err) {
        console.error('usage sync failed for', m.agent_id, err);
        results.push({ agent_id: m.agent_id, ok: false, error: String(err.message || err) });
      }
    }
    res.json({ synced: results });
  } catch (err) {
    console.error('usage sync failed', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Best-effort call against Anthropic's Admin usage/cost report API, filtered
// by workspace or API key id. The exact request/response shape of this API
// has changed over time — treat this as a starting point to verify once a
// real ANTHROPIC_ADMIN_API_KEY + workspace/key id are available, rather than
// as a guaranteed-correct integration.
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
  const inputTokens = rows.reduce((sum, r) => sum + (r.uncached_input_tokens || 0) + (r.input_tokens || 0), 0);
  const outputTokens = rows.reduce((sum, r) => sum + (r.output_tokens || 0), 0);
  // Cost isn't part of the usage report; leave at 0 unless a cost report call is added later.
  return { inputTokens, outputTokens, costUsd: 0 };
}

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`EWART WOODS Agentu Ferma running on port ${PORT}`);
});
