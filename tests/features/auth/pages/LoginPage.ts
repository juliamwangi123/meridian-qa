import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  readonly usernameRequiredMessage: Locator;
  readonly passwordRequiredMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.oxd-alert-content-text');

    const usernameGroup = page
      .locator('.oxd-input-group')
      .filter({ has: this.usernameInput });

    const passwordGroup = page
      .locator('.oxd-input-group')
      .filter({ has: this.passwordInput });

    this.usernameRequiredMessage = usernameGroup.locator(
      '.oxd-input-field-error-message',
    );

    this.passwordRequiredMessage = passwordGroup.locator(
      '.oxd-input-field-error-message',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAndWaitForDashboard(
    username: string,
    password: string,
  ): Promise<void> {
    await Promise.all([
      this.page.waitForURL(/dashboard/, { timeout: 30_000 }),
      this.login(username, password),
    ]);

    await this.page
      .getByRole('heading', { name: 'Dashboard' })
      .waitFor({ state: 'visible', timeout: 30_000 });

    await this.page
      .locator('.oxd-layout-loader')
      .waitFor({ state: 'hidden', timeout: 30_000 })
      .catch(() => undefined);
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent())?.trim() ?? '';
  }

  async getUsernameValidationMessage(): Promise<string> {
    return (await this.usernameRequiredMessage.textContent())?.trim() ?? '';
  }

  async getPasswordValidationMessage(): Promise<string> {
    return (await this.passwordRequiredMessage.textContent())?.trim() ?? '';
  }

  async isLoaded(): Promise<boolean> {
    await this.loginButton.waitFor({ state: 'visible' });

    return true;
  }
}