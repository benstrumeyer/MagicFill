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

export interface AnalysisRequest {
  url: string;
  waitForSelector?: string;
  timeout?: number;
}

export interface AnalysisResponse {
  success: boolean;
  profile?: SiteProfile;
  error?: string;
  duration?: number;
}
