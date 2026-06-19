import { expect, test } from '@playwright/test';
import { LoginPage } from '../../auth/pages/LoginPage';


const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

test.describe(
  'MPS-002: Employee Management',
  {
    tag: '@MPS-002',
    annotation: {
      type: 'user story',
      description: 'MPS-002',
    },
  },
  () => {
    test.beforeEach(async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(
        VALID_USERNAME,
        VALID_PASSWORD,
      );

      await page.goto('/web/index.php/pim/viewEmployeeList');

      await expect(page).toHaveURL(/pim\/viewEmployeeList/);

      await page
        .locator('.oxd-layout-loader')
        .waitFor({ state: 'hidden', timeout: 30_000 })
        .catch(() => undefined);

      await expect(
        page.locator('.oxd-table-body .oxd-table-card').first(),
      ).toBeVisible({ timeout: 30_000 });
    });

    test('admin can view the employee list', async ({ page }) => {
      const employeeRows = page.locator(
        '.oxd-table-body .oxd-table-card',
      );

      await expect(employeeRows.first()).toBeVisible();

      const employeeCount = await employeeRows.count();

      expect(employeeCount).toBeGreaterThan(0);
    });

    test('admin can search for an employee by name', async ({ page }) => {
      const employeeRows = page.locator(
        '.oxd-table-body .oxd-table-card',
      );

      await expect(employeeRows.first()).toBeVisible();

      const firstRow = employeeRows.first();
      const cells = firstRow.locator('.oxd-table-cell');

      const employeeFirstName = (
        await cells.nth(2).innerText()
      ).trim();

      expect(employeeFirstName.length).toBeGreaterThan(0);

      const employeeNameInput = page
        .locator('.oxd-input-group')
        .filter({ hasText: 'Employee Name' })
        .getByPlaceholder('Type for hints...');

      await employeeNameInput.fill(employeeFirstName);

      const suggestion = page
        .locator('.oxd-autocomplete-option')
        .filter({ hasText: employeeFirstName })
        .first();

      await expect(suggestion).toBeVisible();
      await suggestion.click();

      await page.getByRole('button', { name: 'Search' }).click();

      await expect(employeeRows.first()).toBeVisible();
      await expect(employeeRows.first()).toContainText(
        employeeFirstName,
      );
    });

    test('admin can navigate to an employee profile', async ({ page }) => {
      const employeeRows = page.locator(
        '.oxd-table-body .oxd-table-card',
      );

      await expect(employeeRows.first()).toBeVisible();

      const firstEmployeeRow = employeeRows.first();

      const editButton = firstEmployeeRow.locator(
        'button:has(i.bi-pencil-fill)',
      );

      await expect(editButton).toBeVisible();
      await editButton.click();

      await expect(page).toHaveURL(
        /pim\/viewPersonalDetails\/empNumber\//,
      );

      await expect(
        page.getByRole('heading', { name: 'Personal Details' }),
      ).toBeVisible();
    });
  },
);