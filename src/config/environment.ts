import userFixture from '../test-data/users.json';

export type EnvironmentName = 'demo' | 'qa' | 'stage' | 'prod';

const allowedEnvironments: readonly EnvironmentName[] = ['demo', 'qa', 'stage', 'prod'];
const requestedEnvironment = (process.env.TEST_ENV?.trim().toLowerCase() || 'demo') as EnvironmentName;

if (!allowedEnvironments.includes(requestedEnvironment)) {
  throw new Error(`TEST_ENV must be one of: ${allowedEnvironments.join(', ')}.`);
}

const environmentBaseUrlKey = `${requestedEnvironment.toUpperCase()}_BASE_URL`;
const configuredBaseUrl = process.env.BASE_URL?.trim()
  || process.env[environmentBaseUrlKey]?.trim()
  || (requestedEnvironment === 'demo' ? 'https://www.saucedemo.com' : '');

if (!configuredBaseUrl) {
  throw new Error(`Set BASE_URL or ${environmentBaseUrlKey} when TEST_ENV=${requestedEnvironment}.`);
}

let parsedBaseUrl: URL;
try {
  parsedBaseUrl = new URL(configuredBaseUrl);
} catch {
  throw new Error(`BASE_URL must be an absolute HTTP(S) URL. Received: ${configuredBaseUrl}`);
}

if (!['http:', 'https:'].includes(parsedBaseUrl.protocol) || parsedBaseUrl.username || parsedBaseUrl.password) {
  throw new Error('BASE_URL must be an HTTP(S) URL without embedded credentials.');
}

if (parsedBaseUrl.search || parsedBaseUrl.hash) {
  throw new Error('BASE_URL must not include a query string or fragment.');
}

const rawUsername = process.env.TEST_USERNAME ?? process.env.SAUCEDEMO_USERNAME;
const rawPassword = process.env.TEST_PASSWORD ?? process.env.SAUCEDEMO_PASSWORD;
const configuredUsername = rawUsername?.trim();
const configuredPassword = rawPassword;

if ((rawUsername !== undefined && !configuredUsername) || (rawPassword !== undefined && !configuredPassword)) {
  throw new Error('TEST_USERNAME and TEST_PASSWORD must not be empty when provided.');
}

if ((configuredUsername && !configuredPassword) || (!configuredUsername && configuredPassword)) {
  throw new Error('Set both TEST_USERNAME and TEST_PASSWORD, or neither.');
}

if (requestedEnvironment !== 'demo' && (!configuredUsername || !configuredPassword)) {
  throw new Error(`TEST_USERNAME and TEST_PASSWORD are required when TEST_ENV=${requestedEnvironment}.`);
}

const rawTimeout = process.env.TEST_TIMEOUT_MS;
const timeoutMs = rawTimeout === undefined ? 45_000 : Number(rawTimeout);
if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 300_000) {
  throw new Error('TEST_TIMEOUT_MS must be an integer between 1000 and 300000.');
}

export const environment = Object.freeze({
  name: requestedEnvironment,
  baseURL: parsedBaseUrl.toString().replace(/\/$/, ''),
  standardUsername: configuredUsername || userFixture.standard.username,
  standardPassword: configuredPassword || userFixture.standard.password,
  timeoutMs,
});
