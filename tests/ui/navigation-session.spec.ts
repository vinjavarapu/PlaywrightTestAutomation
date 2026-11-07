import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';

test.describe('Navigation and session behavior', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-046][P1][@core] opens and closes the side menu', async ({ sideMenu }) => {
    await sideMenu.open();
    await expect(sideMenu.allItemsLink).toBeVisible();
    await sideMenu.close();
    await expect(sideMenu.allItemsLink).toBeHidden();
  });

  test('[SD-047][P2][@regression] opens inventory from the All Items menu link', async ({ sideMenu, inventoryPage, page }) => {
    await sideMenu.open();
    await sideMenu.allItemsLink.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('[SD-048][P2][@regression] follows the About link to Sauce Labs', async ({ sideMenu, page }) => {
    await sideMenu.open();
    const targetUrl = await sideMenu.aboutLink.getAttribute('href');
    expect(targetUrl).toMatch(/^https:\/\/(www\.)?saucelabs\.com/);
    const opensNewTab = (await sideMenu.aboutLink.getAttribute('target')) === '_blank';

    if (opensNewTab) {
      const [aboutPage] = await Promise.all([page.waitForEvent('popup'), sideMenu.aboutLink.click()]);
      await expect(aboutPage).toHaveURL(/^https:\/\/(www\.)?saucelabs\.com/);
    } else {
      await sideMenu.aboutLink.click();
      await expect(page).toHaveURL(/^https:\/\/(www\.)?saucelabs\.com/);
    }
  });

  test('[SD-049][P1][@core] resets app state and clears the cart', async ({ inventoryPage, sideMenu }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await sideMenu.open();
    await sideMenu.resetLink.click();

    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await expect(inventoryPage.itemByName(products.backpack.name).getByRole('button')).toHaveText('Add to cart');
  });

  test('[SD-050][P2][@regression] keeps the authenticated inventory usable after refresh', async ({ page, inventoryPage }) => {
    await page.reload();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('[SD-051][P1][@core] redirects a logged-out direct inventory visit to login', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('[SD-052][P2][@regression] keeps browser back and forward navigation consistent', async ({ inventoryPage, page }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openProduct(products.bikeLight.name);
    await page.goBack();
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.shoppingCartLink.click();
    await page.goBack();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(products.backpack.name);
  });
});
