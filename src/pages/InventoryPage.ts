import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly items: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly sortSelect: Locator;
  readonly shoppingCartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.productNames = page.getByTestId('inventory-item-name');
    this.productPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  itemByName(name: string): Locator {
    return this.items.filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  async addToCart(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button').click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  async productNameList(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((name) => name.trim());
  }

  async numericPriceList(): Promise<number[]> {
    const labels = await this.productPrices.allTextContents();
    return labels.map((label) => Number(label.replace('$', '').trim()));
  }

  async openProduct(name: string): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  addButtonFor(name: string): Locator {
    return this.itemByName(name).getByRole('button');
  }
}
