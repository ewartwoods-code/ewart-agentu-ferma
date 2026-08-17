# exchange/secret — two-way channel for the "Secret" agent (Amazon EU worker)

Secret is the farm's autonomous worker on the computer that manages our European
Amazon stores. Like every agent it is controlled by **Hermes**; its lane is
this folder + the normal exchange/tasks + results flow.

## Files
| File | Who writes | What it is |
|---|---|---|
| `HANDOVER.md` | Hermes | Bring-up doc: hardware, Amazon access, setup. |
| `context.md` | Hermes/Claude | Shared knowledge Secret reads first every turn. |
| `inbox.ndjson` | Hermes/Claude | Tasks FOR Secret, one JSON per line (high-level). |
| `outbox.ndjson` | Secret | Results FROM Secret, one JSON per line (envelope). |
| `task-spec.md` | Hermes | Full task-contract spec for building exchange/tasks. |

## Protocol (round trip)
1. Hermes writes a full task file `exchange/tasks/NNNN-*.md` with
   `- **to:** secret` (and optional `work_type: web|api`). For quick steering he
   also may append one inbox line.
2. Secret's worker (15-min tick) reserves the lowest open task atomically,
   executes headless (Claude Code with Web allowed; **Amazon web = dedicated
   browser login**), writes `exchange/results/t-NNNN.md` envelope, commits +
   pushes, releases reservation.
3. Hermes VERIFIES the envelope + real artifact (self-report ≠ truth) and closes
   out.

## Statuses
- `done` (deliverable + result file) · `needs_review` (owner decision) ·
  `blocked` (missing access/data, stated).

## Rules (farm-wide)
- Money/publish ONLY when the task explicitly grants it (Hermes approves; owner
  is the only money approver).
- Web scraping = read-only where possible; **no invented numbers**, truth-rating
  1–10 on every external claim; always git-clean before commit.
- Idempotent ids; Hermes verification.

## Example
```
inbox:  {"id":"sc-0001","from":"herme","to":"secret",
         "task":"Buy-box check DE: pull current offer price + seller for ASIN X from Seller Central",
         "context_ref":"context.md"}
outbox: {"id":"sc-0001","from":"secret","to":"herme","status":"done",
         "summary":"offer €XX, seller SEP, screenshot saved","artifacts":["exchange/results/t-XXXX.md","data/secret/offer-XX.png"]}
```

Ask Hermes if anything is unclear.