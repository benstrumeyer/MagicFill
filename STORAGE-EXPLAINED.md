# Storage Architecture Explained

## Two Storage Systems

### 1. Platform Profiles (Reusable)
**Purpose:** Store analysis for entire platform (all jobs on Greenhouse, Lever, etc.)
**Location:** `chrome.storage.local['siteProfiles']`
**Managed by:** `ProfileManager`

```javascript
{
  "siteProfiles": {
    "greenhouse": {
      "platform": "greenhouse",
      "url": "https://job-boards.greenhouse.io/...",
      "timestamp": "2024-01-15T10:30:00Z",
      "fields": { /* 20 fields */ },
      "totalFields": 20,
      "hasMultiPage": true,
      "customDropdownCount": 3
    },
    "lever": { /* ... */ },
    "workday": { /* ... */ }
  }
}
```

**Use Case:** Apply to 100 Greenhouse jobs → Analyze once, use 100 times

---

### 2. Analysis States (Per-URL)
**Purpose:** Track if THIS SPECIFIC page was analyzed
**Location:** `chrome.storage.local['analysisStates']`
**Managed by:** `Storage.getAnalysisState()` / `setAnalysisState()`

```javascript
{
  "analysisStates": {
    "https://job-boards.greenhouse.io/company/jobs/123": {
      "url": "https://...",
      "status": "completed",  // or "analyzing" or "failed"
      "startTime": 1705334400000,
      "profile": { /* full profile */ }
    },
    "https://jobs.lever.co/company/job-456": {
      "url": "https://...",
      "status": "analyzing",
      "startTime": 1705334500000
    }
  }
}
```

**Use Case:** Know if you already analyzed THIS specific job posting

---

## Why Both?

| Feature | Platform Profiles | Analysis States |
|---------|------------------|-----------------|
| **Scope** | All jobs on platform | This specific URL |
| **Purpose** | Reusable filling logic | Track what's been done |
| **Lifetime** | Permanent (until cleared) | Per-session or permanent |
| **Shows** | How to fill forms | What's been analyzed |

---

## Visual Indicators

### When Page NOT Scanned
```
Platform: Greenhouse
No profile

[Analyze & Fill] button visible
```

### When Page IS Scanned
```
Platform: Greenhouse ✓ Scanned
✅ Page analyzed 5m ago

[Analyze & Fill] button HIDDEN
```

### During Analysis
```
Platform: Greenhouse
Analysis in progress...

[🔍 Analyzing...] button (loading spinner)
```

---

## Flow Example

### First Greenhouse Job
```
1. Navigate to job A
2. Click "Analyze & Fill"
3. Saves to:
   - siteProfiles['greenhouse'] ← Platform profile
   - analysisStates[urlA] ← This page analyzed
4. Shows: "✓ Scanned" badge
```

### Second Greenhouse Job
```
1. Navigate to job B
2. Extension checks:
   - siteProfiles['greenhouse'] ← EXISTS (use for filling)
   - analysisStates[urlB] ← DOESN'T EXIST (not scanned yet)
3. Shows: "Fill Form" (uses cached profile)
4. No "✓ Scanned" badge (this URL not analyzed)
```

### Return to First Job
```
1. Navigate back to job A
2. Extension checks:
   - analysisStates[urlA] ← EXISTS with status "completed"
3. Shows: "✓ Scanned" badge + "Page analyzed 1h ago"
```

---

## Benefits

✅ **Platform Profiles** = Efficiency (analyze once, use many times)
✅ **Analysis States** = Tracking (know what you've done)
✅ **Combined** = Best of both worlds

---

## Debug Commands

```javascript
// Check platform profiles
chrome.storage.local.get('siteProfiles', (r) => console.log(r));

// Check analysis states
chrome.storage.local.get('analysisStates', (r) => console.log(r));

// Clear analysis states (keep profiles)
chrome.storage.local.remove('analysisStates');

// Clear everything
chrome.storage.local.clear();
```

---

## What's New

✅ "✓ Scanned" badge when page analyzed
✅ "Page analyzed Xm ago" timestamp
✅ Persistent across popup close/open
✅ Different indicator for analyzing vs completed
✅ Hide "Analyze & Fill" button when already scanned

Ready to test! 🚀
