# Google Ads (AdMob) & Firebase Integration Guide

## 📋 Overview

This guide covers the integration of Google AdMob SDK and Firebase Analytics for the Animal Detective app. The integration includes:

- **Firebase Analytics**: Track user behavior and app events
- **AdMob**: Display banner ads and monetize the app
- **Google Mobile Ads SDK**: Modern, maintained package for AdMob integration

## ✅ Completed Setup

### 1. Installed Packages
- `@react-native-firebase/app` - Firebase core SDK
- `@react-native-firebase/analytics` - Firebase Analytics
- `react-native-google-mobile-ads` - AdMob SDK

### 2. iOS Configuration
- ✅ Added Firebase initialization in `AppDelegate.swift`
- ✅ Added AdMob App ID placeholder in `Info.plist`

### 3. Android Configuration
- ✅ Added Google Services plugin to `build.gradle`
- ✅ Added AdMob App ID placeholder in `AndroidManifest.xml`

### 4. Services Created
- ✅ `src/services/FirebaseAnalytics.ts` - Firebase Analytics service
- ✅ `src/services/AdMobService.ts` - AdMob initialization service
- ✅ `src/components/AdMobBanner.tsx` - Banner ad component

## 🔧 Required Setup Steps

### Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard:
   - Enter project name
   - Enable Google Analytics (recommended)
   - Configure Analytics settings

### Step 2: Add Firebase to Your App

#### iOS Setup:
1. ✅ **GoogleService-Info.plist** has been created at `ios/AnimalDetective/GoogleService-Info.plist`
2. ✅ Firebase is initialized in `AppDelegate.swift` with `FirebaseApp.configure()`
3. ✅ The file contains your Firebase project configuration:
   - Project ID: `pixieplay-25633`
   - Bundle ID: `com.metaltorchlabs.pixieplay`
   - API Key: Configured
   - Google App ID: Configured

**Note**: If you're using Xcode, make sure `GoogleService-Info.plist` is added to your Xcode project target. In Expo managed workflow, it should be automatically included.

#### Android Setup:
1. In Firebase Console, click "Add app" → Android
2. Enter Package name: `com.metaltorchlabs.pixieplay`
3. Download `google-services.json`
4. Place it in: `android/app/google-services.json`

### Step 3: Set Up AdMob Account

1. Go to [AdMob Console](https://apps.admob.com/)
2. Sign in with your Google account
3. Create a new app or link existing app
4. Get your **AdMob App ID** (format: `ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx`)

### Step 4: Update Configuration Files

#### iOS (`ios/AnimalDetective/Info.plist`):
Replace `YOUR_ADMOB_APP_ID` with your actual AdMob App ID:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx</string>
```

#### Android (`android/app/src/main/AndroidManifest.xml`):
Replace `YOUR_ADMOB_APP_ID` with your actual AdMob App ID:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"/>
```

### Step 5: Install iOS Dependencies

Run CocoaPods install:
```bash
cd ios
pod install
cd ..
```

### Step 6: Build and Test

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 📱 Usage

### Firebase Analytics

The service is automatically initialized in `app/index.tsx`. You can track events like this:

```typescript
import FirebaseAnalytics from '../src/services/FirebaseAnalytics';

// Track custom events
await FirebaseAnalytics.trackLevelCompleted('forest', 5, 120);
await FirebaseAnalytics.trackAnimalDiscovered('bear', 'forest', 3);
await FirebaseAnalytics.trackPurchase(4.99, 'USD', 'unlock_all_levels');

// Track custom events
await FirebaseAnalytics.trackCustomEvent('custom_event_name', {
  param1: 'value1',
  param2: 'value2'
});
```

### AdMob Banner Ads

Use the `AdMobBanner` component to display ads:

```typescript
import AdMobBanner from '../src/components/AdMobBanner';
import { BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// In your component
<AdMobBanner
  adUnitId={TestIds.BANNER} // Use TestIds.BANNER for testing
  size={BannerAdSize.BANNER}
  onAdLoaded={() => console.log('Ad loaded')}
  onAdFailedToLoad={(error) => console.log('Ad failed:', error)}
/>
```

**For Production:**
Replace `TestIds.BANNER` with your actual Ad Unit ID from AdMob:
- Create ad units in AdMob Console
- Use format: `ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx`

### AdMob Service

```typescript
import AdMobService from '../src/services/AdMobService';

// Initialize (already done in app/index.tsx)
await AdMobService.initialize();

// Set request configuration (for GDPR/CCPA compliance)
await AdMobService.setRequestConfiguration({
  maxAdContentRating: 'PG',
  tagForChildDirectedTreatment: true,
  tagForUnderAgeOfConsent: true
});
```

## 🎯 Test Ad Units

For testing, use these test Ad Unit IDs:

- **Banner**: `ca-app-pub-3940256099942544/6300978111`
- **Interstitial**: `ca-app-pub-3940256099942544/1033173712`
- **Rewarded**: `ca-app-pub-3940256099942544/5224354917`

Or use the `TestIds` constants from `react-native-google-mobile-ads`:
```typescript
import { TestIds } from 'react-native-google-mobile-ads';

TestIds.BANNER        // Banner ad
TestIds.INTERSTITIAL   // Interstitial ad
TestIds.REWARDED       // Rewarded ad
```

## 📊 Analytics Events

Both Firebase and Facebook Analytics track the same events:

- `app_open` - App launches
- `session_started` - User starts playing
- `level_completed` - Level finished
- `animal_discovered` - Animal found
- `level_selected` - Level chosen
- `purchase_completed` - In-app purchase
- `user_engagement` - User interactions
- `settings_changed` - Settings modified
- `achievement_unlocked` - Achievement earned

## 🔒 Privacy & Compliance

### GDPR/CCPA Compliance

For EU/California users, configure ad request settings:

```typescript
await AdMobService.setRequestConfiguration({
  requestNonPersonalizedAdsOnly: true, // For users who opted out
});
```

### User Consent

Consider implementing:
- Google User Messaging Platform (UMP) SDK for consent management
- Custom consent dialogs
- Privacy policy links

## 🐛 Troubleshooting

### Firebase Not Initializing
- Ensure `GoogleService-Info.plist` (iOS) or `google-services.json` (Android) is in the correct location
- Check that files are added to the Xcode project (iOS)
- Verify package names match Firebase Console

### AdMob Ads Not Showing
- Verify AdMob App ID is correct in config files
- Check AdMob Console for ad unit status
- Ensure test ads work before using production IDs
- Check device logs for error messages

### Build Errors
- Run `pod install` in `ios/` directory
- Clean build folders: `cd ios && xcodebuild clean`
- Verify all dependencies are installed: `npm install`

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [AdMob Documentation](https://developers.google.com/admob)
- [React Native Firebase](https://rnfirebase.io/)
- [React Native Google Mobile Ads](https://github.com/invertase/react-native-google-mobile-ads)

## ⚠️ Important Notes

1. **Test Ads First**: Always test with test ad units before using production IDs
2. **Ad Policy**: Follow AdMob policies to avoid account suspension
3. **Firebase Files**: Keep `GoogleService-Info.plist` and `google-services.json` secure and don't commit sensitive data
4. **App ID vs Ad Unit ID**: 
   - App ID: `ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx` (one per app)
   - Ad Unit ID: `ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx` (one per ad placement)

