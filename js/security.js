/**
 * @fileoverview Security utilities and data protection
 * @version 1.1.0
 */

/**
 * Security manager for data protection and input sanitization
 * Handles CSP, data encryption, input validation, and privacy controls
 */
class SecurityManager {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.sensitiveDataPatterns = {
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /(?:\+49|0)[1-9]\d{1,4}\s?\d{1,7}/g,
            // Add more patterns as needed
        };

        this.privacyMode = this.getPrivacyMode();
        this.initializeSecurity();
    }

    /**
     * Initialize security measures
     * @private
     */
    initializeSecurity() {
        this.setupCSP();
        this.setupEventListeners();
        this.validateEnvironment();
    }

    /**
     * Setup Content Security Policy (CSP) recommendations
     * @private
     */
    setupCSP() {
        // Check if CSP is already configured
        const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

        if (!metaCSP && !document.location.protocol.includes('file:')) {
            console.warn('🔒 Security recommendation: Configure Content Security Policy (CSP)');
            console.info('Recommended CSP:', this.getRecommendedCSP());
        }
    }

    /**
     * Get recommended CSP configuration
     * @returns {string} Recommended CSP header value
     */
    getRecommendedCSP() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // Needed for inline scripts
            "style-src 'self' 'unsafe-inline'",  // Needed for inline styles
            "img-src 'self' data:",
            "font-src 'self'",
            "connect-src 'self'",
            "form-action 'self'",
            "base-uri 'self'",
            "frame-ancestors 'none'"
        ].join('; ');
    }

    /**
     * Setup security event listeners
     * @private
     */
    setupEventListeners() {
        // Monitor for potential XSS attempts
        document.addEventListener('DOMNodeInserted', (event) => {
            this.scanForXSS(event.target);
        });

        // Monitor for suspicious form submissions
        document.addEventListener('submit', (event) => {
            this.validateFormSubmission(event);
        });

        // Monitor for privacy violations
        window.addEventListener('beforeunload', () => {
            if (this.privacyMode) {
                this.clearSensitiveData();
            }
        });
    }

    /**
     * Validate runtime environment
     * @private
     */
    validateEnvironment() {
        const checks = {
            https: location.protocol === 'https:' || location.hostname === 'localhost',
            localStorage: this.testLocalStorageSecurity(),
            xssProtection: this.testXSSProtection(),
            iframeProtection: window.self === window.top
        };

        Object.entries(checks).forEach(([check, passed]) => {
            if (!passed) {
                console.warn(`🔒 Security warning: ${check} check failed`);
            }
        });

        return checks;
    }

    /**
     * Test localStorage security
     * @private
     * @returns {boolean} Whether localStorage is secure
     */
    testLocalStorageSecurity() {
        try {
            const testKey = '__security_test__';
            const testValue = 'test_data';

            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            return retrieved === testValue;
        } catch (error) {
            return false;
        }
    }

    /**
     * Test XSS protection
     * @private
     * @returns {boolean} Whether XSS protection is working
     */
    testXSSProtection() {
        // Simple test for basic XSS protection
        const testScript = '<script>window.__xss_test__ = true;</script>';
        const div = document.createElement('div');
        div.innerHTML = testScript;

        return !window.__xss_test__;
    }

    /**
     * Sanitize user input to prevent XSS
     * @param {string} input - User input to sanitize
     * @param {Object} options - Sanitization options
     * @returns {string} Sanitized input
     */
    sanitizeInput(input, options = {}) {
        if (typeof input !== 'string') {
            return input;
        }

        const config = {
            allowHtml: options.allowHtml || false,
            maxLength: options.maxLength || 10000,
            stripScripts: options.stripScripts !== false,
            stripEvents: options.stripEvents !== false,
            ...options
        };

        let sanitized = input;

        // Limit length
        if (sanitized.length > config.maxLength) {
            sanitized = sanitized.substring(0, config.maxLength);
        }

        // Remove or escape HTML if not allowed
        if (!config.allowHtml) {
            sanitized = this.escapeHtml(sanitized);
        }

        // Remove script tags
        if (config.stripScripts) {
            sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }

        // Remove event handlers
        if (config.stripEvents) {
            sanitized = sanitized.replace(/\s*on\w+\s*=\s*["']?[^"'>]*["']?/gi, '');
        }

        // Remove potentially dangerous protocols
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/vbscript:/gi, '');
        sanitized = sanitized.replace(/data:/gi, '');

        return sanitized.trim();
    }

    /**
     * Escape HTML characters
     * @private
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, char => map[char]);
    }

    /**
     * Scan DOM node for potential XSS
     * @private
     * @param {Node} node - DOM node to scan
     */
    scanForXSS(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const element = node;
        const tagName = element.tagName?.toLowerCase();

        // Check for dangerous tags
        if (['script', 'object', 'embed', 'iframe'].includes(tagName)) {
            console.warn('🚨 Potential XSS attempt detected:', element);
            element.remove();
            return;
        }

        // Check for dangerous attributes
        const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover'];
        dangerousAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                console.warn('🚨 Dangerous attribute detected:', attr, element);
                element.removeAttribute(attr);
            }
        });

        // Check for javascript: protocols
        const links = ['href', 'src', 'action'];
        links.forEach(attr => {
            const value = element.getAttribute(attr);
            if (value && value.toLowerCase().startsWith('javascript:')) {
                console.warn('🚨 Dangerous protocol detected:', attr, value);
                element.removeAttribute(attr);
            }
        });
    }

    /**
     * Validate form submission for security
     * @private
     * @param {Event} event - Submit event
     */
    validateFormSubmission(event) {
        const form = event.target;
        const formData = new FormData(form);

        for (const [name, value] of formData.entries()) {
            if (typeof value === 'string') {
                // Check for potential XSS in form data
                if (this.containsSuspiciousContent(value)) {
                    console.warn('🚨 Suspicious form data detected:', name, value);
                    event.preventDefault();
                    alert('Ungültige Daten erkannt. Bitte überprüfen Sie Ihre Eingabe.');
                    return;
                }
            }
        }
    }

    /**
     * Check if content contains suspicious patterns
     * @private
     * @param {string} content - Content to check
     * @returns {boolean} Whether content is suspicious
     */
    containsSuspiciousContent(content) {
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /onload=/i,
            /onclick=/i,
            /onerror=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(content));
    }

    /**
     * Encrypt sensitive data for storage
     * @param {string} data - Data to encrypt
     * @returns {string} Encrypted data
     */
    encryptData(data) {
        if (!data || typeof data !== 'string') return data;

        try {
            // Simple encryption for client-side use (not cryptographically secure)
            // For production, use proper encryption libraries
            const key = this.encryptionKey;
            let encrypted = '';

            for (let i = 0; i < data.length; i++) {
                const keyChar = key[i % key.length];
                const encryptedChar = String.fromCharCode(data.charCodeAt(i) ^ keyChar.charCodeAt(0));
                encrypted += encryptedChar;
            }

            return btoa(encrypted); // Base64 encode
        } catch (error) {
            console.warn('Encryption failed:', error);
            return data;
        }
    }

    /**
     * Decrypt sensitive data
     * @param {string} encryptedData - Encrypted data
     * @returns {string} Decrypted data
     */
    decryptData(encryptedData) {
        if (!encryptedData || typeof encryptedData !== 'string') return encryptedData;

        try {
            const encrypted = atob(encryptedData); // Base64 decode
            const key = this.encryptionKey;
            let decrypted = '';

            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = key[i % key.length];
                const decryptedChar = String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
                decrypted += decryptedChar;
            }

            return decrypted;
        } catch (error) {
            console.warn('Decryption failed:', error);
            return encryptedData;
        }
    }

    /**
     * Generate encryption key for session
     * @private
     * @returns {string} Encryption key
     */
    generateEncryptionKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';

        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return key;
    }

    /**
     * Mask sensitive data for display
     * @param {string} data - Data to mask
     * @param {string} type - Data type (email, phone, etc.)
     * @returns {string} Masked data
     */
    maskSensitiveData(data, type = 'auto') {
        if (!data || typeof data !== 'string') return data;

        switch (type) {
            case 'email':
                return data.replace(/(.{2})(.*)(@.+)/, '$1***$3');

            case 'phone':
                return data.replace(/(\d{3})\d+(\d{2})/, '$1***$2');

            case 'name':
                return data.replace(/\b\w+/g, (word, index) =>
                    index === 0 ? word : word.charAt(0) + '*'.repeat(word.length - 1)
                );

            case 'auto':
            default:
                // Auto-detect and mask
                if (this.sensitiveDataPatterns.email.test(data)) {
                    return this.maskSensitiveData(data, 'email');
                }
                if (this.sensitiveDataPatterns.phone.test(data)) {
                    return this.maskSensitiveData(data, 'phone');
                }
                return data;
        }
    }

    /**
     * Get privacy mode setting
     * @private
     * @returns {boolean} Whether privacy mode is enabled
     */
    getPrivacyMode() {
        try {
            const setting = localStorage.getItem('bebEmailGenerator_privacyMode');
            return setting === 'true';
        } catch {
            return false;
        }
    }

    /**
     * Set privacy mode
     * @param {boolean} enabled - Whether to enable privacy mode
     */
    setPrivacyMode(enabled) {
        this.privacyMode = enabled;
        try {
            localStorage.setItem('bebEmailGenerator_privacyMode', enabled.toString());
        } catch (error) {
            console.warn('Could not save privacy mode setting:', error);
        }
    }

    /**
     * Clear sensitive data from memory and storage
     */
    clearSensitiveData() {
        try {
            // Clear localStorage items that might contain sensitive data
            const keysToCheck = Object.keys(localStorage);
            keysToCheck.forEach(key => {
                if (key.startsWith('bebEmailGenerator')) {
                    const value = localStorage.getItem(key);
                    if (this.containsSensitiveData(value)) {
                        localStorage.removeItem(key);
                    }
                }
            });

            // Clear form fields
            const sensitiveFields = document.querySelectorAll('input[type="email"], input[type="text"], textarea');
            sensitiveFields.forEach(field => {
                if (this.containsSensitiveData(field.value)) {
                    field.value = '';
                }
            });

            console.info('🔒 Sensitive data cleared');
        } catch (error) {
            console.warn('Error clearing sensitive data:', error);
        }
    }

    /**
     * Check if data contains sensitive information
     * @private
     * @param {string} data - Data to check
     * @returns {boolean} Whether data contains sensitive information
     */
    containsSensitiveData(data) {
        if (!data || typeof data !== 'string') return false;

        return Object.values(this.sensitiveDataPatterns).some(pattern =>
            pattern.test(data)
        );
    }

    /**
     * Validate input against whitelist
     * @param {string} input - Input to validate
     * @param {string} type - Input type (name, email, time, etc.)
     * @returns {boolean} Whether input is valid
     */
    validateInput(input, type) {
        if (!input || typeof input !== 'string') return false;

        const whitelists = {
            name: /^[a-zA-ZäöüÄÖÜß\s\-.,]+$/,
            email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            class: /^[0-9]{1,2}[a-zA-Z]?$/,
            notes: /^[a-zA-ZäöüÄÖÜß0-9\s\-.,!?\n\r]+$/
        };

        const pattern = whitelists[type];
        return pattern ? pattern.test(input.trim()) : true;
    }

    /**
     * Generate security report
     * @returns {Object} Security status report
     */
    getSecurityReport() {
        return {
            environment: this.validateEnvironment(),
            privacyMode: this.privacyMode,
            cspConfigured: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            httpsEnabled: location.protocol === 'https:',
            localStorageSecure: this.testLocalStorageSecurity(),
            recommendations: this.getSecurityRecommendations(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get security recommendations
     * @private
     * @returns {Array<string>} Security recommendations
     */
    getSecurityRecommendations() {
        const recommendations = [];
        const report = this.validateEnvironment();

        if (!report.https && location.hostname !== 'localhost') {
            recommendations.push('Enable HTTPS for production deployment');
        }

        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            recommendations.push('Configure Content Security Policy (CSP) headers');
        }

        if (!this.privacyMode) {
            recommendations.push('Consider enabling privacy mode for enhanced data protection');
        }

        return recommendations;
    }

    /**
     * Clean up security manager
     */
    cleanup() {
        if (this.privacyMode) {
            this.clearSensitiveData();
        }
    }
}

// Export for use in main application
window.SecurityManager = SecurityManager;