import { expect, test } from '@playwright/test';

test('search waits for hydration before accepting input on a slow connection', async ({ page }) => {
  const scripts = Promise.withResolvers<void>();
  await page.route('**/_astro/*.js', async (route) => {
    await scripts.promise;
    await route.continue();
  });
  const input = page.getByRole('textbox', { name: 'Search', exact: true });
  try {
    await page.goto('/search?q=markdown', { waitUntil: 'commit' });
    await expect(input).toBeVisible();
    await expect(input).toBeDisabled();
  } finally {
    scripts.resolve();
  }
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue('markdown');
  await input.fill('notebook');
  await expect(page.getByRole('status')).toContainText("for 'notebook'");
  await expect(page).toHaveURL(/q=notebook/);
});

test('search treats HTML and script payloads as literal text on navigation and editing', async ({
  page
}) => {
  const payload = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  await page.goto(`/search?q=${encodeURIComponent(payload)}`);
  const input = page.getByRole('textbox', { name: 'Search', exact: true });
  const status = page.getByRole('status');
  await expect(input).toHaveValue(payload);
  await expect(status).toContainText(payload);
  await expect(status.locator('img, script')).toHaveCount(0);
  await input.fill('');
  await input.fill(payload);
  await expect(status).toContainText(payload);
  await expect(status.locator('img, script')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('q')).toBe(payload);
  expect(dialogs).toEqual([]);
});

test('footnote links return the reference below the sticky header', async ({ page }) => {
  await page.goto('/a-small-guide-to-markdown');
  const reference = page.getByRole('link', { name: '1', exact: true });
  await reference.click();
  await expect(page).toHaveURL(/#user-content-fn-notebook$/);
  await page.getByRole('link', { name: 'Back to reference 1', exact: true }).click();
  await expect(page).toHaveURL(/#user-content-fnref-notebook$/);
  const referenceTop = await reference.evaluate((element) => element.getBoundingClientRect().top);
  const headerBottom = await page
    .locator('body > header')
    .evaluate((element) => element.getBoundingClientRect().bottom);
  expect(
    referenceTop,
    'The returned reference must not be obscured by the sticky header'
  ).toBeGreaterThanOrEqual(headerBottom);
});

test('table of contents reveals its section below the header and tracks the current location', async ({
  page
}) => {
  await page.goto('/a-page-for-every-story');
  const summary = page.locator('.article-toc-mobile summary');
  if (await summary.isVisible()) await summary.click();
  const contents = page.locator('nav.article-toc:visible');
  const link = contents.getByRole('link', { name: 'A small ending', exact: true });
  await link.click();
  await expect(page).toHaveURL(/#a-small-ending$/);
  await expect(link).toHaveAttribute('aria-current', 'location');
  const heading = page.getByRole('heading', { name: 'A small ending', exact: true });
  const top = await heading.evaluate((element) => element.getBoundingClientRect().top);
  const bottom = await page
    .locator('body > header')
    .evaluate((element) => element.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(bottom);
});

test('a shared search URL hydrates and reloads while edits preserve unrelated URL state', async ({
  page
}) => {
  await page.goto('/search?q=markdown&from=reader#main-content');
  const input = page.getByRole('textbox', { name: 'Search', exact: true });
  await expect(input).toHaveValue('markdown');
  await expect(page.getByRole('status')).toContainText('1 result');
  await expect(
    page.getByRole('link', { name: 'A small guide to Markdown', exact: true })
  ).toBeVisible();
  await input.fill('notebook');
  await expect(page).toHaveURL(/q=notebook&from=reader#main-content$/);
  await page.reload();
  await expect(input).toHaveValue('notebook');
  await expect(
    page.getByRole('link', { name: 'A notebook of small patterns', exact: true })
  ).toBeVisible();
  await input.fill('');
  await expect(page).toHaveURL(/\/search\/?\?from=reader#main-content$/);
  await expect(page.getByRole('main').getByRole('heading', { level: 2 })).toHaveCount(0);
});
