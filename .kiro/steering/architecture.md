---
inclusion: always
---

# SmartFormFiller Architecture

## 🎯 Core Philosophy

**Manual application with minimal clicks** - You click on jobs, the system fills forms automatically. If it can't, it learns and saves the configuration for next time.

## 🏗️ System Components

### 1. Chrome Extension (Phase 1)
**Purpose:** Auto-fill forms on any website

**Components:**
- `content/` - Runs on every page, detects and fills forms
- `popup/` - Control center for managing forms and learning
- `background/` - Handles hotkeys and coordination
- `options/` - Full settings page for personal data (chrome://extensions)

**Flow:**
```
Page Load → Detect Form → Try Auto-Fill
  ↓
Success? → Show "✅ Form Complete!"
  ↓
Failed? → Auto-trigger Playwright scan
```

### 2. MCP Server (Phase 1 - Critical)
**Purpose:** Auto-scan pages to find missing fields

**Components:**
- `scan-page.ts` - Scans current page for all fields
- `update-config.ts` - Merges new fields into existing config
- `server.ts` - MCP server that extension calls

**Flow:**
```
Extension detects unfilled fields
  ↓
Calls MCP: "Scan this page"
  ↓
MCP opens Playwright on same URL
  ↓
Finds ALL fields with precise selectors
  ↓
Returns field mappings to extension
  ↓
Extension updates config
  ↓
Extension refreshes page
  ↓
Extension tries again with new config
  ↓
Repeat until 100% or max iterations
```

### 3. Shared Storage
**Purpose:** Store form configurations and personal data

**Structure:**
```
shared/
├── configs/           # Form configurations
│   ├── linkedin.json
│   ├── indeed.json
│   └── company-*.json
└── personal-data.json # User's info (encrypted)
```

## 📊 Data Flow

### Iterative Learning Flow (Auto-Improving)
```
1. User visits job application
2. Extension tries to fill with current config
3. Detects unfilled fields (e.g., 7/10 filled)
4. Auto-triggers Playwright MCP to scan page
5. Playwright finds all fields and their selectors
6. Updates config with new field mappings
7. Refreshes page automatically
8. Extension tries again with updated config
9. Repeat until 100% filled (or max 3 iterations)
10. Shows: "✅ Form Complete! 10/10 fields"
```

### Return Visit (Learned Form)
```
1. User visits job application
2. Extension loads saved config
3. Fills all fields instantly (100%)
4. Shows: "✅ Form Complete! 10/10 fields"
```

### Key Insight
**No user intervention needed** - The system automatically improves itself by:
- Detecting gaps in knowledge
- Scanning the page with Playwright
- Updating the config
- Retrying until perfect

## 🔧 Technical Stack

### Chrome Extension
- **TypeScript** with Webpack bundling
- Chrome Storage API
- Manifest V3
- Type-safe development

### MCP Server
- TypeScript + Node.js
- Playwright for browser automation
- File-based storage (JSON)

### Communication
- Chrome Extension ↔ MCP Server: HTTP (localhost:3000)
- Shared configs stored in `shared/configs/`
- Type definitions shared via `shared/types/`

## 📁 Project Structure

```
SmartFormFiller/
├── extension/              # Chrome Extension (TypeScript)
│   ├── src/
│   │   ├── content/
│   │   │   ├── content.ts      # Main entry
│   │   │   ├── field-matcher.ts # Field recognition
│   │   │   ├── form-filler.ts   # Fill logic
│   │   │   └── storage.ts       # Data access
│   │   ├── popup/
│   │   │   ├── popup.ts
│   │   │   └── popup.html
│   │   ├── background/
│   │   │   └── background.ts
│   │   └── types/
│   │       └── index.ts         # Extension types
│   ├── dist/               # Compiled output
│   ├── manifest.json
│   ├── webpack.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── mcp-server/            # Playwright MCP Server
│   ├── src/
│   │   ├── scan-page.ts
│   │   ├── update-config.ts
│   │   ├── server.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                # Shared between extension & MCP
│   ├── configs/          # Form configurations (JSON)
│   └── types/            # Shared TypeScript types
│       ├── config.ts
│       ├── personal-data.ts
│       └── index.ts
│
└── docs/
    ├── QUICKSTART.md
    └── ARCHITECTURE.md
```

## 🎨 Configuration Format

### Form Configuration Schema
```json
{
  "url_pattern": "https://jobs.company.com/*",
  "site_name": "Company XYZ",
  "learned_at": "2024-01-15T10:30:00Z",
  "last_updated": "2024-01-15T10:35:00Z",
  "scan_iterations": 2,
  "fill_rate": 1.0,
  "fields": [
    {
      "semantic_type": "firstName",
      "selector": "#first-name",
      "type": "text",
      "found_by": "playwright",
      "last_filled": "2024-01-15T10:35:00Z"
    },
    {
      "semantic_type": "email",
      "selector": "input[type='email'][name='email']",
      "type": "email",
      "found_by": "playwright",
      "last_filled": "2024-01-15T10:35:00Z"
    }
  ],
  "multi_page": false
}
```

### Key Changes
- **Single selector per field** - Playwright finds the exact one
- **scan_iterations** - How many times we scanned to reach 100%
- **fill_rate** - Percentage of fields successfully filled
- **found_by** - "pattern" (initial guess) or "playwright" (scanned)
- **last_filled** - Track which fields are actively used

## 🚀 Phase Breakdown

### Phase 1: Auto-Learning System (Week 1-2)
**Extension:**
- ✅ Basic field matching (firstName, email, phone, etc.)
- ✅ Auto-fill on page load
- ✅ Hotkey trigger (Ctrl+Shift+D)
- ✅ Settings popup
- 🔲 Detect unfilled fields
- 🔲 Call MCP when fields missing
- 🔲 Auto-refresh and retry

**MCP Server:**
- 🔲 HTTP server on localhost
- 🔲 Playwright page scanner
- 🔲 Field extractor (all inputs, selects, textareas)
- 🔲 Selector generator (unique, stable selectors)
- 🔲 Config updater (merge new fields)

**Deliverable:** Self-improving system that reaches 100% fill rate

### Phase 2: Multi-Page Support (Week 3)
- 🔲 Detect "Next" buttons
- 🔲 Auto-continue to next page
- 🔲 Scan each page separately
- 🔲 Handle Workday-style flows

**Deliverable:** Handles complex multi-page applications

### Phase 3: Polish (Week 4)
- 🔲 Better notifications
- 🔲 Config management UI
- 🔲 Success rate tracking
- 🔲 Resume upload handling

**Deliverable:** Production-ready system

## 🎯 Success Metrics

### Phase 1 Success
- Fills 70%+ of fields on common job sites
- Works on LinkedIn, Indeed, Greenhouse
- <2 seconds to fill a form

### Phase 2 Success
- Can learn any form in <30 seconds
- 95%+ accuracy on learned forms
- Configs work across similar pages

### Phase 3 Success
- Handles Workday, Lever, Greenhouse multi-page
- Auto-continues without user intervention
- Detects final page correctly

## 🔒 Security & Privacy

- All data stored locally (Chrome Storage)
- No external servers (except MCP on localhost)
- Configs are shareable but don't contain personal data
- Resume files referenced by path, not uploaded

## 🎨 UX Principles

1. **Non-intrusive** - Small notifications, no alerts
2. **Fast** - Auto-fill in <2 seconds
3. **Transparent** - Show what was filled
4. **Recoverable** - Easy to undo/retry
5. **Learning** - Gets better over time
