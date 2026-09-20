import { readFile } from 'node:fs/promises';
import sitemap from '@astrojs/sitemap';

// Read emitted metadata so sitemap exclusions also cover non-article pages.
export function isIndexableHtml(html: string) {
  return ![...html.matchAll(/<meta\b[^>]*>/gi)].some(
    ([tag]) => /name=["']robots["']/i.test(tag) && /content=["'][^"']*\bnoindex\b/i.test(tag)
  );
}

export default function indexableSitemap() {
  const excluded = new Set<string>();
  const integration = sitemap({
    filter: (url) => !excluded.has(new URL(url).pathname.replace(/\/$/, ''))
  });
  const buildDone = integration.hooks['astro:build:done'];
  integration.hooks['astro:build:done'] = async (options) => {
    excluded.clear();
    for (const files of options.assets.values()) {
      for (const file of files) {
        if (!file.pathname.endsWith('.html')) continue;
        const pathname = file.pathname
          .slice(options.dir.pathname.length)
          .replace(/(?:^|\/)index\.html$|\.html$/, '');
        const html = await readFile(file, 'utf8');
        if (!isIndexableHtml(html)) excluded.add(pathname ? `/${pathname}` : '');
      }
    }
    await buildDone?.(options);
  };
  return integration;
}
