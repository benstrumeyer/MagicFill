# Data Persistence Flow - How Fields Are Saved Permanently

## TL;DR
**Yes, data persists between extension reloads!** All data is stored in `chrome.storage.local`, which is permanent browser storage that survives:
- Extension reloads
- Browser restarts
- Extension updates
- Computer restarts

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: User Learns Form                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ content.ts: learnForm()                                    │ │
│  │ • Scans page for unrecognized fields                       │ │
│  │ • Creates array of learned fields                          │ │
│  │ • Stores in sessionStorage (TEMPORARY)                     │ │
│  │   sessionStorage.setItem('learnedFields', JSON.stringify)  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Review Fields Page Opens                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ review-fields.ts: init()                                   │ │
│  │ • Reads from sessionStorage (TEMPORARY)                    │ │
│  │   const fieldsData = sessionStorage.getItem('learnedFields')│ │
│  │ • Displays fields for user review                          │ │
│  │ • User can remove fields with − button                     │ │
│  │ • User fills in answers                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: User Clicks "Save All Answers"                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ review-fields.ts: saveAllAnswers()                         │ │
│  │                                                             │ │
│  │ for (const field of this.fields) {                         │ │
│  │   if (field.value.trim()) {                                │ │
│  │     await this.storage.addAnswer(                          │ │
│  │       field.key,                                           │ │
│  │       field.value,                                         │ │
│  │       false  // not site-specific                          │ │
│  │     );                                                      │ │
│  │   }                                                         │ │
│  │ }                                                           │ │
│  │                                                             │ │
│  │ // Clear temporary storage                                 │ │
│  │ sessionStorage.removeItem('learnedFields');                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Storage.addAnswer() - PERMANENT STORAGE                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Storage.ts: addAnswer()                                    │ │
│  │                                                             │ │
│  │ 1. Get current data from chrome.storage.local:            │ │
│  │    const data = await this.getPersonalData();             │ │
│  │                                                             │ │
│  │ 2. Add new field to customAnswers:                        │ │
│  │    data.customAnswers[key] = value;                       │ │
│  │                                                             │ │
│  │ 3. Save back to chrome.storage.local (PERMANENT):         │ │
│  │    await this.setPersonalData(data);                      │ │
│  │                                                             │ │
│  │    ↓                                                        │ │
│  │    chrome.storage.local.set({ personalData: data })       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Data Stored in Chrome Storage (PERMANENT)              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ chrome.storage.local                                       │ │
│  │ {                                                           │ │
│  │   "personalData": {                                        │ │
│  │     "firstName": "John",                                   │ │
│  │     "lastName": "Doe",                                     │ │
│  │     "email": "john@example.com",                           │ │
│  │     ...                                                     │ │
│  │     "customAnswers": {                                     │ │
│  │       "preferredWorkLocation": "Remote",  ← SAVED HERE!   │ │
│  │       "yearsOfExperience": "5",           ← SAVED HERE!   │ │
│  │       "willingToRelocate": "No"           ← SAVED HERE!   │ │
│  │     },                                                      │ │
│  │     "siteSpecificAnswers": {}                              │ │
│  │   }                                                         │ │
│  │ }                                                           │ │
│  │                                                             │ │
│  │ ✅ PERSISTS ACROSS:                                        │ │
│  │    • Extension reloads                                     │ │
│  │    • Browser restarts                                      │ │
│  │    • Computer restarts                                     │ │
│  │    • Extension updates                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Manage Page Loads Data (READS FROM PERMANENT STORAGE)  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ manage.ts: init()                                          │ │
│  │                                                             │ │
│  │ 1. Load from chrome.storage.local:                        │ │
│  │    this.personalData = await this.storage.getPersonalData()│ │
│  │                                                             │ │
│  │ 2. Display in UI:                                          │ │
│  │    this.loadCustomAnswers();                              │ │
│  │                                                             │ │
│  │ 3. Shows all saved fields with edit/delete buttons        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Storage Layers Explained

### 1. **Temporary Storage** (sessionStorage)
- **Used for:** Transferring data from content script to review page
- **Lifetime:** Only until review page closes
- **Purpose:** Hold learned fields during review process
- **Cleared:** After user clicks "Save All Answers"

```javascript
// In content.ts
sessionStorage.setItem('learnedFields', JSON.stringify(learnedFields));

// In review-fields.ts
const fieldsData = sessionStorage.getItem('learnedFields');
// ... user reviews ...
sessionStorage.removeItem('learnedFields'); // Cleared after save
```

### 2. **Permanent Storage** (chrome.storage.local)
- **Used for:** All saved personal data and custom answers
- **Lifetime:** PERMANENT (until user clears browser data or uninstalls extension)
- **Purpose:** Store all user data persistently
- **API:** Chrome Extension Storage API

```javascript
// Writing (in Storage.ts)
chrome.storage.local.set({ personalData: data }, () => {
  // Data is now saved permanently
});

// Reading (in Storage.ts)
chrome.storage.local.get(['personalData'], (result) => {
  const data = result.personalData; // Retrieves saved data
});
```

## Code Flow with Line Numbers

### 1. Review Fields Save (review-fields.ts)
```typescript
// Line ~60-70
private async saveAllAnswers() {
  let saved = 0;
  
  // Loop through all fields user wants to save
  for (const field of this.fields) {
    if (field.value.trim()) {
      // THIS SAVES TO PERMANENT STORAGE ↓
      await this.storage.addAnswer(field.key, field.value, false);
      saved++;
    }
  }
  
  // Clear temporary storage
  sessionStorage.removeItem('learnedFields');
  
  alert(`✅ Saved ${saved} answers!`);
  window.close();
}
```

### 2. Storage Add Answer (Storage.ts)
```typescript
// Line ~80-100
async addAnswer(key: string, value: string, siteSpecific: boolean = false): Promise<void> {
  // 1. Get current data from PERMANENT storage
  const data = await this.getPersonalData();
  
  if (!data.customAnswers) {
    data.customAnswers = {};
  }
  
  if (siteSpecific) {
    // Save to site-specific section
    const hostname = window.location.hostname;
    if (!data.siteSpecificAnswers) {
      data.siteSpecificAnswers = {};
    }
    if (!data.siteSpecificAnswers[hostname]) {
      data.siteSpecificAnswers[hostname] = {};
    }
    data.siteSpecificAnswers[hostname][key] = value;
  } else {
    // Save to custom answers section
    data.customAnswers[key] = value;  // ← NEW FIELD ADDED HERE
  }
  
  // 2. Write back to PERMANENT storage
  await this.setPersonalData(data);  // ← SAVES TO chrome.storage.local
}
```

### 3. Storage Set Personal Data (Storage.ts)
```typescript
// Line ~45-47
async setPersonalData(data: PersonalData): Promise<void> {
  // THIS IS THE ACTUAL PERMANENT SAVE ↓
  await this.set('personalData', data);
}

// Line ~18-24
async set<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    // CHROME STORAGE API - PERMANENT! ↓
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}
```

### 4. Manage Page Load (manage.ts)
```typescript
// Line ~20-30
private async init() {
  // Load from PERMANENT storage ↓
  this.personalData = await this.storage.getPersonalData();
  
  // Display in UI
  this.loadPersonalDataTab();
  this.updateStats();
}

// Line ~150-180
private loadCustomAnswers() {
  if (!this.personalData?.customAnswers) return;
  
  const answers = Object.entries(this.personalData.customAnswers);
  
  // Display each saved field with edit/delete buttons
  answers.forEach(([key, value]) => {
    // ... create UI elements ...
  });
}
```

## Data Structure in Chrome Storage

```javascript
// What's actually stored in chrome.storage.local
{
  "personalData": {
    // Built-in fields
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "address": "123 Main St",
    // ... more built-in fields ...
    
    // Custom answers from Learn Form ← YOUR NEW FIELDS GO HERE
    "customAnswers": {
      "preferredWorkLocation": "Remote",
      "yearsOfExperience": "5",
      "willingToRelocate": "No",
      "expectedSalary": "$100,000",
      "availableStartDate": "Immediately"
    },
    
    // Site-specific answers
    "siteSpecificAnswers": {
      "linkedin.com": {
        "customField1": "value1"
      },
      "indeed.com": {
        "customField2": "value2"
      }
    }
  }
}
```

## Verification: Data Persists

You can verify data persistence yourself:

### Method 1: Chrome DevTools
```
1. Load extension
2. Add some custom answers
3. Open Chrome DevTools (F12)
4. Go to: Application tab → Storage → Extension Storage → your extension
5. See "personalData" key with all your data
6. Reload extension
7. Data is still there!
```

### Method 2: Export/Import
```
1. Add custom answers
2. Click "Export" in Manage page
3. Uninstall extension
4. Reinstall extension
5. Click "Import" and paste exported data
6. All data restored!
```

### Method 3: Browser Restart
```
1. Add custom answers
2. Close Chrome completely
3. Restart Chrome
4. Open Manage page
5. All data is still there!
```

## Summary

**Storage Type:** `chrome.storage.local` (Chrome Extension Storage API)

**Persistence:** ✅ PERMANENT
- Survives extension reloads
- Survives browser restarts
- Survives computer restarts
- Only cleared if user explicitly clears browser data or uninstalls extension

**Data Flow:**
1. Learn Form → sessionStorage (temporary)
2. Review Fields → reads sessionStorage
3. Save All Answers → writes to chrome.storage.local (PERMANENT)
4. Manage Page → reads from chrome.storage.local (PERMANENT)
5. Auto-Fill → reads from chrome.storage.local (PERMANENT)

**Your data is safe and will persist between unpacks!** 🎉
