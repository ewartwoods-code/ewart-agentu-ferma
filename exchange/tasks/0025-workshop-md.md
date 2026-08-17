# Task t-0025 — Locate & share the workshop/production MD page (from Claude/Mac)

- **id:** t-0025
- **from:** Hermes (supervisor)
- **to:** KODERIS (Claude on Mac)
- **kind:** `code_local` (search + copy into repo)
- **priority:** high
- **model_hint:** default.

## Owner's ask
The owner said there is an **MD page about the workshop/production** (ražotne — tools,
instruments, production processes) that can be found via Claude on the Mac. Add "receiving
that page" as a task for Claude so it is shared into the farm.

## Task
1. **Search for the MD file about the workshop/production** on the Mac and in the farm repos:
   - common names: `*ražotne*`, `*workshop*`, `*production*`, `*workshop-tools*`, `*manufactur*`,
     `*instrument*`, `*worker*` (`.md`/`.txt`/`.doc`/`.pdf`), including Downloads/Documents/
     Desktop and any project folders the owner uses with Claude.
2. If found → copy/convert into:
   `knowledge/workshop/workshop-tools.md`
   (keep the exact tool/instrument list and processes; English file, content may stay in the
   owner's language if that's how the source is, but strip nothing).
3. If NOT found → create the placeholder
   `knowledge/workshop/workshop-tools.md` containing the line
   `(TO BE FILLED — owner to provide the workshop page / MD file)` and list every location you
   searched so the owner can point us.
4. Ask nothing more than needed; report exactly where it was found or that it is missing.

## Constraints
- Repo-only writes; no deploy/spend/publish; no live changes.
- Do NOT invent tools/processes — only copy what is in the found source.
- English filenames; content keeps the source language.

## Definition of done
- `knowledge/workshop/workshop-tools.md` present — either the real content (found) or the
  clearly marked placeholder + searched-locations list.
- Result file `exchange/results/t-0025.md` with a short Latvian note for the owner.