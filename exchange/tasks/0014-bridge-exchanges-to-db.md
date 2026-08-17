# Task t-0014 — CONNECT THE APP TO THE REAL FARM TASK LOOP (exchange → DB bridge)

```json
{
  "contract_version": "1.0",
  "task_id": "t-0014",
  "kind": "code_local",
  "title": "Bridge the Hermes↔Claude exchange/ task loop into the app's Supabase tasks table so minions show real work",
  "objective": "Make the farm app show REAL agent work instead of an empty field: build a bridge that reads the farm's exchange/tasks + exchange/results and syncs them into the app's Supabase `tasks` (and `agent_events`) so each minion appears with its actual current task and finished work — WITHOUT deploying to live Railway or spending anything.",
  "context": {
    "source_refs": [
      "PRODUCT-VISION.md",
      "app/README.md",
      "app/supabase/migrations/*.sql",
      "exchange/",
      ".claude/skills/ferma-app-code.md",
      ".claude/skills/ferma-supabase-backend.md",
      ".claude/skills/ferma-code-quality.md"
    ],
    "notes": "app/README.md 'What is missing' item 4: the app has NEVER been connected to the real Hermes↔Claude task loop — no code writes `tasks` from exchange/. This task builds that link. IMPORTANT: build it LOCALLY in this repo and prove it with a DRY-RUN; do NOT deploy to Railway, do NOT write live data, do NOT spend money. The bridge must be safe (reads exchange/, and syncs only when explicitly run with a flag). Return a clear plan for how it would go live."
  },
  "skill": {
    "name": "ferma-app-code + ferma-supabase-backend + ferma-code-quality",
    "version": "1.0"
  },
  "input": {
    "repo": ".",
    "exchange_dir": "exchange",
    "schema_src": "app/supabase/migrations",
    "mode": "build + dry-run only (no deploy, no live write)"
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "bridge design", "script(s) built", "dry-run evidence", "go-live plan"],
    "envelope": true
  },
  "quality_gates": [
    "Bridge script exists in repo and passes node --check",
    "DRY-RUN proves it parses real exchange/ tasks into the tasks-table shape (no live DB write)",
    "No secrets/keys committed; any Supabase call uses env vars only",
    "No Railway deploy, no live data written, no money spent",
    "Go-live plan states exactly what needs owner approval + how it deploys to the ewart-agentu-ferma repo"
  ],
  "priority": "P1",
  "status": "queued"
}
```

## Instructions

Read `app/README.md` "What is missing" #4 and `PRODUCT-VISION.md` first.

1. **Design** a bridge that maps the real farm loop into the app's data model:
   - An `exchange/tasks/NNNN-slug.md` file (with its contract JSON: task_id, kind,
     title, objective, status) → a row in the app's `tasks` table (agent_id from
     the task's kind/agent, title, status, created_at).
   - The matching `exchange/results/t-NNNN.md` → a status transition + an
     `agent_events` row, so the minion's bubble/approve state reflects reality.
   - Map task kinds to the 8 farm agents (Research, Ads Analyst, Ads Optimizer,
     Content, SEO, Visual, E-commerce/Ops, Reporter) where possible; default any
     unclassified task to Herme or a generic coder minion.
2. **Build** the bridge as a Node script (e.g. `scripts/sync-tasks-to-db.js`) that:
   - Reads `exchange/tasks/` and `exchange/results/` from the repo.
   - Has a `--dry-run` mode (default ON) that prints the mapped rows as JSON and
     does NOT call Supabase.
   - Only in an explicit `--apply` mode (with real env vars) would it write — but
     keep that mode behind a clear gate and do NOT run it here.
   - Reads Supabase URL/keys from env vars only; never hardcode.
3. **Prove it in dry-run** against the real `exchange/` files currently in the
   repo. Show the actual mappings it produces for a couple of real tasks.
4. **Write a go-live plan**: what needs owner approval (deploy to the
   `ewart-agentu-ferma` repo / Railway, any service-role write), how the bridge
   would be scheduled, and what RPC / security guard it needs (writes must stay
   in `admin_*` RPCs or a reviewed path; never a public write policy).
5. Keep security: no public write policies, no keys in client, anon read-only.

Finish with `exchange/results/t-0014.md` (envelope JSON at top), commit, push to
origin master. Do NOT deploy to Railway or write live data.