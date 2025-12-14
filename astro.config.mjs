// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

// ==============================================
// SITE CONFIGURATION - Hybrid SSR with Cloudflare
// ==============================================
const SITE_URL = 'https://howtowincapitalism.com';

// Use Node adapter for local dev (macOS 12.x doesn't support workerd)
// Use Cloudflare adapter for production builds
const isDev = process.argv.includes('dev');

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
	adapter: isDev ? node({ mode: 'standalone' }) : cloudflare(),
	compressHTML: true,
});
