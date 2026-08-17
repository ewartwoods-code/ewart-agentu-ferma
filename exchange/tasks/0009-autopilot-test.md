# Task t-0009 — Autopilot end-to-end test (SELF-TEST, no business impact)

- **id:** t-0009
- **from:** Hermes (autopilot verification)
- **priority:** P0 (ecosystem milestone M4 — verify the loop)
- **type:** self-test / verification

## Goal
Prove the full autopilot loop works end to end, WITHOUT touching any business system:
a task is placed on GitHub → Claude picks it up → executes → writes a result → pushes back
→ Hermes reads it. This is the gateway test before M4 is declared complete.

## What to do
This task must NOT make any external/business change. Its only job is to prove the loop:

1. Confirm the repo is up to date: `git pull origin master`.
2. Read this task file.
3. Create a small artifact proving execution: write `artifacts/autopilot-proof.md` containing:
   - your Claude Code version (`claude --version`),
   - the current timestamp,
   - a one-line confirmation that this task was picked up and executed by the autopilot loop.
4. Write `exchange/results/t-0009.md` with the canonical envelope:
   `task_id: "t-0009"`, `status: "completed"`, `summary`, `artifacts`.
5. Add a line to `state/log-mac.md`.
6. Commit and push to `origin master`.

## Constraints
- No business system touched (no Shopify/Amazon/Etsy/Gmail/ads/payments writes).
- READ-ONLY everywhere except the artifacts/result/log files above.
- English files; the owner sees a Latvian one-liner.

## Definition of done
`exchange/results/t-0009.md` (envelope completed) + `artifacts/autopilot-proof.md`
exist on GitHub origin/master, pushed by the autopilot itself. That proves the loop.