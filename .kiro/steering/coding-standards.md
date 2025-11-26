---
inclusion: always
---

# SmartFormFiller Coding Standards

## 🎯 General Principles

1. **Type safety first** - Use TypeScript for all code
2. **Build with Webpack** - Bundle extension for production
3. **Minimal dependencies** - Only add what's absolutely needed
4. **Strict TypeScript** - Enable strict mode, no `any` types
5. **Readable code** - Clear variable names, comments for complex logic

## 📝 TypeScript Style

### Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// Functions: camelCase
function fillFormField(element: HTMLElement, value: string): boolean { }
async function loadPersonalData(): Promise<PersonalData> { }

// Classes: PascalCase
class FieldMatcher { }
class FormFiller { }

// Interfaces/Types: PascalCase
interface PersonalData { }
type FieldType = 'text' | 'email' | 'tel';

// Private methods: private keyword
private _internalHelper(): void { }

// Boolean variables: is/has/should prefix
const isFormValid: boolean = true;
const hasRequiredFields: boolean = false;
const shouldAutoFill: boolean = true;
```

### Type Definitions

```typescript
// Always define interfaces for data structures
interface FormField {
  semanticType: string;
  selector: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  foundBy: 'pattern' | 'playwright';
  lastFilled?: string;
}

interface FormConfig {
  urlPattern: string;
  siteName: string;
  learnedAt: string;
  lastUpdated: string;
  scanIterations: number;
  fillRate: number;
  fields: FormField[];
  multiPage: boolean;
}

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  linkedin?: string;
  github?: string;
  experience?: number;
}
```

### Function Structure

```typescript
/**
 * Fill a form field with the appropriate value
 */
async function fillFormField(
  element: HTMLInputElement,
  value: string
): Promise<boolean> {
  // 1. Validate inputs
  if (!element || !value) return false;
  
  // 2. Main logic
  element.focus();
  element.value = value;
  
  // 3. Trigger events
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  // 4. Return result
  return true;
}
```

### Error Handling

```typescript
// Always use try-catch for async operations
async function tryAutoFill(): Promise<void> {
  try {
    const data = await loadPersonalData();
    await fillForm(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Auto-fill failed:', error.message);
      showNotification('❌ Error filling form', 'error');
    }
  }
}

// Type-safe error handling
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error('Failed to fill field:', {
      message: error.message,
      stack: error.stack
    });
  } else {
    console.error('Unknown error:', error);
  }
}
```

## 🎨 Chrome Extension Patterns

### Message Passing

```typescript
// Define message types
interface FillFormMessage {
  action: 'fill-form';
  data: PersonalData;
}

interface LearnFormMessage {
  action: 'learn-form';
  url: string;
  formData: FormField[];
}

type ExtensionMessage = FillFormMessage | LearnFormMessage;

// Background → Content Script
chrome.tabs.sendMessage(tabId, {
  action: 'fill-form',
  data: personalData
} as FillFormMessage);

// Content Script → Background
chrome.runtime.sendMessage({
  action: 'learn-form',
  url: window.location.href,
  formData: extractedData
} as LearnFormMessage);

// Type-safe message handler
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    switch (message.action) {
      case 'fill-form':
        handleFillForm(message.data);
        break;
      case 'learn-form':
        handleLearnForm(message.url, message.formData);
        break;
    }
  }
);
```

### Storage Access

```typescript
// Type-safe storage wrapper
class Storage {
  static async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] as T || null);
      });
    });
  }

  static async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

// Usage
const personalData = await Storage.get<PersonalData>('personalData');
await Storage.set('personalData', personalData);
```

## 🎯 Field Matching Patterns

### Pattern Definition

```typescript
// Type-safe pattern matching
type SemanticFieldType = 
  | 'firstName' 
  | 'lastName' 
  | 'email' 
  | 'phone' 
  | 'address'
  | 'city'
  | 'state'
  | 'zipCode';

const patterns: Record<SemanticFieldType, RegExp[]> = {
  firstName: [
    /first.*name/i,
    /given.*name/i,
    /fname/i
  ],
  lastName: [
    /last.*name/i,
    /surname/i,
    /lname/i
  ],
  email: [
    /email/i,
    /e-mail/i,
    /mail.*address/i
  ],
  // ... other patterns
};

// Test all patterns
function matchField(context: string): SemanticFieldType | null {
  for (const [fieldType, fieldPatterns] of Object.entries(patterns)) {
    for (const pattern of fieldPatterns) {
      if (pattern.test(context)) {
        return fieldType as SemanticFieldType;
      }
    }
  }
  return null;
}
```

### Context Extraction

```typescript
// Get all text associated with a field
function getFieldContext(input: HTMLInputElement): string {
  const context: string[] = [];
  
  // Priority order: label → placeholder → name → id
  if (input.labels?.[0]?.textContent) {
    context.push(input.labels[0].textContent);
  }
  if (input.placeholder) {
    context.push(input.placeholder);
  }
  if (input.name) {
    context.push(input.name);
  }
  if (input.id) {
    context.push(input.id);
  }
  
  return context.join(' ').toLowerCase();
}
```

## 🎨 UI/UX Patterns

### Notifications

```javascript
// Non-intrusive, auto-dismissing
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = 'smart-form-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 999999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto-remove
  setTimeout(() => notification.remove(), duration);
}
```

### Visual Feedback

```javascript
// Highlight filled fields temporarily
function highlightField(element) {
  const originalBg = element.style.backgroundColor;
  const originalBorder = element.style.borderColor;
  
  element.style.backgroundColor = '#d4edda';
  element.style.borderColor = '#28a745';
  
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    element.style.borderColor = originalBorder;
  }, 2000);
}
```

## 📦 MCP Server Patterns (TypeScript)

### Type Definitions

```typescript
// Always define interfaces for data structures
interface FormField {
  semanticType: string;
  selectors: string[];
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
  required: boolean;
}

interface FormConfig {
  urlPattern: string;
  siteName: string;
  learnedAt: string;
  fields: FormField[];
  multiPage: boolean;
}
```

### Playwright Patterns

```typescript
// Always wait for elements
await page.waitForSelector('form', { timeout: 5000 });

// Use page.evaluate for DOM access
const fields = await page.$$eval('input', (inputs) => {
  return inputs.map(input => ({
    type: input.type,
    name: input.name,
    id: input.id
  }));
});

// Handle navigation carefully
await Promise.all([
  page.waitForNavigation(),
  page.click('button[type="submit"]')
]);
```

## 🧪 Testing Patterns

### Manual Testing

```javascript
// Add debug helpers
window.debugSmartForm = {
  showFields: () => FieldMatcher.findAllFields(),
  testFill: () => FormFiller.fillAllFields(testData),
  clearStorage: () => chrome.storage.local.clear()
};

// Log important events
console.log('[SmartForm] Auto-fill triggered');
console.log('[SmartForm] Filled 8/10 fields');
```

### Configuration Testing

```typescript
// Test configs before saving
async function testConfig(config: FormConfig, testData: PersonalData) {
  const page = await browser.newPage();
  await page.goto(config.urlPattern);
  
  let successCount = 0;
  for (const field of config.fields) {
    const filled = await fillField(page, field, testData);
    if (filled) successCount++;
  }
  
  const successRate = successCount / config.fields.length;
  return successRate > 0.8; // 80% threshold
}
```

## 📝 Documentation

### Code Comments

```javascript
// Use JSDoc for functions
/**
 * Attempts to fill all form fields on the current page
 * 
 * @param {Object} personalData - User's personal information
 * @param {string} personalData.firstName - First name
 * @param {string} personalData.email - Email address
 * @returns {Promise<{filled: number, total: number}>} Fill results
 */
async function fillAllFields(personalData) {
  // Implementation
}

// Inline comments for complex logic
// Try multiple selectors in priority order
for (const selector of field.selectors) {
  const element = document.querySelector(selector);
  if (element && isVisible(element)) {
    return element; // Found visible element
  }
}
```

### README Structure

```markdown
# Component Name

## Purpose
Brief description of what this does

## Usage
```javascript
// Example code
```

## API
- `function1(param)` - Description
- `function2(param)` - Description

## Notes
- Important considerations
- Known limitations
```

## 🚫 Anti-Patterns to Avoid

### Don't
```typescript
// ❌ Don't use 'any' type
function fillField(element: any, value: any): any { }

// ❌ Don't ignore TypeScript errors
// @ts-ignore
const data = someUnsafeOperation();

// ❌ Don't use synchronous storage
const data = chrome.storage.local.get(['data']); // Wrong!

// ❌ Don't use alerts
alert('Form filled!'); // Intrusive!

// ❌ Don't hardcode selectors
document.querySelector('#first-name-input-field-123');
```

### Do
```typescript
// ✅ Use proper types
function fillField(
  element: HTMLInputElement,
  value: string
): Promise<boolean> { }

// ✅ Handle unknown types safely
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ✅ Use async storage with types
const data = await Storage.get<PersonalData>('personalData');

// ✅ Use non-intrusive notifications
showNotification('Form filled!', 'success');

// ✅ Use flexible patterns
const fieldType = matchField(context);
```

## 🎯 Performance Guidelines

1. **Debounce expensive operations**
   ```javascript
   let timeout;
   function onInput() {
     clearTimeout(timeout);
     timeout = setTimeout(() => validateField(), 300);
   }
   ```

2. **Cache DOM queries**
   ```javascript
   const form = document.querySelector('form');
   const inputs = form.querySelectorAll('input'); // Cache this
   ```

3. **Limit mutation observers**
   ```javascript
   // Stop observing after 10 seconds
   setTimeout(() => observer.disconnect(), 10000);
   ```

4. **Batch storage operations**
   ```javascript
   // Save all at once, not individually
   await chrome.storage.local.set({
     personalData,
     settings,
     configs
   });
   ```

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Playwright Docs](https://playwright.dev/)
- [MDN Web Docs](https://developer.mozilla.org/)
