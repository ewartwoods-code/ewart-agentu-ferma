# Task t-0034 — Researcher: where the target audience lives; precise location targeting for ads

- **id:** t-0034
- **from:** Hermes (supervisor)
- **to:** Intelligence / Research Agent
- **kind:** `research`/`analysis`
- **priority:** high
- **provider:** `gemini`
- **model_hint:** best reasoning + collection model.

## Owner's ask (verbatim spirit)
Research agent: find out **WHERE our target audience lives** / where is the best place to show
our ads — the more precise the better. Can be done down to **postal/ZIP-like level** so we can
target maximally precisely: where the person is located, what kind of person they are, what they
do. Use this input to build maximally precise campaigns in **Google, Meta, and everywhere else**.
Use **Google Analytics** and any other tool/scraper a researcher can use to gather data online, so
we can build maximally precise ads.

## Deliverables
1. **Location/audience-geo analysis method** — how to determine where our audience lives at
   the most precise granularity possible:
   - **OUR FIRST-PARTY DATA FIRST: historical orders = primary source (owner rule).** From
     order/buyer ADDRESSES we can see exactly which regions/cities/postcodes our audience is
     in — where purchases come from most often, which products are popular in which places.
     Use: Etsy/Amazon/Shopify order address reports, GA4 Geo (city/region), and map orders →
     regions (ZIP/postal level where available). This is the most direct evidence of the
     target audience location.
   - THEN supplement with market/tool sources: Google Trends by region/city, SimilarWeb
     audience geography, Meta audience insights, census/geo marketing tools, eRank/search
     intent by region.
   - **Use SEVERAL sources together** (never one only): historical purchases + analytics +
     tools, cross-checked. Mark which source proves what (e.g. "orders show Berlin top;
     GA4 confirms; Trends agrees").
   - down to ZIP/postal granularity where tools allow.
2. **Persona-location mapping** — tie the target-audience persona (t-0031) to places:
   - who they are + where they most concentrate (e.g. affluent suburbs, design-forward cities);
   - their behaviour per region.
3. **Precise targeting build suggestions** — concrete "how to target" per channel:
   - Google Ads: geo-target regions/ZIPs, radius, audience + interests, Demographics;
   - Meta: locations (city/ZIP/radius), interests, lookalike from GA4/Shopify data, region split;
   - Recommend the top 3-5 regions/cities to spend first, based on our data (or best available).
4. **Tool stack** — list (free→paid) Google Analytics, GA4 report types, geoip, audience tools,
   scrapers usable for location; which needed for our goal, with truth ratings.
5. Everything with sources + truth rating 1-10 + freshness (owner info rule); mark what we need
   GA/sales data access to finalise.

## Constraints
- `research`, read-only, no spend on paid tools without approval (list as options), no publish.
- Respect privacy/GDPR: use aggregate location data, not personal PII.
- English files; Latvian owner summary.

## Definition of done
- method + persona-location map + per-channel targeting suggestions (top regions/ZIPs) + tool
  stack; result t-0034 (needs GA/order-data access flagged if required).