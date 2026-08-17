# Task t-0045 — Influencer outreach agent (free-product baseline, stats-scored, pay-extra rule)

- **id:** t-0045
- **from:** Hermes (supervisor)
- **to:** Outreach Agent + Research
- **kind:** `research`/`content` (outreach-spec; sending = approval)
- **priority:** medium-high
- **model_hint:** default.

## Owner rules (knowledge/owner-strategy/influencer-strategy.md)
- Base = free product (product cost + shipping) as value of cooperation (coefficient 1.0).
- Judge by influencer STATISTICS (followers, engagement, reach, niche fit).
- If stats justify coefficient ≈ ×2 → we pay extra cash, capped at the product's own cost
  (pašizmaksa) at start. Scale from results.
- Track results per influencer (reach, UTM sales, ROAS) → update coefficients.

## Deliverables
1. **Influencer scoring spec** — how to rate an influencer for us:
   - stats to collect: followers, engagement rate, avg reach/views per post/video, audience
     region + fit with our target persona (t-0031) and region logic (t-0034),
   - coefficient table (e.g. 1.0 = free product; 2.0+ = pay extra up to product cost),
   - data sources for stats (public platform stats, engagement calculators) + truth ratings.
2. **Outreach workflow** — `.claude/agents/influencer-outreach-agent.md`:
   - find candidates (niche + region), score, propose (free vs pay-extra + €),
   - approval gate → send product (Signie/Dana) → track UTM/discount code → measure visits +
     sales → update rating/coefficient;
   - templates for first contact, follow-up.
3. **Demo** — 3 sample candidate profiles scored (free vs pay decision shown for each).
4. Register the role in knowledge/agents-inventory.md / AGENTS.md.

## Constraints
- Outreach draft auto; SENDING (messages, product, money) = approval-gated; no spend without OK.
- No fabricated influencer stats: mark sources; truth rating 1–10.

## Definition of done
- influencer scoring spec + outreach agent spec + 2–3 templates + demo scoring + registration;
  result t-0045 (Latvian summary).