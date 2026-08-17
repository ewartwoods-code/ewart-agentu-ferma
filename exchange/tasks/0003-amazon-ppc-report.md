# Task t-0003 — Amazon PPC situation report (read-only)

- **id:** t-0003
- **from:** Hermes
- **priority:** high
- **type:** analysis + report (READ-ONLY)

## Goal
Give Hermes a full PPC picture across all 12 Amazon venues so the owner can decide where to act. NO changes — report only.

## Context
- Health check t-0002: Amazon Ads connector is live (12 venues, all "SecretIngredient - Amazon.xx", token valid). Owner must confirm the account is correct before any bid changes — this task is read-only, so it is safe.
- Use the amazon-ppc-report skill. Metrics window: last 30 days, all campaigns (SP/SB/SD).

## Deliverables
1. **Per-venue summary table**: venue | spend | sales | ACoS | ROAS | clicks | CPC | impressions.
   Only continue reading amounts, no writes.
2. **Top offenders**: campaigns with ACoS > 50% or zero sales, listed with spend and lost amount.
3. **Anchor accounts**: top 5 campaigns by absolute ROAS, top 5 by sales.
4. **Quick wins (numbered)**: 3–5 concrete recommended changes (pause keyword X, cut bid Y, restructure Z). Write these as PROPOSALS ONLY (no changes made).
5. **Result file** exchange/results/t-0003.md — envelope JSON (task_id t-0003, status done) + all tables above + "What changed for the owner" (the proposals in plain words).
6. Append one line to state/log.md.

## Constraints
- READ-ONLY. No bid/keyword/campaign changes, no budgets, no writes to Amazon.
- Files in English; chat reply to owner in Latvian, 3–5 lines + the full result text to copy back.
- If the account name question was not resolved, note it in the result file.

## Definition of done
Numbered-venue table + offenders + top campaigns + 3–5 proposals delivered in required format; log updated.
