/**
 * @fileoverview Test suites for BEB Email Generator modules
 * @version 1.1.0
 */

// Storage Manager Tests
describe('StorageManager', function() {
    const storage = new StorageManager();

    this.it('should be instantiable', function() {
        expect(storage).toBeTruthy();
        expect(storage.STORAGE_KEY).toBe('bebEmailGenerator');
        expect(storage.VERSION).toBe('1.1.0');
    }, { quick: true });

    this.it('should check storage availability', function() {
        const isAvailable = storage.isStorageAvailable();
        expect(isAvailable).toBeTruthy();
    }, { quick: true });

    this.it('should save and load form data', function() {
        const testData = {
            parentName: 'Test Parent',
            childNames: 'Test Child',
            bebLocation: 'test@example.com'
        };

        const saveResult = storage.saveFormData(testData, 'current');
        expect(saveResult).toBeTruthy();

        const loadedData = storage.loadFormData();
        expect(loadedData).toBeTruthy();
        expect(loadedData.parentName).toBe('Test Parent');
        expect(loadedData.childNames).toBe('Test Child');
        expect(loadedData.selectedWeek).toBe('current');
    });

    this.it('should handle storage errors gracefully', function() {
        // Temporarily disable localStorage to test error handling
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function() {
            throw new Error('Storage disabled');
        };

        const result = storage.saveFormData({test: 'data'}, 'current');
        expect(result).toBeFalsy();

        // Restore localStorage
        localStorage.setItem = originalSetItem;
    });

    this.it('should clear form data', function() {
        // First save some data
        storage.saveFormData({test: 'data'}, 'current');

        // Clear it
        const clearResult = storage.clearFormData();
        expect(clearResult).toBeTruthy();

        // Verify it's gone
        const loadedData = storage.loadFormData();
        expect(loadedData).toBeFalsy();
    });
});

// Validation Manager Tests
describe('ValidationManager', function() {
    const validation = new ValidationManager();

    this.it('should be instantiable', function() {
        expect(validation).toBeTruthy();
        expect(validation.patterns).toBeTruthy();
        expect(validation.schoolHours).toBeTruthy();
    }, { quick: true });

    this.it('should validate email addresses correctly', function() {
        // Create mock email field
        const mockEmailField = {
            value: '',
            classList: {
                add: function() {},
                remove: function() {}
            }
        };

        // Valid emails
        mockEmailField.value = 'test@example.com';
        expect(validation.validateEmail(mockEmailField)).toBeTruthy();

        mockEmailField.value = 'user.name+tag@domain.co.uk';
        expect(validation.validateEmail(mockEmailField)).toBeTruthy();

        // Invalid emails
        mockEmailField.value = 'invalid.email';
        expect(validation.validateEmail(mockEmailField)).toBeFalsy();

        mockEmailField.value = '@domain.com';
        expect(validation.validateEmail(mockEmailField)).toBeFalsy();

        mockEmailField.value = 'test@';
        expect(validation.validateEmail(mockEmailField)).toBeFalsy();

        // Empty should be valid (optional field)
        mockEmailField.value = '';
        expect(validation.validateEmail(mockEmailField)).toBeTruthy();
    }, { quick: true });

    this.it('should validate time within school hours', function() {
        // Create mock time field
        const mockTimeField = {
            value: '',
            classList: {
                add: function() {},
                remove: function() {}
            }
        };

        // Valid times (school hours 7:00-19:00)
        mockTimeField.value = '08:00';
        expect(validation.validateTime(mockTimeField)).toBeTruthy();

        mockTimeField.value = '16:30';
        expect(validation.validateTime(mockTimeField)).toBeTruthy();

        mockTimeField.value = '07:00';
        expect(validation.validateTime(mockTimeField)).toBeTruthy();

        mockTimeField.value = '19:00';
        expect(validation.validateTime(mockTimeField)).toBeTruthy();

        // Invalid times (outside school hours)
        mockTimeField.value = '06:59';
        expect(validation.validateTime(mockTimeField)).toBeFalsy();

        mockTimeField.value = '19:01';
        expect(validation.validateTime(mockTimeField)).toBeFalsy();

        mockTimeField.value = '22:00';
        expect(validation.validateTime(mockTimeField)).toBeFalsy();

        // Empty should be valid
        mockTimeField.value = '';
        expect(validation.validateTime(mockTimeField)).toBeTruthy();
    }, { quick: true });

    this.it('should validate required fields', function() {
        const mockField = {
            value: '',
            classList: { add: function() {}, remove: function() {} }
        };

        // Empty field should be invalid
        mockField.value = '';
        const emptyResult = validation.validateRequired(mockField, 'Test Field');
        expect(emptyResult.isValid).toBeFalsy();
        expect(emptyResult.message).toContain('Test Field');

        // Field with value should be valid
        mockField.value = 'Some Value';
        const validResult = validation.validateRequired(mockField, 'Test Field');
        expect(validResult.isValid).toBeTruthy();

        // Field with only whitespace should be invalid
        mockField.value = '   ';
        const whitespaceResult = validation.validateRequired(mockField, 'Test Field');
        expect(whitespaceResult.isValid).toBeFalsy();
    });

    this.it('should return school hours configuration', function() {
        const schoolHours = validation.getSchoolHours();
        expect(schoolHours.start).toBe(7);
        expect(schoolHours.end).toBe(19);
        expect(typeof schoolHours.start).toBe('number');
        expect(typeof schoolHours.end).toBe('number');
    }, { quick: true });
});

// Calendar Manager Tests
describe('CalendarManager', function() {
    const calendar = new CalendarManager();

    this.it('should be instantiable', function() {
        expect(calendar).toBeTruthy();
        expect(calendar.dayNames).toBeTruthy();
        expect(calendar.dayIds).toBeTruthy();
        expect(calendar.dayNames.length).toBe(5);
        expect(calendar.dayIds.length).toBe(5);
    }, { quick: true });

    this.it('should get week dates correctly', function() {
        const currentWeek = calendar.getWeekDates('current');
        const nextWeek = calendar.getWeekDates('next');

        expect(currentWeek.length).toBe(5);
        expect(nextWeek.length).toBe(5);
        expect(Array.isArray(currentWeek)).toBeTruthy();
        expect(Array.isArray(nextWeek)).toBeTruthy();

        // Check that all dates are Date objects
        currentWeek.forEach(date => {
            expect(date instanceof Date).toBeTruthy();
        });

        nextWeek.forEach(date => {
            expect(date instanceof Date).toBeTruthy();
        });

        // Next week should be 7 days after current week
        const dayDifference = (nextWeek[0] - currentWeek[0]) / (1000 * 60 * 60 * 24);
        expect(dayDifference).toBe(7);
    }, { quick: true });

    this.it('should calculate calendar week correctly', function() {
        // Test known dates
        const jan1_2024 = new Date(2024, 0, 1); // January 1, 2024 (Monday)
        const week1_2024 = calendar.getCalendarWeek(jan1_2024);
        expect(week1_2024).toBe(1);

        const dec31_2023 = new Date(2023, 11, 31); // December 31, 2023
        const week_dec31 = calendar.getCalendarWeek(dec31_2023);
        expect(week_dec31).toBeGreaterThan(50); // Should be week 52 or 53

        // Test current date
        const now = new Date();
        const currentWeek = calendar.getCalendarWeek(now);
        expect(currentWeek).toBeGreaterThan(0);
        expect(currentWeek).toBeLessThan(54);
    });

    this.it('should format dates correctly', function() {
        const testDate = new Date(2024, 0, 15); // January 15, 2024
        const formatted = calendar.formatDate(testDate);

        expect(typeof formatted).toBe('string');
        expect(formatted).toContain('2024');
        expect(formatted).toContain('Januar');
        expect(formatted).toContain('15');
    });

    this.it('should get week info correctly', function() {
        const testDate = new Date(2024, 0, 15); // January 15, 2024
        const weekInfo = calendar.getWeekInfo(testDate);

        expect(weekInfo).toBeTruthy();
        expect(typeof weekInfo.week).toBe('number');
        expect(weekInfo.year).toBe(2024);
        expect(weekInfo.formatted).toContain('KW');
        expect(weekInfo.formatted).toContain('2024');
    }, { quick: true });

    this.it('should detect weekends correctly', function() {
        const monday = new Date(2024, 0, 1); // Monday
        const saturday = new Date(2024, 0, 6); // Saturday
        const sunday = new Date(2024, 0, 7); // Sunday

        expect(calendar.isWeekend(monday)).toBeFalsy();
        expect(calendar.isWeekend(saturday)).toBeTruthy();
        expect(calendar.isWeekend(sunday)).toBeTruthy();
    });

    this.it('should provide day names and IDs', function() {
        const dayNames = calendar.getDayNames();
        const dayIds = calendar.getDayIds();

        expect(dayNames).toEqual(['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']);
        expect(dayIds).toEqual(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);

        // Ensure they're copies, not references
        dayNames.push('Test');
        expect(calendar.getDayNames().length).toBe(5);
    }, { quick: true });
});

// Email Manager Tests
describe('EmailManager', function() {
    const calendar = new CalendarManager();
    const validation = new ValidationManager();
    const email = new EmailManager(calendar, validation);

    this.it('should be instantiable', function() {
        expect(email).toBeTruthy();
        expect(email.calendar).toBeTruthy();
        expect(email.validation).toBeTruthy();
    }, { quick: true });

    this.it('should generate email content correctly', function() {
        const formData = {
            parentName: 'Test Parent',
            childNames: 'Test Child',
            childClass: '1a',
            bebLocation: 'test@beb-norderstedt.de',
            parentEmail: 'parent@example.com',
            notes: 'Test notes'
        };

        const pickupData = {
            monday: true,
            mondayTime: '16:00',
            tuesday: true,
            tuesdayTime: '17:00'
        };

        const result = email.generateEmail(formData, 'current', pickupData);

        expect(result.success).toBeTruthy();
        expect(result.subject).toContain('Test Child');
        expect(result.subject).toContain('KW');
        expect(result.body).toContain('Test Parent');
        expect(result.body).toContain('Test Child');
        expect(result.body).toContain('Klasse: 1a');
        expect(result.body).toContain('Test notes');
        expect(result.body).toContain('16:00');
        expect(result.body).toContain('17:00');
        expect(result.mailtoLink).toContain('mailto:test@beb-norderstedt.de');
        expect(result.mailtoLink).toContain('cc=parent@example.com');
    });

    this.it('should handle empty pickup list', function() {
        const formData = {
            parentName: 'Test Parent',
            childNames: 'Test Child',
            bebLocation: 'test@beb-norderstedt.de'
        };

        const pickupData = {
            // No days selected
        };

        const result = email.generateEmail(formData, 'current', pickupData);

        expect(result.success).toBeFalsy();
        expect(result.error).toContain('mindestens einen Tag');
    });

    this.it('should handle missing child class', function() {
        const formData = {
            parentName: 'Test Parent',
            childNames: 'Test Child',
            bebLocation: 'test@beb-norderstedt.de'
            // No childClass
        };

        const pickupData = {
            monday: true,
            mondayTime: '16:00'
        };

        const result = email.generateEmail(formData, 'current', pickupData);

        expect(result.success).toBeTruthy();
        expect(result.body).toContain('Test Child');
        expect(result.body).not.toContain('Klasse:');
    });

    this.it('should get current email data', function() {
        // First generate an email
        const formData = {
            parentName: 'Test Parent',
            childNames: 'Test Child',
            bebLocation: 'test@beb-norderstedt.de'
        };

        const pickupData = {
            monday: true,
            mondayTime: '16:00'
        };

        email.generateEmail(formData, 'current', pickupData);

        const content = email.getCurrentEmailContent();
        const mailtoLink = email.getCurrentMailtoLink();

        expect(content).toBeTruthy();
        expect(mailtoLink).toBeTruthy();
        expect(content).toContain('Test Child');
        expect(mailtoLink).toContain('mailto:test@beb-norderstedt.de');
    });

    this.it('should clear current email data', function() {
        // Generate email first
        const formData = {
            parentName: 'Test Parent',
            childNames: 'Test Child',
            bebLocation: 'test@beb-norderstedt.de'
        };

        const pickupData = {
            monday: true,
            mondayTime: '16:00'
        };

        email.generateEmail(formData, 'current', pickupData);

        // Verify data exists
        expect(email.getCurrentEmailContent()).toBeTruthy();
        expect(email.getCurrentMailtoLink()).toBeTruthy();

        // Clear data
        email.clearCurrentEmail();

        // Verify data is cleared
        expect(email.getCurrentEmailContent()).toBe('');
        expect(email.getCurrentMailtoLink()).toBe('');
    });
});

// Performance Tests
describe('Performance Tests', function() {
    this.it('should handle large datasets efficiently', function() {
        const storage = new StorageManager();
        const start = performance.now();

        // Test with large form data
        const largeFormData = {};
        for (let i = 0; i < 1000; i++) {
            largeFormData[`field${i}`] = `value${i}`.repeat(10);
        }

        storage.saveFormData(largeFormData, 'current');
        const loadedData = storage.loadFormData();

        const end = performance.now();
        const duration = end - start;

        expect(loadedData).toBeTruthy();
        expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    this.it('should validate many emails quickly', function() {
        const validation = new ValidationManager();
        const mockField = {
            value: '',
            classList: { add: function() {}, remove: function() {} }
        };

        const start = performance.now();

        for (let i = 0; i < 1000; i++) {
            mockField.value = `test${i}@example.com`;
            validation.validateEmail(mockField);
        }

        const end = performance.now();
        const duration = end - start;

        expect(duration).toBeLessThan(50); // Should complete in under 50ms
    }, { quick: true });

    this.it('should generate calendar weeks efficiently', function() {
        const calendar = new CalendarManager();
        const start = performance.now();

        for (let i = 0; i < 365; i++) {
            const date = new Date(2024, 0, 1 + i);
            calendar.getCalendarWeek(date);
        }

        const end = performance.now();
        const duration = end - start;

        expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
});

// Integration Tests
describe('Integration Tests', function() {
    this.it('should work end-to-end', function() {
        const storage = new StorageManager();
        const validation = new ValidationManager();
        const calendar = new CalendarManager();
        const email = new EmailManager(calendar, validation);

        // Save form data
        const formData = {
            parentName: 'Integration Test',
            childNames: 'Test Child 1, Test Child 2',
            childClass: '1a',
            bebLocation: 'test@beb-norderstedt.de',
            parentEmail: 'parent@example.com'
        };

        storage.saveFormData(formData, 'current');

        // Load and validate
        const loadedData = storage.loadFormData();
        expect(loadedData.parentName).toBe('Integration Test');

        // Generate email
        const pickupData = {
            monday: true,
            mondayTime: '16:00',
            wednesday: true,
            wednesdayTime: '17:00',
            friday: true,
            fridayTime: '15:30'
        };

        const result = email.generateEmail(loadedData, 'current', pickupData);
        expect(result.success).toBeTruthy();
        expect(result.body).toContain('Test Child 1, Test Child 2');
        expect(result.body).toContain('Klasse: 1a');
        expect(result.body).toContain('16:00');
        expect(result.body).toContain('17:00');
        expect(result.body).toContain('15:30');

        // Verify email structure
        expect(result.displayContent).toContain('An: test@beb-norderstedt.de');
        expect(result.displayContent).toContain('CC: parent@example.com');
        expect(result.displayContent).toContain('Betreff:');
    });
});

console.info('✅ All test suites loaded successfully!');