import { Page, BrowserContext } from 'playwright';

/**
 * Enhanced stealth configuration for Playwright
 * Makes browser undetectable by anti-bot systems
 */
export async function applyStealthMode(page: Page) {
  // Override navigator properties
  await page.addInitScript(() => {
    // Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Override plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Override languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Add chrome object
    (window as any).chrome = {
      runtime: {},
      loadTimes: function() {},
      csi: function() {},
      app: {},
    };

    // Override permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters: any) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission } as PermissionStatus) :
        originalQuery(parameters)
    );

    // Mock battery API
    Object.defineProperty(navigator, 'getBattery', {
      value: () => Promise.resolve({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 1,
      }),
    });

    // Override connection
    Object.defineProperty(navigator, 'connection', {
      get: () => ({
        effectiveType: '4g',
        rtt: 50,
        downlink: 10,
        saveData: false,
      }),
    });
  });
}

/**
 * Dismiss common privacy/cookie overlays
 */
export async function dismissOverlays(page: Page): Promise<boolean> {
  console.log('🔍 Checking for overlays...');
  
  let dismissed = false;
  
  // Common overlay button selectors
  const overlaySelectors = [
    // Cookie consent
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Accept All")',
    'button:has-text("I Accept")',
    'button:has-text("I Agree")',
    'button:has-text("Agree")',
    'button:has-text("OK")',
    'button:has-text("Got it")',
    'button:has-text("Allow")',
    'button:has-text("Allow all")',
    'button:has-text("Continue")',
    '[id*="accept"]',
    '[class*="accept"]',
    '[id*="cookie"] button',
    '[class*="cookie"] button',
    '[id*="consent"] button',
    '[class*="consent"] button',
    
    // Privacy policy
    'button:has-text("Close")',
    '[aria-label="Close"]',
    '[aria-label="Dismiss"]',
    '.modal button:has-text("Close")',
    '.overlay button:has-text("Close")',
    
    // Specific platforms
    '[data-test="cookie-consent-accept"]',
    '[data-qa="cookie-consent-accept"]',
    '#onetrust-accept-btn-handler',
    '.optanon-allow-all-button',
  ];
  
  for (const selector of overlaySelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        const isVisible = await button.isVisible();
        if (isVisible) {
          console.log(`  ✓ Found overlay button: ${selector}`);
          await button.click();
          await page.waitForTimeout(1000);
          dismissed = true;
          console.log('  ✓ Dismissed overlay');
          break;
        }
      }
    } catch (error) {
      // Continue to next selector
    }
  }
  
  if (!dismissed) {
    console.log('  ℹ️  No overlays found');
  }
  
  return dismissed;
}

/**
 * Create stealth browser context
 */
export async function createStealthContext(browser: any): Promise<BrowserContext> {
  return await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { longitude: -74.0060, latitude: 40.7128 }, // New York
    permissions: ['geolocation'],
    colorScheme: 'light',
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    javaScriptEnabled: true,
    // Add extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1',
    },
  });
}

/**
 * Wait for page to be fully loaded and stable
 */
export async function waitForPageReady(page: Page) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded');
  
  // Additional wait for dynamic content
  await page.waitForTimeout(2000);
  
  // Dismiss any overlays
  await dismissOverlays(page);
}
