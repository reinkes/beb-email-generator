# 🤖 Claude Commands & Configuration

This file contains custom commands and configuration for Claude Code to enhance development workflow and maintain project standards.

## 🚀 Quick Commands

### Testing & Quality
```bash
# Run all tests locally
npm test || echo "No npm tests configured - using browser tests"

# Lint and format code
npm run lint || echo "Use manual code review"
npm run format || echo "Use manual formatting"

# Type checking
npm run typecheck || echo "Using JSDoc for type annotations"
```

### Build & Deploy
```bash
# Build project (for vanilla JS, just validation)
npm run build || echo "No build step required for vanilla JS"

# Start development server
python3 -m http.server 8080
```

## 📋 Project Standards

### Code Quality Checklist
- [ ] All functions have JSDoc documentation
- [ ] Error handling implemented for all async operations
- [ ] Input validation and sanitization applied
- [ ] Performance optimizations applied (debouncing, memoization)
- [ ] Security measures in place (XSS protection, data encryption)
- [ ] Accessibility standards followed (ARIA labels, keyboard navigation)
- [ ] Mobile responsiveness tested
- [ ] Browser compatibility validated

### Testing Requirements
- [ ] Unit tests for all core functions
- [ ] Integration tests for user workflows
- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing
- [ ] Performance testing (load times, memory usage)
- [ ] Security testing (XSS, input validation)

## 🏗️ Architecture Guidelines

### Module Structure
```
js/
├── app.js          # Main application orchestrator
├── storage.js      # Data persistence & management
├── validation.js   # Input validation & sanitization
├── calendar.js     # Date/time calculations
├── email.js        # Email generation & sending
├── ui.js           # User interface coordination
├── performance.js  # Performance monitoring & optimization
├── security.js     # Security features & encryption
└── theme.js        # Theme management & dark mode
```

### Dependency Injection Pattern
```javascript
// Initialize modules in dependency order
this.storage = new StorageManager();
this.validation = new ValidationManager();
this.calendar = new CalendarManager();
this.email = new EmailManager(this.calendar, this.validation);
this.ui = new UIManager(this.storage, this.validation, this.email, this.calendar);
```

## 🔧 Development Workflow

### Before Making Changes
1. **Read** relevant module files to understand current implementation
2. **Plan** changes with TodoWrite tool for complex features
3. **Test** locally before committing
4. **Document** changes in JSDoc comments

### After Making Changes
1. **Validate** JavaScript syntax: `node -c js/*.js`
2. **Test** functionality in browser
3. **Check** security implications
4. **Update** documentation if needed
5. **Commit** with descriptive message

## 📊 Performance Targets

### Loading Performance
- **HTML**: < 100KB (currently ~85KB)
- **JavaScript Total**: < 200KB (currently ~150KB)
- **First Paint**: < 1s
- **Interactive**: < 2s

### Runtime Performance
- **Form Auto-save**: Debounced 500ms
- **Email Generation**: < 100ms
- **Theme Switching**: < 50ms
- **Memory Usage**: < 10MB

## 🔒 Security Checklist

### Input Validation
- [ ] Email addresses validated with regex
- [ ] Time inputs sanitized (7:00-19:00 range)
- [ ] Text inputs escaped for HTML output
- [ ] No eval() or innerHTML with user data

### Data Protection
- [ ] LocalStorage encryption for sensitive data
- [ ] Privacy mode clears data automatically
- [ ] No hardcoded secrets or API keys
- [ ] XSS protection on all user inputs

## 🌐 Browser Support

### Minimum Requirements
- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Safari**: iOS 12+
- **Chrome Mobile**: Android 7+

### Feature Detection
```javascript
const features = {
    localStorage: () => !!window.localStorage,
    classList: () => !!document.body.classList,
    querySelector: () => !!document.querySelector,
    addEventListener: () => !!window.addEventListener,
    JSON: () => !!window.JSON
};
```

## 🎨 UI/UX Guidelines

### Accessibility Requirements
- **ARIA labels** on all interactive elements
- **Keyboard navigation** for all functions
- **High contrast** ratios (4.5:1 minimum)
- **Screen reader** compatibility
- **Focus indicators** visible and clear

### Responsive Design
- **Mobile-first** approach
- **Breakpoints**: 480px, 768px, 1024px
- **Touch targets**: Minimum 44px
- **Text scaling**: Supports 200% zoom

## 📝 Documentation Standards

### JSDoc Requirements
```javascript
/**
 * Function description
 * @param {string} param1 - Parameter description
 * @param {Object} options - Options object
 * @param {boolean} options.validate - Whether to validate input
 * @returns {Promise<boolean>} Success status
 * @throws {Error} When validation fails
 * @example
 * const result = await functionName('example', { validate: true });
 */
```

### Code Comments
- **Why** not what (code should be self-documenting)
- **Business logic** explanations
- **Complex algorithms** step-by-step
- **Security considerations** highlighted
- **Performance optimizations** explained

## 🚀 Deployment Process

### Pre-deployment Checklist
- [ ] All tests passing locally
- [ ] CI/CD pipeline green
- [ ] Performance metrics within targets
- [ ] Security scan completed
- [ ] Browser testing completed
- [ ] Mobile testing completed

### Production Deployment
1. **Tag** release version
2. **Generate** release notes
3. **Create** distribution package
4. **Deploy** to production
5. **Verify** deployment
6. **Update** monitoring

---

*This file helps Claude Code understand project structure, standards, and workflows for optimal development assistance.*

**Last Updated**: 2025-01-14
**Version**: 1.2.0