# exchange/groks — two-way channel for the "Grok" agent

Grok is the owner's xAI model, added to the farm as a **distinct agent**. Like
Gatis/GPT and Džemma/Gemini, this folder is his lane: Hermes/Claude drop tasks
in one place, Grok returns results in another, and `context.md` carries the
shared knowledge for high-quality turns.

## Files
| File | Who writes | What it is |
|---|---|---|
| `context.md` | Hermes/Claude (+ Grok proposals) | Shared knowledge Grok reads first every turn. |
| `inbox.ndjson` | Hermes/Claude | Tasks FOR Grok, one JSON per line. |
| `outbox.ndjson` | Grok | Results FROM Grok, one JSON per line (envelope). |
| `README.md` | this | Protocol + example. |

## Protocol (round trip) — same as Gatis / Džemma
1. Hermes/Claude appends one line to `inbox.ndjson`:
   ```json
   {"id":"gk-0001","at":"2026-08-17T12:00:00Z","from":"herme","to":"grok",
    "task":"Propose 3 high-value Grok tasks for EWART WOODS.",
    "context_ref":"context.md","expects":"table: task, value","deadline":""}
   ```
2. Grok reads `context.md` + inbox line, does the work, appends to `outbox.ndjson`:
   ```json
   {"id":"gk-0001","from":"grok","to":"herme","status":"done",
    "summary":"3 tasks proposed...","artifacts":["exchange/results/t-grok-0001.md"]}
   ```
   and, when real deliverable, writes `exchange/results/t-grok-0001.md`.
3. Hermes verifies (self-report ≠ truth), merges, updates `context.md`.

## Statuses
- `done` · `needs_review` (owner/supervisor decision) · `blocked` (missing data/access; state what's needed).

## Rules
- No fabricated results; `blocked` with re-verify method if source unreachable.
- Idempotent ids (`gk-NNN`). Envelope + result file; Hermes verifies.
- Truth-rating 1–10 + source for every external claim.

## Connection status (recorded 2026-08-17)
- XAI key **stored** in runtime `.env` (not committed).
- **xAI account currently has NO credits/license** — API returned
  `403 permission-denied: "...doesn't have any credits or licenses yet... can
  purchase on https://console.x.ai/team/..."`.
- Therefore **Grok is NOT live** until the owner adds credits. The channel,
  router and this scaffold are ready; the first real turn can only run after
  credits exist (or via OpenRouter key once openrouter has grok-*).

Ask Hermes/owner if unclear.