# Task t-0036 — Annual goal 1M€: monthly plan + weekly tasks/results + pricing program in app

- **id:** t-0036
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS) + Strategy agents
- **kind:** `code_local` + analysis
- **priority:** high
- **model_hint:** default (medium).

## Owner's system (knowledge/owner-strategy/annual-goal-million-euro.md)
- Annual goal **€1M turnover**; split by month; weekly task list Monday + results/report
  Sunday; visible on the farm app main screen.
- Compute: units to sell/y & per channel & per market; topsellers/position/gaps; new products
  from workshop; costs down + prices up.
- Growth levers parallel: marketplace optimisation, market expansion, product range,
  production, cost-down, price-up.
- **Price-increase program**: every Monday propose specific product/platform price increases
  (owner approves); after raise track volume (drop or not) → find max-profit point.

## Deliverables
1. **Monthly plan + weekly loop (process):**
   - convert year goal → monthly targets (12 rows) with channel split (Etsy/Amazon/Shopify),
     based on current data where available;
   - weekly Monday task list format (tasks that drive the goal) + results/report presented
     **Friday MORNING** (owner rule: results presented on Fridays, not Sundays).
2. **Farm app — goal view in main screen:** a "Mērķi" card/panel visible in the MAIN view:
   - year goal €, progress bar (actual turnover vs target), monthly plan table,
   - weekly task list (done/ongoing) + weekly results summary,
   - goals/tasks AGREED with owner visible; tasks recommended from past results.
3. **Price-increase module (proposal, approval-gated):**
   - a Monday-generated candidate list (product, platform, current price, proposed price,
     expected effect, why) — from product cost/margin data (data/product-master.csv + DB);
   - list of the proposals; live price change = approval only; after a change, show a tracker
     (orders/revenue before vs after) toward the max-profit point.
4. If live price data is not connected, produce from available CSV + flag gaps.

## Constraints
- `code_local`+analysis; repo only; NO price edits without approval; no spend/deploy; migration
  created-not-applied if needed.
- No fabricated sales numbers: use real numbers when available; else mark estimates `(est)`.

## Definition of done
- Year/month plan doc + task/weekly template; app "Mērķi" panel built; pricing proposal
  generator + before/after tracker; result t-0036 (Latvian owner summary).