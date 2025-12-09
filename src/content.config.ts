import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Content collection configuration with extended schema
// Debug: This file runs at build time to define content collections

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Content categorization
				category: z.enum(['concept', 'tool', 'framework', 'guide', 'reference']).optional(),
				// Difficulty level for readers
				difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
				// Estimated reading time (e.g., "5 min")
				readTime: z.string().optional(),
			}),
		}),
	}),
};

// Log collection setup (only during build)
if (typeof console !== 'undefined') {
	console.log('🔍 [content-config] Collections defined:', Object.keys(collections));
}
