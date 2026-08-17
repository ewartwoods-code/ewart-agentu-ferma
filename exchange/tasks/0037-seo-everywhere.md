# Task t-0037 — SEO everywhere agent (Etsy, Amazon, Shopify, CDon + new platforms) + multi-platform stats in app

- **id:** t-0037
- **from:** Hermes (supervisor)
- **to:** SEO Agent + Coder (KODERIS)
- **kind:** `seo` + `code_local`
- **priority:** high
- **provider:** `gemini`
- **model_hint:** default.

## Owner rules (knowledge/owner-strategy/profit-seo-all-platforms.md)
- **Profit** (not just turnover) is the main goal → marketing max efficient → **SEO is central**.
- SEO works on EVERY platform where we sell: Etsy, Amazon, Shopify, **CDON** (+ any new
  platform) — the SEO agent connects to ALL stores, researches and improves continuously.
- Keep a **master platform list**; on the app main stats show **sales per platform** (volume
  rising/falling) + well-normalised TOTAL across all platforms.

## Deliverables
1. **SEO agent per-platform plan** — for each platform (Etsy, Amazon, Shopify, CDon):
   - current status (what's connected, what data we have),
   - improvement backlog: title/tags/attributes/A+/on-page/collections/blog — concrete
     checklist per platform,
   - keyword research approach per platform (source: our search data, eRank when available,
     platform suggestion APIs), with truth ratings,
   - measurement: rank/impressions/CTR/CVR per platform.
   - CDon: note what's known; if no access, mark to-be-connected.
2. **Platform master list + stats in the app (code_local)**:
   - a `platforms` (or config) list including all current + future platforms,
   - main stats view: per-platform sales (orders/revenue, trend up/down vs previous period) +
     a **normalised TOTAL** for all platforms combined (currency-normalised; flag what's
     missing), with the profit-first framing (show profit/contribution if data allows).
3. Result file + Latvian owner summary; live price/listing changes = approval-gated.

## Constraints
- `code_local`/seo analysis: repo only; no live edits/publish/deploy/spend; no paid tools.
- No fabricated numbers: use DB/catalog data (metrics table) where possible; mark estimates.

## Definition of done
- per-platform SEO plan (incl. CDon status) + platform master list + main-stats multi-platform
  totals view built; result t-0037.