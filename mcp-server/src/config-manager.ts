import * as fs from 'fs';
import * as path from 'path';
import { ScannedField } from './scanner';

export interface FormConfig {
  urlPattern: string;
  siteName: string;
  learnedAt: string;
  lastUpdated: string;
  scanIterations: number;
  fillRate: number;
  fields: ScannedField[];
}

const CONFIGS_DIR = path.join(__dirname, '../../shared/configs');

/**
 * Update or create a form configuration
 */
export async function updateConfig(url: string, fields: ScannedField[]): Promise<FormConfig> {
  // Ensure configs directory exists
  if (!fs.existsSync(CONFIGS_DIR)) {
    fs.mkdirSync(CONFIGS_DIR, { recursive: true });
  }
  
  // Generate config filename from URL
  const hostname = new URL(url).hostname;
  const configPath = path.join(CONFIGS_DIR, `${hostname}.json`);
  
  // Load existing config or create new one
  let config: FormConfig;
  
  if (fs.existsSync(configPath)) {
    const existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config = {
      ...existing,
      lastUpdated: new Date().toISOString(),
      scanIterations: existing.scanIterations + 1,
      fields: mergeFields(existing.fields, fields),
    };
  } else {
    config = {
      urlPattern: hostname,
      siteName: hostname,
      learnedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      scanIterations: 1,
      fillRate: 0,
      fields,
    };
  }
  
  // Calculate fill rate (fields with known types / total fields)
  const knownFields = config.fields.filter(f => f.type !== 'unknown').length;
  config.fillRate = config.fields.length > 0 
    ? Math.round((knownFields / config.fields.length) * 100) 
    : 0;
  
  // Save config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(`💾 Saved config: ${configPath}`);
  console.log(`📊 Fill rate: ${config.fillRate}% (${knownFields}/${config.fields.length})`);
  
  return config;
}

/**
 * Merge existing fields with new fields
 */
function mergeFields(existing: ScannedField[], newFields: ScannedField[]): ScannedField[] {
  const merged = [...existing];
  
  for (const newField of newFields) {
    // Check if field already exists (by selector)
    const existingIndex = merged.findIndex(f => f.selector === newField.selector);
    
    if (existingIndex >= 0) {
      // Update existing field (keep type if already known)
      merged[existingIndex] = {
        ...newField,
        type: merged[existingIndex].type !== 'unknown' 
          ? merged[existingIndex].type 
          : newField.type,
      };
    } else {
      // Add new field
      merged.push(newField);
    }
  }
  
  return merged;
}

/**
 * Load a config for a URL
 */
export async function loadConfig(url: string): Promise<FormConfig | null> {
  const hostname = new URL(url).hostname;
  const configPath = path.join(CONFIGS_DIR, `${hostname}.json`);
  
  if (!fs.existsSync(configPath)) {
    return null;
  }
  
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

/**
 * List all configs
 */
export async function listConfigs(): Promise<FormConfig[]> {
  if (!fs.existsSync(CONFIGS_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));
  
  return files.map(file => {
    const content = fs.readFileSync(path.join(CONFIGS_DIR, file), 'utf-8');
    return JSON.parse(content);
  });
}
