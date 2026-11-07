import { randomUUID } from 'node:crypto';

export interface CustomerData {
  readonly firstName: string;
  readonly lastName: string;
  readonly postalCode: string;
}

export function createCustomerData(): CustomerData {
  const uniqueSuffix = randomUUID().replaceAll('-', '').slice(0, 8);
  return {
    firstName: `Test${uniqueSuffix}`,
    lastName: 'Automation',
    postalCode: '94043',
  };
}
