# Task t-0017 — Intelligence (Research) Agent: current-info hunter with sourced, truth-rated notes

- **id:** t-0017
- **from:** Hermes (supervisor)
- **to:** Intelligence / Research Agent
- **kind:** `research` (read; publish notes to `knowledge/` only after owner sign-off)
- **priority:** high
- **model_hint:** best available collection model for web + X/Grok route; strong newer-data
  extraction. This is a research task → runs read-only/auto for the gathering part.

## Owner's intent (verbatim spirit)

An agent that researches **current/up-to-date information** and creates **notes** from which
**other agents** will guide themselves. It should use the **best information-collection models**
(e.g. Grok to pull from X/Twitter, web search, official pages, forums). It must read info from
**official sites, people's discussions**, and **formulate it clearly** so other agents understand it
perfectly. Examples: *how Etsy listings should be made right now*, *current SEO conditions*,
*better Amazon PPC strategies*.

**Gate:** before this information is handed to other agents, it MUST be coordinated (approved)
with the **owner** first.

**NEW RULE (mandatory):** every information summary MUST include its **sources** and a
**truthfulness / reliability rating of 1–10** for the content, so downstream agents and the owner
can judge how much to trust it.

## What the agent produces

For each research topic, produce ONE note file under `knowledge/research/<topic-slug>.md` with:

1. **Topic & question** the note answers.
2. **Key findings** — short, concrete, actionable (how to build Etsy listings now, current SEO
   rules, best Amazon PPC strategies, etc.).
3. **Sources** — for each finding, list the actual source(s): official URL, forum/post, X
   thread, study. No source = mark the claim `(unsourced)`.
4. **Truthfulness rating 1–10** — for the overall note AND per-major-claim. Guideline:
   - 9–10 = official platform docs/authoritative source, corroborated.
   - 7–8 = reputable discussion/industry, mostly agreed.
   - 5–6 = mixed/one-off opinions.
   - 1–4 = rumour/single voice/uncorroborated — flag clearly as *directional, verify*.
   - State what would raise or lower it (e.g. "would be 9 if Amazon official docs confirm").
5. **Contradictions** — if sources disagree, say so explicitly (don't pick one and hide the other).
6. **Freshness** — when the info was published; flag anything older than ~6 months as possibly stale.
7. **Who should use it** — which agent(s) benefit (SEO agent, Ads Optimizer, Content, etc.).

## Which models / sources to use (best collection tooling)

- Web search + fetching official pages (platform help docs, Etsy seller handbook, Amazon Seller
  Central, Shopify docs, Google SEO starter guide).
- Discussions / forums / community (Reddit, seller communities, X/Twitter via Grok route if key
  wired; note when a source is paywalled or not reachable).
- Prioritise **official & primary** sources; clearly separate them from community opinion.

## The owner-coordination gate (HARD)

- The research/gathering itself is read-only and can auto-run.
- **But the note it produces is NOT handed to other agents until the owner approves it.**
- So: produce the note with sources + rating, write it in the exchange `results/`, and set
  **status `needs_review`** — Hermes will present it to the owner on WhatsApp. Only after owner
  sign-off does it get published to `knowledge/now/` for other agents to consume.
- If the owner edits/approves a section, reflect that in the final `knowledge/now/` note.

## Constraints
- **`research` kind**: read-only, no money, no publish, no paid API enabling. Downloads/fetches and
  web reads only.
- English in files (owner chats in Latvian; files English to avoid UTF-8 corruption).
- All sources cited; every claim tracked to a source or marked `(unsourced)`; truthfulness rating
  mandatory.
- Do not fabricate sources or ratings — if unsure, give a lower rating and say why.

## Deliverables
1. `exchange/results/t-0017.md` — envelope JSON (status `needs_approval`, but the *source* tasks
   can be `completed`) + a short Latvian summary for the owner + the draft note(s) with sources +
   ratings, or a `knowledge/now/<topic>.md` draft staged (NOT finalised without approval).
2. One demo topic to prove pattern: produce a real note on **one** of the owner's examples
   (choose: "Etsy listing best practices 2026" **or** "Current Amazon PPC best practices")
   with sources + 1–10 ratings + a list of contradictions if found.
3. A list of next research topics the agent recommends (Etsy, SEO, Amazon PPC, Meta ads, etc.).

## Definition of done
- A real demo note exists (sourced, truth-rated 1–10, fresh) for one topic.
- The draft is **status `needs_approval`** awaiting owner sign-off — NOT yet in `knowledge/now/`.
- Envelope + summary + next-topic list returned to Hermes in `results/`.