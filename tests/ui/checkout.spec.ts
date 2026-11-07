import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';
import { checkoutData } from '../../src/test-data/checkout';
import { flows } from '../../src/test-data/flows';
import { createCustomerData } from '../../src/utils/dataFactory';
import { InventoryPage } from '../../src/pages/InventoryPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutPage } from '../../src/pages/CheckoutPage';

test.describe('Checkout and order completion', () => {
  test.beforeEach(async ({ loginPage, standardUser }) => {
    await loginPage.open();
    await loginPage.login(standardUser.username, standardUser.password);
  });

  test('[SD-031][P0][@smoke] starts checkout from a cart with a product', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);

    await expect.poll(() => checkoutPage.state()).toMatchObject({ title: 'Checkout: Your Information', firstNameVisible: true });
  });

  test('[SD-032][P0][@smoke] continues with valid customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await enterValidCustomer(checkoutPage);
    await checkoutPage.continue();

    await expect.poll(() => checkoutPage.state()).toMatchObject({ title: 'Checkout: Overview', finishButtonVisible: true });
  });

  for (const scenario of checkoutData.requiredFieldScenarios) {
    test(`[${scenario.id}][P1][@core] ${scenario.title}`, async ({ inventoryPage, cartPage, checkoutPage }) => {
      await openCheckout(inventoryPage, cartPage, [products.backpack]);
      const [firstName, lastName, postalCode] = scenario.values;
      await checkoutPage.enterCustomer(firstName, lastName, postalCode);
      await checkoutPage.continue();

      await expect.poll(() => checkoutPage.errorMessage()).toContain(scenario.message);
      await expect.poll(() => checkoutPage.state()).toMatchObject({ title: 'Checkout: Your Information' });
    });
  }

  test('[SD-037][P2][@regression] handles punctuation in customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await checkoutPage.enterCustomer(
      checkoutData.specialCharacterCustomer.firstName,
      checkoutData.specialCharacterCustomer.lastName,
      checkoutData.specialCharacterCustomer.postalCode,
    );
    await checkoutPage.continue();

    await expect.poll(() => checkoutPage.state()).toMatchObject({ title: 'Checkout: Overview' });
  });

  test('[SD-038][P2][@regression] remains usable with long customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    const longValue = checkoutData.longInput.character.repeat(checkoutData.longInput.length);
    await checkoutPage.enterCustomer(longValue, longValue, longValue);
    await checkoutPage.continue();

    await expect.poll(async () => (await checkoutPage.state()).title).toMatch(/Checkout: (Your Information|Overview)/);
  });

  test('[SD-039][P1][@core] cancels checkout information and retains cart items', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await checkoutPage.cancel();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect.poll(() => cartPage.state()).toMatchObject({ itemNames: [products.backpack.name] });
  });

  test('[SD-040][P0][@core] carries the same line items into order overview', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const selected = flows.checkoutLineItems;
    await openCheckout(inventoryPage, cartPage, selected);
    await enterValidCustomer(checkoutPage);
    await checkoutPage.continue();

    const overview = await checkoutPage.state();
    expect(overview.itemNames).toEqual(await cartPage.itemNames());
    expect(overview.itemPrices).toEqual(await cartPage.itemPrices());
  });

  test('[SD-041][P1][@core] calculates item subtotal from line prices', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const selected = flows.checkoutSubtotalItems;
    await openCheckout(inventoryPage, cartPage, selected);
    await enterValidCustomer(checkoutPage);
    await checkoutPage.continue();

    const expectedSubtotal = selected.reduce((sum, item) => sum + item.price, 0);
    await expect.poll(async () => (await checkoutPage.state()).subtotal).toBe(expectedSubtotal);
  });

  test('[SD-042][P1][@core] adds the displayed tax to the item subtotal', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, flows.checkoutTaxItems);
    await enterValidCustomer(checkoutPage);
    await checkoutPage.continue();

    await expect.poll(() => checkoutPage.state()).toMatchObject({ title: 'Checkout: Overview' });
    const { subtotal, tax, total } = await checkoutPage.state();
    expect(subtotal).not.toBeNull();
    expect(tax).not.toBeNull();
    expect(total).not.toBeNull();
    expect(total!).toBeCloseTo(subtotal! + tax!, 2);
  });

  test('[SD-043][P1][@core] cancels from overview without completing the order', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await enterValidCustomer(checkoutPage);
    await checkoutPage.continue();
    await checkoutPage.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ cartBadge: '1' });
  });

  test('[SD-044][P0][@smoke] finishes purchase and shows confirmation', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await completePurchase(inventoryPage, cartPage, checkoutPage, [products.backpack]);

    await expect.poll(async () => (await checkoutPage.state()).completionMessage).toContain('Thank you for your order');
  });

  test('[SD-045][P1][@core] returns home after completing a purchase', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await completePurchase(inventoryPage, cartPage, checkoutPage, [products.backpack]);
    await checkoutPage.backHome();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect.poll(() => inventoryPage.state()).toMatchObject({ title: 'Products' });
  });

  test('[SD-058][P0][@smoke] completes checkout with multiple products', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await completePurchase(inventoryPage, cartPage, checkoutPage, flows.checkoutMultiOrderItems);

    await expect.poll(async () => (await checkoutPage.state()).completionMessage).toContain('Thank you for your order');
  });
});

async function openCheckout(inventoryPage: InventoryPage, cartPage: CartPage, selected: readonly { name: string }[]): Promise<void> {
  for (const item of selected) await inventoryPage.addToCart(item.name);
  await inventoryPage.openCart();
  await cartPage.startCheckout();
}

async function completePurchase(
  inventoryPage: InventoryPage,
  cartPage: CartPage,
  checkoutPage: CheckoutPage,
  selected: readonly { name: string }[],
): Promise<void> {
  await openCheckout(inventoryPage, cartPage, selected);
  await enterValidCustomer(checkoutPage);
  await checkoutPage.continue();
  await checkoutPage.finish();
}

async function enterValidCustomer(checkoutPage: CheckoutPage): Promise<void> {
  const customer = createCustomerData();
  await checkoutPage.enterCustomer(customer.firstName, customer.lastName, customer.postalCode);
}
