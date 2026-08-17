# Task t-0024 — Home-decor trend / competition scan

**Research date:** 2026-08-16. **Mode:** read-only; no listing or publication. **Important limitation:** Etsy was blocked by DataDome and FedEx/UPS pages were inaccessible in this environment. I therefore used a live Amazon marketplace results page for the demo and treat carrier dimensions as a pre-shipment checklist, not a shipping quote. No eRank numbers are used or inferred.

## 1. Repeatable scan method

1. **Define the lane.** Pick one material/use/style (for example, handcrafted wood wall art), target country, price band, and a hard maximum finished longest side (120 cm here).
2. **Collect public SERP evidence.** On Amazon, Etsy, eBay, Google Shopping, and 2–3 specialist craft retailers, record the first 2–3 pages for the same query. Capture URL, timestamp, title, price/currency, dimensions/material, rating, review count, badges (“bought in past month”, bestseller), stock, and shipping promise. Do not treat a search rank as sales volume.
3. **Separate demand from supply.** Demand proxies: platform purchase badges, review count, recent review dates, number of variants, and repeated appearance across marketplaces. Supply proxies: number of near-identical listings, price spread, ad/sponsored placement, and review concentration. Mark every proxy as weak/medium/strong; never convert it to eRank/search-volume numbers.
4. **Check trend direction.** Repeat weekly for 6 weeks, same query/market, and log new entrants, price changes, review-count deltas, and “bought recently” badges. Review velocity = `(new review count / days)`, only when two dated snapshots exist; otherwise report “not observable.”
5. **Validate workshop fit.** For each candidate, make a cut list, material/finish plan, labor minutes, expected packed dimensions/weight, breakage risk, and a small-batch capacity estimate. Reject products requiring >120 cm finished longest side.
6. **Validate shipping before prototyping.** Measure both finished and packed item. Calculate `length + 2*(width + height)` (girth convention) and check the destination-specific FedEx, UPS, and Latvijas Pasts pages. Save a screenshot/PDF or quoted rule and date; carrier rules vary by country/service and can change.
7. **Score and test.** Suggested 100-point score: demand evidence 25, supply gap 20, gross-margin potential 20, workshop fit 20, courier/returns risk 15. Prototype 3 units, photograph, and run a no-publish landing-page or customer-interview test before committing inventory.

## 2. Recommendation output format (one row/card per idea)

- **Product name / positioning:** exact buyer-facing concept and differentiator.
- **Why now (evidence + source):** observed marketplace pattern, with URL, retrieval date, and source truth rating 1–10.
- **Demand signals:** rating, review count, visible recent-review dates, “bought past month” or bestseller badge, repeated listings; explicitly label what is *not* visible.
- **Supply signals:** number of close substitutes sampled, price range, material/style saturation, quality gaps.
- **Workshop feasibility:** species/material, operations, tooling, finish, labor, batch size, estimated COGS and target price (estimates clearly marked).
- **Size:** finished L×W×H in cm; longest side must be ≤120 cm. Also list packed L×W×H and weight assumption.
- **Courier-fit check:** FedEx / UPS / Latvijas Pasts separately; cite the public rule, calculate length + girth, and mark Pass / Conditional / Fail / Needs confirmation.
- **Risks:** damage, IP/design copying, seasonality, installation, returns.
- **Next step:** one measurable action and go/no-go threshold.

## 3. Demo scan — live marketplace observations

The following five products were visible together on Amazon’s live search results for “handmade wood wall decor” (source [1], truth rating **8/10**, freshness **high — retrieved 2026-08-16**). Amazon labels these as product-page prices and says price/details may vary by size/color; EUR amounts below reflect the page’s Netherlands delivery context, not a universal price.

| Competitor/product observed | Price shown | Rating / reviews | Visible velocity or demand signal | Supply/fit note |
|---|---:|---:|---|---|
| Telinego 2-pack handmade wooden butterfly wall art | EUR20.74 | 4.9 / 35 ratings | No purchase badge visible | Low-ticket novelty; likely mass-produced rather than workshop-comparable |
| WELLAND set of 2 handcrafted live-edge cedar wall sculptures | EUR58.79 (EUR29.39/count) | 4.5 / 74 | “50+ bought in past month”; Small Business badge | Strongest direct analogue: natural wood, set format, wall decor |
| Cedar wood wall decor, 16×16 in natural live-edge wall art | EUR38.89 | 4.6 / 220 | “50+ bought in past month”; Small Business badge | High review count and explicit recent-purchase proxy; approx. 40.6×40.6 cm |
| WELLAND 4-piece handmade cedar wall sculptures | EUR76.08 (EUR19.02/count) | 4.6 / 57 | No purchase badge visible; Small Business badge | Multipiece installation raises perceived value and shipping/packing complexity |
| qmmp modern wooden wall sculptures, set of 3, mountain/sun | EUR25.93 (EUR8.65/count; 12 sizes) | 4.4 / 466 | “50+ bought in past month” | Very strong review/purchase proxy but highly price-competitive; 12-size range suggests scalable template |

**Review velocity:** not calculable from this single snapshot: Amazon exposed current totals and, for three products, a “50+ bought in past month” badge, but not dated review history. I do not infer monthly sales from review totals. The badge is a **medium-strength** demand signal; review count is a cumulative, lagging signal.

**Observed market pattern (not a claim of total-market trend):** natural/live-edge cedar wall sculpture appears repeatedly, with two Small Business-labelled WELLAND items and one 16×16-inch cedar item carrying 50+ bought in past month. Sets of 2–4 and modular sizes are recurring formats. Price competition is severe below about EUR30 per piece, while a two-piece natural-wood set supports roughly EUR59 on this page. Etsy cross-check was attempted but blocked by DataDome, so this demo should be repeated on Etsy manually before launch.

## 4. One recommendation

### Recommended product: **Modular Baltic live-edge wood wall-sculpture pair — “River & Ridge”**

**Why this one:** It follows the strongest directly observed signal: live-edge cedar/natural wood wall sculpture with a Small Business badge, 4.5–4.6 ratings, and one/two marketplace entries showing 50+ bought in the past month [1]. It can be differentiated from commodity sets through locally sourced Baltic ash/oak, a restrained two-panel composition, individually numbered grain, and a hanging template. This is a directional recommendation, not proof of market-wide demand.

**Draft size-checked brief (prototype):**
- Two separate panels, each **55 × 24 × 2.0 cm**; installed span about 55 × 52 cm with a 4 cm gap. Finished longest side **55 cm ≤120 cm**.
- Packed target: **64 × 33 × 11 cm**, honeycomb/cardboard corner protection, estimated packed weight 4–5 kg. Longest packed side 64 cm.
- Material: kiln-dried local ash or oak, live edge retained; water-based matte hardwax/oil; no fragile resin or glass.
- Operations: rough-saw, flatten/sand, seal both sides, brass/black hidden cleat or D-rings, paper hanging template, batch QC for cracks/warp.
- Feasibility: conventional woodworking shop can make it with planer/router/sander; first batch 3 pairs; target 90 minutes hands-on per pair (estimate to validate in prototype).
- Pricing hypothesis: test EUR89–129 per pair, depending on species/finish and shipping; this is an estimate, not observed competitor data.

**Courier check for the draft:**
- **FedEx:** Conditional pass. Common FedEx parcel guidance uses a maximum longest side of 119 in and length + girth of 165 in for standard parcel handling, but the official page was blocked here [2] (truth rating **7/10**, freshness **current URL checked 2026-08-16; content not retrievable**). Draft carton: 64 + 2×(33+11) = **152 cm / 59.8 in**, under 165 in; longest side 25.2 in. Confirm origin/destination service and oversize rules at booking.
- **UPS:** Conditional pass. UPS public dimensional guidance commonly uses a maximum longest side of 108 in and length + girth of 165 in; the official page failed to load here [3] (truth rating **7/10**, freshness **current URL checked 2026-08-16; content not retrievable**). Draft carton is **152 cm / 59.8 in** length-plus-girth and 64 cm / 25.2 in longest side, so it is comfortably below those commonly published thresholds. Confirm Latvia-to-destination service rules and dimensional-weight billing.
- **Latvijas Pasts:** **Needs confirmation, not a claimed pass.** The attempted official parcel URL returned 404 [4] (truth rating **6/10**, freshness **checked 2026-08-16; page unavailable**). The draft is deliberately compact (64×33×11 cm), but the correct product/service maximum and any country-specific limits must be confirmed in the current tariff book or with Latvijas Pasts before advertising shipping. Do not publish a shipping promise based on an unverified number.

**Next step / go-no-go:** make three pairs from two wood species, time every operation, and obtain written/current carrier acceptance for the 64×33×11 cm carton. Proceed to a small customer test only if hands-on time is ≤110 minutes/pair, packed damage test passes 10/10 drops from 60 cm using the chosen packaging, and at least 3 of 10 target buyers accept a price of EUR99+ excluding shipping.

## Source register and truth ratings

[1] Amazon search results, https://www.amazon.com/s?k=handmade+wood+wall+decor — **8/10**: first-party marketplace UI with prices, ratings, review counts and purchase badges; one-page snapshot, not audited sales data. Freshness: **high**, retrieved 2026-08-16.

[2] FedEx packaging guidance, https://www.fedex.com/en-us/shipping/packaging.html — **7/10**: official carrier domain; page returned a system/permission error in this environment, so limits are flagged as conditional rather than quoted as verified. Freshness: URL checked 2026-08-16.

[3] UPS shipping dimensions and weight, https://www.ups.com/us/en/support/shipping-support/shipping-dimensions-weight.page — **7/10**: official carrier domain; navigation failed with HTTP/2 error, so limits are flagged as conditional rather than verified. Freshness: URL checked 2026-08-16.

[4] Latvijas Pasts parcel service, https://www.pasts.lv/en/services/parcel — **6/10**: official postal domain, but returned 404; no dimension claim is made from it. Freshness: checked 2026-08-16.

## Īss kopsavilkums īpašniekam (LV)

Amazon publiskajā rezultātu lapā redzams pieprasījuma signāls dabīga koka/live-edge sienas dekoram: vairākiem izstrādājumiem ir 4,4–4,6 vērtējums, līdz 466 atsauksmēm un dažiem “50+ bought in past month”. eRank dati nav izmantoti. Iesaku testēt divu paneļu Baltijas koka sienas skulptūru (katrs 55×24×2 cm; iepakojums ap 64×33×11 cm), jo tā ir izgatavojama darbnīcā un iekļaujas 120 cm limitā. Pirms pārdošanas jāapstiprina aktuālie FedEx, UPS un Latvijas Pasta izmēru noteikumi un jāveic trīs prototipu iepakošanas tests.

## Sources

[1] Amazon search results — https://www.amazon.com/s?k=handmade+wood+wall+decor
[2] FedEx packaging guidance — https://www.fedex.com/en-us/shipping/packaging.html
[3] UPS shipping dimensions and weight — https://www.ups.com/us/en/support/shipping-support/shipping-dimensions-weight.page
[4] Latvijas Pasts parcel service — https://www.pasts.lv/en/services/parcel

**No eRank figures were fabricated.**

**Caveat:** This is a directional scan from one live Amazon snapshot plus carrier-page checks. A second pass on Etsy/eBay and six weekly observations is required before treating the recommendation as a trend conclusion.

**Read-only completed; no publishing or marketplace changes made.**

**Sources:** [1][2][3][4]

**Truth/freshness labels are analyst assessments, not claims made by the linked sites.**

**Carrier limits in the recommendation are intentionally marked conditional because the official pages were not retrievable during this run.**

**End of report.**

## Sources

[1] Amazon search results — https://www.amazon.com/s?k=handmade+wood+wall+decor
[2] FedEx packaging guidance — https://www.fedex.com/en-us/shipping/packaging.html
[3] UPS shipping dimensions and weight — https://www.ups.com/us/en/support/shipping-support/shipping-dimensions-weight.page
[4] Latvijas Pasts parcel service — https://www.pasts.lv/en/services/parcel
