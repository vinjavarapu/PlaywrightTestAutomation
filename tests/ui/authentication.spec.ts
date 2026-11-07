import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/test-data/users';
import { invalidLoginScenarios } from '../../src/test-data/authentication';

test.describe('Authentication and session', () => {
  test('[SD-001][P0][@smoke] opens the login page with required controls', async ({ page, loginPage }) => {
    await loginPage.open();

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => loginPage.state()).toMatchObject({
      usernameVisible: true,
      passwordVisible: true,
      loginButtonVisible: true,
    });
  });

  test('[SD-002][P0][@smoke] signs in as the standard user', async ({ loginPage, inventoryPage, standardUser, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products' });
  });

  for (const scenario of invalidLoginScenarios) {
    test(`[${scenario.id}][P1][@core] ${scenario.name}`, async ({ loginPage, page }) => {
      await loginPage.open();
      await loginPage.login(scenario.username, scenario.password);
      await expect.poll(() => loginPage.state()).toMatchObject({ errorMessage: expect.stringContaining(scenario.message) });
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test('[SD-008][P1][@core] blocks the locked-out user', async ({ loginPage, page }) => {
    await loginPage.open();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect.poll(() => loginPage.state()).toMatchObject({ errorMessage: expect.stringContaining('locked out') });
    await expect(page).toHaveURL(/\/$/);
  });

  test('[SD-009][P2][@regression] observes the problem user inventory flow', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.open();
    await loginPage.login(users.problem.username, users.problem.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ itemCount: 6 });
  });

  test('[SD-010][P2][@regression] waits through the performance user delay', async ({ loginPage, inventoryPage, page }) => {
    test.setTimeout(90_000);
    await loginPage.open();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password, { timeout: 60_000 });

    await page.waitForURL(/\/inventory\.html$/, { timeout: 60_000 });
    await expect.poll(() => inventoryPage.state(), { timeout: 60_000 }).toMatchObject({ title: 'Products' });
  });

  test('[SD-011][P2][@regression] masks password input characters', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.enterPasswordForMasking(users.standard.password);
    expect(await loginPage.passwordInputType()).toBe('password');
  });

  test('[SD-012][P1][@core] logs out and returns to the login page', async ({ loginPage, sideMenu, standardUser, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
    await sideMenu.open();
    await sideMenu.logout();

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => loginPage.state()).toMatchObject({ loginButtonVisible: true });
  });
});
