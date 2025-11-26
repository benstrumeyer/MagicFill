import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium, Browser } from 'playwright';
import { ProfileGenerator } from './ProfileGenerator';
import { AnalysisRequest, AnalysisResponse } from './types/profile';
import { SmartMatcher } from './analyzers/SmartMatcher';
import { ProfileCache } from './ProfileCache';
import { DropdownFiller } from './fillers/DropdownFiller';
import { LEARNING_SCRIPT } from './scripts/learning-script';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HEADLESS = process.env.HEADLESS === 'true';
const TIMEOUT = parseInt(process.env.TIMEOUT || '180000'); // 3 minutes for complex pages

// Middleware
app.use(cors());
app.use(express.json());

// Global browser instance (reuse for performance)
let browser: Browser | null = null;

// Initialize profile cache
const profileCache = new ProfileCache();

// Initialize browser
async function initBrowser() {
  if (!browser) {
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ headless: HEADLESS });
    console.log('✓ Browser ready');
  }
  return browser;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    browserReady: !!browser
  });
});

// Analyze endpoint
app.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  const { url, waitForSelector, timeout = TIMEOUT }: AnalysisRequest = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required'
    } as AnalysisResponse);
  }
  
  console.log(`\n📥 Analysis request received: ${url}`);
  
  try {
    // Ensure browser is ready
    const browserInstance = await initBrowser();
    
    // Create new page
    const page = await browserInstance.newPage();
    page.setDefaultTimeout(timeout);
    
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait for specific selector if provided
    if (waitForSelector) {
      console.log(`⏳ Waiting for selector: ${waitForSelector}`);
      await page.waitForSelector(waitForSelector, { timeout: 5000 });
    }
    
    // Generate profile
    const generator = new ProfileGenerator();
    const profile = await generator.generate(page, url);
    
    // Close page
    await page.close();
    
    const duration = Date.now() - startTime;
    
    res.json({
      success: true,
      profile,
      duration
    } as AnalysisResponse);
    
  } catch (error: any) {
    console.error('❌ Analysis failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    } as AnalysisResponse);
  }
});

// Learn form endpoint - opens browser and learns as user fills
app.post('/learn-form', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required'
    });
  }
  
  console.log(`\n🎓 Learning mode request: ${url}`);
  
  try {
    // Launch visible browser
    console.log('🚀 Launching browser in learning mode...');
    const learnBrowser = await chromium.launch({ 
      headless: false,
      slowMo: 50
    });
    
    const context = await learnBrowser.newContext();
    const page = await context.newPage();
    
    // Storage for learned fields
    const learnedFields: any[] = [];
    
    // Expose function for page to call
    await page.exposeFunction('captureField', (fieldData: any) => {
      learnedFields.push(fieldData);
      console.log(`  ✓ Learned: ${fieldData.label} = ${fieldData.value}`);
    });
    
    // Navigate to URL
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Inject learning script
    console.log('💉 Injecting learning script...');
    await page.addScriptTag({ content: LEARNING_SCRIPT });
    
    console.log('✅ Learning mode active!');
    console.log('👉 Fill out the form in the browser');
    console.log('👉 Close the browser when done to save profile\n');
    
    // Wait for browser to close
    page.on('close', async () => {
      console.log(`\n📊 Browser closed. Learned ${learnedFields.length} fields.`);
      
      if (learnedFields.length > 0) {
        // Save profile
        profileCache.saveProfile(url, 'learned', learnedFields);
        console.log(`💾 Profile saved for future use!`);
      } else {
        console.log('⚠️  No fields learned (form not filled?)');
      }
    });
    
    // Send immediate response
    res.json({
      success: true,
      message: 'Learning mode active. Fill the form and close browser when done.',
      url
    });
    
  } catch (error: any) {
    console.error('❌ Learning mode failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auto-fill endpoint - intelligent filling with caching
app.post('/auto-fill', async (req, res) => {
  const startTime = Date.now();
  const { url, personalData, useCache = true } = req.body;
  
  if (!url || !personalData) {
    return res.status(400).json({
      success: false,
      error: 'URL and personalData are required'
    });
  }
  
  console.log(`\n🚀 Auto-fill request received: ${url}`);
  console.log(`📦 Cache enabled: ${useCache}`);
  
  try {
    // Check cache first
    let profile = null;
    let fromCache = false;
    
    if (useCache) {
      profile = profileCache.getProfile(url);
      if (profile) {
        fromCache = true;
        console.log(`✓ Using cached profile (${profile.fields.length} fields)`);
      }
    }
    
    // Launch visible browser
    console.log('🚀 Launching visible browser...');
    const fillBrowser = await chromium.launch({ 
      headless: false,
      slowMo: 50
    });
    
    const context = await fillBrowser.newContext();
    const page = await context.newPage();
    
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for dynamic content
    
    let filled = 0;
    let total = 0;
    
    if (!profile) {
      // No cache - analyze and match fields
      console.log('🔍 No cache found - analyzing page...');
      
      const matcher = new SmartMatcher();
      const matches = await matcher.matchAllFields(page, personalData);
      
      total = matches.length;
      console.log(`\n📝 Filling ${total} matched fields...`);
      
      // Fill all matched fields
      const dropdownFiller = new DropdownFiller();
      
      for (const match of matches) {
        try {
          await page.locator(match.selector).scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          
          if (match.type === 'select') {
            // Use dropdown filler
            const success = await dropdownFiller.fill(page, match.selector, match.value);
            if (success) filled++;
          } else {
            // Regular input/textarea
            await page.click(match.selector);
            await page.waitForTimeout(300);
            await page.fill(match.selector, match.value);
            await page.waitForTimeout(200);
            filled++;
            console.log(`  ✓ Filled: ${match.label} = ${match.value}`);
          }
        } catch (error: any) {
          console.log(`  ✗ Failed to fill: ${match.label} - ${error.message}`);
        }
      }
      
      // Save profile to cache
      profileCache.saveProfile(url, 'auto-detected', matches);
      console.log(`\n💾 Profile saved to cache`);
      
    } else {
      // Use cached profile
      console.log('📋 Using cached profile to fill fields...');
      
      const dropdownFiller = new DropdownFiller();
      total = profile.fields.length;
      
      for (const field of profile.fields) {
        try {
          await page.locator(field.selector).scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          
          if (field.type === 'select') {
            const success = await dropdownFiller.fill(page, field.selector, field.value);
            if (success) filled++;
          } else {
            await page.click(field.selector);
            await page.waitForTimeout(300);
            await page.fill(field.selector, field.value);
            await page.waitForTimeout(200);
            filled++;
            console.log(`  ✓ Filled: ${field.label} = ${field.value}`);
          }
        } catch (error: any) {
          console.log(`  ✗ Failed to fill: ${field.label} - ${error.message}`);
        }
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`\n✅ Auto-fill complete: ${filled}/${total} fields (${duration}ms)`);
    console.log('👀 Browser left open for review');
    
    res.json({
      success: true,
      filled,
      total,
      fromCache,
      duration,
      message: `Filled ${filled}/${total} fields${fromCache ? ' (from cache)' : ''}`
    });
    
  } catch (error: any) {
    console.error('❌ Auto-fill failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    });
  }
});

// Fill form endpoint - opens browser and fills everything
app.post('/fill-form', async (req, res) => {
  const { url, personalData } = req.body;
  
  if (!url || !personalData) {
    return res.status(400).json({
      success: false,
      error: 'URL and personalData are required'
    });
  }
  
  console.log(`\n📝 Fill form request received: ${url}`);
  console.log('📥 Personal data received:');
  console.log('  - Custom answers:', Object.keys(personalData.customAnswers || {}).length);
  console.log('  - First few keys:', Object.keys(personalData.customAnswers || {}).slice(0, 5));
  
  try {
    // Launch a NEW browser instance (not headless, so user can see it)
    console.log('🚀 Launching visible browser for form filling...');
    const fillBrowser = await chromium.launch({ 
      headless: false,  // Always visible for review
      slowMo: 100  // Slow down actions so user can see what's happening
    });
    
    const context = await fillBrowser.newContext();
    const page = await context.newPage();
    
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    console.log('🔍 Finding and filling fields...');
    let filled = 0;
    
    // Fill text inputs
    const textFields = await page.$$('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input:not([type]), textarea');
    
    for (const field of textFields) {
      try {
        const label = await field.evaluate((el: any) => {
          const labels = Array.from(document.querySelectorAll('label'));
          for (const label of labels) {
            if (label.htmlFor === el.id || label.contains(el)) {
              return label.textContent?.trim();
            }
          }
          return el.placeholder || el.name || el.id;
        });
        
        // Match label to personal data
        const value = matchLabelToValue(label || '', personalData);
        
        if (value) {
          await field.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200); // Wait for scroll
          await field.click();
          await page.waitForTimeout(300); // Wait for click handlers
          await field.fill(value);
          await page.waitForTimeout(200); // Wait for value to be processed
          filled++;
          console.log(`  ✓ Filled: ${label} = ${value}`);
        }
      } catch (error) {
        // Skip fields that can't be filled
      }
    }
    
    // Fill select dropdowns
    const selects = await page.$$('select');
    
    for (const select of selects) {
      let selectLabel = '';
      try {
        selectLabel = await select.evaluate((el: any) => {
          const labels = Array.from(document.querySelectorAll('label'));
          for (const label of labels) {
            if (label.htmlFor === el.id || label.contains(el)) {
              return label.textContent?.trim();
            }
          }
          return el.name || el.id;
        });
        
        const value = matchLabelToValue(selectLabel || '', personalData);
        
        if (value) {
          await select.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200); // Wait for scroll
          await select.click(); // Click to open dropdown
          await page.waitForTimeout(500); // Wait for dropdown to open
          
          // Try multiple selection methods
          try {
            await select.selectOption({ label: value });
          } catch {
            try {
              await select.selectOption({ value });
            } catch {
              // Try partial match
              const options = await select.$$('option');
              for (const option of options) {
                const optionText = await option.textContent();
                if (optionText?.toLowerCase().includes(value.toLowerCase())) {
                  await option.click();
                  break;
                }
              }
            }
          }
          
          await page.waitForTimeout(300); // Wait for selection to process
          filled++;
          console.log(`  ✓ Selected: ${selectLabel} = ${value}`);
        }
      } catch (error) {
        console.log(`  ✗ Failed to select: ${selectLabel}`);
      }
    }
    
    console.log(`\n✅ Filled ${filled} fields`);
    console.log('👀 Browser left open for review - close it when done');
    
    // DON'T close the browser - leave it open for user review
    // The browser will close when user closes the window
    
    res.json({
      success: true,
      filled,
      message: 'Form filled successfully. Browser left open for review.'
    });
    
  } catch (error: any) {
    console.error('❌ Fill form failed:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to match labels to personal data values
function matchLabelToValue(label: string, personalData: any): string | null {
  if (!label) return null;
  
  const lowerLabel = label.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  // Check custom answers first (PRIORITY)
  if (personalData.customAnswers) {
    // Try exact key match first
    for (const [key, value] of Object.entries(personalData.customAnswers)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedLabel = lowerLabel.replace(/\s+/g, '');
      
      if (normalizedLabel.includes(normalizedKey) || normalizedKey.includes(normalizedLabel)) {
        console.log(`  ✓ Matched "${label}" to custom answer "${key}"`);
        return value as string;
      }
    }
    
    // Try fuzzy word matching
    const labelWords = lowerLabel.split(/\s+/).filter(w => w.length > 2);
    for (const [key, value] of Object.entries(personalData.customAnswers)) {
      const keyWords = key.toLowerCase()
        .replace(/([A-Z])/g, ' $1')
        .split(/\s+/)
        .filter(w => w.length > 2);
      
      const matchCount = keyWords.filter(kw => 
        labelWords.some(lw => lw.includes(kw) || kw.includes(lw))
      ).length;
      
      if (matchCount >= Math.max(1, Math.ceil(keyWords.length * 0.6))) {
        console.log(`  ✓ Fuzzy matched "${label}" to custom answer "${key}"`);
        return value as string;
      }
    }
  }
  
  // Standard field matching (FALLBACK)
  if (lowerLabel.includes('first') && lowerLabel.includes('name')) return personalData.firstName;
  if (lowerLabel.includes('last') && lowerLabel.includes('name')) return personalData.lastName;
  if (lowerLabel.includes('email')) return personalData.email;
  if (lowerLabel.includes('phone')) return personalData.phone;
  if (lowerLabel.includes('address') && !lowerLabel.includes('2')) return personalData.address;
  if (lowerLabel.includes('city')) return personalData.city;
  if (lowerLabel.includes('state')) return personalData.state;
  if (lowerLabel.includes('zip')) return personalData.zipCode;
  if (lowerLabel.includes('country')) return personalData.country;
  if (lowerLabel.includes('linkedin')) return personalData.linkedin;
  if (lowerLabel.includes('github')) return personalData.github;
  if (lowerLabel.includes('portfolio')) return personalData.portfolio;
  
  return null;
}

// Shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎯 MagicFill Playwright Server`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Headless mode: ${HEADLESS}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health      - Health check`);
  console.log(`  POST /learn-form  - 🎓 Learn form (you fill, it learns)`);
  console.log(`  POST /auto-fill   - 🚀 Auto-fill using learned profile`);
  console.log(`  POST /analyze     - Analyze a URL`);
  console.log(`  POST /fill-form   - Fill form with Playwright (opens visible browser)`);
  console.log(`\nReady to learn and fill forms! 🚀\n`);
});
