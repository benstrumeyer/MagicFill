import fs from 'fs';
import path from 'path';
import { FieldMatch } from './analyzers/SmartMatcher';

export interface SiteProfile {
  url: string;
  platform: string;
  fields: FieldMatch[];
  metadata: {
    createdAt: string;
    lastUsed: string;
    fillCount: number;
    successRate: number;
  };
}

export class ProfileCache {
  private cacheFile: string;
  private cache: Record<string, SiteProfile>;

  constructor(cacheDir: string = './cache') {
    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    this.cacheFile = path.join(cacheDir, 'profiles.json');
    this.cache = this.loadCache();
  }

  /**
   * Load cache from disk
   */
  private loadCache(): Record<string, SiteProfile> {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
    return {};
  }

  /**
   * Save cache to disk
   */
  private saveCache(): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    try {
      const urlObj = new URL(url);
      // Use hostname + pathname (without query params)
      return `${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  /**
   * Get profile for URL
   */
  getProfile(url: string): SiteProfile | null {
    const key = this.getCacheKey(url);
    const profile = this.cache[key];
    
    if (profile) {
      // Update last used
      profile.metadata.lastUsed = new Date().toISOString();
      this.saveCache();
      console.log(`📦 Profile cache HIT for: ${key}`);
    } else {
      console.log(`📦 Profile cache MISS for: ${key}`);
    }
    
    return profile || null;
  }

  /**
   * Save profile for URL
   */
  saveProfile(url: string, platform: string, fields: FieldMatch[]): void {
    const key = this.getCacheKey(url);
    
    const existingProfile = this.cache[key];
    
    this.cache[key] = {
      url,
      platform,
      fields,
      metadata: {
        createdAt: existingProfile?.metadata.createdAt || new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        fillCount: (existingProfile?.metadata.fillCount || 0) + 1,
        successRate: 100 // TODO: Track actual success rate
      }
    };
    
    this.saveCache();
    console.log(`💾 Profile saved for: ${key} (${fields.length} fields)`);
  }

  /**
   * Delete profile for URL
   */
  deleteProfile(url: string): boolean {
    const key = this.getCacheKey(url);
    
    if (this.cache[key]) {
      delete this.cache[key];
      this.saveCache();
      console.log(`🗑️  Profile deleted for: ${key}`);
      return true;
    }
    
    return false;
  }

  /**
   * List all profiles
   */
  listProfiles(): SiteProfile[] {
    return Object.values(this.cache);
  }

  /**
   * Clear all profiles
   */
  clearAll(): void {
    this.cache = {};
    this.saveCache();
    console.log('🗑️  All profiles cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const profiles = Object.values(this.cache);
    
    return {
      totalProfiles: profiles.length,
      totalFills: profiles.reduce((sum, p) => sum + p.metadata.fillCount, 0),
      avgFieldsPerProfile: profiles.length > 0 
        ? Math.round(profiles.reduce((sum, p) => sum + p.fields.length, 0) / profiles.length)
        : 0,
      platforms: [...new Set(profiles.map(p => p.platform))]
    };
  }
}
