/**
 * Sync Playwright learned profiles to extension's custom answers
 * This allows you to learn in Playwright, then use in regular Chrome
 */

import { FieldMatch } from '../analyzers/SmartMatcher';

export interface ExtensionCustomAnswers {
  [key: string]: string;
}

/**
 * Convert Playwright profile to extension custom answers format
 */
export function profileToCustomAnswers(fields: FieldMatch[]): ExtensionCustomAnswers {
  const customAnswers: ExtensionCustomAnswers = {};
  
  for (const field of fields) {
    // Use the label as the key (cleaned up)
    const key = cleanLabel(field.label);
    
    // Skip if already a standard field (firstName, email, etc.)
    if (isStandardField(field.matchedKey)) {
      continue;
    }
    
    // Add to custom answers
    customAnswers[key] = field.value;
  }
  
  return customAnswers;
}

/**
 * Clean label to make a good key
 */
function cleanLabel(label: string): string {
  return label
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, ' ') // Normalize spaces
    .slice(0, 100); // Limit length
}

/**
 * Check if this is a standard field (already in personal data)
 */
function isStandardField(matchedKey: string): boolean {
  const standardFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'address',
    'city',
    'state',
    'zipCode',
    'country',
    'linkedin',
    'github',
    'portfolio',
  ];
  
  return standardFields.includes(matchedKey);
}

/**
 * Generate export data for extension
 */
export function generateExtensionExport(fields: FieldMatch[]): string {
  const customAnswers = profileToCustomAnswers(fields);
  
  return JSON.stringify({
    customAnswers,
    _source: 'playwright-learning',
    _timestamp: new Date().toISOString(),
  }, null, 2);
}
