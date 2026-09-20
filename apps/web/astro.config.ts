import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import indexableSitemap from './src/integrations/indexableSitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import rehypeImageNativeLazyLoading from 'rehype-plugin-image-native-lazy-loading';
import { SITE } from './src/config';
import { remarkReadingTime } from './src/utils/readingTime';

export default defineConfig({
  site: SITE.website,
  prerenderConflictBehavior: 'error',
  compressHTML: true,
  markdown: {
    processor: unified({
      remarkPlugins: [remarkReadingTime],
      rehypePlugins: [rehypeImageNativeLazyLoading]
    })
  },
  integrations: [react(), mdx(), indexableSitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@resvg/resvg-js']
    }
  },
  scopedStyleStrategy: 'where'
});
