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
  fillAllFields(fields: FormField[], personalData: PersonalData): FillResult {
    let filled = 0;
    const unrecognized: FormField[] = [];
    
    for (const field of fields) {
      if (!field.type || field.type === 'unknown') {
        unrecognized.push(field);
        this.highlightUnrecognizedField(field.element);
        continue;
      }
      
      // Get value from personal data
      const value = this.getValueForField(field.type, personalData);
      
      if (value !== null && value !== undefined) {
        const success = this.fillField(field, value);
        if (success) filled++;
      } else {
        unrecognized.push(field);
        this.highlightUnrecognizedField(field.element);
      }
    }
    
    return {
      filled,
      total: fields.length,
      unrecognized,
    };
  }

  /**
   * Get value from personal data for a field type
   */
  private getValueForField(type: string, data: PersonalData): string | boolean | null {
    // Check custom answers first
    if (data.customAnswers && data.customAnswers[type]) {
      return data.customAnswers[type];
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
