# Task t-0013 — BUILD THE APP: per-minion work tab + Herme aggregation panel

```json
{
  "contract_version": "1.0",
  "task_id": "t-0013",
  "kind": "code_local",
  "title": "Implement per-minion 'their work' view + Herme aggregation panel in the farm app",
  "objective": "Turn the existing profile modal (public/index.html) into a per-minion personal work/ data view and give Herme (the boss) a single aggregation panel, following PRODUCT-VISION.md so the farm shows real agent work instead of an empty field.",
  "context": {
    "source_refs": [
      "PRODUCT-VISION.md",
      "app/src/public/index.html",
      "app/src/public/control.html",
      ".claude/skills/ferma-app-code.md",
      ".claude/skills/ferma-supabase-backend.md",
      ".claude/skills/ferma-code-quality.md"
    ],
    "notes": "Owner's directive: zero hand-copying. Hermes now pushes tasks directly. This is a CODE task on the app snapshot in THIS repo (app/src/) — changes here do NOT deploy to the live Railway site (that repo stays separate); just build it well and verify it locally. No money, no deploy, no live writes."
  },
  "skill": {
    "name": "ferma-app-code + ferma-supabase-backend + ferma-code-quality",
    "version": "1.0"
  },
  "input": {
    "app_dir": "app/src",
    "tables": ["agents", "tasks", "agent_events", "agent_status", "agent_usage"],
    "product_vision": "PRODUCT-VISION.md"
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "what changed (files + line refs)", "verification evidence"],
    "envelope": true
  },
  "quality_gates": [
    "Files named + exact edits shown",
    "Behavior verified (node --check + run server + curl /, /healthz; front-end check)",
    "Security invariant preserved (anon key read-only; writes stay in admin_* RPCs; no keys client-side)",
    "No dead scaffolding left",
    "English in files, no Latvian diacritics"
  ],
  "priority": "P1",
  "status": "queued"
}
```

## Instructions

Read `PRODUCT-VISION.md` first — it is the owner-confirmed product spec.

1. In `app/src/public/index.html`, extend the existing **agent profile modal** so
   that clicking any minion shows a **personal "their work" section**: that
   agent's own open + closed tasks, their `agent_events` timeline, and (where the
   DB has data) their usage/metrics. Pull per-agent rows from `tasks`,
   `agent_events`, `agent_usage`. Make it data-driven, not hardcoded.
2. Add a **per-minion personalization touch** — each agent gets a distinct
   identity/feel (role, personality line, tailored data section), sourced from
   `agents` where possible.
3. Build the **Herme aggregation panel**: the boss view that summarizes the whole
   farm in one place — totals by task status, per-agent one-line summaries, a
   farm-level event overview, and (where available) aggregate usage/cost.
4. Keep the security model intact (anon read-only; writes stay in `admin_*`
   RPCs; no keys in the client). No money, no publish, no live Railway deploy.
5. Verify before you claim done: `node --check server.js`; run the server with
   dummy env and curl `/` and `/healthz`; for HTML behavior check the page
   renders and there is no obvious JS error. Report real evidence.

Finish when the profile modal is personal and Herme aggregates the farm. Write
result `exchange/results/t-0013.md` with the envelope JSON at top, then commit
and push to origin master.