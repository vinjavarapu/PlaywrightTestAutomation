import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { SideMenu } from '../components/SideMenu';
import { users } from '../test-data/users';
import { logger } from '../utils/logger';
import { environment } from '../config/environment';

type FrameworkFixtures = {
  testLifecycle: void;
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  sideMenu: SideMenu;
  standardUser: typeof users.standard;
};

export const test = base.extend<FrameworkFixtures>({
  testLifecycle: [async ({}, use, testInfo) => {
    const context = {
      testId: testInfo.testId,
      title: testInfo.title,
      project: testInfo.project.name,
      environment: environment.name,
      workerIndex: testInfo.workerIndex,
      retry: testInfo.retry,
    };
    const startedAt = Date.now();
    logger.info('test.started', context);
    try {
      await use();
    } finally {
      const result = {
        ...context,
        status: testInfo.status,
        expectedStatus: testInfo.expectedStatus,
        durationMs: Date.now() - startedAt,
      };
      if (testInfo.status !== testInfo.expectedStatus) {
        logger.error('test.finished', { ...result, error: testInfo.error?.message });
      } else {
        logger.info('test.finished', result);
      }
    }
  }, { auto: true }],
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  sideMenu: async ({ page }, use) => use(new SideMenu(page)),
  standardUser: async ({}, use) => use(users.standard),
});

export { expect };
