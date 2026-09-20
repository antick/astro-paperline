import { afterAll, beforeAll, beforeEach, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createPublication } from '../build-fixture';

let site;
beforeAll(() => {
  site = createPublication();
}, 120_000);
beforeEach(() => site.reset());
afterAll(() => site?.close());
const html = (route) => site.read(`dist/${route}/index.html`);

test('literal script text in metadata stays inside valid JSON-LD', () => {
  const description = 'Discuss </script><p id="metadata-breakout">literal HTML</p> & JSON.';
  site.post('metadata-example');
  site.edit('src/content/blog/metadata-example.md', (text) =>
    text.replace(
      'description: Build scenario fixture',
      `description: ${JSON.stringify(description)}`
    )
  );
  site.build();
  const document = html('metadata-example');
  const blocks = [
    ...document.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)
  ];
  expect(blocks).toHaveLength(1);
  expect(JSON.parse(blocks[0][1]).description).toBe(description);
  expect(document).not.toContain('<p id="metadata-breakout">');
}, 120_000);

test('duplicate public slugs fail the build instead of silently losing an article', () => {
  site.post('first-entry', { extra: 'slug: shared-address' });
  site.post('second-entry', { extra: 'slug: shared-address' });
  const error = site.build(false);
  expect(error).toContain('Duplicate published post path /shared-address');
  expect(error).toContain('first-entry');
  expect(error).toContain('second-entry');
}, 120_000);

test('an article cannot overwrite the archive route', () => {
  site.post('reserved-entry', { extra: 'slug: archive' });
  const error = site.build(false);
  expect(error).toContain('/archive');
  expect(error).toContain('conflicts with higher priority route');
}, 120_000);

test('popular tags count articles once and group case variants', () => {
  site.post('first-entry');
  site.edit('src/content/blog/first-entry.md', (text) =>
    text.replace('[sample]', '[sample, sample, Sample]')
  );
  site.post('second-entry');
  site.build();
  const counts = [
    ...site
      .read('dist/index.html')
      .matchAll(/<a href="\/tags\/sample"[^>]*>.*?<small>(\d+)<\/small>.*?<\/a>/gs)
  ].map((match) => match[1]);
  expect(counts).toEqual(['2']);
  const tag = html('tags/sample');
  for (const slug of ['first-entry', 'second-entry'])
    expect(tag.match(new RegExp(`href="/${slug}"`, 'g'))).toHaveLength(1);
}, 120_000);

test('flat HTML output builds successfully and excludes noindex pages from the sitemap', () => {
  site.post('indexable-entry');
  site.post('private-index', { extra: 'robots:\n  index: false' });
  site.edit('astro.config.ts', (text) =>
    text.replace('compressHTML: true,', "compressHTML: true,\n  build: { format: 'file' },")
  );
  site.build();
  for (const slug of ['indexable-entry', 'private-index'])
    expect(existsSync(join(site.web, `dist/${slug}.html`))).toBe(true);
  const sitemap = site.read('dist/sitemap-0.xml');
  expect(sitemap).toContain('/indexable-entry');
  expect(sitemap).not.toContain('/private-index');
}, 120_000);

test('unpublished related references are absent from public HTML and search hydration data', () => {
  site.post('published-entry', { extra: 'relatedPosts: [draft-secret, future-secret]' });
  site.post('draft-secret', { extra: 'draft: true' });
  site.post('future-secret', { date: '2099-01-01' });
  site.build();
  for (const route of ['search', 'published-entry']) {
    expect(html(route)).not.toContain('draft-secret');
    expect(html(route)).not.toContain('future-secret');
  }
}, 120_000);

test('curated article links retain their query strings, fragments, and trailing slashes', () => {
  site.post('published-entry');
  site.post('draft-secret', { extra: 'draft: true' });
  const urls = [
    '/published-entry/',
    '/published-entry?from=links',
    '/published-entry#main-content'
  ];
  site.edit(
    'src/data/links.ts',
    () =>
      `export default ${JSON.stringify([{ category: 'Reading', data: [...urls, '/draft-secret#main-content'].map((url) => ({ url, label: url, publishedDate: '2020-01-01' })) }])};`
  );
  site.build();
  for (const url of urls) expect(html('links')).toContain(`href="${url}"`);
  expect(html('links')).not.toContain('draft-secret');
}, 120_000);

test('three pages of category and tag results match RSS order without missing or repeated posts', () => {
  for (let day = 1; day <= 12; day++)
    site.post(`entry-${String(day).padStart(2, '0')}`, {
      date: `2020-01-${String(day).padStart(2, '0')}`
    });
  site.post('draft-secret', { extra: 'draft: true' });
  site.post('future-secret', { date: '2099-01-01' });
  site.build();
  const expected = [
    'entry-12',
    'entry-11',
    'entry-10',
    'entry-09',
    'entry-08',
    'entry-07',
    'entry-06',
    'entry-05',
    'entry-04',
    'entry-03',
    'entry-02',
    'entry-01'
  ];
  for (const route of ['categories/writing', 'tags/sample']) {
    const actual = [];
    for (const [index, suffix] of ['', '/2', '/3'].entries()) {
      const page = html(`${route}${suffix}`);
      const slugs = [...page.matchAll(/<a[^>]+href="\/(entry-\d+)"[^>]*>\s*<h2/g)].map(
        (match) => match[1]
      );
      expect(slugs).toHaveLength(index < 2 ? 5 : 2);
      actual.push(...slugs);
      expect(page).not.toMatch(/draft-secret|future-secret/);
    }
    expect(actual).toEqual(expected);
    expect(existsSync(join(site.web, `dist/${route}/1/index.html`))).toBe(false);
    expect(existsSync(join(site.web, `dist/${route}/4/index.html`))).toBe(false);
  }
  const rss = site.read('dist/rss.xml');
  expect([...rss.matchAll(/<item>\s*<title>([^<]+)<\/title>/g)].map((match) => match[1])).toEqual(
    expected
  );
}, 120_000);
