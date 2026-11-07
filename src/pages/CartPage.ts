import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  itemByName(name: string): Locator {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }

  async removeItem(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async itemNames(): Promise<string[]> {
    return (await this.items.getByTestId('inventory-item-name').allTextContents()).map((name) => name.trim());
  }

  async itemPrices(): Promise<number[]> {
    const labels = await this.items.getByTestId('inventory-item-price').allTextContents();
    return labels.map((label) => Number(label.replace('$', '').trim()));
  }
}
