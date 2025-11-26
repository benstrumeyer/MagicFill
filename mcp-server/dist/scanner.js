"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanPage = scanPage;
const playwright_1 = require("playwright");
/**
 * Scan a page and extract all form fields with their context
 */
async function scanPage(url) {
    console.log(`🔍 Scanning: ${url}`);
    const browser = await playwright_1.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Wait for any dynamic content
        await page.waitForTimeout(2000);
        // Extract all form fields
        const fields = await extractFields(page);
        console.log(`✅ Found ${fields.length} fields`);
        await browser.close();
        return {
            url,
            fields,
            timestamp: new Date().toISOString(),
            success: true,
        };
    }
    catch (error) {
        await browser.close();
        throw error;
    }
}
/**
 * Extract all fillable fields from the page
 */
async function extractFields(page) {
    return await page.evaluate(() => {
        const fields = [];
        const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';
        const elements = document.querySelectorAll(selectors);
        elements.forEach((element, index) => {
            const el = element;
            // Skip if disabled or readonly
            if (el.disabled)
                return;
            if ('readOnly' in el && el.readOnly)
                return;
            // Get context
            const context = getFieldContext(el);
            // Generate selector
            const selector = generateSelector(el, index);
            // Determine field type
            const fieldType = el.tagName.toLowerCase();
            const inputType = el instanceof HTMLInputElement ? el.type : undefined;
            fields.push({
                selector,
                type: 'unknown', // Will be matched by the extension
                context,
                fieldType,
                inputType,
                name: el.getAttribute('name') || undefined,
                id: el.id || undefined,
                placeholder: el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
                    ? el.placeholder || undefined
                    : undefined,
                label: getLabel(el),
            });
        });
        return fields;
        // Helper functions (must be defined inside evaluate)
        function getFieldContext(element) {
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
            if (element.getAttribute('name')) {
                contexts.push(element.getAttribute('name'));
            }
            // Get id attribute
            if (element.id)
                contexts.push(element.id);
            // Get parent label
            const parentLabel = element.closest('label');
            if (parentLabel?.textContent) {
                const text = parentLabel.textContent.replace(element.value || '', '').trim();
                if (text)
                    contexts.push(text);
            }
            return contexts.join(' ');
        }
        function getLabel(element) {
            if (element.id) {
                const label = document.querySelector(`label[for="${element.id}"]`);
                if (label?.textContent)
                    return label.textContent.trim();
            }
            const parentLabel = element.closest('label');
            if (parentLabel?.textContent) {
                return parentLabel.textContent.trim();
            }
            return undefined;
        }
        function generateSelector(element, index) {
            // Prefer ID
            if (element.id) {
                return `#${element.id}`;
            }
            // Use name attribute
            const name = element.getAttribute('name');
            if (name) {
                const tagName = element.tagName.toLowerCase();
                return `${tagName}[name="${name}"]`;
            }
            // Fallback to nth-of-type
            const tagName = element.tagName.toLowerCase();
            return `${tagName}:nth-of-type(${index + 1})`;
        }
    });
}
