# Task t-0050 — Add the owner's xAI (Grok) as a separate farm agent

- **id:** t-0050
- **from:** Hermes (supervisor) / owner
- **to:** Claude (KODERIS) — mirror of t-0048/t-0049, but for xAI Grok
- **kind:** `code_local` (repo + DB additions; no deploy, no paid-key enable beyond existing)
- **priority:** high
- **provider:** `claude`

---

## Owner's ask (verbatim spirit)
"Izveidosim arī Grok aģentu (xai-... atslēga)." → Register the owner's xAI model
as a separate farm agent with his own two-way channel, exactly like Gatis and
Džemma, and state which tasks suit him.

## Status (recorded, verify before relying)
- Direct xAI key stored in runtime `.env` (`XAI_API_KEY`), NOT committed.
- **xAI direct account currently has NO credits/license** (API 403
  "team doesn't have any credits or licenses yet").
- **BUT Grok works via OpenRouter** (`x-ai/grok-4.6`) with the farm's
  OPENROUTER_API_KEY — real call 2026-08-17 returned "GROK-OK". So the agent is
  effectively LIVE via OpenRouter until the xAI account is funded.

## What to do (mirrors t-0048/t-0049)
1. **DB row** `agents`: `vards` = **Grok**, `modelis` = `x-ai/grok-4.6`
   (via OpenRouter), `sys_prompt` (role line), `or_key` = yes (OpenRouter),
   `aktivs` = true, `kind` = read. Verify with SELECT.
2. **AGENTS.md** (#17) + **knowledge/agents-inventory.md** — already added
   (this commit).
3. **Channel `exchange/grok/`** — README, context.md, inbox/outbox.ndjson,
   tool.js — already scaffolded (this commit). gk-0001 first turn queued.
4. **Routing** — `provider: grok`/`xai` + `agent: grok` → `x-ai/grok-4.6`
   via model-runner (OpenRouter). Already registered in provider-router.
5. If a real first turn runs, Džemma-style: Grok replies in outbox; Hermes verifies.

## Grok's best tasks (owner's question)
- Red-teaming / contrarian review of plans, pricing, campaigns.
- Fast judgment: "what would you do with X?", risk-spotting.
- Summarising long noisy threads/dumps.
- Sharp takes on competitors (external claims still truth-rated 1–10).

## Definition of done
- [ ] DB row Grok (SELECT). [ ] channel + gk-0001 queued. [ ] no new paid key
  enabled beyond existing; committed + pushed. (Direct xAI funding = owner choice.)

*Written by Hermes 2026-08-17.*