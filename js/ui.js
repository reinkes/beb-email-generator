/**
 * @fileoverview UI interaction and state management
 * @version 1.1.0
 */

/**
 * UI Manager for handling user interface interactions and states
 * Manages form state, visual feedback, and user interactions
 */
class UIManager {
    constructor(storageManager, validationManager, emailManager, calendarManager) {
        this.storage = storageManager;
        this.validation = validationManager;
        this.email = emailManager;
        this.calendar = calendarManager;

        this.selectedWeek = 'current';
        this.isInitialized = false;

        // Form field configurations
        this.formFields = {
            text: ['parentName', 'parentEmail', 'childNames', 'childClass', 'notes'],
            time: ['mondayTime', 'tuesdayTime', 'wednesdayTime', 'thursdayTime', 'fridayTime'],
            checkbox: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            select: ['bebLocation']
        };

        // Loading states
        this.loadingStates = new Set();
    }

    /**
     * Initialize the UI manager
     * Sets up event listeners and loads saved data
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            this.setupEventListeners();
            this.setupAutoSave();
            this.setupKeyboardShortcuts();
            await this.loadSavedData();

            this.isInitialized = true;
            console.info('UI Manager initialized successfully');
        } catch (error) {
            console.error('UI Manager initialization failed:', error);
        }
    }

    /**
     * Setup all event listeners
     * @private
     */
    setupEventListeners() {
        this.setupWeekSelection();
        this.setupTimeAllSetter();
        this.setupBebLocationChange();
        this.setupFormValidation();
        this.setupButtonListeners();
    }

    /**
     * Setup week selection buttons
     * @private
     */
    setupWeekSelection() {
        const weekBtns = document.querySelectorAll('.week-btn');
        weekBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedWeek = btn.getAttribute('data-week');
                weekBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.saveFormData();
            });
        });
    }

    /**
     * Setup "set all times" functionality
     * @private
     */
    setupTimeAllSetter() {
        const setAllBtn = document.getElementById('setAllBtn');
        const setAllTimeInput = document.getElementById('setAllTime');

        if (!setAllBtn || !setAllTimeInput) return;

        setAllBtn.addEventListener('click', () => {
            const selectedTime = setAllTimeInput.value;

            if (!selectedTime) {
                alert('Bitte wählen Sie zuerst eine Zeit aus.');
                return;
            }

            this.formFields.time.forEach(timeId => {
                const timeInput = document.getElementById(timeId);
                if (timeInput) {
                    timeInput.value = selectedTime;
                    this.validation.validateTime(timeInput);
                }
            });

            this.saveFormData();
        });
    }

    /**
     * Setup BEB location change handler
     * @private
     */
    setupBebLocationChange() {
        const bebLocation = document.getElementById('bebLocation');
        const leaderInfo = document.getElementById('leaderInfo');

        if (!bebLocation || !leaderInfo) return;

        bebLocation.addEventListener('change', () => {
            const selectedOption = bebLocation.options[bebLocation.selectedIndex];

            if (selectedOption && selectedOption.getAttribute('data-leader')) {
                leaderInfo.textContent = 'Leitung: ' + selectedOption.getAttribute('data-leader');
            } else {
                leaderInfo.textContent = '';
            }

            this.saveFormData();
        });
    }

    /**
     * Setup form validation listeners
     * @private
     */
    setupFormValidation() {
        // Email validation
        const parentEmail = document.getElementById('parentEmail');
        if (parentEmail) {
            parentEmail.addEventListener('input', () => {
                this.validation.validateEmail(parentEmail);
            });
        }

        // Time validation
        this.formFields.time.forEach(timeId => {
            const timeField = document.getElementById(timeId);
            if (timeField) {
                timeField.addEventListener('input', () => {
                    this.validation.validateTime(timeField);
                });
            }
        });
    }

    /**
     * Setup main button listeners
     * @private
     */
    setupButtonListeners() {
        // Generate email button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerateEmail());
        }

        // Send email button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.handleSendEmail());
        }

        // Copy email button
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleCopyEmail());
        }
    }

    /**
     * Setup auto-save functionality
     * @private
     */
    setupAutoSave() {
        // Text and select fields
        [...this.formFields.text, ...this.formFields.select].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.saveFormData());
                field.addEventListener('change', () => this.saveFormData());
            }
        });

        // Time fields
        this.formFields.time.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => this.saveFormData());
                field.addEventListener('change', () => this.saveFormData());
            }
        });

        // Checkbox fields
        this.formFields.checkbox.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => this.saveFormData());
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     * @private
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + Enter to generate email
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                this.handleGenerateEmail();
            }

            // Escape to clear focus
            if (e.key === 'Escape') {
                document.activeElement?.blur();
            }
        });
    }

    /**
     * Handle email generation
     * @private
     */
    async handleGenerateEmail() {
        const generateBtn = document.getElementById('generateBtn');
        if (!generateBtn) return;

        try {
            this.setLoadingState(generateBtn, true);

            // Collect form data
            const formData = this.collectFormData();
            const pickupData = this.collectPickupData();

            // Validate form data
            const validation = this.validateFormData(formData, pickupData);
            if (!validation.isValid) {
                alert(validation.message);
                if (validation.focusField) {
                    validation.focusField.focus();
                }
                return;
            }

            // Generate email with slight delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));

            const result = this.email.generateEmail(formData, this.selectedWeek, pickupData);

            if (!result.success) {
                alert(result.error);
                return;
            }

            // Update UI
            this.updateEmailOutput(result.displayContent);
            this.enableActionButtons();

        } catch (error) {
            console.error('Email generation failed:', error);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        } finally {
            this.setLoadingState(generateBtn, false);
        }
    }

    /**
     * Handle email sending
     * @private
     */
    async handleSendEmail() {
        try {
            await this.email.sendEmail();
        } catch (error) {
            console.error('Email sending failed:', error);
            alert(error.message);
        }
    }

    /**
     * Handle email copying
     * @private
     */
    async handleCopyEmail() {
        try {
            const success = await this.email.copyToClipboard();
            if (!success) {
                alert('Kopieren fehlgeschlagen. Bitte versuchen Sie es erneut.');
            }
        } catch (error) {
            console.error('Email copying failed:', error);
            alert(error.message);
        }
    }

    /**
     * Collect form data
     * @private
     * @returns {Object} Form data object
     */
    collectFormData() {
        const data = {};

        [...this.formFields.text, ...this.formFields.select].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                data[fieldId] = field.value.trim();
            }
        });

        return data;
    }

    /**
     * Collect pickup data (days and times)
     * @private
     * @returns {Object} Pickup data object
     */
    collectPickupData() {
        const data = {};

        // Collect checkbox states
        this.formFields.checkbox.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                data[fieldId] = field.checked;
            }
        });

        // Collect time values
        this.formFields.time.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                data[fieldId] = field.value;
            }
        });

        return data;
    }

    /**
     * Validate collected form data
     * @private
     * @param {Object} formData - Form data
     * @param {Object} pickupData - Pickup data
     * @returns {Object} Validation result
     */
    validateFormData(formData, pickupData) {
        // Validate required fields
        if (!formData.parentName) {
            return {
                isValid: false,
                message: 'Bitte geben Sie Ihren Namen ein.',
                focusField: document.getElementById('parentName')
            };
        }

        if (!formData.childNames) {
            return {
                isValid: false,
                message: 'Bitte geben Sie die Namen der Kinder ein.',
                focusField: document.getElementById('childNames')
            };
        }

        if (!formData.bebLocation) {
            return {
                isValid: false,
                message: 'Bitte wählen Sie eine Betreuungseinrichtung aus.',
                focusField: document.getElementById('bebLocation')
            };
        }

        // Validate email if provided
        const emailField = document.getElementById('parentEmail');
        if (formData.parentEmail && !this.validation.validateEmail(emailField)) {
            return {
                isValid: false,
                message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein oder lassen Sie das Feld leer.',
                focusField: emailField
            };
        }

        // Validate pickup times
        const dayNames = this.calendar.getDayNames();
        const dayIds = this.calendar.getDayIds();

        for (let i = 0; i < dayIds.length; i++) {
            const dayId = dayIds[i];
            const timeId = dayId + 'Time';

            if (pickupData[dayId] && pickupData[timeId]) {
                const timeField = document.getElementById(timeId);
                const validation = this.validation.validateTimeWithMessage(timeField, dayNames[i]);

                if (!validation.isValid) {
                    return {
                        isValid: false,
                        message: validation.message,
                        focusField: timeField
                    };
                }
            }
        }

        // Check if at least one day is selected
        const hasSelectedDays = dayIds.some(dayId => pickupData[dayId]);
        if (!hasSelectedDays) {
            return {
                isValid: false,
                message: 'Bitte wählen Sie mindestens einen Tag für die Abholung aus.'
            };
        }

        return { isValid: true };
    }

    /**
     * Update email output display
     * @private
     * @param {string} content - Email content to display
     */
    updateEmailOutput(content) {
        const emailOutput = document.getElementById('emailOutput');
        if (emailOutput) {
            emailOutput.textContent = content;
        }
    }

    /**
     * Enable action buttons (send/copy)
     * @private
     */
    enableActionButtons() {
        const sendBtn = document.getElementById('sendBtn');
        const copyBtn = document.getElementById('copyBtn');

        if (sendBtn) sendBtn.disabled = false;
        if (copyBtn) copyBtn.disabled = false;
    }

    /**
     * Set loading state for button
     * @private
     * @param {HTMLElement} button - Button element
     * @param {boolean} isLoading - Loading state
     */
    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
            this.loadingStates.add(button);
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            this.loadingStates.delete(button);
        }
    }

    /**
     * Save current form data
     * @private
     */
    saveFormData() {
        if (!this.isInitialized) return;

        const formData = {
            ...this.collectFormData(),
            ...this.collectPickupData()
        };

        const success = this.storage.saveFormData(formData, this.selectedWeek);
        if (success) {
            this.showAutoSaveIndicator();
        }
    }

    /**
     * Load saved form data
     * @private
     */
    async loadSavedData() {
        const savedData = this.storage.loadFormData();
        if (!savedData) return;

        try {
            // Load text and select fields
            [...this.formFields.text, ...this.formFields.select].forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && savedData[fieldId]) {
                    field.value = savedData[fieldId];
                }
            });

            // Load time fields
            this.formFields.time.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && savedData[fieldId]) {
                    field.value = savedData[fieldId];
                }
            });

            // Load checkbox fields
            this.formFields.checkbox.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && typeof savedData[fieldId] === 'boolean') {
                    field.checked = savedData[fieldId];
                }
            });

            // Load week selection
            if (savedData.selectedWeek) {
                this.selectedWeek = savedData.selectedWeek;
                const weekBtns = document.querySelectorAll('.week-btn');
                weekBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-week') === this.selectedWeek) {
                        btn.classList.add('active');
                    }
                });
            }

            // Trigger events for loaded data
            const bebLocation = document.getElementById('bebLocation');
            if (bebLocation?.value) {
                bebLocation.dispatchEvent(new Event('change'));
            }

            const parentEmail = document.getElementById('parentEmail');
            if (parentEmail?.value) {
                this.validation.validateEmail(parentEmail);
            }

            console.info('Form data loaded successfully');
        } catch (error) {
            console.warn('Error loading form data:', error);
        }
    }

    /**
     * Show auto-save indicator
     * @private
     */
    showAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (!indicator) return;

        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    /**
     * Get current selected week
     * @returns {string} Selected week type
     */
    getSelectedWeek() {
        return this.selectedWeek;
    }

    /**
     * Set selected week
     * @param {string} weekType - Week type to select
     */
    setSelectedWeek(weekType) {
        this.selectedWeek = weekType;
        this.saveFormData();
    }

    /**
     * Clear all loading states
     */
    clearAllLoadingStates() {
        this.loadingStates.forEach(button => {
            this.setLoadingState(button, false);
        });
    }

    /**
     * Get initialization status
     * @returns {boolean} Initialization status
     */
    isReady() {
        return this.isInitialized;
    }
}

// Export for use in main application
window.UIManager = UIManager;