import { expect, test } from '@playwright/test';

test('parent labels and arrows toggle the same submenu; only leaf links navigate', async ({
  page,
  isMobile
}) => {
  await page.goto('/');
  if (isMobile) await page.getByRole('button', { name: 'Toggle Menu', exact: true }).click();
  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Mobile navigation' : 'Topics',
    exact: true
  });
  const parent = isMobile
    ? nav.locator('summary').filter({ hasText: /^Writing$/ })
    : nav.getByRole('button', { name: 'Writing', exact: true });
  const child = isMobile
    ? nav.locator('summary').filter({ hasText: /^The craft$/ })
    : nav.getByRole('button', { name: 'The craft', exact: true });
  await expect(nav.getByRole('link', { name: 'Writing', exact: true })).toHaveCount(0);
  await parent.click({ position: { x: 12, y: 12 } });
  await expect(child).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await expect(nav.getByRole('link', { name: 'The craft', exact: true })).toHaveCount(0);
  await child.click({ position: { x: 12, y: 12 } });
  const leaf = nav.getByRole('link', { name: 'Typography', exact: true });
  await expect(leaf).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  if (!isMobile) {
    for (const toggle of [child, parent]) {
      const arrowAngle = () =>
        toggle.evaluate((element) => {
          const { a, b } = new DOMMatrixReadOnly(getComputedStyle(element, '::after').transform);
          return Math.round((Math.atan2(b, a) * 180) / Math.PI);
        });
      // The border chevron points up at -135 degrees, and down at 45 degrees.
      await expect.poll(arrowAngle).toBe(-135);
      const box = await toggle.boundingBox();
      expect(box).not.toBeNull();
      await toggle.click({ position: { x: box!.width - 5, y: box!.height / 2 } });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect.poll(arrowAngle).toBe(45);
      await toggle.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect.poll(arrowAngle).toBe(-135);
    }
    // Reopening the parent resets its nested disclosure.
    await child.press('Enter');
    await expect(leaf).toBeVisible();
  }
  await leaf.click();
  await expect(page).toHaveURL(/\/categories\/writing\/sections\/craft\/typography\/?$/);
  await expect(page.getByRole('heading', { name: 'Typography', level: 1 })).toBeVisible();
});

test('missing pages retain a 404 response and offer working recovery links in both themes', async ({
  page
}) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    const response = await page.goto('/missing-paperline-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('A page out of place.');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
    const main = page.getByRole('main');
    for (const [label, path] of [
      ['Back to the front page', '/'],
      ['Browse the archive', '/archive'],
      ['Find something specific', '/search']
    ]) {
      const link = main.getByRole('link', { name: new RegExp(label) });
      await expect(link).toBeVisible();
      await link.click();
      expect(new URL(page.url()).pathname.replace(/\/$/, '') || '/').toBe(path);
      await page.goBack();
    }
  }
});
