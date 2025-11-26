# MagicFill Testing Guide

## Build the Extension

Run the build script:
```bash
build.bat
```

This will compile all TypeScript files and copy assets to the `dist/` folder.

## Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `MagicFill/dist` folder
5. The extension should now appear in your extensions list

## Test Workflow: Learn Form → Review → Manage

### Step 1: Set Up Personal Data

1. Click the MagicFill extension icon
2. Click "Manage Answers"
3. Fill in your personal information in the "Personal Data" tab
4. Click "Save Changes"

### Step 2: Learn a Form

1. Navigate to any job application form (e.g., LinkedIn, Indeed, company career page)
2. Click the MagicFill extension icon
3. Click "Learn Form" button
4. The MCP server will scan the page and detect form fields
5. A new tab will open showing "Review Fields"

### Step 3: Review and Add Fields

1. In the Review Fields page, you'll see all detected fields
2. Each field shows:
   - Label (generated from field name)
   - Context (what the field is for)
   - Input box (enter your answer)
3. To remove a field you don't want to save, click the **−** (minus) button
4. Fill in answers for the fields you want to keep
5. Click "Save All Answers"

### Step 4: Verify in Manage Page

1. Go back to the extension popup
2. Click "Manage Answers"
3. Go to the "Custom Answers" tab
4. You should see all the fields you just saved
5. Each field has:
   - ✏️ Edit button - to modify the answer
   - **−** Minus button (red) - to delete the answer

### Step 5: Auto-Fill Forms

1. Navigate to a job application form
2. Click the MagicFill extension icon
3. Click "Fill Form" button
4. Watch as fields are automatically filled with your saved data
5. Fields will be highlighted:
   - **Green** = Successfully filled
   - **Red** = Unrecognized field (no matching data)
   - **Blue** = File upload detected (manual upload required)

## Testing the Minus Button

The minus button (−) should:
- Appear in red color
- Be visible on both Custom Answers and Site-Specific tabs
- Show a hover effect (lighter red background)
- Delete the answer when clicked (with confirmation)
- Update the stats counter after deletion

## Troubleshooting

### Extension not loading
- Make sure you selected the `dist/` folder, not the root `MagicFill/` folder
- Check Chrome DevTools console for errors

### Learn Form not working
- Make sure the MCP server is running (see MCP-SERVER.md)
- Check that the server is accessible at http://localhost:3001

### Fields not filling
- Check that you have data saved in the Manage page
- Open Chrome DevTools and check the console for errors
- Verify field matching by looking at the field names/labels

### Minus button not showing
- Rebuild the extension: `build.bat`
- Reload the extension in Chrome (click the refresh icon)
- Clear browser cache if needed

## Next Steps

After testing the basic workflow:
1. Test with multiple different job application sites
2. Test the import/export functionality
3. Test site-specific answers
4. Test file upload detection
5. Provide feedback on field matching accuracy
