# Task t-0031 — Target-audience persona analysis (maximally precise, data-based)

- **id:** t-0031
- **from:** Hermes (supervisor)
- **to:** Intelligence / Research Agent (analysis)
- **kind:** `research`/`analysis`
- **priority:** high
- **provider:** `gpt`
- **model_hint:** best reasoning model (analysis-heavy).

## Owner's ask (verbatim spirit)
Create an analysis of OUR TARGET AUDIENCE that characterises them as precisely as possible:
who they are, what they do, what else they like, where they live, lifestyle, hobbies. It must be
defined so well that we can build a PERSONA/avatar of the target-audience person, and place
that persona in the FARM app in a main spot — VISUALLY showing what the target person looks
like, their home, dog, hobbies, what kind of house they live in etc. Best case: clicking on the
person's avatar opens their home where you can see how they live / what they do.

## Derive from REAL data (no guessing as the base)
- Sales data by market/region/product: who buys most (which products, which markets: US-EN,
  UK-EN, DE, FR, LV, ES, NO), order sizes, price points.
- Product nature: handmade home decor — buyer = home-owner/interior-lover, gift-giver.
- Where possible: review text, Etsy/Amazon review language, favourite items, bundle patterns.
- Sources deserve truth ratings; gaps marked.

## Deliverable — `knowledge/audience/target-persona.md` (structured)
1. **Demographics**: age range, gender mix, income tier, family/living situation, geography
   by market (top regions per sales).
2. **Psychographics**: values (handmade, natural, cosy, sustainable), interests/hobbies
   (interior, Nordic style, ceramics, slow living, pets, gifting), lifestyle, media they
   consume, what else they like to buy.
3. **Home/lifestyle picture**: typical home (apartment/house), rooms, style, a "day in the
   life" mini-story.
4. **Persona sheets** (2-3): named archetypes with visuals description, e.g. "Anna (34, NL,
   interior lover, dog owner, buys in DE)"; each with portrait description, dog, hobbies,
   home, buying behaviour, what makes them buy us.
5. **Buying triggers & messages**: what phrases/imageries resonate (for ads, listings, blogs).
6. **Data gaps** — what we don't know yet + how to learn (surveys, review mining, FB/IG polls).

## Output
- `knowledge/audience/target-persona.md` (+ attach portrait/visual descriptions, emoji/ascii
  layout is fine).
- A short Latvian summary in the result with the persona in 3-5 lines.

## Definition of done
Data-based persona doc, 2-3 persona sheets, buying triggers, gaps; result file t-0031.