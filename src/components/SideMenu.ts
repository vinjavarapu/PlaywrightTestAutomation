import { type Locator, type Page } from '@playwright/test';

export class SideMenu {
  private readonly openButton: Locator;
  private readonly closeButton: Locator;
  private readonly allItemsLink: Locator;
  private readonly aboutLink: Locator;
  private readonly resetLink: Locator;
  private readonly logoutLink: Locator;

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

  async state(): Promise<{ allItemsVisible: boolean }> {
    return { allItemsVisible: await this.allItemsLink.isVisible() };
  }

  async aboutDestination(): Promise<{ href: string | null; opensNewTab: boolean }> {
    return {
      href: await this.aboutLink.getAttribute('href'),
      opensNewTab: (await this.aboutLink.getAttribute('target')) === '_blank',
    };
  }

  async followAboutLink(): Promise<void> {
    await this.aboutLink.click();
  }

  async selectAllItems(): Promise<void> {
    await this.allItemsLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.resetLink.click();
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
