BEGIN;
CREATE SCHEMA IF NOT EXISTS customer_ai;
CREATE TABLE IF NOT EXISTS customer_ai.conversations (
  id bigint PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  session_id text,
  product_title text,
  product_url text,
  language text,
  question text,
  answer text,
  ip text,
  country text,
  response_time_ms integer,
  tokens integer,
  customer_clicked_recommendation boolean DEFAULT false,
  purchased boolean DEFAULT false
);
INSERT INTO customer_ai.conversations (id,created_at,session_id,product_title,product_url,language,question,answer,ip,country,response_time_ms,tokens,customer_clicked_recommendation,purchased) VALUES
(1,'2026-06-18T09:40:44.461325+00:00','d32634f1-45f7-4cc0-bda5-797a54e6d6a3','Toilet paper holder MINI Honeycomb','https://ewartwoods.com/products/toilet-paper-holder-mini-honeycomb','','cik atra piegade uz latviju?','Piegāde uz Latviju ilgst 1–2 nedēļas.','84.15.222.109','LV',NULL,NULL,false,false),
(2,'2026-06-18T09:47:21.087695+00:00','1fc3acab-5f5a-421f-945c-68788d24f182','Toilet paper holder MINI Honeycomb','https://ewartwoods.com/products/toilet-paper-holder-mini-honeycomb','','kadas krasas pieej''mas?','Pieejamas krāsas ir dabīgā koka, balta koka, melna un pelēka.','84.15.222.109','LV',NULL,NULL,false,false),
(3,'2026-06-18T09:47:35.679341+00:00','26c4d0dc-e627-4864-9901-da412fbca649','Toilet paper holder MINI Honeycomb','https://ewartwoods.com/products/toilet-paper-holder-mini-honeycomb','','kads izmers?','Izmērs ir 26 x 15.5 x 10 cm (10.2 x 6.1 x 3.9 collas).','84.15.222.109','LV',NULL,NULL,false,false),
(4,'2026-06-18T10:03:39.721893+00:00','c2695579-cbe3-4246-9955-0f4ad833681e','Toilet paper holder MINI Honeycomb','https://ewartwoods.com/products/toilet-paper-holder-mini-honeycomb','','cik gadu ir ewart woods?','Man nav informācijas par to, cik gadu ir EWART WOODS.','84.15.222.109','LV',NULL,NULL,false,false),
(5,'2026-06-18T10:03:51.577553+00:00','ecfb3aad-74ff-473a-823e-afa80758ed85','Toilet paper holder MINI Honeycomb','https://ewartwoods.com/products/toilet-paper-holder-mini-honeycomb','','vai tev garso','Es nezinu.','84.15.222.109','LV',NULL,NULL,false,false),
(6,'2026-06-18T16:24:08.642844+00:00','d63e9c44-bad5-4676-a1cb-6fbbca5cb347','Multifunctional Play equipment SET (Mini SET)','https://ewartwoods.com/products/multifunctional-play-equipment-set-mini-set','','kads koks','Kādā koka veidā ir izgatavots Multifunctional Play equipment SET (Mini SET)?','2a00:808:145:e196:b0b0:b4df:2951:a2f3','LV',NULL,NULL,false,false),
(7,'2026-06-18T16:24:14.308906+00:00','85e60967-a44c-4922-b66c-73b6b220cf55','Multifunctional Play equipment SET (Mini SET)','https://ewartwoods.com/products/multifunctional-play-equipment-set-mini-set','','ja','Desculpe, não entendi a sua pergunta. Poderia reformulá-la?','2a00:808:145:e196:b0b0:b4df:2951:a2f3','LV',NULL,NULL,false,false),
(8,'2026-06-18T16:24:42.456396+00:00','a9f77c4f-c0f2-4671-a5ea-083a98e93ba0','Multifunctional Play equipment SET (Mini SET)','https://ewartwoods.com/products/multifunctional-play-equipment-set-mini-set','','no kāda koka izgatavots piklers?','Piklers ir izgatavots no bērza saplākšņa un pārklāts ar bērniem drošu laku.','2a00:808:145:e196:b0b0:b4df:2951:a2f3','LV',NULL,NULL,false,false)
ON CONFLICT (id) DO UPDATE SET created_at=EXCLUDED.created_at,session_id=EXCLUDED.session_id,product_title=EXCLUDED.product_title,product_url=EXCLUDED.product_url,language=EXCLUDED.language,question=EXCLUDED.question,answer=EXCLUDED.answer,ip=EXCLUDED.ip,country=EXCLUDED.country,response_time_ms=EXCLUDED.response_time_ms,tokens=EXCLUDED.tokens,customer_clicked_recommendation=EXCLUDED.customer_clicked_recommendation,purchased=EXCLUDED.purchased;
COMMIT;
SELECT count(*) AS customer_ai_conversations_count FROM customer_ai.conversations;
