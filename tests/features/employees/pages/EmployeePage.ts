// features/employees/pages/EmployeePage.ts

import { Page, Locator } from '@playwright/test';

export class EmployeePage {
  private readonly page: Page;
  private readonly pimLink: Locator;
  private readonly employeeListTab: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly tableRows: Locator;
  private readonly recordsCount: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pimLink         = page.getByRole('link', { name: 'PIM' });
    this.employeeListTab = page.getByRole('link', { name: 'Employee List' });
    this.searchInput     = page.getByRole('textbox', { name: 'Type for hints...' }).first();
    this.searchButton    = page.getByRole('button', { name: 'Search' });
    this.tableRows       = page.locator('.oxd-table-body .oxd-table-row');
    this.recordsCount    = page.locator('.oxd-text--span').filter({ hasText: 'Records Found' });
    this.pageHeading     = page.getByRole('heading', { name: 'Personal Details' });
  }

  async goto(): Promise<void> {
    await this.pimLink.click();
    await this.employeeListTab.click();
    await this.recordsCount.waitFor({ state: 'visible' });
  }

  async searchByName(name: string): Promise<void> {
    await this.searchInput.fill(name);
    await this.searchButton.click();
    await this.recordsCount.waitFor({ state: 'visible' });
  }

  async clickFirstEmployeeRow(): Promise<void> {
    await this.tableRows.first().click();
  }

  async getEmployeeListCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async getFirstResultText(): Promise<string> {
    await this.tableRows.first().waitFor({ state: 'visible' });
    const firstNameCell = this.tableRows.first().locator('div.oxd-table-cell').nth(2);
    return (await firstNameCell.textContent() ?? '').trim();
  }
}