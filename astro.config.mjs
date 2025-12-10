// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// ==============================================
// SITE CONFIGURATION - Simple, clean Astro
// ==============================================
const SITE_URL = 'https://howtowincapitalism.com';

export default defineConfig({
	site: SITE_URL,
	trailingSlash: 'always',
	build: {
		format: 'directory',
	},
	integrations: [
		mdx(),
		sitemap(),
	],
	output: 'static',
	compressHTML: true,
});
