# Task t-0039 — Review-mining for new products: competitor review insights + our store style

- **id:** t-0039
- **from:** Hermes (supervisor)
- **to:** Research Agent (new-product developers' support)
- **kind:** `research`/`analysis`
- **priority:** high
- **provider:** `gemini`
- **model_hint:** best reasoning + collection model.

## Owner's ask (verbatim spirit)
For the people/agents developing NEW products, the **researcher must read COMPETITOR product
reviews** to understand what customers say about the product:
- what customers LIKE most about it,
- what they DON'T like about that product,
- so we can build IMPROVEMENTS into our product OR avoid the things they dislike.
Also important: what people wish/expected to see but **it is MISSING** in the product.
Also: research **OUR OWN store style** — what kinds of products we make — so we understand the
STYLE and DIRECTION we are going in.

## Deliverables
1. **Competitor review-mining method + run** — for our main product categories (home decor):
   - pick top 5–8 competitor products per category (marketplaces Amazon/Etsy + reviews),
   - extract themes from reviews: **liked most / disliked / wished-missing** (with example
     quotes, star ratings, count of mentions),
   - produce a **gap table**: what the market loves (we must include), what it hates
     (we must avoid), what it wishes (opportunity for us).
   - Sources listed + truth rating 1–10 (owner rule); mark review counts vs anecdotes.
2. **Our brand/style direction analysis** — from our own catalog (data/product-master.csv,
     shopify-overview, site/blogs):
   - what products we make, materials, styles, colours, price ranges,
   - identify our **style/direction** (e.g. rustic-nordic handmade vs industrial...) and
     where it sits vs competitors (gap),
   - output persona-ready style statement + which review insights fit our direction.
3. **Recommendations for new products** — 2–3 concrete product improvement/new-idea drafts
   that (a) match our style direction and (b) capture the "wished-missing" opportunities,
   size ≤120cm rule, workshop-feasible (cross-ref t-0023/t-0024).

## Constraints
- `research`: read-only; no publish/spend/buying (reviews read only); personal data respected.
- Sources + truth ratings; unsourced marked; files English, owner summary Latvian.

## Definition of done
- review themes (liked/disliked/missing) for ≥2 categories with quotes + counts; brand
  direction summary; 2-3 opportunity recommendations; result t-0039.