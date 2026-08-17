# Task t-0021 — Research: current strategies for Amazon PPC, Etsy listings, Amazon listings, Shopify

- **id:** t-0021
- **from:** Hermes (supervisor)
- **to:** Intelligence / Research Agent (with Grok/X + web + official sources)
- **kind:** `research`
- **priority:** high
- **provider:** `gpt`
- **model_hint:** best collection model for web/X; this is read-only research, cheap-to-medium.

## Owner's ask (verbatim spirit)
Do research on **currently relevant strategies**:
- Amazon PPC strategies (what works NOW)
- Etsy listing-creation strategies (how to make good listings now)
- Amazon listing-creation strategies (how to make good listings now)
- Shopify (best & simplest)
Produce clear, actionable notes that other farm agents can use.

## Requirements (mandatory, per owner + farm rule)

### 1. One note per topic, under `knowledge/research/<slug>.md` (staged, NOT final)
Topic slugs:
- `amazon-ppc-strategy-2026`
- `etsy-listing-strategy-2026`
- `amazon-listing-strategy-2026`
- `shopify-strategy-2026`

Each note MUST contain:
- **Topic & question** it answers.
- **Key findings** — short, concrete, actionable (what to do, how, why).
- **Sources** — for each major finding, list actual sources: official docs (Amazon Seller
  Central, Etsy Seller Handbook, Shopify Help), reputable blogs/forums, X/Grok threads,
  industry studies. No source → mark `(unsourced)`.
- **Truthfulness rating 1–10** — overall AND per-major-claim. Reference:
  - 9–10 official docs, corroborated;
  - 7–8 reputable industry consensus;
  - 5–6 mixed/unvalidated opinions;
  - 1–4 rumour/one-off — flag `directional, verify`.
  - For each rating state what would raise/lower it (e.g. "10 if Amazon official guide confirms").
- **Contradictions** — explicitly list where sources disagree (do not hide either side).
- **Freshness** — publication/update date of sources; flag anything older than ~6 months.
- **Who should use it** — map to farm agents (Ads Optimizer, SEO Agent, Content, etc.).

### 2. Owner-coordination gate (HARD)
- Gathering is read-only → can auto-run.
- The notes are **NOT handed to other agents** until the **owner approves** them.
- Result status: **`needs_approval`** (source task research may be marked completed; the
  deliverable is staged as `needs_review`). Hermes presents to owner on WhatsApp; only after
  owner sign-off does it publish to `knowledge/research/` for agents to consume.

### 3. Currently acknowledged context (from the farm's data)
- Brand: EWART WOODS, handmade home-decor. Markets: US-EN, UK-EN, DE, FR, LV, ES, NO.
- Current ad efficiency data point (recent analysis): Amazon ACoS ~36%, some zero-sale spend —
  a PPC improvement strategy is directly valuable.
- Etsy currently has NO working connector — listing-side recommendations are informational for
  now, and should note it.

## Which sources/models to use
- Web search + fetch of official pages first (Amazon Seller Central, Etsy Seller Handbook,
  Shopify Help, Google search quality guidelines).
- Community/discussion (Reddit r/FulfillmentByAmazon, r/Etsy, Etsy forums, X/Grok threads) —
  clearly separated from official.
- Prefer primary/official; label community as opinion. Note paywalled/unreachable sources.

## Constraints
- `research` kind: read-only, no money, no publish, no paid API enabling, no deployment.
- Files English (owner chat Latvian); sources + ratings mandatory; do not fabricate sources or
  ratings. If unsure, lower the rating and say why.
- Do not claim live connectivity for Etsy/Amazon/Shopify unless actually verified.

## Deliverables
1. Four staged draft notes (one per topic) with sources + 1–10 ratings + contradictions + freshness.
2. A short Latvian summary in the result file for the owner.
3. Result `exchange/results/t-0021.md`: envelope (status `needs_review` for the notes, research
   itself done) + demo that at least ONE topic is fully sourced/rated as a proof of pattern.
4. A recommended action list: what the farm should adopt from the research (approved priority order).

## Definition of done
- Four draft notes exist (sourced, truth-rated, fresh, contradictions noted).
- Result is `needs_review`, NOT yet in `knowledge/research/` — awaits owner approval.
- Envelope + summary + recommended actions returned.