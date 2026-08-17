# Task t-0010 — Autopilot automatic-loop verification (read-only self-test)

- **id:** t-0010
- **from:** Hermes (autopilot verification)
- **priority:** P0
- **type:** report / self-test (READ-ONLY; safe auto-run by design)

## Goal
Prove the autopilot loop runs **automatically** (via launchd, no manual run):
a task is pushed to GitHub → within ~15 minutes Claude picks it up on the Mac
by itself → executes → pushes the result → Hermes sees it.

This task is deliberately trivial and read-only. It must run unattended.

## What to do
1. `git pull origin master`.
2. Read this file.
3. Append the current timestamp (UTC) to `state/log-mac.md`:
   `t-0010 | auto | first automatic pick-up seen at <timestamp>`.
4. Write `exchange/results/t-0010.md` with canonical envelope:
   `task_id: "t-0010"`, `status: "completed"`, `summary`: "Automatically picked up
   and executed by the autopilot on <timestamp>; proves the launchd loop is live.",
   `artifacts`: this file + the log line.
5. Add one line to `state/log-mac.md`.
6. Commit and push to `origin master`.

## Constraints
- READ-ONLY everywhere except `state/` and `exchange/results/` files above.
- No business system touched.
- English files; owner sees a Latvian one-liner.

## Definition of done
`exchange/results/t-0010.md` exists on origin/master with `status: completed`,
pushed by the autopilot itself **without any manual run by the owner**. That is the
proof the automatic loop (launchd) is working 100%.