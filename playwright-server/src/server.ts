import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium, Browser } from 'playwright';
import { ProfileGenerator } from './ProfileGenerator';
import { AnalysisRequest, AnalysisResponse } from './types/profile';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HEADLESS = process.env.HEADLESS === 'true';
const TIMEOUT = parseInt(process.env.TIMEOUT || '30000');

// Middleware
app.use(cors());
app.use(express.json());

// Global browser instance (reuse for performance)
let browser: Browser | null = null;

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
  console.log(`  GET  /health  - Health check`);
  console.log(`  POST /analyze - Analyze a URL`);
  console.log(`\nReady to analyze forms! 🚀\n`);
});
