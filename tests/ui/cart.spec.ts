import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';
import { flows } from '../../src/test-data/flows';

test.describe('Shopping cart', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-025][P1][@core] opens an empty cart without line items', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();

    await expect.poll(() => cartPage.state()).toMatchObject({ title: 'Your Cart', itemNames: [], cartBadge: null });
  });

  test('[SD-026][P0][@core] shows the selected product and quantity in cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openCart();

    await expect.poll(() => cartPage.itemDetails(products.backpack.name)).toEqual({
      name: products.backpack.name,
      price: products.backpack.price,
      quantity: '1',
    });
  });

  test('[SD-027][P0][@core] removes an item from the cart and clears its badge', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.removeItem(products.backpack.name);

    await expect.poll(() => cartPage.state()).toMatchObject({ itemNames: [], cartBadge: null });
  });

  test('[SD-028][P1][@core] continues shopping and retains cart contents', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: '1' });
    await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Remove');
  });

  test('[SD-029][P1][@core] lists each selected product exactly once', async ({ inventoryPage, cartPage }) => {
    const selected = flows.cartMultipleProducts;
    for (const item of selected) await inventoryPage.addToCart(item.name);
    await inventoryPage.openCart();

    await expect.poll(() => cartPage.state()).toMatchObject({ itemNames: selected.map((item) => item.name) });
  });

  test('[SD-030][P1][@core] keeps cart state while navigating through product details', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openProduct(flows.cartNavigationProduct.name);
    await inventoryPage.backToProducts();
    await inventoryPage.openCart();

    await expect.poll(() => cartPage.state()).toMatchObject({ itemNames: [products.backpack.name], cartBadge: '1' });
  });
});
