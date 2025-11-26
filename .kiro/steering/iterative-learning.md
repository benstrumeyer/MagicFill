---
inclusion: always
---

# Iterative Learning System

## 🎯 Core Concept

**The system automatically improves itself by detecting gaps and filling them.**

No user clicks "Learn Form" - it just happens automatically in the background.

## 🔄 The Loop

```
┌─────────────────────────────────────────┐
│ 1. Extension tries to fill form         │
│    Result: 7/10 fields filled (70%)     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Detect unfilled fields                │
│    - 3 fields have no value              │
│    - Get their selectors                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Call MCP: "Scan this page"           │
│    POST http://localhost:3000/scan      │
│    Body: { url, unfilledSelectors }     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. Playwright scans page                │
│    - Finds ALL form fields               │
│    - Generates stable selectors          │
│    - Maps to semantic types              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 5. MCP returns field mappings           │
│    Response: { fields: [...] }          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 6. Extension updates config             │
│    - Merges new fields                   │
│    - Saves to shared/configs/            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 7. Refresh page                          │
│    location.reload()                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 8. Try again with updated config        │
│    Result: 10/10 fields filled (100%)   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 9. Success! Show notification           │
│    "✅ Form Complete! 10/10 fields"     │
└─────────────────────────────────────────┘
```

## 🎯 Key Features

### 1. Automatic Detection
```typescript
// After filling, check what's still empty
const unfilledFields: HTMLElement[] = findUnfilledFields();

if (unfilledFields.length > 0) {
  // Trigger learning automatically
  await triggerPlaywrightScan(unfilledFields);
}
```

### 2. No User Intervention
- User doesn't click anything
- Happens in background
- Shows progress: "🔄 Learning form... 7/10 filled"

### 3. Iterative Improvement
- First try: 70% filled → Scan → Refresh
- Second try: 90% filled → Scan → Refresh
- Third try: 100% filled → Done!
- Max 3 iterations to prevent infinite loops

### 4. Persistent Learning
- Config saved after each iteration
- Next visit: 100% filled immediately
- No re-learning needed

## 📊 Implementation Details

### Extension Side

```typescript
// content.ts
interface FillResult {
  filled: number;
  total: number;
  unfilledFields: HTMLElement[];
}

async function autoFillWithLearning(): Promise<void> {
  let iteration = 0;
  const maxIterations = 3;
  
  while (iteration < maxIterations) {
    // Try to fill
    const personalData = await Storage.get<PersonalData>('personalData');
    if (!personalData) {
      showNotification('⚙️ Configure your data first', 'warning');
      return;
    }
    
    const result = await fillAllFields(personalData);
    
    // Check if complete
    if (result.filled === result.total) {
      showNotification(
        `✅ Form Complete! ${result.filled}/${result.total} fields`,
        'success'
      );
      return;
    }
    
    // Find unfilled fields
    const unfilledFields = findUnfilledFields();
    
    if (unfilledFields.length === 0) {
      // All fields filled, we're done
      break;
    }
    
    // Show learning notification
    showNotification(
      `🔄 Learning form... ${result.filled}/${result.total} filled`,
      'info',
      0
    );
    
    // Trigger Playwright scan
    const newFields = await scanPageWithPlaywright(
      window.location.href,
      unfilledFields
    );
    
    // Update config
    await updateConfig(window.location.href, newFields);
    
    // Refresh and try again
    iteration++;
    if (iteration < maxIterations) {
      location.reload();
      return; // Will restart on page load
    }
  }
  
  // Max iterations reached
  const result = await fillAllFields(personalData);
  showNotification(
    `⚠️ Partially filled: ${result.filled}/${result.total} fields`,
    'warning'
  );
}
```

### MCP Server Side

```typescript
// scan-page.ts
export async function scanPage(url: string, unfilledSelectors: string[]) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Find all form fields
  const allFields = await page.$$eval('input, select, textarea', (elements) => {
    return elements
      .filter(el => {
        // Skip hidden, submit, button
        if (el.type === 'hidden' || el.type === 'submit' || el.type === 'button') {
          return false;
        }
        return true;
      })
      .map(el => {
        // Generate stable selector
        const selector = generateStableSelector(el);
        
        // Get context for semantic matching
        const context = getFieldContext(el);
        
        // Match to semantic type
        const semanticType = matchSemanticType(context);
        
        return {
          selector,
          type: el.type || el.tagName.toLowerCase(),
          semanticType,
          context
        };
      });
  });
  
  await browser.close();
  
  return allFields;
}

function generateStableSelector(element: Element): string {
  // Priority: id > name > unique attribute combo
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.getAttribute('name')) {
    const name = element.getAttribute('name');
    const type = element.getAttribute('type');
    return `${element.tagName.toLowerCase()}[name="${name}"]${type ? `[type="${type}"]` : ''}`;
  }
  
  // Fallback: nth-of-type
  const parent = element.parentElement;
  const siblings = Array.from(parent?.children || []);
  const index = siblings.indexOf(element) + 1;
  return `${element.tagName.toLowerCase()}:nth-of-type(${index})`;
}
```

## 🎨 User Experience

### First Visit (Unknown Form)
```
[Page loads]
Extension: "🔄 Filling form..."
[2 seconds]
Extension: "🔄 Learning form... 7/10 filled"
[5 seconds - Playwright scans]
[Page refreshes]
Extension: "🔄 Filling form..."
[2 seconds]
Extension: "✅ Form Complete! 10/10 fields"
```

**Total time:** ~10 seconds (first time only)

### Return Visit (Learned Form)
```
[Page loads]
Extension: "🔄 Filling form..."
[2 seconds]
Extension: "✅ Form Complete! 10/10 fields"
```

**Total time:** ~2 seconds

## 🔧 Configuration Updates

### Merging Strategy

```typescript
// update-config.ts
function mergeFields(
  existingFields: FormField[],
  newFields: FormField[]
): FormField[] {
  const merged = [...existingFields];
  
  for (const newField of newFields) {
    // Check if field already exists
    const existing = merged.find(f => 
      f.semanticType === newField.semanticType
    );
    
    if (existing) {
      // Update selector if different
      if (existing.selector !== newField.selector) {
        existing.selector = newField.selector;
        existing.foundBy = 'playwright';
        existing.lastUpdated = new Date().toISOString();
      }
    } else {
      // Add new field
      merged.push({
        ...newField,
        foundBy: 'playwright',
        lastFilled: new Date().toISOString()
      });
    }
  }
  
  return merged;
}
```

### Config Evolution

**Initial (Pattern-based):**
```json
{
  "fields": [
    {
      "semanticType": "firstName",
      "selector": "input[name='fname']",
      "found_by": "pattern"
    }
  ],
  "fill_rate": 0.7,
  "scan_iterations": 0
}
```

**After First Scan:**
```json
{
  "fields": [
    {
      "semanticType": "firstName",
      "selector": "#applicant-first-name",
      "found_by": "playwright",
      "last_updated": "2024-01-15T10:35:00Z"
    },
    {
      "semanticType": "middleName",
      "selector": "#applicant-middle-name",
      "found_by": "playwright",
      "last_updated": "2024-01-15T10:35:00Z"
    }
  ],
  "fill_rate": 1.0,
  "scan_iterations": 1
}
```

## 🚫 Edge Cases

### 1. Dynamic Forms
**Problem:** Fields appear after interaction
**Solution:** Scan after each page refresh, not just once

### 2. Infinite Loops
**Problem:** Form keeps changing
**Solution:** Max 3 iterations, then stop

### 3. Slow Pages
**Problem:** Playwright times out
**Solution:** 30-second timeout, show error if fails

### 4. No Unfilled Fields Detected
**Problem:** Fields exist but not detected
**Solution:** Scan entire page, not just unfilled fields

## 📊 Success Metrics

### Per-Site Metrics
- **First visit fill rate:** 70-80% (pattern-based)
- **After 1 scan:** 90-95%
- **After 2 scans:** 95-100%
- **Return visits:** 100%

### Overall Metrics
- **Average scans per site:** 1-2
- **Time to 100%:** <15 seconds
- **Config accuracy:** 95%+
- **Sites learned:** Unlimited

## 🎯 Benefits

1. **Zero user effort** - Happens automatically
2. **Fast learning** - <15 seconds to 100%
3. **Persistent** - Never re-learn same site
4. **Scalable** - Works on any site
5. **Improving** - Gets better over time

## 🔮 Future Enhancements

### Phase 2
- Scan multi-page forms (each page separately)
- Handle dynamic fields (AJAX-loaded)
- Detect field dependencies (e.g., state depends on country)

### Phase 3
- Share configs across users
- Community-verified configs
- Confidence scores per field
