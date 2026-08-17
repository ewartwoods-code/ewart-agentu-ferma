# Task t-0030 — Blog scaper/outreach agent: find region-fit blogs + contacts + traffic stats options

- **id:** t-0030
- **from:** Hermes (supervisor)
- **to:** Research Agent (scraper/outreach support)
- **kind:** `research` (data collection, read-only)
- **priority:** high
- **provider:** `gemini`
- **model_hint:** best collection model.

## Owner's ask (verbatim spirit)
Create a **blog scraper** that finds blogs where we could place our blog posts, AND their
contacts so our outreach/communication agent can contact them. List blogs **by region**.
Prove a blog works by **statistics** (traffic/engagement). Figure out where blog stats can be
obtained (some are available) and give the owner OPTIONS for sources of blog statistics.
Search blogs matching OUR store's target markets. Also: if a market is big (like America),
find which REGIONS we sell best in, and focus on blogs from those regions (e.g. California →
California blogs). Blog must match our niche/audience as closely as possible.

## Deliverables

1. **Method + source options for blog stats** — produce a note `knowledge/research/blog-stats-sources.md`:
   - which tools/sites give blog traffic/engagement stats (e.g. SimilarWeb, Ahrefs, Semrush,
     Moz, website's own social counts, RSS/subscriber counts, newsletter reach; free vs paid),
   - what each provides (monthly visits, geography %, authority, backlinks, social signals),
   - and a recommended free-until-needed stack for us.

2. **Region-fit logic** — define how to pick blogs by region from OUR data:
   - use our sales by market/region (DB metrics: orders/revenue by geography when available;
     product-master/geo data) to find top regions;
   - e.g. US big → our best-selling regions (California etc.) → focus on blogs of those regions.
   - Blog fit criteria: niche (home decor/interior/design/craft), audience match, region match,
     active (recent posts), has traffic proof.

3. **Scraper spec (repeatable)** — how the agent will:
   - search blogs in target regions + niche (search queries, directories, blog aggregators,
     competitor backlinks);
   - extract per blog: name, URL, region/language, topic, contact email/social (found on the
     site), subscriber/social signals where visible;
   - save to `data/blogs.csv` (columns: blog, url, region, language, niche, contact, traffic
     source, traffic_est, notes) — READ-ONLY gathering, no outreach sending here.

4. **Demo run** — run the method on ONE region (choose: US-CA or DE or LV) and produce a first
   set of 10-15 blogs with best-available contact + a traffic estimate/source, marked with
   truth rating 1–10 (owner rule).

## Constraints
- `research`/read-only: no sending emails/outreach, no publish, no spend on paid tools without
  approval (list paid options as options).
- Sources for any numbers; mark unsourced.
- English files; Latvian owner summary.

## Definition of done
- stats-sources note (options for getting blog stats) + region-fit logic + scraper method +
  demo CSV sample (10-15 blogs with contacts + stats method) + result file.