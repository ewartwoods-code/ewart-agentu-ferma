# Task t-0019 — Visual system/hierarchy map on the farm (who does what, connections, data flows, logos, info popups)

- **id:** t-0019
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`)
- **kind:** `code_local`
- **priority:** high
- **model_hint:** default (medium) — front-end viz work; be precise, keep it readable.

## Owner's ask (verbatim spirit)
On the farm, ADD a full **hierarchy / system map**: who does what, what is connected to
what, everything that connects, made **beautiful/visual and understandable**, with real
logos and an **info button on each** where you can open it and understand **what it is and
what it does** — all connection systems. **Including the data flows** coming in from all the
stores (Etsy, Amazon, Shopify, Google, etc.) and so on.

Goal: the owner looks at the farm's main screen and immediately sees the **whole
ecosystem graph** — agents, AI models, integrations, stores, and how data flows between
them — and can tap any node to understand it.

## What to build

### 1. A dedicated "Sistēma"/"Karte" view on the farm (main screen)
- A new top-level block/section/tab (clearly reachable from the main screen, e.g. next to
  the Herme panel) titled e.g. **"Sistēmas karte"** or **"Savienojumi"**.
- Visual **node-graph**-style map (SVG/CSS) showing:
  - **Lielie AI (platforms):** Claude, OpenAI, Gemini, Grok, ElevenLabs (+ their tier).
  - **Agents (rūķi/minions):** the specialist agents and which AI platform they run under
    (reuse the parent_id hierarchy built in t-0015).
  - **Integrations / stores:** Etsy, Amazon, Shopify, Google (Shopping/Ads), Meta, Pinterest,
    Higgsfield, Supabase, Railway, Klaviyo — with real brand logos.
  - **Data-flow arrows:** how data moves, e.g. Etsy/Amazon/Shopify -> (scraper/ingest) ->
    Supabase DB -> farm app; owner -> Hermes -> Claude/Gemini/GPT -> stores.
- Uses data where possible (agents + their parent tier from `agents`) and a curated
  static map for integrations/stores (they are mostly static real facts).

### 2. Logos + info buttons
- Show each node with its **brand logo** (use public logo URLs / favicons; if a logo can't
  load, show a tidy letter monogram fallback so the map never looks broken).
- Every node has an **info button (ⓘ)**. Clicking opens a small info modal/popup saying:
  - What this thing is (one short line).
  - What it does in this farm.
  - What it's connected to.
  - Status (active / to-be-connected / blocked) if known.
- Keep text Latvian in the UI (owner), English in code/comments.

### 3. Data-flow emphasis (stores)
Make the **data flow from the stores** explicit and visually clear: Etsy / Amazon /
Shopify / Google / (Meta) -> ingest -> Supabase database -> farm app -> agents use the data
-> (approval) -> actions back on stores. Label arrows (e.g. "dati", "uzdevumi", "rezultāti").

### 4. Info / source data model (for the map)
A small data structure (a JS config object at top of the viz, or a `connections` /
`system_map` table if you prefer; if you add a DB table, add a migration but DO NOT apply it).
Fields per node: id, name, kind (ai|agent|store|system), platform/parent, logo_url,
what_it_is, what_it_does, connects_to[], status, data_flow (in/out note). This keeps the map
easy to extend — the owner will grow it.

## Constraints
- **`code_local`**: repo only. Do NOT deploy, do NOT spend, do NOT touch live data / paid
  keys. New migration = created, NOT applied. No Railway push.
- Don't break existing: profiles, Herme panel, status dots, subscriptions block.
- The store list is based on the real ecosystem (from `knowledge/brand-principles.md` and
  `knowledge/agents/ai-platforms.md` in the repo). Etsy currently has NO connector — show it
  as "savienojuses pending".
- Latvian UI text; English code.

## Deliverables
1. Updated `app/src/public/index.html` (+ maybe a new CSS block): the Sistēmas kā node-graph
   view with logos, info buttons/popups, and store data-floor.
2. Migration for any new `connection` table ONLY IF needed (created, not applied).
3. Result file `exchange/results/t-0019.md` — envelope + "What changed for the owner"
   (Latvian, 3-5 lines) + verification (render in a check, 0 uncaught JS errors, nodes render,
   info buttons open).

## Definition of done
- Main screen has the Sistēmas kā map: agents+AI+stores+systems as nodes with logos.
- Info button on each node opens a clear modal (what it is / what it does / connected to).
- Data-flow arrows shown from Etsy/Amazon/Shopify/Google -> DB -> app -> agents (explicit).
- Mark which stores are connected vs pending (Etsy pending).
- 0 uncaught JS errors; map renders with no broken images (monogram fallback).