import { Storage } from '../core/Storage';

interface LearnedField {
  key: string;
  context: string;
  value: string;
  selector: string;
}

class ReviewFieldsController {
  private storage: Storage;
  private fields: LearnedField[] = [];

  constructor() {
    this.storage = new Storage();
    this.init();
  }

  private async init() {
    // Load learned fields from session storage
    const fieldsData = sessionStorage.getItem('learnedFields');
    
    if (!fieldsData) {
      document.body.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>No fields to review</h2>
          <p>Click "Learn Form" first to scan a page.</p>
        </div>
      `;
      return;
    }
    
    this.fields = JSON.parse(fieldsData);
    this.renderFields();
    
    // Setup event listeners
    document.getElementById('cancelBtn')?.addEventListener('click', () => window.close());
    document.getElementById('saveBtn')?.addEventListener('click', () => this.saveAllAnswers());
  }

  private renderFields() {
    const list = document.getElementById('fieldsList');
    const countEl = document.getElementById('fieldCount');
    
    if (!list || !countEl) return;

    countEl.textContent = `${this.fields.length} field${this.fields.length !== 1 ? 's' : ''} to review`;
    
    list.innerHTML = '';
    
    this.fields.forEach((field, index) => {
      const item = document.createElement('div');
      item.className = 'learned-field';
      item.innerHTML = `
        <div class="field-details">
          <div class="field-label">${this.generateLabel(field.key)}</div>
          <div class="field-context">${field.context}</div>
          <input 
            type="text" 
            class="field-input" 
            data-index="${index}"
            placeholder="Enter your answer..."
            value="${field.value}"
          >
        </div>
        <button class="remove-btn" data-index="${index}">−</button>
      `;
      
      // Update value on input
      const input = item.querySelector('.field-input') as HTMLInputElement;
      input?.addEventListener('input', (e) => {
        this.fields[index].value = (e.target as HTMLInputElement).value;
      });
      
      // Remove field
      const removeBtn = item.querySelector('.remove-btn');
      removeBtn?.addEventListener('click', () => {
        this.removeField(index);
      });
      
      list.appendChild(item);
    });
  }

  private removeField(index: number) {
    this.fields.splice(index, 1);
    this.renderFields();
  }

  private async saveAllAnswers() {
    let saved = 0;
    
    for (const field of this.fields) {
      if (field.value.trim()) {
        await this.storage.addAnswer(field.key, field.value, false);
        saved++;
      }
    }
    
    // Clear session storage
    sessionStorage.removeItem('learnedFields');
    
    // Show success and close
    alert(`✅ Saved ${saved} answer${saved !== 1 ? 's' : ''}!`);
    window.close();
  }

  private generateLabel(key: string): string {
    // Convert camelCase to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

// Initialize
console.log('review-fields.ts: Initializing...');
new ReviewFieldsController();
