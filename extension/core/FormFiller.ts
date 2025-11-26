import { FormField, PersonalData } from '../../shared/types';

export interface FillResult {
  filled: number;
  total: number;
  unrecognized: FormField[];
}

export class FormFiller {
  /**
   * Fill a single field with a value
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
        input.value = String(value);
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
   * Fill a textarea element
   */
  private fillTextarea(textarea: HTMLTextAreaElement, value: string): boolean {
    textarea.value = value;
    this.triggerEvents(textarea);
    this.highlightField(textarea);
    return true;
  }

  /**
   * Fill a select element
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
   */
  private triggerEvents(element: HTMLElement): void {
    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Trigger change event
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Trigger blur event
    element.dispatchEvent(new Event('blur', { bubbles: true }));
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
   * Fill all fields on the page
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
