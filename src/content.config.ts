import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

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
