/**
 * Shared type definitions for MagicFill
 */

// Personal Data Structure
export interface PersonalData {
  version: string;
  lastUpdated: string;
  
  basic: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  professional?: {
    yearsExperience: number;
    currentTitle?: string;
    currentCompany?: string;
    desiredSalary?: string;
    noticePeriod?: string;
    startDate?: string;
  };
  
  preferences?: {
    requiresSponsorship: boolean;
    willingToRelocate: boolean;
    remotePreference?: string;
    travelWillingness?: string;
  };
  
  customAnswers?: Record<string, string>;
  
  siteSpecific?: Record<string, Record<string, string>>;
  
  metadata?: {
    totalAnswers: number;
    sitesConfigured: number;
    lastUsed: string;
  };
}

// Form Field Types
export type SemanticFieldType =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'address'
  | 'address2'
  | 'city'
  | 'state'
  | 'zipCode'
  | 'country'
  | 'linkedin'
  | 'github'
  | 'portfolio'
  | 'yearsExperience'
  | 'currentTitle'
  | 'currentCompany'
  | 'desiredSalary'
  | 'noticePeriod'
  | 'startDate'
  | 'requiresSponsorship'
  | 'willingToRelocate'
  | 'remotePreference'
  | 'coverLetter';

export interface FormField {
  semanticType: SemanticFieldType | string;
  selector: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date';
  foundBy: 'pattern' | 'playwright';
  lastFilled?: string;
}

export interface FormConfig {
  urlPattern: string;
  siteName: string;
  learnedAt: string;
  lastUpdated: string;
  scanIterations: number;
  fillRate: number;
  fields: FormField[];
  multiPage: boolean;
}

// Unrecognized Field
export interface UnrecognizedField {
  selector: string;
  label: string;
  type: string;
  placeholder?: string;
  value?: string;
}

// Fill Result
export interface FillResult {
  filled: number;
  total: number;
  unfilledFields: UnrecognizedField[];
}

// Extension Messages
export interface FillFormMessage {
  action: 'fill-form';
}

export interface GetUnrecognizedFieldsMessage {
  action: 'get-unrecognized-fields';
}

export interface FillFieldMessage {
  action: 'fill-field';
  key: string;
  value: string;
}

export interface FillKnownFieldsMessage {
  action: 'fill-known-fields';
}

export type ExtensionMessage =
  | FillFormMessage
  | GetUnrecognizedFieldsMessage
  | FillFieldMessage
  | FillKnownFieldsMessage;

// New Answer
export interface NewAnswer {
  key: string;
  value: string;
  question: string;
  reusable: boolean;
  siteSpecific?: string;
}
