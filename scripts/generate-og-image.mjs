/**
 * Generate OG Image (PNG) from SVG
 *
 * Run: node scripts/generate-og-image.mjs
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgPath = join(publicDir, 'og-image.svg');
const pngPath = join(publicDir, 'og-image.png');

console.log('Converting og-image.svg to og-image.png...');

try {
  const svgBuffer = readFileSync(svgPath);

  await sharp(svgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(pngPath);

  console.log('✓ og-image.png created successfully');
} catch (error) {
  console.error('Error converting image:', error.message);
  process.exit(1);
}

