# Firebase Configuration Files - Exact Placement Guide

## 📱 **Your App Information:**
- **iOS Bundle ID**: `com.metaltorchlabs.pixieplay`
- **Android Package**: `com.metaltorchlabs.pixieplay`
- **App Name**: `Animal Detective`

## 🔥 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `Animal Detective`
4. Enable Google Analytics

## 📱 **Step 2: Add iOS App to Firebase**

1. Click "Add app" → iOS
2. **Bundle ID**: `com.metaltorchlabs.pixieplay`
3. **App nickname**: `Animal Detective iOS`
4. Download `GoogleService-Info.plist`

## 🤖 **Step 3: Add Android App to Firebase**

1. Click "Add app" → Android
2. **Package name**: `com.metaltorchlabs.pixieplay`
3. **App nickname**: `Animal Detective Android`
4. Download `google-services.json`

## 📁 **Step 4: Exact File Placement**

### **iOS Configuration File:**
```
📁 animal_detective/
  📁 ios/
    📁 AnimalDetective/
      📄 GoogleService-Info.plist  ← Place here
      📄 AppDelegate.swift
      📄 Info.plist
      📁 Images.xcassets/
      📁 Supporting/
```

### **Android Configuration File:**
```
📁 animal_detective/
  📁 android/
    📁 app/
      📄 google-services.json  ← Place here
      📄 build.gradle
      📁 src/
      📁 debug.keystore
```

## ✅ **Step 5: Configuration Complete**

I've already updated your configuration files:

### **iOS (AppDelegate.swift):**
- ✅ Added `import Firebase`
- ✅ Added `FirebaseApp.configure()` in `didFinishLaunchingWithOptions`

### **Android (build.gradle files):**
- ✅ Added Google Services plugin to `android/app/build.gradle`
- ✅ Added Google Services classpath to `android/build.gradle`

## 🚀 **Step 6: Install iOS Pods**

Run this command to install the Firebase iOS dependencies:

```bash
cd ios && pod install && cd ..
```

## 🧪 **Step 7: Test Firebase Integration**

Add this to your main App component to test:

```typescript
import React, { useEffect } from 'react';
import FirebaseAnalytics from './src/services/FirebaseAnalytics';

export default function App() {
  useEffect(() => {
    // Test Firebase Analytics
    FirebaseAnalytics.initialize();
    FirebaseAnalytics.trackAppOpen();
    console.log('🔥 Firebase Analytics initialized!');
  }, []);

  // ... rest of your app
}
```

## 📊 **Step 8: View Your Analytics**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Analytics → Events
4. View real-time data

## 🎯 **What You'll Track:**

- ✅ **App opens** - Every time someone launches your app
- ✅ **Level completions** - When users finish levels
- ✅ **Animal discoveries** - When users find animals
- ✅ **In-app purchases** - When users buy the unlock
- ✅ **User engagement** - Button clicks, navigation, etc.
- ✅ **Settings changes** - Volume, language changes

## 🔧 **Troubleshooting:**

### **If iOS build fails:**
- Make sure `GoogleService-Info.plist` is added to Xcode project
- Run `cd ios && pod install && cd ..`

### **If Android build fails:**
- Make sure `google-services.json` is in `android/app/` directory
- Clean and rebuild: `cd android && ./gradlew clean && cd ..`

### **If analytics not working:**
- Check Firebase Console for events
- Verify configuration files are in correct locations
- Test with the test function above

## 📧 **Email Notifications:**

Once Firebase is working, you can set up email alerts in Firebase Console:
1. Go to Analytics → Events
2. Set up custom alerts for key events
3. Configure email notifications for milestones

## 🎉 **You're Done!**

After placing the configuration files and running `pod install`, your app will start tracking analytics automatically. You'll be able to see user activity, downloads, and engagement in the Firebase Console.
