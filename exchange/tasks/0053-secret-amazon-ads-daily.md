# Task t-0053 — Secret: start the daily Amazon Ads analysis & optimisation (EU)

- **id:** t-0053
- **to:** secret
- **work_type:** mixed (API where possible, web via Chrome profile otherwise)
- **kind:** `analysis` + `ops` (money edits are needs_review)
- **priority:** high
- **amazon_scope:** DE, FR (the two biggest markets) first; then IT/ES/UK/NL/SE/PL/BE
- **approval:** auto for analysis; `needs_review` for any spend change

## Owner directive (verbatim spirit)
"Secretam ir jāsāk Amazon reklāmu analīze un jāoptimizē tās, un jāsāk reklāmu
pārvaldīšana. Katru dienu ir jāiet cauri un jāveic uzlabojumi, lai sasniegtu
mērķus." → Secret now owns the EU Amazon ads daily routine.

## Do (read `exchange/secret/amazon-ads-ops.md` first — that is the protocol)
1. **Pull yesterday's EU ads numbers** (DE + FR first): spend, sales, ACoS,
   TACoS per campaign + SKU. Source: Amazon Ads report if reachable via
   API/export; else use the dedicated Chrome profile → Seller Central → ads
   report view, screenshot + record. Truth-rate what you pulled.
2. **Diagnose** vs guards: ACoS ~30% / TACoS ~10% / break-even ROAS ~2.
   Flag waste (spend with zero or below-ROAS sales) and lost buy-box/competition
   issues.
3. **Write the change list**: lower/raise bids (to which value), add negatives,
   pause/start campaigns, shift budget. For each change mark
   `approved: true|false`. Changes that SPEND = `needs_review` (owner confirms).
4. If the owner approved anything in this task's context, apply it with
   before→after logged; otherwise keep as proposal only (no spend without OK).
5. **Result envelope** `exchange/results/t-0053.md` (done or needs_review) with
   the numbers, waste summary, change list, spend impact est, next action.

## Return
Envelope JSON at top, then in prose: what you found, what you propose, what you
applied (if any). Truth-rating + source (API/web/date) on every number.

---
**IMPORTANT (Hermes/approval):** the owner said Secret should *manage* ads; but
actual bids/budgets are money. After this first analysis run (always safe), he
wants a **proposal** reviewed before Secret edits live campaigns. So today:
analysis + proposal ONLY unless the owner says otherwise.