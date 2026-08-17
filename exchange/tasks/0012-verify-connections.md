# Task t-0012 — Verify all connections + confirm reachability (via Claude web/Mac)

- **id:** t-0012
- **agent:** Claude (execution node, via web / browser / MCP on the Mac)
- **priority:** P0
- **type:** report (read-only; safe auto-run)
- **from:** Hermes

## Goal
The owner set up several connections yesterday and is not 100% sure they work. Verify
**every** connection that exists on the Mac right now, and return a clear pass/fail
table. This is a health check only — no business changes.

## Context
- Owner directive: **ecosystem first; NO business changes until v1.0.** Read-only check.
- Claude runs on the owner's Mac with MCP connectors + browser. Use whatever is
  actually configured there (Shopify, Amazon/Seller Labs, Supabase, Gmail, Calendar,
  Drive, Asana, Canva, Adobe, Railway, Higgsfield, and any new one from yesterday
  such as eRank / Etsy / Google).
- Hermes cannot reach the Mac's live connections directly — that is why the check
  must be done here, on the Mac.

## Deliverables — write `exchange/results/t-0012.md` (canonical envelope)
1. **Connection health table** — one row per integration: `integration | status
   (pass / auth_error / not_testable / absent) | exact message | how you checked`.
   Test in order: Shopify, Amazon Ads / Seller Labs, Supabase, Gmail, Google Calendar,
   Google Drive, Asana, Canva, Adobe, Railway, Higgsfield, **plus anything new from
   yesterday** (eRank, Etsy API, Google Ads, etc.). If a connector is missing or
   fails auth, say exactly what the owner/you must do to fix it.
2. **eRank status** — if an eRank connector/login exists, confirm whether positions
   (keyword ranks) can be pulled. If not available as an API, state how eRank data
   must be obtained (e.g. browser login/export) so a scraper can be planned.
3. **Recommendations** — for each failed/missing/not-testable item, one concrete
   next step (who does it, and whether it needs owner login/approval).
4. Append `state/log-mac.md`.

## Constraints
- READ-ONLY. No changes to any live system, no money action, no publish.
- If a check needs the owner to log in or approve a prompt, do all checks that CAN
  run, list the blocked ones as `not_testable (needs owner: ...)`, and continue.
- Files in English; give the owner a short Latvian summary (3–5 lines).

## Definition of done
`exchange/results/t-0012.md` exists, canonical envelope = `completed` (or `partial`
if only some could be tested), full health table filled, eRank reachability stated,
actions listed. No writes to any live system.