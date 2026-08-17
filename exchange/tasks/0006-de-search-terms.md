# Task t-0006 — Germany Amazon PPC: search-term harvest + negative build (READ-ONLY analysis → proposal)

- **id:** t-0006
- **from:** Hermes
- **priority:** high
- **type:** analysis + proposal (READ-ONLY on Amazon; NO changes applied)

## Goal
Find the specific search terms wasting money in Germany (Amazon.de, venue with `tokenValid: connected`), quantify the waste, and produce a ready-to-approve negative-keyword and bid proposal. Hermes + Owner will approve before anything is applied to Amazon.

## Context
- t-0003 result confirmed: **Amazon.de ACoS = 45.7%** (target 30%), second-highest spender after FR.
- From t-0003 offenders: DE had **29 zero-sale campaigns = €159.70 wasted**; specifically:
  - `SP_TP Wave_FBA_broad` ACoS 99.9% (€52.86 spend → €52.94 sales)
  - `C-SP | TP Honey | broad 1` enabled, €23.79, 0 sales
  - `C-SP | TP Cloud | phrase 1` enabled, €10.85, 0 sales
  - `SP Sofarm trays | manual exact` enabled, €16.07, 0 sales
  - `SP_TP Wave_ex1` enabled, €14.80, 0 sales
- Owner confirmed (2026-08-16) that **SecretIngredient is the correct Amazon seller account**. Amazon PPC work may be planned against these venues.
- Skill to use: **amazon-ppc-report** (read side) — you do NOT make writes.

## Deliverables
Write `exchange/results/t-0006.md` with the canonical envelope (deadline: none), containing:
1. **Search-term report (DE).** Hours: last 30 days. For the SP campaigns above and their sibling auto/broad/phrase campaigns, pull the search-term and keyword data from the Data Hub (SELECT only). Output a table: search term | campaign | match type | spend | clicks | sales | orders.
2. **Waste identification.** Mark every search term with spend > €3 with **0 attributed sales** as `[WASTE]`. Sum the waste across them (show total).
3. **Negative candidates table:** term | reason | campaign(s) it should be negated on | proposed match (exact/phrase/negative-exact).
4. **Proposed bid/action adjustments** (NO writes — proposals only, as numbered list 1..N): e.g. pause candidate, reduce bid, restructure. Be concrete (which campaign, which keyword, old → target bid).
5. **Apply plan (pending Owner approval):** a final one-screen summary of the exact changes to apply once approved (listing negative adds + bid changes + pauses), clearly marked `STATUS: needs owner review — do not apply`.
6. Log one line in `state/log.md`.

## Constraints
- READ-ONLY. No Amazon writes at all (no AddNegativeKeyword, no bids, no pauses).
- Files in English; reply to owner in Latvian.
- Use canonical status vocabulary (`completed` etc.). If you must stop a step, use `blocked` and name the blocker.

## Definition of done
Search-term table + waste total + negative list + numbered proposals + one-screen apply-plan, all in `exchange/results/t-0006.md` with a valid canonical envelope; log updated. Proposals are proposals only.