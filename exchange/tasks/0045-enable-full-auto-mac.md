# Task t-0045 — Enable FULL-AUTO provider routing on the Mac (finish wiring)

```json
{
  "contract_version": "1.0",
  "task_id": "t-0045",
  "kind": "code_local",
  "provider": "claude",
  "title": "Enable full-auto multi-provider autopilot on the Mac (launchd + OPENROUTER_API_KEY + end-to-end proof)",
  "objective": "Finish the FULL-AUTOMATION provider routing on the Mac: pull the pushed router code, enable execution in launchd, set OPENROUTER_API_KEY, and prove a non-Claude task runs autonomously.",
  "context": {
    "source_refs": [
      "scripts/autopilot.sh",
      "scripts/autopilot-lib.sh",
      "scripts/model-runner.js",
      "scripts/provider-router.js",
      "docs/providers.md",
      "scripts/AUTOPILOT-SAFETY.md",
      "state/log-mac.md",
      "state/autopilot-status.json"
    ],
    "data_refs": [],
    "notes": "Hermes already wrote and pushed the full-auto routing code. The code changes ARE DONE (commit c476f9c on origin/master). What is still on the MAC: (1) enable AUTOPILOT_EXECUTE=1, (2) provide OPENROUTER_API_KEY to the autopilot environment, (3) confirm the Mac pulls the new code, (4) prove one non-Claude (provider: gpt | gemini | auto) task dispatches end to end. The owner approved FULL AUTOMATION with no approval gate, including money/publish tasks. Run via Claude Cowork session on this Mac."
  },
  "skill": { "name": "ferma-koderis + farm-operator", "version": "1.0" },
  "input": {
    "autopilot_execute_env": "AUTOPILOT_EXECUTE=1 (in the launchd plist EnvironmentVariables)",
    "openrouter_key_env": "OPENROUTER_API_KEY (see docs/providers.md §6; put it in the plist EnvironmentVariables or ~/.hermes/.env, NEVER in this repo)",
    "repo": "~/ewart-woods-farm (this Mac's clone of github.com:ewartwoods-code/ewart-woods-farm, branch master)"
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "what was changed on the Mac", "verification evidence (exact commands + output)", "proof of one non-Claude run"],
    "envelope": true
  },
  "quality_gates": [
    "launchd plist com.ewartwoods.farm-autopilot now has AUTOPILOT_EXECUTE=1 in EnvironmentVariables",
    "OPENROUTER_API_KEY is reachable by scripts/model-runner.js (env or ~/.hermes/.env), and is NOT committed to git",
    "Mac clone is up to date with origin/master (git pull done, no local conflicts)",
    "autopilot.sh + autopilot-lib.sh + model-runner.js pass bash/node syntax on the Mac",
    "One real non-Claude dispatch proven: create a temporary 'provider: gemini' (or gpt/auto) REPORT task, run the autopilot or model-runner once, capture the result envelope + cost + the written exchange/results file, then remove the temporary test task/result so the repo is clean",
    "No git reset --hard, no force push, no key committed, no real business change made",
    "state/log-mac.md and state/autopilot-status.json updated with the run"
  ],
  "priority": "P0",
  "status": "queued",
  "labels": ["infra", "autopilot", "providers"]
}
```

## Instructions (Claude Cowork on the Mac)

Read `docs/providers.md`, `scripts/autopilot.sh`, `scripts/autopilot-lib.sh`,
`scripts/model-runner.js`, `scripts/AUTOPILOT-SAFETY.md` first. The routing code
is already on `origin/master` (Hermes pushed it). Your job is the **Mac-side
enablement** — the parts Hermes cannot reach.

1. **Sync** — `cd ~/ewart-woods-farm && git pull origin master`. Confirm the
   router files are present and the working tree is clean.
2. **Syntax check** — `bash -n scripts/autopilot.sh scripts/autopilot-lib.sh` and
   `node --check scripts/model-runner.js`.
3. **Enable execution** — edit `~/Library/LaunchAgents/com.ewartwoods.farm-
   autopilot.plist`. In `EnvironmentVariables`, set `AUTOPILOT_EXECUTE` to `1`
   (and keep/verify the existing entries). Reload: `launchctl unload ... ` then
   `launchctl load ...`. Verify with `launchctl print gui/$(id -u)/com.ewartwoods.farm-autopilot`
   that `state=running`, `AUTOPILOT_EXECUTE => 1`, and interval is ~900s.
4. **OPENROUTER_API_KEY** — add it to the plist `EnvironmentVariables` OR to
   `~/.hermes/.env` (whichever the launchd job's PATH/env can read). The key is
   provided by the owner/Hermes; do NOT invent one, do NOT commit it. If it is not
   yet available, set it as far as possible, mark that one sub-step blocked in the
   envelope, and do not fake a live call.
5. **Prove one non-Claude run** — create a temporary REPORT task in
   `exchange/tasks/` with `"provider": "gemini"` (or gpt/auto), run the autopilot
   once (`AUTOPILOT_EXECUTE=1 scripts/autopilot.sh`) or directly
   (`node scripts/model-runner.js exchange/tasks/<tmp> <id>`), capture the result
   envelope + `usage.cost`, then DELETE the temporary task and its result so the
   repo is clean. Verify `state/autopilot-status.json` reflects a real run.
6. **Report** — write `exchange/results/t-0045.md` (envelope + exact evidence:
   plist diff, launchctl output, the temp run's model/cost/result). Commit and
   push origin master.

**Constraints / safety:** This is full-auto enablement, but do NOT make any real
business change (no live listing/price/ad/publish). The temporary test task is
read-only report work. Never `git reset --hard`, never force-push. Never write a
key into this repo. All task/result files in English.

**Definition of done:** t-0045 result exists with envelope `status: completed` (or
`blocked` naming exactly what's missing), a clean working tree, execution enabled in
launchd, and either a proven live non-Claude run (with cost) or an explicit blocker.