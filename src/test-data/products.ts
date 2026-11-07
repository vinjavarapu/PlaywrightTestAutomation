import productFixture from './products.json';

export interface Product {
  readonly name: string;
  readonly price: number;
  readonly slug: string;
}

export const products = productFixture satisfies Record<string, Product>;

export const allProducts = Object.values(products);
