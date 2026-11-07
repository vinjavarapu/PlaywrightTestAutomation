import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly finishButton: Locator;
  private readonly pageTitle: Locator;
  private readonly errorBanner: Locator;
  private readonly items: Locator;
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly completionHeader: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');
    this.pageTitle = page.getByTestId('title');
    this.errorBanner = page.getByTestId('error');
    this.items = page.getByTestId('inventory-item');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.completionHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async enterCustomer(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
  }

  async displayedItemNames(): Promise<string[]> {
    return this.texts(this.items.getByTestId('inventory-item-name'));
  }

  async displayedItemPrices(): Promise<number[]> {
    return (await this.texts(this.items.getByTestId('inventory-item-price'))).map(parseCurrency);
  }

  async state(): Promise<{
    title: string;
    errorMessage: string;
    itemNames: string[];
    itemPrices: number[];
    subtotal: number | null;
    tax: number | null;
    total: number | null;
    completionMessage: string;
    firstNameVisible: boolean;
    finishButtonVisible: boolean;
  }> {
    return {
      title: await this.text(this.pageTitle),
      errorMessage: await this.text(this.errorBanner),
      itemNames: await this.displayedItemNames(),
      itemPrices: await this.displayedItemPrices(),
      subtotal: await this.amount(this.subtotalLabel),
      tax: await this.amount(this.taxLabel),
      total: await this.amount(this.totalLabel),
      completionMessage: await this.text(this.completionHeader),
      firstNameVisible: await this.isVisible(this.firstNameInput),
      finishButtonVisible: await this.isVisible(this.finishButton),
    };
  }

  async errorMessage(): Promise<string> {
    return this.text(this.errorBanner);
  }

  async continue(): Promise<void> {
    await this.click(this.continueButton);
  }

  async cancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  async finish(): Promise<void> {
    await this.click(this.finishButton);
  }

  async backHome(): Promise<void> {
    await this.click(this.backHomeButton);
  }

  private async amount(locator: Locator): Promise<number | null> {
    const label = await this.text(locator);
    if (label.length === 0) return null;
    const amount = Number(label.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(amount)) throw new Error(`Could not parse amount from: ${label}`);
    return amount;
  }
}

function parseCurrency(label: string): number {
  const amount = Number(label.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(amount)) throw new Error(`Invalid checkout line price: ${label}`);
  return amount;
}
