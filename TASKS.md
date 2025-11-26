# MagicFill ✨ - Development Tasks

## 📋 Phase 1: Core Extension (Week 1-2)

### Setup & Infrastructure
- [x] Initialize project structure
- [x] Setup TypeScript with Webpack
- [x] Configure tsconfig.json (strict mode)
- [x] Setup webpack.config.js for extension bundling
- [x] Create manifest.json (Manifest V3)
- [x] Setup shared types in `shared/types/`
- [x] Create .gitignore
- [x] Initialize package.json with dependencies

### Type Definitions
- [x] Create `PersonalData` interface
- [x] Create `FormField` interface
- [x] Create `FormConfig` interface
- [x] Create `ExtensionMessage` types
- [x] Create `UnrecognizedField` interface
- [x] Export all types from `shared/types/index.ts`

### Field Matching Engine
- [x] Create `FieldMatcher.ts` class
- [x] Implement pattern matching (firstName, lastName, email, etc.)
- [x] Implement `getFieldContext()` - extract label/placeholder/name/id
- [x] Implement `matchField()` - match context to semantic type
- [x] Implement `findAllFields()` - scan page for fillable fields
- [x] Add 20+ common field patterns
- [ ] Test on LinkedIn, Indeed, Greenhouse

### Form Filler
- [x] Create `FormFiller.ts` class
- [x] Implement `fillField()` - fill single field
- [x] Handle text inputs
- [x] Handle textareas
- [x] Handle select dropdowns
- [x] Handle radio buttons
- [x] Handle checkboxes
- [x] Handle date inputs
- [x] Implement `fillAllFields()` - fill entire form
- [x] Add visual feedback (highlight filled fields)
- [x] Return fill results (filled/total counts)

### Storage System
- [x] Create `Storage.ts` wrapper class
- [x] Implement type-safe `get<T>()` method
- [x] Implement type-safe `set<T>()` method
- [x] Create default personal data structure
- [x] Implement `getPersonalData()`
- [x] Implement `setPersonalData()`
- [x] Implement `addAnswer()` - add new answer dynamically
- [x] Handle site-specific answers

### Content Script
- [x] Create `content.ts` main entry point
- [x] Auto-fill on page load (with delay for dynamic content)
- [x] Listen for messages from background script
- [x] Implement `handleFillForm()` action
- [x] Implement `getUnrecognizedFields()` action
- [x] Implement `fillField()` action (single field)
- [x] Send unrecognized fields to popup
- [x] Show non-intrusive notifications
- [x] Add mutation observer for dynamic forms

### Background Script
- [x] Create `background.ts`
- [x] Listen for keyboard shortcuts
- [x] Handle `fill-form` command (Ctrl+Shift+F)
- [x] Forward messages to content script
- [ ] Handle `learn-form` requests
- [x] Manage extension state

### Popup UI
- [x] Create `popup.html` structure
- [x] Create `popup.css` styling
- [x] Create `popup.ts` logic
- [x] Show current page status
- [x] Display unrecognized fields list
- [x] Add "+ Add to Answers" button for each field
- [x] Create "Add Answer" modal
- [x] Implement answer key auto-generation
- [x] Add reusable vs site-specific toggle
- [x] Implement "Save & Fill Now" functionality
- [x] Add "Fill Known Fields" button
- [x] Add "Manage Answers" link
- [x] Real-time status updates (polling)

### Manage Answers Screen
- [x] Create answers management UI
- [x] List all saved answers
- [x] Add search/filter functionality
- [x] Edit existing answers
- [x] Delete answers
- [x] Export personal data JSON
- [x] Import personal data JSON
- [x] Show statistics (total answers, sites configured)

### Testing
- [ ] Test on LinkedIn job applications
- [ ] Test on Indeed applications
- [ ] Test on Greenhouse applications
- [ ] Test on Lever applications
- [ ] Test field matching accuracy
- [ ] Test dynamic answer addition
- [ ] Test site-specific answers
- [ ] Test with 10+ different job sites

### Documentation
- [x] Write README.md
- [ ] Write QUICKSTART.md
- [ ] Document personal data JSON structure
- [x] Create example personal-data.json
- [x] Add inline code comments
- [ ] Create troubleshooting guide

---

## 📋 Phase 2: MCP Learning System (Week 3-4)

### MCP Server Setup
- [ ] Initialize MCP server project
- [ ] Setup TypeScript + Node.js
- [ ] Install Playwright
- [ ] Create HTTP server (Express)
- [ ] Setup CORS for localhost
- [ ] Create health check endpoint
- [ ] Add error handling middleware

### Page Scanner
- [ ] Create `scan-page.ts`
- [ ] Implement Playwright page navigation
- [ ] Extract all form fields (inputs, selects, textareas)
- [ ] Generate stable selectors (id > name > nth-of-type)
- [ ] Get field context (labels, placeholders)
- [ ] Match fields to semantic types
- [ ] Return field mappings as JSON
- [ ] Handle timeouts gracefully
- [ ] Handle dynamic content (wait for load)

### Config Management
- [ ] Create `update-config.ts`
- [ ] Implement config merging logic
- [ ] Save configs to `shared/configs/`
- [ ] Load existing configs
- [ ] Update existing configs with new fields
- [ ] Track scan iterations
- [ ] Track fill rate
- [ ] Add metadata (learned_at, last_updated)

### Extension Integration
- [ ] Add MCP server URL to extension config
- [ ] Implement `callMCPScan()` in content script
- [ ] Detect unfilled fields after auto-fill
- [ ] Trigger MCP scan automatically
- [ ] Receive field mappings from MCP
- [ ] Update local config
- [ ] Refresh page automatically
- [ ] Retry fill with new config
- [ ] Implement max iterations (3)
- [ ] Show learning progress notifications

### Iterative Learning Loop
- [ ] Implement learning loop in content script
- [ ] Track iteration count
- [ ] Stop after 100% fill or max iterations
- [ ] Show progress: "🔄 Learning... 7/10 filled"
- [ ] Update config after each iteration
- [ ] Test on unknown forms
- [ ] Verify 100% fill rate after learning

### Testing
- [ ] Test MCP server startup
- [ ] Test page scanning on various sites
- [ ] Test selector generation
- [ ] Test config merging
- [ ] Test iterative learning loop
- [ ] Test with 5+ unknown forms
- [ ] Verify configs are reusable

### Documentation
- [ ] Document MCP server API
- [ ] Write MCP setup guide
- [ ] Document iterative learning flow
- [ ] Add troubleshooting for MCP issues

---

## 📋 Phase 3: Multi-Page & Polish (Week 5-6)

### Multi-Page Detection
- [ ] Implement `findNextButton()` in content script
- [ ] Detect "Next", "Continue", "Save & Continue" buttons
- [ ] Exclude "Previous", "Back" buttons
- [ ] Implement `findSubmitButton()`
- [ ] Implement `isLastPage()` check

### Multi-Page Flow
- [ ] Fill current page
- [ ] Click "Next" button automatically
- [ ] Wait for next page to load
- [ ] Scan new page for fields
- [ ] Fill next page
- [ ] Repeat until last page
- [ ] Show progress indicator
- [ ] Handle Workday multi-page forms
- [ ] Handle Lever multi-page forms
- [ ] Handle Greenhouse multi-page forms

### Enhanced Notifications
- [ ] Improve notification styling
- [ ] Add action buttons to notifications
- [ ] Show progress during multi-page
- [ ] Add sound effects (optional)
- [ ] Add desktop notifications (optional)

### Config Management UI
- [ ] Create config viewer in popup
- [ ] Show all learned sites
- [ ] Show fields per site
- [ ] Show fill rate per site
- [ ] Edit configs
- [ ] Delete configs
- [ ] Export/import configs
- [ ] Share configs (optional)

### Statistics & Analytics
- [ ] Track total forms filled
- [ ] Track success rate
- [ ] Track time saved
- [ ] Track sites learned
- [ ] Show stats in popup
- [ ] Create stats dashboard
- [ ] Export stats as CSV

### Resume Upload
- [ ] Detect file upload fields
- [ ] Show notification for manual upload
- [ ] Store resume file path
- [ ] Auto-select resume file (if possible)

### Polish & UX
- [ ] Improve popup animations
- [ ] Add loading states
- [ ] Add error states
- [ ] Improve mobile responsiveness (popup)
- [ ] Add keyboard shortcuts
- [ ] Add tooltips
- [ ] Improve accessibility (ARIA labels)

### Testing
- [ ] Test multi-page forms (Workday, Lever, Greenhouse)
- [ ] Test on 20+ different job sites
- [ ] Test edge cases (dynamic forms, AJAX)
- [ ] Test performance (large forms)
- [ ] User testing with 5+ people

### Documentation
- [ ] Update README with all features
- [ ] Create video demo
- [ ] Write blog post
- [ ] Create FAQ
- [ ] Add screenshots

---

## 📋 Phase 4: Mobile App (Week 7-10)

### React Native Setup
- [ ] Initialize React Native project (Expo or bare)
- [ ] Setup TypeScript
- [ ] Install dependencies (WebView, Navigation, AsyncStorage)
- [ ] Setup folder structure
- [ ] Configure iOS build
- [ ] Configure Android build

### WebView Browser
- [ ] Create `BrowserScreen.tsx`
- [ ] Implement WebView component
- [ ] Inject form filler JavaScript
- [ ] Handle messages from WebView
- [ ] Send messages to WebView
- [ ] Handle navigation
- [ ] Add loading indicator

### Form Filler (Mobile)
- [ ] Port form filler code to injected JS
- [ ] Implement field matching
- [ ] Implement form filling
- [ ] Send results to React Native
- [ ] Handle errors

### Floating Button
- [ ] Create `FloatingFillButton.tsx`
- [ ] Position at bottom of screen
- [ ] Show different states (ready, filling, complete, partial)
- [ ] Animate slide-in
- [ ] Handle tap events
- [ ] Show fill progress

### Unrecognized Fields Sheet
- [ ] Create `UnrecognizedFieldsSheet.tsx`
- [ ] Slide up from bottom
- [ ] List unrecognized fields
- [ ] Add "+ Add Answer" buttons
- [ ] Implement add answer modal
- [ ] Save answers to AsyncStorage
- [ ] Fill fields immediately after adding

### Personal Data Management
- [ ] Create `AnswersScreen.tsx`
- [ ] List all saved answers
- [ ] Search/filter answers
- [ ] Edit answers
- [ ] Delete answers
- [ ] Export/import JSON

### Home Screen
- [ ] Create `HomeScreen.tsx`
- [ ] Quick links to job sites
- [ ] Recent applications list
- [ ] Statistics summary
- [ ] Settings link

### Cloud Sync (Optional)
- [ ] Setup Supabase
- [ ] Implement sync service
- [ ] Upload personal data
- [ ] Download personal data
- [ ] Conflict resolution
- [ ] Sync with desktop extension

### Testing
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Test WebView injection
- [ ] Test form filling
- [ ] Test on LinkedIn mobile
- [ ] Test on Indeed mobile
- [ ] User testing

### App Store Submission
- [ ] Create app icons
- [ ] Create screenshots
- [ ] Write app description
- [ ] Submit to Apple App Store
- [ ] Submit to Google Play Store

### Documentation
- [ ] Write mobile app README
- [ ] Create mobile demo video
- [ ] Update main README

---

## 🎯 Priority Order

### Must Have (Phase 1)
1. Field matching engine
2. Form filler
3. Popup UI with unrecognized fields
4. Dynamic answer addition
5. Personal data JSON storage

### Should Have (Phase 2)
6. MCP server
7. Playwright page scanner
8. Iterative learning loop
9. Config management

### Nice to Have (Phase 3)
10. Multi-page support
11. Statistics
12. Config management UI
13. Resume upload

### Future (Phase 4)
14. Mobile app
15. Cloud sync
16. Community configs

---

## 📊 Success Criteria

### Phase 1
- ✅ Fills 70%+ of fields on common sites
- ✅ Works on LinkedIn, Indeed, Greenhouse
- ✅ Can add new answers without reload
- ✅ <2 seconds to fill a form

### Phase 2
- ✅ Can learn any form in <30 seconds
- ✅ Reaches 100% fill rate after learning
- ✅ Configs work on return visits
- ✅ 95%+ accuracy

### Phase 3
- ✅ Handles Workday, Lever, Greenhouse multi-page
- ✅ Auto-continues without user intervention
- ✅ Detects final page correctly
- ✅ <5 minutes for complex applications

### Phase 4
- ✅ Works on iOS and Android
- ✅ Same fill rate as desktop
- ✅ <1 minute per application on mobile
- ✅ Cloud sync works reliably

---

## 🚀 Getting Started

1. Start with Phase 1, Task 1: "Initialize project structure"
2. Work through tasks sequentially
3. Test after each major feature
4. Move to next phase when deliverable is complete
5. Iterate based on user feedback

**Estimated Total Time:** 10 weeks (2.5 months)
**Estimated Effort:** 200-300 hours
