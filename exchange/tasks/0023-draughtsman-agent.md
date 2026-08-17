# Task t-0023 — Product Draughtsman (rasētājs) agent + workshop/instrument knowledge

- **id:** t-0023
- **from:** Hermes (supervisor)
- **to:** Coder + Production/Design Agent
- **kind:** `research` + `code_local` (knowledge + a draughtsman role spec)
- **priority:** high
- **provider:** `gemini`
- **model_hint:** default.

## Owner's ask (verbatim spirit)
There is a **MD file about the workshop** — all production instruments/tools. We need to find
it and bring it into the farm. We will improve it, understand what products we can make, what
instruments we have, what we can build, so we can create proper drawings with a drawing program.

**Create a PRODUCT DRAUGHTSMAN agent** (produktu rasētājs) who:
- knows OUR instruments (tools),
- knows OUR processes,
- can create a production plan, recipe/recept, and technical drawing (rasējums).

## Deliverables
1. **Locate the workshop MD** (search farm repo + /opt/data + ask owner if missing). If found,
   copy it into `knowledge/workshop/workshop-tools.md`; if NOT found, create a placeholder
   `knowledge/workshop/workshop-tools.md` with `(TO BE FILLED — owner to provide workshop tool
   list)` and note it clearly.
2. **Draughtsman agent role spec** — file `.claude/agents/draughtsman.md` (or a document if you
   prefer), defining:
   - Mission: turns a product idea + workspace tools list + size rules into a **production plan,
     procedure/recept, and technical drawing**.
   - Inputs: product idea/description, workshop tools & materials (from the workshop file),
     target channel specs (length rules below), drawing-program preference.
   - Outputs: production plan (steps + tool used per step), material list, technical drawing
     (dimensioned sketch, DXF/SVG or drawing-program project), and render-ready brief for the
     Visual agent.
   - Cross-links: visual-render-guide (t-0022), knowledge/workshop.
3. **A process note** that drawings are done in a drawing program and saved to a shared place so
   they can also feed 3D/GLB (per visual guide).
4. **Size rule (HARD): max 120 cm on the longest side**, per courier shipping rules.

## Constraints
- `code_local`/setup: repo only, no spend, no deploy, no live changes.
- If the workshop MD is missing → do not invent tools; mark the placeholder clearly.
- English in files; Latvian only owner-facing lines.

## Definition of done
- workshop-tools.md exists (real copy or clearly-marked placeholder).
- draughtsman agent spec exists with inputs/outputs + production plan + drawing + size rule.
- A demo run: pick 1 simple product idea, produce a mini production plan + drawing brief
  respecting the 120 cm rule.