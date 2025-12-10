// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// ==============================================
// SITE CONFIGURATION - Hybrid SSR with Cloudflare
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
	// Server mode: SSR for all pages
	// Required for dynamic profile data fetching
	output: 'server',
	adapter: cloudflare(),
	compressHTML: true,
});
