# Secret — task contract spec (how Hermes writes tasks for the Amazon-EU worker)

Every Secret task is a normal farm task file with two extra fields:

```markdown
# Task t-NNNN — <what>

- **id:** t-NNNN
- **to:** secret
- **work_type:** web | api | mixed    ← "web" means use the browser/Chrome profile
- **kind:** `analysis` | `code_local(amazon)` | `ops` (money ops → needs_review)
- **priority:** high|medium|low
- **amazon_scope:** DE|FR|IT|ES|UK|NL|SE|PL|BE (or comma list)   # optional
- **approval:** auto | needs_review    # money/price changes → needs_review

## Do
<one or two concrete lines: WHAT to change or collect, WHICH ASIN/SKU/venue>

## Return
<exactly what the envelope/artifacts must contain, e.g. "offer+price per ASIN,
screenshot saved to data/secret/<task>.png">
```

## Rules encoded in every task
- **Money (price/stock/bid/ PPC budget)** → `approval: needs_review` unless the
  owner explicitly pre-approved ("auto"). Hermes verifies before/after.
- **Web tasks** → the browser login profile (EU sellers) is the ONLY way to read
  things without API: buy-box, offer changes, some listing/ads screens. Secret
  uses a dedicated Chrome profile (owner logs in once).
- **Collecting info** (no change) is always safe; return a structured summary
  with truth-rating + screenshot/fetch time.
- Secret NEVER invents Amazon data; "not visible on the page" is a valid answer
  with a screenshot.

## Lifecycle
tsk reserved → executed headless → `exchange/results/t-NNNN.md` (envelope: id,
status done/needs_review/blocked, started/finished, artifacts, evidence lines)
→ commit+push → Hermes verifies → owner sees in EWART BRAIN.

— Hermes, 2026-08-17