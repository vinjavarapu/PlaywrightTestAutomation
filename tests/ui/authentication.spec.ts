import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/test-data/users';

test.describe('Authentication and session', () => {
  test('[SD-001][P0][@smoke] opens the login page with required controls', async ({ page, loginPage }) => {
    await loginPage.open();

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('[SD-002][P0][@smoke] signs in as the standard user', async ({ loginPage, inventoryPage, standardUser, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  const rejectedCredentials = [
    { id: 'SD-003', name: 'rejects an unknown username', username: 'unknown_user', password: 'secret_sauce', message: /do not match any user/ },
    { id: 'SD-004', name: 'rejects an incorrect password', username: 'standard_user', password: 'wrong_password', message: /do not match any user/ },
    { id: 'SD-005', name: 'requires a username when both fields are blank', username: '', password: '', message: /Username is required/ },
    { id: 'SD-006', name: 'requires a password', username: 'standard_user', password: '', message: /Password is required/ },
    { id: 'SD-007', name: 'requires a username when only a password is supplied', username: '', password: 'secret_sauce', message: /Username is required/ },
  ];

  for (const scenario of rejectedCredentials) {
    test(`[${scenario.id}][P1][@core] ${scenario.name}`, async ({ loginPage, page }) => {
      await loginPage.open();
      await loginPage.login(scenario.username, scenario.password);
      await expect(loginPage.errorMessage).toContainText(scenario.message);
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test('[SD-008][P1][@core] blocks the locked-out user', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toContainText(/locked out/);
    await expect(page).toHaveURL(/\/$/);
  });

  test('[SD-009][P2][@regression] observes the problem user inventory flow', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.open();
    await loginPage.login(users.problem.username, users.problem.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('[SD-010][P2][@regression] waits through the performance user delay', async ({ loginPage, inventoryPage, page }) => {
    test.setTimeout(90_000);
    await loginPage.open();
    await loginPage.usernameInput.fill(users.performanceGlitch.username);
    await loginPage.passwordInput.fill(users.performanceGlitch.password);
    await loginPage.loginButton.click({ timeout: 60_000 });

    await page.waitForURL(/\/inventory\.html$/, { timeout: 60_000 });
    await expect(inventoryPage.pageTitle).toHaveText('Products', { timeout: 60_000 });
  });

  test('[SD-011][P2][@regression] masks password input characters', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.passwordInput.fill('secret_sauce');

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('[SD-012][P1][@core] logs out and returns to the login page', async ({ loginPage, sideMenu, standardUser, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
    await sideMenu.open();
    await sideMenu.logout();

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
