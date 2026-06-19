Playwright API Testing Task — tests/api.spec.ts

Context

This is part of a QA onboarding project using a TypeScript/Playwright Page Object Model framework, testing against the OrangeHRM demo site. The project already has API endpoints for auth and employees. This task adds a new spec file focused purely on API-level testing (no browser UI), using Playwright's request fixture / APIRequestContext.

Goal

Create tests/api.spec.ts with authenticated API tests covering success, auth failure, and not-found scenarios.

Requirements

1. Auth setup


Use test.beforeAll to log in once and obtain whatever credential the API issues (bearer token or session cookie).
Store it in a variable accessible to all tests in the file.
Reuse it in subsequent requests (via Authorization header if token-based, or automatically via the request context if cookie-based).


2. Required tests

Test 1 — Valid request returns 200 with employee data


Send an authenticated GET request to the employees endpoint.
Assert response.status() === 200.
Assert the response body actually contains employee records (e.g. array is non-empty, or a known field/shape is present) — not just the status code.


Test 2 — Unauthenticated request returns 401


Send the same (or equivalent) request without the auth token/cookie attached.
Assert response.status() === 401.


Test 3 — Non-existent employee returns 404


Send a GET request for a single employee using an ID that does not exist (e.g. a very large/unlikely ID).
Assert response.status() === 404.


3. Validation steps


Run npx playwright test tests/api.spec.ts and confirm all three new tests pass.
Run the full suite with npx playwright test and confirm all existing tests (MPS-001, MPS-002, MPS-003, MPS-004) still pass alongside the new API tests — total should be at least 12 passing tests.
Take a screenshot of the terminal showing all tests passing across all spec files.
Push the changes to GitHub.