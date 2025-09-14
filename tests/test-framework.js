/**
 * @fileoverview Simple test framework for BEB Email Generator
 * @version 1.1.0
 */

/**
 * Simple test framework with assertions and reporting
 */
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;

        this.stats = {
            passed: 0,
            failed: 0,
            total: 0
        };

        this.setupUI();
    }

    /**
     * Setup test UI
     * @private
     */
    setupUI() {
        const runAllBtn = document.getElementById('runAllTests');
        const runQuickBtn = document.getElementById('runQuickTests');
        const clearBtn = document.getElementById('clearResults');

        if (runAllBtn) {
            runAllBtn.addEventListener('click', () => this.runAllTests());
        }

        if (runQuickBtn) {
            runQuickBtn.addEventListener('click', () => this.runQuickTests());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearResults());
        }
    }

    /**
     * Register a test suite
     * @param {string} name - Test suite name
     * @param {Function} testFn - Test function
     * @param {Object} options - Test options
     */
    describe(name, testFn, options = {}) {
        const suite = {
            name,
            tests: [],
            options: {
                skip: options.skip || false,
                only: options.only || false,
                timeout: options.timeout || 5000
            }
        };

        const context = {
            it: (testName, testFunc, testOpts = {}) => {
                suite.tests.push({
                    name: testName,
                    func: testFunc,
                    options: { ...suite.options, ...testOpts }
                });
            },
            expect: this.expect.bind(this),
            beforeEach: () => {},
            afterEach: () => {}
        };

        testFn.call(context, context);
        this.tests.push(suite);
    }

    /**
     * Assertion helper
     * @param {any} actual - Actual value
     * @returns {Object} Assertion methods
     */
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
                }
            },

            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
                }
            },

            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
                }
            },

            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
                }
            },

            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },

            toBeLessThan: (expected) => {
                if (actual >= expected) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            },

            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
                }
            },

            toMatch: (regex) => {
                if (!regex.test(actual)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to match ${regex}`);
                }
            },

            toThrow: (expectedError) => {
                let error = null;
                try {
                    if (typeof actual === 'function') {
                        actual();
                    } else {
                        throw new Error('Expected a function that throws');
                    }
                } catch (e) {
                    error = e;
                }

                if (!error) {
                    throw new Error('Expected function to throw an error');
                }

                if (expectedError && !error.message.includes(expectedError)) {
                    throw new Error(`Expected error containing "${expectedError}", got "${error.message}"`);
                }
            }
        };
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        if (this.isRunning) return;

        this.clearResults();
        this.isRunning = true;
        this.updateButtons(true);

        this.log('🚀 Starting all tests...', 'info');

        try {
            for (const suite of this.tests) {
                await this.runTestSuite(suite);
            }

            this.log(`✅ All tests completed! Passed: ${this.stats.passed}, Failed: ${this.stats.failed}`,
                this.stats.failed === 0 ? 'pass' : 'fail');

        } catch (error) {
            this.log(`❌ Test runner error: ${error.message}`, 'fail');
        } finally {
            this.isRunning = false;
            this.updateButtons(false);
        }
    }

    /**
     * Run quick tests only
     */
    async runQuickTests() {
        if (this.isRunning) return;

        this.clearResults();
        this.isRunning = true;
        this.updateButtons(true);

        this.log('⚡ Running quick tests...', 'info');

        try {
            const quickSuites = this.tests.filter(suite =>
                suite.options.quick || suite.tests.some(test => test.options.quick)
            );

            for (const suite of quickSuites) {
                await this.runTestSuite(suite, true);
            }

            this.log(`⚡ Quick tests completed! Passed: ${this.stats.passed}, Failed: ${this.stats.failed}`,
                this.stats.failed === 0 ? 'pass' : 'fail');

        } catch (error) {
            this.log(`❌ Quick test runner error: ${error.message}`, 'fail');
        } finally {
            this.isRunning = false;
            this.updateButtons(false);
        }
    }

    /**
     * Run a single test suite
     * @private
     * @param {Object} suite - Test suite to run
     * @param {boolean} quickOnly - Run only quick tests
     */
    async runTestSuite(suite, quickOnly = false) {
        if (suite.options.skip) {
            this.log(`⏭️ Skipping suite: ${suite.name}`, 'info');
            return;
        }

        this.createSuiteSection(suite.name);
        this.log(`📝 Running suite: ${suite.name}`, 'info');

        const testsToRun = quickOnly
            ? suite.tests.filter(test => test.options.quick)
            : suite.tests;

        for (const test of testsToRun) {
            await this.runSingleTest(suite, test);
        }

        this.updateSuiteStatus(suite.name);
    }

    /**
     * Run a single test
     * @private
     * @param {Object} suite - Parent test suite
     * @param {Object} test - Test to run
     */
    async runSingleTest(suite, test) {
        this.stats.total++;

        try {
            // Create test timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Test timeout')), test.options.timeout);
            });

            // Run test with timeout
            await Promise.race([
                Promise.resolve(test.func()),
                timeoutPromise
            ]);

            this.stats.passed++;
            this.log(`✅ ${test.name}`, 'pass');

        } catch (error) {
            this.stats.failed++;
            this.log(`❌ ${test.name}: ${error.message}`, 'fail');

            if (error.stack) {
                this.log(`Stack: ${error.stack}`, 'fail');
            }
        }

        this.updateStats();
    }

    /**
     * Create test suite section in UI
     * @private
     * @param {string} suiteName - Suite name
     */
    createSuiteSection(suiteName) {
        const resultsDiv = document.getElementById('testResults');
        if (!resultsDiv) return;

        const section = document.createElement('div');
        section.className = 'test-section running';
        section.id = `suite-${suiteName.replace(/\s+/g, '-').toLowerCase()}`;
        section.innerHTML = `
            <h2>📦 ${suiteName}</h2>
            <div class="suite-results"></div>
        `;

        resultsDiv.appendChild(section);
    }

    /**
     * Update suite status based on results
     * @private
     * @param {string} suiteName - Suite name
     */
    updateSuiteStatus(suiteName) {
        const sectionId = `suite-${suiteName.replace(/\s+/g, '-').toLowerCase()}`;
        const section = document.getElementById(sectionId);
        if (!section) return;

        const results = section.querySelectorAll('.test-result');
        const hasFailures = Array.from(results).some(result => result.classList.contains('fail'));

        section.className = `test-section ${hasFailures ? 'failed' : 'passed'}`;
    }

    /**
     * Log test result
     * @private
     * @param {string} message - Log message
     * @param {string} type - Message type (pass, fail, info)
     */
    log(message, type) {
        const resultsDiv = document.getElementById('testResults');
        if (!resultsDiv) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        // Find the current suite section or create general results
        let targetSection = resultsDiv.querySelector('.test-section.running .suite-results');
        if (!targetSection) {
            targetSection = resultsDiv;
        }

        const resultDiv = document.createElement('div');
        resultDiv.className = `test-result ${type}`;
        resultDiv.textContent = message;

        if (targetSection.classList?.contains('suite-results')) {
            targetSection.appendChild(resultDiv);
        } else {
            // General log outside of suites
            const generalDiv = document.createElement('div');
            generalDiv.className = `test-result ${type}`;
            generalDiv.textContent = message;
            targetSection.appendChild(generalDiv);
        }

        // Auto-scroll to bottom
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Update test statistics in UI
     * @private
     */
    updateStats() {
        const passedEl = document.getElementById('passedCount');
        const failedEl = document.getElementById('failedCount');
        const totalEl = document.getElementById('totalCount');

        if (passedEl) passedEl.textContent = this.stats.passed;
        if (failedEl) failedEl.textContent = this.stats.failed;
        if (totalEl) totalEl.textContent = this.stats.total;
    }

    /**
     * Update button states
     * @private
     * @param {boolean} isRunning - Whether tests are running
     */
    updateButtons(isRunning) {
        const buttons = ['runAllTests', 'runQuickTests'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = isRunning;
                if (isRunning) {
                    btn.textContent = btn.textContent.replace('🚀', '⏳').replace('⚡', '⏳');
                } else {
                    btn.textContent = btn.textContent.replace('⏳', id.includes('quick') ? '⚡' : '🚀');
                }
            }
        });
    }

    /**
     * Clear test results
     */
    clearResults() {
        this.results = [];
        this.stats = { passed: 0, failed: 0, total: 0 };

        const resultsDiv = document.getElementById('testResults');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
        }

        this.updateStats();
    }

    /**
     * Get test results summary
     * @returns {Object} Test results summary
     */
    getResults() {
        return {
            stats: { ...this.stats },
            results: [...this.results],
            success: this.stats.failed === 0,
            timestamp: new Date().toISOString()
        };
    }
}

// Create global test framework instance
window.testFramework = new TestFramework();

// Export common test functions
window.describe = (name, fn, opts) => window.testFramework.describe(name, fn, opts);
window.expect = (actual) => window.testFramework.expect(actual);