import { expect, test } from '@playwright/test';
import { LoginPage } from '../../auth/pages/LoginPage';
import { LeavePage } from '../pages/LeavePage';

const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

function getFutureWorkingDay(
  daysAhead: number,
): Date {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysAhead);

  while (
    date.getDay() === 0 ||
    date.getDay() === 6
  ) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

function getProjectDateOffset(
  projectName: string,
): number {
  const offsets: Record<string, number> = {
    chromium: 30,
    firefox: 40,
    webkit: 50,
  };

  return offsets[projectName] ?? 60;
}

test.describe('MPS-003: Leave Management', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await loginPage.loginAndWaitForDashboard(
      VALID_USERNAME,
      VALID_PASSWORD,
    );
  });

  test('employee can navigate to the Leave module', async ({
    page,
  }) => {
    const leavePage = new LeavePage(page);

    await leavePage.openLeaveModule();

    await expect(
      leavePage.leaveListHeader,
    ).toBeVisible();
  });

  test('employee can view their leave balance', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const leavePage = new LeavePage(page);

    await leavePage.openLeaveModule();
    await leavePage.openApplyPage();

    const leaveType =
      await leavePage.selectFirstLeaveType();

    const balance =
      await leavePage.getLeaveBalance();

    expect(leaveType.length).toBeGreaterThan(0);
    expect(balance).toMatch(/\d/);
  });

  test('employee can submit a leave request with valid dates', async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);

    const leavePage = new LeavePage(page);

    await leavePage.openLeaveModule();
    await leavePage.openApplyPage();

    const selectedLeaveType =
      await leavePage.selectLeaveTypeWithPositiveBalance();

    const offset = getProjectDateOffset(
      testInfo.project.name,
    );

    const uniqueOffset =
      offset +
      testInfo.workerIndex +
      Math.floor(Date.now() / 1000) % 90;

    // A single-day request uses the same From and To date.
    const leaveDate = getFutureWorkingDay(uniqueOffset);

    const comment =
      `MPS-003 automated request - ` +
      `${testInfo.project.name} - ` +
      `${Date.now()}`;

    await leavePage.applyForLeave(
      leaveDate,
      leaveDate,
      comment,
    );

    await expect(
      leavePage.successToast,
    ).toBeVisible();

    await leavePage.openMyLeavePage();

    await leavePage.filterMyLeave(
      leaveDate,
      leaveDate,
    );

    await expect(
      leavePage.leaveRows.first(),
    ).toBeVisible();

    await expect(
      leavePage.leaveRows.first(),
    ).toContainText(selectedLeaveType.name);

    await expect(
      leavePage.leaveRows.first(),
    ).toContainText(
      /Pending Approval|Scheduled|Taken/i,
    );
  });
});