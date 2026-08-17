# Task t-0040 — FBA restock proposal agent: which products to send to Amazon warehouses

- **id:** t-0040
- **from:** Hermes (supervisor)
- **to:** E-commerce/Ops Agent (FBA analyst)
- **kind:** `analysis`/`schedule`
- **priority:** high
- **provider:** `gemini`
- **model_hint:** default (data-driven analysis).

## Owner's context
Team (owner's employees, so proposals are formatted for humans to execute):
- **Sabīne** — manager over ALL e-commerce stores;
- **Sagnija/Signija (Signie)** — secretary + handles packaging & warehouse (+ receives orders),
  and she also creates production orders → she needs a proposal of WHICH products to send to
  the Amazon warehouses (she orders production accordingly);
- **Dana** — handles warehouse & packing.
So a NEW agent (or a specialised task) must do the FBA/stock analysis: which specific products
are needed to send to Amazon warehouses, with concrete product lists.

## Owner rule (to include)
- Output must give **specific products** needed for Amazon warehouses (FBA restock list).
- This is an additional skill/agent that does the restock analysis.

## Deliverables
0. **Apply owner FBA strategy (knowledge/owner-strategy/fba-stock-strategy.md):**
   - send-groups: (a) proven sellers (fast, good profit), (b) test products (never in FBA,
     show potential) — send 5 pcs to test first, ramp up batch-by-batch if selling, (c) old
     products — re-check carefully before sending;
   - **never exceed 60 days of stock** in the warehouse;
   - ROI on shipping: air FedEx ≤100 kg, fast rotation, avoid storage fees;
   - slow-movers → liquidation plan (discounts/Lightning Deals) and ACTIVE ads on anything in
     the warehouse for visibility + max profit.
   - **Variation ratio (wood types):** for products with 5 wood variations (oak/ash/wenge/
     walnut/cherry) — use HISTORICAL sales per variation to set send volume:
     best-selling woods ship in LARGER volume, slower woods smaller; keep ratio from data.
1. **FBA restock analysis spec** — how to determine what to send to Amazon warehouses:
   - from sales velocity & stock: units sold/day per ASIN (Amazon sales from DB/user data),
     current stock on hand, days of supply, lead time to manufacture (production) + shipping,
     season/trend, sell-through rate;
   - safety stock target (e.g. N days) and reorder point;
   - candidate products where stock will run out before next delivery.
2. **Proposal format** (for Sabīne/Dana/Signie): per product: SKU/ASIN, current stock,
   sales rate, days-until-out, recommended send quantity, priority (now / next / soon), date.
   Human-readable tables (CSV for Signie to order production).
3. **Weekly cadence** — produce this proposal regularly (weekly), owned by this agent, before
   production ordering.
4. **Agent registration** — add a "FBA restock / Amazon stock analyst" role to
   knowledge/agents-inventory.md + AGENTS.md.

## Constraints
- `code_local`/analysis: repo only; no live warehouse edits; needs Amazon sales/stock data
  (export or connector) — if missing, state exactly what data is needed (e.g. Seller Central
  `Inventory` + `Sales` export).
- No fabricated numbers: mark estimates or missing-data.

## Definition of done
- fba-restock spec + proposal format + weekly cadence; agent registered; demo proposal for 5-10
  products if data available (else list the needed export); result t-0040.