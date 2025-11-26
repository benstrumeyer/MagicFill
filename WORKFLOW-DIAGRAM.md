# MagicFill Workflow Diagram

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER STARTS HERE                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Navigate to Job Application Form                       │
│  (LinkedIn, Indeed, company career page, etc.)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Click Extension Icon → "Learn Form"                    │
│  • Content script scans page                                     │
│  • Finds all form fields                                         │
│  • Identifies unrecognized fields                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Review Fields Page Opens (New Tab)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ✨ Review Learned Fields                                  │  │
│  │                                                            │  │
│  │ 5 fields to review                                        │  │
│  │                                                            │  │
│  │ ┌──────────────────────────────────────────────────┐     │  │
│  │ │ Preferred Work Location                      [−] │     │  │
│  │ │ Where do you want to work?                       │     │  │
│  │ │ [Remote                                    ]     │     │  │
│  │ └──────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │ ┌──────────────────────────────────────────────────┐     │  │
│  │ │ Years Of Experience                          [−] │     │  │
│  │ │ How many years of experience?                    │     │  │
│  │ │ [5                                         ]     │     │  │
│  │ └──────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │                    [Cancel] [Save All Answers]            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  User Actions:                                                   │
│  • Click [−] to remove unwanted fields                          │
│  • Fill in answers for fields to keep                           │
│  • Click "Save All Answers"                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Fields Saved to Storage                                │
│  • Only fields with values are saved                             │
│  • Stored in chrome.storage.local                               │
│  • Added to "Custom Answers"                                     │
│  • Alert: "✅ Saved 2 answers!"                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Verify in Manage Page                                  │
│  Click Extension Icon → "Manage Answers"                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ✨ MagicFill - Manage Answers                            │  │
│  │                                                            │  │
│  │ [Personal Data] [Custom Answers] [Site-Specific]         │  │
│  │                                                            │  │
│  │ Custom Answers:                                           │  │
│  │                                                            │  │
│  │ ┌──────────────────────────────────────────────────┐     │  │
│  │ │ preferredWorkLocation                            │     │  │
│  │ │ Remote                                           │     │  │
│  │ │                                    [✏️] [−]      │     │  │
│  │ └──────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  │ ┌──────────────────────────────────────────────────┐     │  │
│  │ │ yearsOfExperience                                │     │  │
│  │ │ 5                                                │     │  │
│  │ │                                    [✏️] [−]      │     │  │
│  │ └──────────────────────────────────────────────────┘     │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  User Actions:                                                   │
│  • Click [✏️] to edit answer                                    │
│  • Click [−] to delete answer (with confirmation)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Auto-Fill Forms                                         │
│  Navigate to any job form → Click "Fill Form"                   │
│  • Fields automatically filled with saved data                   │
│  • Green highlight = filled                                      │
│  • Red highlight = unrecognized                                  │
│  • Blue highlight = file upload                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Minus Button Behavior

```
┌─────────────────────────────────────────────────────────────────┐
│  Minus Button (−)                                                │
│                                                                  │
│  Appearance:                                                     │
│  • Symbol: −                                                     │
│  • Color: Red (#ef4444)                                         │
│  • Size: 24px                                                    │
│  • Weight: Bold                                                  │
│                                                                  │
│  Hover State:                                                    │
│  • Background: Light red (#fee)                                 │
│  • Color: Darker red (#dc2626)                                  │
│                                                                  │
│  Click Behavior:                                                 │
│  1. Shows confirmation dialog                                    │
│  2. If confirmed, removes field                                  │
│  3. Updates UI immediately                                       │
│  4. Updates stats counter                                        │
│                                                                  │
│  Locations:                                                      │
│  ✓ Review Fields page (before saving)                           │
│  ✓ Manage → Custom Answers (after saving)                       │
│  ✓ Manage → Site-Specific (site-specific answers)              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Form Fields on Page
       ↓
Field Matcher (detects fields)
       ↓
Form Filler (tries to fill)
       ↓
Unrecognized Fields
       ↓
Learn Form (scans)
       ↓
Session Storage (temporary)
       ↓
Review Page (user reviews)
       ↓
Chrome Storage (permanent)
       ↓
Personal Data Object
       ↓
Auto-Fill (uses data)
```

## Storage Structure

```javascript
{
  personalData: {
    // Built-in fields
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    
    // Custom answers (from Learn Form)
    customAnswers: {
      preferredWorkLocation: "Remote",
      yearsOfExperience: "5",
      willingToRelocate: "No"
    },
    
    // Site-specific answers
    siteSpecificAnswers: {
      "linkedin.com": {
        customField1: "value1"
      }
    }
  }
}
```
