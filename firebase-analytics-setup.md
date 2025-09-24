# Firebase Analytics Setup for Animal Detective

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "Animal Detective" or similar
4. Enable Google Analytics
5. Choose or create a Google Analytics account

## Step 2: Add Your App to Firebase

### For iOS:
1. Click "Add app" → iOS
2. Enter your iOS bundle ID (from your app.json)
3. Download `GoogleService-Info.plist`
4. Add it to your iOS project in Xcode

### For Android:
1. Click "Add app" → Android
2. Enter your Android package name (from your app.json)
3. Download `google-services.json`
4. Add it to `android/app/` directory

## Step 3: Install Dependencies

```bash
# Install Firebase packages
npm install @react-native-firebase/app @react-native-firebase/analytics

# For iOS, install pods
cd ios && pod install && cd ..
```

## Step 4: Configure Firebase

### iOS Configuration (ios/AnimalDetective/AppDelegate.swift):
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

### Android Configuration (android/app/build.gradle):
```gradle
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics'
}
```

## Step 5: Initialize in Your App

### Create Firebase Service (src/services/FirebaseAnalytics.ts):
```typescript
import analytics from '@react-native-firebase/analytics';

class FirebaseAnalyticsService {
  // Track app opens
  async trackAppOpen() {
    try {
      await analytics().logAppOpen();
      console.log('📊 App open tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  // Track level completions
  async trackLevelCompleted(levelName: string, animalsFound: number) {
    try {
      await analytics().logEvent('level_completed', {
        level_name: levelName,
        animals_found: animalsFound,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Level completed: ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  // Track animal discoveries
  async trackAnimalDiscovered(animalName: string, levelName: string) {
    try {
      await analytics().logEvent('animal_discovered', {
        animal_name: animalName,
        level_name: levelName,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Animal discovered: ${animalName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  // Track in-app purchases
  async trackPurchase(productId: string, price: number, currency: string) {
    try {
      await analytics().logPurchase({
        value: price,
        currency: currency,
        items: [{
          item_id: productId,
          item_name: 'Unlock All Levels',
          item_category: 'premium_upgrade',
          quantity: 1,
          price: price
        }]
      });
      console.log(`📊 Purchase tracked: ${productId}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  // Track user engagement
  async trackUserEngagement(action: string, levelName?: string) {
    try {
      await analytics().logEvent('user_engagement', {
        action: action,
        level_name: levelName || 'menu',
        timestamp: new Date().toISOString()
      });
      console.log(`📊 User engagement: ${action}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  // Set user properties
  async setUserProperties(properties: Record<string, string>) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
      console.log('📊 User properties set');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }
}

export default new FirebaseAnalyticsService();
```

## Step 6: Integrate with Your App

### In App.tsx (app/index.tsx):
```typescript
import React, { useEffect } from 'react';
import FirebaseAnalytics from '../src/services/FirebaseAnalytics';

export default function App() {
  useEffect(() => {
    // Track app launch
    FirebaseAnalytics.trackAppOpen();
    
    // Set user properties
    FirebaseAnalytics.setUserProperties({
      app_version: '1.0.0',
      platform: Platform.OS
    });
  }, []);

  // ... rest of your app
}
```

### In MenuScreen.tsx:
```typescript
import FirebaseAnalytics from '../src/services/FirebaseAnalytics';

// Track level selection
const handleSelect = useCallback((level, isLocked) => {
  FirebaseAnalytics.trackUserEngagement('level_selected', level);
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
  FirebaseAnalytics.trackAnimalDiscovered(animal.name, levelName);
  // ... rest of your logic
}, [levelName]);

// Track level completion
useEffect(() => {
  if (levelCompleted) {
    FirebaseAnalytics.trackLevelCompleted(levelName, animalsFound);
  }
}, [levelCompleted, levelName, animalsFound]);
```

## Step 7: Set Up Email Notifications

### Using Firebase Functions (Optional):
```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendDownloadNotification = functions.analytics.event('app_open').onLog((event) => {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });

  return transporter.sendMail({
    from: 'your-email@gmail.com',
    to: 'your-email@gmail.com',
    subject: 'New App Download - Animal Detective',
    html: `
      <h2>New App Download!</h2>
      <p>Time: ${new Date().toISOString()}</p>
      <p>User ID: ${event.userId}</p>
    `
  });
});
```

## Step 8: View Analytics

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Analytics → Events
4. View real-time and historical data
5. Set up custom dashboards

## Key Events to Track:
- `app_open` - App launches
- `level_completed` - Level completions
- `animal_discovered` - Animal discoveries
- `purchase` - In-app purchases
- `user_engagement` - User interactions
- `level_selected` - Level selections
- `settings_changed` - Settings modifications

## Benefits:
- ✅ Real-time user analytics
- ✅ Custom event tracking
- ✅ User behavior insights
- ✅ Revenue tracking
- ✅ Free to use
- ✅ Easy integration
- ✅ Detailed reporting
