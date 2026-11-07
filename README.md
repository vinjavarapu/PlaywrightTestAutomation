# Playwright Test Automation

Production-oriented UI automation for SauceDemo, implemented with Playwright Test and TypeScript. The suite uses Page Objects with private locators, typed fixtures, JSON test data, validated environment configuration, structured logs, and isolated browser contexts.

## Requirements and setup

- Node.js 20 or newer
- npm

From the repository root in PowerShell:

    npm.cmd ci
    npx.cmd playwright install chromium

## Run tests

    npm.cmd test
    npm.cmd run test:smoke
    npm.cmd run test:core
    npm.cmd run test:regression
    npm.cmd run typecheck

The smoke and priority suites can be filtered with their tags. Each test is isolated in its own Playwright browser context.

Set optional overrides in PowerShell before running tests:

```powershell
$env:TEST_ENV = 'demo'
$env:BASE_URL = 'https://www.saucedemo.com'
$env:TEST_USERNAME = 'standard_user'
$env:TEST_PASSWORD = 'secret_sauce'
$env:TEST_TIMEOUT_MS = '45000'
```

For QA, Stage, or Prod, set TEST_ENV to qa, stage, or prod and configure the corresponding QA_BASE_URL, STAGE_BASE_URL, or PROD_BASE_URL. TEST_USERNAME and TEST_PASSWORD are required outside the demo environment. BASE_URL can override the environment-specific URL.

To run with a visible browser or inspect the HTML report:

    npm.cmd run test:headed
    npm.cmd run test:debug
    npm.cmd run report

Cross-browser coverage is available for Chromium, Firefox, and WebKit. Install the additional browsers before running it:

    npx.cmd playwright install chromium firefox webkit
    npm.cmd run test:cross-browser

## Configuration

The default environment is demo at https://www.saucedemo.com. Configuration validates TEST_ENV, the HTTP(S) base URL, paired credentials, and TEST_TIMEOUT_MS. The values in .env.example are a reference; Playwright does not load .env files. Configure CI overrides as GitHub Actions variables/secrets. Standard SauceDemo credentials are loaded from the JSON user fixture only for demo runs.

## Framework structure

```text
src/
  components/SideMenu.ts
  config/environment.ts
  fixtures/test.ts
  pages/             BasePage, LoginPage, InventoryPage, CartPage, CheckoutPage
  test-data/         JSON fixtures and typed loaders for users, products, flows,
                     sorting, authentication, and checkout
  utils/             logger.ts, dataFactory.ts
tests/ui/            Authentication, inventory, cart, checkout, navigation, quality
docs/test-coverage.md
playwright.config.ts
playwright.cross-browser.config.ts
```

Page objects expose business actions and read-only state methods; selectors remain private and assertions stay in specs. Playwright auto-waiting and polling assertions are used without fixed sleeps. Each test receives a fresh browser context. Failure traces, screenshots, and videos are retained, and HTML/JUnit reports are generated.

## GitHub Actions

The GitHub Actions workflow runs TypeScript checking and the full Playwright suite on pushes and pull requests targeting main. It also supports manual dispatch and uploads the Playwright report artifacts.
