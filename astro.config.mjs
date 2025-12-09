// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// ==============================================
// SITE CONFIGURATION
// ==============================================
const SITE_URL = 'https://howtowincapitalism.com';
const SITE_TITLE = 'How To Win Capitalism';
const SITE_DESCRIPTION = 'A satirical but practical wiki about financial autonomy. Notes on a system for people tired of the grind.';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export default defineConfig({
	site: SITE_URL,
	trailingSlash: 'always',
	build: {
		format: 'directory',
	},
	integrations: [
		starlight({
			title: SITE_TITLE,
			tagline: 'A satirical but practical wiki about financial autonomy',
			customCss: ['./src/styles/custom.css'],
			pagination: false,
			lastUpdated: false,
			// Favicon
			favicon: '/favicon.svg',
			// Head meta tags and links
			head: [
				// === PERFORMANCE: Resource Hints ===
				// DNS prefetch for external resources (if any added later)
				{ tag: 'link', attrs: { rel: 'dns-prefetch', href: '//fonts.googleapis.com' } },
				// Preconnect (currently no external resources - good for sustainability!)
				// { tag: 'link', attrs: { rel: 'preconnect', href: 'https://example.com' } },

				// === Standard meta ===
				{ tag: 'meta', attrs: { name: 'author', content: 'How To Win Capitalism' } },
				{ tag: 'meta', attrs: { name: 'robots', content: 'index, follow' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#ffffff' } },
				{ tag: 'meta', attrs: { name: 'msapplication-TileColor', content: '#ffffff' } },
				// Viewport hint for mobile optimization
				{ tag: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' } },
				// PWA / App manifest
				{ tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' } },
				// Open Graph (Facebook, LinkedIn, Discord, Slack, iMessage)
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:site_name', content: SITE_TITLE } },
				{ tag: 'meta', attrs: { property: 'og:title', content: SITE_TITLE } },
				{ tag: 'meta', attrs: { property: 'og:description', content: SITE_DESCRIPTION } },
				{ tag: 'meta', attrs: { property: 'og:image', content: OG_IMAGE } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'How To Win Capitalism - A satirical wiki about financial autonomy' } },
				{ tag: 'meta', attrs: { property: 'og:url', content: SITE_URL } },
				// Twitter Card
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'twitter:title', content: SITE_TITLE } },
				{ tag: 'meta', attrs: { name: 'twitter:description', content: SITE_DESCRIPTION } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: OG_IMAGE } },
				{ tag: 'meta', attrs: { name: 'twitter:image:alt', content: 'How To Win Capitalism - A satirical wiki about financial autonomy' } },
			],
			// Simple flat navigation - no confusing accordions
			sidebar: [
				{ label: 'Home', link: '/' },
				{ label: 'Introduction', link: '/protocol/introduction/' },
				{ label: 'Latest Updates', link: '/field-notes/latest/' },
				{ label: 'Reports', link: '/reports/' },
			],
			// Table of contents configuration
			tableOfContents: {
				minHeadingLevel: 2,
				maxHeadingLevel: 3,
			},
			components: {
				ThemeSelect: './src/components/utilities/Empty.astro',
				Header: './src/components/overrides/Header.astro',
				Sidebar: './src/components/utilities/Empty.astro',
				MobileMenuToggle: './src/components/utilities/Empty.astro',
				Footer: './src/components/organisms/Footer.astro',
			},
		}),
	],
	output: 'static',
	// Compression for smaller builds
	compressHTML: true,
});
