import { FieldMatcher } from '../core/FieldMatcher';
import { FormFiller } from '../core/FormFiller';
import { Storage } from '../core/Storage';
import { MCPClient } from '../core/MCPClient';
import { BrowserLearningMode } from '../core/BrowserLearningMode';
import { ExtensionMessage, FormField } from '../../shared/types';

class ContentScript {
  private fieldMatcher: FieldMatcher;
  private formFiller: FormFiller;
  private storage: Storage;
  private mcpClient: MCPClient;
  private learningMode: BrowserLearningMode;
  private lastFillResult: { filled: number; total: number; unrecognized: FormField[] } | null = null;

  constructor() {
    this.fieldMatcher = new FieldMatcher();
    this.formFiller = new FormFiller();
    this.storage = new Storage();
    this.mcpClient = new MCPClient();
    this.learningMode = new BrowserLearningMode();
    
    this.init();
  }

  private async init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
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
    
    // Add auto-save listeners to all fields
    this.setupAutoSave();
  }

  /**
   * Setup auto-save on blur for all form fields
   */
  private setupAutoSave() {
    // Find all fillable fields
    const fields = this.fieldMatcher.findAllFields();
    
    for (const field of fields) {
      const element = field.element;
      
      // Skip file inputs
      if (field.inputType === 'file') continue;
      
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
  private addFieldIndicator(element: HTMLElement, _field: any) {
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
      (element as any).__magicfillIndicator = indicator;
    }
  }

  /**
   * Auto-save field value on blur
   */
  private async autoSaveField(element: HTMLElement, field: any) {
    let value = '';
    
    // Get the value
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        value = element.checked ? 'true' : 'false';
      } else {
        value = element.value;
      }
    } else if (element instanceof HTMLTextAreaElement) {
      value = element.value;
    } else if (element instanceof HTMLSelectElement) {
      value = element.options[element.selectedIndex]?.text || element.value;
    }
    
    // Skip if empty
    if (!value || value.trim() === '') return;
    
    // Generate key from context
    const key = this.generateKey(field.context);
    
    // Save to storage
    await this.storage.addAnswer(key, value, false);
    
    // Update indicator
    const indicator = (element as any).__magicfillIndicator;
    if (indicator) {
      indicator.innerHTML = '✓';
      indicator.style.background = '#10b981';
      indicator.style.color = 'white';
    }
    
    // Show toast
    this.showToast(`✓ Saved: ${field.context} = ${value}`, 'success');
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
        this.showToast(
          message.payload.message,
          message.payload.type || 'success'
        );
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
  private async saveAllAnswers() {
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
        } else if (element instanceof HTMLTextAreaElement) {
          return element.value && element.value.trim() !== '';
        } else if (element instanceof HTMLSelectElement) {
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
      const answers: Array<{ key: string; value: string; context: string }> = [];
      
      for (const field of filledFields) {
        const element = field.element;
        let value = '';
        
        // Get the value
        if (element instanceof HTMLInputElement) {
          if (element.type === 'checkbox') {
            value = element.checked ? 'true' : 'false';
          } else if (element.type === 'radio') {
            value = element.value;
          } else {
            value = element.value;
          }
        } else if (element instanceof HTMLTextAreaElement) {
          value = element.value;
        } else if (element instanceof HTMLSelectElement) {
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
        } else {
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
      
    } catch (error: any) {
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
    
    const result = await this.formFiller.fillAllFieldsAsync(fields, personalData, this.fieldMatcher);
    this.lastFillResult = result;
    
    console.log('✅ Fill complete:', { filled: result.filled, total: result.total, unrecognized: result.unrecognized.length });
    
    // No longer adding save buttons - using auto-save on blur instead
    
    return result;
  }

  // REMOVED: Old save button methods - now using auto-save on blur with indicators

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
