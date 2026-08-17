# Task t-0041 — Order approval + shipping-label agent (courier choice by cost, browser-based)

- **id:** t-0041
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS) + Chrome/UI Agent (approval workflow)
- **kind:** `code_local` (build spec + agent role; live action = approval-gated, browser)
- **priority:** high
- **provider:** `claude`
- **model_hint:** default.

## Owner's context
- Signie manually approves orders from our online stores — **we must AUTOMATISE this**:
  order approval + printing shipping labels. We ship with different couriers:
  **FedEx, UPS, DPD (Dieģels), Latvijas Pasts**; each country → a specific best courier.
- Owner will provide SHIPPING PRICING data so the agent can compute the CHEAPEST/best courier
  per shipment.
- We need an **approval agent** that does these steps — best done IN A BROWSER: when an order
  arrives (Etsy / Amazon / Shopify / elsewhere), it reads the order, checks shipping params,
  compares courier prices, confirms the order with the best-price courier, and prints the
  shipping label.
- Raivis = production manager (weekly tasks handed Monday by skills — separate).

## Deliverables
1. **Shipping-cost engine spec** — data inputs (owner feeds courier price tables): dimensions,
   weight, country/destination → compute best courier (FedEx/UPS/DPD/Backend Pasts) per shipment
   and per country. Where a courier is required (contract per destination), enforce it; else choose
   cheapest with target transit/delivery.
2. **Order-approval agent (browser-based)** — Chrome/UI automation (Claude Code Chrome) workflow:
   - detect new order (Etsy/Amazon/Shopify/other),
   - read the order shipping params,
   - run courier price comparison → recommend + auto-confirm with best-price courier,
   - trigger label generation + print (shipping label),
   - mark order as approved/processed; log it.
   - All money-affirming/actual sends are approval-gated (Phase-1) until proven; this is the
     target build.
3. **Printing/label step** — use the browser to print the shipping label (or generate
   PDF) per chosen courier.
4. **Agent registration** — add "Order & Shipping / Apache" role to knowledge/agents-inventory.md
   + AGENTS.md + move a browser flow document.
5. Feasibility/limits: note which stores support what (Etsy/Amazon/Shopify shipping APIs vs
   browser), country↔courier mapping table skeleton, data gaps (pricing data needed from owner).

## Constraints
- Build/design in repo (code_local); actual order actions, courier confirmations, label printing
   = live actions → needs approval once wired; browser automation fragile → document.
- No fabricated pricing: fills in from owner's data; mark what's missing.

## Definition of done
- shipping-cost rule + order-agent workflow (browser steps) + courier-country matrix + label
  printing step; agent registered; result t-0041 (Latvian summary).