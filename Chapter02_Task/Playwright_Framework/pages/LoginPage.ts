import { Locator, Page, errors } from '@playwright/test';
import { LOGIN_URL } from '../utils/test-data';

/** Error that keeps the original cause and adds page-level diagnostics. */
export class LoginPageError extends Error {
  constructor(action: string, public readonly pageUrl: string, public readonly originalError: unknown) {
    const cause = originalError instanceof Error ? originalError.message : String(originalError);
    const kind = originalError instanceof errors.TimeoutError ? 'TIMEOUT' : 'FAILURE';
    super(`[LoginPage] ${kind} during "${action}" (url: ${pageUrl}). Cause: ${cause}`);
    this.name = 'LoginPageError';
    if (originalError instanceof Error) this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
  }
}

/**
 * Page Object for https://app.wingify.com/#/login.
 * XPath-only locators, all derived from the live DOM (inspected 2026-11-21).
 */
export class LoginPage {
  readonly page: Page;

  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordToggle: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly rememberMeLabel: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordButton: Locator;
  readonly forgotPasswordForm: Locator;
  readonly forgotPasswordEmailInput: Locator;
  readonly startFreeTrialLink: Locator;
  readonly notificationBox: Locator;
  readonly notificationMessage: Locator;
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginForm = page.locator('//form[@id="js-login-form"]');
    this.emailInput = page.locator('//input[@id="login-username"]');
    this.passwordInput = page.locator('//input[@id="login-password"]');
    this.passwordToggle = page.locator(
      '//form[@id="js-login-form"]//button[@aria-label="Toggle password visibility"]',
    );
    this.rememberMeCheckbox = page.locator('//input[@id="checkbox-remember"]');
    this.rememberMeLabel = page.locator('//label[@for="checkbox-remember"]');
    this.signInButton = page.locator('//button[@id="js-login-btn"]');
    this.forgotPasswordButton = page.locator(
      '//form[@id="js-login-form"]//button[normalize-space()="Forgot Password?"]',
    );
    this.forgotPasswordForm = page.locator('//form[@id="js-forgot-password-form"]');
    this.forgotPasswordEmailInput = page.locator('//input[@id="forgot-password-username"]');
    this.startFreeTrialLink = page.locator('//a[normalize-space()="Start a free trial"]');
    this.notificationBox = page.locator('//div[@id="js-notification-box"]');
    this.notificationMessage = page.locator('//div[@id="js-notification-box-msg"]');
    // PRD lists Light/Dark mode, but no such control exists in the inspected DOM.
    // These XPaths are availability probes only (expected to match nothing).
    this.themeToggle = page.locator(
      '//*[@aria-label="Toggle theme" or @aria-label="Dark mode" or @aria-label="Light mode"]',
    );
  }

  /** Verify an XPath resolves to exactly one element before interacting with it. */
  private async ensureUnique(locator: Locator, name: string): Promise<void> {
    const count = await locator.count();
    if (count !== 1) {
      throw new Error(`Locator "${name}" expected to match exactly 1 element but matched ${count}`);
    }
  }

  private async run<T>(action: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw new LoginPageError(action, this.page.url(), error);
    }
  }

  async open(): Promise<void> {
    await this.run('open login page', async () => {
      await this.page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
      // The login view is an AngularJS SPA; allow extra time for it to render under load.
      await this.emailInput.waitFor({ state: 'visible', timeout: 45_000 });
    });
  }

  async enterEmail(email: string): Promise<void> {
    await this.run('enter email', async () => {
      await this.ensureUnique(this.emailInput, 'emailInput');
      await this.emailInput.fill(email);
    });
  }

  async enterPassword(password: string): Promise<void> {
    await this.run('enter password', async () => {
      await this.ensureUnique(this.passwordInput, 'passwordInput');
      await this.passwordInput.fill(password);
    });
  }

  async setRememberMe(checked: boolean): Promise<void> {
    await this.run('set remember me', async () => {
      await this.ensureUnique(this.rememberMeCheckbox, 'rememberMeCheckbox');
      // The native input is visually hidden by the app's custom checkbox, so the visible label is the click target.
      if ((await this.rememberMeCheckbox.isChecked()) !== checked) {
        await this.rememberMeLabel.click();
      }
    });
  }

  async clickSignIn(): Promise<void> {
    await this.run('click sign in', async () => {
      await this.ensureUnique(this.signInButton, 'signInButton');
      await this.signInButton.click();
    });
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.run('toggle password visibility', () => this.passwordToggle.click());
  }

  async openForgotPassword(): Promise<void> {
    await this.run('open forgot password', () => this.forgotPasswordButton.click());
  }

  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    if (rememberMe) await this.setRememberMe(true);
    await this.clickSignIn();
  }

  /** Returns the visible authentication notification text (waits for it to appear). */
  async getAuthErrorMessage(): Promise<string> {
    return this.run('read authentication message', async () => {
      await this.notificationMessage.waitFor({ state: 'visible' });
      return (await this.notificationMessage.innerText()).trim();
    });
  }
}
