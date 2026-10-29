# MRS Development website + My Flat D8

Two independent websites built only from the two PDFs in this folder:

| Folder | What it is | Dev URL |
|---|---|---|
| `company-website/` | Bilingual (EN/AR) concept website for MRS Developments and Viàle Residence, with a unit explorer (floor plates, 3D floor stack, 80 unit plans) | http://localhost:5173 |
| `my-apartment/` | Personal site for apartment D8 (Block 8D, fifth floor): original plan, calibrated 2D furnishing studio, approximate 3D model with walkthrough, accuracy report | http://localhost:5174 |
| `shared-assets/` | Everything extracted from the PDFs: `raw/` (every embedded image + inventory), `web/` (optimised photos, plans, floor plates, vector logos), `data/viale-units.json` | — |
| `tools/` | Python scripts that produce `shared-assets/` (PyMuPDF + Pillow) | — |
| `AUDIT.md` | Phase 1 audit: inventory, facts, D8 evidence, source inconsistencies, modelling decision | — |

## Run

Requirements: Node 18+ (tested with Node 22). Python 3 + PyMuPDF only if you want to re-extract.

```bash
cd company-website      # or my-apartment
npm install
npm run dev             # company: http://localhost:5173 · apartment: http://localhost:5174
npm run build           # type-check + production build into dist/
npm run preview         # serve dist/ (company: 4173 · apartment: 4174)
npm run typecheck
```

`dev` and `build` first run `scripts/sync-assets.mjs`, which copies what each site needs from
`../shared-assets`. Both builds use a relative base and hash routing, so `dist/` works from any
static host or GitHub Pages sub-path.

Re-extract from the PDFs (only needed if they change):

```bash
python3 tools/extract_viale.py   # units, floor plates, key-plan positions (~3 min, aligns key plans)
python3 tools/extract_media.py   # photos (WebP) and vector logos (SVG)
python3 tools/viale_checks.py    # cross-checks + Arabic versions of the source notes
```

Stack: Vite 5, React 18, TypeScript (strict), React Router (hash), three.js 0.169 for 3D (lazy-loaded,
so text pages never wait for WebGL). No backend, no API keys, no analytics.

## Website A — MRS Developments (`company-website/`)

Pages: home · company (about, CEO letter, vision, mission, philosophy, values, partners) · projects
(search + Egypt/UAE filter) · project pages · Viàle Residence (concept, amenities, location, master plan,
unit types, interior theme, gallery with keyboard lightbox, FAQ) · unit explorer · 80 unit pages ·
contact · FAQ · 404.

- **Unit explorer:** choose block (8) and floor (G–5); the brochure's floor plate becomes clickable,
  with each unit's area taken from the highlight on its own key plan (aligned automatically to the
  full plate). Switch to the **3D floor stack**: six levels (G + 5, as documented) textured with the
  published plates; click a level, then a unit. Below: all 80 units, filterable by type, level,
  bedrooms, gross area and code, synced to the URL.
- **Unit page:** original plan with zoom / pan / fit / 1:1 (wheel, drag, pinch, keyboard), net room
  schedule with computed areas, position on the floor, source page, and any inconsistency the
  brochure itself contains.
- **Contact form:** validated (required, phone 8–15 digits, email, message length), messages follow the
  language switch. There is no server, so it opens a pre-filled email to info@mrsdevelopment.com and says so.
- Arabic is a full RTL layout (IBM Plex Sans Arabic); English uses Reddit Sans, the profile's own font.
  Colours come from the PDFs: sand `#D1C2A2`, slate `#8DA4B0`, ink, plus the brochure's navy/rust/olive/cream.
- SEO: per-page title/description, Open Graph + Twitter tags, OG image, favicon.
- Footer and FAQ state that this is an independent concept site, not the official MRS website.

### Evidence report — company site

| | |
|---|---|
| Source files | `MRS- COMPANY PROFILE.pdf` (17 pp.), `Viale Brochure.pdf` (116 pp.). English only; no CAD/BIM. |
| Projects identified | Viàle Residence (full detail); Boulevard Mall (Egypt) and Oasis 1, Oasis 2, Queue Point, Furjan Tower (UAE): photographs only — shown as such, no invented details. |
| Unit plans | 80 units in blocks 15A, 19A (Type A), 16B, 17B, 18B (B), 7C (C), 8D, 9D (D). |
| Reliable 2D | Yes: every published unit plan and floor plate, with unit positions (76 confirmed; 4 positions unconfirmed because the brochure highlights the same spot twice). |
| 3D | Schematic only: floor count and plates are documented; slab spacing and massing are illustrative and labelled so. No facade or building geometry exists in the sources. |
| Verified | Net room dimensions, gross/garden areas, master-plan figures, amenities, contact details — each shown with its page. |
| Flagged, not corrected | 23 units with brochure inconsistencies (wrong codes/blocks printed, shifted room labels, 15A-G02 printed 70 m² vs 138 m² for the same layout, 8D-G05 111 vs 69 m²). |
| Not in sources | Prices, payment plans, delivery dates, finishing specification, map/road names, UAE project details. |

## Website B — My apartment D8 (`my-apartment/`)

Pages: overview · original plan · 2D/3D explorer · accuracy report. Bilingual, `noindex` by default.

- **Identification:** "D8" = Block 8D. The fifth floor is a typical floor, and the only 79 m² typical
  unit in 8D is **8D-104** (brochure p. 102). Owner area 79.25 m² vs printed 79 m²: consistent.
- **Original plan viewer:** four layers — original only, original + trace (proves the alignment),
  traced without furniture, traced with your furniture; zoom/pan/fit/1:1.
- **2D studio (scaled):** scale calibrated from the printed dimensions (40.8 px = 1 m, ±5 %). Drag, rotate
  (90°/15°), resize, duplicate, remove furniture; 21 catalogue items with typical sizes; "as drawn in the
  brochure" preset measured from the plan itself; live "fits / crosses a wall" check; two-point measuring
  tool; room list with printed vs traced sizes; optional original-drawing underlay; keyboard support;
  layout saved in the browser.
- **3D model:** walls, doors, windows, glazing, counter and fixtures built from the trace; same furniture as
  the 2D layout; orbit, top and walk (WASD/arrows, drag to look, on-screen buttons on touch) with wall
  collision; room focus; walls cut to 1.2 m; "highlight assumed elements" tints every assumed height orange.

### Evidence report — D8

| | |
|---|---|
| Plan found | Yes, p. 102 (8D-104, typical floor) — embedded image 524 × 497 px, no scale bar. |
| Reliable 2D | Yes, calibrated: 5 of 7 rooms within 4 % of the printed sizes; corridor width −13 % (printed figure likely wall-to-wall), lobby −8 % (≈10 cm). |
| 3D | Approximate only. Wall layout traced; every height assumed (ceiling 2.80, doors 2.10, windows 0.90–2.20, glazing 2.30, parapet 1.10 m). |
| Verified | Room names, numbers and net dimensions; gross 79 m²; unit position on the floor plate; door/window positions as drawn. |
| Interpreted | Shower glass screen, glazed living→terrace opening, terrace parapet, L-shaped bathroom. |
| Missing | Orientation (no north arrow), ceiling height, real wall thicknesses, columns, window/door schedule, MEP, finishing specification, the exact fifth-floor contract code. |

**To build a dimensionally accurate / realistic 3D model, ask the developer for:** the fifth-floor
architectural plan of Block 8D as DWG (or a dimensioned PDF), a section through the unit
(floor-to-ceiling height), the door/window schedule, the site plan with north arrow, the structural
grid, and the definition of the 79 / 79.25 m². With a DWG or IFC the model can be rebuilt at real
thicknesses and heights and exported to glTF.

## Demonstrating the company website to a client or employer

1. Open the home page in English, then press **العربية**: the whole layout mirrors (navigation,
   grids, arrows, forms) — not just the text alignment.
2. Go to **Find a unit** → block **8D**, floor **5** → hover the plan, click unit **04**. Show the zoomable
   original plan, the room schedule and the highlighted position on the floor.
3. Back in the explorer, switch to **3D floor stack**, orbit, click a level, then a unit.
4. Filter all units (e.g. Type D, 1 bedroom) and show that the URL keeps the filters (shareable link).
5. Open a flagged unit (e.g. 15A-G02) to show the data honesty: brochure inconsistencies are surfaced,
   not hidden. Mention that the unit data is generated by a script from the PDF, not typed by hand.
6. Finish on the contact form: validation in both languages, and an honest note that it opens the
   visitor's email app because there is no backend.

## Verification performed

- `npm run build` (includes `tsc --noEmit`, strict) passes for both sites.
- Automated browser tests over the Chrome DevTools Protocol: hotspot → unit navigation, unit filters
  (Type D + 1 bedroom = 4 units), empty states, project search, form validation and focus, language
  switch (`dir="rtl"`), 3D canvas + floor click, 404s; apartment: furniture drag (60 px → 1.256 m exactly),
  selection, rotate, add/remove, room click, measuring (200 px at 117 % → 4.19 m), zoom, 3D walk keys.
  No console errors.
- Phone width (390 px): 26 page/language combinations checked with no horizontal overflow.
- Not tested: real phones/Safari, screen readers end-to-end, and the mail client opening (headless).
