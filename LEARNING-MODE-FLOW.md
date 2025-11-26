# Learning Mode Flow - The Better Approach

## The Idea
Instead of trying to auto-match and fill, let Playwright **watch you fill** the form and learn from it.

## User Flow

### First Visit (Learning Mode)
```
1. User clicks "Learn Form" in extension popup
2. Playwright opens the job application page (visible browser)
3. User fills out the form manually
4. As user fills each field:
   - On blur event → Playwright captures field selector + value
   - Shows subtle indicator: "✓ Learned"
5. User clicks "Next" or "Submit" when done
6. Playwright saves the complete profile
7. Extension shows: "✓ Learned 15 fields for this site"
```

### Second Visit (Auto-Fill Mode)
```
1. User clicks "Auto-Fill" in extension popup
2. Playwright opens the page
3. Playwright fills ALL fields using learned profile
4. Takes 2-3 seconds, everything is filled
5. User reviews and clicks Submit
```

## Technical Implementation

### New Endpoint: `/learn-form`
```typescript
POST /learn-form
{
  url: string
}

Response:
{
  success: true,
  message: "Learning mode active. Fill the form and we'll learn!"
}
```

**What it does:**
1. Opens visible browser to the URL
2. Injects a learning script into the page
3. Script listens for blur events on all form fields
4. Captures: selector, label, value on each blur
5. Sends captured data back to server via WebSocket or polling
6. Server saves profile when user closes browser or clicks "Done"

### Learning Script (Injected into Page)
```javascript
// Injected into the Playwright page
const learnedFields = [];

// Listen to all form fields
document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('blur', () => {
    if (field.value) {
      const fieldData = {
        selector: generateSelector(field),
        label: getFieldLabel(field),
        value: field.value,
        type: field.tagName.toLowerCase(),
        inputType: field.type
      };
      
      learnedFields.push(fieldData);
      
      // Show visual feedback
      field.style.border = '2px solid green';
      
      // Send to server
      sendToServer(fieldData);
      
      console.log('✓ Learned:', fieldData.label, '=', fieldData.value);
    }
  });
});

// Also capture on form submit
document.addEventListener('submit', (e) => {
  // Capture any remaining fields
  saveProfile();
});
```

### Profile Structure
```json
{
  "url": "https://boards.greenhouse.io/company/jobs/123",
  "platform": "greenhouse",
  "learnedAt": "2024-01-15T10:30:00Z",
  "fields": [
    {
      "selector": "input[name='first_name']",
      "label": "First Name",
      "value": "John",
      "type": "input",
      "inputType": "text"
    },
    {
      "selector": "select[name='years_experience']",
      "label": "Years of Experience",
      "value": "5-7 years",
      "type": "select"
    },
    {
      "selector": "#custom_question_123",
      "label": "Why do you want to work here?",
      "value": "I'm passionate about...",
      "type": "textarea"
    }
  ]
}
```

## Implementation Files

### 1. Server Endpoint
**File:** `playwright-server/src/server.ts`

```typescript
app.post('/learn-form', async (req, res) => {
  const { url } = req.body;
  
  // Launch visible browser
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Navigate to URL
  await page.goto(url);
  
  // Inject learning script
  await page.addScriptTag({
    content: LEARNING_SCRIPT
  });
  
  // Set up listener for learned fields
  const learnedFields = [];
  
  await page.exposeFunction('captureField', (fieldData) => {
    learnedFields.push(fieldData);
    console.log('✓ Learned:', fieldData.label);
  });
  
  // Wait for user to close browser or click done
  page.on('close', async () => {
    // Save profile
    profileCache.saveProfile(url, 'learned', learnedFields);
    console.log(`💾 Saved profile with ${learnedFields.length} fields`);
  });
  
  res.json({
    success: true,
    message: 'Learning mode active'
  });
});
```

### 2. Learning Script
**File:** `playwright-server/src/scripts/learning-script.ts`

```typescript
export const LEARNING_SCRIPT = `
(function() {
  const learnedFields = new Set();
  
  function generateSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.name) return el.tagName.toLowerCase() + '[name="' + el.name + '"]';
    // ... more selector logic
  }
  
  function getFieldLabel(el) {
    // Get label text
    if (el.id) {
      const label = document.querySelector('label[for="' + el.id + '"]');
      if (label) return label.textContent.trim();
    }
    return el.placeholder || el.name || el.id || 'Unknown';
  }
  
  function captureField(field) {
    const selector = generateSelector(field);
    
    // Don't capture same field twice
    if (learnedFields.has(selector)) return;
    learnedFields.add(selector);
    
    const fieldData = {
      selector,
      label: getFieldLabel(field),
      value: field.value,
      type: field.tagName.toLowerCase(),
      inputType: field.type || undefined
    };
    
    // Send to Playwright
    window.captureField(fieldData);
    
    // Visual feedback
    field.style.boxShadow = '0 0 5px green';
    setTimeout(() => {
      field.style.boxShadow = '';
    }, 1000);
  }
  
  // Listen to all form fields
  document.addEventListener('blur', (e) => {
    const field = e.target;
    if ((field.tagName === 'INPUT' || field.tagName === 'TEXTAREA' || field.tagName === 'SELECT') 
        && field.value) {
      captureField(field);
    }
  }, true);
  
  // Also capture on change for selects
  document.addEventListener('change', (e) => {
    const field = e.target;
    if (field.tagName === 'SELECT' && field.value) {
      captureField(field);
    }
  }, true);
  
  console.log('🎓 Learning mode active - fill the form and I will learn!');
})();
`;
```

### 3. Extension Integration
**File:** `extension/popup/popup.ts`

Add two buttons:
```typescript
// Learn Form button
document.getElementById('learnBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  showStatus('Starting learning mode...');
  
  const response = await fetch('http://localhost:3000/learn-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: tab.url })
  });
  
  showStatus('🎓 Learning mode active! Fill the form and close the browser when done.');
});

// Auto-Fill button (uses learned profile)
document.getElementById('autoFillBtn').addEventListener('click', async () => {
  // ... existing auto-fill logic
});
```

## Benefits of This Approach

1. **No Guessing**: You fill it, it learns exactly what you entered
2. **Handles Anything**: Complex dropdowns, custom fields, weird questions - you handle them naturally
3. **Perfect Accuracy**: It replays exactly what you did
4. **Fast Learning**: One time through the form, it's learned
5. **Visual Feedback**: See green highlights as it learns each field
6. **Works Everywhere**: Greenhouse, Lever, Workday, custom sites - doesn't matter

## User Experience

### Learning Mode
```
Extension Popup:
┌─────────────────────────────┐
│ MagicFill                   │
├─────────────────────────────┤
│ 🎓 Learn This Form          │  ← Click this first time
│ 🚀 Auto-Fill (No profile)   │  ← Disabled until learned
└─────────────────────────────┘

After clicking "Learn":
- Playwright browser opens
- You fill the form normally
- Green flash on each field as it learns
- Close browser when done
- Profile saved automatically
```

### Auto-Fill Mode
```
Extension Popup:
┌─────────────────────────────┐
│ MagicFill                   │
├─────────────────────────────┤
│ ✓ Profile exists (15 fields)│
│ 🚀 Auto-Fill                │  ← Click to auto-fill
│ 🔄 Re-Learn                 │  ← Update profile
└─────────────────────────────┘

After clicking "Auto-Fill":
- Playwright opens
- Fills all 15 fields in 3 seconds
- Browser stays open for review
- You click Submit
```

## Next Steps

1. Implement `/learn-form` endpoint
2. Create learning script with blur listeners
3. Add profile saving on browser close
4. Update extension popup with Learn/Auto-Fill buttons
5. Test on a real job application

This is WAY simpler and more reliable than trying to auto-match fields!

Want me to implement this?
