# Test Data Persistence

## Quick Persistence Test

Follow these steps to verify data persists between extension reloads:

### Test 1: Basic Persistence

```
1. Load extension in Chrome
2. Click extension → "Manage Answers"
3. Add a custom answer:
   - Click "+ Add Custom Answer"
   - Key: "testField"
   - Value: "This should persist"
4. Verify it appears in the list
5. Go to chrome://extensions/
6. Click the reload button (🔄) on MagicFill
7. Click extension → "Manage Answers"
8. Go to Custom Answers tab
9. ✅ "testField" should still be there!
```

### Test 2: Browser Restart

```
1. Add several custom answers
2. Note down what you added
3. Close Chrome completely (all windows)
4. Restart Chrome
5. Click extension → "Manage Answers"
6. ✅ All your answers should still be there!
```

### Test 3: Learn Form Persistence

```
1. Go to a job application form
2. Click extension → "Learn Form"
3. In Review Fields page, add answers
4. Click "Save All Answers"
5. Reload the extension (chrome://extensions/)
6. Click extension → "Manage Answers"
7. Go to Custom Answers tab
8. ✅ All learned fields should be there!
```

### Test 4: Inspect Storage Directly

```
1. Add some custom answers
2. Right-click extension icon → "Inspect popup"
3. In DevTools, go to Console tab
4. Run this command:
   chrome.storage.local.get('personalData', (result) => {
     console.log(result.personalData);
   });
5. ✅ You should see all your data in the console
6. Reload extension
7. Run the command again
8. ✅ Data should still be there!
```

### Test 5: Export and Reimport

```
1. Add custom answers
2. Click "Export" button
3. Save the JSON file
4. Delete all custom answers (using − button)
5. Verify Custom Answers tab is empty
6. Click "Import" button
7. Paste the JSON from exported file
8. Click "Import"
9. ✅ All answers should be restored!
```

## Understanding Storage Locations

### Temporary Storage (sessionStorage)
- **Location:** Browser tab memory
- **Lifetime:** Until tab closes
- **Used for:** Transferring learned fields to review page
- **Cleared:** After clicking "Save All Answers"

```javascript
// Check temporary storage (in review-fields page console)
console.log(sessionStorage.getItem('learnedFields'));
// After saving, this will be null
```

### Permanent Storage (chrome.storage.local)
- **Location:** Chrome's extension storage database
- **Lifetime:** PERMANENT (until user clears or uninstalls)
- **Used for:** All saved personal data and custom answers
- **Persists:** Across reloads, restarts, updates

```javascript
// Check permanent storage (in any extension page console)
chrome.storage.local.get('personalData', (result) => {
  console.log('Permanent data:', result.personalData);
  console.log('Custom answers:', result.personalData?.customAnswers);
});
```

## Debugging Storage Issues

### If data doesn't persist:

1. **Check Chrome Storage API is working:**
```javascript
// In extension console
chrome.storage.local.set({ test: 'hello' }, () => {
  console.log('Set test data');
  chrome.storage.local.get('test', (result) => {
    console.log('Got test data:', result.test);
  });
});
```

2. **Check for errors in console:**
- Open extension popup → Right-click → Inspect
- Look for red errors
- Common issues:
  - Storage quota exceeded (unlikely with small data)
  - Permission issues (check manifest.json has "storage" permission)

3. **Verify manifest.json permissions:**
```json
{
  "permissions": [
    "storage",  ← Must be present!
    "activeTab",
    "scripting"
  ]
}
```

4. **Check Storage.ts is being used:**
```javascript
// In manage.ts or review-fields.ts console
console.log('Storage instance:', this.storage);
console.log('Has getPersonalData:', typeof this.storage.getPersonalData);
```

## Storage Limits

Chrome extension storage limits:
- **chrome.storage.local:** 10 MB (plenty for form data)
- **chrome.storage.sync:** 100 KB (not used in MagicFill)

Your data structure is tiny compared to these limits:
```
Typical personal data: ~5-10 KB
100 custom answers: ~10-20 KB
Total: < 50 KB (0.5% of limit)
```

## Expected Behavior

✅ **Data SHOULD persist:**
- Extension reload
- Browser restart
- Computer restart
- Extension update
- Chrome update

❌ **Data WILL be lost:**
- User clears browser data (Settings → Privacy → Clear browsing data → "Site settings")
- User uninstalls extension
- User manually deletes from chrome://extensions/ storage

## Backup Recommendations

Since data persists automatically, you can also:

1. **Export regularly:**
   - Click "Export" in Manage page
   - Save JSON file to your computer
   - Keep as backup

2. **Use version control:**
   - Save exported JSON to a git repo
   - Track changes over time

3. **Sync across devices (future feature):**
   - Could use chrome.storage.sync
   - Would sync across all Chrome browsers with same account
   - Limited to 100 KB

## Conclusion

Your data **IS** persisting permanently using `chrome.storage.local`. The flow is:

```
Learn Form → sessionStorage (temporary)
     ↓
Review Fields → reads sessionStorage
     ↓
Save All Answers → writes to chrome.storage.local (PERMANENT ✅)
     ↓
Manage Page → reads from chrome.storage.local (PERMANENT ✅)
     ↓
Auto-Fill → reads from chrome.storage.local (PERMANENT ✅)
```

Test it yourself with the steps above to verify!
