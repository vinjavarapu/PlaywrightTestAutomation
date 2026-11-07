# Playwright Test Automation

Enterprise-style UI automation for the SauceDemo sample application, implemented with Playwright Test and TypeScript.

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
$env:BASE_URL = 'https://www.saucedemo.com'
$env:SAUCEDEMO_USERNAME = 'standard_user'
$env:SAUCEDEMO_PASSWORD = 'secret_sauce'
$env:TEST_TIMEOUT_MS = '45000'
```

To run with a visible browser or inspect the HTML report:

    npm.cmd run test:headed
    npm.cmd run test:debug
    npm.cmd run report

Cross-browser coverage is available for Chromium, Firefox, and WebKit. Install the additional browsers before running it:

    npx.cmd playwright install chromium firefox webkit
    npm.cmd run test:cross-browser

## Configuration

The default base URL is https://www.saucedemo.com. The framework reads BASE_URL, SAUCEDEMO_USERNAME, SAUCEDEMO_PASSWORD, and TEST_TIMEOUT_MS from the process environment. The values in .env.example are a reference; Playwright does not load .env files. Configure CI overrides as GitHub Actions variables/secrets. Standard SauceDemo demo credentials are used when credentials are omitted.

## Framework structure

- src/config: validated runtime configuration
- src/components: reusable navigation components
- src/fixtures: typed Playwright fixtures for page objects and test data
- src/pages: page objects for login, inventory, cart, and checkout
- src/test-data: demo users and product catalogue
- tests/ui: independent cases grouped by functional area
- docs/test-coverage.md: traceability for all 58 PDF case IDs

The page objects use SauceDemo data-test attributes and user-facing roles. Playwright captures a trace, screenshot, and video on failures, plus HTML and JUnit reports.

## GitHub Actions

The GitHub Actions workflow runs TypeScript checking and the full Playwright suite on pushes and pull requests targeting main. It also supports manual dispatch and uploads the Playwright report artifacts.
