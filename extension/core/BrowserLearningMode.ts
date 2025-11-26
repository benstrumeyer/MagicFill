/**
 * Browser Learning Mode - Like Playwright but in regular Chrome!
 * Watches you fill the form and learns from your actions
 */

export interface LearnedField {
  selector: string;
  label: string;
  value: string;
  type: 'input' | 'select' | 'textarea';
  inputType?: string;
  timestamp: string;
}

export class BrowserLearningMode {
  private learnedFields: Map<string, LearnedField> = new Map();
  private isActive: boolean = false;
  private indicator: HTMLElement | null = null;
  
  /**
   * Start learning mode
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.learnedFields.clear();
    
    // Add visual indicator
    this.showIndicator();
    
    // Listen to all form interactions
    this.attachListeners();
    
    console.log('🎓 Browser Learning Mode Active!');
  }
  
  /**
   * Stop learning mode
   */
  stop(): LearnedField[] {
    this.isActive = false;
    this.removeIndicator();
    this.detachListeners();
    
    const fields = Array.from(this.learnedFields.values());
    console.log(`📊 Learned ${fields.length} fields`);
    
    return fields;
  }
  
  /**
   * Show visual indicator
   */
  private showIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.id = 'magicfill-learning-indicator';
    this.indicator.innerHTML = '🎓 Learning Mode: 0 fields';
    this.indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(this.indicator);
  }
  
  /**
   * Remove indicator
   */
  private removeIndicator() {
    if (this.indicator) {
      this.indicator.remove();
      this.indicator = null;
    }
  }
  
  /**
   * Update indicator count
   */
  private updateIndicator() {
    if (this.indicator) {
      const count = this.learnedFields.size;
      this.indicator.innerHTML = `🎓 Learning Mode: ${count} field${count !== 1 ? 's' : ''}`;
    }
  }
  
  /**
   * Attach event listeners
   */
  private attachListeners() {
    // Blur events for inputs/textareas
    document.addEventListener('blur', this.handleBlur, true);
    
    // Change events for selects/radios/checkboxes
    document.addEventListener('change', this.handleChange, true);
    
    // Form submit
    document.addEventListener('submit', this.handleSubmit, true);
  }
  
  /**
   * Detach event listeners
   */
  private detachListeners() {
    document.removeEventListener('blur', this.handleBlur, true);
    document.removeEventListener('change', this.handleChange, true);
    document.removeEventListener('submit', this.handleSubmit, true);
  }
  
  /**
   * Handle blur event
   */
  private handleBlur = (e: Event) => {
    if (!this.isActive) return;
    
    const field = e.target as HTMLElement;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      this.captureField(field as HTMLInputElement | HTMLTextAreaElement);
    }
  }
  
  /**
   * Handle change event
   */
  private handleChange = (e: Event) => {
    if (!this.isActive) return;
    
    const field = e.target as HTMLElement;
    if (field.tagName === 'SELECT' || 
        (field as HTMLInputElement).type === 'radio' || 
        (field as HTMLInputElement).type === 'checkbox') {
      this.captureField(field as HTMLInputElement | HTMLSelectElement);
    }
  }
  
  /**
   * Handle form submit
   */
  private handleSubmit = (_e: Event) => {
    if (!this.isActive) return;
    
    console.log('📝 Form submitted - capturing all fields...');
    
    // Capture any remaining fields
    const fields = document.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if ((field as HTMLInputElement).value) {
        this.captureField(field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);
      }
    });
  }
  
  /**
   * Capture a field
   */
  private captureField(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    // Skip if no value
    if (!field.value || field.value.trim() === '') return;
    
    // Skip hidden/password fields
    if ((field as HTMLInputElement).type === 'hidden' || 
        (field as HTMLInputElement).type === 'password') return;
    
    const selector = this.generateSelector(field);
    
    // Check if already captured
    if (this.learnedFields.has(selector)) {
      // Update value if changed
      const existing = this.learnedFields.get(selector)!;
      if (existing.value !== field.value) {
        existing.value = field.value;
        console.log('🔄 Updated:', existing.label, '=', field.value);
      }
      return;
    }
    
    const fieldData: LearnedField = {
      selector,
      label: this.getFieldLabel(field),
      value: field.value,
      type: field.tagName.toLowerCase() as 'input' | 'select' | 'textarea',
      inputType: (field as HTMLInputElement).type || undefined,
      timestamp: new Date().toISOString()
    };
    
    this.learnedFields.set(selector, fieldData);
    
    // Save immediately to storage
    this.saveFieldToStorage(fieldData);
    
    // Visual feedback
    this.flashField(field);
    
    // Show toast notification
    this.showToast(`✓ Saved: ${fieldData.label}`);
    
    // Update indicator
    this.updateIndicator();
    
    // Log with details
    console.log('✓ Learned & Saved:', {
      label: fieldData.label,
      value: fieldData.value,
      selector: fieldData.selector,
      type: fieldData.type,
      timestamp: fieldData.timestamp
    });
  }
  
  /**
   * Save field to storage immediately
   */
  private saveFieldToStorage(field: LearnedField) {
    // Send message to content script to save
    window.postMessage({
      type: 'MAGICFILL_SAVE_FIELD',
      label: field.label,
      value: field.value
    }, '*');
  }
  
  /**
   * Flash field green
   */
  private flashField(field: HTMLElement) {
    const originalBorder = field.style.border;
    const originalBoxShadow = field.style.boxShadow;
    
    field.style.border = '2px solid #10b981';
    field.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.5)';
    
    setTimeout(() => {
      field.style.border = originalBorder;
      field.style.boxShadow = originalBoxShadow;
    }, 1000);
  }
  
  /**
   * Show toast notification
   */
  private showToast(message: string) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999998;
      animation: slideUp 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    // Remove after 2 seconds
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  /**
   * Generate selector for field
   */
  private generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    
    const name = el.getAttribute('name');
    if (name) {
      const tag = el.tagName.toLowerCase();
      return `${tag}[name="${name}"]`;
    }
    
    const testId = el.getAttribute('data-testid') || el.getAttribute('data-qa');
    if (testId) return `[data-testid="${testId}"]`;
    
    // Fallback to nth-of-type
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName === el.tagName
      );
      const index = siblings.indexOf(el) + 1;
      return `${el.tagName.toLowerCase()}:nth-of-type(${index})`;
    }
    
    return el.tagName.toLowerCase();
  }
  
  /**
   * Get field label
   */
  private getFieldLabel(el: HTMLElement): string {
    const labels: string[] = [];
    
    // Get label by 'for' attribute
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label?.textContent) labels.push(label.textContent.trim());
    }
    
    // Get aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) labels.push(ariaLabel);
    
    // Get placeholder
    if ('placeholder' in el && (el as HTMLInputElement).placeholder) {
      labels.push((el as HTMLInputElement).placeholder);
    }
    
    // Get parent label
    const parentLabel = el.closest('label');
    if (parentLabel?.textContent) {
      const text = parentLabel.textContent
        .replace((el as HTMLInputElement).value || '', '')
        .trim();
      if (text) labels.push(text);
    }
    
    // Get preceding sibling
    const prevSibling = el.previousElementSibling;
    if (prevSibling?.textContent) {
      const text = prevSibling.textContent.trim();
      if (text && text.length < 100) labels.push(text);
    }
    
    // Fallback
    if (labels.length === 0) {
      labels.push(el.getAttribute('name') || el.id || 'Unknown Field');
    }
    
    return labels[0];
  }
}
