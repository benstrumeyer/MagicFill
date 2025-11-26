import { SiteProfile } from '../../shared/types';

export interface ProfileCache {
  [platform: string]: SiteProfile;
}

export class ProfileManager {
  private storageKey = 'siteProfiles';
  
  /**
   * Save a profile for a platform
   */
  async saveProfile(platform: string, profile: SiteProfile): Promise<void> {
    console.log(`💾 Saving profile for platform: ${platform}`);
    
    const cache = await this.getAllProfiles();
    cache[platform] = profile;
    
    await chrome.storage.local.set({ [this.storageKey]: cache });
    console.log(`✓ Profile saved`);
  }
  
  /**
   * Get a profile for a platform
   */
  async getProfile(platform: string): Promise<SiteProfile | null> {
    const cache = await this.getAllProfiles();
    return cache[platform] || null;
  }
  
  /**
   * Get all cached profiles
   */
  async getAllProfiles(): Promise<ProfileCache> {
    const result = await chrome.storage.local.get(this.storageKey);
    return result[this.storageKey] || {};
  }
  
  /**
   * Delete a profile
   */
  async deleteProfile(platform: string): Promise<void> {
    console.log(`🗑️ Deleting profile for platform: ${platform}`);
    
    const cache = await this.getAllProfiles();
    delete cache[platform];
    
    await chrome.storage.local.set({ [this.storageKey]: cache });
    console.log(`✓ Profile deleted`);
  }
  
  /**
   * Clear all profiles
   */
  async clearAll(): Promise<void> {
    await chrome.storage.local.remove(this.storageKey);
    console.log(`✓ All profiles cleared`);
  }
  
  /**
   * Get profile age in days
   */
  getProfileAge(profile: SiteProfile): number {
    const now = new Date();
    const profileDate = new Date(profile.timestamp);
    const diffMs = now.getTime() - profileDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Check if profile is stale (older than 30 days)
   */
  isProfileStale(profile: SiteProfile): boolean {
    return this.getProfileAge(profile) > 30;
  }
}
