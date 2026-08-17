# Task t-0028 — Weekly blog-topic offering (every Monday morning on WhatsApp)

- **id:** t-0028
- **from:** Hermes (supervisor)
- **to:** Blog Writer agent (content)
- **kind:** `schedule`/`content` (weekly routine)
- **priority:** medium
- **provider:** `gpt`
- **model_hint:** default/light.

## Owner's rule (verbatim spirit)
EVERY WEEK offer **3 topics for blog posts on OUR site** and **2 topics for writing OUTSIDE
the site**. Offer variants based on the current situation — what's certain now: e.g. new
products added, nothing new (seasonal), or just themes. See if we should make a survey about
what to write about, with options. **Every MONDAY this offering must be ready and sent to the
owner in the morning via WhatsApp** (Hermes owns the send; author topic suggestions).

## Recurring job (implemented by Hermes cron)
- Runs **every Monday ~09:00 Europe/Riga**.
- Produces a WhatsApp message to the owner (Latvian) containing:
  - **3 internal blog topics** (site) — each 1-2 lines: title + angle + why now (new product /
    seasonal / evergreen);
  - **2 external topics** (outside site — guest posts / other platforms): title + where + why;
  - 1 optional short **audience survey** suggestion (e.g. poll of topics readers want), with 3-
    4 options, if it makes sense that week;
  - note of what data it is based on (new listings products this week, season, upcoming).
- Sources of "what's new": check latest task results / new items in the catalog
  (data/product-master.csv or DB metrics) and the date/season. If undecided, propose the
  standard seasonal + craft themes.
- Owner replies with picked topics → Blog Writer drafts (approval before publishing).

## Constraints
- Read-only research for topic selection (no publishes/spend/deploy).
- Language: message to owner in Latvian; file/notes English.

## Definition of done
- Monday WhatsApp message delivered each week with 3+2 themed + optional survey; link to
  drafting after owner picks.