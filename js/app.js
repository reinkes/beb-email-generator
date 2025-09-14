/**
 * @fileoverview Main application entry point
 * @version 1.1.0
 */

/**
 * BEB Email Generator Application
 * Main application class that coordinates all modules
 */
class BEBEmailApp {
    constructor() {
        this.version = '1.1.0';
        this.isInitialized = false;

        // Module instances
        this.storage = null;
        this.validation = null;
        this.calendar = null;
        this.email = null;
        this.ui = null;

        // Application state
        this.debugMode = false;
    }

    /**
     * Initialize the application
     * Creates all modules and sets up the application
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            console.info(`🚀 Initializing BEB Email Generator v${this.version}`);

            // Check browser compatibility
            this.checkBrowserCompatibility();

            // Initialize modules in dependency order
            this.initializeModules();

            // Initialize UI (must be last as it depends on all other modules)
            await this.ui.initialize();

            // Set up error handling
            this.setupErrorHandling();

            // Mark as initialized
            this.isInitialized = true;

            console.info('✅ Application initialized successfully');

            // Show version info if in debug mode
            if (this.debugMode) {
                this.showDebugInfo();
            }

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Check browser compatibility
     * @private
     */
    checkBrowserCompatibility() {
        const features = {
            localStorage: () => !!window.localStorage,
            classList: () => !!document.body.classList,
            querySelector: () => !!document.querySelector,
            addEventListener: () => !!window.addEventListener,
            JSON: () => !!window.JSON
        };

        const missingFeatures = [];

        Object.entries(features).forEach(([feature, check]) => {
            try {
                if (!check()) {
                    missingFeatures.push(feature);
                }
            } catch (error) {
                missingFeatures.push(feature);
            }
        });

        if (missingFeatures.length > 0) {
            throw new Error(`Browser not supported. Missing features: ${missingFeatures.join(', ')}`);
        }
    }

    /**
     * Initialize all modules
     * @private
     */
    initializeModules() {
        console.info('📦 Initializing modules...');

        // Initialize theme, performance and security modules first
        this.theme = new ThemeManager();
        this.performance = new PerformanceManager();
        this.security = new SecurityManager();

        // Initialize core modules (no dependencies)
        this.storage = new StorageManager();
        this.validation = new ValidationManager();
        this.calendar = new CalendarManager();

        // Initialize email module (depends on calendar and validation)
        this.email = new EmailManager(this.calendar, this.validation);

        // Initialize UI module (depends on all other modules)
        this.ui = new UIManager(this.storage, this.validation, this.email, this.calendar);

        // Optimize critical functions with performance monitoring
        this.optimizePerformance();

        console.info('✅ All modules initialized');
    }

    /**
     * Optimize performance of critical functions
     * @private
     */
    optimizePerformance() {
        if (!this.performance) return;

        // Optimize auto-save functionality
        if (this.ui && this.ui.saveFormData) {
            this.ui.saveFormData = this.performance.optimizeAutoSave(this.ui.saveFormData.bind(this.ui));
        }

        // Optimize email generation
        if (this.email && this.email.generateEmail) {
            const originalGenerate = this.email.generateEmail.bind(this.email);
            this.email.generateEmail = this.performance.optimizeEmailGeneration(originalGenerate);
        }

        // Optimize validation functions
        if (this.validation) {
            if (this.validation.validateEmail) {
                const originalEmailValidation = this.validation.validateEmail.bind(this.validation);
                this.validation.validateEmail = this.performance.optimizeValidation(originalEmailValidation);
            }

            if (this.validation.validateTime) {
                const originalTimeValidation = this.validation.validateTime.bind(this.validation);
                this.validation.validateTime = this.performance.optimizeValidation(originalTimeValidation);
            }
        }

        console.info('⚡ Performance optimizations applied');
    }

    /**
     * Setup global error handling
     * @private
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, event);
        });
    }

    /**
     * Handle global errors
     * @private
     * @param {Error} error - The error that occurred
     * @param {Event} event - The error event
     */
    handleGlobalError(error, event) {
        console.error('🚨 Global error caught:', error);

        // Prevent default browser error handling
        event?.preventDefault?.();

        // Clear any loading states
        if (this.ui?.clearAllLoadingStates) {
            this.ui.clearAllLoadingStates();
        }

        // Show user-friendly error message
        if (error instanceof Error) {
            this.showUserError(error.message);
        } else {
            this.showUserError('Ein unerwarteter Fehler ist aufgetreten.');
        }
    }

    /**
     * Handle initialization errors
     * @private
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc2626;">
                    <h2>⚠️ Initialisierungsfehler</h2>
                    <p>Die Anwendung konnte nicht gestartet werden.</p>
                    <p><strong>Fehler:</strong> ${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Seite neu laden
                    </button>
                </div>
            `;
        }
    }

    /**
     * Show user-friendly error message
     * @private
     * @param {string} message - Error message
     */
    showUserError(message) {
        // Try to use a more user-friendly notification if available
        if (typeof alert === 'function') {
            alert(`⚠️ Fehler: ${message}\n\nBitte versuchen Sie es erneut oder laden Sie die Seite neu.`);
        }
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        console.info('🐛 Debug mode enabled');

        // Add debug methods to window for console access
        window.bebApp = this;
        window.debugApp = {
            getStorage: () => this.storage?.getStorageInfo?.(),
            clearStorage: () => this.storage?.clearFormData?.(),
            getValidation: () => this.validation,
            getCalendar: () => this.calendar,
            getEmail: () => this.email,
            getUI: () => this.ui,
            getTheme: () => this.theme?.getThemeStats?.(),
            getPerformance: () => this.performance?.getMetrics?.(),
            getSecurity: () => this.security?.getSecurityReport?.(),
            getCacheStats: () => this.performance?.getCacheStats?.(),
            getMemoryUsage: () => this.performance?.getMemoryUsage?.(),
            clearCache: () => this.performance?.clearCache?.(),
            toggleTheme: () => this.theme?.toggleTheme?.(),
            setTheme: (theme) => this.theme?.setTheme?.(theme),
            version: this.version
        };
    }

    /**
     * Show debug information
     * @private
     */
    showDebugInfo() {
        const storageInfo = this.storage?.getStorageInfo?.() || { available: false };
        const currentWeek = this.calendar?.getCurrentWeekInfo?.() || { formatted: 'Unknown' };

        console.group('🐛 Debug Information');
        console.info('Version:', this.version);
        console.info('Storage:', storageInfo);
        console.info('Current Week:', currentWeek);
        console.info('Modules:', {
            storage: !!this.storage,
            validation: !!this.validation,
            calendar: !!this.calendar,
            email: !!this.email,
            ui: !!this.ui && this.ui.isReady()
        });
        console.info('Debug commands available as: window.debugApp');
        console.groupEnd();
    }

    /**
     * Get application version
     * @returns {string} Application version
     */
    getVersion() {
        return this.version;
    }

    /**
     * Get initialization status
     * @returns {boolean} Whether the app is initialized
     */
    isReady() {
        return this.isInitialized && this.ui?.isReady();
    }

    /**
     * Get storage info for diagnostics
     * @returns {Object} Storage information
     */
    getStorageInfo() {
        return this.storage?.getStorageInfo() || { available: false };
    }

    /**
     * Clear all application data
     * @returns {boolean} Success status
     */
    clearAppData() {
        if (!confirm('Möchten Sie wirklich alle gespeicherten Daten löschen?')) {
            return false;
        }

        const success = this.storage?.clearFormData() || false;
        if (success) {
            alert('✅ Alle Daten wurden gelöscht.');
            location.reload();
        } else {
            alert('❌ Fehler beim Löschen der Daten.');
        }

        return success;
    }

    /**
     * Export application state for debugging
     * @returns {Object} Application state
     */
    exportDebugState() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            storage: this.getStorageInfo(),
            selectedWeek: this.ui?.getSelectedWeek(),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create global app instance
        window.bebEmailApp = new BEBEmailApp();

        // Enable debug mode if in development
        if (location.hostname === 'localhost' || location.search.includes('debug=true')) {
            window.bebEmailApp.enableDebugMode();
        }

        // Initialize the application
        await window.bebEmailApp.initialize();

    } catch (error) {
        console.error('Failed to start application:', error);
    }
});

// Export for testing and debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BEBEmailApp;
}