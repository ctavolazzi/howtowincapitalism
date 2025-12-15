/**
 * @fileoverview Content collections configuration for Astro.
 *
 * Defines the schema and validation for content collections:
 * - users: User identity profiles (links to runtime auth)
 * - tools: Assets with ownership and visibility
 * - docs: Wiki content (FAQ, Notes)
 *
 * @module content.config
 * @see https://docs.astro.build/en/guides/content-collections/
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

// =============================================================================
// USERS COLLECTION - The identity layer
// Filename (e.g., 'crispy.md') becomes the ID that links to runtime auth
// =============================================================================
const users = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/users' }),
  schema: z.object({
    name: z.string(),
    role: z.enum(['admin', 'editor', 'contributor', 'viewer']),
    avatar: z.string().optional(),
    // Access levels: admin=10, editor=5, contributor=3, viewer=1
    accessLevel: z.number().min(1).max(10).default(1),
  }),
});

// =============================================================================
// TOOLS COLLECTION - Assets with ownership
// The 'owner' field MUST reference a valid user file
// =============================================================================
const tools = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tools' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // 🔒 THE LOCK: Must match a file in src/content/users/
    owner: reference('users'),
    visibility: z.enum(['public', 'private', 'team']).default('private'),
    type: z.enum(['Agent', 'Physical', 'Service']),
    status: z.enum(['Active', 'In Development', 'Sold', 'Deprecated']),
    value: z.string().optional(),
    image: z.string().optional(),
  }),
});

// =============================================================================
// DOCS COLLECTION - Wiki content (FAQ, Notes)
// =============================================================================
const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Optional ownership - not all docs need an owner
    owner: reference('users').optional(),
    visibility: z.enum(['public', 'private', 'team']).default('public'),
  }),
});

export const collections = { users, tools, docs };
