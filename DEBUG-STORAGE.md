# Debug Storage

To check what's stored in the extension, open the console (F12) and run:

```javascript
// Check what's stored
chrome.storage.local.get('personalData', (result) => {
  console.log('=== STORED DATA ===');
  console.log('Custom Answers:', result.personalData?.customAnswers);
  console.log('Field Mappings:', result.personalData?.fieldMappings);
  console.log('All keys:', Object.keys(result.personalData?.customAnswers || {}));
});
```

## Expected Output

You should see something like:

```
=== STORED DATA ===
Custom Answers: {
  "whatIsYourGender": "Male",
  "areYouAVeteran": "No",
  ...
}
Field Mappings: {
  "gender": { value: "Male", patterns: ["gender", "sex", "gender identity"] },
  ...
}
All keys: ["whatIsYourGender", "areYouAVeteran", ...]
```

## Common Issues

### Issue 1: Custom answers not saving
- Check if `customAnswers` object exists
- Check if keys are being generated correctly
- Verify the save button is calling `storage.addAnswer()`

### Issue 2: Custom answers not matching
- Check console logs for "Fuzzy matching context"
- Verify the key format matches (camelCase)
- Check if the fuzzy matching threshold is too high

### Issue 3: Field mappings not working
- Check if `fieldMappings` object exists
- Verify field-mappings.json was loaded
- Check console for "Using field mapping" messages

## Clear Storage (if needed)

```javascript
chrome.storage.local.clear(() => {
  console.log('Storage cleared');
  location.reload();
});
```
