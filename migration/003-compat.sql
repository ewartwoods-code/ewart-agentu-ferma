BEGIN;

ALTER TABLE farm.agents ADD COLUMN IF NOT EXISTS parent_id text;
ALTER TABLE farm.agents ADD COLUMN IF NOT EXISTS room text;
ALTER TABLE farm.agent_usage ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE farm.tasks ADD COLUMN IF NOT EXISTS model_used text;
ALTER TABLE farm.tasks ADD COLUMN IF NOT EXISTS provider text;
ALTER TABLE farm.tasks ADD COLUMN IF NOT EXISTS result_url text;

CREATE TABLE IF NOT EXISTS farm.token_budgets (
  agent_id text PRIMARY KEY,
  plan_label text,
  budget_tokens bigint,
  window_label text,
  window_started_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.agent_scene_positions (
  scene_id text NOT NULL,
  agent_id text NOT NULL,
  pos_x numeric NOT NULL,
  pos_y numeric NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (scene_id, agent_id)
);

CREATE TABLE IF NOT EXISTS farm.agent_module_usage (
  agent_id text NOT NULL,
  provider text NOT NULL DEFAULT '',
  model text NOT NULL,
  runs bigint NOT NULL DEFAULT 0,
  input_tokens bigint NOT NULL DEFAULT 0,
  output_tokens bigint NOT NULL DEFAULT 0,
  cost_amount numeric,
  cost_currency text,
  last_used_at timestamptz,
  PRIMARY KEY (agent_id, provider, model)
);

COMMIT;
