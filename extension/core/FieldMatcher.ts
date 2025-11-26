import { FormField } from '../../shared/types';

interface FieldPattern {
  type: string;
  patterns: RegExp[];
  priority: number;
}

export class FieldMatcher {
  private patterns: FieldPattern[] = [
    // Name fields
    { type: 'firstName', patterns: [/first.*name/i, /fname/i, /given.*name/i], priority: 10 },
    { type: 'lastName', patterns: [/last.*name/i, /lname/i, /surname/i, /family.*name/i], priority: 10 },
    { type: 'fullName', patterns: [/^name$/i, /full.*name/i, /your.*name/i], priority: 9 },
    
    // Contact fields
    { type: 'email', patterns: [/email/i, /e-mail/i], priority: 10 },
    { type: 'phone', patterns: [/phone/i, /mobile/i, /telephone/i, /contact.*number/i], priority: 10 },
    
    // Address fields
    { type: 'address', patterns: [/^address$/i, /street.*address/i, /address.*line.*1/i], priority: 10 },
    { type: 'address2', patterns: [/address.*line.*2/i, /apt/i, /suite/i, /unit/i], priority: 9 },
    { type: 'city', patterns: [/city/i, /town/i], priority: 10 },
    { type: 'state', patterns: [/state/i, /province/i, /region/i], priority: 10 },
    { type: 'zipCode', patterns: [/zip/i, /postal/i, /postcode/i], priority: 10 },
    { type: 'country', patterns: [/country/i], priority: 10 },
    
    // Professional fields
    { type: 'currentCompany', patterns: [/current.*company/i, /employer/i, /organization/i], priority: 9 },
    { type: 'currentTitle', patterns: [/current.*title/i, /job.*title/i, /position/i, /role/i], priority: 9 },
    { type: 'yearsExperience', patterns: [/years.*experience/i, /experience.*years/i, /yoe/i], priority: 9 },
    { type: 'linkedin', patterns: [/linkedin/i, /linkedin.*url/i, /linkedin.*profile/i], priority: 10 },
    { type: 'github', patterns: [/github/i, /github.*url/i, /github.*profile/i], priority: 10 },
    { type: 'portfolio', patterns: [/portfolio/i, /website/i, /personal.*site/i], priority: 9 },
    
    // Education fields
    { type: 'university', patterns: [/university/i, /college/i, /school/i, /education/i], priority: 9 },
    { type: 'degree', patterns: [/degree/i, /qualification/i], priority: 9 },
    { type: 'major', patterns: [/major/i, /field.*study/i, /specialization/i], priority: 9 },
    { type: 'graduationYear', patterns: [/graduation/i, /grad.*year/i, /year.*graduated/i], priority: 9 },
    
    // Work authorization
    { type: 'workAuthorization', patterns: [/work.*authorization/i, /authorized.*work/i, /visa.*status/i, /sponsorship/i], priority: 9 },
    { type: 'requiresSponsorship', patterns: [/require.*sponsorship/i, /need.*sponsorship/i, /visa.*sponsorship/i], priority: 9 },
    
    // Salary & availability
    { type: 'salaryExpectation', patterns: [/salary/i, /compensation/i, /expected.*salary/i], priority: 8 },
    { type: 'startDate', patterns: [/start.*date/i, /available.*date/i, /availability/i], priority: 8 },
    { type: 'noticePeriod', patterns: [/notice.*period/i, /notice/i], priority: 8 },
    
    // Referral & source
    { type: 'referral', patterns: [/referral/i, /referred.*by/i, /reference/i], priority: 8 },
    { type: 'howDidYouHear', patterns: [/how.*hear/i, /source/i, /where.*find/i], priority: 7 },
    
    // Cover letter & additional info
    { type: 'coverLetter', patterns: [/cover.*letter/i, /why.*interested/i, /tell.*us.*about/i], priority: 7 },
    { type: 'additionalInfo', patterns: [/additional/i, /other.*information/i, /comments/i, /notes/i], priority: 6 },
  ];

  /**
   * Extract context from a form field (label, placeholder, name, id)
   */
  getFieldContext(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
    const contexts: string[] = [];
    
    // Get label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label?.textContent) contexts.push(label.textContent.trim());
    }
    
    // Get aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) contexts.push(ariaLabel);
    
    // Get placeholder
    if ('placeholder' in element && element.placeholder) {
      contexts.push(element.placeholder);
    }
    
    // Get name attribute
    if (element.name) contexts.push(element.name);
    
    // Get id attribute
    if (element.id) contexts.push(element.id);
    
    // Get parent label
    const parentLabel = element.closest('label');
    if (parentLabel?.textContent) {
      contexts.push(parentLabel.textContent.replace(element.value || '', '').trim());
    }
    
    return contexts.join(' ');
  }

  /**
   * Match a field context to a semantic type
   */
  matchField(context: string): string | null {
    let bestMatch: { type: string; priority: number } | null = null;
    
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(context)) {
          if (!bestMatch || pattern.priority > bestMatch.priority) {
            bestMatch = { type: pattern.type, priority: pattern.priority };
          }
        }
      }
    }
    
    return bestMatch?.type || null;
  }

  /**
   * Find all fillable fields on the page
   */
  findAllFields(): FormField[] {
    const fields: FormField[] = [];
    const selectors = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select';
    const elements = document.querySelectorAll(selectors);
    
    elements.forEach((element) => {
      const el = element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      // Skip if disabled or readonly
      if (el.disabled) return;
      if ('readOnly' in el && el.readOnly) return;
      
      const context = this.getFieldContext(el);
      const type = this.matchField(context);
      
      // Generate stable selector
      const selector = this.generateSelector(el);
      
      fields.push({
        element: el,
        selector,
        type: type || 'unknown',
        context,
        value: el.value || '',
        fieldType: el.tagName.toLowerCase() as 'input' | 'textarea' | 'select',
        inputType: el instanceof HTMLInputElement ? el.type : undefined,
      });
    });
    
    return fields;
  }

  /**
   * Generate a stable CSS selector for an element
   */
  private generateSelector(element: HTMLElement): string {
    // Prefer ID
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Use name attribute
    if (element instanceof HTMLInputElement && element.name) {
      return `input[name="${element.name}"]`;
    }
    
    if (element instanceof HTMLTextAreaElement && element.getAttribute('name')) {
      return `textarea[name="${element.getAttribute('name')}"]`;
    }
    
    if (element instanceof HTMLSelectElement && element.name) {
      return `select[name="${element.name}"]`;
    }
    
    // Fallback to nth-of-type
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(el => el.tagName === element.tagName);
      const index = siblings.indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-of-type(${index})`;
    }
    
    return element.tagName.toLowerCase();
  }
}
