/**
 * @fileoverview Local storage management for auto-save functionality
 * @version 1.1.0
 */

/**
 * Storage manager for BEB Email Generator
 * Handles localStorage operations with error handling and data validation
 */
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'bebEmailGenerator';
        this.VERSION = '1.1.0';
    }

    /**
     * Save form data to localStorage
     * @param {Object} formData - Form data object to save
     * @param {string} selectedWeek - Currently selected week
     * @returns {boolean} Success status
     */
    saveFormData(formData, selectedWeek) {
        try {
            const dataToSave = {
                ...formData,
                selectedWeek,
                version: this.VERSION,
                timestamp: Date.now()
            };

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.warn('Auto-save failed:', error);
            return false;
        }
    }

    /**
     * Load form data from localStorage
     * @returns {Object|null} Saved form data or null if not found
     */
    loadFormData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (!saved) return null;

            const formData = JSON.parse(saved);

            // Version check for future migrations
            if (formData.version !== this.VERSION) {
                console.info('Storage version mismatch, using defaults');
            }

            return formData;
        } catch (error) {
            console.warn('Auto-load failed:', error);
            return null;
        }
    }

    /**
     * Clear all stored data
     * @returns {boolean} Success status
     */
    clearFormData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.warn('Clear storage failed:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} Storage availability
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get storage usage info
     * @returns {Object} Storage usage statistics
     */
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return { available: false };
        }

        try {
            const data = this.loadFormData();
            return {
                available: true,
                hasData: !!data,
                timestamp: data?.timestamp,
                version: data?.version
            };
        } catch {
            return { available: true, hasData: false };
        }
    }
}

// Export for use in main application
window.StorageManager = StorageManager;