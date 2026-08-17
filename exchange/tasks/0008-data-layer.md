# Task t-0008 — Ecosystem M3: data layer build (read-only snapshots + product master)

- **id:** t-0008
- **from:** Hermes
- **priority:** P0 (ecosystem milestone M3)
- **type:** data collection + reporting (READ-ONLY; no business changes)

## Goal
Build the first version of the ecosystem data layer: capture a consistent set of
read-only data snapshots into the repo (`data/`), and produce the unified product
master (SKU links across channels). This is infrastructure only — nothing is changed
on any live system.

## Context
- Owner directive: **ecosystem first, no business changes until v1.0.** This task only
  gathers and archives data.
- Repo `ewart-woods-farm` (master) is the single channel; autopilot (t-0007) is set up
  in transport mode.
- Verified connectors (t-0002): Shopify (EWART WOODS Design, ewartwoods.com), Amazon Ads
  / Seller Labs (12 EU/ME venues), Supabase (ewart-ai), Gmail, Drive, Google Calendar,
  Asana, Canva, Adobe, Railway, Higgsfield. No Etsy connector (Etsy via sheet/browser only).

## Deliverables
Build under a `data/` directory in the repo:

1. **`data/README.md`** — one page explaining each file, the capture date, and that every
   snapshot is read-only. Add `data/` to `.gitignore`-friendly handling (keep snapshots
   tracked but flag they are temporal; do NOT commit secrets).
2. **`data/shopify-overview.json`** — read-only Shopify pull: store info, product count,
   top-level collections with product counts, last N orders (summary only, no PII
   beyond what is standard), revenue figures. Use the Shopify MCP read tools. NO changes.
3. **`data/amazon-venues.json`** — the 12 venues with marketplace + account label, from
   Seller Labs venues (SELECT only). Include a `captured_at` timestamp.
4. **`data/supabase-projects.json`** — ewart-ai project info (and note veselibas-app as
   INACTIVE if still true).
5. **`data/product-master.csv`** — unified product master. Using Shopify products as the
   spine, map each to any matching Amazon/Etsy/Google where a match is identifiable by
   SKU or title. Columns: `sku | title | shopify | amazon | etsy | google | notes`.
   Where a channel has no connector (Etsy), leave the column empty and note it. This is
   the reconciliation that surfaces coverage gaps (lost revenue) WITHOUT changing anything.
6. **`data/inventory-coverage-report.md`** — a short report: how many products are
   live on each channel, what % of the Shopify catalog is covered by Amazon vs other
   channels, and the top coverage gaps. Read-only findings only.
7. **Result** `exchange/results/t-0008.md` — canonical envelope (`completed` if all above
   exist and are verified) + short "What data layer now gives us" section in plain words
   for the owner. Append `state/log-mac.md`.

## Constraints
- **READ-ONLY.** No product/order/listing changes, no publishes, no money actions.
- Stand on the "ecosystem-first" rule: capture data, do not act on it yet.
- English files; Latvian with the owner (short).
- No secrets / API keys in any committed file.
- Do not call Etsy API (no connector).

## Definition of done
All data files exist and parse; README explains them; product-master.csv is generated
with coverage mapping; coverage report written; result envelope `completed`; log line
added. Nothing on any live system was modified.