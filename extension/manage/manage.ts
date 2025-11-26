import { Storage } from '../core/Storage';
import { PersonalData } from '../../shared/types';

class ManageController {
  private storage: Storage;
  private personalData: PersonalData | null = null;
  private searchQuery: string = '';

  constructor() {
    console.log('ManageController: Initializing...');
    this.storage = new Storage();
    this.init().catch(error => {
      console.error('ManageController: Initialization failed:', error);
      alert('Failed to initialize. Please check the console for errors.');
    });
  }

  private async init() {
    try {
      console.log('ManageController: Loading personal data...');
      // Load personal data
      console.log('ManageController: Personal data loaded:', this.personalData);
      this.personalData = await this.storage.getPersonalData();
      
      // Setup event listeners
      this.setupEventListeners();
      console.log('ManageController: Event listeners setup');
      
      // Load initial data
      this.loadPersonalDataTab();
      this.updateStats();
      console.log('ManageController: Initialization complete');
    } catch (error) {
      console.error('ManageController: Error during init:', error);
      throw error;
    }
  }

  private setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tab = target.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Search
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterAnswers();
    });

    // Save personal data
    document.getElementById('savePersonalBtn')?.addEventListener('click', () => this.savePersonalData());

    // Export/Import
    document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
    document.getElementById('importBtn')?.addEventListener('click', () => this.showImportModal());
    document.getElementById('confirmImportBtn')?.addEventListener('click', () => this.importData());

    // Add custom answer
    document.getElementById('addCustomBtn')?.addEventListener('click', () => this.addCustomAnswer());
  }

  private switchTab(tab: string) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const paneMap: { [key: string]: string } = {
      'personal': 'personalTab',
      'custom': 'customTab',
      'site-specific': 'siteSpecificTab',
    };

    const paneId = paneMap[tab];
    if (paneId) {
      document.getElementById(paneId)?.classList.add('active');
      
      // Load tab-specific data
      if (tab === 'custom') this.loadCustomAnswers();
      if (tab === 'site-specific') this.loadSiteSpecificAnswers();
    }
  }

  private loadPersonalDataTab() {
    if (!this.personalData) return;

    document.querySelectorAll('.personal-field').forEach(field => {
      const input = field as HTMLInputElement | HTMLSelectElement;
      const fieldName = input.dataset.field as keyof PersonalData;
      
      if (fieldName && this.personalData) {
        const value = this.personalData[fieldName];
        
        if (input instanceof HTMLSelectElement) {
          input.value = String(value);
        } else {
          input.value = value !== null && value !== undefined ? String(value) : '';
        }
      }
    });
  }

  private async savePersonalData() {
    if (!this.personalData) return;

    document.querySelectorAll('.personal-field').forEach(field => {
      const input = field as HTMLInputElement | HTMLSelectElement;
      const fieldName = input.dataset.field as keyof PersonalData;
      
      if (fieldName && this.personalData) {
        let value: any = input.value;
        
        // Convert types
        if (fieldName === 'yearsExperience' || fieldName === 'graduationYear') {
          value = value ? parseInt(value) : undefined;
        } else if (fieldName === 'requiresSponsorship') {
          value = value === 'true';
        }
        
        (this.personalData as any)[fieldName] = value;
      }
    });

    await this.storage.setPersonalData(this.personalData);
    this.showSuccessMessage('Personal data saved successfully!');
  }

  private loadCustomAnswers() {
    if (!this.personalData?.customAnswers) return;

    const list = document.getElementById('customAnswersList');
    if (!list) return;

    list.innerHTML = '';

    const answers = Object.entries(this.personalData.customAnswers);
    
    if (answers.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-text">No custom answers yet</div>
        </div>
      `;
      return;
    }

    answers.forEach(([key, value]) => {
      const item = document.createElement('div');
      item.className = 'answer-item';
      item.innerHTML = `
        <div class="answer-info">
          <div class="answer-key">${key}</div>
          <div class="answer-value">${this.truncate(String(value), 100)}</div>
        </div>
        <div class="answer-actions">
          <button class="icon-btn edit-btn" data-key="${key}" title="Edit">✏️</button>
          <button class="icon-btn delete-btn minus-btn" data-key="${key}" title="Remove">−</button>
        </div>
      `;
      
      item.querySelector('.edit-btn')?.addEventListener('click', () => this.editCustomAnswer(key));
      item.querySelector('.delete-btn')?.addEventListener('click', () => this.deleteCustomAnswer(key));
      
      list.appendChild(item);
    });
  }

  private loadSiteSpecificAnswers() {
    if (!this.personalData?.siteSpecificAnswers) return;

    const container = document.getElementById('sitesList');
    if (!container) return;

    container.innerHTML = '';

    const sites = Object.entries(this.personalData.siteSpecificAnswers) as [string, Record<string, string>][];
    
    if (sites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🌐</div>
          <div class="empty-state-text">No site-specific answers yet</div>
        </div>
      `;
      return;
    }

    sites.forEach(([hostname, answers]) => {
      const section = document.createElement('div');
      section.className = 'site-section';
      
      const header = document.createElement('div');
      header.className = 'site-header';
      header.textContent = hostname;
      section.appendChild(header);

      const list = document.createElement('div');
      list.className = 'answers-list';

      Object.entries(answers).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'answer-item';
        item.innerHTML = `
          <div class="answer-info">
            <div class="answer-key">${key}</div>
            <div class="answer-value">${this.truncate(String(value), 100)}</div>
          </div>
          <div class="answer-actions">
            <button class="icon-btn delete-btn minus-btn" data-hostname="${hostname}" data-key="${key}" title="Remove">−</button>
          </div>
        `;
        
        item.querySelector('.delete-btn')?.addEventListener('click', () => {
          this.deleteSiteSpecificAnswer(hostname, key);
        });
        
        list.appendChild(item);
      });

      section.appendChild(list);
      container.appendChild(section);
    });
  }

  private async addCustomAnswer() {
    const key = prompt('Enter answer key (e.g., preferredWorkLocation):');
    if (!key) return;

    const value = prompt('Enter answer value:');
    if (!value) return;

    await this.storage.addAnswer(key, value, false);
    this.personalData = await this.storage.getPersonalData();
    this.loadCustomAnswers();
    this.updateStats();
    this.showSuccessMessage('Custom answer added!');
  }

  private async editCustomAnswer(key: string) {
    const currentValue = this.personalData?.customAnswers?.[key];
    const newValue = prompt('Edit answer value:', String(currentValue));
    
    if (newValue !== null) {
      await this.storage.addAnswer(key, newValue, false);
      this.personalData = await this.storage.getPersonalData();
      this.loadCustomAnswers();
      this.showSuccessMessage('Answer updated!');
    }
  }

  private async deleteCustomAnswer(key: string) {
    if (!confirm(`Delete answer "${key}"?`)) return;

    await this.storage.deleteAnswer(key, false);
    this.personalData = await this.storage.getPersonalData();
    this.loadCustomAnswers();
    this.updateStats();
    this.showSuccessMessage('Answer deleted!');
  }

  private async deleteSiteSpecificAnswer(hostname: string, key: string) {
    if (!confirm(`Delete answer "${key}" for ${hostname}?`)) return;

    await this.storage.deleteAnswer(key, true, hostname);
    this.personalData = await this.storage.getPersonalData();
    this.loadSiteSpecificAnswers();
    this.updateStats();
    this.showSuccessMessage('Answer deleted!');
  }

  private filterAnswers() {
    // Filter logic for search
    const items = document.querySelectorAll('.answer-item');
    items.forEach(item => {
      const text = item.textContent?.toLowerCase() || '';
      const matches = text.includes(this.searchQuery);
      (item as HTMLElement).style.display = matches ? 'flex' : 'none';
    });
  }

  private async exportData() {
    const json = await this.storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `magicfill-data-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showSuccessMessage('Data exported!');
  }

  private showImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private async importData() {
    const textarea = document.getElementById('importJson') as HTMLTextAreaElement;
    if (!textarea) return;

    try {
      await this.storage.importData(textarea.value);
      this.personalData = await this.storage.getPersonalData();
      this.loadPersonalDataTab();
      this.updateStats();
      this.closeImportModal();
      this.showSuccessMessage('Data imported successfully!');
    } catch (error) {
      alert('Invalid JSON format. Please check your data and try again.');
    }
  }

  private closeImportModal() {
    const modal = document.getElementById('importModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private updateStats() {
    if (!this.personalData) return;

    const totalAnswers = Object.keys(this.personalData.customAnswers || {}).length;
    const sitesConfigured = Object.keys(this.personalData.siteSpecificAnswers || {}).length;

    const totalEl = document.getElementById('totalAnswers');
    const sitesEl = document.getElementById('sitesConfigured');

    if (totalEl) totalEl.textContent = String(totalAnswers);
    if (sitesEl) sitesEl.textContent = String(sitesConfigured);
  }

  private showSuccessMessage(message: string) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

// Make closeImportModal available globally for the HTML onclick
(window as any).closeImportModal = () => {
  const modal = document.getElementById('importModal');
  if (modal) modal.style.display = 'none';
};

// Initialize
console.log('manage.ts: Script loaded, creating ManageController...');
try {
  new ManageController();
} catch (error) {
  console.error('manage.ts: Failed to create ManageController:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial;">
      <h1>Error Loading MagicFill</h1>
      <p>Failed to initialize the extension. Please check the browser console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error}</pre>
    </div>
  `;
}
