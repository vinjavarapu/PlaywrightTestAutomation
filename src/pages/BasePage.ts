import { type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected async click(locator: Locator, timeout?: number): Promise<void> {
    await locator.click(timeout ? { timeout } : undefined);
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  protected async select(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  protected async text(locator: Locator): Promise<string> {
    return (await locator.textContent())?.trim() ?? '';
  }

  protected async texts(locator: Locator): Promise<string[]> {
    return (await locator.allTextContents()).map((value) => value.trim());
  }

  protected async count(locator: Locator): Promise<number> {
    return locator.count();
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  protected async attribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }

  protected async inputValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  protected async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }
}
