import { FieldMatcher } from '../core/FieldMatcher';
import { FormFiller } from '../core/FormFiller';
import { Storage } from '../core/Storage';
import { MCPClient } from '../core/MCPClient';
import { ExtensionMessage, FormField } from '../../shared/types';

class ContentScript {
  private fieldMatcher: FieldMatcher;
  private formFiller: FormFiller;
  private storage: Storage;
  private mcpClient: MCPClient;
  private lastFillResult: { filled: number; total: number; unrecognized: FormField[] } | null = null;

  constructor() {
    this.fieldMatcher = new FieldMatcher();
    this.formFiller = new FormFiller();
    this.storage = new Storage();
    this.mcpClient = new MCPClient();
    
    this.init();
  }

  private async init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
      this.handleMessage(message).then(sendResponse);
      return true; // Keep channel open for async response
    });

    // Expose debug function to window
    (window as any).MagicFillDebug = {
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
  }

  private async handleMessage(message: ExtensionMessage): Promise<any> {
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
        await this.storage.addAnswer(
          message.payload.key,
          message.payload.value,
          message.payload.siteSpecific || false
        );
        return { success: true };
      }
      return { success: false, error: 'Missing key or value' };
    }
    
    if (action === 'learnForm') {
      return await this.learnForm();
    }
    
    return { success: false, error: 'Unknown action' };
  }

  /**
   * Learn form using MCP server
   */
  private async learnForm() {
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
      const fillResult = this.formFiller.fillAllFields(currentFields, personalData, this.fieldMatcher);
      
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
      
    } catch (error) {
      console.error('Learn form error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateKey(context: string): string {
    return context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private async autoFill() {
    try {
      const result = await this.fillForm();
      
      if (result.filled > 0) {
        this.showNotification(`✨ Filled ${result.filled}/${result.total} fields`, 'success');
      }
      
      if (result.unrecognized.length > 0) {
        this.showNotification(`❓ ${result.unrecognized.length} unrecognized fields`, 'info');
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
    }
  }

  private async fillForm() {
    console.log('🎯 FILL FORM STARTED');
    const fields = this.fieldMatcher.findAllFields();
    console.log('📋 Found fields:', fields.length);
    
    const personalData = await this.storage.getPersonalData();
    console.log('💾 Personal data loaded');
    console.log('  - Custom answers:', Object.keys(personalData.customAnswers || {}).length);
    console.log('  - Custom answer keys:', Object.keys(personalData.customAnswers || {}));
    console.log('  - Field mappings:', Object.keys(personalData.fieldMappings || {}).length);
    
    const result = this.formFiller.fillAllFields(fields, personalData, this.fieldMatcher);
    this.lastFillResult = result;
    
    console.log('✅ Fill complete:', { filled: result.filled, total: result.total, unrecognized: result.unrecognized.length });
    
    // Add save buttons to unrecognized fields
    for (const field of result.unrecognized) {
      this.addSaveButton(field);
    }
    
    return result;
  }

  /**
   * Add a "Save Answer" button above an unrecognized field
   */
  private addSaveButton(field: FormField): void {
    // Check if button already exists
    const existingButton = document.querySelector(`[data-magicfill-save="${field.selector}"]`);
    if (existingButton) return;

    const button = document.createElement('button');
    button.className = 'magicfill-save-btn';
    button.setAttribute('data-magicfill-save', field.selector);
    button.innerHTML = '💾 Save Answer';
    button.style.cssText = `
      position: absolute;
      z-index: 999999;
      padding: 6px 12px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#5558e3';
      button.style.transform = 'translateY(-1px)';
      button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#6366f1';
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
    });

    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await this.saveFieldAnswer(field, button);
    });

    // Position button above the field
    const rect = field.element.getBoundingClientRect();
    button.style.top = `${window.scrollY + rect.top - 35}px`;
    button.style.left = `${window.scrollX + rect.left}px`;

    document.body.appendChild(button);

    // Reposition on scroll/resize
    const reposition = () => {
      const newRect = field.element.getBoundingClientRect();
      button.style.top = `${window.scrollY + newRect.top - 35}px`;
      button.style.left = `${window.scrollX + newRect.left}px`;
    };

    window.addEventListener('scroll', reposition);
    window.addEventListener('resize', reposition);
  }

  /**
   * Save a field's answer to custom answers
   */
  private async saveFieldAnswer(field: FormField, button: HTMLElement): Promise<void> {
    console.log('=== SAVE FIELD ANSWER ===');
    console.log('Field info:', { selector: field.selector, fieldType: field.fieldType, inputType: field.inputType });
    
    // Try multiple ways to get the element
    let freshElement = document.querySelector(field.selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    // If selector doesn't work, try using the original element
    if (!freshElement) {
      console.log('Selector failed, using original element');
      freshElement = field.element;
    }
    
    if (!freshElement) {
      console.log('ERROR: Element not found');
      this.showToast('⚠️ Field not found', 'error');
      return;
    }

    console.log('Found element:', { tagName: freshElement.tagName, value: freshElement.value });

    let value = freshElement.value;

    // Check if this is a custom dropdown (input with hidden select)
    if (freshElement instanceof HTMLInputElement && !value) {
      console.log('Input has no value, looking for hidden select...');
      
      // Try multiple strategies to find the select
      
      // Strategy 1: Look in immediate parent
      const parent = freshElement.closest('div, fieldset, form');
      console.log('Parent element:', parent?.tagName);
      
      let hiddenSelect = parent?.querySelector('select') as HTMLSelectElement;
      console.log('Hidden select in parent:', !!hiddenSelect);
      
      // Strategy 2: Look for select with same name
      if (!hiddenSelect && freshElement.name) {
        hiddenSelect = document.querySelector(`select[name="${freshElement.name}"]`) as HTMLSelectElement;
        console.log('Hidden select by name:', !!hiddenSelect);
      }
      
      // Strategy 3: Look for select with similar ID
      if (!hiddenSelect && freshElement.id) {
        const selectId = freshElement.id.replace('input', 'select').replace('_input', '');
        hiddenSelect = document.querySelector(`select[id*="${selectId}"]`) as HTMLSelectElement;
        console.log('Hidden select by ID pattern:', !!hiddenSelect);
      }
      
      // Strategy 4: Look for ANY select in the same container
      if (!hiddenSelect) {
        const container = freshElement.closest('[class*="field"], [class*="form"], [class*="input"]');
        if (container) {
          hiddenSelect = container.querySelector('select') as HTMLSelectElement;
          console.log('Hidden select in container:', !!hiddenSelect);
        }
      }
      
      // Strategy 5: Check if input has data attributes pointing to value
      if (!hiddenSelect) {
        const dataValue = freshElement.getAttribute('data-value') || 
                         freshElement.getAttribute('data-selected') ||
                         freshElement.getAttribute('aria-label');
        if (dataValue) {
          value = dataValue;
          console.log('Using data attribute value:', value);
        }
      }
      
      if (hiddenSelect) {
        console.log('Hidden select details:', {
          selectedIndex: hiddenSelect.selectedIndex,
          optionsCount: hiddenSelect.options.length,
          allOptions: Array.from(hiddenSelect.options).map((o, i) => ({ index: i, text: o.text, value: o.value }))
        });
        
        if (hiddenSelect.selectedIndex > 0) {
          const selectedOption = hiddenSelect.options[hiddenSelect.selectedIndex];
          value = selectedOption.text || selectedOption.value;
          console.log('Using hidden select value:', value);
        } else {
          console.log('Hidden select index is 0 (placeholder)');
        }
      }
    }

    // For select elements, prefer the selected option text
    if (freshElement instanceof HTMLSelectElement) {
      console.log('Element is a SELECT');
      const select = freshElement;
      const selectedOption = select.options[select.selectedIndex];
      
      console.log('Select details:', {
        selectedIndex: select.selectedIndex,
        selectedText: selectedOption?.text,
        selectedValue: selectedOption?.value
      });
      
      if (selectedOption && selectedOption.text) {
        // Use option text (more human-readable)
        value = selectedOption.text;
      }
    }

    console.log('Final value:', value);

    // If still no value, prompt user to enter it
    if (!value || !value.trim()) {
      console.log('No value found, prompting user...');
      
      // Prompt user to enter the value
      const userValue = prompt(`Enter the value for "${field.context}":`);
      
      if (!userValue || !userValue.trim()) {
        this.showToast('⚠️ No value entered', 'warning');
        return;
      }
      
      value = userValue.trim();
      console.log('User entered value:', value);
    }

    // Check if value is a common placeholder
    const placeholders = ['select', 'select...', 'please select', 'choose', 'choose...', '--', 'select one'];
    const lowerValue = value.toLowerCase().trim();
    const isPlaceholder = placeholders.includes(lowerValue);

    console.log('Validation:', { value, isPlaceholder });

    if (isPlaceholder) {
      this.showToast('⚠️ Please select a valid option', 'warning');
      return;
    }

    // Generate key from context
    const key = this.generateKey(field.context);

    // Save to storage
    await this.storage.addAnswer(key, value, false);

    // Update button to show success
    button.innerHTML = '✅ Saved!';
    button.style.background = '#4CAF50';

    // Highlight field green (use fresh element)
    this.formFiller.highlightFieldGreen(freshElement);

    // Show toast
    this.showToast(`✅ Saved "${key}"`, 'success');

    // Remove button after 2 seconds
    setTimeout(() => {
      button.remove();
    }, 2000);
  }

  private showToast(message: string, type: 'success' | 'warning' | 'error') {
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

  private getUnrecognizedFields() {
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

  private async fillSingleField(selector: string, value: string): Promise<{ success: boolean; error?: string }> {
    try {
      const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      if (!element) {
        return { success: false, error: 'Element not found' };
      }
      
      const field: FormField = {
        element,
        selector,
        type: 'unknown',
        context: this.fieldMatcher.getFieldContext(element),
        value: element.value || '',
        fieldType: element.tagName.toLowerCase() as 'input' | 'textarea' | 'select',
        inputType: element instanceof HTMLInputElement ? element.type : undefined,
      };
      
      const success = this.formFiller.fillField(field, value);
      return { success };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private showNotification(message: string, type: 'success' | 'info' | 'error') {
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

  private observeDynamicForms() {
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
