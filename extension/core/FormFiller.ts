import { FormField, PersonalData } from '../../shared/types';

export interface FillResult {
  filled: number;
  total: number;
  unrecognized: FormField[];
}

export class FormFiller {
  /**
   * Fill a single field with a value (async version with persistence)
   */
  async fillFieldAsync(field: FormField, value: string | boolean): Promise<boolean> {
    try {
      const element = field.element;
      
      if (!element || element.disabled) {
        return false;
      }
      
      if ('readOnly' in element && element.readOnly) {
        return false;
      }

      // Focus and click the field first to trigger any JS handlers
      this.focusAndClickField(element);
      
      // No delay needed - just fill immediately
      
      // Handle different field types
      let success = false;
      if (element instanceof HTMLInputElement) {
        success = await this.fillInputWithPersistence(element, value);
      } else if (element instanceof HTMLTextAreaElement) {
        success = await this.fillTextareaWithPersistence(element, value as string);
      } else if (element instanceof HTMLSelectElement) {
        success = await this.fillSelectAsync(element, value as string);
        if (success) {
          this.highlightField(element);
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error filling field:', error);
      return false;
    }
  }

  /**
   * Fill input with persistence - monitors and re-fills if cleared
   */
  private async fillInputWithPersistence(input: HTMLInputElement, value: string | boolean): Promise<boolean> {
    const stringValue = String(value);
    
    // For text inputs, simulate typing
    if (['text', 'email', 'tel', 'url', 'number', 'date'].includes(input.type)) {
      // Type the value character by character
      await this.simulateTyping(input, stringValue);
      
      // DISABLED: Monitoring causes infinite loops with some forms
      // Just fill once and let it stick
      
      return true;
    } else if (input.type === 'checkbox') {
      input.checked = Boolean(value);
      this.triggerEvents(input);
      return true;
    } else if (input.type === 'radio') {
      if (input.value === stringValue) {
        input.checked = true;
        this.triggerEvents(input);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Fill textarea with persistence
   */
  private async fillTextareaWithPersistence(textarea: HTMLTextAreaElement, value: string): Promise<boolean> {
    // Type the value
    await this.simulateTyping(textarea, value);
    
    // DISABLED: Monitoring causes infinite loops with some forms
    // Just fill once and let it stick
    
    return true;
  }

  /**
   * Simulate typing character by character
   */
  private async simulateTyping(element: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<void> {
    // Clear the field first
    this.setReactValue(element, '');
    
    // Set the full value at once (no delay)
    this.setReactValue(element, value);
    
    // Trigger events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * Fill a single field with a value (sync version for backwards compatibility)
   */
  fillField(field: FormField, value: string | boolean): boolean {
    try {
      const element = field.element;
      
      if (!element || element.disabled) {
        return false;
      }
      
      if ('readOnly' in element && element.readOnly) {
        return false;
      }

      // Focus and click the field first to trigger any JS handlers
      this.focusAndClickField(element);
      
      // Handle different field types
      if (element instanceof HTMLInputElement) {
        return this.fillInput(element, value);
      } else if (element instanceof HTMLTextAreaElement) {
        return this.fillTextarea(element, value as string);
      } else if (element instanceof HTMLSelectElement) {
        return this.fillSelect(element, value as string);
      }
      
      return false;
    } catch (error) {
      console.error('Error filling field:', error);
      return false;
    }
  }

  /**
   * Focus and click a field to trigger any JS event handlers
   */
  private focusAndClickField(element: HTMLElement): void {
    try {
      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Focus the element
      if ('focus' in element && typeof element.focus === 'function') {
        element.focus();
      }
      
      // Click the element
      element.click();
      
      // Trigger focus event
      element.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      
      // Trigger click event
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      
    } catch (error) {
      console.error('Error focusing/clicking field:', error);
    }
  }

  /**
   * Fill an input element
   */
  private fillInput(input: HTMLInputElement, value: string | boolean): boolean {
    switch (input.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
        // Use React's native setter if available (for React forms)
        this.setReactValue(input, String(value));
        this.triggerEvents(input);
        this.highlightField(input);
        return true;
      
      case 'checkbox':
        input.checked = Boolean(value);
        this.triggerEvents(input);
        this.highlightField(input);
        return true;
      
      case 'radio':
        if (input.value === String(value)) {
          input.checked = true;
          this.triggerEvents(input);
          this.highlightField(input);
          return true;
        }
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Set value using React's native setter (works for React, Vue, and vanilla JS)
   */
  private setReactValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
    // Get the native value setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    
    // Use the native setter to bypass React's controlled component
    if (element instanceof HTMLInputElement && nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(element, value);
    } else {
      element.value = value;
    }
  }

  /**
   * Fill a textarea element
   */
  private fillTextarea(textarea: HTMLTextAreaElement, value: string): boolean {
    // Use React's native setter if available
    this.setReactValue(textarea, value);
    this.triggerEvents(textarea);
    this.highlightField(textarea);
    return true;
  }

  /**
   * Fill a select element with enhanced dropdown support
   */
  private async fillSelectAsync(select: HTMLSelectElement, value: string): Promise<boolean> {
    console.log('Filling select dropdown:', { value, optionsCount: select.options.length });
    
    // DISABLED: Greenhouse dropdown handling causes infinite loops
    // Use manual fill + "Save All Answers" workflow instead
    // const isGreenhouse = window.location.hostname.includes('greenhouse.io');
    // if (isGreenhouse) {
    //   console.log('Detected Greenhouse - trying custom dropdown handler');
    //   const success = await this.fillGreenhouseDropdown(select, value);
    //   if (success) return true;
    // }
    
    // Standard select handling
    // Click to open the dropdown
    select.click();
    select.focus();
    
    // Dispatch mousedown to trigger any custom dropdown handlers
    select.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    
    // Wait for dropdown to open and render
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let matchedIndex = -1;
    let matchedOption: HTMLOptionElement | null = null;
    
    // Try exact match first
    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      if (option.value === value || option.text === value) {
        matchedIndex = i;
        matchedOption = option;
        break;
      }
    }
    
    // Try partial match if no exact match
    if (matchedIndex === -1) {
      const lowerValue = value.toLowerCase();
      for (let i = 0; i < select.options.length; i++) {
        const option = select.options[i];
        if (option.value.toLowerCase().includes(lowerValue) || 
            option.text.toLowerCase().includes(lowerValue)) {
          matchedIndex = i;
          matchedOption = option;
          break;
        }
      }
    }
    
    if (matchedIndex !== -1 && matchedOption) {
      // Click the option
      matchedOption.click();
      
      // Set the selected index
      select.selectedIndex = matchedIndex;
      
      // Trigger events
      select.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      select.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      select.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Keep focus
      select.focus();
      
      return true;
    }
    
    return false;
  }

  // REMOVED: Greenhouse dropdown handling - caused infinite loops
  // Use manual workflow: Fill text fields → Manually select dropdowns → Click "Save All Answers"

  /**
   * Fill a select element (sync version)
   */
  private fillSelect(select: HTMLSelectElement, value: string): boolean {
    // Try exact match first
    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      if (option.value === value || option.text === value) {
        select.selectedIndex = i;
        this.triggerEvents(select);
        this.highlightField(select);
        return true;
      }
    }
    
    // Try partial match
    const lowerValue = value.toLowerCase();
    for (let i = 0; i < select.options.length; i++) {
      const option = select.options[i];
      if (option.value.toLowerCase().includes(lowerValue) || 
          option.text.toLowerCase().includes(lowerValue)) {
        select.selectedIndex = i;
        this.triggerEvents(select);
        this.highlightField(select);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Trigger change events to notify frameworks (React, Vue, etc.)
   * Note: We don't trigger blur because it can cause some forms to reset
   */
  private triggerEvents(element: HTMLElement): void {
    // Trigger input event (most important for React)
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Trigger change event
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Keep focus on the element to prevent blur-triggered resets
    if ('focus' in element && typeof element.focus === 'function') {
      element.focus();
    }
  }

  /**
   * Highlight a filled field with visual feedback
   */
  private highlightField(element: HTMLElement): void {
    const originalBorder = element.style.border;
    const originalBackground = element.style.backgroundColor;
    const originalColor = element.style.color;
    
    element.style.border = '2px solid #4CAF50';
    element.style.backgroundColor = '#E8F5E9';
    element.style.color = '#000000';
    
    setTimeout(() => {
      element.style.border = originalBorder;
      element.style.backgroundColor = originalBackground;
      element.style.color = originalColor;
    }, 1000);
  }

  /**
   * Public method to highlight field green (for external use)
   */
  highlightFieldGreen(element: HTMLElement): void {
    this.highlightField(element);
  }

  /**
   * Highlight an unrecognized field in red
   */
  private highlightUnrecognizedField(element: HTMLElement): void {
    const originalBorder = element.style.border;
    const originalBackground = element.style.backgroundColor;
    const originalColor = element.style.color;
    
    element.style.border = '2px solid #f44336';
    element.style.backgroundColor = '#ffebee';
    element.style.color = '#000000';
    
    setTimeout(() => {
      element.style.border = originalBorder;
      element.style.backgroundColor = originalBackground;
      element.style.color = originalColor;
    }, 2000);
  }

  /**
   * Fill all fields on the page (async version)
   */
  async fillAllFieldsAsync(fields: FormField[], personalData: PersonalData, fieldMatcher: any): Promise<FillResult> {
    console.log('=== FILL ALL FIELDS (ASYNC) ===');
    console.log('Total fields found:', fields.length);
    console.log('Custom answers available:', Object.keys(personalData.customAnswers || {}).length);
    console.log('Custom answer keys:', Object.keys(personalData.customAnswers || {}));
    
    let filled = 0;
    const unrecognized: FormField[] = [];
    const fileUploads: FormField[] = [];
    
    for (const field of fields) {
      console.log(`\nProcessing field:`, {
        selector: field.selector,
        type: field.type,
        context: field.context,
        fieldType: field.fieldType
      });
      
      // Handle file uploads separately
      if (field.inputType === 'file') {
        console.log('→ File upload, skipping');
        fileUploads.push(field);
        this.highlightFileUpload(field.element);
        continue;
      }
      
      // Get value from personal data (pass field for context matching)
      // Even for unknown types, try to match using field mappings and custom answers
      console.log('→ Getting value for type:', field.type || 'unknown');
      const value = this.getValueForField(field.type || 'unknown', personalData, field, fieldMatcher);
      console.log('→ Value found:', value);
      
      if (value !== null && value !== undefined && value !== '') {
        const success = await this.fillFieldAsync(field, value);
        if (success) filled++;
      } else {
        console.log('→ No value found, marking as unrecognized');
        unrecognized.push(field);
        this.highlightUnrecognizedField(field.element);
      }
    }
    
    // Show notification for file uploads
    if (fileUploads.length > 0) {
      this.showFileUploadNotification(fileUploads);
    }
    
    return {
      filled,
      total: fields.length,
      unrecognized,
    };
  }

  /**
   * Fill all fields on the page (sync version for backwards compatibility)
   */
  fillAllFields(fields: FormField[], personalData: PersonalData, fieldMatcher: any): FillResult {
    console.log('=== FILL ALL FIELDS ===');
    console.log('Total fields found:', fields.length);
    console.log('Custom answers available:', Object.keys(personalData.customAnswers || {}).length);
    console.log('Custom answer keys:', Object.keys(personalData.customAnswers || {}));
    
    let filled = 0;
    const unrecognized: FormField[] = [];
    const fileUploads: FormField[] = [];
    
    for (const field of fields) {
      console.log(`\nProcessing field:`, {
        selector: field.selector,
        type: field.type,
        context: field.context,
        fieldType: field.fieldType
      });
      
      // Handle file uploads separately
      if (field.inputType === 'file') {
        console.log('→ File upload, skipping');
        fileUploads.push(field);
        this.highlightFileUpload(field.element);
        continue;
      }
      
      // Get value from personal data (pass field for context matching)
      // Even for unknown types, try to match using field mappings and custom answers
      console.log('→ Getting value for type:', field.type || 'unknown');
      const value = this.getValueForField(field.type || 'unknown', personalData, field, fieldMatcher);
      console.log('→ Value found:', value);
      
      if (value !== null && value !== undefined && value !== '') {
        const success = this.fillField(field, value);
        if (success) filled++;
      } else {
        console.log('→ No value found, marking as unrecognized');
        unrecognized.push(field);
        this.highlightUnrecognizedField(field.element);
      }
    }
    
    // Show notification for file uploads
    if (fileUploads.length > 0) {
      this.showFileUploadNotification(fileUploads);
    }
    
    return {
      filled,
      total: fields.length,
      unrecognized,
    };
  }

  /**
   * Highlight a file upload field in blue
   */
  private highlightFileUpload(element: HTMLElement): void {
    const originalBorder = element.style.border;
    const originalBackground = element.style.backgroundColor;
    const originalColor = element.style.color;
    
    element.style.border = '2px solid #2196F3';
    element.style.backgroundColor = '#E3F2FD';
    element.style.color = '#000000';
    
    setTimeout(() => {
      element.style.border = originalBorder;
      element.style.backgroundColor = originalBackground;
      element.style.color = originalColor;
    }, 3000);
  }

  /**
   * Show notification for file uploads
   */
  private showFileUploadNotification(fileFields: FormField[]): void {
    const fileTypes = fileFields.map(f => {
      if (f.type === 'resumeUpload') return 'Resume';
      if (f.type === 'coverLetterUpload') return 'Cover Letter';
      if (f.type === 'transcriptUpload') return 'Transcript';
      if (f.type === 'portfolioUpload') return 'Portfolio';
      return 'File';
    });
    
    const uniqueTypes = [...new Set(fileTypes)];
    const message = `📎 Please upload: ${uniqueTypes.join(', ')}`;
    
    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      background: #2196F3;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Match field context to custom answer keys
   */
  private matchContextToCustomAnswers(context: string, customAnswers: Record<string, string>): string | null {
    console.log('  Fuzzy matching context:', context);
    console.log('  Against keys:', Object.keys(customAnswers));
    
    const lowerContext = context.toLowerCase();
    const normalizedContext = lowerContext.replace(/[^a-z0-9]/g, '');
    
    // Try exact match first (case-insensitive, normalized)
    for (const key of Object.keys(customAnswers)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedKey === normalizedContext) {
        console.log('  ✓ Exact normalized match found:', key);
        return key;
      }
    }
    
    // Try fuzzy matching - check if context contains the key or key contains context words
    for (const key of Object.keys(customAnswers)) {
      const lowerKey = key.toLowerCase();
      
      // Convert camelCase to words (e.g., "whatIsYourGender" → ["what", "is", "your", "gender"])
      const keyWords = lowerKey
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2); // Filter out short words like "is", "a", etc.
      
      // Extract meaningful words from context
      const contextWords = lowerContext
        .split(/\s+/)
        .filter(w => w.length > 2);
      
      console.log(`  Checking key "${key}":`, { keyWords, contextWords });
      
      // Check if most key words are in context
      const matchCount = keyWords.filter(kw => 
        contextWords.some(cw => cw.includes(kw) || kw.includes(cw))
      ).length;
      
      // Lower threshold to 50% for better matching
      const threshold = Math.max(1, Math.ceil(keyWords.length * 0.5));
      console.log(`  Match count: ${matchCount}/${keyWords.length}, threshold: ${threshold}`);
      
      if (matchCount >= threshold && keyWords.length > 0) {
        console.log('  ✓ Fuzzy match found:', key);
        return key;
      }
    }
    
    console.log('  ✗ No match found');
    return null;
  }

  /**
   * Get value from personal data for a field type
   */
  getValueForField(type: string, data: PersonalData, field?: FormField, fieldMatcher?: any): string | boolean | null {
    // Check field mappings FIRST (highest priority for scale)
    if (field && data.fieldMappings && fieldMatcher) {
      const mappingKey = fieldMatcher.matchFieldToMapping(field.context, data.fieldMappings);
      if (mappingKey && data.fieldMappings[mappingKey]) {
        console.log(`  ✓ Using field mapping: ${mappingKey} = ${data.fieldMappings[mappingKey].value}`);
        return data.fieldMappings[mappingKey].value;
      }
    }
    
    // Check custom answers - exact match
    if (data.customAnswers && data.customAnswers[type]) {
      return data.customAnswers[type];
    }
    
    // If type is unknown, try to match field context against custom answer keys
    if (type === 'unknown' && field && data.customAnswers) {
      const matchedKey = this.matchContextToCustomAnswers(field.context, data.customAnswers);
      if (matchedKey) {
        return data.customAnswers[matchedKey];
      }
    }
    
    // Map to personal data fields
    switch (type) {
      case 'firstName': return data.firstName;
      case 'lastName': return data.lastName;
      case 'fullName': return `${data.firstName} ${data.lastName}`;
      case 'email': return data.email;
      case 'phone': return data.phone;
      case 'address': return data.address;
      case 'address2': return data.address2 || '';
      case 'city': return data.city;
      case 'state': return data.state;
      case 'zipCode': return data.zipCode;
      case 'country': return data.country;
      case 'currentCompany': return data.currentCompany || '';
      case 'currentTitle': return data.currentTitle || '';
      case 'yearsExperience': return data.yearsExperience?.toString() || '';
      case 'linkedin': return data.linkedin || '';
      case 'github': return data.github || '';
      case 'portfolio': return data.portfolio || '';
      case 'university': return data.university || '';
      case 'degree': return data.degree || '';
      case 'major': return data.major || '';
      case 'graduationYear': return data.graduationYear?.toString() || '';
      case 'workAuthorization': return data.workAuthorization || '';
      case 'requiresSponsorship': return data.requiresSponsorship ?? false;
      case 'salaryExpectation': return data.salaryExpectation || '';
      case 'startDate': return data.startDate || '';
      case 'noticePeriod': return data.noticePeriod || '';
      case 'referral': return data.referral || '';
      case 'howDidYouHear': return data.howDidYouHear || '';
      case 'coverLetter': return data.coverLetter || '';
      case 'additionalInfo': return data.additionalInfo || '';
      default: return null;
    }
  }
}
