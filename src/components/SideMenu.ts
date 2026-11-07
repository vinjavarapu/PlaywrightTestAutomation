import { type Locator, type Page } from '@playwright/test';

export class SideMenu {
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly resetLink: Locator;
  readonly logoutLink: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeButton = page.getByRole('button', { name: 'Close Menu' });
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
    this.aboutLink = page.getByTestId('about-sidebar-link');
    this.resetLink = page.getByTestId('reset-sidebar-link');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await this.allItemsLink.waitFor({ state: 'visible' });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.allItemsLink.waitFor({ state: 'hidden' });
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
