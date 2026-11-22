/**
 * Central test data. No credentials are hardcoded: valid credentials come from
 * environment variables (.env). Invalid values are deliberately fake.
 */
export const LOGIN_URL = process.env.BASE_URL ?? 'https://app.wingify.com/#/login';

export const validCredentials = {
  email: process.env.VWO_EMAIL ?? '',
  password: process.env.VWO_PASSWORD ?? '',
};

export const hasValidCredentials = (): boolean =>
  validCredentials.email.length > 0 && validCredentials.password.length > 0;

export const invalidData = {
  unknownEmail: 'no.such.user.qa@example.com',
  wrongPassword: 'Wrong#Pass123',
  malformedEmail: 'not-an-email',
};

/**
 * Verified against the live application (2026-11-21): every failed attempt
 * (wrong credentials AND empty fields) shows this single notification.
 */
export const messages = {
  authFailure: 'Your email, password, IP address or location did not match',
};

/** Class the live app adds to the Sign in button while a request is in flight (verified). */
export const LOADING_CLASS = /is-in-action/;
