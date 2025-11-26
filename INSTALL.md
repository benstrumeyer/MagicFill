# Installation Guide

## Quick Install (5 minutes)

### Step 1: Build the Extension

```bash
cd MagicFill
npm install
npm run build
```

### Step 2: Load in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right corner)
4. Click "Load unpacked"
5. Navigate to and select the `MagicFill/dist` folder
6. The extension should now appear in your extensions list

### Step 3: Verify Installation

- You should see "MagicFill ✨" in your extensions list
- The extension should show as "Enabled"
- Click the puzzle piece icon in Chrome toolbar to pin MagicFill for easy access

### Step 4: Initial Setup

1. Click the MagicFill icon in your toolbar
2. Click "Manage Answers"
3. Fill in your personal information in the "Personal Data" tab
4. Click "Save Changes"

## Troubleshooting

### Build Errors

If `npm install` fails:
- Make sure you have Node.js 16+ installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

If `npm run build` fails:
- Check for TypeScript errors in the output
- Make sure all dependencies are installed

### Extension Won't Load

If Chrome shows an error when loading:
- Make sure you selected the `dist` folder, not the root `MagicFill` folder
- Check that the build completed successfully
- Try reloading the extension from `chrome://extensions/`

### Extension Loads But Doesn't Work

- Make sure you've filled in your personal data (Step 4 above)
- Try refreshing the page you're testing on
- Check the browser console for errors (F12 → Console tab)
- Make sure the extension has permission for the site (check `chrome://extensions/`)

## Development Mode

If you want to make changes to the extension:

```bash
# Watch mode - rebuilds on file changes
npm run dev
```

After making changes:
1. Save your files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the MagicFill extension
4. Reload the page you're testing on

## Uninstall

1. Go to `chrome://extensions/`
2. Find MagicFill
3. Click "Remove"
4. Confirm removal

Your personal data is stored in Chrome's local storage and will be removed when you uninstall.

## Next Steps

Once installed, check out:
- [QUICKSTART.md](QUICKSTART.md) - Learn how to use MagicFill
- [README.md](README.md) - Full feature documentation
- [PHASE1-COMPLETE.md](PHASE1-COMPLETE.md) - Technical details

---

Need help? Open an issue on GitHub!
