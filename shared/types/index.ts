/**
 * MagicFill ✨ - Shared Type Definitions
 */

// ============================================================================
// Personal Data Types
// ============================================================================

export interface PersonalData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Address
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Professional
  currentCompany?: string;
  currentTitle?: string;
  yearsExperience?: number;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  
  // Education
  university?: string;
  degree?: string;
  major?: string;
  graduationYear?: number;
  
  // Work Authorization
  workAuthorization?: string;
  requiresSponsorship?: boolean;
  
  // Job Preferences
  salaryExpectation?: string;
  startDate?: string;
  noticePeriod?: string;
  referral?: string;
  howDidYouHear?: string;
  coverLetter?: string;
  additionalInfo?: string;
  
  // Custom Answers
  customAnswers?: Record<string, string>;
  siteSpecificAnswers?: Record<string, Record<string, string>>;
}

// ============================================================================
// Form Field Types
// ============================================================================

export interface FormField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  selector: string;
  type: string;
  context: string;
  value: string;
  fieldType: 'input' | 'textarea' | 'select';
  inputType?: string;
}

export interface UnrecognizedField {
  selector: string;
  context: string;
  type: string;
  fieldType: 'input' | 'textarea' | 'select';
  inputType?: string;
}

// ============================================================================
// Extension Message Types
// ============================================================================

export interface ExtensionMessage {
  action: 'fillForm' | 'getUnrecognizedFields' | 'fillField' | 'addAnswer';
  payload?: {
    selector?: string;
    value?: string;
    key?: string;
    siteSpecific?: boolean;
  };
}
