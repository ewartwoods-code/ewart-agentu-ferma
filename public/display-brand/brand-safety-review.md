# Brand-safety review - display & brand campaign visuals (t-0064)

- generator: scripts/ad-visual-brief.js v1 (deterministic, offline)
- gate: scripts/ad-visual-brief.js checkBrandSafety() - approved CTA list, banned unverifiable
  claim words, competitor names, price/promo symbols, ALL-CAPS shouting, non-ASCII leakage,
  headline/subhead/alt-text length limits.

**9/9 variants pass the brand-safety gate.**

| sku | variant | concept | status | flags |
|---|---|---|---|---|
| 346_WOOD_WALN_ | A | lifestyle_interior | PASS | - |
| 346_WOOD_WALN_ | B | feature_macro | PASS | - |
| 346_WOOD_WALN_ | C | social_ugc | PASS | - |
| 219_KEY __ | A | lifestyle_interior | PASS | - |
| 219_KEY __ | B | feature_macro | PASS | - |
| 219_KEY __ | C | social_ugc | PASS | - |
| 35_COAT_WOOD_ | A | lifestyle_interior | PASS | - |
| 35_COAT_WOOD_ | B | feature_macro | PASS | - |
| 35_COAT_WOOD_ | C | social_ugc | PASS | - |

A FLAGGED variant is still written to disk (nothing is silently dropped) but must not be
sent to production or publish until the flag is resolved or the owner accepts it.
