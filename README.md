# Playwright Test Automation

End-to-end browser and service availability checks written in TypeScript with Playwright Test.

## Requirements

- Node.js 20 or newer
- npm
- Chromium (installed through Playwright)

## Install

```powershell
npm.cmd install
npx.cmd playwright install chromium
```

## Run tests

The browser login test uses the SauceDemo sample site, configured as the default `BASE_URL` in `playwright.config.ts`:

```powershell
npm.cmd test -- tests/ui/login.spec.ts
```

The API availability check targets the same base URL by default. To point it at a locally running service, set `BASE_URL` first:

```powershell
$env:BASE_URL = 'http://127.0.0.1:8080'
npm.cmd test -- tests/api/service-availability.spec.ts
```

Other commands:

```powershell
npm.cmd run test:headed
npm.cmd run test:debug
npm.cmd run report
```

## GitHub Actions

The Playwright suite runs automatically on pushes and pull requests targeting `main`. You can also start it manually from the Actions tab. Test reports and artifacts are attached to each workflow run.

## Project layout

```text
src/       Shared fixtures, page objects, and sample credentials
tests/     API and UI specs
```

Playwright reports and test artifacts are generated locally and ignored by Git. Set `BASE_URL` in your shell when you need to target a different service.
