# MagicFill ✨ - Quick Start Guide

Get up and running with MagicFill in 5 minutes!

## Installation

### Step 1: Build the Extension

```bash
cd MagicFill
npm install
npm run build
```

### Step 2: Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder inside the MagicFill directory
5. The extension icon should appear in your toolbar

## Initial Setup

### Step 1: Add Your Personal Information

1. Click the MagicFill icon in your toolbar
2. Click "Manage Answers"
3. Fill in the "Personal Data" tab with your information:
   - Basic Information (name, email, phone)
   - Address
   - Professional details
   - Education
   - Work authorization

4. Click "Save Changes"

## Using MagicFill

### Auto-Fill a Form

**Method 1: Automatic (Recommended)**
- Just navigate to any job application page
- MagicFill will automatically detect and fill fields after 1 second
- You'll see a notification showing how many fields were filled

**Method 2: Keyboard Shortcut**
- Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
- The form will be filled instantly

**Method 3: Extension Popup**
- Click the MagicFill icon
- Click "Fill Form"

### Handling Unrecognized Fields

When MagicFill encounters fields it doesn't recognize:

1. Click the MagicFill icon
2. You'll see a list of unrecognized fields
3. Click "+ Add" next to any field
4. A modal will appear:
   - **Field Context**: Shows what the field is asking for (read-only)
   - **Answer Key**: Auto-generated key (you can edit this)
   - **Answer Value**: Enter your answer
   - **Site-specific**: Check if this answer only applies to this website

5. Click "Save & Fill Now"
6. The field will be filled immediately and remembered for next time

### Example: Adding a Custom Answer

Let's say you encounter a field asking "What's your preferred work location?"

1. Click "+ Add" next to that field
2. The modal shows:
   - Field Context: "What's your preferred work location?"
   - Answer Key: `preferredWorkLocation` (auto-generated)
   - Answer Value: (empty - you fill this in)

3. Type your answer: `Remote`
4. Leave "Site-specific" unchecked (so it works on all sites)
5. Click "Save & Fill Now"

Now whenever you encounter a "preferred work location" field, it will auto-fill with "Remote"!

## Managing Your Data

### View All Answers

1. Click MagicFill icon → "Manage Answers"
2. Use the tabs to navigate:
   - **Personal Data**: Your core information
   - **Custom Answers**: Answers you've added dynamically
   - **Site-Specific**: Answers that only apply to certain websites

### Edit an Answer

1. Go to "Manage Answers"
2. Find the answer in the list
3. Click the ✏️ (edit) icon
4. Update the value
5. Changes are saved automatically

### Delete an Answer

1. Go to "Manage Answers"
2. Find the answer in the list
3. Click the 🗑️ (delete) icon
4. Confirm deletion

### Export Your Data

1. Go to "Manage Answers"
2. Click "Export" in the top right
3. A JSON file will download with all your data
4. Save this file as a backup!

### Import Data

1. Go to "Manage Answers"
2. Click "Import" in the top right
3. Paste your JSON data
4. Click "Import"
5. All your data will be restored

## Tips & Tricks

### Keyboard Shortcut

The fastest way to fill forms is `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac). Memorize this!

### Site-Specific Answers

Use site-specific answers for questions that are unique to one company. For example:
- "Why do you want to work at Google?" → Site-specific
- "What's your preferred work location?" → Reusable

### Search Answers

In "Manage Answers", use the search box to quickly find specific answers.

### Regular Backups

Export your data regularly! Click "Export" and save the JSON file somewhere safe.

## Common Use Cases

### Applying to Multiple Jobs

1. Fill in your personal data once
2. Navigate to job application pages
3. Press `Ctrl+Shift+F` on each page
4. Add custom answers as needed
5. Repeat for all applications

### Updating Your Information

1. Go to "Manage Answers"
2. Update the "Personal Data" tab
3. Click "Save Changes"
4. All future forms will use the new data

### Sharing Data Across Computers

1. Export your data on Computer A
2. Copy the JSON file to Computer B
3. Import the data on Computer B
4. You're synced!

## Troubleshooting

### Extension Not Filling Fields

- Make sure you've filled in your personal data
- Try clicking the extension icon and manually clicking "Fill Form"
- Check if the page has loaded completely
- Some sites use custom form frameworks that may not be detected

### Fields Filled Incorrectly

- Go to "Manage Answers" and verify your data
- Edit any incorrect values
- The next fill will use the updated data

### Extension Icon Not Showing

- Go to `chrome://extensions/`
- Make sure MagicFill is enabled
- Try reloading the extension

### Can't Add Custom Answer

- Make sure you're on a page with forms
- Try refreshing the page
- Check that the extension has permission for the site

## Next Steps

- Test on your favorite job sites (LinkedIn, Indeed, Greenhouse)
- Add custom answers as you encounter new fields
- Export your data as a backup
- Share feedback and suggestions!

## Support

Having issues? Check the main README.md or open an issue on GitHub.

---

Happy job hunting! ✨
