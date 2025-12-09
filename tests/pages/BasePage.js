export class BasePage {
    constructor(page) {
        this.page = page;
        this.baseURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    }

    // Navigation methods
    async goto(path = '') {
        const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
        await this.page.goto(url);
        await this.waitForPageLoad();
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    async reload() {
        await this.page.reload();
        await this.waitForPageLoad();
    }

    // Element interaction methods
    async click(selector, options = {}) {
        await this.page.click(selector, options);
    }

    async fill(selector, value) {
        await this.page.fill(selector, value);
    }

    async type(selector, text, options = {}) {
        await this.page.type(selector, text, options);
    }

    async selectOption(selector, value) {
        await this.page.selectOption(selector, value);
    }

    async check(selector) {
        await this.page.check(selector);
    }

    async uncheck(selector) {
        await this.page.uncheck(selector);
    }

    // Wait methods
    async waitForSelector(selector, options = {}) {
        return await this.page.waitForSelector(selector, options);
    }

    async waitForText(text, options = {}) {
        return await this.page.waitForFunction(
            text => document.body.innerText.includes(text),
            text,
            options
        );
    }

    async waitForURL(pattern, options = {}) {
        await this.page.waitForURL(pattern, options);
    }

    // Assertion helpers
    async expectVisible(selector) {
        await this.page.waitForSelector(selector, { state: 'visible' });
    }

    async expectHidden(selector) {
        await this.page.waitForSelector(selector, { state: 'hidden' });
    }

    async expectText(selector, text) {
        const element = await this.page.locator(selector);
        await element.waitFor();
        const actualText = await element.textContent();
        if (!actualText.includes(text)) {
            throw new Error(`Expected text "${text}" not found. Actual: "${actualText}"`);
        }
    }

    // Form helpers
    async fillForm(formData) {
        for (const [selector, value] of Object.entries(formData)) {
            await this.fill(selector, value);
        }
    }

    async submitForm(formSelector = 'form') {
        await this.page.locator(formSelector).press('Enter');
    }

    // Screenshot and debugging
    async takeScreenshot(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}-${timestamp}.png`;
        await this.page.screenshot({
            path: `tests/reports/screenshots/${filename}`,
            fullPage: true
        });
        return filename;
    }

    async getPageTitle() {
        return await this.page.title();
    }

    async getCurrentURL() {
        return this.page.url();
    }

    // Alert and dialog handling
    async handleAlert(action = 'accept', promptText = '') {
        this.page.on('dialog', async dialog => {
            if (action === 'accept') {
                await dialog.accept(promptText);
            } else {
                await dialog.dismiss();
            }
        });
    }

    // Local storage and cookies
    async getLocalStorage(key) {
        return await this.page.evaluate(key => localStorage.getItem(key), key);
    }

    async setLocalStorage(key, value) {
        await this.page.evaluate(
            ({ key, value }) => localStorage.setItem(key, value),
            { key, value }
        );
    }

    async clearLocalStorage() {
        await this.page.evaluate(() => localStorage.clear());
    }

    async getCookies() {
        return await this.page.context().cookies();
    }

    async setCookie(cookie) {
        await this.page.context().addCookies([cookie]);
    }

    // Performance helpers
    async measurePageLoadTime() {
        const startTime = Date.now();
        await this.waitForPageLoad();
        const endTime = Date.now();
        return endTime - startTime;
    }

    // Mobile helpers
    async setViewportSize(width, height) {
        await this.page.setViewportSize({ width, height });
    }

    async emulateDevice(device) {
        await this.page.emulate(device);
    }

    // Error handling
    async getConsoleErrors() {
        const errors = [];
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        return errors;
    }

    async getNetworkErrors() {
        const errors = [];
        this.page.on('response', response => {
            if (response.status() >= 400) {
                errors.push({
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText()
                });
            }
        });
        return errors;
    }
}
