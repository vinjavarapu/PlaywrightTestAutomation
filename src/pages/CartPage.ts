import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly pageTitle: Locator;
  private readonly items: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async state(): Promise<{ title: string; itemNames: string[]; itemPrices: number[]; quantities: string[]; cartBadge: string | null }> {
    const badgeVisible = await this.isVisible(this.cartBadge);
    return {
      title: await this.text(this.pageTitle),
      itemNames: await this.itemNames(),
      itemPrices: await this.itemPrices(),
      quantities: await this.texts(this.items.getByTestId('item-quantity')),
      cartBadge: badgeVisible ? await this.text(this.cartBadge) : null,
    };
  }

  async itemDetails(name: string): Promise<{ name: string; price: number; quantity: string }> {
    const item = this.itemFor(name);
    return {
      name: await this.text(item.getByTestId('inventory-item-name')),
      price: parseCurrency(await this.text(item.getByTestId('inventory-item-price'))),
      quantity: await this.text(item.getByTestId('item-quantity')),
    };
  }

  async itemNames(): Promise<string[]> {
    return this.texts(this.items.getByTestId('inventory-item-name'));
  }

  async itemPrices(): Promise<number[]> {
    return (await this.texts(this.items.getByTestId('inventory-item-price'))).map(parseCurrency);
  }

  async removeItem(name: string): Promise<void> {
    await this.click(this.itemFor(name).getByRole('button', { name: 'Remove' }));
  }

  async startCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  private itemFor(name: string): Locator {
    return this.items.filter({ has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }) });
  }
}

function parseCurrency(label: string): number {
  const amount = Number(label.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(amount)) throw new Error(`Invalid cart line price: ${label}`);
  return amount;
}
