# Task t-0035 — Etsy ads analysis agent: bid-variant by ROAS/life-stage + search-term hygiene

- **id:** t-0035
- **from:** Hermes (supervisor)
- **to:** Ads Analyst / SEO agent (Etsy)
- **kind:** `analysis` / `seo` (read + proposed edits; live edits approval-gated)
- **priority:** high
- **provider:** `gemini`
- **model_hint:** default (data + logic task).

## Owner rules (from knowledge/owner-strategy/etsy-ads-search-terms.md)
1. **Etsy ad bid levels** — 3 variants; choose based on ROAS + product stage:
   - new product (just started) → lower bid/test, expect worse ROAS first;
   - product running a while → use ROAS history to set/propose the right bid variant;
   - recommendation must say WHICH variant and WHY (products name, current ROAS, stage).
2. **Position influence** — search terms drive position; manage below.
3. **Search-term hygiene loop**:
   - negative/close the irrelevant search terms showing on the product;
   - for a big spender that doesn't match: diagnose WHY it shows (title? tags? mismatched
     attributes?) → propose removing it from title/tags so it stops appearing;
   - for a term that brings SALES → propose adding it to listing (title/tags); if high
     volume → propose moving it EARLIER in the title (strongest terms at the very start).
   - list exact search terms + proposed actions + expected effect; live changes = approval.

## Deliverables
1. **Analysis run** — on current Etsy data (from our DB/search-terms data where available, or
   from provided exports): for a set of products, classify search terms:
   - keep (relevant + converts), add-negative (irrelevant), fix-in-listing (wrongly present,
     wasteful), promote-to-listing (new sales term), promote-to-front (high-volume sales term).
2. **Bid recommendation per product** — choose among the 3 bid variants by ROAS/stage; show
   calculation (ROAS, stage flag).
3. **Change list (proposed, approval-gated)** — title/tag edits + negative terms + bid changes
   with expected impact, per product.
4. If data missing → state exactly what export we need (Etsy ads report, search-term report).

## Constraints
- Read/analysis auto; ALL live edits (title/tags/negatives/bids) = approval-gated.
- Truth ratings for any assumptions; files English, owner summary Latvian.

## Definition of done
- Search-term classification table for ≥5 products (or best available), bid recommendations by
  stage/ROAS, proposed change list; result t-0035.