# Task t-0020 — Fullscreen draggable farm scenes with persistent positions

- **id:** t-0020
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`)
- **kind:** `code_local`
- **priority:** high
- **model_hint:** default (medium) — front-end interaction work; use a focused implementation.

## Owner vision

The Agentu Ferma application should feel like a real, explorable place:

- The farm image/scene fills the whole available screen.
- The owner can move/pan the scene naturally.
- Minions/agents can be placed in different positions, not locked to one fixed spot.
- The farm can contain multiple scenes/rooms, with different groups of agents in each.
- Positions and scenes must remain stable after refresh.

This builds on the earlier living-farm, room-grouping, hierarchy, and system-map work.

## Requirements

### 1. Fullscreen scene
- Make the farm scene fill the browser viewport (`100vw` x `100vh`, minus only a small UI overlay area).
- Preserve the existing visual style and responsive behaviour.
- Avoid horizontal/vertical page scroll caused by the scene itself.
- Keep Herme, navigation, status indicators, and info popups usable above the scene.

### 2. Pan and move the scene
- Support mouse drag and touch drag to pan the farm background/scene.
- Support optional zoom controls or wheel/pinch zoom if this can be added cleanly.
- Add a small visible control hint in Latvian, for example: `Velc, lai pārvietotu ainu`.
- Do not make minion dragging conflict with scene panning: dragging a minion moves that minion;
  dragging empty scene space pans the scene.

### 3. Move minions and save positions
- Allow the owner to drag each minion to a new position.
- Show a clear selected/dragged state.
- Save position per agent and per scene through the existing safe admin/RPC path, not a public
  write policy. If the current schema has no suitable RPC, create a migration/RPC but do NOT apply
  it and clearly report that live DB work is still needed.
- If saving is not yet possible without admin credentials, implement localStorage as a temporary
  fallback and label it clearly; do not pretend it is globally saved.
- Existing `pos_x` and `pos_y` must remain compatible.

### 4. Multiple scenes / rooms
- Add a scene switcher with at least these initial scene definitions:
  - `Galvenā ferma`
  - `Amazones ēka`
  - `Mākslas šķūnis`
  - `Sistēmu centrs`
- Each scene has: id, Latvian name, background image/colour, description, and agent membership.
- Agents can appear in one or more scenes.
- The current farm remains the default scene.
- Build the data structure so new rooms can be added without rewriting rendering logic.

### 5. Multiple positions / layouts
- Support a position record keyed by `scene_id + agent_id`.
- If a scene has no saved position for an agent, use a deterministic fallback position.
- Do not hardcode individual agent positions in a way that prevents future DB-driven layouts.

### 6. Quality and safety
- Keep existing profiles, Herme panel, status dots, system map, subscription block, and hierarchy
  compatible.
- Use Latvian for owner-facing UI and English for code/comments.
- Do not deploy, spend, publish, modify live business data, or enable paid keys.
- Run real local verification: `node --check`, local server + health check, drag/pan interaction
  test, scene switching test, and verify no uncaught JavaScript errors.

## Deliverables

1. Updated farm UI in `app/src/public/index.html` and related local files if needed.
2. Any required migration/RPC created but not applied.
3. `exchange/results/t-0020.md` with a valid envelope and:
   - what changed for the owner in Latvian (3-5 lines),
   - interaction verification,
   - number of scenes,
   - position persistence method,
   - any live DB/deployment step still requiring approval.

## Definition of done

- Farm scene fills the screen.
- Empty-scene dragging pans the scene on mouse and touch.
- Minion dragging works independently from scene panning.
- Scene switcher works with at least four scenes.
- Each agent has a deterministic position in every relevant scene.
- No existing farm features break.
- Verification reports zero uncaught JavaScript errors.
- No claim of live deployment unless a real push to `ewart-agentu-ferma` main is made and verified.