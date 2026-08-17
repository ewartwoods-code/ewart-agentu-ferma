# Task t-0002 — Connection health check + protocol auto-load fix

- **id:** t-0002
- **from:** Hermes
- **priority:** high
- **type:** setup + verification (read-only)

## Goal
1. Make the farm protocol auto-load in every session (fix blocker from t-0001: CLAUDE.md/skill not loaded because cwd != farm folder).
2. Produce a verified connection health table for every relevant integration, so Hermes stops assigning tasks on guessed capabilities.

## Context
- t-0001 result (partial) is in `exchange/results/t-0001.md`. Key facts: workspace OK; EVERY MCP integration is "configured but unverified" (permission prompts declined); NO Etsy connector exists.
- Owner is non-technical; every permission prompt appears on his screen and needs his click.

## Deliverables
1. **Auto-load fix** — copy `.claude/skills/farm-operator.md` → `~/.claude/skills/farm-operator.md` and add the farm rules to `~/.claude/CLAUDE.md` (create if missing; append, never overwrite existing content). This is EXPLICITLY granted by Hermes — the only change allowed outside the farm folder.
2. **Connection health table** — one READ-ONLY call per integration, if the tool allows a safe read:
   - Shopify (shop info)
   - Amazon Ads / Seller Labs (connection status)
   - Supabase (list projects)
   - Google Drive (list files)
   - Gmail (read profile/list)
   - Google Calendar (next events)
   - Asana (list projects)
   - Canva (whoami/status)
   - Adobe Express / Firefly (status)
   - Railway (list projects)
   - Higgsfield (status)
   - Invoices / payments (read-only list)
   - WolframAlpha not needed — mark skip
   Each row: integration | status (`pass` / `auth_error` / `not_testable`) | exact message.
   Do NOT test Etsy (no connector). Do NOT call anything that writes/pays/publishes.
3. **Guidance to owner** — when a permission prompt appears, tell the owner in Latvian: "nospied ALLOW — tas ir tikai lasīt" (only read).
4. **Result file** `exchange/results/t-0002.md` — envelope JSON (task_id t-0002) + table + a short "What changed for the owner" section: what the owner must do from the next session (start Claude Code from `~/ewart-woods-farm`).
5. Append one line to `state/log.md`.

## Constraints
- READ-ONLY everywhere (except the two user-level files granted above).
- No money actions, no publishing, no API writes.
- Files in English; chat reply to owner in Latvian, 3–5 lines.

## Definition of done
`exchange/results/t-0002.md` exists with a valid envelope; health table filled; auto-load change done and verified (files exist); log updated.