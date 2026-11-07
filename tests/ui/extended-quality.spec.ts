import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';

test.describe('Extended UI quality', () => {
  test('[SD-053][P2][@regression] keeps inventory controls usable on narrow viewports', async ({ loginPage, standardUser, inventoryPage, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
    await page.setViewportSize({ width: 375, height: 812 });

    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products', itemCount: 6 });
    await expect.poll(() => inventoryPage.layoutFitsViewport()).toBe(true);
  });

  test('[SD-054][P2][@regression] uses keyboard controls for login and shopping', async ({ loginPage, standardUser, inventoryPage }) => {
    await loginPage.open();
    const keyboardResult = await loginPage.loginWithKeyboard(standardUser.username, standardUser.password);
    expect(keyboardResult).toEqual({ passwordReachedByTab: true, usernameReachedByShiftTab: true, loginReachedByTab: true });
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products' });
    await inventoryPage.addToCartWithKeyboard(products.backpack.name);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: '1' });
  });

  test('[SD-055][P2][@regression] shows a visible keyboard focus indicator', async ({ loginPage }) => {
    await loginPage.open();
    expect(await loginPage.tabToUsername()).toBe(true);
    expect(await loginPage.usernameFocusIndicatorVisible()).toBe(true);
  });

  test('[SD-056][P2][@regression] loads all standard inventory product images', async ({ loginPage, standardUser, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);

    await expect.poll(() => inventoryPage.allProductImagesLoaded()).toBe(true);
  });

  test('[SD-057][P2][@regression] keeps add and remove actions synchronized over repeated cycles', async ({ loginPage, standardUser, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await inventoryPage.addToCart(products.backpack.name);
      await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: '1' });
      await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Remove');
      await inventoryPage.removeFromCart(products.backpack.name);
      await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: null });
      await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Add to cart');
    }
  });
});
