import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly pageTitle: Locator;
  readonly errorMessage: Locator;
  readonly items: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completionHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');
    this.pageTitle = page.getByTestId('title');
    this.errorMessage = page.getByTestId('error');
    this.items = page.getByTestId('inventory-item');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.completionHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async enterCustomer(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async displayedItemNames(): Promise<string[]> {
    return (await this.items.getByTestId('inventory-item-name').allTextContents()).map((name) => name.trim());
  }

  async displayedItemPrices(): Promise<number[]> {
    const labels = await this.items.getByTestId('inventory-item-price').allTextContents();
    return labels.map((label) => Number(label.replace('$', '').trim()));
  }

  async amount(locator: Locator): Promise<number> {
    const label = (await locator.textContent()) ?? '';
    const amount = Number(label.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(amount)) throw new Error(`Could not parse amount from: ${label}`);
    return amount;
  }
}
