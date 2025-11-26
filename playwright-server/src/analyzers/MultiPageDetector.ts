import { Page } from 'playwright';
import { PageInfo } from '../types/profile';

export class MultiPageDetector {
  async detectPages(page: Page, fields: Record<string, any>): Promise<PageInfo[]> {
    console.log('🔍 Detecting multi-page form structure...');
    
    const pageInfo = await page.evaluate((fieldKeys) => {
      const pages: PageInfo[] = [];
      
      // Look for "Next" button
      const nextButtonSelectors = [
        'button:has-text("Next")',
        'button:has-text("Continue")',
        '[type="button"]:has-text("Next")',
        '.next-button',
        '#next-button'
      ];
      
      let nextButton: string | undefined;
      for (const selector of nextButtonSelectors) {
        try {
          const btn = document.querySelector(selector);
          if (btn) {
            nextButton = selector;
            break;
          }
        } catch (e) {
          // Invalid selector, continue
        }
      }
      
      // Look for "Submit" button
      const submitButtonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Apply")',
        'button:has-text("Send")'
      ];
      
      let submitButton: string | undefined;
      for (const selector of submitButtonSelectors) {
        try {
          const btn = document.querySelector(selector);
          if (btn) {
            submitButton = selector;
            break;
          }
        } catch (e) {
          // Invalid selector, continue
        }
      }
      
      // If we have a next button, this is likely multi-page
      if (nextButton) {
        pages.push({
          name: 'page_1',
          fields: fieldKeys,
          nextButton
        });
      } else if (submitButton) {
        // Single page form
        pages.push({
          name: 'page_1',
          fields: fieldKeys,
          submitButton
        });
      }
      
      return pages;
    }, Object.keys(fields));
    
    const hasMultiPage = pageInfo.length > 0 && !!pageInfo[0].nextButton;
    console.log(`✓ Form structure: ${hasMultiPage ? 'Multi-page' : 'Single-page'}`);
    
    return pageInfo;
  }
}
