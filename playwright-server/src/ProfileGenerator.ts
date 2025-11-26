import { Page } from 'playwright';
import { FieldAnalyzer } from './analyzers/FieldAnalyzer';
import { MultiPageDetector } from './analyzers/MultiPageDetector';
import { PlatformDetector } from './PlatformDetector';
import { SiteProfile } from './types/profile';

export class ProfileGenerator {
  private fieldAnalyzer: FieldAnalyzer;
  private multiPageDetector: MultiPageDetector;
  private platformDetector: PlatformDetector;
  
  constructor() {
    this.fieldAnalyzer = new FieldAnalyzer();
    this.multiPageDetector = new MultiPageDetector();
    this.platformDetector = new PlatformDetector();
  }
  
  async generate(page: Page, url: string): Promise<SiteProfile> {
    console.log(`\n🎯 Generating profile for: ${url}`);
    const startTime = Date.now();
    
    // Detect platform
    const platform = this.platformDetector.detect(url);
    console.log(`📍 Platform detected: ${platform}`);
    
    // Analyze fields
    const fields = await this.fieldAnalyzer.analyzeFields(page);
    
    // Analyze custom dropdowns
    let customDropdownCount = 0;
    for (const [key, field] of Object.entries(fields)) {
      if (field.isCustomDropdown) {
        const dropdownInfo = await this.fieldAnalyzer.analyzeCustomDropdown(page, field.selector);
        fields[key] = { ...field, ...dropdownInfo };
        customDropdownCount++;
      }
    }
    
    // Detect multi-page structure
    const pages = await this.multiPageDetector.detectPages(page, fields);
    
    // Build profile
    const profile: SiteProfile = {
      platform,
      url,
      timestamp: new Date().toISOString(),
      fields,
      pages: pages.length > 0 ? pages : undefined,
      totalFields: Object.keys(fields).length,
      hasMultiPage: pages.length > 0 && !!pages[0].nextButton,
      customDropdownCount
    };
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Profile generated in ${duration}ms`);
    console.log(`   - Fields: ${profile.totalFields}`);
    console.log(`   - Custom dropdowns: ${profile.customDropdownCount}`);
    console.log(`   - Multi-page: ${profile.hasMultiPage ? 'Yes' : 'No'}`);
    
    return profile;
  }
}
