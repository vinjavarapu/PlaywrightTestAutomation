const configuredBaseUrl = process.env.BASE_URL?.trim() || 'https://www.saucedemo.com';
let parsedBaseUrl: URL;

try {
  parsedBaseUrl = new URL(configuredBaseUrl);
} catch {
  throw new Error(`BASE_URL must be an absolute HTTP(S) URL. Received: ${configuredBaseUrl}`);
}

if (parsedBaseUrl.protocol !== 'http:' && parsedBaseUrl.protocol !== 'https:') {
  throw new Error(`BASE_URL must use HTTP or HTTPS. Received: ${parsedBaseUrl.protocol}`);
}

export const environment = {
  baseURL: parsedBaseUrl.toString().replace(/\/$/, ''),
  standardUsername: process.env.SAUCEDEMO_USERNAME?.trim() || 'standard_user',
  standardPassword: process.env.SAUCEDEMO_PASSWORD || 'secret_sauce',
  timeoutMs: Number(process.env.TEST_TIMEOUT_MS) || 45_000,
} as const;
