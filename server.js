const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const templatePath = path.join(__dirname, 'public', 'index.html');

// Serve index.html with the Supabase URL/anon key injected at request time,
// so the values can be changed via Railway env vars without rebuilding.
app.get('/', (req, res) => {
  let html = fs.readFileSync(templatePath, 'utf8');
  html = html
    .replace('__SUPABASE_URL__', SUPABASE_URL)
    .replace('__SUPABASE_ANON_KEY__', SUPABASE_ANON_KEY);
  res.type('html').send(html);
});

app.get('/healthz', (req, res) => res.status(200).send('ok'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`EWART WOODS Agentu Ferma running on port ${PORT}`);
});
