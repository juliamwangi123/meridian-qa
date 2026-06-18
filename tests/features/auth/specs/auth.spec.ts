import { expect, test } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../../dashboard/pages/DashboardPage';

const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

test.describe('MPS-001: User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
  });

  test('user can log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);

    await expect(page).toHaveURL(/dashboard/);
    expect(await dashboardPage.isLoaded()).toBe(true);
  });

  test('user cannot log in with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('invalid_user', 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.getErrorMessage()).not.toBe('');

    await expect(page).toHaveURL(/auth\/login/);
  });

  test('user cannot log in with an empty username', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('', VALID_PASSWORD);

    await expect(loginPage.usernameRequiredMessage).toBeVisible();
    expect(await loginPage.getUsernameValidationMessage()).not.toBe('');

    await expect(page).toHaveURL(/auth\/login/);
  });

  test('user cannot log in with an empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(VALID_USERNAME, '');

    await expect(loginPage.passwordRequiredMessage).toBeVisible();
    expect(await loginPage.getPasswordValidationMessage()).not.toBe('');

    await expect(page).toHaveURL(/auth\/login/);
  });

  test('logged-in user can log out successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);
    expect(await dashboardPage.isLoaded()).toBe(true);

    await dashboardPage.logout();

    await expect(page).toHaveURL(/auth\/login/);
    expect(await loginPage.isLoaded()).toBe(true);

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });
});