# ✨ MagicFill

Auto-fill job applications with magic. Learn new forms automatically.

## Features

- 🚀 **Instant Auto-Fill**: Fill forms in seconds with keyboard shortcut (Ctrl+Shift+F)
- 🧠 **Smart Field Matching**: Recognizes 20+ common field types automatically
- 📝 **Dynamic Learning**: Add new answers on-the-fly without page reload
- 🌐 **Site-Specific Answers**: Save custom answers for specific websites
- 💾 **Data Management**: Import/export your personal data as JSON
- 🎯 **High Accuracy**: 70%+ fill rate on common job sites (LinkedIn, Indeed, Greenhouse)

## Installation

### Development Build

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production Build

```bash
npm run build
```

The extension will be built to the `dist` folder.

## Usage

### First Time Setup

1. Click the MagicFill icon in your browser toolbar
2. Click "Manage Answers"
3. Fill in your personal information
4. Click "Save Changes"

### Auto-Filling Forms

**Method 1: Automatic**
- Navigate to any job application page
- The extension will automatically fill recognized fields after 1 second

**Method 2: Manual**
- Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac)
- Or click the MagicFill icon and click "Fill Form"

### Adding New Answers

When the extension encounters unrecognized fields:

1. Click the MagicFill icon
2. You'll see a list of unrecognized fields
3. Click "+ Add" next to any field
4. Enter a key and value
5. Choose if it's site-specific or reusable
6. Click "Save & Fill Now"

The field will be filled immediately and remembered for future use.

## Project Structure

```
MagicFill/
├── extension/
│   ├── core/
│   │   ├── FieldMatcher.ts    # Pattern matching engine
│   │   ├── FormFiller.ts      # Form filling logic
│   │   └── Storage.ts         # Chrome storage wrapper
│   ├── content/
│   │   └── content.ts         # Content script (runs on pages)
│   ├── background/
│   │   └── background.ts      # Background service worker
│   ├── popup/
│   │   ├── popup.html         # Extension popup UI
│   │   ├── popup.css          # Popup styles
│   │   └── popup.ts           # Popup logic
│   ├── manage/
│   │   ├── manage.html        # Manage answers page
│   │   ├── manage.css         # Manage page styles
│   │   └── manage.ts          # Manage page logic
│   └── manifest.json          # Extension manifest
├── shared/
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Supported Field Types

### Basic Information
- First Name, Last Name, Full Name
- Email, Phone

### Address
- Street Address, Address Line 2
- City, State, ZIP Code, Country

### Professional
- Current Company, Current Title
- Years of Experience
- LinkedIn, GitHub, Portfolio

### Education
- University, Degree, Major
- Graduation Year

### Work Authorization
- Work Authorization Status
- Sponsorship Requirements

### Other
- Salary Expectation
- Start Date, Notice Period
- Referral, How Did You Hear
- Cover Letter, Additional Info

## Data Privacy

- All data is stored locally in Chrome's storage
- No data is sent to external servers
- You have full control over your data
- Export/import functionality for backup

## Development

### Watch Mode

```bash
npm run dev
```

This will watch for file changes and rebuild automatically.

### Type Checking

```bash
npm run type-check
```

### Project Commands

- `npm run build` - Production build
- `npm run dev` - Development build with watch mode
- `npm run type-check` - TypeScript type checking

## Roadmap

### Phase 1: Core Extension ✅
- [x] Field matching engine
- [x] Form filler
- [x] Storage system
- [x] Content script
- [x] Background script
- [x] Popup UI
- [x] Manage answers screen

### Phase 2: MCP Learning System (Coming Soon)
- [ ] MCP server with Playwright
- [ ] Automatic form learning
- [ ] Iterative improvement
- [ ] 100% fill rate after learning

### Phase 3: Multi-Page & Polish
- [ ] Multi-page form support
- [ ] Enhanced notifications
- [ ] Statistics dashboard
- [ ] Resume upload detection

### Phase 4: Mobile App
- [ ] React Native app
- [ ] WebView browser
- [ ] Cloud sync
- [ ] iOS & Android support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ✨ by developers, for developers
