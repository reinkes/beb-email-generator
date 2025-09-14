/**
 * @fileoverview Theme management for light/dark mode
 * @version 1.2.0
 */

/**
 * Theme manager for handling light/dark mode switching
 * Provides system preference detection, manual switching, and persistent storage
 */
class ThemeManager {
    constructor() {
        this.themes = {
            light: 'light',
            dark: 'dark',
            auto: 'auto'
        };

        this.currentTheme = this.getStoredTheme() || this.themes.auto;
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        this.initializeTheme();
        this.setupEventListeners();
    }

    /**
     * Initialize theme system
     * @private
     */
    initializeTheme() {
        this.applyTheme(this.currentTheme);
        this.updateThemeToggle();
    }

    /**
     * Setup theme-related event listeners
     * @private
     */
    setupEventListeners() {
        // Listen for system theme changes
        this.mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === this.themes.auto) {
                this.applySystemTheme();
            }
        });

        // Setup theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Apply theme to the document
     * @param {string} theme - Theme to apply
     */
    applyTheme(theme) {
        const html = document.documentElement;
        const body = document.body;

        // Remove existing theme classes
        html.classList.remove('theme-light', 'theme-dark');
        body.classList.remove('theme-light', 'theme-dark');

        if (theme === this.themes.auto) {
            this.applySystemTheme();
        } else {
            const themeClass = `theme-${theme}`;
            html.classList.add(themeClass);
            body.classList.add(themeClass);
            html.setAttribute('data-theme', theme);
        }

        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateThemeToggle();

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.getEffectiveTheme() }
        }));
    }

    /**
     * Apply system preference theme
     * @private
     */
    applySystemTheme() {
        const systemPrefersDark = this.mediaQuery.matches;
        const effectiveTheme = systemPrefersDark ? this.themes.dark : this.themes.light;

        const html = document.documentElement;
        const body = document.body;

        html.classList.remove('theme-light', 'theme-dark');
        body.classList.remove('theme-light', 'theme-dark');

        const themeClass = `theme-${effectiveTheme}`;
        html.classList.add(themeClass);
        body.classList.add(themeClass);
        html.setAttribute('data-theme', effectiveTheme);
    }

    /**
     * Toggle between themes
     */
    toggleTheme() {
        const themeOrder = [this.themes.light, this.themes.dark, this.themes.auto];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];

        this.applyTheme(nextTheme);
    }

    /**
     * Set specific theme
     * @param {string} theme - Theme to set
     */
    setTheme(theme) {
        if (Object.values(this.themes).includes(theme)) {
            this.applyTheme(theme);
        }
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Get effective theme (resolves auto to actual theme)
     * @returns {string} Effective theme
     */
    getEffectiveTheme() {
        if (this.currentTheme === this.themes.auto) {
            return this.mediaQuery.matches ? this.themes.dark : this.themes.light;
        }
        return this.currentTheme;
    }

    /**
     * Check if dark theme is active
     * @returns {boolean} Whether dark theme is active
     */
    isDarkMode() {
        return this.getEffectiveTheme() === this.themes.dark;
    }

    /**
     * Update theme toggle button
     * @private
     */
    updateThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const icons = {
            light: '☀️',
            dark: '🌙',
            auto: '🔄'
        };

        const labels = {
            light: 'Hell',
            dark: 'Dunkel',
            auto: 'System'
        };

        themeToggle.innerHTML = `${icons[this.currentTheme]} ${labels[this.currentTheme]}`;
        themeToggle.setAttribute('aria-label', `Theme: ${labels[this.currentTheme]}`);
        themeToggle.title = `Aktuelles Theme: ${labels[this.currentTheme]}. Klicken zum Wechseln.`;
    }

    /**
     * Save theme preference
     * @private
     * @param {string} theme - Theme to save
     */
    saveTheme(theme) {
        try {
            localStorage.setItem('bebEmailGenerator_theme', theme);
        } catch (error) {
            console.warn('Could not save theme preference:', error);
        }
    }

    /**
     * Get stored theme preference
     * @private
     * @returns {string|null} Stored theme or null
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('bebEmailGenerator_theme');
        } catch (error) {
            return null;
        }
    }

    /**
     * Get theme statistics
     * @returns {Object} Theme usage statistics
     */
    getThemeStats() {
        return {
            current: this.currentTheme,
            effective: this.getEffectiveTheme(),
            systemPrefersDark: this.mediaQuery.matches,
            supportsColorScheme: !!window.matchMedia,
            timestamp: Date.now()
        };
    }

    /**
     * Export theme configuration
     * @returns {Object} Theme configuration
     */
    exportConfig() {
        return {
            theme: this.currentTheme,
            systemPreference: this.mediaQuery.matches ? 'dark' : 'light',
            effectiveTheme: this.getEffectiveTheme(),
            supportedThemes: Object.values(this.themes)
        };
    }

    /**
     * Import theme configuration
     * @param {Object} config - Theme configuration to import
     */
    importConfig(config) {
        if (config.theme && Object.values(this.themes).includes(config.theme)) {
            this.applyTheme(config.theme);
        }
    }

    /**
     * Reset theme to default
     */
    resetTheme() {
        this.applyTheme(this.themes.auto);
    }

    /**
     * Clean up theme manager
     */
    cleanup() {
        if (this.mediaQuery) {
            this.mediaQuery.removeEventListener('change', this.applySystemTheme);
        }
    }
}

// Export for use in main application
window.ThemeManager = ThemeManager;