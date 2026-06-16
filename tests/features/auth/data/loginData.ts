// features/auth/data/loginData.ts

import { TestUser } from "../../../types";

export const loginUsers: Record<string, TestUser> = {
  validUser: {
    scenario: 'Valid admin credentials',
    credentials: { username: 'Admin', password: 'admin123' },
  },
  invalidUser: {
    scenario: 'Wrong password',
    credentials: { username: 'Admin', password: 'wrongpassword' },
    expectedError: 'Invalid credentials',
  },
  emptyUsername: {
    scenario: 'Empty username field',
    credentials: { username: '', password: 'admin123' },
    expectedError: 'Required',
  },
  emptyPassword: {
    scenario: 'Empty password field',
    credentials: { username: 'Admin', password: '' },
    expectedError: 'Required',
  },
};