import { test, expect } from '../fixtures/test-fixtures';
import { hasValidCredentials, validCredentials } from '../utils/test-data';

test.describe('VWO Login - positive scenarios', () => {
  test.afterEach(async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'final-url', description: page.url() });
  });

  test('login page loads at the expected URL', async ({ loginPage, page }) => {
    await expect(page).toHaveURL(/#\/login/);
    await expect(page).toHaveTitle(/Login/);
    await expect(loginPage.loginForm).toBeVisible();
  });

  test('login page shows email, password, remember me, sign in and helper links', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.rememberMeLabel).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
    await expect(loginPage.signInButton).toBeEnabled();
    await expect(loginPage.forgotPasswordButton).toBeVisible();
    await expect(loginPage.startFreeTrialLink).toBeVisible();
  });

  test('email field accepts input and is auto-focused on load (PRD: auto-focus)', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeFocused();
    await loginPage.enterEmail('qa.user@example.com');
    await expect(loginPage.emailInput).toHaveValue('qa.user@example.com');
  });

  test('password field accepts input and can be revealed via toggle', async ({ loginPage }) => {
    await loginPage.enterPassword('Sample#Pass1');
    await expect(loginPage.passwordInput).toHaveValue('Sample#Pass1');
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
    await loginPage.togglePasswordVisibility();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('Remember me checkbox can be checked and unchecked', async ({ loginPage }) => {
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
    await loginPage.setRememberMe(true);
    await expect(loginPage.rememberMeCheckbox).toBeChecked();
    await loginPage.setRememberMe(false);
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });

  test('clicking the Remember me label toggles the checkbox (PRD: clickable labels)', async ({ loginPage }) => {
    await loginPage.rememberMeLabel.click();
    await expect(loginPage.rememberMeCheckbox).toBeChecked();
  });

  test('Forgot Password opens the reset form', async ({ loginPage }) => {
    await loginPage.openForgotPassword();
    await expect(loginPage.forgotPasswordForm).toBeVisible();
    await expect(loginPage.forgotPasswordEmailInput).toBeVisible();
    await expect(loginPage.loginForm).toBeHidden();
  });

  test('Start a free trial link targets the free-trial page in a new tab', async ({ loginPage }) => {
    await expect(loginPage.startFreeTrialLink).toHaveAttribute('href', /wingify\.com\/free-trial\//);
    await expect(loginPage.startFreeTrialLink).toHaveAttribute('target', '_blank');
  });

  test('keyboard navigation: Tab moves email to password and Enter submits the form', async ({ loginPage, page }) => {
    await expect(loginPage.emailInput).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
    await page.keyboard.press('Enter');
    // Enter triggers the same handler as the Sign in button (empty submit shows the notification).
    await expect(loginPage.notificationMessage).toBeVisible();
  });

  test('login page is usable at mobile viewport (PRD: responsive design)', async ({ loginPage, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('Light/Dark mode control is not exposed on the login page (PRD item not implemented)', async ({ loginPage }) => {
    // PRD lists theme support; no theme control exists in the inspected DOM, so assert the verified absence.
    await expect(loginPage.themeToggle).toHaveCount(0);
  });

  test.describe('authenticated flow (requires VWO_EMAIL / VWO_PASSWORD)', () => {
    test.skip(!hasValidCredentials(), 'Requires test data: set VWO_EMAIL and VWO_PASSWORD in .env');

    test('valid credentials redirect to the dashboard', async ({ loginPage, page }) => {
      await loginPage.login(validCredentials.email, validCredentials.password);
      await expect(page).not.toHaveURL(/#\/login/, { timeout: 45_000 });
      await expect(loginPage.loginForm).toBeHidden();
    });

    test('login with Remember me selected succeeds', async ({ loginPage, page }) => {
      await loginPage.login(validCredentials.email, validCredentials.password, true);
      await expect(page).not.toHaveURL(/#\/login/, { timeout: 45_000 });
    });
  });
});
