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
      
      this.showNotification(`✅ Learned ${scanResult.fields.length} fields!`, 'success');
      
      // Retry filling with new knowledge
      setTimeout(() => {
        this.autoFill();
      }, 1000);
      
      return {
        success: true,
        fieldsLearned: scanResult.fields.length
      };
      
    } catch (error) {
      console.error('Learn form error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
    const fields = this.fieldMatcher.findAllFields();
    const personalData = await this.storage.getPersonalData();
    
    const result = this.formFiller.fillAllFields(fields, personalData);
    this.lastFillResult = result;
    
    return result;
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
