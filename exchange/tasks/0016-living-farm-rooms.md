# Task t-0016 — Persistent living farm: always-visible minions with live status dots, avatars, and room grouping

- **id:** t-0016
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`)
- **kind:** `code_local`
- **priority:** high
- **model_hint:** default (medium) — repo-only front-end edit; no need for top-tier reasoning. Be precise, not clever.

## Goal (owner vision)

Make the farm page a **living place**: every agent/minion with a real avatar is
**permanently visible** in the farm at all times. While an agent actually works it
shows a **green** status dot; idle agents show **grey**. Later, as the team grows, the
minions should be **grouped into rooms/scenes** (e.g. an "Art barn" for image-related
minions, an "Amazon house" for everything Amazon, etc.). Build a foundation that makes
both easy now and easy to extend later.

## Current behaviour (what to change)

File: `app/src/public/index.html` (the live farm page).

- `renderAgents()` currently **hides** minions with no active/review task:
  ```js
  const isBoss = a.tier === 'boss';
  const task = latestTaskByAgent[a.id];
  const isOut = isBoss || !!task;   // minions only show up when they have an active/review task
  if(!isOut) return;                // <-- hides idle minions
  ```
- Status dot classes already exist: `.status-dot` (active), `.status-dot.resting` (idle/grey),
  `.status-dot.review`. Wire them to the real working state.

## Requirements

### 1. All real minions always visible
- Remove the hide: every agent (any tier) that has a `cutout_url` (a real avatar) shows
  in the farm scene permanently. Boss (Herme) still shows as usual.
- An agent with no `cutout_url` should still render (fallback placeholder avatar) rather
  than vanish — anchors in place for new minions that don't have art yet.

### 2. Live status dot
- Green = actually working (has an active task, status `active`).
- Grey = idle (no active task).
- Keep `review` styling for tasks awaiting approval (amber/yellow), distinct from green/grey.
- Update the dot live on refresh (data comes from Supabase each load; no polling needed —
  just render correctly per fetch).

### 3. Real, appropriate avatar per agent
- Give the **Coder (KODERIS)** a fitting avatar — a Coder/dev persona clearly distinguishable
  from the boss and other minions.
- For every other existing agent, if it already has a `cutout_url`, keep it; if one is
  missing or generic, add a fitting persona avatar (research, ads, seo, support, etc.) via
  the `agents` seed / data so each minion has a distinct look. Do NOT overwrite an existing
  real cutout unless it is a placeholder.
- Where to put avatars: check how `cutout_url` is currently populated (likely a URL field)
  and follow the same mechanism. If avatars are stored as URLs, add/replace the seed entries.

### 4. Room / scene grouping foundation (extensible)
- Introduce a light **room/zone** concept on the scene so minions can be grouped:
  - Add a `room` field to the minion's visual grouping (e.g. by agent category / a `room`
    label on the agent). Group minions visually into labelled zones (a faint background
    panel + a name like "Mākslas šķūnis", "Amazones ēka", "Vispārējā").
  - The default can be a single "Ferma" room until rooms are populated; existing `pos_x`/
    `pos_y` positions should still work (place within whichever room the agent belongs to).
  - Make it trivial to add a new room later (a small room list + agent→room mapping),
    because the owner will grow rooms as agents grow.

### 5. Tech notes
- Keep it **front-end only** in `app/src/public/index.html` unless a schema tweak is truly
  required; if you must touch the DB/schema, mark it clearly and stop for approval (no
  deployment here).
- Reuse existing patterns (`sbGet`, `agents`, `agent_status`, modal/profiles, escapeHtml).
- All UI text is Latvian (owner-facing) — keep it that way. Code/comments in English.

## Constraints
- **`code_local`**: edit the repo only. Do NOT deploy, do NOT spend, do NOT touch live
  data or paid keys, do NOT call external paid APIs. No Railway push, no `ewart-agentu-ferma`
  deploy.
- This repo folder (`app/`) is a snapshot — it is NOT the live site. A change "lands live"
  only when Hermes later copies it to `ewartwoods-code/ewart-agentu-ferma` main. Do not
  report "deployed".
- Verify locally: run the server with dummy env, drive the page (jsdom-style or manual
  fetch), confirm all minions show, dots reflect status, avatars load, no JS errors.

## Deliverables
1. Updated `app/src/public/index.html` implementing all of the above.
2. Any avatar/seed additions clearly listed (paths/URLs, not binary art uploads).
3. Result file `exchange/results/t-0016.md` with the envelope JSON + a short
   "What changed for the owner" (Latvian, 3–5 lines) + verification evidence
   (checks run, JS errors = 0, minions visible count, rooms list).

## Definition of done
`exchange/results/t-0016.md` exists with a valid envelope; every agent with an avatar is
permanently visible; green/grey dots reflect working/idle; Coder has a distinct avatar;
room grouping foundation is in place and documented; verification shows 0 uncaught JS
errors and the surfaced minion set is the full agent set.