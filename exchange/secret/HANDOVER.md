# SECRET — Amazon EU Worker (remote autopilot on the second computer)

Bring-up package for the **Secret** agent: an autonomous farm worker on the
computer that manages our European Amazon stores. Secret is a full agent of the
farm, controlled by **Hermes** (supervisor), like every other agent — but it has
**web access and Amazon access**, because many Amazon tasks cannot be done via
API and must be done in the browser.

## What Secret is / is not
- **Is:** a Claude Code headless worker (cloned repo + autopilot loop, like the
  Mac worker), identity `WORKER_ID=secret`, with **WebSearch/WebFetch/Browser
  allowed** and Amazon-store credentials (owned by the owner).
- **Is NOT:** a separate brain. Hermes dispatches tasks (exchange/tasks → the
  inbox pattern), Secret executes and returns results (exchange/results +
  exchange/secret/ channel), Hermes verifies. All money decisions stay
  owner/approval-gated per farm rules.

## Handover checklist (what YOU must take to that computer)
1. **Hardware/OS:** a Mac or Linux computer, always-on (or on when the farm is),
   with:
   - `node` (>= 20) and `git`
   - Claude Code CLI installed + authenticated (`claude` in PATH). This is what
     runs the headless tasks.
   - The farm repo cloned: `git clone
     https://github.com/ewartwoods-code/ewart-woods-farm.git ~/ewart-woods-farm`
   - A GitHub token/SSH key with **push** rights to that repo (the worker must
     commit results and push).
2. **Amazon access:** a **web login profile** (Chrome) with the EU Amazon seller
   accounts (DE/FR/IT/ES/UK/NL/SE/PL/BE...) so Secret can log in and work in the
   browser when API isn't possible. Best: a dedicated Chrome profile.
   - Also any Amazon Seller Central MCP/connector the owner already has on that
     machine (the worker can use it when available).
3. **Env file** `~/ewart-woods-farm/.env` (NOT committed): put at least
   - `OPENROUTER_API_KEY=...` (for non-claude routing, same as other agents)
   - There is **no extra key needed for Claude** (subscription auth).
4. **Run the setup** (see below) → it installs the launchd/plist (macOS) or
   systemd/crond (Linux) so the worker ticks every 15 minutes automatically.

## Setup (run once on that computer)
```bash
cd ~/ewart-woods-farm
bash scripts/secret-worker/setup-secret.sh
```
The script:
- checks node/git/claude,
- sets `WORKER_ID=secret` for all runs (via the launch config/environment),
- installs the service (`launchd` plist on macOS, `systemd` timer on Linux or a
  `cron` line) running `scripts/autopilot.sh` every 15 min with the env
  `AUTOPILOT_EXECUTE=1 WORKER_ID=secret`,
- verifies with one headless run that the farm is reachable.

## 3. How tasks reach Secret
Same as every agent: Hermes writes `exchange/tasks/NNNN-*.md` with frontmatter
```
- **to:** secret
- **work_type:** web (or api)
```
Secret's worker reads the shared repo every 15 min, reserves the lowest pending
task (atomic), executes it headless (Claude Code, Web allowed; **Amazon Web =
dedicated browser login** when the task says web), commits `exchange/results/…`
with an envelope, pushes, and releases the reservation. Hermes verifies the
envelope and outcome.

## 4. What Secret does for EU Amazon (examples, owner-confirmed)
- Change prices/stock on Amazon DE/FR/… (web or API when available).
- Pull listings, offers, buy-box data, ACoS snapshots (web scraping when API
  absent).
- Manage campaigns (crafted PPC) in the browser when the API isn't accessible.
- Never touches other stores' money without the owner's OK (money gates same as
  the main farm).

## 6. Safety (same rules as the farm)
- Money/publish actions happen ONLY for tasks the owner/Hermes approved
  (Hermes is the supervisor; it may mark a task needs_review).
- Secret never publishes/emails/spends without a task that explicitly says so.
- Files it doesn't know it created get cleaned before commit (the farm's
  "always git-clean before commit" rule), just like the research agents.

## 7. First-time check (after setup)
```bash
cd ~/ewart-woods-farm
AUTOPILOT_EXECUTE=0 WORKER_ID=secret bash scripts/autopilot.sh   # dry: finds task
```
If that prints a task-line, the worker is ready. Then `launchctl`/`systemctl`
takes over the 15-min tick.

Repository host: `https://github.com/ewartwoods-code/ewart-woods-farm.git`
Supervisor: **Hermes** (this machine). Agent id in the farm: `secret` (t-0051).

— Hermes, 2026-08-17