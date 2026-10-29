// Copies the PDF-derived files this site needs from ../shared-assets (produced by ../tools/*.py).
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const shared = join(here, '..', '..', 'shared-assets');
const app = join(here, '..');

if (!existsSync(shared)) {
  console.warn('shared-assets not found; using the copies already in public/ and src/data/generated/.');
  process.exit(0);
}

const copies = [
  ['web/viale/logo-viale.svg', 'src/data/generated/logo-viale.svg'],
  ['web/viale/plans/8D-104.jpg', 'public/assets/plan-8D-104.jpg'],
  ['web/viale/plans/8D-G04.jpg', 'public/assets/plan-8D-G04.jpg'],
  ['web/viale/plates/8D-typical.jpg', 'public/assets/plate-8D-typical.jpg'],
  ['web/viale/hero-panorama.webp', 'public/assets/hero-panorama.webp'],
  ['web/viale/aerial.webp', 'public/assets/aerial.webp'],
  ['web/viale/night-pool.webp', 'public/assets/night-pool.webp'],
  ['web/viale/interior-bedroom.webp', 'public/assets/interior-bedroom.webp'],
  ['web/viale/interior-dining.webp', 'public/assets/interior-dining.webp'],
  ['web/viale/master-plan.webp', 'public/assets/master-plan.webp'],
];
for (const [from, to] of copies) {
  mkdirSync(dirname(join(app, to)), { recursive: true });
  cpSync(join(shared, from), join(app, to), { recursive: true });
}
// Only this apartment's layout and its ground-floor twin are needed.
const units = JSON.parse(readFileSync(join(shared, 'data/viale-units.json'), 'utf8')).units;
mkdirSync(join(app, 'src/data/generated'), { recursive: true });
writeFileSync(
  join(app, 'src/data/generated/viale-units.json'),
  JSON.stringify({ units: units.filter((u) => u.id === '8D-104' || u.id === '8D-G04') }, null, 1),
);
console.log('assets synced');
