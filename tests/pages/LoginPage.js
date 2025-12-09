import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
    constructor(page) {
        super(page);

        // Selectors
        this.selectors = {
            emailInput: '[data-testid="email-input"]',
            passwordInput: '[data-testid="password-input"]',
            loginButton: '[data-testid="login-button"]',
            rememberMeCheckbox: '[data-testid="remember-me"]',
            forgotPasswordLink: '[data-testid="forgot-password-link"]',
            signupLink: '[data-testid="signup-link"]',
            errorMessage: '[data-testid="error-message"]',
            successMessage: '[data-testid="success-message"]',
            loadingSpinner: '[data-testid="loading-spinner"]',

            // Alternative selectors if data-testid not available
            emailInputAlt: 'input#username',
            passwordInputAlt: 'input[type="password"]',
            loginButtonAlt: 'button[type="submit"]',

            // Form container
            loginForm: '[data-testid="login-form"]',
            loginFormAlt: 'form'
        };
    }

    async goto() {
        await super.goto('/login');
        await this.waitForLoginPageLoad();
    }

    async waitForLoginPageLoad() {
        // Wait for either primary or alternative selectors
        try {
            await this.page.waitForSelector(this.selectors.loginForm, { timeout: 5000 });
        } catch {
            await this.page.waitForSelector(this.selectors.loginFormAlt, { timeout: 5000 });
        }
    }

    async fillEmail(email) {
        try {
            await this.fill(this.selectors.emailInput, email);
        } catch {
            await this.fill(this.selectors.emailInputAlt, email);
        }
    }

    async fillPassword(password) {
        try {
            await this.fill(this.selectors.passwordInput, password);
        } catch {
            await this.fill(this.selectors.passwordInputAlt, password);
        }
    }

    async clickLogin() {
        try {
            await this.click(this.selectors.loginButton);
        } catch {
            await this.click(this.selectors.loginButtonAlt);
        }
    }

    async toggleRememberMe() {
        try {
            await this.click(this.selectors.rememberMeCheckbox);
        } catch {
            // If remember me checkbox doesn't exist, skip
            console.log('Remember me checkbox not found, skipping...');
        }
    }

    async clickForgotPassword() {
        await this.click(this.selectors.forgotPasswordLink);
    }

    async clickSignup() {
        await this.click(this.selectors.signupLink);
    }

    async login(email, password, rememberMe = false) {
        await this.fillEmail(email);
        await this.fillPassword(password);

        if (rememberMe) {
            await this.toggleRememberMe();
        }

        await this.clickLogin();
    }

    async loginAsTestUser() {
        await this.login(
            process.env.TEST_USER_EMAIL,
            process.env.TEST_USER_PASSWORD
        );
    }

    async loginAsAdmin() {
        await this.login(
            process.env.ADMIN_EMAIL,
            process.env.ADMIN_PASSWORD
        );
    }

    async waitForLoginSuccess() {
        // Wait for redirect to dashboard or success message
        try {
            await this.page.waitForURL('**/dashboard', { timeout: 10000 });
        } catch {
            // Alternative: wait for success message
            await this.waitForSelector(this.selectors.successMessage, { timeout: 10000 });
        }
    }

    async waitForLoginError() {
        await this.waitForSelector(this.selectors.errorMessage, { timeout: 5000 });
    }

    async getErrorMessage() {
        try {
            const errorElement = await this.page.locator(this.selectors.errorMessage);
            return await errorElement.textContent();
        } catch {
            return null;
        }
    }

    async getSuccessMessage() {
        try {
            const successElement = await this.page.locator(this.selectors.successMessage);
            return await successElement.textContent();
        } catch {
            return null;
        }
    }

    async isLoginButtonDisabled() {
        try {
            const button = await this.page.locator(this.selectors.loginButton);
            return await button.isDisabled();
        } catch {
            const button = await this.page.locator(this.selectors.loginButtonAlt);
            return await button.isDisabled();
        }
    }

    async isLoadingSpinnerVisible() {
        try {
            const spinner = await this.page.locator(this.selectors.loadingSpinner);
            return await spinner.isVisible();
        } catch {
            return false;
        }
    }

    async clearForm() {
        await this.fillEmail('');
        await this.fillPassword('');
    }

    // Validation helpers
    async validateEmailField() {
        const emailInput = await this.page.locator(this.selectors.emailInput);
        const validationMessage = await emailInput.evaluate(el => el.validationMessage);
        return validationMessage;
    }

    async validatePasswordField() {
        const passwordInput = await this.page.locator(this.selectors.passwordInput);
        const validationMessage = await passwordInput.evaluate(el => el.validationMessage);
        return validationMessage;
    }

    // Test data helpers
    async loginWithInvalidCredentials() {
        await this.login('invalid@email.com', 'wrongpassword');
    }

    async loginWithEmptyFields() {
        await this.login('', '');
    }

    async loginWithInvalidEmail() {
        await this.login('invalid-email', 'password123');
    }

    async loginWithShortPassword() {
        await this.login('test@example.com', '123');
    }

    // Performance testing
    async measureLoginTime(email, password) {
        const startTime = Date.now();
        await this.login(email, password);
        await this.waitForLoginSuccess();
        const endTime = Date.now();
        return endTime - startTime;
    }

    // Accessibility helpers
    async checkAccessibility() {
        const issues = [];

        // Check for proper labels
        const emailInput = await this.page.locator(this.selectors.emailInput);
        const emailLabel = await emailInput.getAttribute('aria-label') ||
            await emailInput.getAttribute('placeholder');
        if (!emailLabel) {
            issues.push('Email input missing label or placeholder');
        }

        const passwordInput = await this.page.locator(this.selectors.passwordInput);
        const passwordLabel = await passwordInput.getAttribute('aria-label') ||
            await passwordInput.getAttribute('placeholder');
        if (!passwordLabel) {
            issues.push('Password input missing label or placeholder');
        }

        // Check for keyboard navigation
        await emailInput.focus();
        await this.page.keyboard.press('Tab');
        const focusedElement = await this.page.evaluate(() => document.activeElement.tagName);
        if (focusedElement !== 'INPUT') {
            issues.push('Tab navigation not working properly');
        }

        return issues;
    }
}
