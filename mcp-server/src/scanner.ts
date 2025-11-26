import { chromium, Page } from 'playwright';

export interface ScannedField {
  selector: string;
  type: string;
  context: string;
  fieldType: 'input' | 'textarea' | 'select';
  inputType?: string;
  name?: string;
  id?: string;
  placeholder?: string;
  label?: string;
}

export interface ScanResult {
  url: string;
  fields: ScannedField[];
  timestamp: string;
  success: boolean;
}

/**
 * Scan a page and extract all form fields with their context
 */
export async function scanPage(url: string): Promise<ScanResult> {
  console.log(`🔍 Scanning: ${url}`);
  
  const browser = await chromium.launch({ headless: true });
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
    
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Extract all fillable fields from the page
 */
async function extractFields(page: Page): Promise<ScannedField[]> {
  return await page.evaluate(() => {
    const fields: ScannedField[] = [];
    const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';
    const elements = document.querySelectorAll(selectors);
    
    elements.forEach((element, index) => {
      const el = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      // Skip if disabled or readonly
      if (el.disabled) return;
      if ('readOnly' in el && (el as any).readOnly) return;
      
      // Get context
      const context = getFieldContext(el);
      
      // Generate selector
      const selector = generateSelector(el, index);
      
      // Determine field type
      const fieldType = el.tagName.toLowerCase() as 'input' | 'textarea' | 'select';
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
    function getFieldContext(element: HTMLElement): string {
      const contexts: string[] = [];
      
      // Get label
      if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label?.textContent) contexts.push(label.textContent.trim());
      }
      
      // Get aria-label
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) contexts.push(ariaLabel);
      
      // Get placeholder
      if ('placeholder' in element && (element as any).placeholder) {
        contexts.push((element as any).placeholder);
      }
      
      // Get name attribute
      if (element.getAttribute('name')) {
        contexts.push(element.getAttribute('name')!);
      }
      
      // Get id attribute
      if (element.id) contexts.push(element.id);
      
      // Get parent label
      const parentLabel = element.closest('label');
      if (parentLabel?.textContent) {
        const text = parentLabel.textContent.replace((element as any).value || '', '').trim();
        if (text) contexts.push(text);
      }
      
      return contexts.join(' ');
    }
    
    function getLabel(element: HTMLElement): string | undefined {
      if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label?.textContent) return label.textContent.trim();
      }
      
      const parentLabel = element.closest('label');
      if (parentLabel?.textContent) {
        return parentLabel.textContent.trim();
      }
      
      return undefined;
    }
    
    function generateSelector(element: HTMLElement, index: number): string {
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
