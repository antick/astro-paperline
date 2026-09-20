import { afterAll, beforeAll, beforeEach, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createPublication } from '../build-fixture';

let site;
beforeAll(() => {
  site = createPublication();
}, 120_000);
beforeEach(() => site.reset());
afterAll(() => site?.close());

for (const [name, records, published] of [
  ['empty', [], false],
  ['draft-only', [['draft-fixture', { extra: 'draft: true' }]], false],
  ['future-only', [['future-fixture', { date: '2099-01-01' }]], false],
  ['single-published', [['single-fixture', {}]], true]
]) {
  test(`${name}: pages, navigation, and feeds reflect publication status`, () => {
    for (const [slug, data] of records) site.post(slug, data);
    site.build();
    const home = site.read('dist/index.html');
    expect(home.includes('No published articles yet')).toBe(!published);
    expect(home).not.toContain('href="/categories/journal"');
    expect(site.read('dist/sitemap-0.xml')).not.toContain('/categories/journal/');
    expect(site.read('dist/rss.xml').includes('<item>')).toBe(published);
    for (const [slug] of records)
      expect(existsSync(join(site.web, `dist/${slug}/index.html`))).toBe(published);
  }, 120_000);
}

test('mixed publication keeps drafts and scheduled posts out of every HTML/XML output', () => {
  site.post('published-fixture');
  site.post('future-fixture', { date: '2099-01-01' });
  site.post('a-page-for-every-story', { date: '2099-01-01' });
  site.post('draft-fixture', { extra: 'draft: true' });
  site.post('noindex-fixture', { extra: 'robots:\n  index: false\n  follow: true' });
  site.post('dark-cover-fixture', {
    extra:
      'ogImage: "../../assets/samples/a-notebook-of-small-patterns.webp"\nogImageDark: "../../assets/samples/the-shape-of-a-sentence.webp"\nogImageAlt: "Accessible cover description"'
  });
  site.edit('src/config.ts', (text) =>
    text
      .replace('ogImage: BLOG_PLACEHOLDER_PUBLIC_PATH', "ogImage: '/assets/paperline-logo.png'")
      .replace("title: 'Paperline'", "title: 'Fixture publication'")
  );
  site.build();
  for (const slug of ['future-fixture', 'draft-fixture', 'a-page-for-every-story']) {
    expect(existsSync(join(site.web, `dist/${slug}`))).toBe(false);
    for (const file of readdirSync(join(site.web, 'dist'), { recursive: true })) {
      if (/\.(html|xml)$/.test(file)) expect(site.read(`dist/${file}`)).not.toContain(slug);
    }
  }
  for (const slug of ['published-fixture', 'noindex-fixture'])
    expect(existsSync(join(site.web, `dist/${slug}/index.html`))).toBe(true);
  expect(site.read('dist/sitemap-0.xml')).not.toContain('/noindex-fixture/');
  expect(site.read('dist/about/index.html')).toContain('paperline-logo.png');
  expect(site.read('dist/about/index.html')).toContain(
    '<title>About | Fixture publication</title>'
  );
  expect(site.read('dist/search/index.html')).toContain(
    '<title>Search | Fixture publication</title>'
  );
  const cover = site.read('dist/dark-cover-fixture/index.html');
  expect(cover).toContain('class="post-cover-dark"');
  expect(cover.match(/alt="Accessible cover description"/g)).toHaveLength(2);
  expect(cover).not.toContain('aria-hidden="true" class="post-cover-dark"');
}, 120_000);

test('unknown categories fail with an actionable validation error', () => {
  site.post('invalid-category', { category: 'Unknown category' });
  expect(site.build(false)).toContain('Choose a configured category');
}, 120_000);

test('publication owners can remove the demo banner and repository link through settings', () => {
  site.post('published-fixture');
  site.edit('src/settings.ts', (text) =>
    text
      .replace('demoBanner: true', 'demoBanner: false')
      .replace('repositoryLink: true', 'repositoryLink: false')
  );
  site.build();
  for (const route of ['index.html', 'published-fixture/index.html', '404.html']) {
    const html = site.read(`dist/${route}`);
    expect(html).not.toContain('id="demo-banner"');
    expect(html).not.toContain('href="https://github.com/antick/astro-paperline"');
    expect(html).toContain('id="theme-btn"');
  }
}, 120_000);
