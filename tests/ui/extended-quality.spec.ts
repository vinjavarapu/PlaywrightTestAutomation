import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';

test.describe('Extended UI quality', () => {
  test('[SD-053][P2][@regression] keeps inventory controls usable on narrow viewports', async ({ loginPage, standardUser, inventoryPage, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
    await expect(inventoryPage.pageTitle).toBeVisible();
    await page.setViewportSize({ width: 375, height: 812 });

    await expect(inventoryPage.pageTitle).toBeVisible();
    await expect(inventoryPage.items.first()).toBeVisible();
    const fitsViewport = await page.locator('[data-test="inventory-item"]').evaluateAll((elements) => {
      const width = document.documentElement.clientWidth;
      return elements.every((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= width + 1;
      });
    });
    expect(fitsViewport).toBe(true);
  });

  test('[SD-054][P2][@regression] uses keyboard controls for login and shopping', async ({ loginPage, standardUser, inventoryPage, page }) => {
    await loginPage.open();
    await loginPage.usernameInput.fill(standardUser.username);
    await loginPage.passwordInput.fill(standardUser.password);
    await loginPage.usernameInput.focus();
    await page.keyboard.press('Tab');
    await expect(loginPage.passwordInput).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(loginPage.usernameInput).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(loginPage.loginButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(inventoryPage.pageTitle).toHaveText('Products');

    const addButton = inventoryPage.addButtonFor(products.backpack.name);
    await addButton.focus();
    await page.keyboard.press('Space');
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('[SD-055][P2][@regression] shows a visible keyboard focus indicator', async ({ loginPage, page }) => {
    await loginPage.open();
    await page.keyboard.press('Tab');

    await expect(loginPage.usernameInput).toBeFocused();
    const focusIndicator = await loginPage.usernameInput.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== 'none' && style.outlineWidth !== '0px' || style.boxShadow !== 'none';
    });
    expect(focusIndicator).toBe(true);
    await expect(loginPage.usernameInput).toBeFocused();
  });

  test('[SD-056][P2][@regression] loads all standard inventory product images', async ({ loginPage, standardUser, page }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);

    const images = page.locator('[data-test="inventory-item"] img');
    await expect.poll(async () => images.evaluateAll((elements) =>
      elements.length === 6 && elements.every((image) => {
        const element = image as HTMLImageElement;
        return element.complete && element.naturalWidth > 0;
      }),
    )).toBe(true);
  });

  test('[SD-057][P2][@regression] keeps add and remove actions synchronized over repeated cycles', async ({ loginPage, standardUser, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
    const addButton = inventoryPage.addButtonFor(products.backpack.name);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await addButton.click();
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await expect(addButton).toHaveText('Remove');
      await addButton.click();
      await expect(inventoryPage.cartBadge).toHaveCount(0);
      await expect(addButton).toHaveText('Add to cart');
    }
  });
});
