# SmartFormFiller

**Auto-fill job applications with one click. Learn new forms automatically.**

## 🎯 What It Does

1. You click on a job application
2. Extension auto-fills all fields (2 seconds)
3. You review and submit
4. Repeat 50+ times per day

If it encounters an unknown form:
- Click "Learn Form"
- Playwright analyzes it (30 seconds)
- Saves configuration
- Next time: Works automatically

## ✨ Features

### Phase 1: MVP (Current)
- ✅ Auto-fill on page load
- ✅ Manual trigger (Ctrl+Shift+F)
- ✅ Settings popup
- ✅ Smart field matching
- ✅ Non-intrusive notifications
- ✅ Works on LinkedIn, Indeed, Greenhouse

### Phase 2: Learning (Next)
- 🔲 MCP server for form analysis
- 🔲 Playwright-based learning
- 🔲 Save/load configurations
- 🔲 URL pattern matching

### Phase 3: Multi-Page (Future)
- 🔲 Auto-continue to next page
- 🔲 Workday/Lever support
- 🔲 Progress tracking

## 🚀 Quick Start

### 1. Install Extension

```bash
# Load in Chrome
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select SmartFormFiller/extension folder
```

### 2. Configure Your Data

1. Click extension icon
2. Fill in your information
3. Click "Save Settings"

### 3. Apply to Jobs!

Visit any job application and watch it auto-fill!

## 📁 Project Structure

```
SmartFormFiller/
├── extension/              # Chrome Extension (Phase 1)
│   ├── content/           # Auto-fill logic
│   ├── popup/             # Settings UI
│   └── background/        # Hotkey handler
│
├── mcp-server/            # Playwright MCP (Phase 2)
│   └── src/
│       ├── learn-form.ts
│       └── save-config.ts
│
├── shared/                # Shared configs
│   └── configs/          # Form configurations
│
└── .kiro/steering/       # Architecture docs
```

## 🎯 User Flow

### Known Form (Fast)
```
Visit page → Auto-fill (2s) → Review → Submit
```

### Unknown Form (Learning)
```
Visit page → Partial fill → Click "Learn" → 
Playwright analyzes (30s) → Save config → 
Next time: Auto-fill (2s)
```

## 🔧 Tech Stack

- **Extension:** Vanilla JavaScript (no build step)
- **MCP Server:** TypeScript + Playwright
- **Storage:** Chrome Storage API + JSON files
- **Communication:** Local file system

## 📚 Documentation

- [Architecture](.kiro/steering/architecture.md) - System design
- [Coding Standards](.kiro/steering/coding-standards.md) - Code style
- [Product Requirements](.kiro/steering/product-requirements.md) - Features & specs
- [Extension README](extension/README.md) - How to use

## 🎨 Design Principles

1. **Manual control** - You click jobs, we fill forms
2. **Non-intrusive** - Small notifications, no alerts
3. **Fast** - <2 seconds to fill
4. **Learning** - Gets better over time
5. **Privacy** - All data stays local

## 🚧 Development Status

### Phase 1: MVP ✅
- [x] Chrome extension skeleton
- [x] Field matching engine
- [x] Form filler
- [x] Settings popup
- [x] Notifications
- [ ] Resume attachment
- [ ] Testing on major sites

### Phase 2: Learning 🔲
- [ ] MCP server setup
- [ ] Playwright analyzer
- [ ] Config saver/loader
- [ ] Extension ↔ MCP communication

### Phase 3: Multi-Page 🔲
- [ ] Next button detection
- [ ] Auto-continue
- [ ] Progress tracking

## 🎯 Success Metrics

- Fill 70%+ of fields on common sites
- <2 seconds to fill a form
- Learn any form in <30 seconds
- 95%+ accuracy on learned forms

## 🔒 Privacy & Security

- All data stored locally (Chrome Storage)
- No external servers (except localhost MCP)
- No analytics or tracking
- Open source - audit the code

## 🤝 Contributing

This is a personal project, but suggestions welcome!

## 📝 License

MIT - Use freely for personal job searching

---

**Ready to 10x your job applications?** Start with the [Extension README](extension/README.md)!
