

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TestUser {
  scenario: string;
  credentials: LoginCredentials;
  expectedError?: string;
}