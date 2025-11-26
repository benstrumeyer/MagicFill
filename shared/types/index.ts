/**
 * MagicFill ✨ - Shared Type Definitions
 */

// ============================================================================
// Personal Data Types
// ============================================================================

export interface PersonalData {
  basic: BasicInfo;
  address: Address;
  professional: ProfessionalInfo;
  preferences: Preferences;
  customAnswers: Record<string, string>;
  siteSpecific: Record<string, Record<string, string>>;
  metadata: Metadata;
}

export interface BasicInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ProfessionalInfo {
  yearsExperience: number;
  currentTitle?: string;
  currentCompany?: string;
  desiredSalary?: string;
  noticePeriod?: string;
  startDate?: string;
}

export interface Preferences {
  requiresSponsorship: boolean;
  willingToRelocate: boolean;
  remotePreference?: string;
  travelWillingness?: string;
}

export interface Metadata {
  totalAnswers: number;
  sitesConfigured: number;
  formsFilledToday: number;
  formsFilledTotal: number;
  lastUsed: string;
  lastBackup?: string;
  createdAt: string;
}

// ============================================================================
// Form Field Types
// ============================================================================

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
  | 'coverLetter'
  | 'resume';

export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'url' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';

export interface FormField {
  semanticType: SemanticFieldType | string;
  selector: string;
  type: FieldType;
  foundBy: 'pattern' | 'playwright';
  lastFilled?: string;
  lastUpdated?: string;
}

export interface DetectedField {
  element: HTMLElement;
  selector: string;
  type: FieldType;
  semanticType: SemanticFieldType | string | null;
  context: string;
  name?: string;
  id?: string;
}

export interface UnrecognizedField {
  selector: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  value?: string;
}

// ============================================================================
// Form Configuration Types
// ============================================================================

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

// ============================================================================
// Extension Message Types
// ============================================================================

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

export interface LearnFormMessage {
  action: 'learn-form';
  url: string;
  formData: DetectedField[];
}

export type ExtensionMessage =
  | FillFormMessage
  | GetUnrecognizedFieldsMessage
  | FillFieldMessage
  | LearnFormMessage;

// ============================================================================
// Result Types
// ============================================================================

export interface FillResult {
  filled: number;
  total: number;
  unfilledFields: UnrecognizedField[];
}

export interface ScanResult {
  fields: FormField[];
  success: boolean;
  error?: string;
}

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  PERSONAL_DATA: 'personalData',
  FORM_CONFIGS: 'formConfigs',
  SETTINGS: 'settings',
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_PERSONAL_DATA: PersonalData = {
  basic: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  },
  professional: {
    yearsExperience: 0,
  },
  preferences: {
    requiresSponsorship: false,
    willingToRelocate: false,
  },
  customAnswers: {},
  siteSpecific: {},
  metadata: {
    totalAnswers: 0,
    sitesConfigured: 0,
    formsFilledToday: 0,
    formsFilledTotal: 0,
    lastUsed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
};
