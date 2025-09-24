# Firebase Analytics Installation Commands

## Step 1: Install Firebase Dependencies

```bash
# Install Firebase packages
npm install @react-native-firebase/app @react-native-firebase/analytics

# For iOS, install pods
cd ios && pod install && cd ..
```

## Step 2: Add Firebase Configuration Files

### iOS Configuration:
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to your iOS project in Xcode:
   - Drag and drop into `ios/AnimalDetective/`
   - Make sure "Add to target" is checked for your app

### Android Configuration:
1. Download `google-services.json` from Firebase Console
2. Add it to `android/app/google-services.json`

## Step 3: Update iOS Configuration

### ios/AnimalDetective/AppDelegate.swift:
```swift
import UIKit
import Firebase

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    FirebaseApp.configure()
    return true
  }
}
```

### ios/AnimalDetective.xcodeproj/project.pbxproj:
Add Firebase to your project dependencies in Xcode:
1. Select your project in Xcode
2. Go to "Build Phases" → "Link Binary With Libraries"
3. Add `FirebaseAnalytics.framework`

## Step 4: Update Android Configuration

### android/app/build.gradle:
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics'
}
```

### android/build.gradle:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

## Step 5: Test Installation

Create a simple test to verify Firebase is working:

```typescript
// Test file: src/test-firebase.ts
import analytics from '@react-native-firebase/analytics';

export const testFirebase = async () => {
  try {
    await analytics().logEvent('test_event', {
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firebase Analytics is working!');
    return true;
  } catch (error) {
    console.error('❌ Firebase Analytics error:', error);
    return false;
  }
};
```

## Step 6: Integration Examples

### In your main App component:
```typescript
import React, { useEffect } from 'react';
import FirebaseAnalytics from './src/services/FirebaseAnalytics';

export default function App() {
  useEffect(() => {
    // Initialize Firebase Analytics
    FirebaseAnalytics.initialize();
    
    // Track app launch
    FirebaseAnalytics.trackAppOpen();
  }, []);

  // ... rest of your app
}
```

### In MenuScreen.tsx:
```typescript
import FirebaseAnalytics from '../src/services/FirebaseAnalytics';

// Track level selection
const handleSelect = useCallback((level, isLocked) => {
  FirebaseAnalytics.trackLevelSelected(level, isLocked);
  // ... rest of your logic
}, []);

// Track purchase
const handlePurchase = useCallback(async () => {
  // ... purchase logic
  FirebaseAnalytics.trackPurchase(PRODUCT_ID, price, 'USD');
}, []);
```

### In LevelScreenTemplate.tsx:
```typescript
import FirebaseAnalytics from '../src/services/FirebaseAnalytics';

// Track animal discovery
const handleAnimalClick = useCallback((animal) => {
  FirebaseAnalytics.trackAnimalDiscovered(animal.name, levelName, currentAnimalIndex);
  // ... rest of your logic
}, [levelName, currentAnimalIndex]);

// Track level completion
useEffect(() => {
  if (levelCompleted) {
    FirebaseAnalytics.trackLevelCompleted(levelName, animalsFound, totalAnimals);
  }
}, [levelCompleted, levelName, animalsFound, totalAnimals]);
```

## Step 7: View Your Analytics

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Analytics → Events
4. View real-time data
5. Set up custom dashboards

## Troubleshooting

### Common Issues:

1. **iOS Build Error**: Make sure `GoogleService-Info.plist` is added to your Xcode project
2. **Android Build Error**: Ensure `google-services.json` is in the correct location
3. **Analytics Not Working**: Check that Firebase is properly configured in both platforms
4. **Pod Install Issues**: Try `cd ios && pod deintegrate && pod install && cd ..`

### Debug Mode:
```typescript
// Enable debug mode for testing
import analytics from '@react-native-firebase/analytics';

// This will show analytics events in the console
analytics().setAnalyticsCollectionEnabled(true);
```

## Next Steps:
1. Install the dependencies
2. Add the configuration files
3. Test with the test function
4. Integrate with your existing components
5. View analytics in Firebase Console
