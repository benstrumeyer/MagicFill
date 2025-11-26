---
inclusion: always
---

# SmartFormFiller Product Requirements

## 🎯 Vision

**Enable users to apply to 50+ jobs per day with minimal effort by automatically filling job application forms.**

## 👤 User Persona

**Name:** Ben, Software Engineer
**Goal:** Apply to 100+ jobs while working full-time
**Pain Points:**
- Filling same info 50+ times
- Multi-page forms take 10+ minutes each
- Workday/Greenhouse forms are tedious
- Loses momentum after 5 applications

**Success:** Apply to 50 jobs in 2 hours instead of 8 hours

## 🎯 Core User Flow

### Happy Path (Known Form)
```
1. User finds job posting
2. Clicks "Apply"
3. Extension auto-fills form (2 seconds)
4. Shows: "✅ Form Complete! 10/10 fields"
5. User reviews and clicks Submit
6. Repeat for next job
```

**Time per application:** ~30 seconds

### Learning Path (Unknown Form)
```
1. User finds job posting
2. Clicks "Apply"
3. Extension tries to fill (partial success)
4. Shows: "❓ Filled 3/10 fields. Learn this form?"
5. User clicks "Learn Form"
6. MCP analyzes form (30 seconds)
7. Shows: "✅ Learned! Filling now..."
8. Form is filled completely
9. Next time: Works automatically
```

**Time per application:** ~1 minute (first time), ~30 seconds (after)

## ✅ Phase 1 Requirements (MVP)

### Must Have
- ✅ Auto-fill on page load
- ✅ Manual trigger (Ctrl+Shift+D)
- ✅ Settings popup for personal data
- ✅ Success notification (non-intrusive)
- ✅ Field matching for common fields:
  - First/Last Name
  - Email
  - Phone
  - Address (street, city, state, zip)
  - LinkedIn/GitHub URLs
  - Years of experience
  - Salary expectations
  - Sponsorship/Relocation (yes/no)

### Should Have
- ✅ Visual feedback (highlight filled fields)
- ✅ Failure notification with action
- ✅ Resume file detection
- ✅ Works on LinkedIn, Indeed, Greenhouse

### Nice to Have
- 🔲 Cover letter auto-fill
- 🔲 Custom question detection
- 🔲 Application tracking

### Won't Have (Phase 1)
- ❌ Multi-page forms (Phase 3)
- ❌ AI-powered answers (Phase 4)
- ❌ Form learning (Phase 2)

## ✅ Phase 2 Requirements (Learning System)

### Must Have
- 🔲 MCP server setup
- 🔲 Playwright form analyzer
- 🔲 Save form configurations
- 🔲 Load configurations in extension
- 🔲 "Learn Form" button in notification
- 🔲 Configuration testing/validation

### Should Have
- 🔲 URL pattern matching (e.g., `*.greenhouse.io/*`)
- 🔲 Success rate tracking
- 🔲 Configuration versioning
- 🔲 Re-learn failed forms

### Nice to Have
- 🔲 Share configurations with others
- 🔲 Import/export configs
- 🔲 Community config repository

## ✅ Phase 3 Requirements (Multi-Page)

### Must Have
- 🔲 Detect "Next" buttons
- 🔲 Auto-fill current page
- 🔲 Click "Next" automatically
- 🔲 Detect final page
- 🔲 Progress indicator

### Should Have
- 🔲 Handle Workday flows
- 🔲 Handle Lever flows
- 🔲 Handle Greenhouse flows
- 🔲 Pause before submit option

### Nice to Have
- 🔲 Resume on page refresh
- 🔲 Save progress across sessions

## 🎨 UX Requirements

### Notifications
- **Success:** Green, auto-dismiss in 4 seconds
- **Partial:** Yellow, show "Learn Form" button
- **Error:** Red, show retry option
- **Position:** Top-right corner
- **Style:** Modern, rounded, shadow
- **Animation:** Slide in from right

### Settings Popup
- **Size:** 400px wide, max 600px tall
- **Sections:** Basic Info, Address, Professional, Preferences
- **Validation:** Required fields marked with *
- **Save:** Show "✓ Saved!" confirmation
- **Test:** "Test on Current Page" button

### Visual Feedback
- **Filled fields:** Green background (2 seconds)
- **Failed fields:** Red border (2 seconds)
- **Progress:** Show "Filling 3/10..." during fill

## 🔒 Security Requirements

### Data Storage
- All personal data stored locally (Chrome Storage)
- No external servers (except localhost MCP)
- Configs don't contain personal data
- Resume files referenced by path only

### Permissions
- `storage` - Save personal data
- `activeTab` - Access current page
- `scripting` - Inject content scripts
- `tabs` - Get current tab info
- No network permissions (except localhost)

### Privacy
- No analytics or tracking
- No data sent to external servers
- User can clear all data anytime
- Open source (users can audit)

## 📊 Success Metrics

### Phase 1 Success
- ✅ Fills 70%+ of fields on common sites
- ✅ Works on LinkedIn, Indeed, Greenhouse
- ✅ <2 seconds to fill a form
- ✅ 90%+ user satisfaction

### Phase 2 Success
- ✅ Can learn any form in <30 seconds
- ✅ 95%+ accuracy on learned forms
- ✅ Configs work across similar pages
- ✅ 50+ saved configurations

### Phase 3 Success
- ✅ Handles Workday, Lever, Greenhouse multi-page
- ✅ Auto-continues without user intervention
- ✅ Detects final page correctly 95%+ of time
- ✅ <5 minutes for complex applications

### Overall Success
- ✅ Users apply to 50+ jobs per day
- ✅ 10x faster than manual filling
- ✅ 95%+ form completion rate
- ✅ Works on 90%+ of job sites

## 🚫 Non-Goals

### What We're NOT Building
- ❌ Job search/scraping (user finds jobs manually)
- ❌ Application tracking dashboard (Phase 4)
- ❌ Email follow-ups (Phase 4)
- ❌ Resume customization (Phase 4)
- ❌ Interview scheduling (out of scope)
- ❌ Salary negotiation (out of scope)

### What We're NOT Doing
- ❌ Submitting forms automatically (user reviews first)
- ❌ Bypassing CAPTCHAs (user solves manually)
- ❌ Violating site terms of service
- ❌ Scraping job postings
- ❌ Creating fake applications

## 🎯 User Stories

### As a job seeker, I want to...

**Phase 1:**
- ✅ Have my info auto-filled when I visit a job application
- ✅ Manually trigger auto-fill with a hotkey
- ✅ See which fields were filled successfully
- ✅ Configure my personal data once
- ✅ Know when the extension is working

**Phase 2:**
- 🔲 Teach the extension new forms it doesn't recognize
- 🔲 Have the extension remember forms I've taught it
- 🔲 See which sites the extension knows
- 🔲 Re-learn forms that aren't working

**Phase 3:**
- 🔲 Have multi-page forms filled automatically
- 🔲 See progress through multi-page forms
- 🔲 Pause before final submission
- 🔲 Resume if I close the page

## 📋 Acceptance Criteria

### Phase 1 MVP
```
Given I have configured my personal data
When I visit a job application page
Then the extension should:
  - Detect fillable fields within 2 seconds
  - Fill at least 70% of common fields
  - Show a success notification
  - Highlight filled fields
  - Not interfere with page functionality
```

### Phase 2 Learning
```
Given I encounter an unknown form
When I click "Learn Form"
Then the system should:
  - Open Playwright to analyze the form
  - Identify all fillable fields
  - Map fields to semantic types
  - Save the configuration
  - Fill the form using the new config
  - Work automatically on next visit
```

### Phase 3 Multi-Page
```
Given I'm on a multi-page application
When I trigger auto-fill
Then the system should:
  - Fill the current page
  - Detect the "Next" button
  - Click "Next" automatically
  - Fill the next page
  - Repeat until final page
  - Show progress indicator
  - Pause before final submit
```

## 🎨 Design Principles

1. **Non-intrusive** - Never block the user
2. **Fast** - Fill forms in <2 seconds
3. **Transparent** - Show what was filled
4. **Recoverable** - Easy to undo/retry
5. **Learning** - Gets better over time
6. **Privacy-first** - All data stays local
7. **Manual control** - User always in charge

## 📚 Technical Constraints

### Chrome Extension
- Must work in Chrome/Edge/Brave
- Manifest V3 only
- No external dependencies
- <1MB total size
- Works offline (except learning)

### MCP Server
- Runs on localhost only
- TypeScript + Node.js
- Playwright for automation
- File-based storage
- <100MB memory usage

### Performance
- Auto-fill in <2 seconds
- Learning in <30 seconds
- No page lag or freezing
- Minimal CPU usage

## 🔄 Future Phases (Post-MVP)

### Phase 4: Intelligence
- AI-powered question answering
- Custom cover letter generation
- Job description analysis
- Application tracking dashboard

### Phase 5: Scale
- Mobile app (React Native)
- Team features (share configs)
- Analytics dashboard
- Success rate optimization


