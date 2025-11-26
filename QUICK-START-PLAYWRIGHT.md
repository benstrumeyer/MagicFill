# Quick Start: Playwright Integration

## What's New

✅ **Analyze & Fill Button** - Deep form analysis with Playwright
✅ **Platform Detection** - Auto-detects Greenhouse, Lever, Workday, etc.
✅ **Profile Caching** - Analyze once, use forever
✅ **Server Status** - Visual indicator if Playwright server is running

---

## Setup (One-Time)

### 1. Install Playwright Server
```bash
cd MagicFill/playwright-server
npm install
npx playwright install chromium
```

### 2. Start Playwright Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

### 3. Reload Extension
1. Go to `chrome://extensions/`
2. Click reload on MagicFill
3. Navigate to a job application page

---

## How to Use

### First Time on a Platform (e.g., Greenhouse)

1. **Navigate** to any Greenhouse job application
2. **Click extension** icon
3. **See platform detected**: "Platform: Greenhouse"
4. **Click "Analyze & Fill"** button
5. **Wait 5-10 seconds** while Playwright analyzes
6. **Form fills automatically!**

### Second Time (Same Platform)

1. **Navigate** to another Greenhouse job
2. **Click extension** icon
3. **See**: "Profile cached (0 days old)"
4. **Click "Fill Form"** - Instant fill!
5. No Playwright call needed

---

## UI Elements

### Platform Status
```
Platform: Greenhouse
Profile cached (2 days old)
```
- Shows detected platform
- Shows if profile exists
- Shows profile age

### Server Status
```
🟢 Playwright Server
```
- Green = Server online
- Red = Server offline

### Buttons

**Analyze & Fill** (Purple gradient)
- Appears when: No profile OR profile is stale (>30 days)
- Calls Playwright server
- Saves profile
- Auto-fills form

**Fill Form** (Blue)
- Uses cached profile if available
- Falls back to existing logic
- Works offline

---

## Testing Checklist

### ✅ Server Running
- [ ] Start server: `npm run dev`
- [ ] Check health: `curl http://localhost:3000/health`
- [ ] See green indicator in extension

### ✅ First Analysis
- [ ] Navigate to Greenhouse job
- [ ] See "Platform: Greenhouse"
- [ ] See "Analyze & Fill" button
- [ ] Click button
- [ ] See "Analyzing page..." status
- [ ] Wait for completion
- [ ] See "Analyzed! Found X fields"
- [ ] Form auto-fills

### ✅ Cached Profile
- [ ] Navigate to different Greenhouse job
- [ ] See "Profile cached (0 days old)"
- [ ] "Analyze & Fill" button hidden
- [ ] Click "Fill Form"
- [ ] Instant fill!

### ✅ Multiple Platforms
- [ ] Test Greenhouse
- [ ] Test Lever
- [ ] Test Workday
- [ ] Each gets own profile

---

## Troubleshooting

### "Playwright Server" shows red
**Problem:** Server not running
**Solution:**
```bash
cd MagicFill/playwright-server
npm run dev
```

### "Analysis failed" error
**Problem:** Server timeout or page load issue
**Solution:**
- Check server logs
- Try again
- Increase timeout in `.env`

### Profile not caching
**Problem:** Storage issue
**Solution:**
- Open console
- Run: `MagicFillDebug.showStorage()`
- Check `siteProfiles` object

### Button not appearing
**Problem:** Platform not detected
**Solution:**
- Check URL contains platform keyword
- Add platform to `PlatformMatcher.ts`

---

## Console Commands

### Check Storage
```javascript
MagicFillDebug.showStorage()
```

### Clear Profiles
```javascript
chrome.storage.local.get('siteProfiles', (result) => {
  console.log('Profiles:', result.siteProfiles);
});

// Clear all profiles
chrome.storage.local.remove('siteProfiles');
```

---

## Next Steps

1. ✅ Server is running
2. ✅ Extension has Analyze & Fill button
3. ⏳ Test on real job sites
4. ⏳ Refine profile-based filling
5. ⏳ Add more platforms

---

## Architecture Flow

```
User clicks "Analyze & Fill"
    ↓
Extension calls PlaywrightAPI.analyzeCurrentPage(url)
    ↓
HTTP POST to localhost:3000/analyze
    ↓
Playwright opens page, analyzes fields
    ↓
Returns SiteProfile JSON
    ↓
Extension saves to ProfileManager
    ↓
Extension fills form using profile
    ↓
Done! Profile cached for future use
```

---

## Success! 🎉

You now have a hybrid system:
- **Playwright** for deep analysis
- **Extension** for fast filling
- **Profiles** for reusability

Apply to 100s of jobs with minimal effort!
