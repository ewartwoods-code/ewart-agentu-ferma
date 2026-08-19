CREATE SCHEMA IF NOT EXISTS gemini_bridge;

CREATE TABLE IF NOT EXISTS gemini_bridge.task_results (
  id bigserial PRIMARY KEY,
  task_id text NOT NULL,
  source text NOT NULL DEFAULT 'gemini',
  status text NOT NULL,
  summary text NOT NULL DEFAULT '',
  artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  error jsonb,
  is_financial boolean NOT NULL DEFAULT false,
  is_deletion boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, source)
);

CREATE TABLE IF NOT EXISTS gemini_bridge.audit_logs (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  message text NOT NULL,
  task_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'gemini',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gemini_bridge_task_results_status_idx ON gemini_bridge.task_results(status);
CREATE INDEX IF NOT EXISTS gemini_bridge_audit_logs_task_idx ON gemini_bridge.audit_logs(task_id);
CREATE INDEX IF NOT EXISTS gemini_bridge_audit_logs_created_idx ON gemini_bridge.audit_logs(created_at DESC);
