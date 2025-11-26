"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = updateConfig;
exports.loadConfig = loadConfig;
exports.listConfigs = listConfigs;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIGS_DIR = path.join(__dirname, '../../shared/configs');
/**
 * Update or create a form configuration
 */
async function updateConfig(url, fields) {
    // Ensure configs directory exists
    if (!fs.existsSync(CONFIGS_DIR)) {
        fs.mkdirSync(CONFIGS_DIR, { recursive: true });
    }
    // Generate config filename from URL
    const hostname = new URL(url).hostname;
    const configPath = path.join(CONFIGS_DIR, `${hostname}.json`);
    // Load existing config or create new one
    let config;
    if (fs.existsSync(configPath)) {
        const existing = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        config = {
            ...existing,
            lastUpdated: new Date().toISOString(),
            scanIterations: existing.scanIterations + 1,
            fields: mergeFields(existing.fields, fields),
        };
    }
    else {
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
function mergeFields(existing, newFields) {
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
        }
        else {
            // Add new field
            merged.push(newField);
        }
    }
    return merged;
}
/**
 * Load a config for a URL
 */
async function loadConfig(url) {
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
async function listConfigs() {
    if (!fs.existsSync(CONFIGS_DIR)) {
        return [];
    }
    const files = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));
    return files.map(file => {
        const content = fs.readFileSync(path.join(CONFIGS_DIR, file), 'utf-8');
        return JSON.parse(content);
    });
}
