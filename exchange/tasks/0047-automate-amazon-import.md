# Task t-0047 — Automate Amazon sales/PPC daily import (owner: wants Amazon data auto-imported)

- **id:** t-0047
- **from:** Hermes (supervisor)
- **to:** Code/Ops Agent (data layer)
- **kind:** `code_local` + investigation
- **priority:** high
- **model_hint:** default.

## Owner's ask (verbatim spirit)
"Amazon dati mums arī vajag, lai tie automātiski importējas." The Amazon metrics in the DB
stop at 2026-08-12 while Etsy/Shopify update daily. Find how daily ingest works for other
platforms and add Amazon to it (or start a new Amazon ingest), so orders/sales/PPC land on
the fly.

## Deliverables
1. **Investigate current ingest** — find where the daily import that fills `metrics` for
   Etsy/Shopify runs (scripts, cron, Railway worker, scheduler). The farm repo doesn't contain
   it (likely external/DB-side). Pinpoint the mechanism + where Amazon would plug in.
2. **Amazon data source** — determine the best ingestion path for sales/orders/PPC:
   - Amazon SP-API (Selling Partner API) — orders/sales reports,
   - Seller Central report exports (if no API),
   - Seller Labs / existing connector,
   - Scraper (browser) as fallback (this is a big lift; note fragility).
   Recommend the cleanest; state credentials/data needed (SP-API credentials, refresh token,
   marketplace IDs) or an export the owner can supply.
3. **Automation** — design + if possible implement a scheduled ingest that pulls Amazon daily
   (orders, revenue, by day) into the metrics/DB, matching the Etsy/Shopify pattern; add to a
   scheduler/skill so it runs automatically. If it requires a paid key or live connection →
   build the plan + integration scaffolding, mark `needs_review` for the owner to supply access.
4. Output a clear status: what's blocking (credentials/API access) vs ready to flip on.

## Constraints
- Investigation + repo-local scaffolding ok (read-only on live). Any live API/enable = approval.
- No fabricated numbers; if Amazon source is not reachable yet, say exactly what's needed.

## Definition of done
- Ingest investigation doc + Amazon source recommendation + automation plan/harness (or the
  implemented daily import), result t-0047 with blocking list for owner.