# Task t-0044 — MULTI-PROVIDER ROUTING via OpenRouter, with Claude for special-needs tasks

```json
{
  "contract_version": "1.0",
  "task_id": "t-0044",
  "kind": "code_local",
  "title": "Route farm agents across many LLM providers via OpenRouter, picking the best-fit model per task; keep Claude for tasks needing Claude's special capabilities",
  "objective": "Build a provider/model routing layer so farm agents run on the best-fit LLM through OpenRouter (single key, many models: Claude, GPT, Gemini, DeepSeek, Meta, Mistral...), and any task needing Claude's special capabilities falls back to dedicated Claude execution.",
  "context": {
    "source_refs": [
      "AGENTS.md",
      "PRODUCT-VISION.md",
      "CLAUDE.md",
      "TASK-CONTRACT.md",
      "scripts/autopilot.sh",
      "exchange/results/t-0015.md"
    ],
    "data_refs": [],
    "notes": "OWNER DIRECTIVES (this session): (1) Agents work on DIFFERENT providers chosen by me (Hermes/the router) as the best fit for each job. (2) Use OpenRouter to run them (one key, many models). (3) When a task needs Claude's special capabilities, run it on Claude (dedicated, e.g. the owner's Mac / Anthropic). OpenRouter model catalog is reachable (HTTP 200) and includes anthropic/claude, openai/gpt, google/gemini, deepseek, meta-llama, mistral, x-ai. Today all execution is on Claude via Claude Code on the Mac. This task builds the ROUTING FRAMEWORK + an OpenRouter client + per-agent/capability model mapping + docs + tests. Live calls to non-Claude models through OpenRouter must NOT happen until an OPENROUTER_API_KEY is available (spends money) — mark honestly. code_local: change files only in this repo, local tests, do NOT deploy."
  },
  "skill": { "name": "ferma-koderis + ferma-code-quality + ferma-app-code", "version": "1.0" },
  "input": {
    "router": "OpenRouter (single key, many models)",
    "claude_fallback": "dedicated Claude for special-capability tasks",
    "best_fit": "router picks model by task/capability + cost/quality",
    "current": "all on Claude (Anthropic, Mac)",
    "supervisor": "Hermes on OpenRouter"
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "router design", "OpenRouter client", "model mapping per agent + capability", "docs (key setup, spend)", "verification evidence", "claude-fallback spec"],
    "envelope": true
  },
  "quality_gates": [
    "Router design explains WHO picks the model (Hermes/router) and HOW it is chosen (task capability × model strengths × cost)",
    "OpenRouter client exists (e.g. scripts/openrouter-client.js) that POSTs to https://openrouter.ai/api/v1/chat/completions with {model, messages}, reading OPENROUTER_API_KEY from env, with a no-key dry-run mode",
    "Model mapping (agent → OpenRouter model id / provider) is a proposal, e.g.: coding=depth model, research=fast/cheap (gemini-flash, deepseek), content/creative=strong GPT or Claude, vision=vision-capable; each justified",
    "Claude fallback spec: tasks marked 'claude_special' (e.g. complex multi-step coding that needs Claude Code tooling, long-context reasoning over the whole farm repo, MCP/business integration work) run on dedicated Claude, NOT via OpenRouter",
    "Safe default: unknown agent → Claude (existing, proven)",
    "No live non-Claude call without OPENROUTER_API_KEY; mark providers 'configured-not-live' honestly; docs say enabling spends money → needs owner GO",
    "Tests: node --check; client dry-run returns clear 'no key' message and does not call; model-map resolves each agent; claude_special routes to Claude",
    "No deploy, no fabricated model calls"
  ],
  "priority": "P1",
  "status": "queued"
}
```

## Instructions

Read `AGENTS.md`, `PRODUCT-VISION.md`, `t-0015` result first. Owner wants agents on
best-fit providers via OpenRouter, with Claude dedicated to what only Claude can do.

1. **Router design** — document the decision rule (in this repo, e.g.
   `docs/providers.md`): who picks (Hermes supervises; the router suggests; per
   agent/task), and how a model is chosen: task capability × model strengths ×
   cost/quality/latency. Name example mappings.
2. **OpenRouter client** — `scripts/openrouter-client.js`: a thin POST wrapper to
   `https://openrouter.ai/api/v1/chat/completions`, JSON body `{model, messages}`,
   header `Authorization: Bearer $OPENROUTER_API_KEY`. Support a dry-run
   (`--dry-run`) that prints the intended model + a short prompt and returns a
   clear "OPENROUTER_API_KEY not set" without calling the API. Never hardcode a key.
3. **Model mapping (proposal)** — a table agent → best-fit OpenRouter model id,
   each with a one-line why. Sketch groupings:
   - KODERIS / complex app coding → a strong reasoning model (and where Claude
     Code tooling/MCP/long-context matters → `claude_special` = dedicated Claude).
   - Fast research / trend / market trawling → cheap+fast (e.g. gemini flash,
     deepseek) unless depth needed.
   - Content / ads copy / creative drafting → strong creative model (GPT or Claude).
   - Summaries / distillation → cost-efficient mid model.
   - Any needing vision → a vision-capable model.
4. **Claude fallback spec** — define `claude_special` criteria and that such tasks
   are executed on dedicated Claude (owner's Mac / Claude Code), never via
   OpenRouter. Keep it precise (what counts, what does not).
5. **Tests** — `scripts/test-provider-router.js`: node tests that assert
   - unknown agent → claude,
   - claude_special task → claude,
   - normal agent → its mapped OpenRouter model id,
   - client --dry-run without key prints the no-key message and makes NO HTTP call.
   Run and report pass/fail counts.
6. **Docs** — `docs/providers.md`: current status per provider (claude = live on
   Mac; gpt/gemini/etc via OpenRouter = configured-not-live), exactly where
   `OPENROUTER_API_KEY` goes (Mac env / Hermes .env), and that enabling live
   non-Claude calls spends money → `needs_review` before switching on.
7. **No fabrication** — do NOT claim non-Claude models are executing. Mark them
   configured-not-live until a real key + owner GO enable them.

Finish with `exchange/results/t-0044.md` (envelope), commit, push origin master.
Do NOT deploy to Railway, do NOT call any external model API with a guessed key.