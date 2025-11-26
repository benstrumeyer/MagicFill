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
  
  // Document paths (for reference only)
  resumePath?: string;
  coverLetterPath?: string;
  
  // Custom Answers
  customAnswers?: Record<string, string>;
  siteSpecificAnswers?: Record<string, Record<string, string>>;
  
  // Field Mappings (rule-based)
  fieldMappings?: FieldMappings;
}

// ============================================================================
// Field Mapping Types
// ============================================================================

export interface FieldMapping {
  value: string;
  patterns: string[];
}

export interface FieldMappings {
  [key: string]: FieldMapping;
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
// Site Profile Types (Playwright Integration)
// ============================================================================

export interface FieldProfile {
  selector: string;
  type: string;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  
  // Custom dropdown info
  isCustomDropdown?: boolean;
  dropdownStrategy?: 'click-input' | 'click-button' | 'hover';
  optionsSelector?: string;
  options?: string[];
  
  // Hidden field relationships
  hasHiddenSelect?: boolean;
  hiddenSelectSelector?: string;
}

export interface PageInfo {
  name: string;
  fields: string[];
  nextButton?: string;
  submitButton?: string;
}

export interface SiteProfile {
  platform: string;
  url: string;
  timestamp: string;
  
  fields: Record<string, FieldProfile>;
  pages?: PageInfo[];
  
  // Metadata
  totalFields: number;
  hasMultiPage: boolean;
  customDropdownCount: number;
}

// ============================================================================
// Extension Message Types
// ============================================================================

export interface ExtensionMessage {
  action: 'fillForm' | 'getUnrecognizedFields' | 'fillField' | 'addAnswer' | 'learnForm' | 'analyzeAndFill';
  payload?: {
    selector?: string;
    value?: string;
    key?: string;
    siteSpecific?: boolean;
  };
}
