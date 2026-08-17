# Task t-0011 — Ads Analyst: cross-channel ad diagnostics (READ-ONLY)

- **id:** t-0011
- **agent:** Ads Analyst
- **priority:** P0
- **type:** analysis (read-only; safe auto-run)
- **from:** Hermes

## Goal
Produce a single cross-channel advertising diagnostic across ALL channels we have
data for: Amazon (Seller Labs), Google (GA4/Merchant/GSC), and Shopify (as the
revenue baseline). Read-only. No changes.

## Context
- Owner directive: **ecosystem first; NO business changes until v1.0.** This is
  analysis only — nothing is applied.
- Autopilot is live (M4 done). This task is safe to auto-run (analysis kind).
- Data sources available on the Mac: Seller Labs Amazon Ads (12 EU/ME venues),
  Google Analytics/Merchant/Search Console, Shopify revenue. Use read-only calls.

## Deliverables — write `exchange/results/t-0011.md` with canonical envelope
1. **Amazon ads (last 30 days, all venues):** spend, sales, ACoS, ROAS, clicks,
   CPC per venue + totals (from t-0003 style, but freshest). Flag venues > target
   ACoS or zero sales.
2. **Google ads (last 30 days):** spend, conversions/revenue, ACoS, impressions,
   clicks if available (ga4ads / merchant / gsc). Flag waste or gaps.
3. **Shopify baseline:** last-30-day revenue (from the data layer / Shopify read).
4. **Cross-channel comparison:** one table — channel/venue | spend | sales/revenue |
   ACoS/ROAS | verdict (healthy / needs review / gap). Identify where money is
   wasted and where it is under-invested.
5. **Top 5 opportunities** (numbered): concrete recommendations, each tagged
   `read-only proposal — needs owner + Hermes approval before any apply`.
6. Note any data source that could not be read, and why.
7. Append `state/log-mac.md`.

## Constraints
- **READ-ONLY.** No bid/keyword/budget/campaign changes. No Google Ads writes.
  No publish. Report only.
- Files in English; the owner (Latvian) gets a short 3–5 line summary to forward.
- Use canonical envelope (`completed` when all deliverables exist; `needs_review`
  only if it proposes actions for approval later — the proposal list itself is fine
  inside a `completed` analysis).

## Definition of done
`exchange/results/t-0011.md` with envelope + all 5 sections (per-channel, Google,
Shopify baseline, cross-table, top-5 opportunities) + log line. No writes to any
live system.