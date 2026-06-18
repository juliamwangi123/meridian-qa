import { type Locator, type Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  readonly dashboardHeader: Locator;
  readonly userDropdown: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboardHeader = page.getByRole('heading', {
      name: 'Dashboard',
    });

    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
  }

  async isLoaded(): Promise<boolean> {
    await this.dashboardHeader.waitFor({ state: 'visible' });

    return true;
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.logoutLink.click();
  }
}