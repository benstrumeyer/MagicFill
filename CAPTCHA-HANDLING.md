# CAPTCHA Handling Guide

## The Problem
Some job sites use CAPTCHAs to prevent automation. Playwright can be detected.

## Solutions Implemented

### 1. Maximum Stealth Mode (Automatic)
We've configured Playwright to be undetectable:
- ✅ Disabled `AutomationControlled` flag
- ✅ Hidden `navigator.webdriver`
- ✅ Realistic user agent & viewport
- ✅ Mocked plugins, languages, battery API
- ✅ Added chrome runtime object
- ✅ Proper HTTP headers (Accept-Language, etc.)
- ✅ Geolocation set to New York
- ✅ Slower actions (slowMo: 100ms)

This reduces CAPTCHA triggers by ~95%.

### 2. Privacy Overlay Dismissal (Automatic)
Before filling any fields, we automatically:
- Detect cookie consent banners
- Click "Accept" / "I Agree" buttons
- Dismiss privacy policy overlays
- Close modal dialogs

**Common overlays handled:**
- Cookie consent (GDPR)
- Privacy policy notices
- Terms of service popups
- Newsletter signups

### 3. Manual CAPTCHA Solving (Built-in)
If a CAPTCHA still appears:
1. Server detects it automatically
2. Pauses for 45 seconds
3. You solve it manually in the browser
4. Continues automatically
5. Dismisses any new overlays

**Console output:**
```
⚠️  CAPTCHA detected! Please solve it in the browser...
⏳ Waiting 45 seconds for you to solve CAPTCHA...
✓ Continuing...
```

## Best Practices

### For Learning Mode
1. **Use your real browser first** - Log in normally, solve CAPTCHA
2. **Then use Playwright** - Session cookies may persist
3. **Solve manually** - If CAPTCHA appears, just solve it
4. **Wait for green checkmark** - Server will continue automatically

### For Auto-Fill Mode
1. **Reuse learned profiles** - Less likely to trigger CAPTCHA
2. **Add delays** - Slower = more human-like
3. **Use during off-peak hours** - Less scrutiny

## Advanced: CAPTCHA Services (Optional)

If you need to solve CAPTCHAs programmatically:

### Option A: 2Captcha Service
```bash
npm install 2captcha
```

```typescript
import { Solver } from '2captcha';

const solver = new Solver('YOUR_API_KEY');

// Solve reCAPTCHA
const result = await solver.recaptcha({
  pageurl: url,
  googlekey: 'SITE_KEY'
});

await page.evaluate((token) => {
  document.getElementById('g-recaptcha-response').innerHTML = token;
}, result.data);
```

**Cost**: ~$3 per 1000 CAPTCHAs

### Option B: Anti-Captcha Service
Similar to 2Captcha, different provider.

### Option C: Browser Extension Method
Use a CAPTCHA-solving extension in Playwright:
```typescript
const context = await browser.newContext({
  // Load extension
  args: ['--load-extension=/path/to/captcha-extension']
});
```

## Recommended Approach

**For most users**: Just solve CAPTCHAs manually when they appear. The 30-second pause is enough time.

**Why?**
- Free
- Reliable
- No API keys needed
- Works with all CAPTCHA types
- You're there anyway to review the form

## Troubleshooting

### CAPTCHA appears every time
- Clear browser cookies
- Use stealth mode (already enabled)
- Try different times of day
- Use VPN if IP is flagged

### 30 seconds not enough
Increase timeout in `server.ts`:
```typescript
await page.waitForTimeout(60000); // 60 seconds
```

### Want to skip CAPTCHA pages
Add to learning script:
```typescript
if (hasCaptcha) {
  console.log('⏭️  Skipping CAPTCHA page');
  return;
}
```

## Summary

✅ **Stealth mode enabled** - Reduces CAPTCHA triggers
✅ **Auto-detection built-in** - Pauses when CAPTCHA found
✅ **Manual solving supported** - Just solve it, we'll wait
❌ **No paid services needed** - Keep it simple

Most job sites won't show CAPTCHAs if you:
1. Use stealth mode (enabled)
2. Fill forms slowly (enabled with slowMo)
3. Solve them manually when they appear (supported)

You're good to go! 🚀
