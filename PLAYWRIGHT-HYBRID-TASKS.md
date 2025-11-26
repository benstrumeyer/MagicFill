# MagicFill Playwright Hybrid Architecture - Implementation Tasks

## Overview
Integrate Playwright analysis server with existing Chrome extension to enable deep form analysis and intelligent filling while maintaining all current features.

---

## Phase 1: Playwright Analysis Server (NEW)

### Task 1.1: Server Setup
- [ ] Create `playwright-server/` directory
- [ ] Initialize Node.js project with TypeScript
- [ ] Install dependencies: `playwright`, `express`, `cors`
- [ ] Create `tsconfig.json` for server
- [ ] Create `.env` for server configuration
- [ ] Add `start` and `dev` scripts

**Files to create:**
- `playwright-server/package.json`
- `playwright-server/tsconfig.json`
- `playwright-server/.env`
- `playwright-server/src/server.ts`

---

### Task 1.2: Core Analysis Engine
- [ ] Create `FieldAnalyzer` class
  - Detect all input fields (input, select, textarea)
  - Identify field types (text, email, phone, file, etc.)
  - Extract field context (labels, placeholders, aria-labels)
  - Detect custom dropdowns (non-native selects)
  - Identify hidden fields and their relationships
- [ ] Create `DropdownAnalyzer` class
  - Detect custom dropdown patterns
  - Analyze click-to-open behavior
  - Extract available options
  - Determine selection strategy
- [ ] Create `MultiPageDetector` class
  - Detect "Next" buttons
  - Identify page transitions
  - Map fields to pages
  - Detect submit buttons

**Files to create:**
- `playwright-server/src/analyzers/FieldAnalyzer.ts`
- `playwright-server/src/analyzers/DropdownAnalyzer.ts`
- `playwright-server/src/analyzers/MultiPageDetector.ts`

---

### Task 1.3: Profile Generator
- [ ] Create `ProfileGenerator` class
  - Aggregate analysis results
  - Generate JSON profile structure
  - Include field selectors and strategies
  - Add metadata (platform, timestamp)
- [ ] Define profile schema/types
- [ ] Add profile validation

**Files to create:**
- `playwright-server/src/ProfileGenerator.ts`
- `playwright-server/src/types/profile.ts`

---

### Task 1.4: API Endpoints
- [ ] `POST /analyze` - Analyze a URL
  - Accept: `{ url: string }`
  - Return: `SiteProfile` JSON
- [ ] `GET /health` - Server health check
- [ ] `POST /test-profile` - Test a profile (optional)
- [ ] Add CORS configuration for extension
- [ ] Add error handling and logging

**Files to create:**
- `playwright-server/src/routes/analyze.ts`
- `playwright-server/src/routes/health.ts`

---

### Task 1.5: Platform Detection
- [ ] Create platform detector
  - Greenhouse detection
  - Lever detection
  - Workday detection
  - Ashby detection
  - Generic fallback
- [ ] Return platform type in profile

**Files to create:**
- `playwright-server/src/PlatformDetector.ts`

---

## Phase 2: Chrome Extension Integration (ENHANCED)

### Task 2.1: API Client
- [ ] Create `PlaywrightAPI` class
  - `analyzeCurrentPage()` method
  - `checkServerStatus()` method
  - Error handling
  - Timeout handling
- [ ] Add server URL configuration

**Files to create:**
- `extension/core/PlaywrightAPI.ts`

---

### Task 2.2: Profile Management
- [ ] Create `ProfileManager` class
  - Save profiles to chrome.storage
  - Load profiles by platform
  - Update existing profiles
  - Delete profiles
  - List all profiles
- [ ] Add profile caching logic
- [ ] Add profile versioning

**Files to create:**
- `extension/core/ProfileManager.ts`

---

### Task 2.3: Platform Matcher
- [ ] Create `PlatformMatcher` class
  - Detect platform from URL
  - Match URL patterns
  - Return platform identifier
- [ ] Support multiple platform types

**Files to create:**
- `extension/core/PlatformMatcher.ts`

---

### Task 2.4: Profile-Based Form Filler
- [ ] Enhance `FormFiller` to use profiles
  - Accept profile as input
  - Use profile selectors
  - Apply custom strategies
  - Handle multi-page flows
- [ ] Keep existing filling logic as fallback
- [ ] Add profile-specific dropdown handling

**Files to modify:**
- `extension/core/FormFiller.ts` (enhance existing)

---

### Task 2.5: Enhanced Popup UI
- [ ] Add "Analyze & Fill" button
  - Show loading state during analysis
  - Display analysis progress
  - Show success/error messages
- [ ] Update "Fill Form" button
  - Check for cached profile first
  - Show profile status
  - Display last updated time
- [ ] Add profile management section
  - View cached profiles
  - Re-analyze option
  - Delete profile option
- [ ] Add server status indicator

**Files to modify:**
- `extension/popup/popup.html` (add new UI elements)
- `extension/popup/popup.ts` (add new logic)
- `extension/popup/popup.css` (style new elements)

---

## Phase 3: Keep Existing Features (MAINTAIN)

### Task 3.1: Personal Data Management
- [x] Keep existing personal data storage
- [x] Keep field mappings system
- [x] Keep custom answers
- [x] Keep site-specific answers
- [ ] Ensure compatibility with profiles

**Files to maintain:**
- `extension/core/Storage.ts`
- `extension/manage/manage.ts`
- `field-mappings.json`
- `dev-data.json`

---

### Task 3.2: Field Detection
- [x] Keep existing `FieldMatcher` class
- [ ] Use as fallback when no profile exists
- [ ] Integrate with profile-based detection

**Files to maintain:**
- `extension/core/FieldMatcher.ts`

---

### Task 3.3: Save Buttons & Custom Answers
- [x] Keep "Save Answer" buttons for unknown fields
- [x] Keep fuzzy matching for custom answers
- [ ] Ensure works with profile-based filling

**Files to maintain:**
- `extension/content/content.ts` (save button logic)

---

### Task 3.4: Manage Page
- [x] Keep Personal Data tab
- [x] Keep Custom Answers tab
- [x] Keep Site-Specific tab
- [x] Keep Field Mappings tab
- [ ] Add new "Profiles" tab (optional)

**Files to maintain:**
- `extension/manage/manage.html`
- `extension/manage/manage.ts`
- `extension/manage/manage.css`

---

## Phase 4: Integration & Testing

### Task 4.1: End-to-End Flow
- [ ] Test: Extension → Server → Profile → Fill
- [ ] Test: Profile caching and reuse
- [ ] Test: Fallback to existing logic
- [ ] Test: Multi-page forms
- [ ] Test: Custom dropdowns

---

### Task 4.2: Error Handling
- [ ] Handle server offline gracefully
- [ ] Handle analysis failures
- [ ] Handle profile corruption
- [ ] Show helpful error messages

---

### Task 4.3: Documentation
- [ ] Update README with new architecture
- [ ] Document server setup
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Add troubleshooting guide

**Files to create/update:**
- `playwright-server/README.md`
- `MagicFill/README.md` (update)
- `MagicFill/ARCHITECTURE.md` (new)

---

## Phase 5: Advanced Features (FUTURE)

### Task 5.1: Profile Sharing
- [ ] Export profiles to JSON
- [ ] Import profiles from JSON
- [ ] Cloud sync (optional)

---

### Task 5.2: AI-Enhanced Analysis
- [ ] Integrate GPT-4 Vision for field detection
- [ ] Smart field type inference
- [ ] Automatic strategy generation

---

### Task 5.3: Batch Processing
- [ ] Apply to multiple jobs from list
- [ ] Queue management
- [ ] Progress tracking

---

## Project Structure

```
MagicFill/
├── playwright-server/           # NEW: Analysis server
│   ├── src/
│   │   ├── server.ts           # Express server
│   │   ├── analyzers/
│   │   │   ├── FieldAnalyzer.ts
│   │   │   ├── DropdownAnalyzer.ts
│   │   │   └── MultiPageDetector.ts
│   │   ├── ProfileGenerator.ts
│   │   ├── PlatformDetector.ts
│   │   ├── routes/
│   │   │   ├── analyze.ts
│   │   │   └── health.ts
│   │   └── types/
│   │       └── profile.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── extension/                   # ENHANCED: Chrome extension
│   ├── core/
│   │   ├── Storage.ts          # KEEP: Existing
│   │   ├── FieldMatcher.ts     # KEEP: Existing
│   │   ├── FormFiller.ts       # ENHANCE: Add profile support
│   │   ├── PlaywrightAPI.ts    # NEW: Server communication
│   │   ├── ProfileManager.ts   # NEW: Profile caching
│   │   └── PlatformMatcher.ts  # NEW: Platform detection
│   ├── popup/
│   │   ├── popup.html          # ENHANCE: Add analyze button
│   │   ├── popup.ts            # ENHANCE: Add analyze logic
│   │   └── popup.css           # ENHANCE: Style new UI
│   ├── manage/
│   │   ├── manage.html         # KEEP: Existing tabs
│   │   ├── manage.ts           # KEEP: Existing logic
│   │   └── manage.css          # KEEP: Existing styles
│   └── content/
│       └── content.ts          # KEEP: Existing logic
│
├── field-mappings.json          # KEEP: Existing
├── dev-data.json                # KEEP: Existing
└── webpack.config.js            # UPDATE: Add new files
```

---

## Priority Order

### **Sprint 1: MVP (Week 1)**
1. Task 1.1: Server Setup
2. Task 1.2: Core Analysis Engine
3. Task 1.3: Profile Generator
4. Task 1.4: API Endpoints
5. Task 2.1: API Client
6. Task 2.2: Profile Management

### **Sprint 2: Integration (Week 2)**
7. Task 2.3: Platform Matcher
8. Task 2.4: Profile-Based Form Filler
9. Task 2.5: Enhanced Popup UI
10. Task 4.1: End-to-End Testing

### **Sprint 3: Polish (Week 3)**
11. Task 4.2: Error Handling
12. Task 4.3: Documentation
13. Task 3.1-3.4: Ensure existing features work

---

## Success Criteria

✅ Playwright server analyzes pages and returns profiles
✅ Extension communicates with server successfully
✅ Profiles are cached and reused
✅ Forms fill correctly using profiles
✅ All existing features still work
✅ Graceful fallback when server is offline
✅ Clear error messages and user feedback

---

## Next Steps

1. Review and approve task breakdown
2. Start with Sprint 1: Server Setup
3. Build incrementally and test each component
4. Keep existing extension working throughout

Ready to start implementation?
