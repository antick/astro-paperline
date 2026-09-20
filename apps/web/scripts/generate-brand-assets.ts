import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { MASTHEAD, SITE } from '../src/config';

const root = new URL('../', import.meta.url);
const typography = await readFile(new URL('src/styles/typography.css', root), 'utf8');
const stacks = Object.fromEntries(
  [...typography.matchAll(/--(font-[\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2]])
);
const brandFont = stacks['font-brand']?.replace(
  /var\(--([\w-]+)\)/g,
  (_, token: string) => stacks[token] ?? ''
);
assert(
  brandFont && !brandFont.includes('var('),
  'Define a resolvable brand font in typography.css'
);

const xml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const palette = { paper: '#f8f3ea', ink: '#1d2624', accent: '#1b6962', muted: '#626965' };
const mark = (await readFile(new URL('src/assets/paperline-mark.svg', root), 'utf8'))
  .replace(/<svg[^>]*>|<\/svg>/g, '')
  .trim();
const wordmark = xml(SITE.title.toLowerCase());
const tagline = xml(MASTHEAD.label.toUpperCase());
const font = xml(brandFont);

const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="490" height="130" viewBox="0 0 490 130">
  <title>${xml(SITE.title)}</title>
  <g transform="translate(0 10) scale(1.7)" color="${palette.accent}">${mark}</g>
  <text x="108" y="70" fill="${palette.ink}" font-family="${font}" font-weight="600" font-size="64" letter-spacing="-2">${wordmark}<tspan fill="${palette.accent}">.</tspan></text>
  <text x="110" y="105" fill="${palette.muted}" font-family="${font}" font-weight="500" font-size="14" letter-spacing="2.2">${tagline}</text>
</svg>`;
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <title>${xml(SITE.title)} — ${xml(MASTHEAD.label)}</title>
  <rect width="1200" height="630" fill="${palette.paper}"/>
  <path d="M80 80h1040M80 550h1040" stroke="${palette.muted}" stroke-opacity="0.3"/>
  <g transform="translate(70 170) scale(3.3)" color="${palette.accent}">${mark}</g>
  <text x="310" y="300" fill="${palette.ink}" font-family="${font}" font-weight="600" font-size="126" letter-spacing="-4">${wordmark}<tspan fill="${palette.accent}">.</tspan></text>
  <text x="314" y="378" fill="${palette.muted}" font-family="${font}" font-weight="500" font-size="25" letter-spacing="4">${tagline}</text>
  <text x="84" y="510" fill="${palette.muted}" font-family="${font}" font-size="20">An open-source Astro theme for thoughtful writing.</text>
</svg>`;

// Outline exported text so assets keep their appearance without installed fonts.
const render = (svg: string) => new Resvg(svg, { font: { defaultFontFamily: 'Arial' } });
const logoImage = render(logo);
const socialImage = render(social);
await writeFile(new URL('public/assets/paperline-logo.svg', root), logoImage.toString());
await writeFile(new URL('public/assets/paperline-logo.png', root), logoImage.render().asPng());
await writeFile(new URL('src/assets/paperline-social.svg', root), socialImage.toString());
await sharp(socialImage.render().asPng())
  .jpeg({ quality: 90 })
  .toFile(new URL('public/assets/paperline-social.jpg', root).pathname);

const exportedLogo = await readFile(new URL('public/assets/paperline-logo.svg', root), 'utf8');
assert(!exportedLogo.includes('<text'), 'Exported logo must not depend on system fonts');
console.log('Generated Paperline logo and social assets from the shared typography.');
