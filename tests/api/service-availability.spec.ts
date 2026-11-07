import { test, expect } from '../../src/fixtures/test';

test('application responds to an HTTP request', async ({ request, baseURL }) => {
  test.skip(!baseURL, 'Set BASE_URL to the application URL before running this check.');

  const response = await request.get('/');

  // The backend currently has no root route, so a 404 still confirms that
  // the Spring service is reachable. A server error signals an unhealthy app.
  expect(response.status(), await response.text()).toBeLessThan(500);
});
