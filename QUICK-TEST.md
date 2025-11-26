# 🚀 Quick Test Guide

## Build & Load (One Time Setup)

```bash
# Build the extension
build.bat

# Load in Chrome
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select MagicFill/dist folder
```

## Test the Complete Workflow

### Test 1: Learn Form → Review → Manage

1. **Go to any job form** (LinkedIn, Indeed, etc.)

2. **Click extension icon → "Learn Form"**
   - Should show "🔍 Learning form..." notification
   - Review page opens in new tab

3. **In Review Fields page:**
   - See list of detected fields
   - Click **−** button to remove unwanted fields
   - Fill in answers for fields you want
   - Click "Save All Answers"
   - Should see "✅ Saved X answers!" alert

4. **Open Manage page:**
   - Click extension icon → "Manage Answers"
   - Go to "Custom Answers" tab
   - Verify your saved fields are there
   - Each field should have:
     - ✏️ Edit button
     - **− Minus button (red)**

5. **Test minus button:**
   - Click **−** on any field
   - Should see confirmation dialog
   - Click OK
   - Field should disappear
   - Counter should update

### Test 2: Auto-Fill

1. **Go to a job form**
2. **Click extension icon → "Fill Form"**
3. **Watch fields fill automatically:**
   - Green highlight = filled
   - Red highlight = unrecognized
   - Blue highlight = file upload

## Expected Results

✅ Minus buttons appear in both Custom and Site-Specific tabs
✅ Minus buttons are red and bold
✅ Hover shows lighter red background
✅ Clicking minus deletes the field (with confirmation)
✅ Stats counter updates after deletion
✅ Review page allows removing fields before saving

## Troubleshooting

**Minus button not showing?**
- Rebuild: `build.bat`
- Reload extension in Chrome
- Hard refresh the manage page (Ctrl+Shift+R)

**Learn Form not working?**
- MCP server must be running (see mcp-server/README.md)
- Or just use the manual "Add Answer" flow

**Fields not filling?**
- Make sure you have data in Manage page
- Check field matching is working
- Look for errors in Chrome DevTools console
