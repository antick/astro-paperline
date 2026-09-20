import { expect, test } from '@playwright/test';

test('the banner preserves page typography and leaves room for its close button on narrow screens', async ({
  page
}) => {
  await page.goto('/');
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const headingSize = await page
      .getByRole('heading', { level: 1 })
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(headingSize).toBeGreaterThanOrEqual(32);
    await expect(page.locator('#theme-btn svg:visible')).toHaveCSS('fill', 'none');
    const link = await page.locator('.demo-banner-link').boundingBox();
    const close = await page.locator('.demo-banner-dismiss').boundingBox();
    expect(link).not.toBeNull();
    expect(close).not.toBeNull();
    expect(link!.x + link!.width).toBeLessThanOrEqual(close!.x);
    expect(close!.width).toBeGreaterThanOrEqual(44);
    expect(close!.height).toBeGreaterThanOrEqual(44);
  }
});

test('demo links share the repository and banner dismissal survives navigation and reloads', async ({
  page
}) => {
  await page.goto('/');
  const banner = page.getByRole('complementary', { name: 'About this template' });
  const repository = page
    .locator('.site-header')
    .getByRole('link', { name: 'Paperline on GitHub' });
  await expect(banner).toContainText('Paperline is a free Astro blog template.');
  for (const link of [banner.getByRole('link', { name: 'Get it on GitHub' }), repository]) {
    await expect(link).toHaveAttribute('href', 'https://github.com/antick/astro-paperline');
    await expect(link).toBeVisible();
  }
  await page.evaluate(() => window.scrollTo(0, 500));
  await expect(banner).not.toBeInViewport();
  await expect(repository).toBeInViewport();
  await page.evaluate(() => window.scrollTo(0, 0));
  const dismiss = banner.getByRole('button', { name: 'Dismiss template banner' });
  await dismiss.focus();
  await dismiss.press('Enter');
  await expect(page.locator('#demo-banner')).toBeHidden();
  await expect(page.locator('.site-header .brand')).toBeFocused();
  await page.goto('/archive');
  await expect(page.locator('#demo-banner')).toBeHidden();
  await page.reload();
  await expect(page.locator('#demo-banner')).toBeHidden();
  await expect(repository).toBeVisible();
});

test('the demo banner can be dismissed when browser storage is blocked', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      }
    });
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Dismiss template banner' }).click();
  await expect(page.locator('#demo-banner')).toBeHidden();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('the template link works without JavaScript and has no inactive dismiss button', async ({
  browser,
  baseURL
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/');
    const banner = page.getByRole('complementary', { name: 'About this template' });
    await expect(banner.getByRole('link', { name: 'Get it on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/antick/astro-paperline'
    );
    await expect(page.locator('.demo-banner-dismiss')).toBeHidden();
  } finally {
    await context.close();
  }
});
