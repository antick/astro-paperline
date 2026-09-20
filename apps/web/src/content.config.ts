import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { createBlogSchema } from './content.schema';

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
    // Keep file identities distinct even when their public slugs collide.
    generateId: ({ entry }) => entry
  }),
  schema: ({ image }) => createBlogSchema(image().or(z.string()))
});

export const collections = { blog };
