# Learning Mode - Quick Start Guide

## Overview
Learning Mode lets Playwright watch you fill out a form and learn from it. Next time, it auto-fills everything instantly.

## Setup

### 1. Start Playwright Server
```bash
cd playwright-server
npm install
npm start
```

Server runs on `http://localhost:3000`

### 2. Build Extension
```bash
cd ..
npm run build
```

### 3. Load Extension in Chrome
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `MagicFill/dist` folder

## Usage

### First Time (Learning Mode)

1. **Navigate to job application page**
   - Go to any job application (Greenhouse, Lever, Workday, etc.)

2. **Click "Learn Form" in extension popup**
   - Playwright browser opens
   - You'll see: "🎓 MagicFill Learning Mode Active" indicator

3. **Fill out the form normally**
   - As you fill each field, it flashes green
   - Counter shows: "🎓 Learning Mode: 5 fields learned"
   - Fill dropdowns, text fields, everything

4. **Close the browser when done**
   - Profile is automatically saved
   - Console shows: "💾 Profile saved for future use!"

### Second Time (Auto-Fill Mode)

1. **Navigate to same job application**
   - Go to the same URL (or similar page on same platform)

2. **Click "Auto-Fill" in extension popup**
   - Playwright opens browser
   - Fills all fields in 2-3 seconds
   - Uses learned profile

3. **Review and submit**
   - Everything is filled
   - Just review and click Submit

## What Gets Learned

- ✅ Text inputs (name, email, phone, etc.)
- ✅ Textareas (cover letters, additional info)
- ✅ Dropdowns (native `<select>` elements)
- ✅ Custom dropdowns (click-to-open)
- ✅ Radio buttons
- ✅ Checkboxes
- ❌ File uploads (you'll need to upload manually)
- ❌ Password fields (security)

## Profile Storage

Profiles are saved in:
```
playwright-server/cache/profiles.json
```

Each profile contains:
- URL pattern
- Field selectors
- Values you entered
- Timestamps

## Tips

### Re-Learning
If a form changes or you want to update answers:
1. Click "Learn Form" again
2. Fill the form with new answers
3. Profile is updated

### Multiple Sites
Each site gets its own profile:
- `greenhouse.io/company1` → Profile 1
- `greenhouse.io/company2` → Profile 2
- `lever.co/company3` → Profile 3

### Debugging
Check server console for:
```
✓ Learned: First Name = John
✓ Learned: Years of Experience = 5-7 years
💾 Profile saved for future use!
```

## Troubleshooting

### "Server offline" error
- Make sure Playwright server is running
- Check `http://localhost:3000/health`

### Fields not learning
- Make sure you're filling fields (not just clicking)
- Check that fields have values when you blur
- Look for green flash confirmation

### Auto-fill not working
- Make sure you learned the form first
- Check that URL matches (profiles are URL-specific)
- Try re-learning if form structure changed

## Example Workflow

```
Day 1: Apply to Company A
1. Click "Learn Form"
2. Fill out application (5 minutes)
3. Close browser
4. Profile saved ✓

Day 2: Apply to Company B (same platform)
1. Click "Auto-Fill"
2. Everything filled (3 seconds)
3. Review and submit
4. Done! ✓

Day 3: Apply to Company C (same platform)
1. Click "Auto-Fill"
2. Everything filled (3 seconds)
3. Review and submit
4. Done! ✓
```

## Benefits

- **One-time learning**: Fill form once, reuse forever
- **Perfect accuracy**: It uses exactly what you entered
- **Handles complexity**: Custom dropdowns, multi-page forms
- **Fast**: 2-3 seconds to fill entire form
- **Visual feedback**: See what's being learned in real-time

## Next Steps

1. Try learning a simple form first
2. Test auto-fill on same form
3. Try on different companies (same platform)
4. Build up your profile library

Happy job hunting! 🚀
