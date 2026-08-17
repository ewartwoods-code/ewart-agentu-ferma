# Task t-0032 — Target-audience persona visual in the farm app (clickable home)

- **id:** t-0032
- **from:** Hermes (supervisor)
- **to:** Coder (KODERIS — `ferma-koderis`) + Visual agent
- **kind:** `code_local`
- **priority:** medium-high
- **model_hint:** default.

## Owner's ask (verbatim spirit)
After the persona analysis (t-0031), place a **visual representation of the target-audience
persona** IN THE FARM APP in a main spot — visually showing what the target person looks like,
their dog, hobbies, what house they live in, etc. The BEST case: when you **click on the
person's avatar**, it opens their **home** (a scene/interior) where you can see how they live
and what they do.

## What to build
1. **Persona visual module** (main area of the farm — e.g. a visible "Mērķauditorija" card):
   - renders the persona avatar (use a generated persona image; if no image asset yet, use a
     tasteful monogram/illustration placeholder with a note).
   - shows persona name + short line (from the persona sheet).
2. **Click → home scene:** clicking the persona opens a **home/interior scene** (stylised SVG/CSS
   room matching the persona: e.g. cosy Nordic living room, dog, favourite items) where elements
   are annotated: what they like/do (hobbies, dog, style, rooms) — tooltips/labels in Latvian.
3. **Data-driven**: personas come from a small config (or DB table `personas` if you prefer —
   migration created but NOT applied). At least the FIRST persona from t-0031 must be present.
4. Keep it beautiful & on-style with the farm; existing views must not break.

## Constraints
- `code_local`, repo only, no deploy/spend; migration created-not-applied; no fake stats.
- If persona analysis (t-0031) is not yet complete, use the initial persona derived from what
  exists (home-decor buyer) and label it `(draft)`.

## Definition of done
- Persona card visible on farm main screen; click opens home scene with labelled lifestyle
  elements; data-config-driven; 0 uncaught JS errors; result file t-0032 (Latvian summary).