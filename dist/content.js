/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./extension/core/BrowserLearningMode.ts":
/*!***********************************************!*\
  !*** ./extension/core/BrowserLearningMode.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BrowserLearningMode: () => (/* binding */ BrowserLearningMode)
/* harmony export */ });
/**
 * Browser Learning Mode - Like Playwright but in regular Chrome!
 * Watches you fill the form and learns from your actions
 */
class BrowserLearningMode {
    constructor() {
        this.learnedFields = new Map();
        this.isActive = false;
        this.indicator = null;
        /**
         * Handle blur event
         */
        this.handleBlur = (e) => {
            if (!this.isActive)
                return;
            const field = e.target;
            if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                this.captureField(field);
            }
        };
        /**
         * Handle change event
         */
        this.handleChange = (e) => {
            if (!this.isActive)
                return;
            const field = e.target;
            if (field.tagName === 'SELECT' ||
                field.type === 'radio' ||
                field.type === 'checkbox') {
                this.captureField(field);
            }
        };
        /**
         * Handle form submit
         */
        this.handleSubmit = (_e) => {
            if (!this.isActive)
                return;
            console.log('📝 Form submitted - capturing all fields...');
            // Capture any remaining fields
            const fields = document.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                if (field.value) {
                    this.captureField(field);
                }
            });
        };
    }
    /**
     * Start learning mode
     */
    start() {
        if (this.isActive)
            return;
        this.isActive = true;
        this.learnedFields.clear();
        // Add visual indicator
        this.showIndicator();
        // Listen to all form interactions
        this.attachListeners();
        console.log('🎓 Browser Learning Mode Active!');
    }
    /**
     * Stop learning mode
     */
    stop() {
        this.isActive = false;
        this.removeIndicator();
        this.detachListeners();
        const fields = Array.from(this.learnedFields.values());
        console.log(`📊 Learned ${fields.length} fields`);
        return fields;
    }
    /**
     * Show visual indicator
     */
    showIndicator() {
        this.indicator = document.createElement('div');
        this.indicator.id = 'magicfill-learning-indicator';
        this.indicator.innerHTML = '🎓 Learning Mode: 0 fields';
        this.indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
    `;
        const style = document.createElement('style');
        style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
        document.head.appendChild(style);
        document.body.appendChild(this.indicator);
    }
    /**
     * Remove indicator
     */
    removeIndicator() {
        if (this.indicator) {
            this.indicator.remove();
            this.indicator = null;
        }
    }
    /**
     * Update indicator count
     */
    updateIndicator() {
        if (this.indicator) {
            const count = this.learnedFields.size;
            this.indicator.innerHTML = `🎓 Learning Mode: ${count} field${count !== 1 ? 's' : ''}`;
        }
    }
    /**
     * Attach event listeners
     */
    attachListeners() {
        // Blur events for inputs/textareas
        document.addEventListener('blur', this.handleBlur, true);
        // Change events for selects/radios/checkboxes
        document.addEventListener('change', this.handleChange, true);
        // Form submit
        document.addEventListener('submit', this.handleSubmit, true);
    }
    /**
     * Detach event listeners
     */
    detachListeners() {
        document.removeEventListener('blur', this.handleBlur, true);
        document.removeEventListener('change', this.handleChange, true);
        document.removeEventListener('submit', this.handleSubmit, true);
    }
    /**
     * Capture a field
     */
    captureField(field) {
        // Skip if no value
        if (!field.value || field.value.trim() === '')
            return;
        // Skip hidden/password fields
        if (field.type === 'hidden' ||
            field.type === 'password')
            return;
        const selector = this.generateSelector(field);
        // Check if already captured
        if (this.learnedFields.has(selector)) {
            // Update value if changed
            const existing = this.learnedFields.get(selector);
            if (existing.value !== field.value) {
                existing.value = field.value;
                console.log('🔄 Updated:', existing.label, '=', field.value);
            }
            return;
        }
        const fieldData = {
            selector,
            label: this.getFieldLabel(field),
            value: field.value,
            type: field.tagName.toLowerCase(),
            inputType: field.type || undefined,
            timestamp: new Date().toISOString()
        };
        this.learnedFields.set(selector, fieldData);
        // Save immediately to storage
        this.saveFieldToStorage(fieldData);
        // Visual feedback
        this.flashField(field);
        // Show toast notification
        this.showToast(`✓ Saved: ${fieldData.label}`);
        // Update indicator
        this.updateIndicator();
        // Log with details
        console.log('✓ Learned & Saved:', {
            label: fieldData.label,
            value: fieldData.value,
            selector: fieldData.selector,
            type: fieldData.type,
            timestamp: fieldData.timestamp
        });
    }
    /**
     * Save field to storage immediately
     */
    saveFieldToStorage(field) {
        // Send message to content script to save
        window.postMessage({
            type: 'MAGICFILL_SAVE_FIELD',
            label: field.label,
            value: field.value
        }, '*');
    }
    /**
     * Flash field green
     */
    flashField(field) {
        const originalBorder = field.style.border;
        const originalBoxShadow = field.style.boxShadow;
        field.style.border = '2px solid #10b981';
        field.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.5)';
        setTimeout(() => {
            field.style.border = originalBorder;
            field.style.boxShadow = originalBoxShadow;
        }, 1000);
    }
    /**
     * Show toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999998;
      animation: slideUp 0.3s ease-out;
    `;
        const style = document.createElement('style');
        style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        // Remove after 2 seconds
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
    /**
     * Generate selector for field
     */
    generateSelector(el) {
        if (el.id)
            return `#${el.id}`;
        const name = el.getAttribute('name');
        if (name) {
            const tag = el.tagName.toLowerCase();
            return `${tag}[name="${name}"]`;
        }
        const testId = el.getAttribute('data-testid') || el.getAttribute('data-qa');
        if (testId)
            return `[data-testid="${testId}"]`;
        // Fallback to nth-of-type
        const parent = el.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(child => child.tagName === el.tagName);
            const index = siblings.indexOf(el) + 1;
            return `${el.tagName.toLowerCase()}:nth-of-type(${index})`;
        }
        return el.tagName.toLowerCase();
    }
    /**
     * Get field label
     */
    getFieldLabel(el) {
        const labels = [];
        // Get label by 'for' attribute
        if (el.id) {
            const label = document.querySelector(`label[for="${el.id}"]`);
            if (label?.textContent)
                labels.push(label.textContent.trim());
        }
        // Get aria-label
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel)
            labels.push(ariaLabel);
        // Get placeholder
        if ('placeholder' in el && el.placeholder) {
            labels.push(el.placeholder);
        }
        // Get parent label
        const parentLabel = el.closest('label');
        if (parentLabel?.textContent) {
            const text = parentLabel.textContent
                .replace(el.value || '', '')
                .trim();
            if (text)
                labels.push(text);
        }
        // Get preceding sibling
        const prevSibling = el.previousElementSibling;
        if (prevSibling?.textContent) {
            const text = prevSibling.textContent.trim();
            if (text && text.length < 100)
                labels.push(text);
        }
        // Fallback
        if (labels.length === 0) {
            labels.push(el.getAttribute('name') || el.id || 'Unknown Field');
        }
        return labels[0];
    }
}


/***/ }),

/***/ "./extension/core/FieldMatcher.ts":
/*!****************************************!*\
  !*** ./extension/core/FieldMatcher.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FieldMatcher: () => (/* binding */ FieldMatcher)
/* harmony export */ });
class FieldMatcher {
    constructor() {
        this.patterns = [
            // Name fields
            { type: 'firstName', patterns: [/first.*name/i, /fname/i, /given.*name/i], priority: 10 },
            { type: 'lastName', patterns: [/last.*name/i, /lname/i, /surname/i, /family.*name/i], priority: 10 },
            { type: 'fullName', patterns: [/^name$/i, /full.*name/i, /your.*name/i], priority: 9 },
            // Contact fields
            { type: 'email', patterns: [/email/i, /e-mail/i], priority: 10 },
            { type: 'phone', patterns: [/phone/i, /mobile/i, /telephone/i, /contact.*number/i], priority: 10 },
            // Address fields
            { type: 'address', patterns: [/^address$/i, /street.*address/i, /address.*line.*1/i], priority: 10 },
            { type: 'address2', patterns: [/address.*line.*2/i, /apt/i, /suite/i, /unit/i], priority: 9 },
            { type: 'city', patterns: [/city/i, /town/i], priority: 10 },
            { type: 'state', patterns: [/state/i, /province/i, /region/i], priority: 10 },
            { type: 'zipCode', patterns: [/zip/i, /postal/i, /postcode/i], priority: 10 },
            { type: 'country', patterns: [/country/i], priority: 10 },
            // Professional fields
            { type: 'currentCompany', patterns: [/current.*company/i, /employer/i, /organization/i], priority: 9 },
            { type: 'currentTitle', patterns: [/current.*title/i, /job.*title/i, /position/i, /role/i], priority: 9 },
            { type: 'yearsExperience', patterns: [/years.*experience/i, /experience.*years/i, /yoe/i], priority: 9 },
            { type: 'linkedin', patterns: [/linkedin/i, /linkedin.*url/i, /linkedin.*profile/i], priority: 10 },
            { type: 'github', patterns: [/github/i, /github.*url/i, /github.*profile/i], priority: 10 },
            { type: 'portfolio', patterns: [/portfolio/i, /website/i, /personal.*site/i], priority: 9 },
            // Education fields
            { type: 'university', patterns: [/university/i, /college/i, /school/i, /education/i], priority: 9 },
            { type: 'degree', patterns: [/degree/i, /qualification/i], priority: 9 },
            { type: 'major', patterns: [/major/i, /field.*study/i, /specialization/i], priority: 9 },
            { type: 'graduationYear', patterns: [/graduation/i, /grad.*year/i, /year.*graduated/i], priority: 9 },
            // Work authorization
            { type: 'workAuthorization', patterns: [/work.*authorization/i, /authorized.*work/i, /visa.*status/i, /sponsorship/i], priority: 9 },
            { type: 'requiresSponsorship', patterns: [/require.*sponsorship/i, /need.*sponsorship/i, /visa.*sponsorship/i], priority: 9 },
            // Salary & availability
            { type: 'salaryExpectation', patterns: [/salary/i, /compensation/i, /expected.*salary/i], priority: 8 },
            { type: 'startDate', patterns: [/start.*date/i, /available.*date/i, /availability/i], priority: 8 },
            { type: 'noticePeriod', patterns: [/notice.*period/i, /notice/i], priority: 8 },
            // Referral & source
            { type: 'referral', patterns: [/referral/i, /referred.*by/i, /reference/i], priority: 8 },
            { type: 'howDidYouHear', patterns: [/how.*hear/i, /source/i, /where.*find/i], priority: 7 },
            // Cover letter & additional info
            { type: 'coverLetter', patterns: [/cover.*letter/i, /why.*interested/i, /tell.*us.*about/i], priority: 7 },
            { type: 'additionalInfo', patterns: [/additional/i, /other.*information/i, /comments/i, /notes/i], priority: 6 },
        ];
    }
    /**
     * Extract context from a form field (label, placeholder, name, id)
     */
    getFieldContext(element) {
        const contexts = [];
        // Get label
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label?.textContent)
                contexts.push(label.textContent.trim());
        }
        // Get aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel)
            contexts.push(ariaLabel);
        // Get placeholder
        if ('placeholder' in element && element.placeholder) {
            contexts.push(element.placeholder);
        }
        // Get name attribute
        if (element.name)
            contexts.push(element.name);
        // Get id attribute
        if (element.id)
            contexts.push(element.id);
        // Get parent label
        const parentLabel = element.closest('label');
        if (parentLabel?.textContent) {
            contexts.push(parentLabel.textContent.replace(element.value || '', '').trim());
        }
        return contexts.join(' ');
    }
    /**
     * Match a field context to a semantic type
     */
    matchField(context) {
        let bestMatch = null;
        for (const pattern of this.patterns) {
            for (const regex of pattern.patterns) {
                if (regex.test(context)) {
                    if (!bestMatch || pattern.priority > bestMatch.priority) {
                        bestMatch = { type: pattern.type, priority: pattern.priority };
                    }
                }
            }
        }
        return bestMatch?.type || null;
    }
    /**
     * Match field context to field mappings (rule-based)
     */
    matchFieldToMapping(context, mappings) {
        const lowerContext = context.toLowerCase();
        for (const [key, mapping] of Object.entries(mappings)) {
            for (const pattern of mapping.patterns) {
                if (lowerContext.includes(pattern.toLowerCase())) {
                    console.log(`  ✓ Mapping matched: "${key}" via pattern "${pattern}"`);
                    return key;
                }
            }
        }
        return null;
    }
    /**
     * Find all fillable fields on the page
     */
    findAllFields() {
        const fields = [];
        const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';
        const elements = document.querySelectorAll(selectors);
        elements.forEach((element) => {
            const el = element;
            // Skip if disabled or readonly
            if (el.disabled)
                return;
            if ('readOnly' in el && el.readOnly)
                return;
            const context = this.getFieldContext(el);
            let type = this.matchField(context);
            // Special handling for file inputs
            if (el instanceof HTMLInputElement && el.type === 'file') {
                type = this.detectFileType(context);
            }
            // Generate stable selector
            const selector = this.generateSelector(el);
            fields.push({
                element: el,
                selector,
                type: type || 'unknown',
                context,
                value: el.value || '',
                fieldType: el.tagName.toLowerCase(),
                inputType: el instanceof HTMLInputElement ? el.type : undefined,
            });
        });
        return fields;
    }
    /**
     * Detect what type of file upload this is
     */
    detectFileType(context) {
        const lowerContext = context.toLowerCase();
        if (/resume|cv/i.test(lowerContext)) {
            return 'resumeUpload';
        }
        if (/cover.*letter/i.test(lowerContext)) {
            return 'coverLetterUpload';
        }
        if (/transcript/i.test(lowerContext)) {
            return 'transcriptUpload';
        }
        if (/portfolio|sample|work/i.test(lowerContext)) {
            return 'portfolioUpload';
        }
        return 'fileUpload';
    }
    /**
     * Generate a stable CSS selector for an element
     */
    generateSelector(element) {
        // Prefer ID
        if (element.id) {
            return `#${element.id}`;
        }
        // Use name attribute
        if (element instanceof HTMLInputElement && element.name) {
            return `input[name="${element.name}"]`;
        }
        if (element instanceof HTMLTextAreaElement && element.getAttribute('name')) {
            return `textarea[name="${element.getAttribute('name')}"]`;
        }
        if (element instanceof HTMLSelectElement && element.name) {
            return `select[name="${element.name}"]`;
        }
        // Fallback to nth-of-type
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
            const index = siblings.indexOf(element) + 1;
            return `${element.tagName.toLowerCase()}:nth-of-type(${index})`;
        }
        return element.tagName.toLowerCase();
    }
}


/***/ }),

/***/ "./extension/core/FormFiller.ts":
/*!**************************************!*\
  !*** ./extension/core/FormFiller.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FormFiller: () => (/* binding */ FormFiller)
/* harmony export */ });
class FormFiller {
    /**
     * Fill a single field with a value (async version with persistence)
     */
    async fillFieldAsync(field, value) {
        try {
            const element = field.element;
            if (!element || element.disabled) {
                return false;
            }
            if ('readOnly' in element && element.readOnly) {
                return false;
            }
            // Focus and click the field first to trigger any JS handlers
            this.focusAndClickField(element);
            // No delay needed - just fill immediately
            // Handle different field types
            let success = false;
            if (element instanceof HTMLInputElement) {
                success = await this.fillInputWithPersistence(element, value);
            }
            else if (element instanceof HTMLTextAreaElement) {
                success = await this.fillTextareaWithPersistence(element, value);
            }
            else if (element instanceof HTMLSelectElement) {
                success = await this.fillSelectAsync(element, value);
                if (success) {
                    this.highlightField(element);
                }
            }
            return success;
        }
        catch (error) {
            console.error('Error filling field:', error);
            return false;
        }
    }
    /**
     * Fill input with persistence - monitors and re-fills if cleared
     */
    async fillInputWithPersistence(input, value) {
        const stringValue = String(value);
        // For text inputs, simulate typing
        if (['text', 'email', 'tel', 'url', 'number', 'date'].includes(input.type)) {
            // Type the value character by character
            await this.simulateTyping(input, stringValue);
            // DISABLED: Monitoring causes infinite loops with some forms
            // Just fill once and let it stick
            return true;
        }
        else if (input.type === 'checkbox') {
            input.checked = Boolean(value);
            this.triggerEvents(input);
            return true;
        }
        else if (input.type === 'radio') {
            if (input.value === stringValue) {
                input.checked = true;
                this.triggerEvents(input);
                return true;
            }
        }
        return false;
    }
    /**
     * Fill textarea with persistence
     */
    async fillTextareaWithPersistence(textarea, value) {
        // Type the value
        await this.simulateTyping(textarea, value);
        // DISABLED: Monitoring causes infinite loops with some forms
        // Just fill once and let it stick
        return true;
    }
    /**
     * Simulate typing character by character
     */
    async simulateTyping(element, value) {
        // Clear the field first
        this.setReactValue(element, '');
        // Set the full value at once (no delay)
        this.setReactValue(element, value);
        // Trigger events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    /**
     * Fill a single field with a value (sync version for backwards compatibility)
     */
    fillField(field, value) {
        try {
            const element = field.element;
            if (!element || element.disabled) {
                return false;
            }
            if ('readOnly' in element && element.readOnly) {
                return false;
            }
            // Focus and click the field first to trigger any JS handlers
            this.focusAndClickField(element);
            // Handle different field types
            if (element instanceof HTMLInputElement) {
                return this.fillInput(element, value);
            }
            else if (element instanceof HTMLTextAreaElement) {
                return this.fillTextarea(element, value);
            }
            else if (element instanceof HTMLSelectElement) {
                return this.fillSelect(element, value);
            }
            return false;
        }
        catch (error) {
            console.error('Error filling field:', error);
            return false;
        }
    }
    /**
     * Focus and click a field to trigger any JS event handlers
     */
    focusAndClickField(element) {
        try {
            // Scroll into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus the element
            if ('focus' in element && typeof element.focus === 'function') {
                element.focus();
            }
            // Click the element
            element.click();
            // Trigger focus event
            element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
            // Trigger click event
            element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }
        catch (error) {
            console.error('Error focusing/clicking field:', error);
        }
    }
    /**
     * Fill an input element
     */
    fillInput(input, value) {
        switch (input.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
            case 'number':
            case 'date':
                // Use React's native setter if available (for React forms)
                this.setReactValue(input, String(value));
                this.triggerEvents(input);
                this.highlightField(input);
                return true;
            case 'checkbox':
                input.checked = Boolean(value);
                this.triggerEvents(input);
                this.highlightField(input);
                return true;
            case 'radio':
                if (input.value === String(value)) {
                    input.checked = true;
                    this.triggerEvents(input);
                    this.highlightField(input);
                    return true;
                }
                return false;
            default:
                return false;
        }
    }
    /**
     * Set value using React's native setter (works for React, Vue, and vanilla JS)
     */
    setReactValue(element, value) {
        // Get the native value setter
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        // Use the native setter to bypass React's controlled component
        if (element instanceof HTMLInputElement && nativeInputValueSetter) {
            nativeInputValueSetter.call(element, value);
        }
        else if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
            nativeTextAreaValueSetter.call(element, value);
        }
        else {
            element.value = value;
        }
    }
    /**
     * Fill a textarea element
     */
    fillTextarea(textarea, value) {
        // Use React's native setter if available
        this.setReactValue(textarea, value);
        this.triggerEvents(textarea);
        this.highlightField(textarea);
        return true;
    }
    /**
     * Fill a select element with enhanced dropdown support
     */
    async fillSelectAsync(select, value) {
        console.log('Filling select dropdown:', { value, optionsCount: select.options.length });
        // DISABLED: Greenhouse dropdown handling causes infinite loops
        // Use manual fill + "Save All Answers" workflow instead
        // const isGreenhouse = window.location.hostname.includes('greenhouse.io');
        // if (isGreenhouse) {
        //   console.log('Detected Greenhouse - trying custom dropdown handler');
        //   const success = await this.fillGreenhouseDropdown(select, value);
        //   if (success) return true;
        // }
        // Standard select handling
        // Click to open the dropdown
        select.click();
        select.focus();
        // Dispatch mousedown to trigger any custom dropdown handlers
        select.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        // Wait for dropdown to open and render
        await new Promise(resolve => setTimeout(resolve, 300));
        let matchedIndex = -1;
        let matchedOption = null;
        // Try exact match first
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            if (option.value === value || option.text === value) {
                matchedIndex = i;
                matchedOption = option;
                break;
            }
        }
        // Try partial match if no exact match
        if (matchedIndex === -1) {
            const lowerValue = value.toLowerCase();
            for (let i = 0; i < select.options.length; i++) {
                const option = select.options[i];
                if (option.value.toLowerCase().includes(lowerValue) ||
                    option.text.toLowerCase().includes(lowerValue)) {
                    matchedIndex = i;
                    matchedOption = option;
                    break;
                }
            }
        }
        if (matchedIndex !== -1 && matchedOption) {
            // Click the option
            matchedOption.click();
            // Set the selected index
            select.selectedIndex = matchedIndex;
            // Trigger events
            select.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            select.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            select.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
            // Keep focus
            select.focus();
            return true;
        }
        return false;
    }
    // REMOVED: Greenhouse dropdown handling - caused infinite loops
    // Use manual workflow: Fill text fields → Manually select dropdowns → Click "Save All Answers"
    /**
     * Fill a select element (sync version)
     */
    fillSelect(select, value) {
        // Try exact match first
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            if (option.value === value || option.text === value) {
                select.selectedIndex = i;
                this.triggerEvents(select);
                this.highlightField(select);
                return true;
            }
        }
        // Try partial match
        const lowerValue = value.toLowerCase();
        for (let i = 0; i < select.options.length; i++) {
            const option = select.options[i];
            if (option.value.toLowerCase().includes(lowerValue) ||
                option.text.toLowerCase().includes(lowerValue)) {
                select.selectedIndex = i;
                this.triggerEvents(select);
                this.highlightField(select);
                return true;
            }
        }
        return false;
    }
    /**
     * Trigger change events to notify frameworks (React, Vue, etc.)
     * Note: We don't trigger blur because it can cause some forms to reset
     */
    triggerEvents(element) {
        // Trigger input event (most important for React)
        element.dispatchEvent(new Event('input', { bubbles: true }));
        // Trigger change event
        element.dispatchEvent(new Event('change', { bubbles: true }));
        // Keep focus on the element to prevent blur-triggered resets
        if ('focus' in element && typeof element.focus === 'function') {
            element.focus();
        }
    }
    /**
     * Highlight a filled field with visual feedback
     */
    highlightField(element) {
        const originalBorder = element.style.border;
        const originalBackground = element.style.backgroundColor;
        const originalColor = element.style.color;
        element.style.border = '2px solid #4CAF50';
        element.style.backgroundColor = '#E8F5E9';
        element.style.color = '#000000';
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.backgroundColor = originalBackground;
            element.style.color = originalColor;
        }, 1000);
    }
    /**
     * Public method to highlight field green (for external use)
     */
    highlightFieldGreen(element) {
        this.highlightField(element);
    }
    /**
     * Highlight an unrecognized field in red
     */
    highlightUnrecognizedField(element) {
        const originalBorder = element.style.border;
        const originalBackground = element.style.backgroundColor;
        const originalColor = element.style.color;
        element.style.border = '2px solid #f44336';
        element.style.backgroundColor = '#ffebee';
        element.style.color = '#000000';
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.backgroundColor = originalBackground;
            element.style.color = originalColor;
        }, 2000);
    }
    /**
     * Fill all fields on the page (async version)
     */
    async fillAllFieldsAsync(fields, personalData, fieldMatcher) {
        console.log('=== FILL ALL FIELDS (ASYNC) ===');
        console.log('Total fields found:', fields.length);
        console.log('Custom answers available:', Object.keys(personalData.customAnswers || {}).length);
        console.log('Custom answer keys:', Object.keys(personalData.customAnswers || {}));
        let filled = 0;
        const unrecognized = [];
        const fileUploads = [];
        for (const field of fields) {
            console.log(`\nProcessing field:`, {
                selector: field.selector,
                type: field.type,
                context: field.context,
                fieldType: field.fieldType
            });
            // Handle file uploads separately
            if (field.inputType === 'file') {
                console.log('→ File upload, skipping');
                fileUploads.push(field);
                this.highlightFileUpload(field.element);
                continue;
            }
            // Get value from personal data (pass field for context matching)
            // Even for unknown types, try to match using field mappings and custom answers
            console.log('→ Getting value for type:', field.type || 'unknown');
            const value = this.getValueForField(field.type || 'unknown', personalData, field, fieldMatcher);
            console.log('→ Value found:', value);
            if (value !== null && value !== undefined && value !== '') {
                const success = await this.fillFieldAsync(field, value);
                if (success)
                    filled++;
            }
            else {
                console.log('→ No value found, marking as unrecognized');
                unrecognized.push(field);
                this.highlightUnrecognizedField(field.element);
            }
        }
        // Show notification for file uploads
        if (fileUploads.length > 0) {
            this.showFileUploadNotification(fileUploads);
        }
        return {
            filled,
            total: fields.length,
            unrecognized,
        };
    }
    /**
     * Fill all fields on the page (sync version for backwards compatibility)
     */
    fillAllFields(fields, personalData, fieldMatcher) {
        console.log('=== FILL ALL FIELDS ===');
        console.log('Total fields found:', fields.length);
        console.log('Custom answers available:', Object.keys(personalData.customAnswers || {}).length);
        console.log('Custom answer keys:', Object.keys(personalData.customAnswers || {}));
        let filled = 0;
        const unrecognized = [];
        const fileUploads = [];
        for (const field of fields) {
            console.log(`\nProcessing field:`, {
                selector: field.selector,
                type: field.type,
                context: field.context,
                fieldType: field.fieldType
            });
            // Handle file uploads separately
            if (field.inputType === 'file') {
                console.log('→ File upload, skipping');
                fileUploads.push(field);
                this.highlightFileUpload(field.element);
                continue;
            }
            // Get value from personal data (pass field for context matching)
            // Even for unknown types, try to match using field mappings and custom answers
            console.log('→ Getting value for type:', field.type || 'unknown');
            const value = this.getValueForField(field.type || 'unknown', personalData, field, fieldMatcher);
            console.log('→ Value found:', value);
            if (value !== null && value !== undefined && value !== '') {
                const success = this.fillField(field, value);
                if (success)
                    filled++;
            }
            else {
                console.log('→ No value found, marking as unrecognized');
                unrecognized.push(field);
                this.highlightUnrecognizedField(field.element);
            }
        }
        // Show notification for file uploads
        if (fileUploads.length > 0) {
            this.showFileUploadNotification(fileUploads);
        }
        return {
            filled,
            total: fields.length,
            unrecognized,
        };
    }
    /**
     * Highlight a file upload field in blue
     */
    highlightFileUpload(element) {
        const originalBorder = element.style.border;
        const originalBackground = element.style.backgroundColor;
        const originalColor = element.style.color;
        element.style.border = '2px solid #2196F3';
        element.style.backgroundColor = '#E3F2FD';
        element.style.color = '#000000';
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.backgroundColor = originalBackground;
            element.style.color = originalColor;
        }, 3000);
    }
    /**
     * Show notification for file uploads
     */
    showFileUploadNotification(fileFields) {
        const fileTypes = fileFields.map(f => {
            if (f.type === 'resumeUpload')
                return 'Resume';
            if (f.type === 'coverLetterUpload')
                return 'Cover Letter';
            if (f.type === 'transcriptUpload')
                return 'Transcript';
            if (f.type === 'portfolioUpload')
                return 'Portfolio';
            return 'File';
        });
        const uniqueTypes = [...new Set(fileTypes)];
        const message = `📎 Please upload: ${uniqueTypes.join(', ')}`;
        // Create notification
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      background: #2196F3;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    /**
     * Match field context to custom answer keys
     */
    matchContextToCustomAnswers(context, customAnswers) {
        console.log('  Fuzzy matching context:', context);
        console.log('  Against keys:', Object.keys(customAnswers));
        const lowerContext = context.toLowerCase();
        const normalizedContext = lowerContext.replace(/[^a-z0-9]/g, '');
        // Try exact match first (case-insensitive, normalized)
        for (const key of Object.keys(customAnswers)) {
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedKey === normalizedContext) {
                console.log('  ✓ Exact normalized match found:', key);
                return key;
            }
        }
        // Try fuzzy matching - check if context contains the key or key contains context words
        for (const key of Object.keys(customAnswers)) {
            const lowerKey = key.toLowerCase();
            // Convert camelCase to words (e.g., "whatIsYourGender" → ["what", "is", "your", "gender"])
            const keyWords = lowerKey
                .replace(/([A-Z])/g, ' $1')
                .toLowerCase()
                .split(/\s+/)
                .filter(w => w.length > 2); // Filter out short words like "is", "a", etc.
            // Extract meaningful words from context
            const contextWords = lowerContext
                .split(/\s+/)
                .filter(w => w.length > 2);
            console.log(`  Checking key "${key}":`, { keyWords, contextWords });
            // Check if most key words are in context
            const matchCount = keyWords.filter(kw => contextWords.some(cw => cw.includes(kw) || kw.includes(cw))).length;
            // Lower threshold to 50% for better matching
            const threshold = Math.max(1, Math.ceil(keyWords.length * 0.5));
            console.log(`  Match count: ${matchCount}/${keyWords.length}, threshold: ${threshold}`);
            if (matchCount >= threshold && keyWords.length > 0) {
                console.log('  ✓ Fuzzy match found:', key);
                return key;
            }
        }
        console.log('  ✗ No match found');
        return null;
    }
    /**
     * Get value from personal data for a field type
     */
    getValueForField(type, data, field, fieldMatcher) {
        // Check field mappings FIRST (highest priority for scale)
        if (field && data.fieldMappings && fieldMatcher) {
            const mappingKey = fieldMatcher.matchFieldToMapping(field.context, data.fieldMappings);
            if (mappingKey && data.fieldMappings[mappingKey]) {
                console.log(`  ✓ Using field mapping: ${mappingKey} = ${data.fieldMappings[mappingKey].value}`);
                return data.fieldMappings[mappingKey].value;
            }
        }
        // Check custom answers - exact match
        if (data.customAnswers && data.customAnswers[type]) {
            return data.customAnswers[type];
        }
        // If type is unknown, try to match field context against custom answer keys
        if (type === 'unknown' && field && data.customAnswers) {
            const matchedKey = this.matchContextToCustomAnswers(field.context, data.customAnswers);
            if (matchedKey) {
                return data.customAnswers[matchedKey];
            }
        }
        // Map to personal data fields
        switch (type) {
            case 'firstName': return data.firstName;
            case 'lastName': return data.lastName;
            case 'fullName': return `${data.firstName} ${data.lastName}`;
            case 'email': return data.email;
            case 'phone': return data.phone;
            case 'address': return data.address;
            case 'address2': return data.address2 || '';
            case 'city': return data.city;
            case 'state': return data.state;
            case 'zipCode': return data.zipCode;
            case 'country': return data.country;
            case 'currentCompany': return data.currentCompany || '';
            case 'currentTitle': return data.currentTitle || '';
            case 'yearsExperience': return data.yearsExperience?.toString() || '';
            case 'linkedin': return data.linkedin || '';
            case 'github': return data.github || '';
            case 'portfolio': return data.portfolio || '';
            case 'university': return data.university || '';
            case 'degree': return data.degree || '';
            case 'major': return data.major || '';
            case 'graduationYear': return data.graduationYear?.toString() || '';
            case 'workAuthorization': return data.workAuthorization || '';
            case 'requiresSponsorship': return data.requiresSponsorship ?? false;
            case 'salaryExpectation': return data.salaryExpectation || '';
            case 'startDate': return data.startDate || '';
            case 'noticePeriod': return data.noticePeriod || '';
            case 'referral': return data.referral || '';
            case 'howDidYouHear': return data.howDidYouHear || '';
            case 'coverLetter': return data.coverLetter || '';
            case 'additionalInfo': return data.additionalInfo || '';
            default: return null;
        }
    }
}


/***/ }),

/***/ "./extension/core/MCPClient.ts":
/*!*************************************!*\
  !*** ./extension/core/MCPClient.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MCPClient: () => (/* binding */ MCPClient)
/* harmony export */ });
/**
 * Client for communicating with the MCP server
 */
class MCPClient {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }
    /**
     * Check if MCP server is running
     */
    async isServerRunning() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000), // 2 second timeout
            });
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Scan the current page for form fields
     */
    async scanPage(url) {
        const response = await fetch(`${this.baseUrl}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
        if (!response.ok) {
            throw new Error(`MCP scan failed: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Update form configuration
     */
    async updateConfig(url, fields) {
        const response = await fetch(`${this.baseUrl}/update-config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, fields }),
        });
        if (!response.ok) {
            throw new Error(`MCP config update failed: ${response.statusText}`);
        }
        return await response.json();
    }
}


/***/ }),

/***/ "./extension/core/Storage.ts":
/*!***********************************!*\
  !*** ./extension/core/Storage.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Storage: () => (/* binding */ Storage)
/* harmony export */ });
class Storage {
    /**
     * Get a value from chrome.storage.local
     */
    async get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key] || null);
            });
        });
    }
    /**
     * Set a value in chrome.storage.local
     */
    async set(key, value) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: value }, () => {
                resolve();
            });
        });
    }
    /**
     * Get personal data
     */
    async getPersonalData() {
        const data = await this.get('personalData');
        // If no data exists, try to load dev data
        if (!data || Object.keys(data).length === 0 || !data.firstName) {
            const devData = await this.loadDevData();
            if (devData) {
                console.log('Storage: Loaded dev-data.json for testing');
                await this.setPersonalData(devData);
                return devData;
            }
        }
        const result = data || this.getDefaultPersonalData();
        // Load field mappings if not present
        if (!result.fieldMappings) {
            result.fieldMappings = await this.loadFieldMappings();
        }
        return result;
    }
    /**
     * Load field mappings from field-mappings.json
     */
    async loadFieldMappings() {
        try {
            const response = await fetch(chrome.runtime.getURL('field-mappings.json'));
            if (response.ok) {
                const mappings = await response.json();
                console.log('Storage: Loaded field-mappings.json');
                return mappings;
            }
        }
        catch (error) {
            console.log('Storage: No field-mappings.json found');
        }
        return {};
    }
    /**
     * Load development data from dev-data.json (for testing)
     */
    async loadDevData() {
        try {
            const response = await fetch(chrome.runtime.getURL('dev-data.json'));
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        }
        catch (error) {
            // dev-data.json doesn't exist, that's fine
            console.log('Storage: No dev-data.json found (this is normal for production)');
        }
        return null;
    }
    /**
     * Set personal data
     */
    async setPersonalData(data) {
        await this.set('personalData', data);
    }
    /**
     * Add a custom answer dynamically
     */
    async addAnswer(key, value, siteSpecific = false) {
        const data = await this.getPersonalData();
        if (!data.customAnswers) {
            data.customAnswers = {};
        }
        if (siteSpecific) {
            const hostname = window.location.hostname;
            if (!data.siteSpecificAnswers) {
                data.siteSpecificAnswers = {};
            }
            if (!data.siteSpecificAnswers[hostname]) {
                data.siteSpecificAnswers[hostname] = {};
            }
            data.siteSpecificAnswers[hostname][key] = value;
        }
        else {
            data.customAnswers[key] = value;
        }
        await this.setPersonalData(data);
    }
    /**
     * Get default personal data structure
     */
    getDefaultPersonalData() {
        return {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
            currentCompany: '',
            currentTitle: '',
            yearsExperience: 0,
            linkedin: '',
            github: '',
            portfolio: '',
            university: '',
            degree: '',
            major: '',
            graduationYear: 0,
            workAuthorization: '',
            requiresSponsorship: false,
            salaryExpectation: '',
            startDate: '',
            noticePeriod: '',
            referral: '',
            howDidYouHear: '',
            coverLetter: '',
            additionalInfo: '',
            customAnswers: {},
            siteSpecificAnswers: {},
        };
    }
    /**
     * Export personal data as JSON
     */
    async exportData() {
        const data = await this.getPersonalData();
        return JSON.stringify(data, null, 2);
    }
    /**
     * Import personal data from JSON
     */
    async importData(json) {
        try {
            const data = JSON.parse(json);
            await this.setPersonalData(data);
        }
        catch (error) {
            throw new Error('Invalid JSON format');
        }
    }
    /**
     * Delete a custom answer
     */
    async deleteAnswer(key, siteSpecific = false, hostname) {
        const data = await this.getPersonalData();
        if (siteSpecific && hostname && data.siteSpecificAnswers?.[hostname]) {
            delete data.siteSpecificAnswers[hostname][key];
        }
        else if (data.customAnswers) {
            delete data.customAnswers[key];
        }
        await this.setPersonalData(data);
    }
    /**
     * Get analysis state for current URL
     */
    async getAnalysisState(url) {
        const states = await this.get('analysisStates');
        return states?.[url] || null;
    }
    /**
     * Set analysis state for URL
     */
    async setAnalysisState(url, state) {
        const states = await this.get('analysisStates') || {};
        states[url] = state;
        await this.set('analysisStates', states);
    }
    /**
     * Clear analysis state for URL
     */
    async clearAnalysisState(url) {
        const states = await this.get('analysisStates') || {};
        delete states[url];
        await this.set('analysisStates', states);
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**************************************!*\
  !*** ./extension/content/content.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _core_FieldMatcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/FieldMatcher */ "./extension/core/FieldMatcher.ts");
/* harmony import */ var _core_FormFiller__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/FormFiller */ "./extension/core/FormFiller.ts");
/* harmony import */ var _core_Storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../core/Storage */ "./extension/core/Storage.ts");
/* harmony import */ var _core_MCPClient__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../core/MCPClient */ "./extension/core/MCPClient.ts");
/* harmony import */ var _core_BrowserLearningMode__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/BrowserLearningMode */ "./extension/core/BrowserLearningMode.ts");





class ContentScript {
    constructor() {
        this.lastFillResult = null;
        this.fieldMatcher = new _core_FieldMatcher__WEBPACK_IMPORTED_MODULE_0__.FieldMatcher();
        this.formFiller = new _core_FormFiller__WEBPACK_IMPORTED_MODULE_1__.FormFiller();
        this.storage = new _core_Storage__WEBPACK_IMPORTED_MODULE_2__.Storage();
        this.mcpClient = new _core_MCPClient__WEBPACK_IMPORTED_MODULE_3__.MCPClient();
        this.learningMode = new _core_BrowserLearningMode__WEBPACK_IMPORTED_MODULE_4__.BrowserLearningMode();
        this.init();
    }
    async init() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
            this.handleMessage(message).then(sendResponse);
            return true; // Keep channel open for async response
        });
        // Listen for postMessage from learning mode
        window.addEventListener('message', async (event) => {
            if (event.data.type === 'MAGICFILL_SAVE_FIELD') {
                await this.storage.addAnswer(event.data.label, event.data.value, false);
                console.log(`💾 Saved to storage: ${event.data.label} = ${event.data.value}`);
            }
        });
        // Expose debug function to window
        window.MagicFillDebug = {
            showStorage: async () => {
                const data = await this.storage.getPersonalData();
                console.log('=== MAGICFILL STORED DATA ===');
                console.log('Custom Answers:', data.customAnswers);
                console.log('Field Mappings:', data.fieldMappings);
                console.log('Custom Answer Keys:', Object.keys(data.customAnswers || {}));
                console.log('Full Data:', data);
                return data;
            },
            clearStorage: async () => {
                await this.storage.set('personalData', {});
                console.log('Storage cleared!');
                location.reload();
            }
        };
        console.log('🎯 MagicFill Content Script Loaded!');
        console.log('💡 Debug: Type "MagicFillDebug.showStorage()" to see stored data');
        // Auto-fill on page load (with delay for dynamic content)
        setTimeout(() => {
            this.autoFill();
        }, 1000);
        // Watch for dynamic form changes
        this.observeDynamicForms();
        // Add auto-save listeners to all fields
        this.setupAutoSave();
    }
    /**
     * Setup auto-save on blur for all form fields
     */
    setupAutoSave() {
        // Find all fillable fields
        const fields = this.fieldMatcher.findAllFields();
        for (const field of fields) {
            const element = field.element;
            // Skip file inputs
            if (field.inputType === 'file')
                continue;
            // Add indicator
            this.addFieldIndicator(element, field);
            // Add blur listener
            element.addEventListener('blur', async () => {
                await this.autoSaveField(element, field);
            });
            // Also save on change for selects
            if (element instanceof HTMLSelectElement) {
                element.addEventListener('change', async () => {
                    await this.autoSaveField(element, field);
                });
            }
        }
    }
    /**
     * Add visual indicator to field
     */
    addFieldIndicator(element, _field) {
        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = 'magicfill-indicator';
        indicator.innerHTML = '❌';
        indicator.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10000;
      pointer-events: none;
    `;
        // Position parent relatively
        const parent = element.parentElement;
        if (parent) {
            const originalPosition = window.getComputedStyle(parent).position;
            if (originalPosition === 'static') {
                parent.style.position = 'relative';
            }
            parent.appendChild(indicator);
            // Store reference
            element.__magicfillIndicator = indicator;
        }
    }
    /**
     * Auto-save field value on blur
     */
    async autoSaveField(element, field) {
        let value = '';
        // Get the value
        if (element instanceof HTMLInputElement) {
            if (element.type === 'checkbox') {
                value = element.checked ? 'true' : 'false';
            }
            else {
                value = element.value;
            }
        }
        else if (element instanceof HTMLTextAreaElement) {
            value = element.value;
        }
        else if (element instanceof HTMLSelectElement) {
            value = element.options[element.selectedIndex]?.text || element.value;
        }
        // Skip if empty
        if (!value || value.trim() === '')
            return;
        // Generate key from context
        const key = this.generateKey(field.context);
        // Save to storage
        await this.storage.addAnswer(key, value, false);
        // Update indicator
        const indicator = element.__magicfillIndicator;
        if (indicator) {
            indicator.innerHTML = '✓';
            indicator.style.background = '#10b981';
            indicator.style.color = 'white';
        }
        // Show toast
        this.showToast(`✓ Saved: ${field.context} = ${value}`, 'success');
    }
    async handleMessage(message) {
        const action = message.action;
        if (action === 'fillForm') {
            return await this.fillForm();
        }
        if (action === 'getUnrecognizedFields') {
            return this.getUnrecognizedFields();
        }
        if (action === 'fillField') {
            if (message.payload?.selector && message.payload?.value) {
                return await this.fillSingleField(message.payload.selector, message.payload.value);
            }
            return { success: false, error: 'Missing selector or value' };
        }
        if (action === 'addAnswer') {
            if (message.payload?.key && message.payload?.value !== undefined) {
                await this.storage.addAnswer(message.payload.key, message.payload.value, message.payload.siteSpecific || false);
                return { success: true };
            }
            return { success: false, error: 'Missing key or value' };
        }
        if (action === 'learnForm') {
            return await this.learnForm();
        }
        if (action === 'startLearning') {
            this.learningMode.start();
            return { success: true, message: 'Learning mode started' };
        }
        if (action === 'stopLearning') {
            const fields = this.learningMode.stop();
            console.log(`📊 Learning mode stopped. Total fields learned: ${fields.length}`);
            return { success: true, fieldsLearned: fields.length, fields };
        }
        if (action === 'saveLearnedField') {
            // Save field immediately as it's learned
            if (message.payload?.label && message.payload?.value) {
                await this.storage.addAnswer(message.payload.label, message.payload.value, false);
                console.log(`💾 Saved to storage: ${message.payload.label} = ${message.payload.value}`);
                return { success: true };
            }
            return { success: false, error: 'Missing label or value' };
        }
        if (action === 'showToast') {
            if (message.payload?.message) {
                this.showToast(message.payload.message, message.payload.type || 'success');
                return { success: true };
            }
            return { success: false, error: 'Missing message' };
        }
        if (action === 'saveAllAnswers') {
            return await this.saveAllAnswers();
        }
        return { success: false, error: 'Unknown action' };
    }
    /**
     * Save all filled fields as answers
     */
    async saveAllAnswers() {
        try {
            console.log('🔍 Scanning page for filled fields...');
            // Find all fields on the page
            const allFields = this.fieldMatcher.findAllFields();
            console.log(`Found ${allFields.length} total fields`);
            // Filter to only filled fields
            const filledFields = allFields.filter(field => {
                const element = field.element;
                if (element instanceof HTMLInputElement) {
                    if (element.type === 'checkbox' || element.type === 'radio') {
                        return element.checked;
                    }
                    return element.value && element.value.trim() !== '';
                }
                else if (element instanceof HTMLTextAreaElement) {
                    return element.value && element.value.trim() !== '';
                }
                else if (element instanceof HTMLSelectElement) {
                    return element.selectedIndex > 0; // Ignore default/placeholder options
                }
                return false;
            });
            console.log(`Found ${filledFields.length} filled fields`);
            if (filledFields.length === 0) {
                return {
                    success: false,
                    error: 'No filled fields found on this page'
                };
            }
            // Extract answers from filled fields
            const answers = [];
            for (const field of filledFields) {
                const element = field.element;
                let value = '';
                // Get the value
                if (element instanceof HTMLInputElement) {
                    if (element.type === 'checkbox') {
                        value = element.checked ? 'true' : 'false';
                    }
                    else if (element.type === 'radio') {
                        value = element.value;
                    }
                    else {
                        value = element.value;
                    }
                }
                else if (element instanceof HTMLTextAreaElement) {
                    value = element.value;
                }
                else if (element instanceof HTMLSelectElement) {
                    value = element.options[element.selectedIndex]?.text || element.value;
                }
                // Generate a key from the context
                const key = this.generateKey(field.context);
                answers.push({
                    key,
                    value,
                    context: field.context
                });
            }
            console.log('Extracted answers:', answers);
            // Save all answers to storage
            let savedCount = 0;
            let updatedCount = 0;
            const personalData = await this.storage.getPersonalData();
            const existingAnswers = personalData.customAnswers || {};
            for (const answer of answers) {
                const existed = existingAnswers.hasOwnProperty(answer.key);
                await this.storage.addAnswer(answer.key, answer.value, false);
                if (existed) {
                    updatedCount++;
                }
                else {
                    savedCount++;
                }
            }
            // Show success message
            const message = `✅ Saved ${savedCount} new answers, updated ${updatedCount} existing answers`;
            this.showToast(message, 'success');
            return {
                success: true,
                saved: savedCount,
                updated: updatedCount,
                total: answers.length,
                answers
            };
        }
        catch (error) {
            console.error('Error saving answers:', error);
            return {
                success: false,
                error: error.message || 'Failed to save answers'
            };
        }
    }
    /**
     * Learn form using MCP server
     */
    async learnForm() {
        try {
            // Check if MCP server is running
            const isRunning = await this.mcpClient.isServerRunning();
            if (!isRunning) {
                return {
                    success: false,
                    error: 'MCP server not running. Start it with: cd mcp-server && npm run dev'
                };
            }
            this.showNotification('🔍 Learning form...', 'info');
            // Scan the page
            const scanResult = await this.mcpClient.scanPage(window.location.href);
            if (!scanResult.success) {
                return { success: false, error: 'Failed to scan page' };
            }
            // Get current fill result to find unrecognized fields
            const currentFields = this.fieldMatcher.findAllFields();
            const personalData = await this.storage.getPersonalData();
            const fillResult = await this.formFiller.fillAllFieldsAsync(currentFields, personalData, this.fieldMatcher);
            // Extract unrecognized fields with their context
            const learnedFields = fillResult.unrecognized.map(field => ({
                key: this.generateKey(field.context),
                context: field.context,
                value: '',
                selector: field.selector,
            }));
            if (learnedFields.length === 0) {
                this.showNotification('✅ All fields already recognized!', 'success');
                return { success: true, fieldsLearned: 0 };
            }
            // Store in session storage for review page
            sessionStorage.setItem('learnedFields', JSON.stringify(learnedFields));
            this.showNotification(`✅ Found ${learnedFields.length} new fields!`, 'success');
            return {
                success: true,
                fieldsLearned: learnedFields.length,
                openReview: true,
            };
        }
        catch (error) {
            console.error('Learn form error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    generateKey(context) {
        return context
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
    async autoFill() {
        try {
            const result = await this.fillForm();
            if (result.filled > 0) {
                this.showNotification(`✨ Filled ${result.filled}/${result.total} fields`, 'success');
            }
            if (result.unrecognized.length > 0) {
                this.showNotification(`❓ ${result.unrecognized.length} unrecognized fields`, 'info');
            }
        }
        catch (error) {
            console.error('Auto-fill error:', error);
        }
    }
    async fillForm() {
        console.log('🎯 FILL FORM STARTED');
        const fields = this.fieldMatcher.findAllFields();
        console.log('📋 Found fields:', fields.length);
        const personalData = await this.storage.getPersonalData();
        console.log('💾 Personal data loaded');
        console.log('  - Custom answers:', Object.keys(personalData.customAnswers || {}).length);
        console.log('  - Custom answer keys:', Object.keys(personalData.customAnswers || {}));
        console.log('  - Field mappings:', Object.keys(personalData.fieldMappings || {}).length);
        const result = await this.formFiller.fillAllFieldsAsync(fields, personalData, this.fieldMatcher);
        this.lastFillResult = result;
        console.log('✅ Fill complete:', { filled: result.filled, total: result.total, unrecognized: result.unrecognized.length });
        // No longer adding save buttons - using auto-save on blur instead
        return result;
    }
    // REMOVED: Old save button methods - now using auto-save on blur with indicators
    showToast(message, type) {
        // Get existing toasts
        const existingToasts = document.querySelectorAll('.magicfill-toast');
        // Remove oldest toast if we have 3 or more
        if (existingToasts.length >= 3) {
            existingToasts[0].remove();
        }
        // Calculate bottom position based on existing toasts
        let bottomPosition = 20;
        existingToasts.forEach((existingToast) => {
            const rect = existingToast.getBoundingClientRect();
            bottomPosition += rect.height + 10; // 10px gap between toasts
        });
        const toast = document.createElement('div');
        toast.className = `magicfill-toast magicfill-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
      position: fixed;
      bottom: ${bottomPosition}px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#f44336'};
      color: white;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      max-width: 300px;
      transition: all 0.3s ease-out;
    `;
        document.body.appendChild(toast);
        // Slide in animation
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    getUnrecognizedFields() {
        if (!this.lastFillResult) {
            const fields = this.fieldMatcher.findAllFields();
            return fields.filter(f => !f.type || f.type === 'unknown').map(f => ({
                selector: f.selector,
                context: f.context,
                type: f.type,
                fieldType: f.fieldType,
                inputType: f.inputType,
            }));
        }
        return this.lastFillResult.unrecognized.map(f => ({
            selector: f.selector,
            context: f.context,
            type: f.type,
            fieldType: f.fieldType,
            inputType: f.inputType,
        }));
    }
    async fillSingleField(selector, value) {
        try {
            const element = document.querySelector(selector);
            if (!element) {
                return { success: false, error: 'Element not found' };
            }
            const field = {
                element,
                selector,
                type: 'unknown',
                context: this.fieldMatcher.getFieldContext(element),
                value: element.value || '',
                fieldType: element.tagName.toLowerCase(),
                inputType: element instanceof HTMLInputElement ? element.type : undefined,
            };
            const success = this.formFiller.fillField(field, value);
            return { success };
        }
        catch (error) {
            return { success: false, error: String(error) };
        }
    }
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `magicfill-notification magicfill-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#f44336'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    observeDynamicForms() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    // Check if new form fields were added
                    const hasFormFields = Array.from(mutation.addedNodes).some(node => {
                        if (node instanceof HTMLElement) {
                            return node.matches('input, textarea, select') ||
                                node.querySelector('input, textarea, select');
                        }
                        return false;
                    });
                    if (hasFormFields) {
                        // Debounce auto-fill
                        setTimeout(() => this.autoFill(), 500);
                        break;
                    }
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
}
// Initialize content script
new ContentScript();

})();

/******/ })()
;
//# sourceMappingURL=content.js.map