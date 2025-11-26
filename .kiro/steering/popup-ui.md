---
inclusion: always
---

# Popup UI Specification

## 🎯 Purpose

The popup is a **dynamic Q&A interface** that:
1. Shows unknown questions from forms
2. Lets you provide answers
3. Saves answers to your personal data JSON
4. Updates immediately without reload

Personal data is stored in a JSON file that grows over time as you encounter new questions.

## 🎨 Popup Layout

### Default View (No Questions)
```
┌─────────────────────────────────────┐
│  🤖 SmartFormFiller                 │
│  ─────────────────────────────────  │
│                                     │
│  Current Page                       │
│  ┌─────────────────────────────┐   │
│  │ 📄 jobs.company.com         │   │
│  │ Status: ✅ 10/10 fields     │   │
│  │ Last filled: 2 seconds ago  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Actions                            │
│  ┌─────────────────────────────┐   │
│  │ 🔄 Fill Form Now            │   │
│  │ 🎓 Learn This Page          │   │
│  │ 📝 Manage Answers (45)      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚙️ Settings  📊 Stats  ℹ️ Help   │
└─────────────────────────────────────┘
```

### Unrecognized Fields View
```
┌─────────────────────────────────────┐
│  🤖 SmartFormFiller                 │
│  ─────────────────────────────────  │
│                                     │
│  Current Page                       │
│  ┌─────────────────────────────┐   │
│  │ 📄 jobs.company.com         │   │
│  │ Status: ⚠️ 7/10 fields      │   │
│  │ 3 unrecognized fields       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ❓ Unrecognized Fields (3)         │
│  ┌─────────────────────────────┐   │
│  │ "Why do you want to work    │   │
│  │  here?"                     │   │
│  │ Type: textarea              │   │
│  │ [+ Add to Answers]          │   │
│  ├─────────────────────────────┤   │
│  │ "Desired salary range"      │   │
│  │ Type: text                  │   │
│  │ [+ Add to Answers]          │   │
│  ├─────────────────────────────┤   │
│  │ "Start date availability"   │   │
│  │ Type: date                  │   │
│  │ [+ Add to Answers]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Fill Known Fields] [Refresh]      │
└─────────────────────────────────────┘
```

### Add Answer Modal
```
┌─────────────────────────────────────┐
│  ➕ Add Answer                       │
│  ─────────────────────────────────  │
│                                     │
│  Question:                          │
│  "Why do you want to work here?"    │
│                                     │
│  Your answer:                       │
│  ┌─────────────────────────────┐   │
│  │ I'm passionate about your   │   │
│  │ company's mission and...    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Save as key:                       │
│  [whyWorkHere_____________]         │
│                                     │
│  Reusable?                          │
│  ○ Yes - Use for all sites          │
│  ○ No - This site only              │
│                                     │
│  [Save & Fill Now] [Cancel]         │
└─────────────────────────────────────┘
```

### Manage Answers View
```
┌─────────────────────────────────────┐
│  🤖 SmartFormFiller                 │
│  ─────────────────────────────────  │
│                                     │
│  📝 Your Answers (45)               │
│  ┌─────────────────────────────┐   │
│  │ Search: [____________]  🔍  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ First Name                  │   │
│  │ John                    [✏️] │   │
│  ├─────────────────────────────┤   │
│  │ Email                       │   │
│  │ john@example.com        [✏️] │   │
│  ├─────────────────────────────┤   │
│  │ Why work here?              │   │
│  │ I'm passionate about... [✏️] │   │
│  ├─────────────────────────────┤   │
│  │ Years of experience         │   │
│  │ 5                       [✏️] │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Add Custom Answer]              │
│  [← Back]                           │
└─────────────────────────────────────┘
```

## 📋 Sections

### 1. Current Page Status
Shows info about the current page:
- URL/domain
- Fill status (e.g., "7/10 fields filled")
- Number of unrecognized fields
- Last action timestamp

### 2. Unrecognized Fields List
Shows each unrecognized field with:
- Question text (from label/placeholder)
- Field type (text, textarea, select, etc.)
- **[+ Add to Answers]** button for each field
- Lets you cherry-pick which fields to save

### 3. Quick Actions
Primary controls:
- **Fill Form Now** - Manually trigger auto-fill
- **Learn This Page** - Force Playwright scan
- **Manage Answers** - View/edit all saved answers

### 4. Answer Management
Full list of saved answers:
- Search/filter functionality
- Edit any answer inline
- Add custom Q&A pairs
- Delete unused answers
- Export/import JSON

### 5. Footer Links
- **Settings** - Configuration options
- **Stats** - View statistics
- **Help** - Documentation

## 🎨 UI Components

### Status Indicators

```typescript
// Status dot colors
interface StatusColors {
  success: '#28a745';  // Green - working
  warning: '#ffc107';  // Yellow - partial
  error: '#dc3545';    // Red - failed
  info: '#007bff';     // Blue - learning
  inactive: '#6c757d'; // Gray - stopped
}
```

### Action Buttons

```typescript
interface ActionButton {
  label: string;
  icon: string;
  action: () => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

const actions: ActionButton[] = [
  {
    label: 'Fill Form Now',
    icon: '🔄',
    action: async () => {
      await chrome.tabs.sendMessage(tabId, { action: 'fill-form' });
    }
  },
  {
    label: 'Learn This Page',
    icon: '🎓',
    action: async () => {
      await triggerPlaywrightScan();
    }
  },
  {
    label: 'Analyze Form',
    icon: '🔍',
    action: async () => {
      await analyzeCurrentForm();
    }
  }
];
```

## 🔧 Functionality

### Load Unrecognized Fields
```typescript
interface UnrecognizedField {
  selector: string;
  label: string;
  type: string;
  placeholder?: string;
  value?: string;
}

async function loadUnrecognizedFields(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) return;
  
  try {
    // Get all fields from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'get-unrecognized-fields'
    });
    
    const fields: UnrecognizedField[] = response.fields;
    
    // Display in popup
    displayUnrecognizedFields(fields);
    
    // Update status
    updateStatus(`⚠️ ${fields.length} unrecognized fields`);
  } catch (error) {
    console.error('Failed to load fields:', error);
  }
}
```

### Add Answer to Personal Data
```typescript
interface NewAnswer {
  key: string;
  value: string;
  question: string;
  reusable: boolean;
  siteSpecific?: string;
}

async function addAnswer(answer: NewAnswer): Promise<void> {
  // Load current personal data
  const personalData = await Storage.get<PersonalData>('personalData') || {};
  
  // Add new answer
  if (answer.reusable) {
    // Add to global answers
    personalData[answer.key] = answer.value;
  } else {
    // Add to site-specific answers
    if (!personalData.siteSpecific) {
      personalData.siteSpecific = {};
    }
    const domain = new URL(answer.siteSpecific!).hostname;
    if (!personalData.siteSpecific[domain]) {
      personalData.siteSpecific[domain] = {};
    }
    personalData.siteSpecific[domain][answer.key] = answer.value;
  }
  
  // Save updated data
  await Storage.set('personalData', personalData);
  
  // Notify content script to refill
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.sendMessage(tab.id, {
      action: 'fill-field',
      key: answer.key,
      value: answer.value
    });
  }
  
  // Update UI
  showNotification('✅ Answer saved and filled!');
  await loadUnrecognizedFields(); // Refresh list
}
```

### Fill Known Fields Only
```typescript
async function fillKnownFields(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) return;
  
  setButtonLoading('fill-known', true);
  
  try {
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'fill-known-fields'
    });
    
    updateStatus(`✅ Filled ${response.filled}/${response.total} fields`);
  } catch (error) {
    updateStatus('❌ Failed to fill form');
  } finally {
    setButtonLoading('fill-known', false);
  }
}
```

### Learn This Page
```typescript
async function learnThisPage(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.url) return;
  
  // Show learning state
  updateStatus('🎓 Learning form...');
  setButtonLoading('learn', true);
  
  try {
    // Call MCP server to scan page
    const response = await fetch('http://localhost:3000/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: tab.url })
    });
    
    const fields = await response.json();
    
    // Update config
    await updateConfig(tab.url, fields);
    
    // Refresh page to test
    await chrome.tabs.reload(tab.id);
    
    updateStatus('✅ Form learned successfully');
  } catch (error) {
    updateStatus('❌ Failed to learn form');
  } finally {
    setButtonLoading('learn', false);
  }
}
```

### Analyze Form
```typescript
async function analyzeForm(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) return;
  
  // Get detected fields from content script
  const response = await chrome.tabs.sendMessage(tab.id, {
    action: 'get-detected-fields'
  });
  
  // Show in popup
  displayDetectedFields(response.fields);
}
```

### MCP Server Control
```typescript
async function startMCPServer(): Promise<void> {
  try {
    // Check if server is already running
    const response = await fetch('http://localhost:3000/health');
    
    if (response.ok) {
      updateMCPStatus('🟢 Running', 'success');
      return;
    }
  } catch {
    // Server not running, try to start it
    updateMCPStatus('🟡 Starting...', 'warning');
    
    // TODO: Start MCP server process
    // This might require a native messaging host
    
    updateMCPStatus('❌ Failed to start', 'error');
  }
}

async function stopMCPServer(): Promise<void> {
  try {
    await fetch('http://localhost:3000/shutdown', { method: 'POST' });
    updateMCPStatus('⚫ Stopped', 'inactive');
  } catch (error) {
    updateMCPStatus('❌ Failed to stop', 'error');
  }
}
```

## 📊 Real-Time Updates

### Status Polling
```typescript
// Poll current page status every 2 seconds
setInterval(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) return;
  
  try {
    const status = await chrome.tabs.sendMessage(tab.id, {
      action: 'get-status'
    });
    
    updatePageStatus(status);
  } catch {
    // Tab not ready or no content script
  }
}, 2000);
```

### MCP Server Health Check
```typescript
// Check MCP server status every 5 seconds
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:3000/health');
    
    if (response.ok) {
      updateMCPStatus('🟢 Running', 'success');
    } else {
      updateMCPStatus('🔴 Error', 'error');
    }
  } catch {
    updateMCPStatus('⚫ Stopped', 'inactive');
  }
}, 5000);
```

## 🎨 Visual Design

### Color Scheme
```css
:root {
  --primary: #667eea;
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
  --info: #007bff;
  --inactive: #6c757d;
  --bg: #ffffff;
  --bg-secondary: #f8f9fa;
  --text: #333333;
  --text-secondary: #6c757d;
  --border: #e0e0e0;
}
```

### Typography
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

h1 { font-size: 18px; font-weight: 600; }
h2 { font-size: 14px; font-weight: 600; }
h3 { font-size: 12px; font-weight: 600; text-transform: uppercase; }
```

### Spacing
```css
.popup {
  width: 360px;
  max-height: 600px;
  padding: 16px;
}

.section {
  margin-bottom: 20px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.button {
  padding: 10px 16px;
  margin: 4px 0;
  border-radius: 6px;
}
```

## 🔗 Navigation

### Settings Link
Opens the full options page:
```typescript
function openSettings(): void {
  chrome.runtime.openOptionsPage();
}
```

### Stats Link
Shows statistics overlay:
```typescript
function showStats(): void {
  // Show modal with:
  // - Total forms filled
  // - Success rate
  // - Sites learned
  // - Time saved
}
```

### Help Link
Opens documentation:
```typescript
function openHelp(): void {
  chrome.tabs.create({
    url: 'https://github.com/yourname/SmartFormFiller/wiki'
  });
}
```

## 📱 Responsive Behavior

### Compact Mode
If popup height is limited:
- Collapse sections
- Show only essential controls
- Use icons instead of text

### Loading States
- Buttons show spinner when processing
- Status updates in real-time
- Disable actions during operations

### Error States
- Show error messages inline
- Provide retry buttons
- Link to troubleshooting

## 🎯 User Flows

### First Time User
```
1. Opens popup
2. Sees "⚙️ Configure personal data first"
3. Clicks "Settings" button
4. Redirected to options page
5. Fills in personal data
6. Returns to popup
7. Sees "✅ Ready to fill forms"
```

### Regular Use
```
1. Visits job application
2. Form auto-fills
3. Opens popup to check status
4. Sees "✅ 10/10 fields filled"
5. Closes popup
6. Reviews and submits form
```

### Learning New Form
```
1. Visits unknown job application
2. Form partially fills (7/10)
3. Opens popup
4. Sees "⚠️ 7/10 fields filled"
5. Clicks "Learn This Page"
6. Waits 10 seconds
7. Page refreshes
8. Sees "✅ 10/10 fields filled"
```

## 🚀 Future Enhancements

### Phase 2
- Form preview (show what will be filled)
- Field-by-field control (enable/disable specific fields)
- Multiple profiles (work vs personal)

### Phase 3
- Application history
- Success rate graphs
- Export/import configs
- Community config sharing
