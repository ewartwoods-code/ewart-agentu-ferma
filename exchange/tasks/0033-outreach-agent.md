# Task t-0033 — Weekly blog-outreach agent (2 placements/wk, rating 1-10, budget 100€/post)

- **id:** t-0033
- **from:** Hermes (supervisor)
- **to:** Outreach Agent (email) + Research
- **kind:** `research`/`outreach-spec` (drafting; sending = approval-gated)
- **priority:** high
- **provider:** `gemini`
- **model_hint:** default; personalised-email writing matters.

## Rules (owner, from strategy doc knowledge/owner-strategy/blog-placement-strategy.md)
- Weekly contact of found blogs; goal **2 placements per week**.
- **Budget: up to €100 per post; ~€400/month total.** Costs counted in TOTAL marketing
  (marketing/ad budget = 10% of turnover: previous month turnover × 10% covers ads+blog+site).
- Build **blog rating 1–10** (traffic, engagement, region/niche fit, authority). Better blog =
  allowed higher price. Prefer best VALUE (2 medium cheap blogs > 1 expensive one) — use
  (rating × reach)/cost.
- Track after placement: visits + sales change (UTM links), paid-off or not. Update ratings.

## Deliverables
1. **Outreach workflow spec** — `.claude/agents/outreach-agent.md` (+ AGENTS.md note):
   - weekly selection from `data/blogs.csv` (rating/region/fit),
   - personalized outreach email templates (approval-gated sending),
   - negotiation guidance vs blog stats/rating,
   - follow-up cadence until 2 placements/week,
   - post-publication tracking (UTM, traffic, sales) + rating update loop.
2. **Email templates** — 3 short templates (first contact, follow-up, re-negotiation) in English +
   per-region language note (DE/FR/LV), personalization placeholders. Never send without approval.
3. **Demo** — pick 2 candidate blogs (from any list available), draft the outreach email for each
   (marked demo), show rating + price rationale.

## Constraints
- Sending emails = approval; no money transfer; no publish; no spend.
- English files; Latvian owner summary. Sources/ratings for demo blog claims (truth 1-10).

## Definition of done
- outreach-agent spec + 2 email templates + 1 demo outreach pair; result t-0033.