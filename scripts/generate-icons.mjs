#!/usr/bin/env node
/**
 * Generate PNG icons from SVG favicon
 *
 * Run: npm run icons
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

console.log('Generating icons from favicon.svg...');

for (const { name, size } of sizes) {
  const outputPath = join(publicDir, name);

  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`✓ ${name} (${size}x${size})`);
}

console.log('\nDone! Icons generated.');

