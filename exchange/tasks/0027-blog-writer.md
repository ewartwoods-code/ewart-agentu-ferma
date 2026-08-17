# Task t-0027 — Blog Writer agent (own site + external), learns brand style, interview-driven

- **id:** t-0027
- **from:** Hermes (supervisor)
- **to:** Coder/Content Agent (blog writer role)
- **kind:** `code_local` + content role spec
- **priority:** high
- **model_hint:** default.

## Owner's ask (verbatim spirit)
Create a **BLOG WRITER agent**. It writes blogs on OUR page AND outside (external publishing).
It must **learn the writing style currently on our page** — study the LAST 20 blogs to understand
how visuals are placed/what the style is. Then we will make a list of topics we want to write
about. The agent must run **interviews** to gather info: e.g. if we write about the team, it asks
interview-style questions and turns those answers into an article. **Questions can be asked via
WhatsApp; with voice**, and the answers are transcribed/converted to finish the article.

## Deliverables
1. **Blog Writer role spec** — `.claude/agents/blog-writer.md` (+ note in AGENTS.md):
   - Mission: write EWART WOODS blog posts (site + external placements).
   - Must first LEARN the brand style: study last 20 posts → extract voice, structure,
     formatting, how visuals are placed (image positions, captions, CTA), topic mix.
   - Inputs: topic list, interview answers, existing blog URLs/source.
   - Outputs: article draft (matching brand style + visuals placement), SEO title/meta,
     suggested visuals (per image-rendering), publish-ready (approval-gated).
2. **Style-finder step** — in the task first run: fetch/read the last 20 blog posts from the
   site/blog, produce a **style notes file** `knowledge/blog/style-guide.md` (voice, length,
   structure, image placement patterns, CTA style) + a list of gaps (missing info).
3. **Interview flow via WhatsApp (owner workflow):**
   - The writer prepares interview-style questions (team, process, craft, behind-the-scenes).
   - Questions are sent to the owner via WhatsApp (Hermes relays as voice or chat).
   - Owner answers via voice (or text) → Hermes transcribes (STT latvian) → answers saved
     and converted into article structure → writer produces the post.
   - If no real answers yet → build a demo: pick a topic (e.g. team/workbench), write sample
     questions, and show how a transcribed answer becomes a draft.
4. **Topic list creation** — draft a first topic list the owner can approve/edit.

## Constraints
- `code_local`/content: repo only; publishing requires approval; no spend/deploy.
- Do not invent past-20-blogs if unavailable — mark what's missing and still write the style
  guide from what IS available.
- English files; owner-facing Latvian.

## Definition of done
- blog-writer role spec + style guide notes + WhatsApp interview workflow + demo (questions +
  one sample article from a fabricated-but-marked answer) + topic list; result file.