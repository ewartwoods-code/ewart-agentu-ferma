const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

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

app.get('/healthz', (req, res) => res.status(200).send('ok'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`EWART WOODS Agentu Ferma running on port ${PORT}`);
});
