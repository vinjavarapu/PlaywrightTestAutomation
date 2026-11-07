import { test, expect } from '../../src/fixtures/test';
import { standardUser } from '../../src/data/credentials';
import { LoginPage } from '../../src/pages/LoginPage';
import { InventoryPage } from '../../src/pages/InventoryPage';

test.describe('SauceDemo login', () => {
  test('user can log in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);

    await expect(inventoryPage.pageTitle).toBeVisible();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });
});
