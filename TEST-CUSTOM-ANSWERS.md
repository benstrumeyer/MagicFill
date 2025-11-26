# Test Custom Answers Filling

## Quick Test

### Step 1: Add Custom Answers

1. Load the extension (reload if already loaded)
2. Click extension icon → "Manage Answers"
3. Go to "Custom Answers" tab
4. Add these test answers:

```
Key: preferredWorkLocation
Value: Remote

Key: yearsOfExperience  
Value: 5

Key: willingToRelocate
Value: No

Key: expectedSalary
Value: $100,000
```

### Step 2: Test on a Form

Go to any job application form that has fields like:
- "Preferred work location?"
- "Years of experience"
- "Willing to relocate?"
- "Salary expectations"

### Step 3: Fill Form

1. Click extension icon
2. Click "Fill Form"
3. Watch the magic! ✨

### Expected Results

✅ **Green highlight** = Field filled successfully
- Personal data fields (name, email, etc.)
- Custom answer fields (if matched)

❌ **Red highlight** = Unrecognized field
- Fields that don't match any data

🔵 **Blue highlight** = File upload
- Resume, cover letter, etc.

## Test Sites

### LinkedIn Easy Apply
- Has many custom fields
- Good for testing

### Indeed Applications
- Variety of field types
- Tests fuzzy matching

### Company Career Pages
- Different field naming
- Tests matching flexibility

## Debugging

### Check What's Saved

Open extension popup → Right-click → Inspect → Console:

```javascript
chrome.storage.local.get('personalData', (result) => {
  console.log('Personal Data:', result.personalData);
  console.log('Custom Answers:', result.personalData?.customAnswers);
});
```

### Check Field Detection

On a job form page → F12 → Console:

```javascript
// This will show all detected fields
const fields = document.querySelectorAll('input, textarea, select');
fields.forEach(f => {
  console.log('Field:', f.name || f.id, 'Context:', f.placeholder || f.labels?.[0]?.textContent);
});
```

### Check Matching

In content script console:

```javascript
// See what fields were found
console.log('All fields:', fieldMatcher.findAllFields());

// See what got filled
console.log('Fill result:', fillResult);
```

## Common Issues

### Issue: Custom answers not filling

**Possible causes:**

1. **Field context doesn't match key**
   - Solution: Check field context in console
   - Adjust custom answer key to match better

2. **Extension not reloaded**
   - Solution: Go to chrome://extensions/ and reload

3. **Data not saved**
   - Solution: Check storage in console (see above)

4. **Field is disabled/readonly**
   - Solution: Can't fill disabled fields (by design)

### Issue: Wrong field gets filled

**Possible cause:** Fuzzy matching too aggressive

**Solution:** Use more specific key names
```
Bad:  "location" (too generic)
Good: "preferredWorkLocation" (specific)
```

### Issue: Field highlighted red (unrecognized)

**Possible causes:**

1. **No matching custom answer**
   - Solution: Add a custom answer for that field

2. **Key doesn't match context well enough**
   - Solution: Rename key to match field better
   - Example: Field says "Where do you want to work?"
   - Key should be: "preferredWorkLocation" or "workLocation"

## Matching Examples

### Good Matches ✅

```
Field: "Preferred work location?"
Key: "preferredWorkLocation"
→ Match! (exact words)

Field: "How many years of experience do you have?"
Key: "yearsOfExperience"
→ Match! (key words present)

Field: "Are you willing to relocate?"
Key: "willingToRelocate"
→ Match! (60%+ word match)
```

### Poor Matches ❌

```
Field: "What is your salary expectation?"
Key: "expectedSalary"
→ Might not match (different word order)
→ Better key: "salaryExpectation"

Field: "Start date"
Key: "availableStartDate"
→ Might not match (missing words)
→ Better key: "startDate"
```

## Tips for Better Matching

1. **Use field's exact wording in key**
   - Field: "Preferred work location"
   - Key: "preferredWorkLocation" ✅

2. **Keep keys concise**
   - Bad: "whatIsYourPreferredWorkLocation"
   - Good: "preferredWorkLocation"

3. **Use camelCase**
   - Makes it easier to read
   - Matches word boundaries better

4. **Include key words from field**
   - Field: "Years of relevant experience"
   - Key: "yearsRelevantExperience" ✅
   - Or: "yearsOfExperience" ✅

5. **Test and adjust**
   - If field doesn't fill, check console
   - Rename key to match better
   - Try again

## Success Criteria

After testing, you should see:

✅ Personal data fields filled (name, email, phone, etc.)
✅ Custom answer fields filled (your added answers)
✅ Green highlights on filled fields
✅ Red highlights only on truly unrecognized fields
✅ No console errors

## Next Steps

Once custom answers are working:

1. **Learn more forms** - Use "Learn Form" button
2. **Build your library** - Add more custom answers
3. **Test on different sites** - See how well it adapts
4. **Refine keys** - Adjust for better matching
5. **Export data** - Backup your answers

Enjoy the magic! ✨
