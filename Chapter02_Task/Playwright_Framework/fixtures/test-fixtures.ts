import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type Fixtures = {
  /** LoginPage already navigated to the login screen. */
  loginPage: LoginPage;
  /** Auto fixture: attaches browser logs, URL and screenshot to the report on failure. */
  diagnostics: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },

  diagnostics: [
    async ({ page }, use, testInfo) => {
      const logs: string[] = [];
      page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
      page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
      page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText ?? ''}`));

      await use();

      if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('browser-logs', { body: logs.join('\n') || 'no logs', contentType: 'text/plain' });
        await testInfo.attach('diagnostics', {
          body: `url: ${page.url()}\nstatus: ${testInfo.status}\nbrowser: ${testInfo.project.name}`,
          contentType: 'text/plain',
        });
        try {
          await testInfo.attach('failure-screenshot', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
        } catch (error) {
          await testInfo.attach('screenshot-error', { body: String(error), contentType: 'text/plain' });
        }
      }
    },
    { auto: true },
  ],
});

export { expect };
