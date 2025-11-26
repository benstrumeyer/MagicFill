import { chromium, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

interface FileUploadConfig {
  resumePath?: string;
  coverLetterPath?: string;
  transcriptPath?: string;
  portfolioPath?: string;
}

/**
 * Upload files to the current page's file inputs
 */
export async function uploadFiles(page: Page, config: FileUploadConfig): Promise<void> {
  console.log('🔍 Looking for file upload fields...');
  
  // Find all file input elements
  const fileInputs = await page.locator('input[type="file"]').all();
  
  if (fileInputs.length === 0) {
    console.log('ℹ️  No file upload fields found on this page');
    return;
  }
  
  console.log(`📎 Found ${fileInputs.length} file upload field(s)`);
  
  for (const input of fileInputs) {
    try {
      // Get context about the field
      const label = await getFieldLabel(page, input);
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      
      const context = [label, placeholder, name, id].filter(Boolean).join(' ').toLowerCase();
      
      console.log(`\n📋 Field context: ${context}`);
      
      // Determine which file to upload
      let filePath: string | undefined;
      
      if (/resume|cv/i.test(context)) {
        filePath = config.resumePath;
        console.log('  → Detected: Resume field');
      } else if (/cover.*letter/i.test(context)) {
        filePath = config.coverLetterPath;
        console.log('  → Detected: Cover Letter field');
      } else if (/transcript/i.test(context)) {
        filePath = config.transcriptPath;
        console.log('  → Detected: Transcript field');
      } else if (/portfolio|sample|work/i.test(context)) {
        filePath = config.portfolioPath;
        console.log('  → Detected: Portfolio field');
      } else {
        // Default to resume if unclear
        filePath = config.resumePath;
        console.log('  → Unknown field type, using resume');
      }
      
      if (!filePath) {
        console.log('  ⚠️  No file path configured for this field type');
        continue;
      }
      
      // Verify file exists
      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ File not found: ${filePath}`);
        continue;
      }
      
      // Upload the file
      await input.setInputFiles(filePath);
      console.log(`  ✅ Uploaded: ${path.basename(filePath)}`);
      
      // Wait a bit for any upload processing
      await page.waitForTimeout(500);
      
    } catch (error) {
      console.error(`  ❌ Error uploading file:`, error);
    }
  }
  
  console.log('\n✨ File upload complete!');
}

/**
 * Get the label text for a file input
 */
async function getFieldLabel(page: Page, input: any): Promise<string> {
  try {
    // Try to find label by 'for' attribute
    const id = await input.getAttribute('id');
    if (id) {
      const label = await page.locator(`label[for="${id}"]`).textContent();
      if (label) return label.trim();
    }
    
    // Try to find parent label
    const parentLabel = await input.locator('xpath=ancestor::label[1]').textContent();
    if (parentLabel) return parentLabel.trim();
    
    // Try aria-label
    const ariaLabel = await input.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
  } catch (error) {
    // Ignore errors, just return empty string
  }
  
  return '';
}

/**
 * Connect to existing Chrome instance and upload files
 */
export async function connectAndUpload(config: FileUploadConfig): Promise<void> {
  console.log('🚀 Connecting to Chrome...');
  
  try {
    // Connect to Chrome DevTools Protocol
    // Chrome must be launched with: --remote-debugging-port=9222
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    
    // Get the active page
    const contexts = browser.contexts();
    if (contexts.length === 0) {
      throw new Error('No browser contexts found');
    }
    
    const pages = contexts[0].pages();
    if (pages.length === 0) {
      throw new Error('No pages found');
    }
    
    // Use the active page (last one)
    const page = pages[pages.length - 1];
    
    console.log(`📄 Connected to: ${page.url()}`);
    
    // Upload files
    await uploadFiles(page, config);
    
    // Don't close the browser - we're just connecting to it
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 Make sure Chrome is running with: --remote-debugging-port=9222');
    console.log('   Or use the helper script: npm run chrome-debug');
    throw error;
  }
}

// CLI usage
if (require.main === module) {
  const config: FileUploadConfig = {
    resumePath: process.env.RESUME_PATH || './documents/resume.pdf',
    coverLetterPath: process.env.COVER_LETTER_PATH || './documents/cover-letter.pdf',
    transcriptPath: process.env.TRANSCRIPT_PATH,
    portfolioPath: process.env.PORTFOLIO_PATH,
  };
  
  connectAndUpload(config)
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error.message);
      process.exit(1);
    });
}
