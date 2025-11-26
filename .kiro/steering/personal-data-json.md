---
inclusion: always
---

# Personal Data JSON Structure

## 🎯 Purpose

The personal data JSON file stores all your answers and grows dynamically as you encounter new questions.

## 📁 File Location

```
Chrome Storage: chrome.storage.local['personalData']
```

Can also be imported/exported as JSON file for backup.

## 📊 JSON Structure

```json
{
  "version": "1.0",
  "lastUpdated": "2024-01-15T10:30:00Z",
  
  "basic": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe",
    "portfolio": "https://johndoe.com"
  },
  
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "United States"
  },
  
  "professional": {
    "yearsExperience": 5,
    "currentTitle": "Senior Software Engineer",
    "currentCompany": "Tech Corp",
    "desiredSalary": "$120,000 - $150,000",
    "noticePeriod": "2 weeks",
    "startDate": "Flexible"
  },
  
  "preferences": {
    "requiresSponsorship": false,
    "willingToRelocate": true,
    "remotePreference": "Hybrid",
    "travelWillingness": "Up to 25%"
  },
  
  "customAnswers": {
    "whyWorkHere": "I'm passionate about your company's mission to...",
    "whyHireYou": "I bring 5 years of experience in...",
    "greatestStrength": "Problem-solving and collaboration",
    "greatestWeakness": "I tend to be a perfectionist",
    "careerGoals": "To become a technical lead within 3 years",
    "expectedSalary": "$120,000 - $150,000",
    "availableStartDate": "2024-02-01",
    "coverLetter": "Dear Hiring Manager,\n\nI am writing to..."
  },
  
  "siteSpecific": {
    "jobs.company.com": {
      "whyWorkHere": "I've been following your company for years and...",
      "referralSource": "LinkedIn"
    },
    "careers.startup.io": {
      "whyWorkHere": "Your innovative approach to AI aligns with...",
      "portfolioLink": "https://johndoe.com/startup-project"
    }
  },
  
  "metadata": {
    "totalAnswers": 45,
    "sitesConfigured": 12,
    "lastUsed": "2024-01-15T10:30:00Z"
  }
}
```

## 🔑 Key Categories

### 1. Basic Info
Standard fields that rarely change:
- Name, email, phone
- Social profiles (LinkedIn, GitHub)

### 2. Address
Location information:
- Street, city, state, zip, country

### 3. Professional
Career-related info:
- Years of experience
- Current role/company
- Salary expectations
- Notice period

### 4. Preferences
Job preferences:
- Sponsorship needs
- Relocation willingness
- Remote preference
- Travel willingness

### 5. Custom Answers
Dynamic answers that grow over time:
- Why work here?
- Why hire you?
- Strengths/weaknesses
- Career goals
- Cover letters

### 6. Site-Specific
Answers specific to certain companies:
- Company-specific "why work here"
- Referral sources
- Custom portfolio links

## 🔄 Dynamic Growth

### Adding New Answers

When you encounter a new question:

```typescript
// User adds answer via popup
const newAnswer = {
  key: 'whyWorkHere',
  value: 'I am passionate about...',
  question: 'Why do you want to work here?',
  reusable: true
};

// Automatically added to customAnswers
personalData.customAnswers[newAnswer.key] = newAnswer.value;

// Update metadata
personalData.metadata.totalAnswers++;
personalData.metadata.lastUsed = new Date().toISOString();

// Save immediately
await Storage.set('personalData', personalData);
```

### Site-Specific Answers

```typescript
// User marks answer as site-specific
const siteAnswer = {
  key: 'whyWorkHere',
  value: 'Your company specifically...',
  siteSpecific: 'jobs.company.com'
};

// Added to site-specific section
const domain = new URL(siteAnswer.siteSpecific).hostname;
if (!personalData.siteSpecific[domain]) {
  personalData.siteSpecific[domain] = {};
}
personalData.siteSpecific[domain][siteAnswer.key] = siteAnswer.value;
```

## 🎯 Answer Priority

When filling a field, check in this order:

1. **Site-specific answer** (if exists for current domain)
2. **Custom answer** (from customAnswers)
3. **Category answer** (from basic/professional/preferences)
4. **Empty** (show in unrecognized fields list)

```typescript
function getAnswerForField(
  fieldKey: string,
  currentDomain: string,
  personalData: PersonalData
): string | null {
  // 1. Check site-specific
  if (personalData.siteSpecific?.[currentDomain]?.[fieldKey]) {
    return personalData.siteSpecific[currentDomain][fieldKey];
  }
  
  // 2. Check custom answers
  if (personalData.customAnswers?.[fieldKey]) {
    return personalData.customAnswers[fieldKey];
  }
  
  // 3. Check category answers
  if (personalData.basic?.[fieldKey]) {
    return personalData.basic[fieldKey];
  }
  if (personalData.professional?.[fieldKey]) {
    return personalData.professional[fieldKey];
  }
  if (personalData.preferences?.[fieldKey]) {
    return personalData.preferences[fieldKey];
  }
  
  // 4. Not found
  return null;
}
```

## 📝 Key Naming Convention

### Auto-Generated Keys

When user adds a new answer, auto-generate a camelCase key:

```typescript
function generateKey(question: string): string {
  // Remove special characters
  let key = question.replace(/[^a-zA-Z0-9\s]/g, '');
  
  // Convert to camelCase
  key = key
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
  
  return key;
}

// Examples:
generateKey('Why do you want to work here?')
// → 'whyDoYouWantToWorkHere'

generateKey('Expected salary range')
// → 'expectedSalaryRange'

generateKey('Years of experience')
// → 'yearsOfExperience'
```

### User Can Edit Keys

In the "Add Answer" modal, show the auto-generated key but allow editing:

```
Save as key: [whyDoYouWantToWorkHere]
             ↑ User can edit this
```

## 💾 Import/Export

### Export to JSON File

```typescript
async function exportPersonalData(): Promise<void> {
  const personalData = await Storage.get<PersonalData>('personalData');
  
  const json = JSON.stringify(personalData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `smartformfiller-data-${Date.now()}.json`;
  a.click();
}
```

### Import from JSON File

```typescript
async function importPersonalData(file: File): Promise<void> {
  const text = await file.text();
  const personalData = JSON.parse(text);
  
  // Validate structure
  if (!personalData.version) {
    throw new Error('Invalid personal data file');
  }
  
  // Merge with existing data (don't overwrite)
  const existing = await Storage.get<PersonalData>('personalData') || {};
  const merged = {
    ...existing,
    ...personalData,
    customAnswers: {
      ...existing.customAnswers,
      ...personalData.customAnswers
    },
    siteSpecific: {
      ...existing.siteSpecific,
      ...personalData.siteSpecific
    }
  };
  
  await Storage.set('personalData', merged);
  
  showNotification('✅ Personal data imported!');
}
```

## 🔒 Privacy & Security

### Local Storage Only
- All data stored in Chrome Storage
- Never sent to external servers
- Stays on your computer

### Encryption (Optional)
For sensitive data, can add encryption:

```typescript
async function encryptData(data: PersonalData): Promise<string> {
  const key = await getEncryptionKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: generateIV() },
    key,
    new TextEncoder().encode(JSON.stringify(data))
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
```

### Backup Reminder
Show reminder to export data periodically:

```typescript
// Check last backup date
const lastBackup = personalData.metadata.lastBackup;
const daysSinceBackup = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);

if (daysSinceBackup > 30) {
  showNotification('💾 Reminder: Back up your personal data', 'info');
}
```

## 📊 Statistics

Track usage in metadata:

```json
{
  "metadata": {
    "totalAnswers": 45,
    "sitesConfigured": 12,
    "formsFilledToday": 8,
    "formsFilledTotal": 234,
    "lastUsed": "2024-01-15T10:30:00Z",
    "lastBackup": "2024-01-10T09:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🎯 Example Workflow

### First Time User

1. Install extension
2. Open popup
3. Visit job application
4. Popup shows: "3 unrecognized fields"
5. Click "+ Add to Answers" for each
6. Enter answers
7. Answers saved to personalData.customAnswers
8. Fields filled immediately
9. Next site: Answers already available!

### Experienced User

1. Visit job application
2. Form auto-fills (90% of fields)
3. Open popup
4. See 1 unrecognized field: "Referral source"
5. Click "+ Add to Answers"
6. Enter "LinkedIn"
7. Mark as "This site only"
8. Saved to personalData.siteSpecific
9. Field filled immediately
10. Total answers: 46 (was 45)
