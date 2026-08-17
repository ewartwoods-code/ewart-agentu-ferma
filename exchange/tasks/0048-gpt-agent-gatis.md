# Task t-0048 — Add the owner's existing GPT as a separate farm agent "Gatis"

- **id:** t-0048
- **from:** Hermes (supervisor) / owner
- **to:** Claude (KODERIS, cowork session) — execute this in an interactive Claude
  Code cowork session on the Mac, with the owner watching/confirming live.
- **kind:** `code_local` (repo + DB additions only; no deploy, no paid-key enable)
- **priority:** high
- **provider:** `claude`
- **model_hint:** this is a wiring task, runs on dedicated Claude.

---

## Owner's ask (verbatim spirit)

"Uzraksti instrukciju Claude, lai tā veic darbības cowork, lai pievienotu GPT kā
atsevišķu aģentu tev — manu esošo GPT, ar ko es pirms tam strādāju. Šo aģentu sauc
par **Gatis** (owner spells it "gaču"). Jums ir nepieciešama savstarpēja datu
apmaiņa, lai varat izpildīt uzdevumus ātri, efektīvi un ļoti kvalitatīvi."

In short: register the owner's existing GPT as a **named, separate agent "Gatis"**
inside the EWART farm, and build a **two-way data-exchange channel** so Hermes /
Claude and Gatis can pass tasks and results to each other quickly and at high
quality.

---

## What to do, in order

### 0. Preconditions / guardrails
- **Read-only on live money & business systems.** You are wiring the *plumbing*:
  repo files, DB metadata, a task file. You do NOT deploy, publish, spend, enable a
  paid key outside what exists, or touch live ads/listings/prices.
- The owner will confirm each live step (partner/cowork). If a step trips a
  `needs_review`, stop and report — don't force.
- If the OpenAI/OpenRouter key is not already present in the `.env`, **do not** add
  a new paid key here; record it as a required-env note for the owner instead.
- Work entirely inside the farm repo `/Users/maksimsjekimovs/ewart-woods-farm` (and
  the DB metadata), mirroring the established agent-registration pattern.

### 1. Register Gatis as a real farm agent
1. **DB** (`agents` table in Supabase project `ewart-ai`): add one row —
   - `vards` (name): **Gatis** (owner's name for it; keep "Gatis"/"Gatis" as shown).
   - `modelis`: `openai/gpt-5.6-luna` (the farm's verified GPT model id, per
     `docs/providers.md` §4) — OR the exact OpenAI model the owner's existing GPT
     uses; ask/confirm. Record whichever is real, defaulting to the verified id.
   - `sys_prompt`: a short Latvian/English role line — e.g. "Gatis — saimnieka
     personīgais GPT asistents; strādā kopā ar Hermi (fermas uzraugs) caur kopīgu
     datu apmaiņas kanālu `exchange/gatis/`."
   - `or_key` (has key): mirror the GPT/OpenRouter key availability (usually the
     shared OPENROUTER_API_KEY is present → true). Do not invent a separate key.
   - `aktivs` (active): true.
   - `kind`: `read` (research/analysis/text) + `write`-gated for anything affecting
     money/publish — same matrix as other agents in `AGENTS.md`.
2. **`AGENTS.md`** — add an entry:
   > **Gatis — kind: `read` (write gated)** · the owner's personal GPT assistant.
   > Runs via OpenRouter `provider: gpt` (see `docs/providers.md`). Works through the
   > shared two-way channel `exchange/gatis/` (`inbox.ndjson` task-in, `outbox.ndjson`
   > result-out, `context.md` shared context). Hermes routes tasks to him with
   > `provider: gpt` + `agent: gatis`; his results return with a standard envelope.
3. **`knowledge/agents-inventory.md`** — add a row to the registered-agents table
   mirroring the DB row + model + kind, so the app and Hermes both know he is real.

### 2. Build the two-way data-exchange channel
Create `exchange/gatis/` with four files:

1. **`exchange/gatis/README.md`** — who Gatis is, the protocol, and an example of
   a task/turn and its result (so both sides and the owner can read it).
2. **`exchange/gatis/context.md`** — the shared knowledge pack Gatis always gets so
   any turn is high-quality without re-transmitting: the EWART essentials (product
   = handmade wood home-decor; regions DE/FR/IT/ES/UK/US/NO; buyer = woman 28-49,
   small-space, plants/dog/kids; channels Etsy/Amazon/Shopify/Google; budget rules
   = 10% of prior-month turnover, blog ≤100 €/post; style = short, concrete,
   truth-rated, no invented numbers; owner = Ewart, Latvian). Keep it a living file
   — Claude/Hermes update it, Gatis reads it first.
3. **`exchange/gatis/inbox.ndjson`** — JSON-lines, one task per line, written by
   Hermes/Claude for Gatis. Each line:
   ```
   {"id":"g-<NNN>","at":"<ISO>","from":"herme","to":"gatis","task":"<what to do>",
    "context_ref":"exchange/gatis/context.md","expects":"<deliverable shape>",
    "deadline":"<ISO or ''>"}
   ```
4. **`exchange/gatis/outbox.ndjson`** — JSON-lines, one result per line, written by
   Gatis for Hermes/Claude. Each line is a standard envelope:
   ```
   {"id":"g-<NNN>","at":"<ISO>","from":"gatis","to":"herme","status":"done|needs_review|blocked",
    "summary":"<what he produced>","artifacts":["<paths/urls>"]}
   ```
   And, when the result is a concrete deliverable, Gatis ALSO writes the full
   `exchange/results/t-gatis-<NNN>.md` with the envelope JSON at top (same format
   as the other farm results), so Hermes can verify and it shows in the farm.

**Task flow (round trip):**
```
Hermes/Claude: append 1 line to inbox.ndjson with g-NNN id + full task + context_ref
   → alerts Gatis (his next poll, or the owner nudges him)
Gatis: reads context.md + the inbox line, does the work, writes outbox.ndjson line
   + result md, marks done
Hermes/Claude: reads outbox + result md, VERIFIES (it is a self-report, not truth),
   merges into the farm, updates context.md if anything new was learned.
```
This mirrors the farm's existing `exchange/tasks → exchange/results` pattern, but
in a dedicated folder so Gatis stays a distinct agent with his own lane.

### 3. Routing: how Hermes hands tasks to Gatis
Follow the established provider pattern (`docs/providers.md` §6):
- A task for Gatis is written with frontmatter `provider: gpt` and `agent: gatis`.
- `autopilot.sh`'s `af_extract_task_provider` already routes `provider: gpt` to
  `node scripts/model-runner.js` (OpenRouter `openai/*`), which executes the task
  with Gatis' model and records cost. Confirm the routing path in `model-runner.js`
  accepts an `agent:` id and reports `usage.cost` (it does per §6).
- For quick conversational turns (not full tasks), use `exchange/gatis/inbox.ndjson`
  directly rather than a full task file — that is the low-latency lane.

### 4. Task to hand Gatis the shared protocol (self-install)
Create `exchange/tasks/0049-gatis-instructions.md` whose body IS a copy of this
`context.md` + the outbox protocol + a first "who am I" turn, so the first thing
Gatis ever does can be read directly from the channel (he defines himself from the
context, not from a one-line prompt). This makes the first exchange high-quality.

---

## Definition of done (verify each)
- [ ] `agents` DB row for **Gatis** exists (vards=Gatis, modelis, sys_prompt, kind,
      aktivs=true) — verify with a read-back SELECT, not just the INSERT.
- [ ] `AGENTS.md` and `knowledge/agents-inventory.md` list Gatis.
- [ ] `exchange/gatis/README.md`, `context.md`, `inbox.ndjson`, `outbox.ndjson`
      exist; README shows a worked example.
- [ ] A first real test turn: Hermes drops `g-0001` in inbox → Gatis replies in
      outbox with a valid envelope → result verified. (If Gatis isn't reachable in
      this session, the test is: inbox line + outbox empty + a clear note "awaiting
      Gatis' first poll" — do NOT fake his reply.)
- [ ] No deploy, no money, no new paid-key enabled without owner OK. All changes
      committed to `ewart-woods-farm` master and pushed.

## Out of scope
- Enabling a brand-new paid OpenAI key (only reuse OPENROUTER_API_KEY if present).
- Deploying any new app route for Gatis (that is a later `needs_review`).
- Inventing Gatis' model id — confirm or default to the verified `openai/gpt-5.6-luna`.

---

*Written by Hermes 2026-08-17. This file is the instruction; execute it in a Claude
cowork session, then reply with the verification evidence (read-backs, file paths,
the g-0001 round-trip result).*