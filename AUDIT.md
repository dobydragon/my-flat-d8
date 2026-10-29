# Phase 1 audit: source documents, evidence and gaps

Audit date: 2026-10-29. Everything below was read from the two PDFs in this folder.
Nothing here comes from outside sources.

## 1. Inventory

| File | Pages | What it is |
|---|---|---|
| `MRS- COMPANY PROFILE.pdf` | 17 (spreads, 1684×595 pt) | MRS Developments company profile (InDesign, Feb 2026). English only. |
| `Viale Brochure.pdf` | 116 | Viàle Residence sales brochure (InDesign, Mar 2026). English only. 80 unit plan pages. |

There was no existing code, framework or `package.json` in the folder. Both PDFs are
owner-password protected (AES-128) but open for reading. Neither PDF contains Arabic text,
prices, payment plans, delivery dates, a north arrow, a scale bar, ceiling heights or a map.

## 2. Company (MRS Developments) — verified facts

- Positioning line: "A vision set in stone." (profile, cover and several spreads)
- Started in the UAE; residential, hotel and industrial projects there. Moved investment to Egypt. (p2)
- CEO letter signed "Sary Mostata" (as printed, p3). Vision, mission, philosophy, values (p3–p7).
- Partners: **MRB** (facility management consultancy, since 2019, 35+ projects, leases retail space in MRS developments) p9; **Infra Co.** (MEP / EPC contractor) p10.
- Egypt projects: **Boulevard Mall** (image + logo only, p11), **Viàle Residence** (p12).
- UAE projects: **Oasis 1 Tower**, **Oasis 2 Tower**, **Queue Point Residences**, **Furjan Tower** (photos only, p14–p16). No locations, dates or sizes are given.
- Brochure stats (Viale p2): over 20 years of regional experience; +50 projects across UAE and Egypt; 31 UAE projects with more than 2,256 residential units; 180 residential units in Egypt.
  *Note:* the brochure says the Egypt portfolio "includes 180 residential units" while the master plan says Viàle alone has 267 units. Both are shown as printed, with their source pages.
- Contact (profile p17): 236 Trivium Square Building, 2nd floor, Cairo, Egypt · mrsdevelopment.com · info@mrsdevelopment.com · hotline **15691** (also on Viale cover/back).

## 3. Viàle Residence — verified facts

- New Obour City. Master plan 43,677 m²; residential land 34,941 m²; commercial 8,735 m²; landscaped/communal 31,270 m²; footprint 12,407 m²; buildings G + 5 floors; 267 residential units (p9).
- Amenities (p7): central swimming pool, shaded seating areas, BBQ areas, meditation spaces, yoga zones, kids' play areas, landscaped walking paths, integrated commercial services, secure access and controlled circulation.
- Design concept, location text (p6, p8). Interior theme page (p115).
- Unit plans for 8 blocks: 15A, 19A (Type A); 16B, 17B, 18B (Type B); 7C (Type C); 8D, 9D (Type D). Each block has a ground-floor plate, a "1st floor" plate, ground units and "typical floor" units. 80 unit pages, each with a room schedule ("Dimensions net"), gross area, garden area (ground floor) and a key plan with the unit highlighted.
- Extracted to `shared-assets/data/viale-units.json` by `tools/extract_viale.py`.

### Source inconsistencies found (kept, and flagged on the website)

- 15A-G02 is printed at 70 m² gross; the identical room schedule is printed at 138 m² for 15A-G03, 19A-G02, 19A-G03.
- 8D-G05 (111 m²) and 8D-105 (69 m²) have identical room schedules; the ground-floor plate label reads 69 m².
- Room labels look shifted against dimensions on 15A-G02/G03, 19A-G02/G03 ("bathroom 3.60×3.40", "bedroom 2.15×1.30") and 8D-G03/103 ("lobby 4.10×3.70", "bedroom 02 1.50×1.20"). Bedroom counts for those units are shown as unknown.
- Wrong code/block printed on 13 pages (e.g. 19A-G06 page prints 15A-G06; 16B-105 prints 16B-101).
- Key plans for 7C-G02/7C-G03 and 9D-G01/9D-G02 highlight the same spot, so those four positions are unconfirmed.
- Section dividers print "TYPE C" for 8D and 9D while their unit pages say Type D.

## 4. Apartment "D8" — evidence

Owner-provided: unit D8, fifth floor, about 79.25 m².

| Evidence | Source |
|---|---|
| Block **8D** (Type D) exists; "D8" read as Block 8D | Viale p91–p103 |
| Only two 79 m² units in 8D: **8D-G04** (ground, garden 16 m²) and **8D-104** (typical floor) | p96, p102 |
| Fifth floor → typical floor plan → **8D-104 layout**, gross area 79 m² | p102 |
| Key-plan highlight: south-east corner unit of the 8D wing (bottom of the plate) | p102 key plan |
| Room schedule (net): corridor 2.95×1.30 · kitchen 2.20×2.00 · living & dining 5.90×3.80 · terrace 2.30×1.35 · lobby 1.20×1.20 · bedroom 4.10×3.50 · bathroom 2.80×2.20 | p102 |

**To confirm with the owner/contract:** that the unit is position 04 of Block 8D (the brochure
does not print fifth-floor codes; 8D-104 is the published typical-floor code). 79.25 m² vs
79 m² is consistent with rounding; no conflict, but the brochure only gives whole numbers.

### Plan legibility and scale

- The plan is an embedded raster image, 524×497 px (original resolution, no higher version in the PDF).
- No scale bar. Scale was **calibrated** from the printed net dimensions: bedroom, living, lobby,
  bathroom and terrace measure 40.2–42.0 px per metre → **40.8 px/m** used (≈2.45 cm per pixel).
  Corridor width disagrees (1.11 m measured vs 1.30 printed; wall-to-wall incl. walls ≈1.40 m).
  Expected accuracy of traced geometry: about ±5 % / ±10 cm.
- Visible as drawn: entrance door at the top of the corridor, open kitchen with L-shaped counter,
  bathroom with WC, basin and shower, small lobby with bathroom and bedroom doors, bedroom window
  (right wall), small bathroom window (top wall), glazed living-room opening to the terrace.
- Not in the source: wall thicknesses (drawn as ~15 cm everywhere), ceiling height, window/door
  heights, sill heights, orientation (no north arrow), structural columns, MEP.
- Traced footprint incl. walls and terrace ≈ 63.6 m²; sum of net rooms = 55.71 m²; brochure gross
  79 m². The brochure does not define "gross"; the gap usually covers walls and a share of common areas.

## 5. Modelling decision

| Source type available? | |
|---|---|
| BIM (IFC/Revit) | No |
| CAD (DWG/DXF) | No |
| Dimensioned PDF drawings | Room schedules only, no dimension lines |
| Plan images with reliable reference measurements | **Yes** (calibrated from schedules) |

- **D8:** a calibrated 2D plan is possible. A 3D model is possible only as a clearly labelled
  approximation (assumed 2.80 m ceiling, 2.10 m doors, window heights assumed).
- **Company site:** per-block floor plates + highlighted unit positions are reliable, so floor and
  unit selection is real. A 3D "floor stack" uses the documented G + 5 floor count and the published
  plates; building massing, facades and floor heights are schematic and labelled as such.

## 6. Architecture and design direction

- Two independent Vite + React + TypeScript apps (`company-website/`, `my-apartment/`), each with
  its own `package.json`, build and run instructions. Data lives in JSON/TS files, not in components.
- `shared-assets/` holds everything extracted from the PDFs; each app copies what it needs on build.
- 3D with three.js, lazy-loaded, so text content never waits for WebGL; 2D fallbacks everywhere.
- Design: MRS profile palette — sand `#D1C2A2`, slate `#8DA4B0`, ink `#1A1A1A`, plus verdigris and
  oxide red sampled from the profile's architectural images. Viàle pages use the brochure's own
  navy `#1C458D`, rust `#A24523`, olive `#4A4F45`, cream `#FCF6B0`. Typeface: Reddit Sans (the
  profile's font); IBM Plex Sans Arabic for Arabic.
- Arabic is a full RTL experience; translations are conservative and add no claims.
