import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface LoginPageState {
  readonly usernameVisible: boolean;
  readonly passwordVisible: boolean;
  readonly loginButtonVisible: boolean;
  readonly errorMessage: string;
}

export interface KeyboardLoginResult {
  readonly passwordReachedByTab: boolean;
  readonly usernameReachedByShiftTab: boolean;
  readonly loginReachedByTab: boolean;
}

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorBanner = page.getByTestId('error');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageReady();
  }

  async login(username: string, password: string, options?: { readonly timeout?: number }): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton, options?.timeout);
  }

  async state(): Promise<LoginPageState> {
    return {
      usernameVisible: await this.isVisible(this.usernameInput),
      passwordVisible: await this.isVisible(this.passwordInput),
      loginButtonVisible: await this.isVisible(this.loginButton),
      errorMessage: await this.text(this.errorBanner),
    };
  }

  async passwordInputType(): Promise<string | null> {
    return this.attribute(this.passwordInput, 'type');
  }

  async enterPasswordForMasking(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  async loginWithKeyboard(username: string, password: string): Promise<KeyboardLoginResult> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.usernameInput.focus();
    await this.page.keyboard.press('Tab');
    const passwordReachedByTab = await this.isFocused(this.passwordInput);
    await this.page.keyboard.press('Shift+Tab');
    const usernameReachedByShiftTab = await this.isFocused(this.usernameInput);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    const loginReachedByTab = await this.isFocused(this.loginButton);
    await this.page.keyboard.press('Enter');
    return { passwordReachedByTab, usernameReachedByShiftTab, loginReachedByTab };
  }

  async tabToUsername(): Promise<boolean> {
    await this.page.keyboard.press('Tab');
    return this.isFocused(this.usernameInput);
  }

  async usernameFocusIndicatorVisible(): Promise<boolean> {
    await this.waitForVisible(this.usernameInput);
    await this.usernameInput.focus();
    return this.usernameInput.evaluate((element) => {
      const style = getComputedStyle(element);
      return (style.outlineStyle !== 'none' && style.outlineWidth !== '0px') || style.boxShadow !== 'none';
    });
  }

  private async isFocused(locator: Locator): Promise<boolean> {
    return locator.evaluate((element) => element === document.activeElement);
  }
}
