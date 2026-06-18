import {
  expect,
  type Locator,
  type Page,
} from '@playwright/test';

export type LeaveTypeDetails = {
  name: string;
  balanceText: string;
  balance: number;
};

export class LeavePage {
  readonly page: Page;
  private selectedLeaveTypeName?: string;

  readonly leaveMenu: Locator;
  readonly leaveListHeader: Locator;

  readonly applyNavigationItem: Locator;
  readonly myLeaveNavigationItem: Locator;

  readonly applyLeaveHeader: Locator;
  readonly myLeaveHeader: Locator;

  readonly leaveTypeSelect: Locator;
  readonly leaveBalanceText: Locator;

  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly commentInput: Locator;

  readonly applyButton: Locator;
  readonly searchButton: Locator;

  readonly successToast: Locator;
  readonly leaveRows: Locator;

  readonly noLeaveTypesMessage: Locator;
  readonly formLoader: Locator;

  constructor(page: Page) {
    this.page = page;

    this.leaveMenu = page.getByRole('link', {
      name: 'Leave',
      exact: true,
    });

    this.leaveListHeader = page.getByRole('heading', {
      name: 'Leave List',
    });

    // OrangeHRM top navigation items do not always expose
    // reliable accessible roles, so scoped CSS is used.
    this.applyNavigationItem = page
      .locator('.oxd-topbar-body-nav-tab-item')
      .filter({ hasText: /^Apply$/ });

    this.myLeaveNavigationItem = page
      .locator('.oxd-topbar-body-nav-tab-item')
      .filter({ hasText: /^My Leave$/ });

    this.applyLeaveHeader = page.getByRole('heading', {
      name: 'Apply Leave',
    });

    this.myLeaveHeader = page.getByRole('heading', {
      name: /My Leave/,
    });

    const leaveTypeGroup = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Leave Type' });

    this.leaveTypeSelect = leaveTypeGroup.locator(
      '.oxd-select-text',
    );

    this.leaveBalanceText = page.locator(
      '.orangehrm-leave-balance-text',
    );

    const fromDateGroup = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'From Date' });

    const toDateGroup = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'To Date' });

    this.fromDateInput = fromDateGroup.locator('input');
    this.toDateInput = toDateGroup.locator('input');

    this.commentInput = page.locator('textarea');

    this.applyButton = page.getByRole('button', {
      name: 'Apply',
      exact: true,
    });

    this.searchButton = page.getByRole('button', {
      name: 'Search',
      exact: true,
    });

    this.successToast = page
      .locator('.oxd-toast')
      .filter({
        hasText: /Success|Successfully/i,
      });

    this.leaveRows = page.locator(
      '.oxd-table-body .oxd-table-card',
    );

    this.noLeaveTypesMessage = page.getByText(
      'No Leave Types with Leave Balance',
    );

    this.formLoader = page.locator('.oxd-form-loader');
  }

  async openLeaveModule(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewLeaveList');

    await expect(this.leaveListHeader).toBeVisible();
    await expect(this.page).toHaveURL(/leave\/viewLeaveList/);
  }

  async openApplyPage(): Promise<void> {
    await this.ensureLeaveEntitlement();
    await this.page.goto('/web/index.php/leave/applyLeave');

    await expect(this.applyLeaveHeader).toBeVisible();
    await expect(this.page).toHaveURL(/leave\/applyLeave/);
    await this.waitForApplyFormReady();
  }

  async ensureLeaveEntitlement(
    entitlementDays = 50,
  ): Promise<void> {
    const entitlementsResponse = await this.page.request.get(
      '/web/index.php/api/v2/leave/leave-entitlements?limit=1',
    );

    const entitlementsBody = await entitlementsResponse.json();
    const empNumber = entitlementsBody.meta?.empNumber;
    const fromDate = entitlementsBody.meta?.fromDate;
    const toDate = entitlementsBody.meta?.toDate;

    if (
      empNumber == null ||
      fromDate == null ||
      toDate == null
    ) {
      throw new Error(
        'Could not resolve leave entitlement metadata for the logged-in employee.',
      );
    }

    const typesResponse = await this.page.request.get(
      '/web/index.php/api/v2/leave/leave-types?limit=50',
    );
    const typesBody = await typesResponse.json();

    const leaveType = typesBody.data?.find(
      (item: { name: string }) =>
        item.name === 'US - Vacation',
    ) ?? typesBody.data?.[0];

    if (!leaveType?.id) {
      throw new Error(
        'No leave types are configured in OrangeHRM.',
      );
    }

    const existingBalance = await this.getLeaveBalanceFromApi(
      leaveType.id,
    );

    if (existingBalance > 0) {
      return;
    }

    const createResponse = await this.page.request.post(
      '/web/index.php/api/v2/leave/leave-entitlements',
      {
        data: {
          empNumber,
          entitlement: entitlementDays,
          fromDate,
          toDate,
          leaveTypeId: leaveType.id,
        },
      },
    );

    if (!createResponse.ok()) {
      throw new Error(
        `Failed to create leave entitlement: ${createResponse.status()} ${await createResponse.text()}`,
      );
    }

    await expect
      .poll(
        async () =>
          this.getLeaveBalanceFromApi(leaveType.id),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);
  }

  private async getLeaveBalanceFromApi(
    leaveTypeId: number,
  ): Promise<number> {
    const balanceResponse = await this.page.request.get(
      `/web/index.php/api/v2/leave/leave-balance/leave-type/${leaveTypeId}`,
    );
    const balanceBody = await balanceResponse.json();
    const balanceDetails = balanceBody.data?.balance;

    if (
      balanceDetails &&
      typeof balanceDetails === 'object'
    ) {
      return Number(balanceDetails.balance ?? 0);
    }

    return Number(balanceDetails ?? 0);
  }

  private async waitForApplyFormReady(): Promise<void> {
    await this.formLoader
      .waitFor({ state: 'hidden', timeout: 30_000 })
      .catch(() => undefined);

    const leaveTypeVisible = await this.leaveTypeSelect
      .isVisible()
      .catch(() => false);

    if (!leaveTypeVisible) {
      await expect(this.noLeaveTypesMessage).toBeVisible({
        timeout: 10_000,
      });

      throw new Error(
        'No leave types with balance are available for this account. ' +
          'Assign leave entitlements before running leave balance tests.',
      );
    }

    await expect(this.leaveTypeSelect).toBeVisible();
    await expect(this.leaveTypeSelect).toBeEnabled();
  }

  async openMyLeavePage(): Promise<void> {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');

    await expect(this.myLeaveHeader).toBeVisible();
    await expect(this.page).toHaveURL(/leave\/viewMyLeaveList/);
  }

  async selectFirstLeaveType(): Promise<string> {
    await this.waitForApplyFormReady();

    const details =
      await this.trySelectLeaveType('US - Vacation');

    if (details) {
      return details.name;
    }

    await this.leaveTypeSelect.click();

    const options = this.page.locator(
      '.oxd-select-dropdown .oxd-select-option',
    );

    // The first option normally contains the Select placeholder.
    await expect(options.nth(1)).toBeVisible();

    const selectedType = (
      await options.nth(1).innerText()
    ).trim();

    if (!selectedType) {
      throw new Error(
        'No eligible leave type is available for this account.',
      );
    }

    await options.nth(1).click();
    this.selectedLeaveTypeName = selectedType;

    await expect(this.leaveBalanceText).toBeVisible();

    return selectedType;
  }

  async selectLeaveTypeWithPositiveBalance():
    Promise<LeaveTypeDetails> {
    await this.waitForApplyFormReady();

    const preferredTypes = ['US - Vacation'];

    for (const preferredType of preferredTypes) {
      const details = await this.trySelectLeaveType(
        preferredType,
      );

      if (details) {
        return details;
      }
    }

    await this.leaveTypeSelect.click();

    const options = this.page.locator(
      '.oxd-select-dropdown .oxd-select-option',
    );

    await expect(options.nth(1)).toBeVisible();

    const optionCount = await options.count();

    for (let index = 1; index < optionCount; index += 1) {
      const optionName = (
        await options.nth(index).innerText()
      ).trim();

      if (
        !optionName ||
        optionName.toLowerCase() === 'select'
      ) {
        continue;
      }

      const details = await this.trySelectLeaveType(
        optionName,
      );

      if (details) {
        return details;
      }
    }

    throw new Error(
      'The available leave types do not have a positive balance. A valid leave entitlement is required before the request test can pass.',
    );
  }

  private async trySelectLeaveType(
    optionName: string,
  ): Promise<LeaveTypeDetails | null> {
    await this.leaveTypeSelect.click();

    const option = this.page
      .locator('.oxd-select-dropdown .oxd-select-option')
      .filter({ hasText: optionName })
      .first();

    if (!(await option.isVisible())) {
      await this.page.keyboard.press('Escape');
      return null;
    }

    await option.click();
    this.selectedLeaveTypeName = optionName;

    try {
      await expect(this.leaveBalanceText).toBeVisible({
        timeout: 5_000,
      });

      await expect
        .poll(async () => {
          const balanceText = (
            await this.leaveBalanceText.innerText()
          ).trim();

          const numericText = balanceText
            .replaceAll(',', '')
            .match(/-?\d+(?:\.\d+)?/);

          return Number(numericText?.[0] ?? 0);
        })
        .toBeGreaterThan(0);

      const balanceText = (
        await this.leaveBalanceText.innerText()
      ).trim();

      const numericText = balanceText
        .replaceAll(',', '')
        .match(/-?\d+(?:\.\d+)?/);

      const balance = Number(numericText?.[0] ?? 0);

      return {
        name: optionName,
        balanceText,
        balance,
      };
    } catch {
      return null;
    }
  }

  async getLeaveBalance(): Promise<string> {
    await expect(this.leaveBalanceText).toBeVisible();

    const renderedBalance = await expect
      .poll(
        async () =>
          (await this.leaveBalanceText.innerText()).trim(),
        { timeout: 5_000 },
      )
      .toMatch(/\d/)
      .then(async () =>
        (await this.leaveBalanceText.innerText()).trim(),
      )
      .catch(() => '');

    if (renderedBalance) {
      return renderedBalance;
    }

    const selectedType =
      this.selectedLeaveTypeName ??
      (await this.leaveTypeSelect.innerText()).trim();

    const leaveTypeId =
      await this.getLeaveTypeIdByName(selectedType);

    const balance =
      await this.getLeaveBalanceFromApi(leaveTypeId);

    return String(balance);
  }

  private async getLeaveTypeIdByName(
    leaveTypeName: string,
  ): Promise<number> {
    const typesResponse = await this.page.request.get(
      '/web/index.php/api/v2/leave/leave-types?limit=50',
    );
    const typesBody = await typesResponse.json();

    const leaveType = typesBody.data?.find(
      (item: { id: number; name: string }) =>
        item.name === leaveTypeName,
    );

    if (!leaveType?.id) {
      throw new Error(
        `Could not resolve leave type ID for "${leaveTypeName}".`,
      );
    }

    return leaveType.id;
  }

  async applyForLeave(
    fromDate: Date,
    toDate: Date,
    comment: string,
  ): Promise<void> {
    await this.fillDateInput(
      this.fromDateInput,
      fromDate,
    );

    await this.fillDateInput(
      this.toDateInput,
      toDate,
    );

    if (await this.commentInput.isVisible()) {
      await this.commentInput.fill(comment);
    }

    const applyResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v2/leave/leave-requests') &&
        response.request().method() === 'POST',
    );

    await this.applyButton.click();
    await applyResponse;
  }

  async filterMyLeave(
    fromDate: Date,
    toDate: Date,
  ): Promise<void> {
    await this.fillDateInput(
      this.fromDateInput,
      fromDate,
    );

    await this.fillDateInput(
      this.toDateInput,
      toDate,
    );

    await this.searchButton.click();
  }

  private async fillDateInput(
    input: Locator,
    date: Date,
  ): Promise<void> {
    const placeholder =
      (await input.getAttribute('placeholder')) ??
      'yyyy-mm-dd';

    const value = this.formatDateForPlaceholder(
      date,
      placeholder,
    );

    await input.fill(value);
    await input.press('Tab');
  }

  private formatDateForPlaceholder(
    date: Date,
    placeholder: string,
  ): string {
    const year = date.getFullYear().toString();

    const month = (date.getMonth() + 1)
      .toString()
      .padStart(2, '0');

    const day = date
      .getDate()
      .toString()
      .padStart(2, '0');

    const tokens: Record<string, string> = {
      yyyy: year,
      mm: month,
      dd: day,
    };

    return placeholder
      .toLowerCase()
      .replace(/yyyy|mm|dd/g, (token) => tokens[token]);
  }
}