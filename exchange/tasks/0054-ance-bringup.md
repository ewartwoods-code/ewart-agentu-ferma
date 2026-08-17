# ANCE — Bring-up instructions for the Etsy + US/CA Amazon worker

You are setting up a new farm worker on a NEW computer that will manage:
- **Etsy** store,
- **Amazon US & Canada (CA)** stores.

Agent name: **Ance**.
To connect her to the farm exactly like the "Secret" Amazon-EU worker already
running on another computer, follow these steps ON THE NEW COMPUTER.

============================================================
STEP 1 — PREREQUISITES (check each, install what's missing)
============================================================
1.1 Node.js
    Run:  node -v
    Need: v20 or newer.
    If missing: install from nodejs.org (LTS .pkg for macOS, or the binary for
    Linux). Re-open the terminal so PATH refreshes, re-check.

1.2 git:  git --version   (macOS ships it; else Xcode CLT / apt)

1.3 Claude CLI:
    Run:  command -v claude
    If missing:  npm i -g @anthropic-ai/claude-code
    Then authenticate:  claude   (interactive login in a browser; you log in).
    Confirm:  claude auth status  -> ACTIVE.

1.4 Browser access (owner does the logins, you help):
    Open Chrome, create a dedicated profile named "Ance", and have the OWNER
    log into:
      - Etsy Seller account (etsy.com/your/shop),
      - Amazon Seller Central US (sellercentral.amazon.com),
      - Amazon Seller Central Canada (sellercentral.amazon.ca).
    This is how Ance will work in the browser when there is no API. You do NOT
    store passwords yourself.

1.5 .env (never commit): create  ~/your-clone/.env  with:
      OPENROUTER_API_KEY=<the farm OpenRouter key>
    (chmod 600). Needed for OpenRouter models as fallback when Claude limit is
    used up.

============================================================
2 — CLONE + INSTALL (same pattern as Secret)
============================================================
    git clone https://github.com/ewartwoods-code/ewart-woods-farm.git ~/ewart-woods-farm
    cd ~/ewart-woods-farm

    # if you cloned with SSH, ensure push works (git remote -v)

    bash scripts/ance-worker/setup-ance.sh

    What the script does (mirrors Secret):
      - verifies prereqs,
      - writes .env if the OPENROUTER key is in the env,
      - installs the always-on 15-min service (launchd plist OR systemd/cron)
        named com.ewartwoods.ance-autopilot with
          AUTOPILOT_EXECUTE=1 WORKER_ID=ance
        logs in state/ance.out.log / state/ance.err.log.

    PAUSE: enabling an always-on service spends tokens. ONLY proceed to enable
    it after the OWNER explicitly says yes.

============================================================
3 — DRY RUN (prove it claims tasks, does not execute)
============================================================
    cd ~/ewart-woods-farm
    AUTOPILOT_EXECUTE=0 WORKER_ID=ance bash scripts/autopilot.sh
    Expected: "autopilot: no unprocessed tasks" or a task-line.
    If it fails, read state/log-mac.md and state/ance.err.log, fix, retry.

============================================================
4 — ENABLE THE SERVICE (owner approval first)
============================================================
    macOS:
      launchctl unload ~/Library/LaunchAgents/com.ewartwoods.ance-autopilot.plist 2>/dev/null
      launchctl load   ~/Library/LaunchAgents/com.ewartwoods.ance-autopilot.plist
      Verify: launchctl list | grep ewartwoods
    Linux (systemd):
      systemctl --user daemon-reload
      systemctl --user enable --now ewart-ance.timer

============================================================
5 — REGISTER Ance in the farm
============================================================
    - AGENTS.md already has the pattern (Secret, #18). Add an analog for Ance:
      (Hermes will add an AGENT entry #20 "Ance" — Etsy + US/CA Amazon worker,
       channel exchange/ance/, kind read+write, money gated, web-capable.)
    - DB agents row for Ance can be added by Hermes.

============================================================
6 — FIRST REAL READ-ONLY WEB TASK (recommended)
============================================================
    Write exchange/tasks/0054-ance-first.md:
    # Task t-0054 — Ance first check: Etsy shop + US/CA Amazon
    - **to:** ice
    - **work_type:** web
    - **kind:** `analysis`
    - **approval:** auto
    - **scope:** Etsy; Amazon US; Amazon CA
    Do: list the current Etsy shop listings (count, titles) and the US/CA
    Amazon listings for one product; return a short structured summary.
    Return: table + any missing-data notes.

============================================================
7 — FINISH
============================================================
    - Commit + push changes (never secrets; never commit keys or Amazon/Etsy
      logins).
    - Report to the owner, short:
        1) node version, claude active, .env present (yes/no),
        2) service enabled (yes/no),
        3) the ONE thing the owner must do himself: log into the dedicated
           Chrome profile with Etsy + US/CA Amazon seller accounts,
        4) commit hash you pushed.
    - Hermes will verify Ance's envelopes.

owner/manage touches outside approval-g gate: Ance can change prices/stock,
optimize listings, manage ads on Etsy + US/CA Amazon ON approved tasks only;
money/publish stays owner-gated. Never invent market data (always truth-rate).

-- end --