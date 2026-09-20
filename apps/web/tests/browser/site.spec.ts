import { expect, test } from '@playwright/test';

test('search hydrates, reports results, updates the URL, and opens an article', async ({
  page
}) => {
  await page.goto('/search');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Search');
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('markdown');
  await expect(page.getByRole('status')).toContainText('1 result');
  await expect(page).toHaveURL(/q=markdown/);
  await page.getByRole('link', { name: 'A small guide to Markdown', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A small guide to Markdown');
  await expect(page.getByRole('main')).toHaveCount(1);
});

test('keyboard can skip navigation and dismiss the menu', async ({
  page,
  isMobile,
  browserName
}) => {
  await page.goto('/');
  // Safari on macOS uses Option-Tab for links unless full keyboard access is enabled.
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab'
  );
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  if (!isMobile) {
    const toggle = page.getByRole('button', { name: 'Writing', exact: true });
    await toggle.click();
    await expect(page.getByRole('link', { name: 'All Writing', exact: true })).toBeVisible();
    await toggle.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('link', { name: 'All Writing', exact: true })).not.toBeVisible();
    await expect(toggle).toBeFocused();
  } else {
    const toggle = page.getByRole('button', { name: 'Toggle Menu', exact: true });
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await toggle.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible();
  }
});

test('theme choice persists, picture links work, and layouts stay within the viewport', async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.locator('.square-story-image').click({ position: { x: 20, y: 20 } });
  await expect(page).toHaveURL(/the-shape-of-a-sentence/);
  for (const route of ['/', '/categories', '/a-table-for-good-ideas']) {
    await page.goto(route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  }
});

test('menus dismiss consistently and search handles empty results', async ({ page, isMobile }) => {
  await page.goto('/search');
  const input = page.getByRole('textbox', { name: 'Search', exact: true });
  await input.fill('no-such-paperline-story');
  await expect(page.getByRole('status')).toContainText('0 results');
  await expect(input).toBeFocused();
  await input.fill('');
  await expect(input).toBeFocused();
  await expect(page).not.toHaveURL(/q=/);
  await expect(page.getByRole('status')).toContainText('Enter at least two characters');
  if (isMobile) return;
  const top = page.getByRole('button', { name: 'Writing', exact: true });
  const nested = page.getByRole('button', { name: 'The craft', exact: true });
  await top.click();
  await nested.click();
  const topic = page.getByRole('link', { name: 'Typography', exact: true });
  await expect(topic).toBeVisible();
  await topic.press('Escape');
  await expect(topic).not.toBeVisible();
  await expect(nested).toBeFocused();
  await expect(top).toHaveAttribute('aria-expanded', 'true');
  await nested.press('Escape');
  await expect(top).toBeFocused();
  await expect(top).toHaveAttribute('aria-expanded', 'false');
  await top.hover();
  await expect(nested).not.toBeVisible();
  await top.click();
  await input.click();
  await expect(top).toHaveAttribute('aria-expanded', 'false');
  await top.click();
  await page.getByRole('button', { name: /Switch to .* theme/ }).focus();
  await expect(top).toHaveAttribute('aria-expanded', 'false');
});

test('contrast, keyboard focus, responsive images, and missing routes work', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/');
    const surprise = page.getByRole('button', { name: 'Surprise me', exact: true });
    for (const state of ['normal', 'hover', 'focus']) {
      if (state === 'hover') await surprise.hover();
      if (state === 'focus') {
        await page.keyboard.press('Tab');
        await surprise.focus();
      }
      expect(await surprise.evaluate(contrast)).toBeGreaterThanOrEqual(4.5);
    }
    for (const width of [320, 375, 768, 1024, 1100, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width
      );
    }
    const choices: string[] = JSON.parse(
      (await page.locator('[data-post-paths]').getAttribute('data-post-paths')) ?? '[]'
    );
    await surprise.click();
    expect(choices).toContain(new URL(page.url()).pathname.replace(/\/$/, ''));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/categories');
    const category = page.locator('main a[href="/categories/writing"]');
    expect(await category.evaluate(contrast)).toBeGreaterThanOrEqual(4.5);
    await page.keyboard.press('Tab');
    await category.focus();
    expect(
      await category.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
      })
    ).toBe(true);
    await page.goto('/a-page-for-every-story');
    await expect(page.locator('.article-cover img:visible')).toHaveCount(1);
    await expect(page.locator('.article-cover img:visible')).toHaveAttribute('srcset', /400w/);
    await page.getByRole('link', { name: '← View all articles', exact: true }).click();
    await expect(page).toHaveURL(/\/archive\/?$/);
  }
  const response = await page.goto('/this-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('main')).toHaveCount(1);
});

// Canvas resolves CSS color formats (including OKLCH) into sRGB for WCAG contrast.
function contrast(element: Element) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  function luminance(color: string) {
    if (!context) throw new Error('Canvas unavailable');
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  }
  let parent: Element | null = element;
  let background = 'rgb(255, 255, 255)';
  while (parent) {
    const candidate = getComputedStyle(parent).backgroundColor;
    if (candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') {
      background = candidate;
      break;
    }
    parent = parent.parentElement;
  }
  const foreground = luminance(getComputedStyle(element).color);
  const behind = luminance(background);
  return (Math.max(foreground, behind) + 0.05) / (Math.min(foreground, behind) + 0.05);
}
