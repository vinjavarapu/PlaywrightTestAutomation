import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/test-data/products';
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

    await expect(checkoutPage.pageTitle).toHaveText('Checkout: Your Information');
    await expect(checkoutPage.firstNameInput).toBeVisible();
  });

  test('[SD-032][P0][@smoke] continues with valid customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await checkoutPage.enterCustomer('Ada', 'Lovelace', '94043');
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview');
    await expect(checkoutPage.finishButton).toBeVisible();
  });

  const requiredFieldScenarios = [
    { id: 'SD-033', title: 'requires first name when all fields are blank', values: ['', '', ''], message: /First Name is required/ },
    { id: 'SD-034', title: 'requires first name', values: ['', 'Lovelace', '94043'], message: /First Name is required/ },
    { id: 'SD-035', title: 'requires last name', values: ['Ada', '', '94043'], message: /Last Name is required/ },
    { id: 'SD-036', title: 'requires postal code', values: ['Ada', 'Lovelace', ''], message: /Postal Code is required/ },
  ] as const;

  for (const scenario of requiredFieldScenarios) {
    test(`[${scenario.id}][P1][@core] ${scenario.title}`, async ({ inventoryPage, cartPage, checkoutPage }) => {
      await openCheckout(inventoryPage, cartPage, [products.backpack]);
      const [firstName, lastName, postalCode] = scenario.values;
      await checkoutPage.enterCustomer(firstName, lastName, postalCode);
      await checkoutPage.continueButton.click();

      await expect(checkoutPage.errorMessage).toContainText(scenario.message);
      await expect(checkoutPage.pageTitle).toHaveText('Checkout: Your Information');
    });
  }

  test('[SD-037][P2][@regression] handles punctuation in customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await checkoutPage.enterCustomer("O'Neil", 'Anne-Marie', 'A1B 2C3');
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview');
  });

  test('[SD-038][P2][@regression] remains usable with long customer details', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    const longValue = 'A'.repeat(200);
    await checkoutPage.enterCustomer(longValue, longValue, longValue);
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.pageTitle).toHaveText(/Checkout: (Your Information|Overview)/);
  });

  test('[SD-039][P1][@core] cancels checkout information and retains cart items', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.items).toHaveCount(1);
  });

  test('[SD-040][P0][@core] carries the same line items into order overview', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const selected = [products.backpack, products.bikeLight];
    await openCheckout(inventoryPage, cartPage, selected);
    await checkoutPage.enterCustomer('Ada', 'Lovelace', '94043');
    await checkoutPage.continueButton.click();

    expect(await checkoutPage.displayedItemNames()).toEqual(await cartPage.itemNames());
    expect(await checkoutPage.displayedItemPrices()).toEqual(await cartPage.itemPrices());
  });

  test('[SD-041][P1][@core] calculates item subtotal from line prices', async ({ inventoryPage, cartPage, checkoutPage }) => {
    const selected = [products.backpack, products.bikeLight, products.onesie];
    await openCheckout(inventoryPage, cartPage, selected);
    await checkoutPage.enterCustomer('Ada', 'Lovelace', '94043');
    await checkoutPage.continueButton.click();

    const expectedSubtotal = selected.reduce((sum, item) => sum + item.price, 0);
    await expect(checkoutPage.subtotalLabel).toContainText(expectedSubtotal.toFixed(2));
  });

  test('[SD-042][P1][@core] adds the displayed tax to the item subtotal', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack, products.bikeLight]);
    await checkoutPage.enterCustomer('Ada', 'Lovelace', '94043');
    await checkoutPage.continueButton.click();

    const subtotal = await checkoutPage.amount(checkoutPage.subtotalLabel);
    const tax = await checkoutPage.amount(checkoutPage.taxLabel);
    const total = await checkoutPage.amount(checkoutPage.totalLabel);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('[SD-043][P1][@core] cancels from overview without completing the order', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await openCheckout(inventoryPage, cartPage, [products.backpack]);
    await checkoutPage.enterCustomer('Ada', 'Lovelace', '94043');
    await checkoutPage.continueButton.click();
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('[SD-044][P0][@smoke] finishes purchase and shows confirmation', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await completePurchase(inventoryPage, cartPage, checkoutPage, [products.backpack]);

    await expect(checkoutPage.completionHeader).toContainText(/Thank you for your order/);
  });

  test('[SD-045][P1][@core] returns home after completing a purchase', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await completePurchase(inventoryPage, cartPage, checkoutPage, [products.backpack]);
    await checkoutPage.backHomeButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
  });

  test('[SD-058][P0][@smoke] completes checkout with multiple products', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await completePurchase(inventoryPage, cartPage, checkoutPage, [products.backpack, products.bikeLight, products.onesie]);

    await expect(checkoutPage.completionHeader).toContainText(/Thank you for your order/);
  });
});

async function openCheckout(inventoryPage: InventoryPage, cartPage: CartPage, selected: readonly { name: string }[]): Promise<void> {
  for (const item of selected) await inventoryPage.addToCart(item.name);
  await inventoryPage.shoppingCartLink.click();
  await cartPage.checkoutButton.click();
}

async function completePurchase(
  inventoryPage: InventoryPage,
  cartPage: CartPage,
  checkoutPage: CheckoutPage,
  selected: readonly { name: string }[],
): Promise<void> {
  await openCheckout(inventoryPage, cartPage, selected);
  await checkoutPage.enterCustomer('Ada', 'Lovelace', '94043');
  await checkoutPage.continueButton.click();
  await checkoutPage.finishButton.click();
}
