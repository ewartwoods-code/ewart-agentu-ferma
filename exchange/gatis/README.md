# exchange/gatis — two-way channel for the "Gatis" agent

Gatis is the owner's existing GPT, added to the farm as a **distinct agent**
(separate from Hermes). This folder is his lane: Hermes/Claude drop tasks in one
place, Gatis returns results in another, and `context.md` carries the shared
knowledge so every turn starts at high quality.

## Files
| File | Who writes | What it is |
|---|---|---|
| `context.md` | Hermes/Claude (+ Gatis proposals) | The shared knowledge pack Gatis reads first every turn. |
| `inbox.ndjson` | Hermes/Claude | Tasks FOR Gatis, one JSON per line. |
| `outbox.ndjson` | Gatis | Results FROM Gatis, one JSON per line (envelope). |
| `README.md` | this | Protocol + example. |

## Protocol (round trip)
1. Hermes/Claude appends one line to `inbox.ndjson`:
   ```json
   {"id":"g-0001","at":"2026-08-17T10:00:00Z","from":"herme","to":"gatis",
    "task":"Propose 5 German interior blogs worth a 100€ sponsored post, with a truth-rating each.",
    "context_ref":"context.md","expects":"table: blog,url,price-range,truth,freshness","deadline":""}
   ```
2. Gatis reads `context.md` + the inbox line, does the work, then appends to
   `outbox.ndjson`:
   ```json
   {"id":"g-0001","at":"2026-08-17T10:20:00Z","from":"gatis","to":"herme",
    "status":"done","summary":"5 DE interior blogs listed (Leelah, Couch, ...) with truth ratings.",
    "artifacts":["exchange/results/t-gatis-0001.md"]}
   ```
   and, when it is a real deliverable, ALSO writes the full
   `exchange/results/t-gatis-0001.md` (envelope JSON at top, same format as other
   results) so Hermes can verify and it shows in the farm app / EWART BRAIN.
3. Hermes/Claude reads outbox + the result file, **verifies it** (a self-report is
   not truth — check the artifact, URL, or file), merges the outcome, and updates
   `context.md` with anything new.

## Statuses
- `done` — deliverable produced, result file present.
- `needs_review` — produced but needs an owner/uspervisor decision (money/publish).
- `blocked` — missing data / access; state what is needed to unblock.

## Rules
- **No fabricated results.** If Gatis can't reach a source, return `blocked` with
  the re-verify method — never invent numbers or citations.
- **Idempotent ids** (`g-NNN` unique). Do not reuse; on retry bump the id or add a
  `retry_of` field.
- **Verification is Hermes' job.** Gatis' envelope is evidence to check, not a
  claim to trust blindly.
- **Separate lane, same standards.** Even though Gatis is a distinct agent, every
  external claim carries a truth-rating 1–10 + source (farm rule).

## Example (worked)
```
Task:  g-0002 — "Summarise last week's Amazon DE ACoS vs TACoS from data/amazon-venues.json"
Inbox: {"id":"g-0002","at":"...","from":"herme","to":"gatis","task":"...ACoS vs TACoS...",
        "context_ref":"context.md","expects":"2 numbers + what changed","deadline":""}
Outbox:{"id":"g-0002","at":"...","from":"gatis","to":"herme","status":"done",
        "summary":"DE ACoS ≈ 30%, TACoS ≈ 10% (per farm data; verify on live Seller Labs).",
        "artifacts":["exchange/results/t-gatis-0002.md"]}
```

Ask the owner or Hermes if anything here is unclear — better to confirm the
protocol than to guess.