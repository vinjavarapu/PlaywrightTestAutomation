import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';

test.describe('Shopping cart', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-025][P1][@core] opens an empty cart without line items', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.shoppingCartLink.click();

    await expect(cartPage.pageTitle).toHaveText('Your Cart');
    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test('[SD-026][P0][@core] shows the selected product and quantity in cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.shoppingCartLink.click();

    const item = cartPage.itemByName(products.backpack.name);
    await expect(item.getByTestId('inventory-item-price')).toHaveText('$29.99');
    await expect(item.getByTestId('item-quantity')).toHaveText('1');
    expect(await cartPage.itemNames()).toEqual([products.backpack.name]);
  });

  test('[SD-027][P0][@core] removes an item from the cart and clears its badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.shoppingCartLink.click();
    await cartPage.removeItem(products.backpack.name);

    await expect(cartPage.items).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test('[SD-028][P1][@core] continues shopping and retains cart contents', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.shoppingCartLink.click();
    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.itemByName(products.backpack.name).getByRole('button')).toHaveText('Remove');
  });

  test('[SD-029][P1][@core] lists each selected product exactly once', async ({ inventoryPage, cartPage }) => {
    const selected = [products.backpack, products.bikeLight, products.onesie];
    for (const item of selected) await inventoryPage.addToCart(item.name);
    await inventoryPage.shoppingCartLink.click();

    expect(await cartPage.itemNames()).toEqual(selected.map((item) => item.name));
    await expect(cartPage.items).toHaveCount(selected.length);
  });

  test('[SD-030][P1][@core] keeps cart state while navigating through product details', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openProduct(products.bikeLight.name);
    await page.getByTestId('back-to-products').click();
    await inventoryPage.shoppingCartLink.click();

    expect(await cartPage.itemNames()).toEqual([products.backpack.name]);
    await expect(cartPage.cartBadge).toHaveText('1');
  });
});
