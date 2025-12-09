import { BasePage } from './BasePage.js';

export class RoomManagementPage extends BasePage {
    constructor(page) {
        super(page);

        // Selectors cho màn hình Quản lý phòng
        this.selectors = {
            // Page navigation
            pageTitle: '[data-testid="page-title"]',
            pageTitleAlt: 'h1, .page-title',

            // Room list
            roomsList: '[data-testid="rooms-list"]',
            roomsListAlt: '.rooms-container, .room-list',
            roomItem: '[data-testid="room-item"]',
            roomItemAlt: '.room-card, .room-item, tr[data-room-id]',

            // Pagination controls
            paginationContainer: '[data-testid="pagination"]',
            paginationContainerAlt: '.pagination, .pagination-container',

            // Pagination buttons
            firstPageButton: '[data-testid="page-1"]',
            firstPageButtonAlt: '.pagination button:first-child, .page-number[data-page="1"]',

            secondPageButton: '[data-testid="page-2"]',
            secondPageButtonAlt: '.pagination button:nth-child(2), .page-number[data-page="2"]',

            nextButton: '[data-testid="next-button"]',
            nextButtonAlt: '.pagination .next, button[aria-label="Next"], .pagination-next',

            previousButton: '[data-testid="previous-button"]',
            previousButtonAlt: '.pagination .previous, button[aria-label="Previous"], .pagination-prev',

            // Page info
            currentPageInfo: '[data-testid="current-page"]',
            currentPageInfoAlt: '.current-page, .page-info',

            totalPagesInfo: '[data-testid="total-pages"]',
            totalPagesInfoAlt: '.total-pages, .pagination-info',

            itemsPerPageInfo: '[data-testid="items-per-page"]',
            itemsPerPageInfoAlt: '.items-per-page, .page-size',

            totalItemsInfo: '[data-testid="total-items"]',
            totalItemsInfoAlt: '.total-items, .total-count',

            // Loading states
            loadingSpinner: '[data-testid="loading-spinner"]',
            loadingSpinnerAlt: '.loading, .spinner',

            // Empty state
            emptyState: '[data-testid="empty-rooms"]',
            emptyStateAlt: '.empty-state, .no-data'
        };
    }

    async goto() {
        await super.goto('/rooms'); // hoặc '/room-management' tùy theo routing
        await this.waitForPageLoad();
    }

    async waitForPageLoad() {
        try {
            // Wait for page title
            await this.page.waitForSelector(this.selectors.pageTitle, { timeout: 5000 });
        } catch {
            await this.page.waitForSelector(this.selectors.pageTitleAlt, { timeout: 5000 });
        }

        // Wait for rooms list or empty state
        try {
            await this.page.waitForSelector(this.selectors.roomsList, { timeout: 5000 });
        } catch {
            try {
                await this.page.waitForSelector(this.selectors.roomsListAlt, { timeout: 5000 });
            } catch {
                // Might be empty state
                await this.page.waitForSelector(this.selectors.emptyState, { timeout: 2000 });
            }
        }
    }

    // Room list methods
    async getRoomsCount() {
        try {
            const rooms = await this.page.locator(this.selectors.roomItem);
            return await rooms.count();
        } catch {
            const rooms = await this.page.locator(this.selectors.roomItemAlt);
            return await rooms.count();
        }
    }

    async getRoomItems() {
        try {
            return await this.page.locator(this.selectors.roomItem).all();
        } catch {
            return await this.page.locator(this.selectors.roomItemAlt).all();
        }
    }

    async isRoomsListVisible() {
        try {
            const roomsList = await this.page.locator(this.selectors.roomsList);
            return await roomsList.isVisible();
        } catch {
            const roomsList = await this.page.locator(this.selectors.roomsListAlt);
            return await roomsList.isVisible();
        }
    }

    // Pagination methods
    async isPaginationVisible() {
        try {
            const pagination = await this.page.locator(this.selectors.paginationContainer);
            return await pagination.isVisible();
        } catch {
            const pagination = await this.page.locator(this.selectors.paginationContainerAlt);
            return await pagination.isVisible();
        }
    }

    async clickFirstPage() {
        try {
            await this.click(this.selectors.firstPageButton);
        } catch {
            await this.click(this.selectors.firstPageButtonAlt);
        }
        await this.waitForPageLoad();
    }

    async clickSecondPage() {
        try {
            await this.click(this.selectors.secondPageButton);
        } catch {
            await this.click(this.selectors.secondPageButtonAlt);
        }
        await this.waitForPageLoad();
    }

    async clickNextButton() {
        try {
            await this.click(this.selectors.nextButton);
        } catch {
            await this.click(this.selectors.nextButtonAlt);
        }
        await this.waitForPageLoad();
    }

    async clickPreviousButton() {
        try {
            await this.click(this.selectors.previousButton);
        } catch {
            await this.click(this.selectors.previousButtonAlt);
        }
        await this.waitForPageLoad();
    }

    // Button state checking
    async isFirstPageButtonVisible() {
        try {
            const button = await this.page.locator(this.selectors.firstPageButton);
            return await button.isVisible();
        } catch {
            const button = await this.page.locator(this.selectors.firstPageButtonAlt);
            return await button.isVisible();
        }
    }

    async isSecondPageButtonVisible() {
        try {
            const button = await this.page.locator(this.selectors.secondPageButton);
            return await button.isVisible();
        } catch {
            const button = await this.page.locator(this.selectors.secondPageButtonAlt);
            return await button.isVisible();
        }
    }

    async isNextButtonVisible() {
        try {
            const button = await this.page.locator(this.selectors.nextButton);
            return await button.isVisible();
        } catch {
            const button = await this.page.locator(this.selectors.nextButtonAlt);
            return await button.isVisible();
        }
    }

    async isPreviousButtonVisible() {
        try {
            const button = await this.page.locator(this.selectors.previousButton);
            return await button.isVisible();
        } catch {
            const button = await this.page.locator(this.selectors.previousButtonAlt);
            return await button.isVisible();
        }
    }

    async isNextButtonEnabled() {
        try {
            const button = await this.page.locator(this.selectors.nextButton);
            return await button.isEnabled();
        } catch {
            const button = await this.page.locator(this.selectors.nextButtonAlt);
            return await button.isEnabled();
        }
    }

    async isPreviousButtonEnabled() {
        try {
            const button = await this.page.locator(this.selectors.previousButton);
            return await button.isEnabled();
        } catch {
            const button = await this.page.locator(this.selectors.previousButtonAlt);
            return await button.isEnabled();
        }
    }

    async isFirstPageButtonActive() {
        try {
            const button = await this.page.locator(this.selectors.firstPageButton);
            const className = await button.getAttribute('class');
            return className && (className.includes('active') || className.includes('current'));
        } catch {
            const button = await this.page.locator(this.selectors.firstPageButtonAlt);
            const className = await button.getAttribute('class');
            return className && (className.includes('active') || className.includes('current'));
        }
    }

    async isSecondPageButtonActive() {
        try {
            const button = await this.page.locator(this.selectors.secondPageButton);
            const className = await button.getAttribute('class');
            return className && (className.includes('active') || className.includes('current'));
        } catch {
            const button = await this.page.locator(this.selectors.secondPageButtonAlt);
            const className = await button.getAttribute('class');
            return className && (className.includes('active') || className.includes('current'));
        }
    }

    // Page information methods
    async getCurrentPageNumber() {
        try {
            const pageInfo = await this.page.locator(this.selectors.currentPageInfo);
            const text = await pageInfo.textContent();
            return parseInt(text.match(/\d+/)?.[0] || '1');
        } catch {
            try {
                const pageInfo = await this.page.locator(this.selectors.currentPageInfoAlt);
                const text = await pageInfo.textContent();
                return parseInt(text.match(/\d+/)?.[0] || '1');
            } catch {
                // Fallback: check active page button
                const activeButton = await this.page.locator('.pagination .active, .pagination .current');
                if (await activeButton.isVisible()) {
                    const text = await activeButton.textContent();
                    return parseInt(text.match(/\d+/)?.[0] || '1');
                }
                return 1;
            }
        }
    }

    async getTotalPages() {
        try {
            const totalInfo = await this.page.locator(this.selectors.totalPagesInfo);
            const text = await totalInfo.textContent();
            return parseInt(text.match(/\d+/)?.[0] || '1');
        } catch {
            try {
                const totalInfo = await this.page.locator(this.selectors.totalPagesInfoAlt);
                const text = await totalInfo.textContent();
                return parseInt(text.match(/\d+/)?.[0] || '1');
            } catch {
                // Fallback: count page buttons
                const pageButtons = await this.page.locator('.pagination button[data-page], .pagination .page-number');
                return await pageButtons.count();
            }
        }
    }

    async getItemsPerPage() {
        try {
            const itemsInfo = await this.page.locator(this.selectors.itemsPerPageInfo);
            const text = await itemsInfo.textContent();
            return parseInt(text.match(/\d+/)?.[0] || '10');
        } catch {
            try {
                const itemsInfo = await this.page.locator(this.selectors.itemsPerPageInfoAlt);
                const text = await itemsInfo.textContent();
                return parseInt(text.match(/\d+/)?.[0] || '10');
            } catch {
                // Default assumption
                return 10;
            }
        }
    }

    async getTotalItems() {
        try {
            const totalInfo = await this.page.locator(this.selectors.totalItemsInfo);
            const text = await totalInfo.textContent();
            return parseInt(text.match(/\d+/)?.[0] || '0');
        } catch {
            try {
                const totalInfo = await this.page.locator(this.selectors.totalItemsInfoAlt);
                const text = await totalInfo.textContent();
                return parseInt(text.match(/\d+/)?.[0] || '0');
            } catch {
                // Fallback: count current items and estimate
                const currentItems = await this.getRoomsCount();
                return currentItems;
            }
        }
    }

    // Utility methods
    async waitForLoadingToComplete() {
        try {
            // Wait for loading spinner to disappear
            await this.page.waitForSelector(this.selectors.loadingSpinner, { state: 'hidden', timeout: 10000 });
        } catch {
            try {
                await this.page.waitForSelector(this.selectors.loadingSpinnerAlt, { state: 'hidden', timeout: 10000 });
            } catch {
                // No loading spinner found, continue
            }
        }
    }

    async isEmptyState() {
        try {
            const emptyState = await this.page.locator(this.selectors.emptyState);
            return await emptyState.isVisible();
        } catch {
            const emptyState = await this.page.locator(this.selectors.emptyStateAlt);
            return await emptyState.isVisible();
        }
    }

    // Advanced pagination methods
    async navigateToPage(pageNumber) {
        const pageButton = await this.page.locator(`[data-testid="page-${pageNumber}"], .page-number[data-page="${pageNumber}"]`);

        if (await pageButton.isVisible()) {
            await pageButton.click();
            await this.waitForPageLoad();
            return true;
        }

        // If direct page button not visible, use next/previous navigation
        const currentPage = await this.getCurrentPageNumber();

        if (pageNumber > currentPage) {
            // Navigate forward
            for (let i = currentPage; i < pageNumber; i++) {
                if (await this.isNextButtonEnabled()) {
                    await this.clickNextButton();
                } else {
                    return false; // Cannot navigate further
                }
            }
        } else if (pageNumber < currentPage) {
            // Navigate backward
            for (let i = currentPage; i > pageNumber; i--) {
                if (await this.isPreviousButtonEnabled()) {
                    await this.clickPreviousButton();
                } else {
                    return false; // Cannot navigate further
                }
            }
        }

        return true;
    }

    async getAllPageNumbers() {
        const pageButtons = await this.page.locator('.pagination button[data-page], .pagination .page-number').all();
        const pageNumbers = [];

        for (const button of pageButtons) {
            const text = await button.textContent();
            const pageNum = parseInt(text.match(/\d+/)?.[0]);
            if (pageNum) {
                pageNumbers.push(pageNum);
            }
        }

        return pageNumbers.sort((a, b) => a - b);
    }

    // Validation methods
    async validatePaginationInfo() {
        const currentPage = await this.getCurrentPageNumber();
        const totalPages = await this.getTotalPages();
        const itemsPerPage = await this.getItemsPerPage();
        const totalItems = await this.getTotalItems();
        const currentItems = await this.getRoomsCount();

        return {
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems,
            currentItems,
            isValid: currentPage <= totalPages && currentItems <= itemsPerPage
        };
    }
}
