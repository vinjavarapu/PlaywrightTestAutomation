import { environment } from '../config/environment';
import userFixture from './users.json';

export interface TestUser {
  readonly username: string;
  readonly password: string;
}

export const users = {
  standard: {
    username: environment.standardUsername,
    password: environment.standardPassword,
  },
  lockedOut: { ...userFixture.lockedOut, password: environment.standardPassword },
  problem: { ...userFixture.problem, password: environment.standardPassword },
  performanceGlitch: { ...userFixture.performanceGlitch, password: environment.standardPassword },
} as const satisfies Record<string, TestUser>;
