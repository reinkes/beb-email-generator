/**
 * @fileoverview Email generation and sending utilities
 * @version 1.1.0
 */

/**
 * Email generation and sending manager
 * Handles email content creation, mailto links, and cross-platform sending
 */
class EmailManager {
    constructor(calendarManager, validationManager) {
        this.calendar = calendarManager;
        this.validation = validationManager;

        this.currentEmailContent = '';
        this.currentMailtoLink = '';

        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Generate email content from form data
     * @param {Object} formData - Form data object
     * @param {string} selectedWeek - Selected week type
     * @param {Object} pickupData - Pickup days and times
     * @returns {Object} Generated email data
     */
    generateEmail(formData, selectedWeek, pickupData) {
        try {
            // Get week information
            const weekDates = this.calendar.getWeekDates(selectedWeek);
            const weekInfo = this.calendar.getWeekInfo(weekDates[0]);

            // Generate pickup list
            const pickupList = this.calendar.generatePickupList(selectedWeek, pickupData);

            if (pickupList.length === 0) {
                throw new Error('Bitte wählen Sie mindestens einen Tag für die Abholung aus.');
            }

            // Create email content
            const subject = this.createSubject(formData.childNames, weekInfo);
            const body = this.createEmailBody(formData, weekInfo, pickupList);

            // Create mailto link
            const mailtoLink = this.createMailtoLink(formData.bebLocation, subject, body, formData.parentEmail);

            // Create display content
            const displayContent = this.createDisplayContent(formData.bebLocation, subject, body, formData.parentEmail);

            // Store current email data
            this.currentEmailContent = displayContent;
            this.currentMailtoLink = mailtoLink;

            return {
                success: true,
                subject,
                body,
                displayContent,
                mailtoLink,
                weekInfo
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Create email subject line
     * @private
     * @param {string} childNames - Names of children
     * @param {Object} weekInfo - Week information
     * @returns {string} Email subject
     */
    createSubject(childNames, weekInfo) {
        return `Abholzeiten für ${childNames} - ${weekInfo.formatted}`;
    }

    /**
     * Create email body content
     * @private
     * @param {Object} formData - Form data
     * @param {Object} weekInfo - Week information
     * @param {string[]} pickupList - Formatted pickup list
     * @returns {string} Email body
     */
    createEmailBody(formData, weekInfo, pickupList) {
        let emailBody = 'Hallo,\n\n';

        // Child information with optional class
        let childInfo = formData.childNames;
        if (formData.childClass) {
            childInfo += ` (Klasse: ${formData.childClass})`;
        }

        emailBody += `hiermit teile ich Ihnen die Abholzeiten für ${childInfo} für ${weekInfo.formatted} mit:\n\n`;
        emailBody += pickupList.join('\n') + '\n\n';

        // Optional notes
        if (formData.notes) {
            emailBody += `Zusätzliche Notizen:\n${formData.notes}\n\n`;
        }

        // Closing
        emailBody += 'Vielen Dank!\n\n';
        emailBody += 'Mit freundlichen Grüßen\n';
        emailBody += formData.parentName;

        return emailBody;
    }

    /**
     * Create mailto link
     * @private
     * @param {string} recipient - Recipient email
     * @param {string} subject - Email subject
     * @param {string} body - Email body
     * @param {string} ccEmail - CC email (optional)
     * @returns {string} Mailto link
     */
    createMailtoLink(recipient, subject, body, ccEmail = '') {
        const ccText = ccEmail ? `&cc=${encodeURIComponent(ccEmail)}` : '';
        return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}${ccText}`;
    }

    /**
     * Create display content for preview
     * @private
     * @param {string} recipient - Recipient email
     * @param {string} subject - Email subject
     * @param {string} body - Email body
     * @param {string} ccEmail - CC email (optional)
     * @returns {string} Display content
     */
    createDisplayContent(recipient, subject, body, ccEmail = '') {
        let content = `An: ${recipient}\n`;
        if (ccEmail) {
            content += `CC: ${ccEmail}\n`;
        }
        content += `Betreff: ${subject}\n\n`;
        content += body;

        return content;
    }

    /**
     * Send email using platform-appropriate method
     * @returns {Promise<boolean>} Success status
     */
    async sendEmail() {
        if (!this.currentMailtoLink) {
            throw new Error('Bitte erstellen Sie zuerst eine E-Mail.');
        }

        if (this.isMobile) {
            return this.sendMobileEmail();
        } else {
            return this.sendDesktopEmail();
        }
    }

    /**
     * Send email on mobile devices
     * @private
     * @returns {boolean} Success status
     */
    sendMobileEmail() {
        try {
            window.location.href = this.currentMailtoLink;
            return true;
        } catch (error) {
            console.warn('Mobile email send failed:', error);
            return false;
        }
    }

    /**
     * Send email on desktop with user choice
     * @private
     * @returns {boolean} Success status
     */
    sendDesktopEmail() {
        const userChoice = confirm(
            'E-Mail-Versand Optionen:\n\n' +
            '✅ OK = E-Mail-Programm versuchen zu öffnen\n' +
            '📋 Abbrechen = E-Mail in Zwischenablage kopieren\n\n' +
            'Empfehlung für Mac: "Abbrechen" wählen und manuell in Mail einfügen'
        );

        if (userChoice) {
            return this.tryOpenEmailClient();
        } else {
            return this.copyToClipboard();
        }
    }

    /**
     * Try to open email client
     * @private
     * @returns {boolean} Success status
     */
    tryOpenEmailClient() {
        try {
            // Create temporary link for better browser compatibility
            const tempLink = document.createElement('a');
            tempLink.href = this.currentMailtoLink;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            setTimeout(() => {
                alert('✅ Versuch, E-Mail-Programm zu öffnen!\n\nFalls es nicht funktioniert hat, nutzen Sie den "📋 Kopieren" Button.');
            }, 500);

            return true;
        } catch (error) {
            console.warn('Email client open failed:', error);
            this.showEmailInstructions();
            return false;
        }
    }

    /**
     * Copy email content to clipboard
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard() {
        if (!this.currentEmailContent) {
            throw new Error('Keine E-Mail-Inhalte zum Kopieren verfügbar.');
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(this.currentEmailContent);
                this.showCopySuccess();
                return true;
            } catch (error) {
                console.warn('Modern clipboard API failed:', error);
                return this.fallbackCopy();
            }
        } else {
            return this.fallbackCopy();
        }
    }

    /**
     * Fallback copy method using textarea
     * @private
     * @returns {boolean} Success status
     */
    fallbackCopy() {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = this.currentEmailContent;
            document.body.appendChild(textarea);
            textarea.select();

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (success) {
                this.showCopySuccess();
                return true;
            } else {
                throw new Error('Copy command failed');
            }
        } catch (error) {
            console.warn('Fallback copy failed:', error);
            alert('Kopieren fehlgeschlagen. Bitte markieren Sie den Text manuell und kopieren Sie ihn.');
            return false;
        }
    }

    /**
     * Show copy success message
     * @private
     */
    showCopySuccess() {
        const emailMatch = this.currentMailtoLink.match(/mailto:([^?]+)/);
        const recipientEmail = emailMatch ? emailMatch[1] : 'E-Mail-Adresse';

        alert('✅ E-Mail wurde in die Zwischenablage kopiert!\n\n' +
              'Nächste Schritte:\n' +
              '1. Öffnen Sie Ihr E-Mail-Programm (Mail, Outlook, Gmail, etc.)\n' +
              '2. Erstellen Sie eine neue E-Mail\n' +
              '3. Fügen Sie den kopierten Text ein (Cmd+V)\n' +
              '4. Senden an: ' + recipientEmail);

        // Show visual success indicator
        this.showSuccessMessage();
    }

    /**
     * Show email instructions when sending fails
     * @private
     */
    showEmailInstructions() {
        const emailMatch = this.currentMailtoLink.match(/mailto:([^?]+)/);
        const recipientEmail = emailMatch ? emailMatch[1] : 'E-Mail-Adresse';

        const message = 'Das automatische Öffnen des E-Mail-Programms hat nicht funktioniert.\n\n' +
            'Alternativen:\n' +
            '1. Nutzen Sie den "📋 Kopieren" Button und fügen Sie den Text in Ihr E-Mail-Programm ein\n' +
            '2. Oder öffnen Sie manuell Ihr E-Mail-Programm und erstellen Sie eine neue E-Mail\n\n' +
            `Die E-Mail sollte gesendet werden an:\n${recipientEmail}`;

        alert(message);

        // Offer to copy automatically
        this.copyToClipboard();
    }

    /**
     * Show visual success message
     * @private
     */
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Get current email content
     * @returns {string} Current email content
     */
    getCurrentEmailContent() {
        return this.currentEmailContent;
    }

    /**
     * Get current mailto link
     * @returns {string} Current mailto link
     */
    getCurrentMailtoLink() {
        return this.currentMailtoLink;
    }

    /**
     * Clear current email data
     */
    clearCurrentEmail() {
        this.currentEmailContent = '';
        this.currentMailtoLink = '';
    }
}

// Export for use in main application
window.EmailManager = EmailManager;