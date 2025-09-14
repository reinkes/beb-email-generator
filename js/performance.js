/**
 * @fileoverview Performance optimization utilities
 * @version 1.1.0
 */

/**
 * Performance utilities for optimization and monitoring
 * Includes caching, debouncing, throttling, and performance monitoring
 */
class PerformanceManager {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.metrics = {
            pageLoad: 0,
            moduleLoad: 0,
            formSave: 0,
            emailGeneration: 0,
            validation: 0
        };

        this.observers = {
            intersection: null,
            performance: null
        };

        this.initializePerformanceMonitoring();
    }

    /**
     * Initialize performance monitoring
     * @private
     */
    initializePerformanceMonitoring() {
        // Measure page load performance
        if (typeof performance !== 'undefined' && performance.timing) {
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                this.metrics.pageLoad = loadTime;
                console.info(`📊 Page load time: ${loadTime}ms`);
            });
        }

        // Monitor Long Tasks (if supported)
        if ('PerformanceObserver' in window) {
            try {
                this.observers.performance = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
                        }
                    }
                });

                this.observers.performance.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // PerformanceObserver not fully supported
                console.info('Performance monitoring not fully supported');
            }
        }
    }

    /**
     * Debounce function execution
     * @param {string} key - Unique identifier for the debounced function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Debounce delay in milliseconds
     * @param {...any} args - Arguments to pass to the function
     */
    debounce(key, func, wait, ...args) {
        // Clear existing timer
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        // Set new timer
        const timerId = setTimeout(() => {
            func.apply(this, args);
            this.debounceTimers.delete(key);
        }, wait);

        this.debounceTimers.set(key, timerId);
    }

    /**
     * Throttle function execution
     * @param {string} key - Unique identifier for the throttled function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Minimum time between executions in milliseconds
     * @param {...any} args - Arguments to pass to the function
     * @returns {boolean} Whether the function was executed
     */
    throttle(key, func, limit, ...args) {
        const now = Date.now();
        const lastExecuted = this.cache.get(`throttle_${key}`) || 0;

        if (now - lastExecuted >= limit) {
            this.cache.set(`throttle_${key}`, now);
            func.apply(this, args);
            return true;
        }

        return false;
    }

    /**
     * Memoize function results
     * @param {string} key - Cache key
     * @param {Function} func - Function to memoize
     * @param {number} ttl - Time to live in milliseconds (optional)
     * @param {...any} args - Function arguments
     * @returns {any} Cached or computed result
     */
    memoize(key, func, ttl = 0, ...args) {
        const cacheKey = `memoize_${key}_${JSON.stringify(args)}`;
        const cached = this.cache.get(cacheKey);

        if (cached) {
            // Check TTL if specified
            if (ttl > 0 && Date.now() - cached.timestamp > ttl) {
                this.cache.delete(cacheKey);
            } else {
                return cached.value;
            }
        }

        // Compute new value
        const result = func.apply(this, args);

        // Cache the result
        this.cache.set(cacheKey, {
            value: result,
            timestamp: Date.now()
        });

        return result;
    }

    /**
     * Measure and record execution time
     * @param {string} operation - Operation name
     * @param {Function} func - Function to measure
     * @param {...any} args - Function arguments
     * @returns {any} Function result
     */
    measure(operation, func, ...args) {
        const start = performance.now();

        try {
            const result = func.apply(this, args);

            // Handle promises
            if (result && typeof result.then === 'function') {
                return result.finally(() => {
                    const duration = performance.now() - start;
                    this.recordMetric(operation, duration);
                });
            } else {
                const duration = performance.now() - start;
                this.recordMetric(operation, duration);
                return result;
            }
        } catch (error) {
            const duration = performance.now() - start;
            this.recordMetric(operation, duration);
            throw error;
        }
    }

    /**
     * Record performance metric
     * @private
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in milliseconds
     */
    recordMetric(operation, duration) {
        if (this.metrics.hasOwnProperty(operation)) {
            // Update rolling average
            this.metrics[operation] = (this.metrics[operation] + duration) / 2;
        } else {
            this.metrics[operation] = duration;
        }

        // Log slow operations
        if (duration > 100) {
            console.warn(`⚠️ Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
        }
    }

    /**
     * Batch DOM operations for better performance
     * @param {Function} operations - Function containing DOM operations
     */
    batchDOMOperations(operations) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            // Create document fragment for efficient DOM manipulation
            const fragment = document.createDocumentFragment();

            // Execute operations with fragment context
            try {
                operations(fragment);
            } catch (error) {
                console.error('Batch DOM operations failed:', error);
            }
        });
    }

    /**
     * Lazy load elements when they become visible
     * @param {HTMLElement} element - Element to observe
     * @param {Function} callback - Function to call when element becomes visible
     * @param {Object} options - Intersection observer options
     */
    lazyLoad(element, callback, options = {}) {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            callback(element);
            return;
        }

        if (!this.observers.intersection) {
            this.observers.intersection = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const callback = entry.target._lazyCallback;
                        if (callback) {
                            callback(entry.target);
                            this.observers.intersection.unobserve(entry.target);
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            });
        }

        element._lazyCallback = callback;
        this.observers.intersection.observe(element);
    }

    /**
     * Preload critical resources
     * @param {Array<string>} resources - Array of resource URLs
     * @param {string} type - Resource type (script, style, image, etc.)
     */
    preloadResources(resources, type = 'script') {
        resources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = type;

            if (type === 'script') {
                link.crossOrigin = 'anonymous';
            }

            document.head.appendChild(link);
        });
    }

    /**
     * Optimize form auto-save performance
     * @param {Function} saveFunction - Save function to optimize
     * @returns {Function} Optimized save function
     */
    optimizeAutoSave(saveFunction) {
        return (...args) => {
            this.debounce('autoSave', () => {
                this.measure('formSave', saveFunction, ...args);
            }, 300);
        };
    }

    /**
     * Optimize email generation performance
     * @param {Function} generateFunction - Generate function to optimize
     * @returns {Function} Optimized generate function
     */
    optimizeEmailGeneration(generateFunction) {
        return (...args) => {
            return this.measure('emailGeneration', generateFunction, ...args);
        };
    }

    /**
     * Optimize validation performance
     * @param {Function} validateFunction - Validation function to optimize
     * @returns {Function} Optimized validation function
     */
    optimizeValidation(validateFunction) {
        return (...args) => {
            const cacheKey = `validation_${JSON.stringify(args)}`;
            return this.memoize(cacheKey, () => {
                return this.measure('validation', validateFunction, ...args);
            }, 1000); // Cache for 1 second
        };
    }

    /**
     * Clear all caches
     * @param {string} pattern - Optional pattern to match cache keys
     */
    clearCache(pattern = null) {
        if (pattern) {
            const keysToDelete = Array.from(this.cache.keys())
                .filter(key => key.includes(pattern));

            keysToDelete.forEach(key => this.cache.delete(key));
        } else {
            this.cache.clear();
        }

        // Clear debounce timers
        this.debounceTimers.forEach(timerId => clearTimeout(timerId));
        this.debounceTimers.clear();
    }

    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.cache.size,
            activeDebounces: this.debounceTimers.size,
            timestamp: Date.now()
        };
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        const cacheStats = {
            total: 0,
            memoize: 0,
            throttle: 0,
            validation: 0
        };

        for (const key of this.cache.keys()) {
            cacheStats.total++;
            if (key.startsWith('memoize_')) cacheStats.memoize++;
            if (key.startsWith('throttle_')) cacheStats.throttle++;
            if (key.startsWith('validation_')) cacheStats.validation++;
        }

        return cacheStats;
    }

    /**
     * Clean up performance manager
     */
    cleanup() {
        // Clear caches and timers
        this.clearCache();

        // Disconnect observers
        if (this.observers.intersection) {
            this.observers.intersection.disconnect();
        }

        if (this.observers.performance) {
            this.observers.performance.disconnect();
        }
    }

    /**
     * Memory usage monitoring (if available)
     * @returns {Object|null} Memory usage information
     */
    getMemoryUsage() {
        if (!('memory' in performance)) {
            return null;
        }

        return {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }

    /**
     * Resource timing information
     * @returns {Array} Resource timing entries
     */
    getResourceTiming() {
        if (!('getEntriesByType' in performance)) {
            return [];
        }

        return performance.getEntriesByType('resource')
            .map(entry => ({
                name: entry.name,
                type: entry.initiatorType,
                duration: Math.round(entry.duration),
                size: entry.transferSize || 0
            }))
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10); // Top 10 slowest resources
    }
}

// Export for use in main application
window.PerformanceManager = PerformanceManager;