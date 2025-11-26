import { SiteProfile } from '../../shared/types';

export interface AnalyzeResponse {
  success: boolean;
  profile?: SiteProfile;
  error?: string;
  duration?: number;
}

export interface FillFormResponse {
  success: boolean;
  filled?: number;
  message?: string;
  error?: string;
}

export class PlaywrightAPI {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Check if the Playwright server is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('Playwright server health check failed:', error);
      return false;
    }
  }
  
  /**
   * Analyze the current page URL
   */
  async analyzeCurrentPage(url: string): Promise<AnalyzeResponse> {
    console.log(`📡 Requesting analysis for: ${url}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(120000) // 2 minute timeout for complex pages
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data: AnalyzeResponse = await response.json();
      
      if (data.success && data.profile) {
        console.log(`✓ Analysis complete: ${data.profile.totalFields} fields found`);
      } else {
        console.error(`✗ Analysis failed: ${data.error}`);
      }
      
      return data;
      
    } catch (error: any) {
      console.error('Analysis request failed:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Fill form using Playwright (opens visible browser)
   */
  async fillForm(url: string, personalData: any): Promise<FillFormResponse> {
    console.log(`📡 Requesting form fill for: ${url}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/fill-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, personalData }),
        signal: AbortSignal.timeout(180000) // 3 minute timeout
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data: FillFormResponse = await response.json();
      
      if (data.success) {
        console.log(`✓ Form filled: ${data.filled} fields`);
      } else {
        console.error(`✗ Fill failed: ${data.error}`);
      }
      
      return data;
      
    } catch (error: any) {
      console.error('Fill form request failed:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }
}
