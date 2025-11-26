# Cleanup and Implementation Tasks

## Phase 1: Remove Obsolete Features from Extension

### Task 1.1: Simplify Popup UI
**File**: `extension/popup/popup.html`
- [x] Remove "Analyze & Fill" button (old approach)
- [x] Remove "Save All Answers" button (not needed with learning mode)
- [x] Keep "Learn Form" button (Playwright learning)
- [x] Keep "Auto-Fill" button (Playwright auto-fill)
- [x] Keep "Manage Answers" button (still useful for personal data)
- [x] Remove platform status section (not needed)
- [x] Remove scanned badge (not needed)
- [ ] Simplify status section to just show server status

### Task 1.2: Clean Up Popup Logic
**File**: `extension/popup/popup.ts`
- [ ] Remove `analyzeAndFill()` method
- [ ] Remove `playwrightFill()` method (replaced by autoFillPlaywright)
- [ ] Remove `saveAllAnswers()` method
- [ ] Remove `updatePlatformStatus()` method
- [ ] Remove `checkServerStatus()` method (or simplify)
- [ ] Remove polling logic (not needed anymore)
- [ ] Keep only: `learnFormPlaywright()`, `autoFillPlaywright()`, `openManageAnswers()`

### Task 1.3: Remove Unused Core Classes
**Files to evaluate**:
- [ ] `extension/core/ProfileManager.ts` - DELETE (replaced by ProfileCache in server)
- [ ] `extension/core/PlatformMatcher.ts` - DELETE (not needed)
- [ ] `extension/core/PlaywrightAPI.ts` - KEEP but simplify (just fetch calls)
- [ ] `extension/core/MCPClient.ts` - DELETE (MCP not used)
- [ ] `extension/core/FieldMatcher.ts` - KEEP (still useful for extension mode)
- [ ] `extension/core/FormFiller.ts` - KEEP (still useful for extension mode)

### Task 1.4: Simplify Content Script
**File**: `extension/content/content.ts`
- [ ] Keep basic form filling for "Extension Mode"
- [ ] Remove analysis state tracking (not needed)
- [ ] Remove toast notifications (not needed)
- [ ] Keep save button functionality (useful for custom answers)
- [ ] Simplify to just: fill form, save custom answers

## Phase 2: Remove Obsolete Documentation

### Task 2.1: Delete Old Strategy Docs
- [ ] DELETE: `AUTOMATIC-PLAYWRIGHT-FLOW.md` (superseded by LEARNING-MODE-FLOW.md)
- [ ] DELETE: `PLAYWRIGHT-HYBRID-TASKS.md` (old approach)
- [ ] DELETE: `PLAYWRIGHT-SERVER-READY.md` (outdated)
- [ ] DELETE: `COMMIT-SUMMARY.md` (outdated)
- [ ] DELETE: `READY-TO-TEST-NOW.md` (outdated)
- [ ] DELETE: `QUICK-START-PLAYWRIGHT.md` (superseded by LEARNING-MODE-GUIDE.md)
- [ ] DELETE: `NEXT-SESSION-HANDOFF.md` (outdated)
- [ ] DELETE: `WORKFLOW-DIAGRAM.md` (outdated)
- [ ] DELETE: `READY-TO-TEST.md` (outdated)
- [ ] DELETE: `BUILD-FIXES.md` (temporary doc)
- [ ] DELETE: `SAVE-BUTTON-FEATURE.md` (outdated)
- [ ] DELETE: `DROPDOWN-FIX.md` (outdated)
- [ ] DELETE: `TOAST-STACKING-FIX.md` (outdated)
- [ ] DELETE: `QUICK-SAVE-GUIDE.md` (outdated)
- [ ] DELETE: `CUSTOM-ANSWERS-FIX.md` (outdated)
- [ ] DELETE: `TEST-CUSTOM-ANSWERS.md` (outdated)
- [ ] DELETE: `TEST-PERSISTENCE.md` (outdated)
- [ ] DELETE: `DATA-PERSISTENCE-FLOW.md` (outdated)
- [ ] DELETE: `DEBUG-STORAGE.md` (outdated)

### Task 2.2: Keep Essential Docs
- [x] KEEP: `LEARNING-MODE-FLOW.md` (core concept)
- [x] KEEP: `LEARNING-MODE-GUIDE.md` (user guide)
- [ ] KEEP: `README.md` (update with new approach)
- [ ] KEEP: `QUICKSTART.md` (update with new approach)
- [ ] KEEP: `INSTALL.md` (update)
- [ ] KEEP: `TESTING-GUIDE.md` (update)
- [ ] KEEP: `STORAGE-EXPLAINED.md` (still relevant)
- [ ] KEEP: `DEV-DATA-SETUP.md` (still useful)

## Phase 3: Remove Unused Server Components

### Task 3.1: Clean Up Server Files
**Files to evaluate**:
- [ ] `playwright-server/src/analyzers/FieldAnalyzer.ts` - DELETE (not used in learning mode)
- [x] `playwright-server/src/analyzers/SmartMatcher.ts` - KEEP (used in auto-fill)
- [x] `playwright-server/src/fillers/DropdownFiller.ts` - KEEP (used in auto-fill)
- [x] `playwright-server/src/ProfileCache.ts` - KEEP (core feature)
- [x] `playwright-server/src/scripts/learning-script.ts` - KEEP (core feature)
- [ ] `playwright-server/src/ProfileGenerator.ts` - DELETE (old approach)

### Task 3.2: Simplify Server Endpoints
**File**: `playwright-server/src/server.ts`
- [x] KEEP: `/learn-form` endpoint
- [x] KEEP: `/auto-fill` endpoint
- [ ] KEEP: `/health` endpoint
- [ ] DELETE: `/analyze` endpoint (old approach)
- [ ] DELETE: `/fill-form` endpoint (replaced by auto-fill)

## Phase 4: Remove Unused Extension Features

### Task 4.1: Remove Review Fields Page
- [ ] DELETE: `extension/popup/review-fields.html`
- [ ] DELETE: `extension/popup/review-fields.ts`

### Task 4.2: Simplify Manage Page
**Files**: `extension/manage/manage.html`, `manage.ts`
- [ ] Keep Personal Data tab
- [ ] Keep Custom Answers tab
- [ ] Remove Site-Specific tab (not needed)
- [ ] Remove Field Mappings tab (not needed)
- [ ] Remove Profiles tab (handled by server)

## Phase 5: Remove MCP Server (Not Used)

### Task 5.1: Delete MCP Server
- [ ] DELETE: `mcp-server/` directory entirely
- [ ] DELETE: `playwright-helper/` directory (not needed)

## Phase 6: Update Documentation

### Task 6.1: Update README.md
- [ ] Remove old approach descriptions
- [ ] Add Learning Mode section
- [ ] Update architecture diagram
- [ ] Update quick start guide
- [ ] Add troubleshooting for new approach

### Task 6.2: Update QUICKSTART.md
- [ ] Focus on Learning Mode workflow
- [ ] Remove old extension-only workflow
- [ ] Add Playwright server setup
- [ ] Add example workflow

### Task 6.3: Create New Architecture Doc
- [ ] Document Learning Mode flow
- [ ] Document Auto-Fill flow
- [ ] Document profile caching
- [ ] Document extension fallback mode

## Phase 7: Git Commits

### Commit 1: Add Learning Mode Infrastructure
```bash
git add playwright-server/src/scripts/learning-script.ts
git add playwright-server/src/ProfileCache.ts
git add playwright-server/src/fillers/DropdownFiller.ts
git add playwright-server/src/analyzers/SmartMatcher.ts
git commit -m "feat: add Playwright learning mode infrastructure

- Add learning script that captures form fills on blur
- Add ProfileCache for storing learned profiles
- Add DropdownFiller for robust dropdown handling
- Add SmartMatcher for intelligent field matching"
```

### Commit 2: Add Learning Mode Endpoints
```bash
git add playwright-server/src/server.ts
git commit -m "feat: add /learn-form and /auto-fill endpoints

- /learn-form: Opens browser and learns as user fills
- /auto-fill: Uses cached profile to auto-fill forms
- Both endpoints leave browser open for review"
```

### Commit 3: Update Extension Popup for Learning Mode
```bash
git add extension/popup/popup.html
git add extension/popup/popup.ts
git add extension/popup/popup.css
git commit -m "feat: update popup UI for learning mode

- Add Learn Form button
- Add Auto-Fill button
- Simplify UI to focus on Playwright workflow
- Add section headers for better organization"
```

### Commit 4: Add Documentation
```bash
git add LEARNING-MODE-FLOW.md
git add LEARNING-MODE-GUIDE.md
git commit -m "docs: add learning mode documentation

- Add conceptual flow document
- Add user guide with examples
- Document setup and troubleshooting"
```

### Commit 5: Remove Obsolete Features (After Testing)
```bash
git rm extension/core/ProfileManager.ts
git rm extension/core/PlatformMatcher.ts
git rm extension/core/MCPClient.ts
git rm extension/popup/review-fields.html
git rm extension/popup/review-fields.ts
git rm -r mcp-server/
git rm -r playwright-helper/
git commit -m "refactor: remove obsolete features

- Remove old profile management
- Remove MCP server (not used)
- Remove review fields page
- Clean up unused code"
```

### Commit 6: Remove Obsolete Documentation
```bash
git rm AUTOMATIC-PLAYWRIGHT-FLOW.md
git rm PLAYWRIGHT-HYBRID-TASKS.md
git rm PLAYWRIGHT-SERVER-READY.md
# ... (all the docs listed in Task 2.1)
git commit -m "docs: remove outdated documentation

- Remove old approach documentation
- Keep only relevant docs for learning mode"
```

### Commit 7: Update Core Documentation
```bash
git add README.md
git add QUICKSTART.md
git add INSTALL.md
git commit -m "docs: update core documentation for learning mode

- Update README with new approach
- Simplify quickstart guide
- Update installation instructions"
```

## Summary

**Total Tasks**: ~50
**Estimated Time**: 3-4 hours
**Priority**: High (cleanup before testing)

**Order of Execution**:
1. Make commits for new features (Commits 1-4)
2. Test learning mode thoroughly
3. Remove obsolete features (Commits 5-6)
4. Update documentation (Commit 7)
5. Final testing

This ensures we don't break anything while cleaning up!
