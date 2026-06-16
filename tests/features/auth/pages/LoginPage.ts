// features/auth/pages/LoginPage.ts

import { Page, Locator } from '@playwright/test';
import type { LoginCredentials } from '../../../types'; 

export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorAlert: Locator;
  private readonly usernameError: Locator;
  private readonly passwordError: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton   = page.getByRole('button',  { name: 'Login' });
    this.errorAlert    = page.getByText('Invalid credentials');
    this.usernameError = page.getByText('Required').first();
    this.passwordError = page.getByText('Required').last();
    this.pageHeading   = page.getByRole('heading', { name: 'Login' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/web/index.php/auth/login');
  }

  private async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  private async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  private async clickLoginButton(): Promise<void> {
    await this.loginButton.click();
  }

  async login(credentials: LoginCredentials): Promise<void> {
    await this.fillUsername(credentials.username);
    await this.fillPassword(credentials.password);
    await this.clickLoginButton();
  }

  async loginWithEmptyPassword(username: string): Promise<void> {
    await this.fillUsername(username);
    await this.clickLoginButton();
  }

  async loginWithEmptyUsername(password: string): Promise<void> {
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorAlert.textContent() ?? '').trim();
  }

  async getUsernameValidationMessage(): Promise<string> {
    return (await this.usernameError.textContent() ?? '').trim();
  }

  async getPasswordValidationMessage(): Promise<string> {
    return (await this.passwordError.textContent() ?? '').trim();
  }
}