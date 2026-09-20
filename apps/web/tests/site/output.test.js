import { beforeAll, expect, test } from 'bun:test';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';

const dist = resolve('dist');
const pages = new Map();

beforeAll(async () => {
  const files = readdirSync(dist, { recursive: true }).filter((file) => file.endsWith('.html'));
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    const elements = [];
    const headings = [];
    let paragraphOpen = false;
    const invalidBlocks = [];
    const source = readFileSync(join(dist, file), 'utf8');
    await new HTMLRewriter()
      .on('*', {
        element(element) {
          const tag = element.tagName;
          elements.push({ tag, attrs: Object.fromEntries(element.attributes) });
          if (paragraphOpen && /^(p|div|blockquote|ul|ol|table|h[1-6])$/.test(tag))
            invalidBlocks.push(tag);
          if (tag === 'p') {
            paragraphOpen = true;
            element.onEndTag(() => {
              paragraphOpen = false;
            });
          }
        }
      })
      .on('h2', {
        text(chunk) {
          if (chunk.text.trim()) headings.push(chunk.text.trim());
        }
      })
      .transform(new Response(source))
      .text();
    pages.set(join(dist, file), { elements, headings, invalidBlocks, source });
  }
});

test('every emitted page has valid landmarks, heading order, unique IDs, and a skip link', () => {
  for (const [path, { elements, invalidBlocks }] of pages) {
    expect(invalidBlocks, path).toEqual([]);
    for (const tag of ['h1', 'main'])
      expect(
        elements.filter((element) => element.tag === tag),
        `${path}: ${tag}`
      ).toHaveLength(1);
    const levels = elements
      .filter(({ tag }) => /^h[1-6]$/.test(tag))
      .map(({ tag }) => Number(tag[1]));
    for (let i = 1; i < levels.length; i++)
      expect(levels[i], path).toBeLessThanOrEqual(levels[i - 1] + 1);
    const ids = elements.map(({ attrs }) => attrs.id).filter(Boolean);
    expect(new Set(ids).size, `${path}: duplicate IDs`).toBe(ids.length);
    expect(
      elements.some(({ attrs }) => attrs.href === '#main-content'),
      `${path}: skip link`
    ).toBe(true);
  }
});

test('every internal link, image, responsive source, and fragment resolves', () => {
  for (const [path, { elements }] of pages) {
    for (const { attrs } of elements) {
      const links = [
        attrs.href,
        attrs.src,
        ...(attrs.srcset ?? '')
          .split(',')
          .filter(Boolean)
          .map((item) => item.trim().split(/\s+/)[0])
      ].filter(Boolean);
      for (const link of links) {
        if (/^(?:[\w+.-]+:|\/\/)/.test(link)) continue;
        const url = new URL(link, `https://fixture.test/${relative(dist, path)}`);
        let target = join(dist, decodeURIComponent(url.pathname));
        if (existsSync(target) && statSync(target).isDirectory())
          target = join(target, 'index.html');
        expect(existsSync(target), `${relative(dist, path)}: missing ${link}`).toBe(true);
        if (url.hash && pages.has(target)) {
          expect(
            pages
              .get(target)
              .elements.some(
                ({ attrs: targetAttrs }) => targetAttrs.id === decodeURIComponent(url.hash.slice(1))
              ),
            `${path}: missing anchor ${link}`
          ).toBe(true);
        }
      }
    }
  }
});

test('sitemap omits noindex pages and duplicate first pagination routes', () => {
  const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
  expect(sitemap).not.toContain('/search/');
  for (const [path, { elements }] of pages) {
    expect(relative(dist, path)).not.toMatch(/^(categories|tags)\/[^/]+\/1\/index.html$/);
    const noindex = elements.some(
      ({ tag, attrs }) =>
        tag === 'meta' && attrs.name === 'robots' && attrs.content?.includes('noindex')
    );
    if (noindex && !path.endsWith('/404.html')) {
      const route = `/${relative(dist, dirname(path))}/`;
      expect(sitemap, path).not.toContain(route);
    }
  }
});

test('sample category pagination shows all six articles once in chronological order', () => {
  const titles = ['categories/writing/index.html', 'categories/writing/2/index.html'].flatMap(
    (file) => pages.get(join(dist, file)).headings
  );
  expect(titles).toHaveLength(6);
  expect(new Set(titles).size).toBe(6);
  expect(titles.at(-1)).toBe('A table for good ideas');
  expect(readFileSync(join(dist, 'rss.xml'), 'utf8')).toContain('<item>');
});

test('home and article covers provide responsive image candidates', () => {
  for (const file of ['index.html', 'a-page-for-every-story/index.html']) {
    const covers = pages
      .get(join(dist, file))
      .elements.filter(({ tag, attrs }) => tag === 'img' && attrs.class === 'post-cover-light');
    expect(covers.length).toBeGreaterThan(0);
    for (const { attrs } of covers) {
      expect(attrs.srcset).toBeTruthy();
      expect(attrs.sizes).toBeTruthy();
    }
  }
});
