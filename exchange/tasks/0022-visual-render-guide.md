# Task t-0022 — Product visual rendering: size-accuracy + photorealistic Fujifilm-style, multi-interior

- **id:** t-0022
- **from:** Hermes (supervisor)
- **to:** Coder + Visual Agent (KODERIS / image-rendering)
- **kind:** `code_local` (method/spec + render pipeline notes; if rendering is done via image
  gen, keep it local/read-only, no paid keys enabled)
- **priority:** high
- **model_hint:** default; precision of the brief matters more than model size.

## Owner's problem (verbatim spirit)
When rendering product images, the product often **loses its real size** — it becomes way too
big or distorted. We must use the **real product size from the listing**. When a listing is
given to make visuals, the brief must state exact **product dimensions** and describe the size.
The product size should be shown **against real things / interior objects** with a known size,
e.g.:
- a **sofa** has a standard size — describe the product as "X% of the sofa width";
- **A4 paper ≈ 12 cm / 21 cm** — describe the product relative to an A4 sheet;
- or against other objects with known dimensions.
Build DIFFERENT realistic interiors with the product, images must look **real**, **not
over-polished/fake**, shot like with a **Fujifilm camera**: slight grain/noise, not overexposed,
natural light, natural shadow, realistic interior texture, product texture clearly visible.
"We need to work to reach the perfect variant."

## What to deliver

### 1. A detailed Visual Render Guide (new file `knowledge/visual-render-guide.md`)
Write a precise spec any image agent / Higgsfield prompt-builder can follow:

**A. Size accuracy methodology (HARD):**
- Step 1: read the REAL product size from the listing (name/bullets/dimensions field). Never guess.
- Step 2: pick a scale-reference object with a known standard size from a small curated list:
  - A4 paper = 21×29.7 cm (short edge 21cm; NOTE the owner cited a ~12 cm reference — use exact
    sheet dims when describing),
  - standard sofa depth/width (e.g. 210 cm sofa), coffee table (~60cm tall / 100cm wide),
  - standard mug (~10cm), standard door (~200cm), person (optional).
- Step 3: write the RATIO into the prompt AND the brief, e.g.
  "vase 18 cm tall ≈ 60% of an A4 sheet height; on a 60cm coffee table" — so the model must render
  the product at that scale vs the object.
- Step 4: QC checks the rendered product against the reference object size; reject if grossly
  wrong. Missing size → status `blocked`, ask the owner for the dimension.

**B. Photorealistic "Fuji" aesthetic (HARD):**
- Target look: natural, real, subtle. Elements: slight fine grain, natural (not perfect-sodium)
  light, natural shadows, realistic interior texture, product texture visible.
- NOT: glossy/AI-perfect, overexposed, synthetic lighting, plastic sheen.
- Multiple different interiors per product (each realistic with texture).

**C. Interior selection from the product DESCRIPTION (owner rule, HARD):**
- Choose the interior based on what the product's own description says about it (material,
  style, mood). Examples:
  - metallic/industrial → industrial interior (concrete, metal, brick);
  - rustic/wooden → rustic/cabin interior;
  - minimalist/ceramic → scandinavian clean interior;
  - glass/elegant → elegant interior.
- Never place a product in a mismatched scene; the description is the authority.

**E. Structured point-by-point prompts (HARD, owner rule):**
- Render prompts must be written as very structured bullet points — one clear instruction per
  point — so the render system understands best: product+exact size+material; scale reference
  (object+ratio); room/interior (from description) + why; style (Fuji/natural light/grain);
  composition/camera/light/shadow; negative list. No floating prose; same structure every render.

**E1. Multiple reference images from the listing (HARD, owner rule):**
- When the render system allows it, provide MULTIPLE listing photos (front/side/back/detail,
  different angles) so the system sees the true dimensions in all directions and how the
  product looks from different sides. If only one image is accepted, use the most informative
  dimensional/three-quarter shot and note it.

**E2. Technical drawing / sketch in a cloud sketch app (HARD, owner rule, NEW):**
- From the real sizes + photos, ALSO produce a **technical sketch/blueprint** in a sketch app
  connected to the cloud (Google Draw or similar) showing full dimensions: width × height ×
  depth, front/side/top, key proportions — so the render system gets exact geometry.
- If no sketch app is wired yet, produce a dimension diagram (SVG/ascii) in the brief as a bridge.

**E3. 3D model for Shopify phone AR (owner rule, NEW):**
- From dimensions/sketch, build a **3D model** (GLB + USDZ, real scale) to attach to Shopify so
  customers can visualize the product in their home with their phone (Shopify 3D media viewer).
- Model must keep TRUE dimensions. No live upload without approval — provide files + placement
  plan.

**F. Test-and-learn loop (HARD, owner):**
- Render → inspect what the system understood and what it missed → record exactly which
  structured points fail → amend only those points → re-render. Log per product
  (prompt points, result verdict, what improved). Iterate until the "perfect" image.

**F1. A/B multiple variants + trigger-point analysis (HARD, owner):**
- Produce SEVERAL (A/B) image variants per shot (3–5 per scene: different angle/light/staging/
  prompt wording) instead of one.
- Compare which variant works better (visual quality now; conversion data when available).
- Identify the **trigger points** that made a variant work (angle, scale-object relation, light
  direction, visible texture) and record them.
- Carry the winning triggers into the NEXT images; keep a per-product trigger list.
- Goal: every next render is smarter — measured iteration toward perfect rendering.

**F2. Performance tracking after image changes (HARD, owner, CRITICAL):**
- After new images are LIVE, TRACK per-listing metrics: **conversion rate (CVR)**, **click
  rate (CTR)**, views/sessions, orders/revenue — in a consistent window (e.g. 7–14 days,
  BEFORE vs AFTER the change, with dates and weekly noise noted).
- **Metric by image role (owner rule):**
  - **Main/first image** → watch **CTR (klikreitu)** most — it is what shoppers see in search;
    its change shows whether the first image attracts clicks.
  - **Inner/additional listing images** → watch **CVR (konversijas reitu)** most — do those
    images improve the purchase decision when seen.
- Decide from the DATA: improved → keep; dropped → revert to old images; flat → test more.
- Give the owner the verdict in plain language with numbers.
- Feed this into daily-profit-review / reporting so the loop is CONTINUOUS and every image
  change verdict is recorded and visible.

**G. Prompt template** (reusable) with slots: product_desc, real_size, reference_object+size,
room, style words (Fujifilm X-T4, 35mm, natural light, subtle grain...), negative prompt
(oversized product, distorted proportions, overexposed, plastic).

**H. Google Ads visual + headline A/B testing (owner rule, extended):**
- For Google ad banners test DIFFERENT images AND different text overlays/headlines in
  combination: same visual + different headlines → which message wins; same headline +
  different visuals → which image wins; then combine winners.
- Metrics: CTR first (attention) and CVR (conversion); use **pixel tracking** (Google tag /
  conversion pixel) so we know which ad the customer saw before buying — attribution, not
  click counting. Guides where to push / pause.
- Same iteration discipline as render: record triggers, keep winners, iterate.

**H1. In-store (Shopify) banner testing (owner rule, NEW):**
- Place own banners in the STORE at different places/popular pages (home, collections, product
  pages) and test which banners get clicked more.
- Track clicks per banner + per position. Data collection recommendation (simplest for the
  owner): banner links carry UTM params → GA4 events/Shopify analytics; or click-tracking
  redirect links; or Shopify pixel event on banner click. The task must figure out and
  implement the data ingestion so click data arrives cleanly.

### 2. Apply it to ONE pilot product
- Pick a real EWART WOODS product from the catalog (data/product-master.csv) that has a size.
- Produce a short brief set: 3 different interiors, each with size-accurate prompt + the
  reference-object they want, as a demonstration of the guide.

## Constraints
- `code_local`: repo only; do NOT spend image credits yet, do NOT create paid calls, no deploy.
- The guide is the deliverable; actual render can be left for later (or one cheap test if the
  tool allows free/low cost — mark clearly).
- English in files; Latvian only for owner UI.

## Deliverables
1. `knowledge/visual-render-guide.md` (size-accuracy + Fuji-style + timeout + prompt template).
2. A demo brief for 1 product (3 interiors, size-accurate).
3. Result `exchange/results/t-0022.md` — envelope + "what changed for owner" (Latvian 3-5 lines)
   + the guide summary + open questions.

## Definition of done
- Guide exists with hard size-accuracy rules, known-object reference list, photoreal Fuji style
  spec, and a reusable prompt template.
- 1 product demo brief with 3 size-accurate interiors.
- No business change, no spend, no deploy; verification shows files + no errors.