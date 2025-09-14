/**
 * @fileoverview Calendar and date utilities
 * @version 1.1.0
 */

/**
 * Calendar utilities for week calculations and date formatting
 * Handles ISO calendar weeks and German date formatting
 */
class CalendarManager {
    constructor() {
        this.dayNames = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
        this.dayIds = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        this.dateFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        this.locale = 'de-DE';
    }

    /**
     * Get dates for the selected week (Monday to Friday)
     * @param {string} weekType - 'current' or 'next'
     * @returns {Date[]} Array of 5 dates (Monday-Friday)
     */
    getWeekDates(weekType = 'current') {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);

        // Calculate days to Monday (handle Sunday = 0)
        const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        monday.setDate(today.getDate() + daysToMonday);

        // Add 7 days for next week
        if (weekType === 'next') {
            monday.setDate(monday.getDate() + 7);
        }

        // Generate Monday to Friday dates
        const weekDates = [];
        for (let i = 0; i < 5; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDates.push(date);
        }

        return weekDates;
    }

    /**
     * Calculate ISO calendar week number
     * @param {Date} date - Date to calculate week for
     * @returns {number} Calendar week number (1-53)
     */
    getCalendarWeek(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);

        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));

        // Get first day of year
        const yearStart = new Date(d.getFullYear(), 0, 1);

        // Calculate full weeks to nearest Thursday
        const calendarWeek = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

        return calendarWeek;
    }

    /**
     * Format date for German locale (without weekday)
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        return date.toLocaleDateString(this.locale, this.dateFormatOptions);
    }

    /**
     * Get calendar week info for a date
     * @param {Date} date - Date to get week info for
     * @returns {Object} Week info object
     */
    getWeekInfo(date) {
        return {
            week: this.getCalendarWeek(date),
            year: date.getFullYear(),
            formatted: `KW ${this.getCalendarWeek(date)}/${date.getFullYear()}`
        };
    }

    /**
     * Get current week info
     * @returns {Object} Current week information
     */
    getCurrentWeekInfo() {
        return this.getWeekInfo(new Date());
    }

    /**
     * Get next week info
     * @returns {Object} Next week information
     */
    getNextWeekInfo() {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return this.getWeekInfo(nextWeek);
    }

    /**
     * Generate pickup list with formatted dates
     * @param {string} weekType - 'current' or 'next'
     * @param {Object} selectedDays - Object with day selections and times
     * @returns {string[]} Array of formatted pickup strings
     */
    generatePickupList(weekType, selectedDays) {
        const weekDates = this.getWeekDates(weekType);
        const pickupList = [];

        this.dayIds.forEach((dayId, index) => {
            if (selectedDays[dayId] && selectedDays[dayId + 'Time']) {
                const formattedDate = this.formatDate(weekDates[index]);
                const timeString = selectedDays[dayId + 'Time'];
                pickupList.push(`• ${this.dayNames[index]}, ${formattedDate} um ${timeString} Uhr`);
            }
        });

        return pickupList;
    }

    /**
     * Check if date is weekend
     * @param {Date} date - Date to check
     * @returns {boolean} True if weekend
     */
    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    }

    /**
     * Check if date is today
     * @param {Date} date - Date to check
     * @returns {boolean} True if today
     */
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    /**
     * Get day names
     * @returns {string[]} Array of German day names
     */
    getDayNames() {
        return [...this.dayNames];
    }

    /**
     * Get day IDs
     * @returns {string[]} Array of day IDs
     */
    getDayIds() {
        return [...this.dayIds];
    }

    /**
     * Add days to a date
     * @param {Date} date - Base date
     * @param {number} days - Number of days to add
     * @returns {Date} New date object
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

// Export for use in main application
window.CalendarManager = CalendarManager;