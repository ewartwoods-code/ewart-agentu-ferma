BEGIN;

CREATE SCHEMA IF NOT EXISTS farm;

CREATE TABLE IF NOT EXISTS farm.agent_events (
  id bigint PRIMARY KEY,
  agent_id text,
  event_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.agent_skills (
  agent_id text NOT NULL,
  skill_id bigint NOT NULL,
  level text DEFAULT 'proficient',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (agent_id, skill_id)
);

CREATE TABLE IF NOT EXISTS farm.agent_status (
  agent_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'resting',
  current_task text NOT NULL DEFAULT '',
  quote text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.agent_usage (
  agent_id text PRIMARY KEY,
  input_tokens bigint NOT NULL DEFAULT 0,
  output_tokens bigint NOT NULL DEFAULT 0,
  cost_usd numeric NOT NULL DEFAULT 0,
  last_synced_at timestamptz
);

CREATE TABLE IF NOT EXISTS farm.agent_workspace_map (
  agent_id text PRIMARY KEY,
  anthropic_workspace_id text,
  anthropic_api_key_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.agents (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  tier text NOT NULL,
  cutout_url text NOT NULL,
  video_url text NOT NULL,
  pos_x numeric NOT NULL,
  pos_y numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.chat_messages (
  id bigint PRIMARY KEY,
  session_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.commands (
  id bigint PRIMARY KEY,
  agent_id text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.farm_plan (
  id integer PRIMARY KEY DEFAULT 1,
  content text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.skills (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS farm.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  what_for text,
  plan text,
  cost_amount numeric,
  cost_currency text DEFAULT 'EUR',
  cost_period text DEFAULT 'month',
  renewal_date date,
  status text DEFAULT 'active',
  notes text,
  owner_sort integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm.tasks (
  id bigint PRIMARY KEY,
  agent_id text,
  title text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'queued',
  result_summary text DEFAULT '',
  reject_note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  reviewed_at timestamptz,
  completed_at timestamptz
);

INSERT INTO farm.agents (id,name,role,tier,cutout_url,video_url,pos_x,pos_y,created_at) VALUES
('milk','Slauc govi','Minjons — datu vācējs stila tēls','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210118_c71bd63b-7898-446b-80f3-7233c0cb29b1.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_61bfb80c-9e3c-434c-be3b-f24354a5f6c1.mp4',15,70,'2026-08-15T22:03:07.134452Z'),
('chop','Cērt malku','Minjons darba laukā','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210119_304c17d8-b496-47b1-aa4d-a6fd5013916f.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_211024_042c050a-c7c7-4261-b774-faf8ae1c7c6e.mp4',7,48,'2026-08-15T22:03:07.134452Z'),
('dig','Rok bedri','Minjons darba laukā','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210120_ac593b43-f259-4b65-9082-694a6c9f1975.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_8385ec3b-30e6-4ff8-8d96-633e2f2c9238.mp4',28,78,'2026-08-15T22:03:07.134452Z'),
('plant','Stāda kartupeļus','Minjons dārza kopšanā','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210122_91ca81c2-f798-4744-a735-1f623c117313.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_43e3724c-0bca-4c7f-9283-9936166a5ac8.mp4',38,84,'2026-08-15T22:03:07.134452Z'),
('mow','Pļauj zāli','Minjons pļavas kopšanā','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210123_ced8f9b9-7041-4e47-9540-5794cf750eee.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_e9972e93-6b45-4adc-8d77-b7af585227a3.mp4',60,76,'2026-08-15T22:03:07.134452Z'),
('pigs','Gana cūkas','Minjons lopu pieskatīšanā','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210123_ffdeb3f8-be0b-4542-bdcb-cb52a0425b73.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_7ca19daf-fc5d-47cc-b396-c0b4b167a3f5.mp4',72,66,'2026-08-15T22:03:07.134452Z'),
('eggs','Lasa olas','Minjons vistkopībā','minion','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210124_7cbba37d-9fe2-4e79-933d-d441ec0fd793.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_f64c3006-a98f-4e15-b24e-a29443d35413.mp4',86,72,'2026-08-15T22:03:07.134452Z'),
('herme','Herme — Galvenais Fermeris','Kovbojs uz tumša zirga, jauns un atlētisks, īsa tumši brūna bārda','boss','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_210845_1166f74d-a027-4a9f-ad63-fdc9437b33c4.png','https://d8j0ntlcm91z4.cloudfront.net/user_3HlY8PKXkIh0uLUWus0x3Sf05L2/hf_20260815_212010_407ddeb0-2984-4cb2-bbd9-954b8a55d28f.mp4',49,58,'2026-08-15T22:03:07.134452Z')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,role=EXCLUDED.role,tier=EXCLUDED.tier,cutout_url=EXCLUDED.cutout_url,video_url=EXCLUDED.video_url,pos_x=EXCLUDED.pos_x,pos_y=EXCLUDED.pos_y,created_at=EXCLUDED.created_at;

INSERT INTO farm.agent_status (agent_id,status,current_task,quote,updated_at) VALUES
('mow','resting','Gaida nākamo pļaušanas kārtu.','Zāle jau paklanās manai izkaptij 🌾','2026-08-15T22:03:07.134452Z'),
('pigs','working','Ved sivēnus uz ganībām.','Nāciet, nāciet, sivēntiņi! 🐷','2026-08-15T22:03:07.134452Z'),
('eggs','resting','Šī rīta olas jau savāktas.','Vēl viena ola grozā! 🥚','2026-08-15T22:03:07.134452Z'),
('herme','working','Apstaigā fermu un sveicina ikvienu.','Sveiki, saimniek! Ko šodien darīsim? 🤠','2026-08-15T22:03:07.134452Z'),
('milk','working','Nepārtraukti slauc govi koka spainī, laipni sasveicinoties ar govi ik pa brīdim.','Muuu, gandrīz gatavs! 🥛','2026-08-15T22:55:27.497969Z'),
('chop','resting','','','2026-08-15T23:27:19.385735Z'),
('dig','resting','','','2026-08-15T23:27:19.385735Z'),
('plant','resting','','','2026-08-15T23:27:19.385735Z')
ON CONFLICT (agent_id) DO UPDATE SET status=EXCLUDED.status,current_task=EXCLUDED.current_task,quote=EXCLUDED.quote,updated_at=EXCLUDED.updated_at;

INSERT INTO farm.agent_usage (agent_id,input_tokens,output_tokens,cost_usd,last_synced_at) VALUES
('milk',0,0,0,NULL),('chop',0,0,0,NULL),('dig',0,0,0,NULL),('plant',0,0,0,NULL),('mow',0,0,0,NULL),('pigs',0,0,0,NULL),('eggs',0,0,0,NULL),('herme',0,0,0,NULL)
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO farm.agent_events (id,agent_id,event_text,created_at) VALUES
(1,NULL,'Ferma inicializēta ar 8 aģentiem.','2026-08-15T22:03:07.134452Z'),
(6,'plant','Pabeidza darbu, gaida apstiprinājumu: Iestādīju 50 kartupeļus!','2026-08-15T23:26:40.385731Z'),
(8,'chop','Skils atjaunināts: Amazon PPC (expert)','2026-08-15T23:26:51.747157Z'),
(9,'dig','Darbs sūtīts atpakaļ pārtaisīšanai: Vajag vairāk atslēgvārdu.','2026-08-15T23:27:06.894444Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO farm.farm_plan (id,content,updated_at) VALUES (1,'','2026-08-15T23:27:19.385735Z')
ON CONFLICT (id) DO UPDATE SET content=EXCLUDED.content,updated_at=EXCLUDED.updated_at;

INSERT INTO farm.subscriptions (id,name,what_for,plan,cost_amount,cost_currency,cost_period,renewal_date,status,notes,owner_sort,created_at) VALUES
('12383db9-b75c-434e-9eaf-4d60345719e5','Claude (Anthropic)','AI izpilditajs (Koderins)','Pro/Max',NULL,'USD','month',NULL,'active','cena TBD',1,'2026-08-16T17:42:50.780517Z'),
('73e9edcc-eb20-4119-8cda-389a1f67a7d2','OpenAI','Smadzenes + bals->teksts + atbildes',NULL,NULL,'USD','month',NULL,'active','TBD',2,'2026-08-16T17:42:50.780517Z'),
('c387737f-344e-4bde-b253-e6e220b989a7','ElevenLabs','Balss atbildes (Bella)','Starter',NULL,'USD','month',NULL,'active','40000 zim/men - TBD',3,'2026-08-16T17:42:50.780517Z'),
('add1a573-bae5-46d6-8694-06fd8293909c','Higgsfield','Attelu/video generesana','Plus',9.99,'USD','month',NULL,'active','no t-0002',4,'2026-08-16T17:42:50.780517Z'),
('108882c1-61d4-46e1-beac-aef9ce2fcd4c','Supabase','Fermas datubaze',NULL,NULL,'USD','month',NULL,'active','TBD',5,'2026-08-16T17:42:50.780517Z'),
('7c27df55-4be1-4ad8-9487-8471651b57fb','Railway','Majas lapas hostings',NULL,NULL,'USD','month',NULL,'active','TBD',6,'2026-08-16T17:42:50.780517Z'),
('5665c9b4-94cc-4819-8961-99c74c503ff6','Klaviyo','E-pasta marketings',NULL,NULL,'USD','month',NULL,'active','TBD',7,'2026-08-16T17:42:50.780517Z')
ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,what_for=EXCLUDED.what_for,plan=EXCLUDED.plan,cost_amount=EXCLUDED.cost_amount,cost_currency=EXCLUDED.cost_currency,cost_period=EXCLUDED.cost_period,renewal_date=EXCLUDED.renewal_date,status=EXCLUDED.status,notes=EXCLUDED.notes,owner_sort=EXCLUDED.owner_sort,created_at=EXCLUDED.created_at;

COMMIT;

SELECT 'farm migration complete' AS result;
