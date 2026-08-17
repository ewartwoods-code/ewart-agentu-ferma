# Task t-0024 — Market-trends product agent (competitor hot products, eRank, size-fit)

- **id:** t-0024
- **from:** Hermes (supervisor)
- **to:** Intelligence / Research Agent (trends) 
- **kind:** `research`
- **priority:** high
- **provider:** `gemini`
- **model_hint:** best collection model; research only.

## Owner's ask (verbatim spirit)
Create an agent that **watches market trends**: which products of OUR competitors are selling
best right now, whether WE could also make such products. Make product recommendations by
researching eRank-type data: current trends, supply, demand, GAPS we can enter with products.

## Product size rule (HARD)
**Max 120 cm on the longest side** (must fit courier shipping rules). We ship with FedEx,
UPS, Latvijas Pasts — their shipping conditions are public on the internet; recommendations
must fit those courier size/weight limits (verify on official pages; if any doubt, assume ≤120 cm
longest side and note where to check).

## Deliverables
1. **Trend/competition scan method** — define a repeatable process:
   - competitor best-sellers (which products, price, ratings, review velocity),
   - demand signals (eRank search/volume, marketplaces search suggestions),
   - supply/gap analysis (few sellers vs high interest = opportunity),
   - feasibility via OUR workshop tools (cross-ref knowledge/workshop + draughtsman t-0023).
2. **Recommendation output format** per product idea: product name, why (evidence + source),
   demand/supply signals, our ability to make it (tools/process), est. size (must be ≤120 cm
   longest side), courier-fit check (FedEx/UPS/LV Pasta), next step (sketch/draughtsman).
3. **Demo scan** — run the method on 3–5 real competitor/top-selling products in our
   categories (home decor), with sources + truth rating 1–10 per owner rule, and pick ONE
   product idea we could make, with a size-checked draft brief for the Draughtsman.
4. Sources for each claim + truth rating + freshness date (per owner's info rule).

## Constraints
- `research`: read-only, no publish/spend/deploy; no live changes.
- Do NOT fabricate eRank numbers; if eRank data isn't accessible, say so and use public market
  sources, labelled with ratings.
- English in files; owner summary in Latvian in the result.

## Definition of done
- Method doc + demo run (2-5 products) + 1 product recommendation with size ≤120 cm + courier
  check + truth-rated sources + results file.