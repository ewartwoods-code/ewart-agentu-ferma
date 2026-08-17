# exchange/ance — two-way channel for the "Ance" agent (Etsy + US/CA Amazon)

Ance is the farm worker on a NEW computer that manages the **Etsy** store and the
**Amazon US & Canada (CA)** stores. Same pattern as Secret (EU Amazon) but for
the Americas + Etsy. Controlled by **Hermes**; money = owner-gated.

## Files
| File | Who writes | What it is |
|---|---|---|
| `context.md` | Hermes/Claude | Shared knowledge Ance reads first. |
| `inbox.ndjson` | Hermes/Claude | Tasks FOR Ance | 
| `outbox.ndjson` | Ance | Results FROM Ance (envelope) |
| `../tasks/0054-ance-bringup.md` | Hermes | Bring-up (Claude cowork) instructions |

## Protocol (identiski Secret)
1. Hermes writes `exchange/tasks/NNNN-*.md` with `to: ance` (+ optional
   `work_type: web|api`, `scope: Etsy|Amazon US|Amazon CA`). 
2. Ance's worker (15-min tick) reserves, executes headless (web via the
   dedicated Chrome profile), writes envelope result, commits+pushes.
3. Hermes verifies (self-report ≠ truth).

## Statuses
done · needs_review (owner) · blocked.

## Rules
- Money/publish only from approved task; owner is the money approver.
- Never invent Etsy/Amazon numbers — truth-rate + source + date.
- git-clean before commit; no secrets committed.

-- Hermes, 2026-08-17