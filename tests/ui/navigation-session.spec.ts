import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';

test.describe('Navigation and session behavior', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-046][P1][@core] opens and closes the side menu', async ({ sideMenu }) => {
    await sideMenu.open();
    await expect.poll(() => sideMenu.state()).toMatchObject({ allItemsVisible: true });
    await sideMenu.close();
    await expect.poll(() => sideMenu.state()).toMatchObject({ allItemsVisible: false });
  });

  test('[SD-047][P2][@regression] opens inventory from the All Items menu link', async ({ sideMenu, inventoryPage, page }) => {
    await sideMenu.open();
    await sideMenu.selectAllItems();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products' });
  });

  test('[SD-048][P2][@regression] follows the About link to Sauce Labs', async ({ sideMenu, page }) => {
    await sideMenu.open();
    const destination = await sideMenu.aboutDestination();
    expect(destination.href).toMatch(/^https:\/\/(www\.)?saucelabs\.com/);

    if (destination.opensNewTab) {
      const [aboutPage] = await Promise.all([page.waitForEvent('popup'), sideMenu.followAboutLink()]);
      await expect(aboutPage).toHaveURL(/^https:\/\/(www\.)?saucelabs\.com/);
    } else {
      await sideMenu.followAboutLink();
      await expect(page).toHaveURL(/^https:\/\/(www\.)?saucelabs\.com/);
    }
  });

  test('[SD-049][P1][@core] resets app state and clears the cart', async ({ inventoryPage, sideMenu }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await sideMenu.open();
    await sideMenu.resetAppState();

    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: null });
    await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Add to cart');
  });

  test('[SD-050][P2][@regression] keeps the authenticated inventory usable after refresh', async ({ page, inventoryPage }) => {
    await page.reload();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products' });
  });

  test('[SD-051][P1][@core] redirects a logged-out direct inventory visit to login', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => loginPage.state()).toMatchObject({ loginButtonVisible: true });
  });

  test('[SD-052][P2][@regression] keeps browser back and forward navigation consistent', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openProduct(products.bikeLight.name);
    await page.goBack();
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products', cartBadge: '1' });

    await inventoryPage.openCart();
    await page.goBack();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect.poll(() => cartPage.state()).toMatchObject({ itemNames: [products.backpack.name] });
  });
});
