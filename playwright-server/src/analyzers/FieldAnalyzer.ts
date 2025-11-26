import { Page } from 'playwright';
import { FieldProfile } from '../types/profile';

export class FieldAnalyzer {
  async analyzeFields(page: Page): Promise<Record<string, FieldProfile>> {
    console.log('🔍 Analyzing form fields...');
    
    const fields = await page.evaluate(() => {
      // Helper function to detect custom dropdowns
      function detectCustomDropdown(element: Element): boolean {
        const parent = element.closest('div, fieldset');
        if (!parent) return false;
        
        const hasDropdownClass = parent.className.match(/dropdown|select|picker/i);
        const hasArrowIcon = parent.querySelector('[class*="arrow"], [class*="chevron"], [class*="caret"]');
        const hasOptionsContainer = parent.querySelector('[class*="options"], [class*="menu"], [class*="list"]');
        
        return !!(hasDropdownClass || hasArrowIcon || hasOptionsContainer);
      }
      
      const results: Record<string, any> = {};
      
      // Find all form fields
      const elements = document.querySelectorAll('input, select, textarea');
      
      elements.forEach((el, index) => {
        const element = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        
        // Skip hidden inputs (except file inputs)
        if (element.type === 'hidden') return;
        
        // Generate unique key
        const key = element.id || element.name || `field_${index}`;
        
        // Get label
        let label = '';
        if (element.id) {
          const labelEl = document.querySelector(`label[for="${element.id}"]`);
          label = labelEl?.textContent?.trim() || '';
        }
        if (!label && element.labels && element.labels.length > 0) {
          label = element.labels[0].textContent?.trim() || '';
        }
        
        // Build selector (prefer ID, then name, then nth-of-type)
        let selector = '';
        if (element.id) {
          selector = `#${element.id}`;
        } else if (element.name) {
          selector = `[name="${element.name}"]`;
        } else {
          const tagName = element.tagName.toLowerCase();
          const siblings = Array.from(document.querySelectorAll(tagName));
          const nthIndex = siblings.indexOf(element) + 1;
          selector = `${tagName}:nth-of-type(${nthIndex})`;
        }
        
        // Check if this is a custom dropdown
        const isCustomDropdown = detectCustomDropdown(element);
        
        results[key] = {
          selector,
          type: element.type || 'text',
          name: element.name || undefined,
          id: element.id || undefined,
          label: label || undefined,
          placeholder: (element as HTMLInputElement).placeholder || undefined,
          required: element.required,
          isCustomDropdown
        };
      });
      
      return results;
    });
    
    console.log(`✓ Found ${Object.keys(fields).length} fields`);
    return fields;
  }
  
  async analyzeCustomDropdown(page: Page, selector: string): Promise<Partial<FieldProfile>> {
    console.log(`🔍 Analyzing custom dropdown: ${selector}`);
    
    try {
      // Try to open the dropdown
      await page.click(selector);
      await page.waitForTimeout(500);
      
      // Look for options
      const dropdownInfo = await page.evaluate(() => {
        const optionsSelectors = [
          '[role="option"]',
          '[class*="option"]',
          '[class*="item"]',
          'li',
          'div[data-value]'
        ];
        
        let options: string[] = [];
        let optionsSelector = '';
        
        for (const sel of optionsSelectors) {
          const elements = document.querySelectorAll(sel);
          if (elements.length > 0) {
            options = Array.from(elements).map((el: Element) => el.textContent?.trim() || '');
            optionsSelector = sel;
            break;
          }
        }
        
        return { options, optionsSelector };
      });
      
      return {
        dropdownStrategy: 'click-input',
        ...dropdownInfo
      };
    } catch (error) {
      console.log(`⚠️ Could not analyze dropdown: ${error}`);
      return {};
    }
  }
}
