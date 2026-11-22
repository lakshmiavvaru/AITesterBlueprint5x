import { Page } from '@playwright/test';
import { test, expect } from '../fixtures/test-fixtures';
import { LoginPage } from '../pages/LoginPage';
import { invalidData, messages, LOADING_CLASS } from '../utils/test-data';

/** Common checks: verified error is shown and the user stays on the login page (no dashboard access). */
async function expectAuthFailure(loginPage: LoginPage, page: Page): Promise<void> {
  await expect(loginPage.notificationMessage).toBeVisible();
  await expect(loginPage.notificationMessage).toHaveText(messages.authFailure);
  await expect(page).toHaveURL(/#\/login/);
  await expect(loginPage.loginForm).toBeVisible();
}

test.describe('VWO Login - negative scenarios', () => {
  test.afterEach(async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'final-url', description: page.url() });
  });

  test('unknown email with a wrong password shows the authentication error', async ({ loginPage, page }) => {
    await loginPage.login(invalidData.unknownEmail, invalidData.wrongPassword);
    await expectAuthFailure(loginPage, page);
  });

  test('invalid password shows the authentication error', async ({ loginPage, page }) => {
    // Without a valid account the server cannot distinguish "wrong password" from "unknown email";
    // the live app returns one generic message for both (verified).
    await loginPage.login(invalidData.unknownEmail, 'AnotherWrong#456');
    await expectAuthFailure(loginPage, page);
  });

  test('both credentials invalid shows the error and gives no dashboard access', async ({ loginPage, page }) => {
    await loginPage.login('wrong.user@example.org', 'Totally#Wrong9');
    await expectAuthFailure(loginPage, page);
  });

  test('empty email with a password is rejected', async ({ loginPage, page }) => {
    await loginPage.enterPassword(invalidData.wrongPassword);
    await loginPage.clickSignIn();
    await expectAuthFailure(loginPage, page);
  });

  test('empty password with an email is rejected', async ({ loginPage, page }) => {
    await loginPage.enterEmail(invalidData.unknownEmail);
    await loginPage.clickSignIn();
    await expectAuthFailure(loginPage, page);
  });

  test('both fields empty is rejected', async ({ loginPage, page }) => {
    await loginPage.clickSignIn();
    await expectAuthFailure(loginPage, page);
  });

  test('malformed email is flagged invalid by the browser and rejected on submit', async ({ loginPage, page }) => {
    await loginPage.enterEmail(invalidData.malformedEmail);
    await loginPage.enterPassword(invalidData.wrongPassword);
    await expect(loginPage.emailInput).toHaveJSProperty('validity.valid', false);
    await loginPage.clickSignIn();
    await expectAuthFailure(loginPage, page);
  });

  test('blur on an invalid email shows no inline message (PRD on-blur validation not implemented)', async ({ loginPage }) => {
    await loginPage.enterEmail(invalidData.malformedEmail);
    await loginPage.passwordInput.focus(); // blur the email field
    await expect(loginPage.emailInput).toHaveJSProperty('validity.valid', false);
    await expect(loginPage.notificationBox).toBeHidden();
  });

  test('password is masked by default', async ({ loginPage }) => {
    await loginPage.enterPassword(invalidData.wrongPassword);
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('loading state is shown on Sign in while authentication is in flight', async ({ loginPage, page }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    // Hold outgoing POST requests (the credential submission) so the in-flight state is observable deterministically.
    await page.route('**/*', async (route) => {
      if (route.request().method() === 'POST') await gate;
      await route.continue().catch(() => undefined);
    });

    await loginPage.enterEmail(invalidData.unknownEmail);
    await loginPage.enterPassword(invalidData.wrongPassword);
    await loginPage.clickSignIn();
    await expect(loginPage.signInButton).toHaveClass(LOADING_CLASS);

    release();
    await expect(loginPage.notificationMessage).toHaveText(messages.authFailure);
    await expect(loginPage.signInButton).not.toHaveClass(LOADING_CLASS);
  });

  test('Remember me does not bypass an authentication failure', async ({ loginPage, page }) => {
    await loginPage.login(invalidData.unknownEmail, invalidData.wrongPassword, true);
    await expectAuthFailure(loginPage, page);
  });
});
