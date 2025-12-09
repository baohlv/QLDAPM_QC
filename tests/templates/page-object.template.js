import { BasePage } from '../pages/BasePage.js';

/**
 * Template for creating new Page Object Models
 * 
 * Usage:
 * 1. Copy this file to tests/pages/YourFeaturePage.js
 * 2. Replace [FEATURE_NAME] with your feature name
 * 3. Update selectors with actual element selectors
 * 4. Implement methods specific to your feature
 */

export class [FEATURE_NAME]Page extends BasePage {
    constructor(page) {
        super(page);

        // Define selectors for your feature
        this.selectors = {
            // Form elements
            mainForm: '[data-testid="[feature-name]-form"]',
            submitButton: '[data-testid="[feature-name]-submit"]',
            cancelButton: '[data-testid="[feature-name]-cancel"]',

            // Input fields (update with actual field names)
            nameInput: '[data-testid="name-input"]',
            emailInput: '[data-testid="email-input"]',
            phoneInput: '[data-testid="phone-input"]',

            // Display elements
            successMessage: '[data-testid="success-message"]',
            errorMessage: '[data-testid="error-message"]',
            loadingSpinner: '[data-testid="loading-spinner"]',

            // Lists and tables
            itemsList: '[data-testid="items-list"]',
            itemRow: '[data-testid="item-row"]',

            // Navigation
            backButton: '[data-testid="back-button"]',
            nextButton: '[data-testid="next-button"]',

            // Alternative selectors (fallback if data-testid not available)
            mainFormAlt: 'form',
            submitButtonAlt: 'button[type="submit"]',
            cancelButtonAlt: 'button[type="button"]'
        };
    }

  // Navigation methods
  async goto() {
        await super.goto('/[feature-path]'); // Update with actual path
        await this.waitForPageLoad();
    }

  async waitForPageLoad() {
        try {
            await this.page.waitForSelector(this.selectors.mainForm, { timeout: 5000 });
        } catch {
            await this.page.waitForSelector(this.selectors.mainFormAlt, { timeout: 5000 });
        }
    }

  // Form interaction methods
  async fillName(name) {
        await this.fill(this.selectors.nameInput, name);
    }

  async fillEmail(email) {
        await this.fill(this.selectors.emailInput, email);
    }

  async fillPhone(phone) {
        await this.fill(this.selectors.phoneInput, phone);
    }

  async submitForm() {
        try {
            await this.click(this.selectors.submitButton);
        } catch {
            await this.click(this.selectors.submitButtonAlt);
        }
    }

  async cancelForm() {
        try {
            await this.click(this.selectors.cancelButton);
        } catch {
            await this.click(this.selectors.cancelButtonAlt);
        }
    }

  // Complete form filling method
  async fillAndSubmitForm(formData) {
        if (formData.name) await this.fillName(formData.name);
        if (formData.email) await this.fillEmail(formData.email);
        if (formData.phone) await this.fillPhone(formData.phone);

        await this.submitForm();
    }

  // Wait methods
  async waitForSuccess() {
        await this.waitForSelector(this.selectors.successMessage, { timeout: 10000 });
    }

  async waitForError() {
        await this.waitForSelector(this.selectors.errorMessage, { timeout: 5000 });
    }

  async waitForLoading() {
        await this.waitForSelector(this.selectors.loadingSpinner, { timeout: 2000 });
    }

  // Message retrieval methods
  async getSuccessMessage() {
        try {
            const element = await this.page.locator(this.selectors.successMessage);
            return await element.textContent();
        } catch {
            return null;
        }
    }

  async getErrorMessage() {
        try {
            const element = await this.page.locator(this.selectors.errorMessage);
            return await element.textContent();
        } catch {
            return null;
        }
    }

  // State checking methods
  async isSubmitButtonDisabled() {
        try {
            const button = await this.page.locator(this.selectors.submitButton);
            return await button.isDisabled();
        } catch {
            const button = await this.page.locator(this.selectors.submitButtonAlt);
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

  // List/Table methods (if applicable)
  async getItemsCount() {
        try {
            const items = await this.page.locator(this.selectors.itemRow);
            return await items.count();
        } catch {
            return 0;
        }
    }

  async getItemByIndex(index) {
        const items = await this.page.locator(this.selectors.itemRow);
        return items.nth(index);
    }

  async clickItemByIndex(index) {
        const item = await this.getItemByIndex(index);
        await item.click();
    }

  // Validation methods
  async validateForm() {
        const validationErrors = [];

        // Check required fields
        const nameValue = await this.page.inputValue(this.selectors.nameInput);
        if (!nameValue) {
            validationErrors.push('Name is required');
        }

        const emailValue = await this.page.inputValue(this.selectors.emailInput);
        if (!emailValue) {
            validationErrors.push('Email is required');
        } else if (!emailValue.includes('@')) {
            validationErrors.push('Email format is invalid');
        }

        return validationErrors;
    }

  // Clear form method
  async clearForm() {
        await this.fill(this.selectors.nameInput, '');
        await this.fill(this.selectors.emailInput, '');
        await this.fill(this.selectors.phoneInput, '');
    }

  // Test data methods
  async fillWithTestData() {
        const testData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890'
        };

        await this.fillAndSubmitForm(testData);
    }

  async fillWithInvalidData() {
        const invalidData = {
            name: '',
            email: 'invalid-email',
            phone: 'invalid-phone'
        };

        await this.fillAndSubmitForm(invalidData);
    }

  // Performance measurement
  async measureFormSubmissionTime(formData) {
        const startTime = Date.now();
        await this.fillAndSubmitForm(formData);
        await this.waitForSuccess();
        const endTime = Date.now();
        return endTime - startTime;
    }

  // Accessibility helpers
  async checkAccessibility() {
        const issues = [];

        // Check for proper labels
        const nameInput = await this.page.locator(this.selectors.nameInput);
        const nameLabel = await nameInput.getAttribute('aria-label') ||
            await nameInput.getAttribute('placeholder');
        if (!nameLabel) {
            issues.push('Name input missing label or placeholder');
        }

        // Check for keyboard navigation
        await nameInput.focus();
        await this.page.keyboard.press('Tab');
        const focusedElement = await this.page.evaluate(() => document.activeElement.tagName);
        if (focusedElement !== 'INPUT') {
            issues.push('Tab navigation not working properly');
        }

        return issues;
    }

  // Mobile-specific methods
  async scrollToElement(selector) {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }

  async swipeLeft() {
        const viewport = this.page.viewportSize();
        await this.page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
        await this.page.mouse.down();
        await this.page.mouse.move(viewport.width * 0.2, viewport.height * 0.5);
        await this.page.mouse.up();
    }

  async swipeRight() {
        const viewport = this.page.viewportSize();
        await this.page.mouse.move(viewport.width * 0.2, viewport.height * 0.5);
        await this.page.mouse.down();
        await this.page.mouse.move(viewport.width * 0.8, viewport.height * 0.5);
        await this.page.mouse.up();
    }
}
