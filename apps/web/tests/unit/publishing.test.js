import { describe, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { z } from 'astro/zod';
import { createBlogSchema } from '../../src/content.schema';
import { isIndexableHtml } from '../../src/integrations/indexableSitemap';
import getPagination from '../../src/utils/getPagination';
import { hasUpdatedDate } from '../../src/utils/all';
import { getPopulatedCategories } from '../../src/utils/post';
import getSortedPosts from '../../src/utils/getSortedPosts';

const schema = createBlogSchema(z.string());
const post = (id, data = {}) => ({
  id,
  data: schema.parse({
    title: id,
    description: id,
    category: 'Writing',
    pubDate: '2020-01-01',
    ...data
  })
});

describe('published content', () => {
  test('filters drafts and future posts, then uses one order across pages', () => {
    const source = [
      post('old'),
      post('future', { pubDate: '2099-01-01' }),
      post('draft', { draft: true }),
      ...Array.from({ length: 5 }, (_, i) => post(`new-${i}`, { pubDate: `2021-01-0${i + 1}` }))
    ];
    const posts = getSortedPosts(source);
    const first = getPagination({ posts, page: 1, isIndex: true });
    const second = getPagination({ posts, page: 2 });
    expect([...first.paginatedPosts, ...second.paginatedPosts].map((p) => p.id)).toEqual([
      'new-4',
      'new-3',
      'new-2',
      'new-1',
      'new-0',
      'old'
    ]);
    expect(getSortedPosts([])).toEqual([]);
  });

  test('rejects invalid taxonomy relationships with a field-specific error', () => {
    const valid = post('valid').data;
    for (const [data, field] of [
      [{ ...valid, category: 'Unknown' }, 'category'],
      [{ ...valid, subcategory: 'visual' }, 'subcategory'],
      [{ ...valid, subcategory: 'craft', topic: 'coast' }, 'topic']
    ]) {
      const result = schema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(true);
    }
    expect(
      schema.safeParse({ ...valid, category: 'writing', subcategory: 'craft', topic: 'typography' })
        .success
    ).toBe(true);
  });

  test('date-only values render identically on build and client timezones', () => {
    for (const timezone of ['UTC', 'America/Los_Angeles', 'Asia/Kolkata']) {
      const result = spawnSync(
        process.execPath,
        [
          '-e',
          'import { getFormattedDate } from "./src/utils/all"; console.log(getFormattedDate("2026-08-24"));'
        ],
        { env: { ...process.env, TZ: timezone }, encoding: 'utf8' }
      );
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe('Aug 24, 2026');
    }
  });

  test('sitemap follows emitted robots metadata, not article text', () => {
    expect(isIndexableHtml('<meta name="robots" content="noindex, follow">')).toBe(false);
    expect(isIndexableHtml("<meta content='nofollow, noindex' name='robots'>")).toBe(false);
    expect(isIndexableHtml('<p>This article explains noindex</p>')).toBe(true);
    expect(isIndexableHtml('<meta name="robots" content="index, follow">')).toBe(true);
  });
});

test('only later updates are displayed and empty taxonomy is omitted from navigation', () => {
  const published = new Date('2026-08-24');
  expect(hasUpdatedDate(published)).toBe(false);
  expect(hasUpdatedDate('2026-08-24', '2026-08-24T00:00:00Z')).toBe(false);
  expect(hasUpdatedDate(published, new Date('2026-08-24T00:00:00Z'))).toBe(false);
  expect(hasUpdatedDate(published, new Date('2026-08-23'))).toBe(false);
  expect(hasUpdatedDate(published, new Date('2026-08-25'))).toBe(true);
  expect(getPopulatedCategories([])).toEqual([]);
  const categories = getPopulatedCategories([
    post('one', { subcategory: 'craft', topic: 'typography' })
  ]);
  expect(categories.map((category) => category.slug)).toEqual(['writing']);
  expect(categories[0].subcategories.map((section) => section.slug)).toEqual(['craft']);
  expect(categories[0].subcategories[0].topics.map((topic) => topic.slug)).toEqual(['typography']);
});
