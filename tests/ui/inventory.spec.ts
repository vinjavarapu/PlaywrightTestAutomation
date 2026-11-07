import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';

test.describe('Inventory, product details and sorting', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-013][P0][@smoke] displays the standard product catalogue', async ({ inventoryPage }) => {
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
    await expect(inventoryPage.productNames.first()).toBeVisible();
    await expect(inventoryPage.productPrices.first()).toBeVisible();
    await expect(inventoryPage.items.first().getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  test('[SD-014][P1][@core] opens matching product details', async ({ inventoryPage, page }) => {
    const item = products.backpack;
    await inventoryPage.openProduct(item.name);

    await expect(page).toHaveURL(/\/inventory-item\.html\?/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(item.name);
    await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${item.price.toFixed(2)}`);
    await expect(page.getByTestId('inventory-item-desc')).not.toBeEmpty();
    await expect(page.getByRole('img', { name: item.name })).toBeVisible();
  });

  test('[SD-015][P1][@core] returns from product details to inventory', async ({ inventoryPage, page }) => {
    await inventoryPage.openProduct(products.backpack.name);
    await page.getByTestId('back-to-products').click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('[SD-016][P0][@smoke] adds one product and synchronizes its button and badge', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.itemByName(products.backpack.name).getByRole('button')).toHaveText('Remove');
  });

  test('[SD-017][P0][@core] adds multiple products with an accurate cart count', async ({ inventoryPage }) => {
    const selected = [products.backpack, products.bikeLight, products.onesie];
    for (const item of selected) await inventoryPage.addToCart(item.name);

    await expect(inventoryPage.cartBadge).toHaveText(String(selected.length));
    for (const item of selected) {
      await expect(inventoryPage.itemByName(item.name).getByRole('button')).toHaveText('Remove');
    }
  });

  test('[SD-018][P1][@core] removes a product from the inventory page', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.removeFromCart(products.backpack.name);

    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await expect(inventoryPage.itemByName(products.backpack.name).getByRole('button')).toHaveText('Add to cart');
  });

  const sortScenarios = [
    { id: 'SD-019', label: 'sorts names A to Z', option: 'az', compare: (a: string, b: string) => a.localeCompare(b) },
    { id: 'SD-020', label: 'sorts names Z to A', option: 'za', compare: (a: string, b: string) => b.localeCompare(a) },
  ];

  for (const scenario of sortScenarios) {
    test(`[${scenario.id}][P1][@core] ${scenario.label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortSelect.selectOption(scenario.option);
      const names = await inventoryPage.productNameList();
      expect(names).toEqual([...names].sort(scenario.compare));
    });
  }

  const priceSortScenarios = [
    { id: 'SD-021', label: 'sorts prices low to high', option: 'lohi', descending: false },
    { id: 'SD-022', label: 'sorts prices high to low', option: 'hilo', descending: true },
  ];

  for (const scenario of priceSortScenarios) {
    test(`[${scenario.id}][P1][@core] ${scenario.label}`, async ({ inventoryPage }) => {
      await inventoryPage.sortSelect.selectOption(scenario.option);
      const prices = await inventoryPage.numericPriceList();
      const expected = [...prices].sort((a, b) => scenario.descending ? b - a : a - b);
      expect(prices).toEqual(expected);
    });
  }

  test('[SD-023][P2][@regression] preserves the cart when sorting inventory', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.sortSelect.selectOption('za');

    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(inventoryPage.itemByName(products.backpack.name).getByRole('button')).toHaveText('Remove');
  });

  test('[SD-024][P0][@smoke] opens the cart with the selected product', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.shoppingCartLink.click();

    await expect(cartPage.pageTitle).toHaveText('Your Cart');
    expect(await cartPage.itemNames()).toEqual([products.backpack.name]);
  });
});
