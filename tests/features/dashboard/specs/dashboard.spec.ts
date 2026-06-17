import { test, expect,  } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../../auth/pages/LoginPage';
import { loginUsers } from '../../auth/data/loginData';



test.describe('Dashboard', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);

        await loginPage.goto();
        await loginPage.login(loginUsers.validUser.credentials);
        await dashboardPage.goto();
    });

    test('Dashboard page should load successfully', async () => {
        const isLoaded = await dashboardPage.isLoaded();
        expect(isLoaded).toBe(true);
    });

    test('is user logged in', async () => {
       const isLoaded = await dashboardPage.isLoaded();
       expect(isLoaded).toBe(true);
    });
})