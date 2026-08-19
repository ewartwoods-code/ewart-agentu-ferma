BEGIN;

-- Canonical identities used by the shared Railway agent bridge.
INSERT INTO farm.agents
  (id, name, role, tier, cutout_url, video_url, pos_x, pos_y, created_at) VALUES
  ('max-claude', 'Max / Claude', 'Galvenais domāšanas un koordinācijas aģents', 'major', '', '', 12, 20, now()),
  ('koderis', 'Koderis', 'Programmatūras izstrāde un infrastruktūra', 'major', '', '', 25, 20, now()),
  ('ance', 'Ance', 'Etsy un Amazon US/CA operācijas', 'major', '', '', 38, 20, now()),
  ('secret', 'Secret', 'Amazon EU operācijas', 'major', '', '', 51, 20, now()),
  ('dzemma', 'Džemma / Gemini', 'Apjoma izpēte, dokumenti un vizuālā analīze', 'major', '', '', 64, 20, now()),
  ('gatis', 'Gatis', 'Saimnieka GPT asistents un analītiķis', 'major', '', '', 77, 20, now()),
  ('sabine', 'Sabīne', 'Amazon reklāmu un tirgus analīze', 'major', '', '', 90, 20, now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  tier = EXCLUDED.tier;

INSERT INTO farm.agent_status (agent_id, status, current_task, quote, updated_at) VALUES
  ('max-claude', 'resting', '', '', now()),
  ('koderis', 'resting', '', '', now()),
  ('ance', 'resting', '', '', now()),
  ('secret', 'resting', '', '', now()),
  ('dzemma', 'resting', '', '', now()),
  ('gatis', 'resting', '', '', now()),
  ('sabine', 'resting', '', '', now())
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO farm.agent_usage (agent_id, input_tokens, output_tokens, cost_usd, last_synced_at) VALUES
  ('max-claude', 0, 0, 0, NULL), ('koderis', 0, 0, 0, NULL),
  ('ance', 0, 0, 0, NULL), ('secret', 0, 0, 0, NULL),
  ('dzemma', 0, 0, 0, NULL), ('gatis', 0, 0, 0, NULL),
  ('sabine', 0, 0, 0, NULL)
ON CONFLICT (agent_id) DO NOTHING;

COMMIT;
