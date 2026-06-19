import { test, expect } from '@playwright/test';

test.describe(
  'MPS-001: Login page assertions',
  {
    tag: '@MPS-001',
    annotation: {
      type: 'user story',
      description: 'MPS-001',
    },
  },
  () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('login page contains expected elements', async ({ page }) => {
      const username = page.getByPlaceholder('Username');
      const password = page.getByPlaceholder('Password');
      const loginButton = page.getByRole('button', { name: 'Login' });

      await expect(page).toHaveTitle(/OrangeHRM/);
      await expect(username).toBeVisible();
      await expect(username).toBeEditable();
      await expect(password).toBeVisible();
      await expect(password).toBeEditable();
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();
      await expect(page.getByText('Forgot your password?')).toBeVisible();
    });

    test('entered credentials appear in the fields', async ({ page }) => {
      const username = page.getByPlaceholder('Username');
      const password = page.getByPlaceholder('Password');

      await username.fill('Admin');
      await password.fill('admin123');

      await expect(username).toHaveValue('Admin');
      await expect(password).toHaveValue('admin123');
    });
  },
);