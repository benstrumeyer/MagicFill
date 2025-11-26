# 🚀 Start Here - Learning Mode Testing

## Quick Start (5 minutes)

### 1. Install Playwright Server Dependencies
```bash
cd playwright-server
npm install
```

### 2. Start Playwright Server
```bash
npm start
```

You should see:
```
🎯 MagicFill Playwright Server
📡 Server running on http://localhost:3000
🌐 Headless mode: false

Endpoints:
  GET  /health      - Health check
  POST /learn-form  - 🎓 Learn form (you fill, it learns)
  POST /auto-fill   - 🚀 Auto-fill using learned profile

Ready to learn and fill forms! 🚀
```

### 3. Build Extension (In New Terminal)
```bash
cd ..
npm run build
```

### 4. Load Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `MagicFill/dist` folder

### 5. Test Learning Mode

#### First Time (Learn)
1. Go to any job application (e.g., Greenhouse, Lever)
2. Click the MagicFill extension icon
3. Click "🎓 Learn Form"
4. Playwright browser opens
5. Fill out the form normally
6. Watch fields flash green as you fill them
7. See counter: "🎓 Learning Mode: 5 fields learned"
8. Close the browser when done
9. Profile is saved automatically!

#### Second Time (Auto-Fill)
1. Go to the same job application (or similar one)
2. Click the MagicFill extension icon
3. Click "🚀 Auto-Fill"
4. Playwright opens and fills everything in 2-3 seconds
5. Review and submit!

## Troubleshooting

### CAPTCHA blocking Playwright?
**Solution: Use the extension in regular Chrome instead!**

The extension works great in your regular browser:
1. Navigate to site in regular Chrome
2. Solve CAPTCHA normally
3. Click extension icon → "Fill Form"
4. Done!

See `CAPTCHA-SOLUTION.md` for details.

### "Server offline" error
- Make sure Playwright server is running
- Check `http://localhost:3000/health` in browser

### Fields not learning
- Make sure you're actually filling fields (not just clicking)
- Look for green flash when you leave a field
- Check server console for "✓ Learned: ..." messages

### Auto-fill not working
- Make sure you learned the form first
- Check that URL matches (profiles are URL-specific)
- Try re-learning if form structure changed

### Build errors
If you get PowerShell execution policy errors:
```bash
# Use the batch file instead
build.bat
```

## What's Next?

After testing works:
1. Read `CLEANUP-AND-IMPLEMENTATION-TASKS.md`
2. Execute cleanup tasks
3. Remove obsolete features
4. Update documentation
5. Ship it!

## Need Help?

Check these docs:
- `LEARNING-MODE-GUIDE.md` - Detailed user guide
- `LEARNING-MODE-FLOW.md` - Technical architecture
- `IMPLEMENTATION-SUMMARY.md` - What we built

Happy testing! 🎉
