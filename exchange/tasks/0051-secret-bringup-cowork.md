# CLAUDE COWORK — bring up the "Secret" Amazon-EU farm worker on this MacBook

You are running in a Claude Code cowork session on the owner's MacBook Air
(/Users/secretingredient). Your job is to set up the **Secret** worker —
the EWART WOODS farm's autonomous Amazon-EU agent — exactly and verifiably.

Read the repo first:
- `exchange/secret/HANDOVER.md` — what the owner brings,
- `exchange/secret/context.md` — what Secret is,
- `exchange/secret/task-spec.md` — how tasks look,
- `scripts/secret-worker/setup-secret.sh` — the installer,
- `scripts/autopilot.sh` — the worker loop (REPO is now portable: derived from the script's own location).

## Step 1 — prerequisites (verify each, fix what's missing)
1. `node -v` → must be `v20+`. If missing: install via the official .pkg from
   nodejs.org (GUI) OR `brew install node` if Homebrew exists. Isolate:
   - if `node` missing → install now.
2. `git` → present on macOS by default (`git --version`).
3. `claude` CLI → `command -v claude` or `~/.local/bin/claude`. If missing:
   `npm i -g @anthropic-ai/claude-code`, then **log the owner in** with
   `claude` (interactive; the owner authenticates in the popup). After login,
   `claude auth status` should show active.
4. **Amazon browser profile** (owner task): open Chrome, create a profile
   "Secret"-dedicated, and have the owner log into the **EU Amazon seller
   accounts** (sellercentral-europe.amazon.com) for DE/FR/IT/ES/UK/NL/SE/PL/BE.
   Do NOT store passwords yourself. (If the owner can't do this now, note it;
   Secret's first web task will ask him to complete it.)

## Step 2 — the install
Run:
```
bash scripts/secret-worker/setup-secret.sh
```
Confirm what it asks:
- writes `.env` (or instructs the owner to create it) — never print the key.
- installs the 15-min service (launchd plist at
  `~/Library/LaunchAgents/com.ewartwoods.secret-autopilot.plist`), identity
  `WORKER_ID=secret`, `AUTOPILOT_EXECUTE=1`.
- This is an **always-on service that spends tokens** → PAUSE and explicitly ask
  the owner "OK to enable the 15-min Secret worker?" before it becomes active.

## Step 3 — dry-run (no execute)
```bash
AUTOPILOT_EXECUTE=0 WORKER_ID=secret bash scripts/autopilot.sh
```
Expected: `autopilot: no unprocessed tasks` (or a task-line) → worker claims OK.
If it fails: read `state/log-mac.md` / `state/secret.err.log` and fix.

## Step 4 — enable the service (with owner consent)
```bash
launchctl unload ~/Library/LaunchAgents/com.ewartwoods.secret-autopilot.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.ewartwoods.secret-autopilot.plist
```
Then confirm it runs: `launchctl list | grep ewartwoods` shows the job.

## Step 5 — first read-only web task (recommended)
Write `exchange/tasks/0051-secret-first.md` (in the repo) with the owner:
```
- **to:** secret
- **work_type:** web
- **kind:** `analysis`
- **approval:** auto
- **amazon_scope:** DE
Do: log into the Amazon DE seller page via the dedicated Chrome profile; pick ONE
known ASIN from data/product-master.csv; return the current Buy-Box offer + price.
Return: envelope with the values + a screenshot saved to data/secret/verify.png.
```
Run it once headless. If the page needs human login first, tell the owner to log
in once and retry. Commit nothing with passwords.

## Step 5 — finish
- Report to the owner in one short block: what's running (node/claude/service),
  the one thing HE must do (Amazon login in the profile), and the repo commit
  hash you pushed (if any).
- Do NOT push secrets. Never invent Amazon data.

## Owner context (short)
EWART WOODS (wood home-decor, Riga). Hermes (this farm's supervisor) will route
tasks to Secret and verify results. Money actions = needs_review only.