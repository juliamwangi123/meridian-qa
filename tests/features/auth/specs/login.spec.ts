// features/auth/specs/login.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { loginUsers } from '../data/loginData';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('A user can log in with valid credentials', async ({ page }) => {
    await loginPage.login(loginUsers.validUser.credentials);
    await expect(page).toHaveURL(/dashboard/);
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
    await expect(page).toHaveURL(/dashboard/);

    await page.locator('.oxd-userdropdown-img').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    await expect(loginPage.pageHeading).toBeVisible();
  });
});