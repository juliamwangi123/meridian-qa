

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { loginUsers } from '../data/loginData';
import { DashboardPage } from '../../dashboard/pages/DashboardPage';

test.describe('Login', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('A user can log in with valid credentials', async ({ page }) => {
    await loginPage.login(loginUsers.validUser.credentials);
    // await expect(page).toHaveURL(/login/);
    // await expect(page).toHaveURL(/dashboard/);
    await dashboardPage.goto();
    await expect(dashboardPage.isLoaded()).resolves.toBe(true);
  });

  test('A user cannot log in with invalid credentials', async () => {
    await loginPage.login(loginUsers.invalidUser.credentials);
    const error = await loginPage.getErrorMessage();
    expect(error).toBe(loginUsers.invalidUser.expectedError);
  });

  test('A user cannot log in with an empty username', async () => {
    await loginPage.loginWithEmptyUsername(loginUsers.emptyUsername.credentials.password);
    const error = await loginPage.getUsernameValidationMessage();
    expect(error).toBe(loginUsers.emptyUsername.expectedError);
  });

  test('A user cannot log in with an empty password', async () => {
    await loginPage.loginWithEmptyPassword(loginUsers.emptyPassword.credentials.username);
    const error = await loginPage.getPasswordValidationMessage();
    expect(error).toBe(loginUsers.emptyPassword.expectedError);
  });

  test('A logged-in user can log out successfully', async ({ page }) => {
    await loginPage.login(loginUsers.validUser.credentials);
    // await expect(page).toHaveURL(/dashboard/);
    // await page.locator('.oxd-userdropdown-img').click();
    // await page.getByRole('menuitem', { name: 'Logout' }).click();
     await page.waitForLoadState('networkidle');
      await dashboardPage.goto();
      expect(await dashboardPage.isLoaded()).toBe(true);
      await dashboardPage.logout();
      await expect(loginPage.pageHeading).toBeVisible();
  });
});