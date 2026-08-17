# Task t-0049 — Add the owner's existing Gemini as a separate farm agent "Džemma"

- **id:** t-0049
- **from:** Hermes (supervisor) / owner
- **to:** Claude (KODERIS) — mirror of t-0048, but for Gemini and as a female agent
- **kind:** `code_local` (repo + DB additions; no deploy, no paid-key enable)
- **priority:** high
- **provider:** `claude`

---

## Owner's ask (verbatim spirit)
"Izveidojam tāpat jaunu aģentu — **Džemma** (sieviete) — kurā izmantosim manu esošo
Gemini profilu. Tāpat kā ar Gati: izvērtēt kādus uzdevumus viņai varam dot utt."

So: register the owner's existing **Gemini** as a distinct female farm agent
**Džemma**, with her own two-way channel, and evaluate which tasks suit her best.

## What to do (mirrors t-0048 — Gatis — with Gemini specifics)
1. **DB** (`agents` table, Supabase `ewart-ai`): add row —
   - `vards`: **Džemma**
   - `modelis`: `google/gemini-3.7-flash` (verified in catalog; fast+vision+1M ctx)
   - `sys_prompt`: role line (female Gemini agent; works with Hermes via
     `exchange/dzemma/`; read `context.md` first each turn).
   - `or_key`: yes if the shared OPENROUTER_API_KEY is available (it is).
   - `aktivs`: true. `kind`: read (analysis/text/vision; money/publish gated).
   - Verify with SELECT read-back.
2. **`AGENTS.md`** — already added (#16, this commit). Keep it consistent.
3. **`knowledge/agents-inventory.md`** — already added (this commit). Keep it.
4. **Channel `exchange/dzemma/`** — README.md, context.md, inbox.ndjson,
   outbox.ndjson, tool.js — already scaffolded (this commit).
5. **Routing:** `provider: gemini` + `agent: dzemma` → `openai/google/*`… actually
   `google/gemini-3.7-flash` via `scripts/model-runner.js`. Already registered in
   `provider-router.js` (this commit); confirm `model-runner` markdown
   `- **provider:** gemini` works (fixed for provider parsing this session).
6. **First turn:** enqueue `dz-0001` "define yourself, list 3 best quick tasks for
   EWART WOODS as Gemini" in `exchange/dzemma/inbox.ndjson`.

## Her task profile (evaluate; owner's core question)
- **Great for:** volume reading (listings, reviews, price matrices), Google-heavy
  research sweeps, long-document/PDF analysis, image captioning + vision checks,
  cheap parallel scans, data extraction from dumps.
- **Avoid:** creative voice work where GPT is stronger, code_local (Claude), and
  business integration (no tools) — same lane rules as Gatis.

## Definition of done (verify each)
- [ ] `agents` row Džemma in DB (SELECT read-back) — Claude cowork step.
- [ ] Channel scaffolded + first turn dz-0001 in inbox (awaiting her reply).
- [ ] No deploy, no money, no new paid key without owner OK; committed + pushed.

*Written by Hermes 2026-08-17.*