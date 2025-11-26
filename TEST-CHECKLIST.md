# MagicFill Test Checklist

## Pre-Test Setup

- [ ] Run `build.bat` successfully
- [ ] Load extension in Chrome from `dist/` folder
- [ ] Extension icon appears in toolbar
- [ ] No errors in chrome://extensions/

## Test 1: Basic Functionality

### Manage Page
- [ ] Click extension icon → "Manage Answers"
- [ ] Manage page opens in new tab
- [ ] Can see three tabs: Personal Data, Custom Answers, Site-Specific
- [ ] Can fill in personal data fields
- [ ] Click "Save Changes" works
- [ ] Success message appears

### Manual Add Answer
- [ ] Go to Custom Answers tab
- [ ] Click "+ Add Custom Answer"
- [ ] Enter key and value
- [ ] Field appears in list
- [ ] Field shows ✏️ Edit button
- [ ] Field shows − Minus button (RED)

## Test 2: Minus Button Appearance

### Visual Check
- [ ] Minus button is visible
- [ ] Minus button is RED color
- [ ] Minus button is BOLD
- [ ] Minus button is larger than edit button
- [ ] Hover shows light red background
- [ ] Hover shows darker red text

### Functionality Check
- [ ] Click minus button
- [ ] Confirmation dialog appears
- [ ] Click "Cancel" - field stays
- [ ] Click minus again
- [ ] Click "OK" - field disappears
- [ ] Stats counter updates
- [ ] Field is gone from list

## Test 3: Learn Form Workflow

### Setup
- [ ] Navigate to a job application form
  - Suggested: LinkedIn Easy Apply
  - Or: Indeed application
  - Or: Any company career page

### Learn Form
- [ ] Click extension icon
- [ ] Click "Learn Form" button
- [ ] Notification shows "🔍 Learning form..."
- [ ] Review Fields page opens in new tab

### Review Fields Page
- [ ] Page shows "Review Learned Fields" title
- [ ] Shows count: "X fields to review"
- [ ] Each field shows:
  - [ ] Field label (generated name)
  - [ ] Context text (description)
  - [ ] Input box for answer
  - [ ] − Minus button (RED)

### Remove Fields
- [ ] Click − on a field
- [ ] Field disappears immediately
- [ ] Field count updates
- [ ] Other fields remain

### Fill and Save
- [ ] Fill in answers for remaining fields
- [ ] Leave some fields empty (should be skipped)
- [ ] Click "Save All Answers"
- [ ] Alert shows "✅ Saved X answers!"
- [ ] Page closes or can be closed

## Test 4: Verify in Manage Page

### Check Custom Answers
- [ ] Open Manage page
- [ ] Go to Custom Answers tab
- [ ] Saved fields appear in list
- [ ] Each field shows:
  - [ ] Key name (camelCase)
  - [ ] Value (your answer)
  - [ ] ✏️ Edit button
  - [ ] − Minus button (RED)

### Edit Answer
- [ ] Click ✏️ Edit button
- [ ] Prompt appears with current value
- [ ] Change value
- [ ] Click OK
- [ ] Value updates in list

### Delete Answer
- [ ] Click − Minus button
- [ ] Confirmation dialog appears
- [ ] Click OK
- [ ] Field disappears
- [ ] Stats counter decreases

## Test 5: Auto-Fill

### Fill Form
- [ ] Navigate to a job form
- [ ] Click extension icon
- [ ] Click "Fill Form" button
- [ ] Fields fill automatically
- [ ] Green highlight on filled fields
- [ ] Red highlight on unrecognized fields
- [ ] Blue highlight on file uploads

### Verify Filling
- [ ] Personal data fields filled correctly
- [ ] Custom answers filled correctly
- [ ] Unrecognized fields remain empty
- [ ] No errors in console

## Test 6: Site-Specific Answers

### Add Site-Specific
- [ ] On a specific site, add an answer
- [ ] Check "Site-specific" checkbox
- [ ] Save answer
- [ ] Go to Manage page
- [ ] Go to Site-Specific tab
- [ ] Answer appears under hostname
- [ ] Shows − Minus button (RED)

### Delete Site-Specific
- [ ] Click − on site-specific answer
- [ ] Confirmation appears
- [ ] Click OK
- [ ] Answer disappears

## Test 7: Import/Export

### Export
- [ ] Click "Export" button
- [ ] JSON file downloads
- [ ] File contains personal data

### Import
- [ ] Click "Import" button
- [ ] Paste JSON data
- [ ] Click "Import"
- [ ] Data loads successfully
- [ ] Fields populate

## Test 8: Edge Cases

### Empty States
- [ ] Custom Answers with no data shows empty state
- [ ] Site-Specific with no data shows empty state
- [ ] Review page with no fields shows message

### Multiple Fields
- [ ] Learn form with 10+ fields
- [ ] All fields appear in review
- [ ] Can remove multiple fields
- [ ] Can save multiple fields
- [ ] All appear in manage page

### Long Values
- [ ] Add answer with very long text
- [ ] Value is truncated in list
- [ ] Full value visible when editing

## Test 9: Error Handling

### MCP Server Not Running
- [ ] Stop MCP server
- [ ] Try "Learn Form"
- [ ] Error message appears
- [ ] Extension doesn't crash

### Invalid Page
- [ ] Go to non-form page (e.g., Google)
- [ ] Click "Fill Form"
- [ ] Appropriate message shows
- [ ] No errors in console

## Test 10: Performance

### Speed
- [ ] Extension loads quickly
- [ ] Manage page loads quickly
- [ ] Review page loads quickly
- [ ] Fill form is fast (< 1 second)

### Memory
- [ ] No memory leaks
- [ ] Extension doesn't slow down browser
- [ ] Can use extension multiple times

## Final Checks

- [ ] All minus buttons are RED
- [ ] All minus buttons are BOLD
- [ ] All minus buttons have hover effect
- [ ] All minus buttons delete correctly
- [ ] No console errors
- [ ] No visual glitches
- [ ] Workflow is smooth
- [ ] Documentation is clear

## Issues Found

List any issues here:
1. 
2. 
3. 

## Overall Rating

- [ ] ⭐⭐⭐⭐⭐ Perfect - Everything works
- [ ] ⭐⭐⭐⭐ Good - Minor issues
- [ ] ⭐⭐⭐ Okay - Some issues
- [ ] ⭐⭐ Poor - Major issues
- [ ] ⭐ Broken - Doesn't work

## Notes

Add any additional notes or feedback here:
