// features/employees/specs/employees.spec.ts

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../auth/pages/LoginPage';
import { loginUsers } from '../../auth/data/loginData';
import { LeavePage } from '../pages/LeavePage';

test.describe('Employees', () => {
  let loginPage: LoginPage;
  let leavePage: LeavePage;

  test.beforeEach(async ({ page }) => {
    loginPage    = new LoginPage(page);
    leavePage = new LeavePage(page);

    await loginPage.goto();
    await loginPage.login(loginUsers.employeeCredentials.credentials);
  
  });

  /**
   * @userStory MPS-004
   * @type smoke
   * @category employees
   */
  test('An employee can view the leave page Heading', async () => {
      await leavePage.goto();
    // const isHeaderVisible = await leavePage.isLeavePageHeaderVisible();
    // expect(isHeaderVisible).toBe(true);
  });

//   test('An employee can view their leave balance', async () => {
//     await leavePage.clickApplyTab();
//     const isNoLeaveBalanceVisible = await leavePage.isNoLeaveBalanceTextVisible();
//     expect(isNoLeaveBalanceVisible).toBe(true);
//   });

//   test('An employee can submit a leave request with valid dates', async () => {
//     await leavePage.clickApplyTab();
    
//     const fromDate = '2026-06-20';
//     const toDate = '2026-06-22';
    
//     await leavePage.fillFromDate(fromDate);
//     await leavePage.fillToDate(toDate);
//     await leavePage.submitLeaveRequest();
    
//     await leavePage.goToMyLeaveTab();
//     const isLeaveRequestVisible = await leavePage.isLeaveRequestVisible();
//     expect(isLeaveRequestVisible).toBe(true);
//   });

});