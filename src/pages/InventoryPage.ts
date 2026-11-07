import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type InventorySort = 'az' | 'za' | 'lohi' | 'hilo';

export interface InventoryState {
  readonly title: string;
  readonly itemCount: number;
  readonly productNames: string[];
  readonly productPrices: number[];
  readonly cartBadge: string | null;
  readonly firstActionLabel: string;
}

export interface ProductDetailsState {
  readonly name: string;
  readonly description: string;
  readonly price: string;
  readonly imageVisible: boolean;
}

export class InventoryPage extends BasePage {
  private readonly title: Locator;
  private readonly items: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;
  private readonly sortSelect: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly cartBadge: Locator;
  private readonly detailName: Locator;
  private readonly detailDescription: Locator;
  private readonly detailPrice: Locator;
  private readonly detailImage: Locator;

  constructor(page: Page) {
    super(page);
    this.title = this.byTestId('title');
    this.items = this.byTestId('inventory-item');
    this.productNames = this.byTestId('inventory-item-name');
    this.productPrices = this.byTestId('inventory-item-price');
    this.sortSelect = this.byTestId('product-sort-container');
    this.shoppingCartLink = this.byTestId('shopping-cart-link');
    this.cartBadge = this.byTestId('shopping-cart-badge');
    this.detailName = this.byTestId('inventory-item-name');
    this.detailDescription = this.byTestId('inventory-item-desc');
    this.detailPrice = this.byTestId('inventory-item-price');
    this.detailImage = page.locator('img.inventory_details_img');
  }

  async state(): Promise<InventoryState> {
    const badgeVisible = await this.isVisible(this.cartBadge);
    return {
      title: await this.text(this.title),
      itemCount: await this.count(this.items),
      productNames: await this.texts(this.productNames),
      productPrices: (await this.texts(this.productPrices)).map(parseCurrency),
      cartBadge: badgeVisible ? await this.text(this.cartBadge) : null,
      firstActionLabel: await this.text(this.firstActionButton()),
    };
  }

  async productButtonLabel(name: string): Promise<string> {
    return this.text(this.actionButtonFor(name));
  }

  async addToCart(name: string): Promise<void> {
    await this.click(this.actionButtonFor(name));
  }

  async removeFromCart(name: string): Promise<void> {
    await this.click(this.actionButtonFor(name));
  }

  async addToCartWithKeyboard(name: string): Promise<void> {
    const button = this.actionButtonFor(name);
    await button.focus();
    await this.page.keyboard.press('Space');
  }

  async sortBy(option: InventorySort): Promise<void> {
    await this.select(this.sortSelect, option);
  }

  async openProduct(name: string): Promise<void> {
    const detailLink = this.page.locator('[data-test$="-title-link"]').filter({ hasText: name }).first();
    await detailLink.waitFor({ state: 'visible' });
    await this.click(detailLink);
  }

  async productDetails(): Promise<ProductDetailsState> {
    return {
      name: await this.text(this.detailName),
      description: await this.text(this.detailDescription),
      price: await this.text(this.detailPrice),
      imageVisible: await this.isVisible(this.detailImage),
    };
  }

  async backToProducts(): Promise<void> {
    await this.click(this.byTestId('back-to-products'));
  }

  async openCart(): Promise<void> {
    await this.click(this.shoppingCartLink);
  }

  async layoutFitsViewport(): Promise<boolean> {
    return this.items.evaluateAll((elements) => {
      const width = document.documentElement.clientWidth;
      return elements.every((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= width + 1;
      });
    });
  }

  async allProductImagesLoaded(): Promise<boolean> {
    return this.items.locator('img').evaluateAll((images) =>
      images.length === 6 && images.every((image) => {
        const element = image as HTMLImageElement;
        return element.complete && element.naturalWidth > 0;
      }),
    );
  }

  private cardFor(name: string): Locator {
    return this.items.filter({ has: this.page.locator('[data-test$="-title-link"]').filter({ hasText: name }).first() }).first();
  }

  private firstActionButton(): Locator {
    return this.items.first().locator('button').filter({ hasText: /Add to cart|Remove/i }).first();
  }

  private actionButtonFor(name: string): Locator {
    return this.cardFor(name).locator('button').filter({ hasText: /Add to cart|Remove/i }).first();
  }
}

function parseCurrency(label: string): number {
  const amount = Number(label.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(amount)) throw new Error(`Invalid product price: ${label}`);
  return amount;
}
