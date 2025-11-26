# Automatic Playwright Flow - Implementation Plan

## Goal
Make Playwright fully automatic:
- **First visit**: Analyze page → Match all fields → Fill everything → Save profile
- **Second visit**: Load profile → Fill instantly → Ready to submit

## Current State vs Target

### Current (Manual)
1. User clicks "Analyze with Playwright"
2. Server analyzes page structure
3. User reviews fields in popup
4. User clicks "Fill with Playwright"
5. Playwright opens browser and fills

### Target (Automatic)
1. User clicks "Auto-Fill with Playwright"
2. System checks if profile exists for this URL
3. **If no profile**: Analyze → Match → Fill → Save profile (all automatic)
4. **If profile exists**: Load profile → Fill instantly
5. Browser opens with everything filled, ready to submit

## Implementation Tasks

### Task 1: Enhanced Profile Storage
**File**: `playwright-server/src/types/profile.ts`

Add to profile:
```typescript
interface SiteProfile {
  url: string;
  platform: string;
  fields: FieldMapping[];  // NEW: Store matched fields with values
  createdAt: string;
  lastUsed: string;
}

interface FieldMapping {
  selector: string;
  label: string;
  type: 'input' | 'select' | 'textarea';
  matchedKey: string;  // e.g., "firstName", "customAnswers.yearsOfExperience"
  value: string;       // The actual value to fill
}
```

### Task 2: Smart Field Matcher in Playwright
**File**: `playwright-server/src/analyzers/SmartMatcher.ts` (NEW)

Port the FieldMatcher logic to Playwright:
- Use same patterns from `FieldMatcher.ts`
- Use field-mappings.json patterns
- Match against personalData + customAnswers
- Return matched fields with values ready to fill

### Task 3: Auto-Fill Endpoint
**File**: `playwright-server/src/server.ts`

New endpoint: `POST /auto-fill`
```typescript
{
  url: string;
  personalData: PersonalData;
  useCache: boolean;  // Check for existing profile
}
```

Flow:
1. Check if profile exists in cache
2. If yes: Load profile → Fill using saved mappings
3. If no: Analyze → Match → Fill → Save profile
4. Return: { success, filled, total, profileSaved }

### Task 4: Profile Cache System
**File**: `playwright-server/src/ProfileCache.ts` (NEW)

Store profiles in JSON file:
```typescript
{
  "greenhouse.io/company-name": {
    url: "...",
    fields: [...],
    createdAt: "...",
    lastUsed: "..."
  }
}
```

Methods:
- `getProfile(url): SiteProfile | null`
- `saveProfile(url, profile): void`
- `deleteProfile(url): void`
- `listProfiles(): SiteProfile[]`

### Task 5: Extension Integration
**File**: `extension/popup/popup.ts`

Replace "Analyze" + "Fill" buttons with single:
```html
<button id="autoFillBtn">🚀 Auto-Fill with Playwright</button>
```

Logic:
1. Click button
2. Call `/auto-fill` endpoint
3. Show progress: "Checking for profile..." → "Analyzing..." → "Filling..."
4. Browser opens with everything filled
5. Show success: "✓ Filled 15/15 fields"

### Task 6: Intelligent Dropdown Handling
**File**: `playwright-server/src/fillers/DropdownFiller.ts` (NEW)

Handle all dropdown types:
- Native `<select>` elements
- Custom dropdowns (click → wait → select)
- Multi-select dropdowns
- Searchable dropdowns (type to filter)

Use Playwright's power:
- `page.selectOption()` for native
- `page.click()` + `page.waitForSelector()` for custom
- Retry logic with exponential backoff

## Detailed Flow

### First Visit Flow
```
User clicks "Auto-Fill" 
  ↓
Extension calls /auto-fill with personalData
  ↓
Server checks cache → No profile found
  ↓
Server navigates to URL
  ↓
Server analyzes all fields (inputs, selects, textareas)
  ↓
Server matches each field:
  - Check customAnswers first (priority)
  - Check standard fields (firstName, email, etc.)
  - Check field-mappings.json patterns
  ↓
Server fills all matched fields
  ↓
Server saves profile to cache
  ↓
Browser stays open for user review
  ↓
Extension shows: "✓ Filled 15/15 fields (profile saved)"
```

### Second Visit Flow
```
User clicks "Auto-Fill"
  ↓
Extension calls /auto-fill with personalData
  ↓
Server checks cache → Profile found!
  ↓
Server navigates to URL
  ↓
Server loads saved field mappings
  ↓
Server fills all fields using saved selectors
  ↓
Browser stays open (instant fill)
  ↓
Extension shows: "✓ Filled 15/15 fields (from cache)"
```

## Key Features

### 1. Smart Matching Priority
```
1. Custom Answers (highest priority)
2. Site-Specific Answers
3. Standard Fields (firstName, email, etc.)
4. Field Mappings (gender, veteran, etc.)
5. Fuzzy Matching (last resort)
```

### 2. Robust Dropdown Handling
```typescript
async fillDropdown(selector, value) {
  // Try native select first
  try {
    await page.selectOption(selector, { label: value });
    return;
  } catch {}
  
  // Try custom dropdown
  await page.click(selector);
  await page.waitForTimeout(500);
  
  // Try clicking option
  await page.click(`text="${value}"`);
  
  // Verify selection
  await page.waitForTimeout(300);
}
```

### 3. Profile Versioning
```typescript
{
  version: 1,
  url: "...",
  fields: [...],
  metadata: {
    createdAt: "...",
    lastUsed: "...",
    fillCount: 5,
    successRate: 100
  }
}
```

## Benefits

1. **One-Click Operation**: User clicks once, everything happens
2. **Instant Second Visits**: Cached profiles fill instantly
3. **No Manual Review**: Fields are pre-matched automatically
4. **Robust Filling**: Playwright handles complex dropdowns
5. **Learning System**: Profiles improve over time

## Testing Checklist

- [ ] First visit to Greenhouse job
- [ ] Second visit to same Greenhouse job (uses cache)
- [ ] First visit to Lever job
- [ ] Custom dropdown handling
- [ ] Multi-select dropdowns
- [ ] File upload fields (skip with message)
- [ ] Profile cache persistence
- [ ] Error handling (server offline)
- [ ] Fallback to extension filling

## Next Steps

1. Implement SmartMatcher.ts (port FieldMatcher logic)
2. Implement ProfileCache.ts (JSON file storage)
3. Update /auto-fill endpoint with matching logic
4. Add DropdownFiller.ts for robust dropdown handling
5. Update extension popup with single button
6. Test on real job applications

Ready to implement?
