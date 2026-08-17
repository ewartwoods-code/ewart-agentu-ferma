# Task t-0015 — TOKEN METER + AGENT HIERARCHY in the farm app

```json
{
  "contract_version": "1.0",
  "task_id": "t-0015",
  "kind": "code_local",
  "title": "Add a token-usage meter and restructure the farm into big AI agents + small specialist agents",
  "objective": "Give the owner a visible per-agent token-usage meter (how many tokens used / left) and reorganise the farm view so each AI platform (Claude now, GPT/others later) is a top-level BIG agent, with the small specialist agents nested under it.",
  "context": {
    "source_refs": [
      "PRODUCT-VISION.md",
      "app/src/public/index.html",
      "app/src/server.js",
      "app/supabase/migrations/20260815231727_agent_farm_tasks_skills_chat_usage.sql",
      ".claude/skills/ferma-koderis.md",
      ".claude/skills/ferma-app-code.md",
      ".claude/skills/ferma-supabase-backend.md",
      ".claude/skills/ferma-code-quality.md"
    ],
    "notes": "OWNER's live concern: the Mac autopilot spends his Claude Max subscription tokens on every task run, and he wants to SEE how many are left — not learn at the bill. The app already has an `agent_usage` table and a `/api/usage/sync` endpoint (currently scaffolding, cost hardcoded 0). Build the meter properly. ALSO the owner wants the farm reorganised: big AI agents (Claude now; GPT/Gemini/etc. later) as distinct top-level agents, and small specialist agents (Research, Ads, SEO, Content...) nested under them. Update PRODUCT-VISION.md to record this hierarchy. Money/paid key enabling stays needs_review. Do NOT deploy to Railway."
  },
  "skill": {
    "name": "ferma-koderis + ferma-app-code + ferma-supabase-backend + ferma-code-quality",
    "version": "1.0"
  },
  "input": {
    "app_dir": "app/src",
    "owner_concern": "autopilot spends Claude subscription tokens; must show tokens used/left per agent",
    "hierarchy": "big AI agents (Claude + future GPT/Gemini) on top; small specialist agents nested under each"
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "token-meter design + build, evidence", "hierarchy restructure, evidence", "PRODUCT-VISION.md update"],
    "envelope": true
  },
  "quality_gates": [
    "Token meter shows tokens used / left per agent, backed by real data where available (agent_usage), not hardcoded 0",
    "Honest about what's real vs estimated — if real usage values aren't available, say so clearly and show the meter with whatever is true",
    "Hierarchy: big AI agents as top-level, small specialists nested under them, reflected in PRODUCT-VISION.md",
    "node --check + server run + curl evidence",
    "No Railway deploy, no paid key enabled without needs_review",
    "Security/invariants preserved"
  ],
  "priority": "P1",
  "status": "queued"
}
```

## Instructions

Read `PRODUCT-VISION.md`, the `agent_usage` migration, and `server.js` first.
The owner's two asks together form this task.

### Part A — Token usage meter (owner's live concern)
1. The app already has `agent_usage` (input_tokens, output_tokens, cost_usd,
   last_synced_at) and `/api/usage/sync` (currently scaffolding that hardcodes
   `cost_usd = 0` and never verified the Anthropic Admin usage API shape).
2. Build the meter into the farm view (profile modal + wherever the owner looks)
   to show, **per agent**: tokens used, and where truthfully available, tokens
   left in the Claude subscription. If real left-value cannot come from the
   Anthropic API yet, show a clear "estimated / unavailable" state — never fake
   a number.
3. Keep the sync honest: if `/api/usage/sync` can't report real cost, either
   wire it correctly or clearly mark it estimate-only. Do NOT leave it pretending.
4. This touches only the local repo + a design the owner can approve to go live
   (the real meter needs `ANTHROPIC_ADMIN_API_KEY` → `needs_review` to deploy).

### Part B — Agent hierarchy (big AI agents + small specialists)
5. Restructure the farm representation so:
   - **Big AI agents** are the top level: `Claude` now; the schema/design must
     make it easy to add `GPT`, `Gemini`, etc. later as their own big agents.
   - **Small specialist agents** (Research, Ads Analyst, Ads Optimizer, Content,
     SEO, Visual, E-commerce/Ops, Reporter, Koderis) are nested **under** the big
     agent that runs them (today that is Claude).
   - The farm scene should make this hierarchy visible/explorable, fitting
     PRODUCT-VISION (clickable, visual).
6. Update `PRODUCT-VISION.md` to record this hierarchy (big AI agents + nested
   specialists) as part of the product.

Finish with `exchange/results/t-0015.md` (envelope at top), commit, push to
origin master. Do NOT deploy to Railway or enable any paid key.