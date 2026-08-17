# Task t-0043 — FULL WEBSITE AUDIT: ewartwoods.com SEO + UI/UX vs Google standards

```json
{
  "contract_version": "1.0",
  "task_id": "t-0043",
  "kind": "research",
  "title": "Deep full-site audit of ewartwoods.com for SEO + UI/UX improvements (Google standards)",
  "objective": "Crawl and analyse the whole ewartwoods.com storefront, then produce a prioritised list of every position where we can improve SEO and UI/UX so the whole site meets Google's standards (Core Web Vitals, technical SEO, content, accessibility, structured data).",
  "context": {
    "source_refs": [
      "https://ewartwoods.com",
      "https://ewartwoods.com/sitemap.xml",
      "https://ewartwoods.com/robots.txt",
      "https://ewartwoods.com/agents.md"
    ],
    "data_refs": [],
    "notes": "Shopify storefront, live (HTTP 200). Sitemap is a sitemapindex linking to products/collections/pages. Home meta description present: '200+ handcrafted wooden floating shelves, toilet paper holders and nightstands. Walnut, oak, ash, cherry and wenge. Scandinavian, Japandi and minimalist styles, made in Latvia. Ships worldwide.' Brand: EWART WOODS, handcrafted wood home decor. Markets: US/UK/DE/FR/LV/NO etc. This is a READ-ONLY research task — never change the site, never write."
  },
  "skill": { "name": "information-distillation + shopify-seo + grounded-citations", "version": "1.0" },
  "input": {
    "site": "https://ewartwoods.com",
    "sitemap": "https://ewartwoods.com/sitemap.xml",
    "focus": ["technical SEO", "Core Web Vitals", "content/on-page", "structured data", "accessibility", "UI/UX", "mobile", "Google standards"]
  },
  "output": {
    "format": "markdown",
    "structure": ["envelope JSON", "executive summary", "finding-by-category table", "prioritised action list (impact vs effort)", "evidence/URLs"],
    "envelope": true
  },
  "quality_gates": [
    "Crawl the real sitemap: enumerate products, collections, pages, blog — not just the homepage",
    "Every finding cites the actual URL/page where it applies",
    "Separate technical SEO, on-page/content, structured data, accessibility, UI/UX, mobile/CWV",
    "Prioritised: impact × effort × owner effort (recommend top 10 quick wins)",
    "Truth-rated: mark what is verified vs probable vs unknown",
    "No changes made — pure research, needs_review if anything suggests a live change"
  ],
  "priority": "P1",
  "status": "queued"
}
```

## Instructions

You are the Research agent. Read-only. Never edit the live site, never buy, never
write to any store system. You may use the browser/web to READ and capture.

1. **Inventory** — fetch `sitemap.xml` (a sitemapindex), follow the child sitemaps
   and list: all product URLs, collection URLs, pages, blog posts. Also read
   `robots.txt` and `agents.md`.
2. **Technical SEO** — check each page class (home, product, collection, blog):
   title/description, canonical, heading hierarchy (single H1, logical H2…H6),
   meta robots, 404 handling, redirects, URL structure, pagination,
   `og:`/Twitter meta, hreflang for localised markets, lazy-loading, image
   `alt` + dimensions + `fetchpriority`, preload/preconnect, and whether the
   Shopify store has any obvious crawl issues in robots/sitemap.
3. **Core Web Vitals signals (best-effort)** — page weight, number of requests,
   render-blocking resources, CLS risk (images missing dimensions, late layout),
   LCP candidate, cumulative JS. State clearly what you measured vs what would
   need a real lab (e.g. PageSpeed Insights API) — do not fake CWV numbers.
4. **Structured data** — check for Product/Offer/AggregateRating/BreadcrumbList/
   Organization schema; is it valid JSON-LD? Note the Shopify Product schema depth
   (offer, price, availability, image, brand, SKU, review).
5. **Content / on-page** — title uniqueness, meta description quality, key-phrase
   usage, internal linking (do products link to collections, cross-sells, related?),
   thin content, duplicate content risk, breadcrumbs, faceted-filter crawling risk.
6. **Accessibility (WCAG light sweep)** — contrast, alt text present, focusable
   controls, buttons vs links, heading order, form labels, touch targets on mobile,
   `lang` attribute. Note what a full audit would need (this is a sweep, not a
   full WCAG certification).
7. **UI/UX** — desktop + mobile: above-the-fold clarity, top nav, product grid,
   product page layout (gallery, buy button, trust signals), collection filtering,
   cart/checkout friction signals, trust/footer, consistency of the visual system.
8. **Output** — one markdown result that a busy owner can read: executive summary,
   a per-category table of findings (each with URL + verdict + suggested fix),
   then a **prioritised top-10 quick wins** (impact × effort × owner effort), each
   with a concrete, Google-standards-aligned recommendation. Mark confidence.

Finish with `exchange/results/t-0043.md` (envelope at top), commit, push to origin
master. Do NOT modify the live site or any store data.