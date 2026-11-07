import authenticationFixture from './authentication.json';
import { environment } from '../config/environment';

export const invalidLoginScenarios = authenticationFixture.invalidLoginScenarios.map((scenario) => ({
  ...scenario,
  username: scenario.username === 'standard_user' ? environment.standardUsername : scenario.username,
  password: scenario.password === 'secret_sauce'
    ? environment.standardPassword
    : scenario.password,
}));
