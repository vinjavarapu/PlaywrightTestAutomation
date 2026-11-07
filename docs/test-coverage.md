# SauceDemo test coverage

The Playwright specs preserve the case IDs and priorities from the provided Selenium/Java catalogue. The PDF is treated as the source of scenarios; observed UI behavior remains authoritative where a case says the demo behavior may vary.

| Case | Scenario | Priority | Spec |
| --- | --- | --- | --- |
| SD-001 | Login page controls | P0 | `authentication.spec.ts` |
| SD-002 | Standard user login | P0 | `authentication.spec.ts` |
| SD-003 | Unknown username | P1 | `authentication.spec.ts` |
| SD-004 | Incorrect password | P1 | `authentication.spec.ts` |
| SD-005 | Blank credentials | P1 | `authentication.spec.ts` |
| SD-006 | Blank password | P1 | `authentication.spec.ts` |
| SD-007 | Blank username | P1 | `authentication.spec.ts` |
| SD-008 | Locked-out user | P1 | `authentication.spec.ts` |
| SD-009 | Problem user login | P2 | `authentication.spec.ts` |
| SD-010 | Performance-glitch user login | P2 | `authentication.spec.ts` |
| SD-011 | Password masking | P2 | `authentication.spec.ts` |
| SD-012 | Logout | P1 | `authentication.spec.ts` |
| SD-013 | Inventory content | P0 | `inventory.spec.ts` |
| SD-014 | Product details | P1 | `inventory.spec.ts` |
| SD-015 | Return from product details | P1 | `inventory.spec.ts` |
| SD-016 | Add one product | P0 | `inventory.spec.ts` |
| SD-017 | Add multiple products | P0 | `inventory.spec.ts` |
| SD-018 | Remove product from inventory | P1 | `inventory.spec.ts` |
| SD-019 | Sort names A to Z | P1 | `inventory.spec.ts` |
| SD-020 | Sort names Z to A | P1 | `inventory.spec.ts` |
| SD-021 | Sort price low to high | P1 | `inventory.spec.ts` |
| SD-022 | Sort price high to low | P1 | `inventory.spec.ts` |
| SD-023 | Sort while cart has an item | P2 | `inventory.spec.ts` |
| SD-024 | Navigate from inventory to cart | P0 | `inventory.spec.ts` |
| SD-025 | Empty cart | P1 | `cart.spec.ts` |
| SD-026 | Cart item details and quantity | P0 | `cart.spec.ts` |
| SD-027 | Remove item from cart | P0 | `cart.spec.ts` |
| SD-028 | Continue shopping | P1 | `cart.spec.ts` |
| SD-029 | Multiple cart items | P1 | `cart.spec.ts` |
| SD-030 | Cart state across navigation | P1 | `cart.spec.ts` |
| SD-031 | Start checkout | P0 | `checkout.spec.ts` |
| SD-032 | Valid checkout information | P0 | `checkout.spec.ts` |
| SD-033 | All checkout fields blank | P1 | `checkout.spec.ts` |
| SD-034 | Missing first name | P1 | `checkout.spec.ts` |
| SD-035 | Missing last name | P1 | `checkout.spec.ts` |
| SD-036 | Missing postal code | P1 | `checkout.spec.ts` |
| SD-037 | Punctuation in checkout fields | P2 | `checkout.spec.ts` |
| SD-038 | Long checkout values | P2 | `checkout.spec.ts` |
| SD-039 | Cancel checkout information | P1 | `checkout.spec.ts` |
| SD-040 | Overview line items | P0 | `checkout.spec.ts` |
| SD-041 | Item subtotal | P1 | `checkout.spec.ts` |
| SD-042 | Tax and total calculation | P1 | `checkout.spec.ts` |
| SD-043 | Cancel checkout overview | P1 | `checkout.spec.ts` |
| SD-044 | Finish purchase | P0 | `checkout.spec.ts` |
| SD-045 | Return home after purchase | P1 | `checkout.spec.ts` |
| SD-046 | Open and close side menu | P1 | `navigation-session.spec.ts` |
| SD-047 | Menu All Items | P2 | `navigation-session.spec.ts` |
| SD-048 | Menu About link | P2 | `navigation-session.spec.ts` |
| SD-049 | Reset app state | P1 | `navigation-session.spec.ts` |
| SD-050 | Session after refresh | P2 | `navigation-session.spec.ts` |
| SD-051 | Direct inventory URL while logged out | P1 | `navigation-session.spec.ts` |
| SD-052 | Browser back and forward | P2 | `navigation-session.spec.ts` |
| SD-053 | Responsive layout | P2 | `extended-quality.spec.ts` |
| SD-054 | Keyboard navigation | P2 | `extended-quality.spec.ts` |
| SD-055 | Visible focus indicator | P2 | `extended-quality.spec.ts` |
| SD-056 | Product image loading | P2 | `extended-quality.spec.ts` |
| SD-057 | Repeated add/remove stability | P2 | `extended-quality.spec.ts` |
| SD-058 | Multi-item checkout end-to-end | P0 | `checkout.spec.ts` |

Tags in the Playwright test names drive the `test:smoke`, `test:core`, and `test:regression` scripts. Cases are independent and use a fresh browser context; no test depends on another test's cart or login state.
