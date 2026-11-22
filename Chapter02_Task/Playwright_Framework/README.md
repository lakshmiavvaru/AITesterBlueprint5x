# VWO Playwright Automation

Playwright + TypeScript + Allure framework for the VWO login page (`https://app.wingify.com/#/login`), built from `Task_PLaywright_Framework/Real_prompt_Playwright_RICEPOT.md` and the VWO Login Dashboard PRD.

## Structure
```
pages/LoginPage.ts          Page Object (XPath-only locators, structured error handling)
fixtures/test-fixtures.ts   loginPage fixture + auto diagnostics fixture (logs/screenshot on failure)
utils/test-data.ts          Test data, verified messages, env-based credentials
tests/login-valid.spec.ts   Positive / PRD scenarios
tests/login-invalid.spec.ts Negative scenarios
```

## Setup
```bash
npm install
npx playwright install        # or: npm run install:browsers
cp .env.example .env          # then fill VWO_EMAIL / VWO_PASSWORD (optional)
```

## Commands
| Purpose | Command |
|---|---|
| All tests, all browsers | `npm test` |
| Valid-login tests only | `npm run test:valid` |
| Invalid-login tests only | `npm run test:invalid` |
| Chromium only | `npm run test:chromium` |
| Headed | `npm run test:headed` |
| Debug | `npm run test:debug` |
| Generate Allure HTML report | `npm run allure:generate` |
| Open Allure report | `npm run allure:open` |

Allure results are written to `allure-results/` on every run. Generating the HTML report needs Java (Allure CLI requirement).

## Verified application behavior (inspected 2026-11-21)
- Locators are XPath on stable `id` attributes; the `data-qa` values are opaque and were not used.
- Every failed attempt, including empty fields, shows one notification: "Your email, password, IP address or location did not match".
- No inline per-field validation exists. The email input is `type=email`, so the browser flags a malformed value as invalid, but the app shows no message on blur.
- The Sign in button gets the class `is-in-action` while a request is in flight.
- The native Remember me checkbox is visually hidden, so the label is the click target.

## PRD items not verifiable / not implemented
- **Light/Dark mode**: no theme control exists on the login page. A test asserts its absence.
- **Password strength indicator, MFA, SSO, rate limiting, HTTPS enforcement, encryption, GDPR**: not automated here. UI tests cannot prove backend security properties.
- **Successful login**: needs real test credentials. Without `VWO_EMAIL` / `VWO_PASSWORD` the two authenticated tests are skipped. Credentials are never hardcoded.
- The PRD names `app.vwo.com`. The URL in the task file, `app.wingify.com`, is used and does load the login page.
