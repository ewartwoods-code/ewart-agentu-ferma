# Task t-0029 — Agent profile: show skills, completed work, modules used, money spent

- **id:** t-0029
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`)
- **kind:** `code_local`
- **priority:** high
- **model_hint:** default (medium).

## Owner's ask (verbatim spirit)
Modules and module results must be VISIBLE in the Farm app on the agent — when you click on an
agent and open the agent's info, it must show:
- the agent's **skills**,
- the agent's **completed works/tasks**,
- the agent's **modules/models used**,
- and how much **money value (cost) the agent has consumed**.

## What to build

In the per-agent profile modal (already built in t-0013: Work / Profile / Events tabs),
add/replace so each agent profile shows:

1. **Skills** — the agent's assigned skills (from `agent_skills`/`skills` tables; already
   fetched in earlier work — make sure they render in the profile).
2. **Completed works** — the agent's finished tasks/works with result summaries (from
   `tasks` where status = completed / agent_id = this agent; list title, done date, result
   summary, artifact refs) — a per-agent "done work" list.
3. **Modules used** — the models/modules this agent actually used on its work (from
   `agent_usage` / task runs: model/module name per task), shown alongside the work items.
4. **Cost / money value consumed** — show how many tokens AND the estimated money value
   (cost) the agent has consumed (sum of `agent_usage` cost values; tokens + €; where the
   sync path has real numbers, use them; when cost isn't measured, say "izmaksas netiek
   mērītas" — never show fake 0). Also show tokens if available (per t-0015 token meter).

Data sources (already exist per earlier tasks): `agents`, `agent_skills`, `skills`, `tasks`,
`agent_usage`, `agent_status`. Migrations exist; if an extra field/table is truly needed,
create migration but DO NOT apply it.

## UI rules
- Latvian labels: "Skili" / "Padarītie darbi" / "Moduļi" / "Izmaksas un tokeni".
- Clicking a completed work could link to the result if stored.
- Keep existing profile tabs working; don't break dots/scenes/Herme panel/subscriptions/map.

## Constraints
- `code_local`: repo only; no deploy/spend/publish; migration created-not-applied.
- No fake numbers: if cost data is absent, show the label, not zero.

## Deliverables
1. Updated `app/src/public/index.html` (profile modal: skills, works, modules, cost).
2. Migration only if truly needed (not applied).
3. `exchange/results/t-0029.md` — envelope + "what changed for the owner" (Latvian 3-5 lines)
   + verification (0 uncaught JS errors; profile shows the 4 sections).