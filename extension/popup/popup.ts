import { ExtensionMessage } from '../../shared/types';

class PopupController {
  constructor() {
    this.init();
  }

  private async init() {
    // Setup event listeners
    document.getElementById('fillBtn')?.addEventListener('click', () => this.fillForm());
    document.getElementById('learnBtn')?.addEventListener('click', () => this.learnForm());
    document.getElementById('manageBtn')?.addEventListener('click', () => this.openManageAnswers());

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
      } else {
        this.showStatus('✅', 'All fields recognized', 'success');
      }
    } catch (error) {
      this.showStatus('⚠️', 'Not a fillable page', 'warning');
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



  private async learnForm() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      this.showStatus('🧠', 'Learning form...', 'success');

      const message: ExtensionMessage = {
        action: 'learnForm',
      };

      const result = await chrome.tabs.sendMessage(tab.id, message);
      
      if (result.success) {
        if (result.fieldsLearned === 0) {
          this.showStatus('✅', 'All fields recognized!', 'success');
        } else {
          this.showStatus('✅', `Found ${result.fieldsLearned} new fields!`, 'success');
          
          // Open review page
          if (result.openReview) {
            chrome.tabs.create({ url: chrome.runtime.getURL('review-fields.html') });
          }
        }
        await this.updateStatus();
      } else {
        this.showStatus('❌', result.error || 'Learning failed', 'error');
      }
    } catch (error) {
      this.showStatus('❌', 'MCP server not running', 'error');
      console.error('Learn error:', error);
    }
  }

  private openManageAnswers() {
    chrome.tabs.create({ url: chrome.runtime.getURL('manage.html') });
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
