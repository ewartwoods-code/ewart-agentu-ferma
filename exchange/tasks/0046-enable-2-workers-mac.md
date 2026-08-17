# Task t-0046 — Run 2 parallel autopilot workers on the Mac (enable via launchd)

```json
{
  "contract_version": "1.0",
  "task_id": "t-0046",
  "kind": "code_local",
  "provider": "claude",
  "title": "Enable 2 parallel autopilot workers on the Mac via launchd (farm-workers.sh)",
  "objective": "Make the Mac run 2 concurrent autopilot workers (scripts/farm-workers.sh) on the 15-min launchd schedule so pending tasks drain ~2x faster, with reservations + push mutex.",
  "context": {
    "source_refs": [
      "scripts/farm-workers.sh",
      "scripts/autopilot.sh",
      "scripts/autopilot-lib.sh",
      "docs/providers.md",
      "scripts/AUTOPILOT-SAFETY.md",
      "state/log-mac.md"
    ],
    "data_refs": [],
    "notes": "Hermes already implemented 2-worker parallelism: scripts/farm-workers.sh launches N autopilot.sh workers concurrently; each atomically reserves a distinct task (state/reservations/<num>) and the commit+push is serialized by a mutex. Verified on Linux: 3 workers -> 0018/0019/0020 distinct, 4th -> 0021. On the Mac this now needs: (1) launchd plist updated to call scripts/farm-workers.sh instead of running autopilot.sh once, with AUTOPILOT_EXECUTE=1 and OPENROUTER_API_KEY in EnvironmentVariables, (2) current pending tasks continue from where t-0045 left off, (3) proof run. Owner approved FULL AUTOMATION (no approval gate). Run via Claude Cowork session on this Mac."
  },
  "skill": { "name": "ferma-koderis + farm-operator", "version": "1.0" },
  "input": {
    "launchd_plist": "~/Library/LaunchAgents/com.ewartwoods.farm-autopilot.plist",
    "new_program": "bash ~/ewart-woods-farm/scripts/farm-workers.sh 2",
    "env": "AUTOPILOT_EXECUTE=1, OPENROUTER_API_KEY (see docs/providers.md; NOT in this repo)"
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "plist diff", "launchctl verification", "proof of 2 concurrent runs (log lines + reservations)", "cleanup note"],
    "envelope": true
  },
  "quality_gates": [
    "launchd plist now invokes farm-workers.sh 2 (or autopilot.sh twice with distinct WORKER_ID env) with AUTOPILOT_EXECUTE=1 in EnvironmentVariables",
    "OPENROUTER_API_KEY reachable by model-runner.js, never committed",
    "launchctl print gui/$(id -u)/com.ewartwoods.farm-autopilot shows state=running, interval ~900s, program=farm-workers.sh",
    "AUTOPILOT_EXECUTE=1 scripts/farm-workers.sh 2 run once manually: both workers each picked a DIFFERENT pending task (verify reservations dir had 2 entries), both results written and pushed, repos clean",
    "No git reset --hard, no force push, no key committed, no real business change beyond what the pending tasks themselves do",
    "state/log-mac.md shows at least 2 distinct task lines from the same tick"
  ],
  "priority": "P0",
  "status": "queued",
  "labels": ["infra", "autopilot", "parallel"]
}
```

## Instructions (Claude Cowork, on the Mac)

Read `scripts/farm-workers.sh`, `scripts/autopilot.sh`, `scripts/autopilot-lib.sh`,
`docs/providers.md`, `scripts/AUTOPILOT-SAFETY.md` first.

1. **Pull** — `cd ~/ewart-woods-farm && git pull origin master`; confirm
   `scripts/farm-workers.sh` exists and the tree is clean.
2. **Syntax** — `bash -n scripts/farm-workers.sh scripts/autopilot.sh scripts/autopilot-lib.sh`.
3. **Edit the launchd plist** — make the job run `scripts/farm-workers.sh 2`
   (2 workers) with `AUTOPILOT_EXECUTE=1` in `EnvironmentVariables` (and
   `OPENROUTER_API_KEY` if available; otherwise note it). Keep the ~15-min
   `StartInterval` (900s).
4. **Reload** — `launchctl unload ~/Library/LaunchAgents/com.ewartwoods.farm-autopilot.plist`
   then `launchctl load ...`; verify with
   `launchctl print gui/$(id -u)/com.ewartwoods.farm-autopilot` that the program
   and env are right, `state=running`.
5. **Manual proof** — `cd ~/ewart-woods-farm && AUTOPILOT_EXECUTE=1 scripts/farm-workers.sh 2`.
   Watch for: both workers pick DIFFERENT pending tasks (check `state/reservations/`
   had two dirs and `state/log-mac.md` gained two `in_progress` lines from the
   same tick), both results land in `exchange/results/`, push succeeds, cleanup
   empty. If pending tasks are none/unreserved, say so and mark `blocked`.
6. **Commit + push** — commit the state/log/result changes; push origin master.

**Definition of done:** t-0046 result = `completed` with the plist diff + proof
of two distinct concurrent picks (or `blocked` naming exactly what's missing).