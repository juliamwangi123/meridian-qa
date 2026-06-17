import { Locator, Page } from "@playwright/test";

export class DashboardPage {
      private readonly page: Page;
    //   private readonly dashboardLink: Locator;
      private readonly dashboardHeading: Locator;
      private readonly  dropdownMenu: Locator;
      private readonly logoutButtonMenuItem: Locator;

      constructor(page: Page) {
        this.page = page;
        // this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
        this.dropdownMenu = page.locator('.oxd-userdropdown-img');
        this.logoutButtonMenuItem = page.getByRole('menuitem', { name: 'Logout' });
      }
      async goto(): Promise<void> {
    await this.page.goto('/web/index.php/dashboard/index');
    await this.dashboardHeading.waitFor({ state: 'visible', timeout: 30000 });
    }

        async isLoaded(): Promise<boolean> {
         return await this.dashboardHeading.isVisible();
        }
        
        async logout(): Promise<boolean> {
            await this.dropdownMenu.click();
            await this.logoutButtonMenuItem.click();
            return !await this.dashboardHeading.isVisible();
        }
      
}