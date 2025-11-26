import { Page } from 'playwright';
import { PersonalData } from '../types/profile';

export interface FieldMatch {
  selector: string;
  label: string;
  type: 'input' | 'select' | 'textarea';
  inputType?: string;
  matchedKey: string;
  value: string;
  confidence: number; // 0-100
}

interface FieldPattern {
  type: string;
  patterns: RegExp[];
  priority: number;
}

export class SmartMatcher {
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
   * Analyze page and match all fields to personal data
   */
  async matchAllFields(page: Page, personalData: PersonalData): Promise<FieldMatch[]> {
    console.log('🔍 SmartMatcher: Analyzing page fields...');
    
    const matches: FieldMatch[] = [];
    
    // Find all fillable fields
    const fields = await page.$$('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    
    console.log(`📋 Found ${fields.length} fields to analyze`);
    
    for (const field of fields) {
      try {
        // Extract field context
        const context = await this.getFieldContext(page, field);
        const selector = await this.generateSelector(page, field);
        const tagName = await field.evaluate(el => el.tagName.toLowerCase());
        const inputType = await field.evaluate(el => 
          el.tagName.toLowerCase() === 'input' ? (el as HTMLInputElement).type : undefined
        );
        
        // Skip file inputs
        if (inputType === 'file') {
          console.log(`  ⏭️  Skipping file input: ${context}`);
          continue;
        }
        
        // Match field to personal data
        const match = this.matchFieldToData(context, personalData);
        
        if (match) {
          matches.push({
            selector,
            label: context,
            type: tagName as 'input' | 'select' | 'textarea',
            inputType,
            matchedKey: match.key,
            value: match.value,
            confidence: match.confidence
          });
          
          console.log(`  ✓ Matched: "${context}" → ${match.key} = "${match.value}" (${match.confidence}%)`);
        } else {
          console.log(`  ✗ No match: "${context}"`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error analyzing field:`, error);
      }
    }
    
    console.log(`\n✅ Matched ${matches.length}/${fields.length} fields`);
    return matches;
  }

  /**
   * Extract context from a field (label, placeholder, name, id, aria-label)
   */
  private async getFieldContext(page: Page, field: any): Promise<string> {
    return await field.evaluate((el: HTMLElement) => {
      const contexts: string[] = [];
      
      // Get label by 'for' attribute
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label?.textContent) contexts.push(label.textContent.trim());
      }
      
      // Get aria-label
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) contexts.push(ariaLabel);
      
      // Get placeholder
      if ('placeholder' in el && (el as HTMLInputElement).placeholder) {
        contexts.push((el as HTMLInputElement).placeholder);
      }
      
      // Get name attribute
      const name = el.getAttribute('name');
      if (name) contexts.push(name);
      
      // Get id attribute
      if (el.id) contexts.push(el.id);
      
      // Get parent label
      const parentLabel = el.closest('label');
      if (parentLabel?.textContent) {
        const labelText = parentLabel.textContent
          .replace((el as HTMLInputElement).value || '', '')
          .trim();
        if (labelText) contexts.push(labelText);
      }
      
      // Get preceding text (common pattern)
      const prevSibling = el.previousElementSibling;
      if (prevSibling?.textContent) {
        contexts.push(prevSibling.textContent.trim());
      }
      
      return contexts.join(' ');
    });
  }

  /**
   * Generate a stable selector for a field
   */
  private async generateSelector(page: Page, field: any): Promise<string> {
    return await field.evaluate((el: HTMLElement) => {
      // Prefer ID
      if (el.id) return `#${el.id}`;
      
      // Use name attribute
      const name = el.getAttribute('name');
      if (name) {
        const tagName = el.tagName.toLowerCase();
        return `${tagName}[name="${name}"]`;
      }
      
      // Use data-testid or data-qa
      const testId = el.getAttribute('data-testid') || el.getAttribute('data-qa');
      if (testId) {
        return `[data-testid="${testId}"]`;
      }
      
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
    });
  }

  /**
   * Match field context to personal data
   * Priority: customAnswers > siteSpecific > standard fields > field mappings > fuzzy
   */
  private matchFieldToData(context: string, personalData: PersonalData): { key: string; value: string; confidence: number } | null {
    if (!context) return null;
    
    const lowerContext = context.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    // 1. PRIORITY: Custom Answers (exact + fuzzy)
    if (personalData.customAnswers) {
      // Try exact key match
      for (const [key, value] of Object.entries(personalData.customAnswers)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedContext = lowerContext.replace(/\s+/g, '');
        
        if (normalizedContext.includes(normalizedKey) || normalizedKey.includes(normalizedContext)) {
          return { key: `customAnswers.${key}`, value: String(value), confidence: 95 };
        }
      }
      
      // Try fuzzy word matching
      const contextWords = lowerContext.split(/\s+/).filter(w => w.length > 2);
      for (const [key, value] of Object.entries(personalData.customAnswers)) {
        const keyWords = key.toLowerCase()
          .replace(/([A-Z])/g, ' $1')
          .split(/\s+/)
          .filter(w => w.length > 2);
        
        const matchCount = keyWords.filter(kw => 
          contextWords.some(cw => cw.includes(kw) || kw.includes(cw))
        ).length;
        
        if (matchCount >= Math.max(1, Math.ceil(keyWords.length * 0.6))) {
          return { key: `customAnswers.${key}`, value: String(value), confidence: 85 };
        }
      }
    }
    
    // 2. Site-Specific Answers
    // (Would need hostname passed in - skip for now)
    
    // 3. Standard Fields (pattern matching)
    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(context)) {
          const value = this.getStandardFieldValue(pattern.type, personalData);
          if (value !== null && value !== undefined && value !== '') {
            return { key: pattern.type, value: String(value), confidence: pattern.priority * 10 };
          }
        }
      }
    }
    
    // 4. Field Mappings (from field-mappings.json)
    if (personalData.fieldMappings) {
      for (const [key, mapping] of Object.entries(personalData.fieldMappings)) {
        if (mapping && typeof mapping === 'object' && 'patterns' in mapping && 'value' in mapping) {
          for (const pattern of mapping.patterns) {
            if (lowerContext.includes(pattern.toLowerCase())) {
              return { key: `fieldMappings.${key}`, value: mapping.value, confidence: 80 };
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Get value from standard personal data fields
   */
  private getStandardFieldValue(fieldType: string, personalData: PersonalData): any {
    const data: any = personalData;
    return data[fieldType];
  }
}
