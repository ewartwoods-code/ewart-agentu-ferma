# Secret — Daily Amazon Ads Analysis & Optimisation (EU countries)

Owner directive (2026-08-17): Secret must now run the EU Amazon ads operation.
Every day he reviews the campaigns and makes improvements to hit the goals
(goal: profit-first; guardrails ACoS ~30%, TACoS ~10%; marketing budget = 10%
of previous-month turnover). Hermes supervises and verifies.

## Non-negotiables
- **Money = approval-gated.** Changing bids/budgets, pausing/starting campaigns,
  creating ad sets, or anything that spends is `needs_review` UNLESS the owner
  has pre-approved it for that exact change. Secret records every money change
  and Hermes/owner confirms. (Secret already hardened this: money/live-change is
  gated on the OWNER's live confirmation — keep it that way.)
- **Never invent Amazon numbers** (ACoS, spend, clicks, sales, TACoS). Pull from
  Seller Central / the API. If a number can't be fetched, say "not measured".
- **Truth-rate + source + "when fetched"** for anything you report externally.
- **Always commit** `exchange/results/t-NNNN.md` (envelope at top) + push, then
  Hermes verifies the real artifact.

## Daily loop (every day, EU morning)
1. **Pull** EU Amazon Ads performance for D-1 (DE/FR/IT/ES/UK/NL/SE/PL/BE):
   - spend, sales, ACoS, TACoS per campaign + per product,
   - top search terms (that drove spend vs. conversions),
   - any SKU/ASIN with high spend + zero sales (waste).
   Source: Amazon Ads report (SP/SB) if API reachable, else the Seller Central
   web ("reklāmas" → report) via the dedicated Chrome profile; note which.
2. **Diagnose** against guards:
   - ACoS > ~30% or TACoS > ~10% → look for waste terms/bids to trim.
   - Sales that dropped while spend was flat → check competition/price/buy-box.
3. **Propose + write** the exact change list:
   - which bid to lower/raise (to what value + why),
   - which keyword/negative to add/pause,
   - which campaign to pause/start, which budget to shift.
   Flag every one that SPENDS as `needs_review`; analysis-only changes safe.
4. **Apply under approval**: apply the approval-gated edits, log before→after
   in the envelope (what changed, expected effect), keep the "before" screenshot.
5. **Show movement**: was yesterday's change doing its job? Note today's.
6. **Record** `exchange/results/t-NNNN.md`; commit + push; call: "ACoS/day,
   waste found, changes (approved ones), next".

## When to route to a cheaper model (OpenRouter, as requested)
- You now run non-Claude analysis through OpenRouter (Gemis/GPT) for cheap
  batch work IF the Claude limit is used up but work must continue. The router
  picks `google/gemini-3.7-flash` for analysis/ `openai/gpt-5.6-luna` for
  creative. The KEY is read from this repo's `.env` (portable) → set it there
  chmod 600. Spend is tracked per call ($-figures). Still NEVER commit the key.
- Keep the money-approval trust in Secret, not in the model choice.

## Output shape (envelope)
```
{"task_id":"t-...","status":"done|needs_review","kind":"ads (analysis/ops)",
 "amazon_scope":"DE/FR/...","ac_num":"...","aco_s":"...","tacos":"...",
 "waste_terms":N,"changes":[{"action":"bid|negate|pause|budget","detail":"...",
   "approved":true/false}],"spend_impact_eur":"...","next":"..."}
```

## Goals reminder (from owner strategy)
- Profit, not just turnover. ACoS ~30%, TACoS ~10% targets.
- Marketing budget = 10% of last-month turnover; daily ad watch keeps us under.
- If a campaign is mature, is it above break-even ROAS (~2)? If not, trim.

— Hermes, 2026-08-17