BEGIN;

CREATE SEQUENCE IF NOT EXISTS farm.agent_events_id_seq;
ALTER TABLE farm.agent_events ALTER COLUMN id SET DEFAULT nextval('farm.agent_events_id_seq');
SELECT setval('farm.agent_events_id_seq', GREATEST(COALESCE((SELECT max(id) FROM farm.agent_events),0)+1,1), false);

CREATE SEQUENCE IF NOT EXISTS farm.chat_messages_id_seq;
ALTER TABLE farm.chat_messages ALTER COLUMN id SET DEFAULT nextval('farm.chat_messages_id_seq');
SELECT setval('farm.chat_messages_id_seq', GREATEST(COALESCE((SELECT max(id) FROM farm.chat_messages),0)+1,1), false);

CREATE SEQUENCE IF NOT EXISTS farm.commands_id_seq;
ALTER TABLE farm.commands ALTER COLUMN id SET DEFAULT nextval('farm.commands_id_seq');
SELECT setval('farm.commands_id_seq', GREATEST(COALESCE((SELECT max(id) FROM farm.commands),0)+1,1), false);

CREATE SEQUENCE IF NOT EXISTS farm.skills_id_seq;
ALTER TABLE farm.skills ALTER COLUMN id SET DEFAULT nextval('farm.skills_id_seq');
SELECT setval('farm.skills_id_seq', GREATEST(COALESCE((SELECT max(id) FROM farm.skills),0)+1,1), false);

CREATE SEQUENCE IF NOT EXISTS farm.tasks_id_seq;
ALTER TABLE farm.tasks ALTER COLUMN id SET DEFAULT nextval('farm.tasks_id_seq');
SELECT setval('farm.tasks_id_seq', GREATEST(COALESCE((SELECT max(id) FROM farm.tasks),0)+1,1), false);

COMMIT;
