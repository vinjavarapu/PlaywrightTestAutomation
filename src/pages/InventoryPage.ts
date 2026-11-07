import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly shoppingCartLink: Locator;
  readonly burgerMenu: Locator;

  constructor(page: Page) {
    super(page);

    this.pageTitle = page.locator('.title');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.burgerMenu = page.getByRole('button', { name: 'Open Menu' });
  }
}
