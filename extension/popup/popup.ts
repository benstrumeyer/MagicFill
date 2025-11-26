import { ExtensionMessage } from '../../shared/types';

class PopupController {
  private currentField: { selector: string; context: string } | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Setup event listeners
    document.getElementById('fillBtn')?.addEventListener('click', () => this.fillForm());
    document.getElementById('manageBtn')?.addEventListener('click', () => this.openManageAnswers());
    document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
    document.getElementById('cancelBtn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('saveAndFillBtn')?.addEventListener('click', () => this.saveAndFill());

    // Load initial status
    await this.updateStatus();
    
    // Poll for updates every 2 seconds
    setInterval(() => this.updateStatus(), 2000);
  }

  private async updateStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        this.showStatus('⚠️', 'No active tab', 'warning');
        return;
      }

      const message: ExtensionMessage = {
        action: 'getUnrecognizedFields',
      };

      const unrecognizedFields = await chrome.tabs.sendMessage(tab.id, message);
      
      if (unrecognizedFields && unrecognizedFields.length > 0) {
        this.showStatus('✅', `Ready to fill (${unrecognizedFields.length} unrecognized)`, 'success');
        this.showUnrecognizedFields(unrecognizedFields);
      } else {
        this.showStatus('✅', 'All fields recognized', 'success');
        this.hideUnrecognizedFields();
      }
    } catch (error) {
      this.showStatus('⚠️', 'Not a fillable page', 'warning');
      this.hideUnrecognizedFields();
    }
  }

  private showStatus(icon: string, text: string, type: 'success' | 'warning' | 'error') {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    statusEl.className = `status ${type}`;
    statusEl.innerHTML = `
      <div class="status-icon">${icon}</div>
      <div class="status-text">${text}</div>
    `;
  }

  private async fillForm() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      const message: ExtensionMessage = {
        action: 'fillForm',
      };

      const result = await chrome.tabs.sendMessage(tab.id, message);
      
      if (result) {
        this.showStatus('✨', `Filled ${result.filled}/${result.total} fields`, 'success');
        await this.updateStatus();
      }
    } catch (error) {
      this.showStatus('❌', 'Error filling form', 'error');
      console.error('Fill error:', error);
    }
  }

  private showUnrecognizedFields(fields: any[]) {
    const section = document.getElementById('unrecognizedSection');
    const list = document.getElementById('unrecognizedList');
    
    if (!section || !list) return;

    section.style.display = 'block';
    list.innerHTML = '';

    fields.forEach(field => {
      const item = document.createElement('div');
      item.className = 'field-item';
      item.innerHTML = `
        <div class="field-info">
          <div class="field-context">${this.truncate(field.context, 40)}</div>
          <div class="field-type">${field.fieldType} ${field.inputType ? `(${field.inputType})` : ''}</div>
        </div>
        <button class="add-btn" data-selector="${field.selector}" data-context="${field.context}">
          + Add
        </button>
      `;
      
      const addBtn = item.querySelector('.add-btn');
      addBtn?.addEventListener('click', () => {
        this.openAddAnswerModal(field.selector, field.context);
      });
      
      list.appendChild(item);
    });
  }

  private hideUnrecognizedFields() {
    const section = document.getElementById('unrecognizedSection');
    if (section) {
      section.style.display = 'none';
    }
  }

  private openAddAnswerModal(selector: string, context: string) {
    this.currentField = { selector, context };
    
    const modal = document.getElementById('addAnswerModal');
    const contextInput = document.getElementById('fieldContext') as HTMLInputElement;
    const keyInput = document.getElementById('answerKey') as HTMLInputElement;
    const valueInput = document.getElementById('answerValue') as HTMLTextAreaElement;
    const siteSpecificCheckbox = document.getElementById('siteSpecific') as HTMLInputElement;
    
    if (!modal || !contextInput || !keyInput || !valueInput) return;

    contextInput.value = context;
    keyInput.value = this.generateAnswerKey(context);
    valueInput.value = '';
    siteSpecificCheckbox.checked = false;
    
    modal.style.display = 'flex';
    valueInput.focus();
  }

  private closeModal() {
    const modal = document.getElementById('addAnswerModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentField = null;
  }

  private async saveAndFill() {
    const keyInput = document.getElementById('answerKey') as HTMLInputElement;
    const valueInput = document.getElementById('answerValue') as HTMLTextAreaElement;
    const siteSpecificCheckbox = document.getElementById('siteSpecific') as HTMLInputElement;
    
    if (!keyInput || !valueInput || !this.currentField) return;

    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    const siteSpecific = siteSpecificCheckbox.checked;

    if (!key || !value) {
      alert('Please fill in both key and value');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      // Add answer
      const addMessage: ExtensionMessage = {
        action: 'addAnswer',
        payload: { key, value, siteSpecific },
      };
      
      await chrome.tabs.sendMessage(tab.id, addMessage);

      // Fill the field immediately
      const fillMessage: ExtensionMessage = {
        action: 'fillField',
        payload: { selector: this.currentField.selector, value },
      };
      
      await chrome.tabs.sendMessage(tab.id, fillMessage);

      this.closeModal();
      await this.updateStatus();
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Error saving answer');
    }
  }

  private generateAnswerKey(context: string): string {
    // Convert context to camelCase key
    return context
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private openManageAnswers() {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage/manage.html') });
  }
}

// Initialize popup
console.log('popup.ts: Script loaded, creating PopupController...');
try {
  new PopupController();
  console.log('popup.ts: PopupController created successfully');
} catch (error) {
  console.error('popup.ts: Failed to create PopupController:', error);
  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px;">
        <h1 style="color: #f44336;">Error</h1>
        <p>Failed to initialize popup. Check console for details.</p>
      </div>
    `;
  }
}
