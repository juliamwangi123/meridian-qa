import { test, expect } from '@playwright/test';

test('OrangeHRM loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/OrangeHRM/);
});