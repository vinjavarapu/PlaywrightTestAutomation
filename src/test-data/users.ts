import { environment } from '../config/environment';

export interface TestUser {
  readonly username: string;
  readonly password: string;
}

const demoPassword = environment.standardPassword;

export const users = {
  standard: {
    username: environment.standardUsername,
    password: demoPassword,
  },
  lockedOut: { username: 'locked_out_user', password: demoPassword },
  problem: { username: 'problem_user', password: demoPassword },
  performanceGlitch: { username: 'performance_glitch_user', password: demoPassword },
} as const satisfies Record<string, TestUser>;
