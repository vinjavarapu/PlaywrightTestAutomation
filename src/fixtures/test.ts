import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { SideMenu } from '../components/SideMenu';
import { users } from '../test-data/users';

type FrameworkFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  sideMenu: SideMenu;
  standardUser: typeof users.standard;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  sideMenu: async ({ page }, use) => use(new SideMenu(page)),
  standardUser: async ({}, use) => use(users.standard),
});

export { expect };
