// features/employees/specs/employees.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../auth/pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';
import { loginUsers } from '../../auth/data/loginData';
import { employeeData } from '../data/employeeData';

test.describe('Employees', () => {
  let loginPage: LoginPage;
  let employeePage: EmployeePage;

  test.beforeEach(async ({ page }) => {
    loginPage    = new LoginPage(page);
    employeePage = new EmployeePage(page);

    await loginPage.goto();
    await loginPage.login(loginUsers.validUser.credentials);
    await employeePage.goto();
  });

  test('An admin can view the employee list', async () => {
    const count = await employeePage.getEmployeeListCount();
    expect(count).toBeGreaterThan(0);
  });

  test('An admin can search for an employee by name', async () => {
    await employeePage.searchByName(employeeData.existingEmployee.name);
    const result = await employeePage.getFirstResultText();
    expect(result).toContain(employeeData.existingEmployee.name);
  });

  test('An admin can navigate to an individual employee profile', async ({ page }) => {
    await employeePage.searchByName(employeeData.existingEmployee.name);
    await employeePage.clickFirstEmployeeRow();
    await expect(page).toHaveURL(/viewPersonalDetails/);
  });
});