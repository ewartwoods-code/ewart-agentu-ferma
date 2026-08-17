# Task t-0052 — Depth & perspective physics for farm characters (further = smaller)

- **id:** t-0052
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`)
- **kind:** `code_local`
- **priority:** high
- **model_hint:** default (medium) — focused front-end change.

## Owner's ask (verbatim spirit)
Izveido dziļuma "fiziku" tēliem: jo tālāk (tālāk bildē, t.i., pozīcija augšējā zonā) tēls tiek likts, jo MAZĀKS tas paliek; jo tuvāk (apakšējā zona), jo LIELĀKS. Realistiska perspektīva kā uz lauka.

## Requirements

### 1. Perspective scaling (depth → size)
- Scale each agent/character by its **depth** (Y position in the scene):
  - characters placed LOW on the scene (near "camera") → larger (e.g. scale up to ~115–125%).
  - characters placed HIGH (far background) → smaller (e.g. down to ~55–65%).
- The mapping should be **continuous** (smooth), driven by normalized Y (0..1):
  `scale = min_scale + (1 - y_normalized) * (max_scale - min_scale)`
  (y_normalized = 0 at top/far, 1 at bottom/near → far is small, near is big).
- Default band (no per-agent overrides): e.g. min ~0.55, max ~1.35. Keep numeric constants in one
  place so they are easy to tune.
- Apply the scale to the character body (figure + bubble + name?) — suggestion: scale the figure
  and name; let the bubble stay readable (could scale gently or keep fixed; choose what reads best,
  document the choice). The click hit area should use the SCALED size, not the unscaled one.

### 2. Respect scene/drag
- When an agent is dragged to a new position, its scale must update live from its new Y.
- Works in all scenes (Galvenā ferma + others) and after position restore (DB → localStorage →
  pos_x/pos_y → grid fallback).
- Panning/zoom of the world keeps working; the perspective scale is on TOP of the world zoom
  (character looks constant relative to scene size at its depth).

### 3. Visual anchor
- A character should appear to "stand ON" the ground at its depth: the bottom of the character
  stays at the same ground line; scaling makes it grow/shrink from the feet. Keep the standing
  anchor consistent so nothing floats.

### 4. Quality & safety
- Keep profiles, dots, bubbles, rooms, system map, Herme panel, drag/pan intact.
- ASCII-safe English code; Latvian UI text unchanged.
- No deploy/spend; repo-only; verification = local render/geometry check, 0 uncaught JS errors.

## Deliverables
1. Implementation in `app/src/public/index.html` (scale-by-depth + drag update + anchor).
2. Local verification evidence (checks, JS errors 0).
3. Result `exchange/results/t-0052.md` with envelope + "what changed for the owner" (Latvian 3-5
   lines) + tunable constants noted.

## Definition of done
- Characters scale with depth: far = small, near = big, smooth continuous; dragging updates scale;
- hit areas match scaled size; no floating characters; existing interactions still work;
- verification shows 0 uncaught JS errors.