/**
 * @fileoverview Input validation utilities
 * @version 1.1.0
 */

/**
 * Validation utilities for form inputs
 * Handles email validation, time validation, and visual feedback
 */
class ValidationManager {
    constructor() {
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        };

        this.schoolHours = {
            start: 7,
            end: 19
        };

        this.cssClasses = {
            valid: 'input-valid',
            invalid: 'input-invalid'
        };
    }

    /**
     * Validate email address format
     * @param {HTMLInputElement} emailField - Email input field
     * @returns {boolean} Validation result
     */
    validateEmail(emailField) {
        const email = emailField.value.trim();
        const validationDiv = document.getElementById('emailValidation');

        if (!email) {
            this.clearValidationState(emailField, validationDiv);
            return true; // Empty is valid (optional field)
        }

        const isValid = this.patterns.email.test(email);
        this.updateValidationState(emailField, validationDiv, isValid, {
            valid: '✓ Gültige E-Mail-Adresse',
            invalid: '⚠ Ungültige E-Mail-Adresse'
        });

        return isValid;
    }

    /**
     * Validate time format and school hours
     * @param {HTMLInputElement} timeField - Time input field
     * @returns {boolean} Validation result
     */
    validateTime(timeField) {
        const time = timeField.value;
        if (!time) {
            this.clearValidationState(timeField);
            return true; // Empty is valid
        }

        if (!this.patterns.time.test(time)) {
            this.setInvalidState(timeField);
            return false;
        }

        const [hours] = time.split(':').map(Number);
        const isWithinSchoolHours = hours >= this.schoolHours.start && hours <= this.schoolHours.end;

        if (isWithinSchoolHours) {
            this.setValidState(timeField);
        } else {
            this.setInvalidState(timeField);
        }

        return isWithinSchoolHours;
    }

    /**
     * Validate required text field
     * @param {HTMLInputElement} field - Input field to validate
     * @param {string} fieldName - Human-readable field name for error messages
     * @returns {Object} Validation result with message
     */
    validateRequired(field, fieldName) {
        const value = field.value.trim();
        const isEmpty = !value;

        if (isEmpty) {
            this.setInvalidState(field);
            return {
                isValid: false,
                message: `Bitte geben Sie ${fieldName} ein.`
            };
        }

        this.setValidState(field);
        return { isValid: true };
    }

    /**
     * Validate time with specific error message
     * @param {HTMLInputElement} timeField - Time input field
     * @param {string} dayName - Day name for error message
     * @returns {Object} Validation result with message
     */
    validateTimeWithMessage(timeField, dayName) {
        const isValid = this.validateTime(timeField);

        if (!isValid && timeField.value) {
            return {
                isValid: false,
                message: `Ungültige Abholzeit für ${dayName}. Bitte wählen Sie eine Zeit zwischen ${this.schoolHours.start}:00 und ${this.schoolHours.end}:00 Uhr.`
            };
        }

        return { isValid: true };
    }

    /**
     * Update validation visual state
     * @private
     * @param {HTMLElement} field - Form field
     * @param {HTMLElement} messageDiv - Message container
     * @param {boolean} isValid - Validation result
     * @param {Object} messages - Success/error messages
     */
    updateValidationState(field, messageDiv, isValid, messages) {
        if (isValid) {
            this.setValidState(field);
            if (messageDiv && messages.valid) {
                messageDiv.textContent = messages.valid;
                messageDiv.className = 'validation-message valid';
            }
        } else {
            this.setInvalidState(field);
            if (messageDiv && messages.invalid) {
                messageDiv.textContent = messages.invalid;
                messageDiv.className = 'validation-message invalid';
            }
        }
    }

    /**
     * Clear validation state
     * @private
     * @param {HTMLElement} field - Form field
     * @param {HTMLElement} messageDiv - Message container (optional)
     */
    clearValidationState(field, messageDiv = null) {
        field.classList.remove(this.cssClasses.valid, this.cssClasses.invalid);
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = 'validation-message';
        }
    }

    /**
     * Set field to valid state
     * @private
     * @param {HTMLElement} field - Form field
     */
    setValidState(field) {
        field.classList.remove(this.cssClasses.invalid);
        field.classList.add(this.cssClasses.valid);
    }

    /**
     * Set field to invalid state
     * @private
     * @param {HTMLElement} field - Form field
     */
    setInvalidState(field) {
        field.classList.remove(this.cssClasses.valid);
        field.classList.add(this.cssClasses.invalid);
    }

    /**
     * Get school hours info
     * @returns {Object} School hours configuration
     */
    getSchoolHours() {
        return { ...this.schoolHours };
    }
}

// Export for use in main application
window.ValidationManager = ValidationManager;