# Task t-0042 — Strategy registry in the farm app: each agent shows its strategy, viewable + improvable

- **id:** t-0042
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS)
- **kind:** `code_local`
- **priority:** high
- **provider:** `claude`
- **model_hint:** default.

## Owner's ask (verbatim spirit)
Each agent must have attached: WHICH STRATEGY it works by. The STRATEGY LIST must also be
registered/created/managed IN THE FARM (af app), so that they (the agents/owner) can VIEW, READ
and IMPROVE the strategies when needed.

## Deliverables
1. **Agent strategy links in profile** — in each agent's profile modal (t-0013/t-0029), add a
   "Stratēģija" section that shows the strategy(ies) this agent works by (from
   knowledge/strategy-map.md): name + short summary + link/click to open the full strategy.
2. **Strategy registry view in the app** — a "Stratēģijas" section (main screen or its own
   card/screen) listing ALL strategies:
   - title (Latvian), status (draft/active/review), which agents use it, last updated;
   - click → read the full strategy (render the md as readable page);
   - WHEN APPROVED-FLOW: an "Uzlabot" proposal flow — any agent (or owner) can suggest an
     improvement (draft edit) that is shown to the owner for approval before updating the file
     (approval-gated, no silent edits).
3. **Sync** — the app list comes from knowledge/strategy-map.md (or a table `strategies` if
   preferred — migration created NOT applied); keep names/links consistent.
4. Keep other views working; Latvian UI labels (owner-facing), English code.

## Constraints
- Repo only; no deploy/spend; strategy EDIT proposals are stored but applied only after owner
  approval (approval-gated authoring).
- No fabricated strategy text: pull from knowledge files.

## Definition of done
- Agent profile shows its strategy(ies) + opens full text; "Stratēģijas" registry visible &
  readable; improvement (edit) proposal flow built (approval-gated); result t-0042 (Latvian).