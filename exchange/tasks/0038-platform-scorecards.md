# Task t-0038 — Per-platform health scorecards (SEO level, ads level, listing quality, + more)

- **id:** t-0038
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS) + analysts
- **kind:** `code_local` + analysis
- **priority:** high
- **model_hint:** default.

## Owner's ask (verbatim spirit)
Create **statistics/scores ("veitiņas") for specific different points at each platform where we
sell** — e.g.:
- **SEO level/score**,
- **Ads level/score**,
- **Listing quality level/score**,
- and possibly other IMPORTANT levels/scores, per our view.
A scorecard per platform.

## What to build
1. **Scorecard model** — define for each platform (Etsy, Amazon, Shopify, CDon + future) the set
   of scores and their inputs (0–100 or 1–10, with formula/source):
   - **SEO score:** keyword coverage, title/tag completeness, rank position distribution,
     freshness, on-page completeness.
   - **Ads/PPC score:** ACoS/ROAS vs target, CTR, wasted spend share, campaign hygiene,
     negatives coverage.
   - **Listing quality score:** image quality (spec compliance), title fit, bullets/description
     completeness, reviews/rating health, size/data accuracy.
   - **+ Health/productivity score:** stock/availability, margin, sales trend.
   Each score = clear formula from real data where possible; where data is missing, mark and
   degrade the score (no faked numbers).
2. **Data sources** — from our DB metrics/items tables, catalog CSV; per-platform missing data
   = gap list (what export/connector needed).
3. **STRATEGY: get every score to 10/10 FIRST, then expand (owner rule):**
   - The overall strategy: the task from the START is to bring ALL the scorecard statistics
     to **10 out of 10** (each platform: SEO, ads, listing quality, health).
   - Only when the existing products/platforms sit at max scores, **add new products** (the
     bar is high: a new product should join a healthy, max-scored ecosystem, not a broken one).
   - New products are also later scorecarded and pushed to 10/10.
4. **UI — app:** a "Statistika" / "Rezultāti" section: per-platform card with the score veitiņas
   (visual bars/rings 0–100), overall platform health, and drill to sub-scores; main view
   should show at least the summary. Latvian labels.
5. Keep everything else working; no live business changes.

## Constraints
- `code_local` + analysis; repo only; no spend/publish/deploy; no fabricated metrics —
  compute from real data when available, else show "nav datu".
- English files; Latvian owner-facing labels.

## Definition of done
- Scorecard formula doc (per platform per category) + app section with visual veitiņas (real or
  clearly-marked data-gap) + result t-0038 (Latvian summary).