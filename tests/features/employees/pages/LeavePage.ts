// features/employees/pages/LeavePage.ts

import { Page, Locator } from '@playwright/test';

export class LeavePage {
  private readonly page: Page;
  private readonly LeaveLink: Locator;
  private readonly leavePageHeading: Locator;
//   private readonly ApplyLinkTab: Locator;
//   private readonly myLeaveHeading: Locator;
//   private readonly noLeaveBalanceText: Locator;
//   private readonly fromDateInput: Locator;
//   private readonly toDateInput: Locator;
//   private readonly submitButton: Locator;
//   private readonly myLeaveTab: Locator;
//   private readonly leaveRequestRow: Locator;


  constructor(page: Page) {
    this.page = page;
    this.LeaveLink = page.getByRole('link', { name: 'Leave', exact: true })
    this.leavePageHeading= page.getByRole('heading', { name: 'Leave', exact: true });
    // this.ApplyLinkTab = page.getByRole('link', { name: 'Apply' });
    // // this.myLeaveHeading = page.getByRole('heading', { name: 'Apply Leave' })
    // this.noLeaveBalanceText = page.getByText('No Leave Types with Leave Balance');
    // this.fromDateInput = page.locator('input[placeholder="From Date"]');
    // this.toDateInput = page.locator('input[placeholder="To Date"]');
    // this.submitButton = page.getByRole('button', { name: 'Submit' });
    // this.myLeaveTab = page.getByRole('link', { name: 'My Leave' });
    // this.leaveRequestRow = page.locator('table tbody tr').first();
  }

  async goto(): Promise<void> {
    await this.LeaveLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.LeaveLink.click(); 
    await this.page.waitForLoadState('networkidle');
  }
   
  async isLeavePageHeaderVisible(): Promise<boolean> {
    return await this.leavePageHeading.isVisible();
  }

//   async clickApplyTab(): Promise<void> {
//     await this.ApplyLink.click();
//     await this.page.waitForLoadState('networkidle');
//   }

//   async isNoLeaveBalanceTextVisible(): Promise<boolean> {
//     return await this.noLeaveBalanceText.isVisible();
//   }

//   async fillFromDate(date: string): Promise<void> {
//     await this.fromDateInput.click();
//     await this.fromDateInput.fill(date);
//   }

//   async fillToDate(date: string): Promise<void> {
//     await this.toDateInput.click();
//     await this.toDateInput.fill(date);
//   }

//   async submitLeaveRequest(): Promise<void> {
//     await this.submitButton.click();
//     await this.page.waitForLoadState('networkidle');
//   }

//   async goToMyLeaveTab(): Promise<void> {
//     await this.myLeaveTab.click();
//     await this.page.waitForLoadState('networkidle');
//   }

//   async isLeaveRequestVisible(): Promise<boolean> {
//     return await this.leaveRequestRow.isVisible();
//   }
  
}