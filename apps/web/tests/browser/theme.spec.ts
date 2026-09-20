import { expect, test } from '@playwright/test';

test('theme toggle stays borderless, shows the target theme, and supports keyboard focus', async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const button = page.locator('#theme-btn');
  for (const target of ['dark', 'light'] as const) {
    await expect(button).toHaveAccessibleName(`Switch to ${target} theme`);
    await expect(button.locator('svg:visible')).toHaveCount(1);
    await expect(button.locator('svg:visible circle')).toHaveCount(target === 'light' ? 1 : 0);
    await button.hover();
    const style = await button.evaluate((element) => {
      const css = getComputedStyle(element);
      const { width, height } = element.getBoundingClientRect();
      return {
        background: css.backgroundColor,
        border: css.borderWidth,
        width,
        height
      };
    });
    expect(style.background).toBe('rgba(0, 0, 0, 0)');
    expect(style.border).toBe('0px');
    expect(style.width).toBeGreaterThanOrEqual(44);
    expect(style.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press('Tab');
    await button.focus();
    expect(await button.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none'
    );
    await button.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', target);
  }
});

test('system changes apply until the reader chooses a theme, which survives a new page', async ({
  page,
  context
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  const lightBackground = await page
    .locator('body')
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  await expect
    .poll(() =>
      page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor)
    )
    .not.toBe(lightBackground);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  const secondPage = await context.newPage();
  await secondPage.emulateMedia({ colorScheme: 'dark' });
  await secondPage.goto('/archive');
  await expect(secondPage.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await expect
    .poll(() =>
      secondPage.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor)
    )
    .toBe(lightBackground);
});

test('blocked browser storage still permits theme changes without script errors', async ({
  page
}) => {
  // Storage denial is a browser boundary; the real theme script and DOM still run.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      }
    });
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  expect(errors).toEqual([]);
});
