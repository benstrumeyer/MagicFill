---
inclusion: always
---

# MagicFill Mobile App ✨📱 (React Native)

## 🎯 Vision

Apply to jobs on mobile with the same auto-fill magic as the desktop extension.

**MagicFill Mobile** - The magic in your pocket! ✨📱

## 📱 Use Case

```
You're browsing LinkedIn jobs on your phone
  ↓
Find a job you like
  ↓
Tap "Apply"
  ↓
Floating button appears: "🤖 Auto-Fill"
  ↓
Tap it
  ↓
Form fills instantly
  ↓
Review and submit
  ↓
Next job!
```

## 🏗️ Architecture

### Option 1: WebView with Injected JavaScript (Recommended)
```
React Native App
├── WebView (displays job sites)
├── Injected JavaScript (form filler)
├── Native Bridge (communication)
└── Personal Data Storage (AsyncStorage)
```

**Pros:**
- Works with any website
- Reuse extension code
- No API needed

**Cons:**
- Limited to WebView
- Can't use native browser

### Option 2: Browser Extension + Companion App
```
Mobile Browser Extension (Safari/Chrome)
  ↕️ (Shared Storage)
Companion React Native App
```

**Pros:**
- Works in native browser
- Better UX

**Cons:**
- iOS Safari extensions are limited
- Android Chrome extensions not supported on mobile

### Option 3: Hybrid (Best of Both)
```
React Native App with:
├── Built-in WebView for job applications
├── Deep links from mobile browser
└── Shared personal data via cloud sync
```

## 📱 App Structure (Option 1 - WebView)

```
MagicFill-Mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Job search
│   │   ├── BrowserScreen.tsx       # WebView with auto-fill
│   │   ├── AnswersScreen.tsx       # Manage personal data
│   │   └── StatsScreen.tsx         # Application stats
│   ├── components/
│   │   ├── FloatingFillButton.tsx  # Auto-fill trigger
│   │   ├── UnrecognizedFields.tsx  # Show unknown fields
│   │   └── AddAnswerModal.tsx      # Add new answers
│   ├── services/
│   │   ├── FormFiller.ts           # Form filling logic
│   │   ├── FieldMatcher.ts         # Field recognition
│   │   └── Storage.ts              # AsyncStorage wrapper
│   ├── injected/
│   │   └── formFiller.js           # Injected into WebView
│   └── types/
│       └── index.ts
├── package.json
└── app.json
```

## 🎨 UI Design

### Home Screen
```
┌─────────────────────────────────────┐
│  ✨ MagicFill                       │
│                                     │
│  Quick Links                        │
│  ┌─────────────────────────────┐   │
│  │ 🔗 LinkedIn Jobs            │   │
│  │ 🔗 Indeed                   │   │
│  │ 🔗 Glassdoor                │   │
│  │ 🔗 Custom URL               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Recent Applications                │
│  ┌─────────────────────────────┐   │
│  │ Software Engineer           │   │
│  │ Tech Corp • 2 hours ago     │   │
│  ├─────────────────────────────┤   │
│  │ Senior Developer            │   │
│  │ Startup Inc • 1 day ago     │   │
│  └─────────────────────────────┘   │
│                                     │
│  📝 Answers (45)  📊 Stats          │
└─────────────────────────────────────┘
```

### Browser Screen (WebView)
```
┌─────────────────────────────────────┐
│  ← jobs.company.com            ⋮    │
│  ─────────────────────────────────  │
│                                     │
│  [WebView showing job application]  │
│                                     │
│  First Name: [John_______]          │
│  Last Name:  [Doe________]          │
│  Email:      [john@ex____]          │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🤖 Auto-Fill (7/10)        │   │ ← Floating button
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Floating Button States

**Default:**
```
┌─────────────────────────────┐
│  🤖 Auto-Fill               │
└─────────────────────────────┘
```

**Filling:**
```
┌─────────────────────────────┐
│  🔄 Filling... 7/10         │
└─────────────────────────────┘
```

**Complete:**
```
┌─────────────────────────────┐
│  ✅ Complete! 10/10         │
└─────────────────────────────┘
```

**Unrecognized Fields:**
```
┌─────────────────────────────┐
│  ⚠️ 3 unknown fields        │
│  [Tap to add answers]       │
└─────────────────────────────┘
```

### Unrecognized Fields Sheet
```
┌─────────────────────────────────────┐
│  ❓ Unrecognized Fields (3)         │
│  ─────────────────────────────────  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ "Why do you want to work    │   │
│  │  here?"                     │   │
│  │ Type: textarea              │   │
│  │                             │   │
│  │ [+ Add Answer]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ "Desired salary"            │   │
│  │ Type: text                  │   │
│  │                             │   │
│  │ [+ Add Answer]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Fill Known Fields] [Close]        │
└─────────────────────────────────────┘
```

## 🔧 Technical Implementation

### WebView Setup

```typescript
// BrowserScreen.tsx
import { WebView } from 'react-native-webview';

const BrowserScreen = ({ route }) => {
  const { url } = route.params;
  const webViewRef = useRef<WebView>(null);
  
  // Injected JavaScript
  const injectedJavaScript = `
    ${formFillerCode}
    
    // Listen for messages from React Native
    window.addEventListener('message', (event) => {
      const { action, data } = JSON.parse(event.data);
      
      if (action === 'fill-form') {
        fillAllFields(data);
      }
    });
    
    // Send unrecognized fields to React Native
    function sendUnrecognizedFields(fields) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: 'unrecognized-fields',
        fields
      }));
    }
    
    true; // Required for iOS
  `;
  
  const handleMessage = (event) => {
    const message = JSON.parse(event.nativeEvent.data);
    
    if (message.action === 'unrecognized-fields') {
      setUnrecognizedFields(message.fields);
      setShowFieldsSheet(true);
    }
  };
  
  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
      />
      
      <FloatingFillButton
        onPress={() => handleAutoFill()}
      />
      
      <UnrecognizedFieldsSheet
        visible={showFieldsSheet}
        fields={unrecognizedFields}
        onAddAnswer={handleAddAnswer}
      />
    </View>
  );
};
```

### Form Filler (Injected)

```javascript
// injected/formFiller.js
(function() {
  // Field matching patterns
  const patterns = {
    firstName: [/first.*name/i, /given.*name/i],
    lastName: [/last.*name/i, /surname/i],
    email: [/email/i, /e-mail/i],
    // ... more patterns
  };
  
  // Find all fillable fields
  function findAllFields() {
    const fields = [];
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (input.type === 'hidden' || input.type === 'submit') return;
      
      const context = getFieldContext(input);
      const fieldType = matchField(context);
      
      fields.push({
        element: input,
        selector: getSelector(input),
        type: input.type,
        fieldType,
        context
      });
    });
    
    return fields;
  }
  
  // Fill all fields
  function fillAllFields(personalData) {
    const fields = findAllFields();
    const unrecognized = [];
    let filled = 0;
    
    fields.forEach(field => {
      if (field.fieldType && personalData[field.fieldType]) {
        fillField(field.element, personalData[field.fieldType]);
        filled++;
      } else {
        unrecognized.push({
          selector: field.selector,
          label: field.context,
          type: field.type
        });
      }
    });
    
    // Send results back to React Native
    window.ReactNativeWebView.postMessage(JSON.stringify({
      action: 'fill-complete',
      filled,
      total: fields.length,
      unrecognized
    }));
    
    if (unrecognized.length > 0) {
      sendUnrecognizedFields(unrecognized);
    }
  }
  
  // Expose to window
  window.fillAllFields = fillAllFields;
})();
```

### Floating Button Component

```typescript
// components/FloatingFillButton.tsx
import { TouchableOpacity, Text, Animated } from 'react-native';

const FloatingFillButton = ({ onPress, status }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true
    }).start();
  }, []);
  
  const getButtonText = () => {
    switch (status) {
      case 'filling':
        return '🔄 Filling...';
      case 'complete':
        return '✅ Complete!';
      case 'partial':
        return '⚠️ 3 unknown fields';
      default:
        return '🤖 Auto-Fill';
    }
  };
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: '#667eea',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8
        }}
        onPress={onPress}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

### Personal Data Storage

```typescript
// services/Storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  static async getPersonalData(): Promise<PersonalData> {
    const data = await AsyncStorage.getItem('personalData');
    return data ? JSON.parse(data) : {};
  }
  
  static async setPersonalData(data: PersonalData): Promise<void> {
    await AsyncStorage.setItem('personalData', JSON.stringify(data));
  }
  
  static async addAnswer(key: string, value: string): Promise<void> {
    const data = await this.getPersonalData();
    data.customAnswers = data.customAnswers || {};
    data.customAnswers[key] = value;
    await this.setPersonalData(data);
  }
}
```

## 🔄 Data Sync (Optional)

### Cloud Sync Between Desktop & Mobile

```typescript
// services/CloudSync.ts
import { supabase } from './supabase';

class CloudSync {
  static async syncPersonalData(): Promise<void> {
    const localData = await Storage.getPersonalData();
    
    // Upload to cloud
    await supabase
      .from('personal_data')
      .upsert({
        user_id: userId,
        data: localData,
        updated_at: new Date()
      });
  }
  
  static async downloadPersonalData(): Promise<void> {
    const { data } = await supabase
      .from('personal_data')
      .select('data')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      await Storage.setPersonalData(data.data);
    }
  }
}
```

## 📊 Features

### Phase 1: MVP
- ✅ WebView browser
- ✅ Floating auto-fill button
- ✅ Basic field matching
- ✅ Personal data storage
- ✅ Unrecognized fields sheet
- ✅ Add answers on the fly

### Phase 2: Enhanced
- 🔲 Quick links to job sites
- 🔲 Application history
- 🔲 Cloud sync with desktop
- 🔲 Resume upload
- 🔲 Cover letter templates

### Phase 3: Advanced
- 🔲 Job search within app
- 🔲 Application tracking
- 🔲 Interview reminders
- 🔲 Salary insights

## 🎯 User Flow

### First Time Setup
```
1. Install app
2. Tap "Get Started"
3. Enter basic info (name, email, phone)
4. Tap "Start Applying"
5. Choose LinkedIn Jobs
6. Browse jobs in WebView
7. Find job, tap "Apply"
8. Tap floating "Auto-Fill" button
9. Form fills (70%)
10. Sheet shows 3 unrecognized fields
11. Tap "+ Add Answer" for each
12. Enter answers
13. Tap "Fill Now"
14. Review and submit
15. Next job!
```

### Regular Use
```
1. Open app
2. Tap "LinkedIn Jobs"
3. Browse jobs
4. Tap "Apply"
5. Tap "Auto-Fill" button
6. Form fills 100%
7. Review and submit
8. Done in 30 seconds!
```

## 🚀 Tech Stack

- **React Native** (Expo or bare)
- **TypeScript**
- **React Navigation** (navigation)
- **React Native WebView** (browser)
- **AsyncStorage** (local storage)
- **React Native Reanimated** (animations)
- **Supabase** (optional cloud sync)

## 📱 Platform Support

### iOS
- ✅ WebView works great
- ✅ Floating button supported
- ✅ AsyncStorage works
- ⚠️ Safari extension limited

### Android
- ✅ WebView works great
- ✅ Floating button supported
- ✅ AsyncStorage works
- ⚠️ Chrome extension not supported on mobile

## 🔮 Future: Deep Links

Allow opening job links from mobile browser:

```
User browsing LinkedIn in Safari/Chrome
  ↓
Finds job
  ↓
Taps "Share" → "Open in SmartFormFiller"
  ↓
App opens with job URL
  ↓
Auto-fills and applies
```

## 📊 Success Metrics

- Apply to 10+ jobs per day on mobile
- 90%+ fill rate
- <1 minute per application
- 100+ applications per month

## 🎨 Design Principles

1. **Mobile-first** - Optimized for touch
2. **Fast** - Auto-fill in <2 seconds
3. **Simple** - Minimal taps required
4. **Reliable** - Works on all job sites
5. **Private** - Data stays on device

## 🔒 Privacy

- All data stored locally (AsyncStorage)
- Optional cloud sync (encrypted)
- No tracking or analytics
- Open source

## 📝 Development Timeline

### Week 1-2: MVP
- WebView browser
- Form filler injection
- Floating button
- Basic field matching

### Week 3-4: Polish
- Unrecognized fields sheet
- Add answers modal
- Personal data management
- Application history

### Week 5-6: Cloud Sync
- Supabase integration
- Desktop ↔ Mobile sync
- Conflict resolution

### Week 7-8: Launch
- App store submission
- Documentation
- Marketing
