# Task t-0007 — Ecosystem autopilot: autonomous task loop on the Mac (headless Claude)

- **id:** t-0007
- **from:** Hermes
- **priority:** P0 (ecosystem milestone M4)
- **type:** setup + automation

## Goal
Close the last loop of the ecosystem: Claude picks up tasks from GitHub **by itself**,
executes them headless, and pushes results back — on a schedule, without the owner
opening a terminal. After this task, Hermes ↔ Claude exchange runs without the owner's
hands; the owner only approves `needs_review` items via WhatsApp.

## Context
- Repo `ewart-woods-farm` (master) is the single channel; owner confirmed the directive:
  build ecosystem first, no business changes until v1.0.
- Owner approved building the autopilot now.
- Claude Code is already installed on this Mac and authenticated (OAuth, Pro/Max) —
  verify, do not assume.

## Deliverables
1. **Readiness check.** `claude --version` and `claude auth status --text`.
   - If OAuth session present → headless `-p` runs work with no API key.
   - If it reports a missing/invalid session, tell the owner in Latvian exactly how to
     set `ANTHROPIC_API_KEY` in `~/.zshrc` (never write the key to any file in the repo).
2. **Autopilot script** `scripts/autopilot.sh` inside the repo, which:
   - `cd` into the repo and `git pull --quiet origin master` (no force, no reset).
   - Finds the **lowest-numbered unprocessed task** (a file in `exchange/tasks/` whose
     `t-NNNN` has no matching `exchange/results/t-NNNN.md`); if none → log "no tasks" and exit 0.
   - Executes it headless, e.g.:
     `claude -p --dangerously-skip-permissions --max-turns 60 "Execute exchange/tasks/<file> now, following the farm-operator skill in this repo. Work autonomously. Do not touch anything outside this repo. Push the result to git when done."`
     (Path to the `claude` binary resolved via `which claude`; fallback to `~/.local/bin/claude`.)
   - After the run: `git add -A && git commit -m "t-NNNN autopilot: <short title>" && git push origin master` (if the local guard refuses the push, log it and exit 1 — do NOT bypass).
   - Appends a line `YYYY-MM-DDTHH:MM:SSZ | t-NNNN | exit <code>` to `state/log-mac.md`.
3. **Schedule.** Install a scheduler entry running the script **every 15 minutes**:
   - Preferred: a launchd plist `~/Library/LaunchAgents/com.ewartwoods.farm-autopilot.plist`
     (ProgramArguments = [script path], StartInterval = 900, RunAtLoad = true), loaded via
     `launchctl load`; document the exact commands used.
   - Alternative: a crontab line `*/15 * * * * <script>` with a comment.
   - Print the final schedule entry in the result file so Hermes can verify.
4. **Test run.** Run the script ONCE manually (owner is watching). Expected: either it
   processes nothing (repo has no unprocessed task ⇒ reports "no tasks") or it executes
   one and pushes. If the repo currently has an unprocessed system task (e.g. from
   ECOSYSTEM-ROADMAP), process it or defer: report exactly what was run and the git log.
   Verify the push round-trip with the result of this test.
5. **Result + docs.** Write `exchange/results/t-0007.md` (canonical envelope,
   `completed` when the test passed) containing: readiness output, script summary, exact
   scheduler entry, test outputs (git log tail, exit codes, log-mac lines), and a
   plain-language "how to turn it off" (uninstall line) for the owner.

## Constraints
- **Autopilot only transports tasks and results.** It must not apply money/publish
  actions: any task that lands as `needs_review` stops for owner approval (as the
  contract already requires).
- No secrets committed. No changes outside the repo except the scheduler entry and
  `~/.zshrc` if a key must be set (owner-approved, never echoed).
- Files in English; chat with owner in Latvian.

## Definition of done
Script committed and pushed; scheduler installed and its exact command recorded; manual
test run completed with outputs captured; result file written with canonical envelope;
`state/log-mac.md` shows the test line. Hermes can then rely on the loop.