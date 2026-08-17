# Task t-0018 — Subscriptions overview on the farm main screen

- **id:** t-0018
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`)
- **kind:** `code_local`
- **priority:** high
- **model_hint:** default (medium) — front-end + a small DB table; be precise, not clever.

## Owner's ask (verbatim spirit)
On the farm's MAIN screen the owner wants to see **all subscriptions** — which service is
subscribed, where/what it is for, and how much it costs. One clear place on the main
screen so he knows **at a glance where money goes and what each thing costs.** This
includes the AI platforms (Claude, OpenAI, ElevenLabs, Gemini…) and any other service
(Higgsfield, Supabase, Railway, Klaviyo, …).

## What to build

### 1. Data model (the source of truth)
A small table `subscriptions` in Supabase (add a migration `app/supabase/migrations/`
mirroring the style of the existing ones) + seed rows with the owner's real subscriptions.
Columns:
- `id` uuid pk default gen_random_uuid()
- `name` text — service name (Claude, OpenAI, ElevenLabs, Higgsfield, Supabase, Railway, …)
- `what_for` text — what it is used for in the farm (one short line)
- `plan` text — plan/tier name (e.g. Max, Starter, Plus)
- `cost_amount` numeric
- `cost_currency` text default 'EUR'
- `cost_period` text — 'month' | 'year'
- `renewal_date` date (nullable)
- `status` text default 'active' — active | paused | cancelled
- `notes` text (nullable)
- `owner_sort` int — manual ordering so the list is in the order the owner wants
- `created_at` timestamptz default now()
Enable RLS with a public-read policy (same pattern as existing tables); **no writes from
anon** (owner edits subscriptions where — keep it read-only in the app UI for now).

Seed rows (fill amounts from the owner's real plan; on the ones you don't know, put the
service + what_for + status, leave cost blank with a `notes` "price TBD — owner to fill",
do NOT invent prices). At minimum: Claude (AI executant), OpenAI (voice + whisper),
ElevenLabs (voice), Higgsfield (image/video), Supabase (database), Railway (hosting),
Klaviyo (email). If you know exact current prices from the owner's accounts, fill them.

### 2. UI on the main screen
- On the farm **main screen** (the one the owner sees first — Herme aggregation panel
  area or a clearly reachable section), add a **"Subskripcijas"** block/tab/card that
  lists every subscription:
  - name
  - what_for (short)
  - plan
  - **cost per period** (e.g. "€22/mēn", "€250/gadā")
  - status dot (active/paused/cancelled)
  - renewal date if present
- Totals line at top: total monthly + total yearly (convert period so both shown; if a
  cost is blank, exclude it from totals and say so).
- Keep it reading from `subscriptions` (Supabase anon key) like the rest of the page.
  Empty state: "Subskripciju vēl nav" message.
- Latvian UI text (owner-facing). Code/comments English.

### 3. Where money rows come from (honest rule)
This is a **manual/owner-declared** list for now — no service exposes a reliable "all my
subscriptions" read. The app shows what's in `subscriptions`. Future: a worker can auto-
detect some, but do NOT build auto-detection now. Label the block so it's clear it's the
owner's subscription register.

## Constraints
- **`code_local`**: edit repo only. Do NOT deploy, do NOT spend, do NOT touch live data /
  paid keys. The new migration is **created but NOT applied** (Hermes/owner applies it).
- No Railway push, no `ewart-agentu-ferma` deploy. This folder is a snapshot.
- Do not invent prices — seed only known values; blank + `notes` "TBD" otherwise.
- Keep existing screen working; don't break the per-minion profiles / Herme panel / dots.

## Deliverables
1. Migration `app/supabase/migrations/<ts>_subscriptions.sql` (table + RLS + seed).
2. UI in `app/src/public/index.html` (or splits if that file is getting huge — keep
   readable) showing the Subskripcijas overview on the main screen.
3. Result file `exchange/results/t-0018.md` — envelope + "What changed for the owner"
   (Latvian, 3–5 lines) + verification evidence (JS checks / local server run / rows).

## Definition of done
- `subscriptions` migration exists (created, not applied) with a seed list.
- Main screen shows the subscriptions block with name/what_for/plan/cost/status + totals.
- No invented prices; unknown costs are blank with "TBD" notes.
- Verification shows 0 uncaught JS errors and the block renders from the table.