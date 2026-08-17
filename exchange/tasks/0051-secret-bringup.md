# Task t-0051 — Bring up the "Secret" Amazon-EU worker on the second computer

- **id:** t-0051
- **from:** Hermes (supervisor)
- **to:** Claude (cowork session) — run this interactively WITH THE OWNER on the
  **second computer** (the one that manages our European Amazon stores).
- **kind:** `code_local` + **system bring-up** (installs a service on that machine)
- **priority:** high
- **provider:** `claude`

---

## Owner's ask (verbatim spirit)
"Pievienot autopilotu citā datorā. Sagatavo visu, kas man tur jānodod, un
instrukciju Claude cowork, lai to palaida. Šis aģents sauksies **Secret**. Viņš
atradīsies uz datora, kurš pārvalda mūsu Eiropas Amazon veikalus. Tur viņam
jāveic visa veida izmaiņas Amazon veikalā un jāievāc info no turienes. Dažiem
darbiem jāveic web (jo nav iespējams caur API). Claude jāstrādā web. Visu
pārvalda joprojām Hermes."

---

## What to do (in order)

### 0. Pre-flight (on the second computer)
1. Check OS (macOS or Linux), `node -v` >= 20, `git`, and `claude` CLI installed
   + authenticated (`claude auth status`). If any missing → tell the owner what
   to install (node from nodejs.org, git, `npm i -g @anthropic-ai/claude-code`).
2. Clone the farm repo if not present:
   `git clone https://github.com/ewartwoods-code/ewart-woods-farm.git ~/ewart-woods-farm`
3. Set up **Amazon browser access**: a dedicated Chrome profile with the EU
   Amazon seller accounts (DE/FR/IT/ES/UK/NL/SE/PL/BE) logged in — this is how
   web tasks will work (no API for many things). Confirm the owner's logins are
   available; if not, ask the owner to log in now (do NOT store passwords
   yourself).
4. Create `~/ewart-woods-farm/.env` (NOT committed) with
   `OPENROUTER_API_KEY=<existing farm key>`.

### 2. Run the bring-up script (this repo, on that machine)
```
cd ~/ewart-woods-farm
bash scripts/secret-worker/setup-secret.sh
```
The script:
- verifies prerequisites,
- writes a **launchd plist** (macOS) or **systemd timer / cron** (Linux) named
  `com.ewartwoods.secret-autopilot` that runs every 15 min:
  `AUTOPILOT_EXECUTE=1 WORKER_ID=secret bash scripts/autopilot.sh`
  (REPO must be the clone path),
- prints the exact log paths so the owner can tail them.

**Confirm with the owner before enabling any always-on service** (it spends
tokens on the farm's tasks — mark it as needs_review if the owner hesitates).

### 3. First dry run (no execute)
```
AUTOPILOT_EXECUTE=0 WORKER_ID=secret bash scripts/autopilot.sh
```
Should say `no unprocessed tasks` or list a task — this proves the worker's
claiming works. Then enable the service.

### 4. Register Secret in the farm (files; DB row optional)
- `AGENTS.md` (this repo): add agent **#18 Secret** — EU Amazon web worker,
  remote host, `kind: read+write (web/API Amazon; money still gated)`, channel
  `exchange/secret/`. (Hermes will also add the inventory/brain rows.)
- The `agents` DB row (Supabase) for Secret can be added by Hermes later; do not
  invent a prompt — use `exchange/secret/context.md`.

### 5. First real task (optional here)
If the owner approves, write a first small read-only task (`to: secret`,
`work_type: web`) like "check the buy-box on ASIN X on Amazon DE and return the
current offer+price" → run once headless → result envelope → push. Hermes will
verify.

---

## Definition of done (verify)
- [ ] Clone on the second computer + `claude` working (checked).
- [ ] `.env` with OPENROUTER key present (masked check).
- [ ] `setup-secret.sh` ran; service registered (plist/systemd/timer listed) —
      **owner approved**.
- [ ] Dry run: `WORKER_ID=secret` autopilot runs, exits 0, logs in
      `state/log-mac…` equivalent (or `state/log-secret.md`).
- [ ] AGENTS.md has Secret (#18).
- [ ] Anything committed/pushed that must be; **no keys/passwords committed**.

## Out of scope
- Deploying Secret to the farm app UI (needs_review later).
- Anything spending money without an explicit approved task.
- Storing Amazon passwords anywhere except the dedicated Chrome profile.

— Hermes, 2026-08-17