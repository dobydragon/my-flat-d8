# My apartment · D8


**Live:** https://dobydragon.github.io/my-flat-d8/ (served from `docs/`, a copy of `npm run build` output; rebuild and copy `dist/` to `docs/` to update). Full write-up: `PROJECT_OVERVIEW.md`, audit: `AUDIT.md`.
Personal site for apartment D8 (Block 8D, fifth floor, layout 8D-104). See `../README.md` for the evidence
report and what is verified, traced, interpreted or assumed.

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # type-check + build to dist/
npm run preview    # http://localhost:4174
```

- Traced geometry (walls, openings, rooms, fixtures, scale): `src/data/geometry.ts`
- Furniture catalogue and the brochure layout: `src/data/furniture.ts`
- Facts with their status (owner / brochure / derived / unknown): `src/data/apartment.ts`
- 2D studio: `src/components/Studio.tsx` · 3D model: `src/three/Apartment3D.tsx` (lazy-loaded)
