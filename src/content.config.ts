import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Simple content collection - just markdown with basic frontmatter
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { docs };
