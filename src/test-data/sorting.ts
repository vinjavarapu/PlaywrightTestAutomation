import sortFixture from './sorting.json';
import { type InventorySort } from '../pages/InventoryPage';

export type SortScenario = {
  readonly id: string;
  readonly label: string;
  readonly option: InventorySort;
  readonly field: 'name' | 'price';
  readonly direction: 'ascending' | 'descending';
};

export const sortScenarios = sortFixture as SortScenario[];
