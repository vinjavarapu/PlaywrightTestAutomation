import flowFixture from './flows.json';
import { products } from './products';

type ProductKey = keyof typeof products;
type FlowFixture = {
  cartMultipleProducts: ProductKey[];
  checkoutLineItems: ProductKey[];
  checkoutSubtotalItems: ProductKey[];
  checkoutTaxItems: ProductKey[];
  checkoutMultiOrderItems: ProductKey[];
  cartNavigationProduct: ProductKey;
};

const typedFlowFixture = flowFixture as FlowFixture;

export const flows = {
  cartMultipleProducts: typedFlowFixture.cartMultipleProducts.map((key) => products[key]),
  checkoutLineItems: typedFlowFixture.checkoutLineItems.map((key) => products[key]),
  checkoutSubtotalItems: typedFlowFixture.checkoutSubtotalItems.map((key) => products[key]),
  checkoutTaxItems: typedFlowFixture.checkoutTaxItems.map((key) => products[key]),
  checkoutMultiOrderItems: typedFlowFixture.checkoutMultiOrderItems.map((key) => products[key]),
  cartNavigationProduct: products[typedFlowFixture.cartNavigationProduct],
};
