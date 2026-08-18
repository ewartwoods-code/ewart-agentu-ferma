BEGIN;

CREATE SCHEMA IF NOT EXISTS customer_service;
CREATE SCHEMA IF NOT EXISTS website_analytics;

CREATE TABLE IF NOT EXISTS customer_service.channel_accounts (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('amazon','etsy','shopify','email')),
  external_account_id TEXT NOT NULL,
  display_name TEXT,
  marketplace TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel, external_account_id)
);

CREATE TABLE IF NOT EXISTS customer_service.conversations (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('amazon','etsy','shopify','email')),
  channel_account_id BIGINT REFERENCES customer_service.channel_accounts(id) ON DELETE SET NULL,
  external_conversation_id TEXT NOT NULL,
  external_customer_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  order_id TEXT,
  marketplace TEXT,
  language TEXT,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_agent TEXT,
  last_message_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel, external_conversation_id)
);

CREATE TABLE IF NOT EXISTS customer_service.messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES customer_service.conversations(id) ON DELETE CASCADE,
  external_message_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  sender_type TEXT,
  sender_name TEXT,
  sender_external_id TEXT,
  body_text TEXT,
  body_html TEXT,
  language TEXT,
  message_status TEXT NOT NULL DEFAULT 'received',
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, external_message_id)
);

CREATE TABLE IF NOT EXISTS customer_service.message_attachments (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES customer_service.messages(id) ON DELETE CASCADE,
  external_attachment_id TEXT,
  file_name TEXT,
  mime_type TEXT,
  source_url TEXT,
  storage_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_service.sync_cursors (
  id BIGSERIAL PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('amazon','etsy','shopify','email')),
  channel_account_id BIGINT REFERENCES customer_service.channel_accounts(id) ON DELETE CASCADE,
  cursor_key TEXT NOT NULL DEFAULT 'default',
  cursor_value TEXT,
  last_synced_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(channel, channel_account_id, cursor_key)
);

CREATE TABLE IF NOT EXISTS customer_service.agent_actions (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES customer_service.conversations(id) ON DELETE CASCADE,
  message_id BIGINT REFERENCES customer_service.messages(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft',
  draft_text TEXT,
  final_text TEXT,
  model_used TEXT,
  provider TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  error_text TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cs_conversations_status ON customer_service.conversations(status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_cs_conversations_customer ON customer_service.conversations(channel, external_customer_id);
CREATE INDEX IF NOT EXISTS idx_cs_conversations_order ON customer_service.conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_cs_messages_conversation_time ON customer_service.messages(conversation_id, COALESCE(received_at, sent_at, created_at));
CREATE INDEX IF NOT EXISTS idx_cs_messages_status ON customer_service.messages(message_status);
CREATE INDEX IF NOT EXISTS idx_cs_agent_actions_state ON customer_service.agent_actions(state, created_at);

CREATE TABLE IF NOT EXISTS website_analytics.sync_runs (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'posthog',
  sync_type TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  rows_written INTEGER NOT NULL DEFAULT 0,
  cursor_from TEXT,
  cursor_to TEXT,
  error_text TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS website_analytics.daily_metrics (
  metric_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'posthog',
  page_path TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT '',
  sessions BIGINT NOT NULL DEFAULT 0,
  users BIGINT NOT NULL DEFAULT 0,
  pageviews BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  rage_clicks BIGINT NOT NULL DEFAULT 0,
  dead_clicks BIGINT NOT NULL DEFAULT 0,
  add_to_cart BIGINT NOT NULL DEFAULT 0,
  checkout_started BIGINT NOT NULL DEFAULT 0,
  purchases BIGINT NOT NULL DEFAULT 0,
  revenue NUMERIC(18,2) NOT NULL DEFAULT 0,
  avg_scroll_depth NUMERIC(7,4),
  avg_session_seconds NUMERIC(12,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(metric_date, source, page_path, product_id, country, device_type)
);

CREATE INDEX IF NOT EXISTS idx_wa_daily_metrics_date ON website_analytics.daily_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_wa_daily_metrics_page ON website_analytics.daily_metrics(page_path, metric_date DESC);

COMMIT;
