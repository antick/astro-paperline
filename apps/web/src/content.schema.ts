import type { ImageMetadata } from 'astro';
import { z } from 'astro/zod';
import { categories } from './data/category';
import { slugifyStr } from './utils/slugify';

const robotsSchema = z.object({
  index: z.boolean().default(true),
  follow: z.boolean().default(true)
});

export const createBlogSchema = (image: z.ZodType<string | ImageMetadata>) =>
  z
    .object({
      title: z.string().min(1),
      seoTitle: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      excerpt: z.string().min(1).optional(),
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
      pubDate: z.coerce.date().optional(),
      publishDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional().nullable(),
      author: z.string().min(1).optional(),
      authorUrl: z.string().min(1).optional(),
      category: z.string().min(1),
      subcategory: z.string().min(1).optional(),
      topic: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      canonicalUrl: z.url().optional(),
      robots: robotsSchema.default({ index: true, follow: true }),
      image: image.optional(),
      ogImage: image.optional(),
      ogImageDark: image.optional(),
      ogImageAlt: z.string().optional(),
      ogImageWidth: z.number().int().positive().optional(),
      ogImageHeight: z.number().int().positive().optional(),
      socialCardType: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
      schemaType: z.enum(['Article', 'BlogPosting', 'NewsArticle']).default('Article'),
      language: z.string().min(2).default('en'),
      relatedPosts: z.array(z.string()).default([])
    })
    .superRefine((data, context) => {
      const category = categories.find((item) => item.slug === slugifyStr(data.category));
      const section = category?.subcategories.find((item) => item.slug === data.subcategory);
      if (!category)
        context.addIssue({
          code: 'custom',
          message: 'Choose a configured category from src/data/category.ts',
          path: ['category']
        });
      if (data.subcategory && !section)
        context.addIssue({
          code: 'custom',
          message: 'Subcategory must belong to the selected category',
          path: ['subcategory']
        });
      if (data.topic && !section?.topics.some((item) => item.slug === data.topic))
        context.addIssue({
          code: 'custom',
          message: 'Topic must belong to the selected subcategory',
          path: ['topic']
        });
      if (!data.description && !data.excerpt) {
        context.addIssue({
          code: 'custom',
          message: 'Either description or excerpt is required',
          path: ['description']
        });
      }
    })
    .transform((data, context) => {
      const pubDate = data.pubDate ?? data.publishDate;
      if (!pubDate) {
        context.addIssue({ code: 'custom', message: 'pubDate is required', path: ['pubDate'] });
        return z.NEVER;
      }
      return {
        ...data,
        tags: [...new Map(data.tags.map((tag) => [slugifyStr(tag), tag])).values()],
        description: data.description ?? data.excerpt ?? '',
        excerpt: data.excerpt ?? data.description ?? '',
        pubDate,
        publishDate: pubDate,
        ogImage: data.ogImage ?? data.image
      };
    });
