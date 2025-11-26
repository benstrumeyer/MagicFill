# Dropdown Save Fix

## Problem

When clicking "Save Answer" on a dropdown (select element), it showed "Please fill in the field first" even after selecting an option.

## Root Cause

The code was only checking `field.element.value`, but for some dropdowns:
- The `value` attribute might be empty or a placeholder ID
- The actual selected text is in `selectedOption.text`

Example:
```html
<select>
  <option value="">Select...</option>
  <option value="1">Male</option>
  <option value="2">Female</option>
</select>
```

When user selects "Male":
- `element.value` = "1" (might be empty or ID)
- `selectedOption.text` = "Male" (what we want to save)

## Solution

Updated `saveFieldAnswer()` to:
1. Check if element is a `<select>`
2. Get the selected option's text
3. Use the text value instead of the value attribute
4. Filter out placeholder options like "Select..." or "Please select"

## Code Changes

### Before
```typescript
private async saveFieldAnswer(field: FormField, button: HTMLElement): Promise<void> {
  const value = field.element.value;

  if (!value || !value.trim()) {
    this.showToast('⚠️ Please fill in the field first', 'warning');
    return;
  }
  // ...
}
```

### After
```typescript
private async saveFieldAnswer(field: FormField, button: HTMLElement): Promise<void> {
  let value = field.element.value;

  // For select elements, also check selected option text
  if (field.element instanceof HTMLSelectElement) {
    const selectedOption = field.element.options[field.element.selectedIndex];
    // Use the option text if value is empty or is a placeholder
    if (selectedOption && selectedOption.text && 
        selectedOption.text !== 'Select...' && 
        selectedOption.text !== 'Please select') {
      value = selectedOption.text;
    }
  }

  if (!value || !value.trim() || 
      value === 'Select...' || 
      value === 'Please select') {
    this.showToast('⚠️ Please select an option first', 'warning');
    return;
  }
  // ...
}
```

## Testing

### Test Case 1: Gender Dropdown
```
Dropdown: Gender
Options: [Select..., Male, Female, Other]

1. Select "Male"
2. Click "Save Answer"
3. ✅ Saves "Male" (not "1" or empty)
4. ✅ Toast shows "Saved 'gender'"
5. ✅ Field turns green
```

### Test Case 2: Veteran Status
```
Dropdown: Veteran Status
Options: [Please select, Yes, No]

1. Select "Yes"
2. Click "Save Answer"
3. ✅ Saves "Yes"
4. ✅ Toast shows "Saved 'veteranStatus'"
5. ✅ Field turns green
```

### Test Case 3: Placeholder Selected
```
Dropdown: Gender
Options: [Select..., Male, Female]

1. Leave on "Select..."
2. Click "Save Answer"
3. ✅ Shows warning "Please select an option first"
4. ✅ Field stays red
5. ✅ Button stays visible
```

## Edge Cases Handled

1. **Empty value attribute**
   - Uses option text instead

2. **Placeholder options**
   - Filters out "Select...", "Please select", etc.

3. **Value is ID**
   - Uses human-readable text instead of ID

4. **No option selected**
   - Shows warning toast

## Future Improvements

1. **More placeholder patterns**
   ```typescript
   const placeholders = ['Select...', 'Please select', 'Choose...', '--'];
   if (placeholders.includes(selectedOption.text)) {
     // Skip
   }
   ```

2. **Save both value and text**
   ```typescript
   await this.storage.addAnswer(key, {
     value: element.value,
     text: selectedOption.text
   }, false);
   ```

3. **Smart value selection**
   ```typescript
   // Prefer text if value is numeric ID
   const useText = /^\d+$/.test(value);
   const finalValue = useText ? selectedOption.text : value;
   ```

## Related Issues

This fix also helps with:
- Country dropdowns
- State/Province dropdowns
- Any dropdown with ID values
- Custom select components

## Summary

Dropdowns now work correctly! The extension saves the human-readable text (e.g., "Male", "Yes") instead of internal IDs or empty values.

**Before:** "Please fill in the field first" ❌
**After:** "Saved 'gender'" ✅
