import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';
import { sortScenarios } from '../../src/test-data/sorting';

test.describe('Inventory, product details and sorting', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-013][P0][@smoke] displays the standard product catalogue', async ({ inventoryPage }) => {
    await expect.poll(() => inventoryPage.state()).toMatchObject({
      title: 'Products',
      itemCount: 6,
      firstActionLabel: 'Add to cart',
    });
  });

  test('[SD-014][P1][@core] opens matching product details', async ({ inventoryPage, page }) => {
    const item = products.backpack;
    await inventoryPage.openProduct(item.name);

    await expect(page).toHaveURL(/\/inventory-item\.html\?/);
    await expect.poll(() => inventoryPage.productDetails()).toMatchObject({
      name: item.name,
      price: `$${item.price.toFixed(2)}`,
      imageVisible: true,
    });
    await expect.poll(async () => (await inventoryPage.productDetails()).description.length).toBeGreaterThan(0);
  });

  test('[SD-015][P1][@core] returns from product details to inventory', async ({ inventoryPage, page }) => {
    await inventoryPage.openProduct(products.backpack.name);
    await inventoryPage.backToProducts();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products' });
  });

  test('[SD-016][P0][@smoke] adds one product and synchronizes its button and badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);

    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: '1' });
    await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Remove');
  });

  test('[SD-017][P0][@core] adds multiple products with an accurate cart count', async ({ inventoryPage }) => {
    const selected = [products.backpack, products.bikeLight, products.onesie];
    for (const item of selected) await inventoryPage.addToCart(item.name);

    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: String(selected.length) });
    for (const item of selected) {
      await expect.poll(() => inventoryPage.productButtonLabel(item.name)).toBe('Remove');
    }
  });

  test('[SD-018][P1][@core] removes a product from the inventory page', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.removeFromCart(products.backpack.name);

    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: null });
    await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Add to cart');
  });

  for (const scenario of sortScenarios.filter(({ field }) => field === 'name')) {
    test(`[${scenario.id}][P1][@core] ${scenario.label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(scenario.option);
      const names = (await inventoryPage.state()).productNames;
      const compare = scenario.direction === 'ascending'
        ? (left: string, right: string) => left.localeCompare(right)
        : (left: string, right: string) => right.localeCompare(left);
      expect(names).toEqual([...names].sort(compare));
    });
  }

  for (const scenario of sortScenarios.filter(({ field }) => field === 'price')) {
    test(`[${scenario.id}][P1][@core] ${scenario.label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(scenario.option);
      const prices = (await inventoryPage.state()).productPrices;
      const expected = [...prices].sort((a, b) => scenario.direction === 'descending' ? b - a : a - b);
      expect(prices).toEqual(expected);
    });
  }

  test('[SD-023][P2][@regression] preserves the cart when sorting inventory', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.sortBy('za');

    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: '1' });
    await expect.poll(() => inventoryPage.productButtonLabel(products.backpack.name)).toBe('Remove');
  });

  test('[SD-024][P0][@smoke] opens the cart with the selected product', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openCart();

    await expect.poll(() => cartPage.state()).toMatchObject({ title: 'Your Cart', itemNames: [products.backpack.name] });
  });
});
