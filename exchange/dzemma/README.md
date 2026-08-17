# exchange/dzemma — two-way channel for the "Džemma" agent

Džemma is the owner's existing Gemini, added to the farm as a **distinct agent**
(female, like Gatis is the owner's GPT). This folder is her lane: Hermes/Claude
drop tasks in one place, Džemma returns results in another, and `context.md`
carries the shared knowledge so every turn starts at high quality.

## Files
| File | Who writes | What it is |
|---|---|---|
| `context.md` | Hermes/Claude (+ Džemma proposals) | The shared knowledge pack Džemma reads first every turn. |
| `inbox.ndjson` | Hermes/Claude | Tasks FOR Džemma, one JSON per line. |
| `outbox.ndjson` | Džemma | Results FROM Džemma, one JSON per line (envelope). |
| `README.md` | this | Protocol + example. |

## Protocol (round trip) — same as Gatis
1. Hermes/Claude appends one line to `inbox.ndjson`:
   ```json
   {"id":"dz-0001","at":"2026-08-17T11:00:00Z","from":"herme","to":"dzemma",
    "task":"Propose 5 quick high-value Gemini tasks for EWART WOODS.",
    "context_ref":"context.md","expects":"table: task, value, effort","deadline":""}
   ```
2. Džemma reads `context.md` + the inbox line, does the work, then appends to
   `outbox.ndjson`:
   ```json
   {"id":"dz-0001","at":"2026-08-17T11:20:00Z","from":"dzemma","to":"herme",
    "status":"done","summary":"5 tasks proposed...","artifacts":["exchange/results/t-dzemma-0001.md"]}
   ```
   and, when it is a real deliverable, ALSO writes `exchange/results/t-dzemma-0001.md`
   (envelope at top) so Hermes can verify and it shows in the farm / EWART BRAIN.
3. Hermes/Claude reads outbox + the result file, **verifies it** (a self-report is
   not truth), merges, and updates `context.md` with anything new.

## Statuses
- `done` — deliverable produced, result file present.
- `needs_review` — produced but needs an owner/supervisor decision (money/publish).
- `blocked` — missing data / access; state what is needed to unblock.

## Rules
- **No fabricated results.** If Džemma can't reach a source, return `blocked` with
  the re-verify method — never invent numbers or citations.
- **Idempotent ids** (`dz-NNN` unique). No reuse; on retry bump id or add `retry_of`.
- **Verification is Hermes' job.** Džemma's envelope is evidence to check, not a
  claim to trust blindly.
- Same standards as every agent: truth-rating 1–10 + source for external claims.

Ask Hermes/owner if anything unclear — better to confirm than to guess.