# TikTok Ads SDK Integration Guide

## 📋 Overview

This guide covers the integration of TikTok Business SDK for event tracking and advertising attribution in the Animal Detective app. The integration enables:

- **TikTok Events API**: Track user behavior and in-app events
- **TikTok Pixel**: Conversion tracking for TikTok ad campaigns
- **User Attribution**: Link app installs and events to TikTok ad campaigns

## ✅ Completed Setup

### 1. Installed Package
- ✅ `react-native-tiktok-business-sdk` - TikTok Business SDK for React Native

### 2. Service Created
- ✅ `src/services/TikTokAnalytics.ts` - TikTok Analytics service with event tracking methods

### 3. App Integration
- ✅ Updated `app/index.tsx` to initialize TikTok Analytics on app start

## 🔧 Required Setup Steps

### Step 1: Create TikTok Developer Account

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Sign up or log in with your TikTok account
3. Complete the developer verification process

### Step 2: Create TikTok App

1. In TikTok for Developers dashboard, click "Create App"
2. Fill in the app details:
   - **App Name**: `Animal Detective`
   - **App Type**: Select appropriate type
   - **Platform**: Select iOS and Android
3. Submit for approval (if required)

### Step 3: Set Up TikTok Events Manager

1. Go to [TikTok Events Manager](https://ads.tiktok.com/help/article?aid=10028)
2. Create a new Pixel or use existing one
3. Get your **TikTok App ID** (also called Pixel ID)
4. Generate an **Access Token**:
   - Go to Events Manager → Settings → Access Token
   - Click "Generate" or "Create Access Token"
   - Save the token securely

**Your TikTok Configuration:**
- **TikTok App ID**: `7568899277611696136` ✅ (Configured)
- **App Name**: Animal Detective For Kids
- **App ID**: `6751962145`
- **Access Token**: ⚠️ Still needed - Get from TikTok Events Manager → Settings → Access Token

### Step 4: Update Configuration

#### Update `app/index.tsx`:

Replace the placeholder values in the TikTok initialization:

```typescript
await TikTokAnalytics.initialize(
  undefined, // appId - uses default: com.metaltorchlabs.pixieplay
  '7568899277611696136', // TikTok App ID ✅ Already configured
  'YOUR_ACCESS_TOKEN', // ⚠️ Replace with your Access Token from TikTok Events Manager
  __DEV__ // Enable debug mode in development
);
```

#### Update `src/services/TikTokAnalytics.ts`:

The default TikTok App ID is already set. You can also set a default Access Token here:

```typescript
this.ttAppId = ttAppId || '7568899277611696136'; // ✅ Already configured
this.accessToken = accessToken || 'YOUR_ACCESS_TOKEN'; // ⚠️ Set your Access Token here
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

### Basic Event Tracking

The service is automatically initialized in `app/index.tsx`. You can track events like this:

```typescript
import TikTokAnalytics from '../src/services/TikTokAnalytics';

// Track level completion
await TikTokAnalytics.trackLevelCompleted('forest', 5, 120);

// Track animal discovery
await TikTokAnalytics.trackAnimalDiscovered('bear', 'forest', 3);

// Track purchase
await TikTokAnalytics.trackPurchase(4.99, 'USD', 'unlock_all_levels', 'order_123');

// Track custom events
await TikTokAnalytics.trackCustomEvent('custom_event_name', {
  param1: 'value1',
  param2: 'value2'
});
```

### User Identification

Identify users for better attribution:

```typescript
await TikTokAnalytics.identifyUser(
  'user_123', // External user ID
  'username', // External username (optional)
  '+1234567890', // Phone number (optional)
  'user@example.com' // Email (optional)
);
```

### Standard TikTok Events

The service supports these TikTok standard events:

- `LAUNCH_APP` - App launches
- `INSTALL_APP` - App installs
- `ACHIEVE_LEVEL` - Level completion
- `COMPLETE_TUTORIAL` - Tutorial completion
- `UNLOCK_ACHIEVEMENT` - Achievement unlocked
- `PURCHASE` - In-app purchases
- `VIEW_CONTENT` - Content views (animals, levels)
- `REGISTRATION` - User registration
- `LOGIN` - User login

## 📊 Analytics Events

The TikTok Analytics service tracks the same events as Facebook and Firebase:

- `app_open` / `LAUNCH_APP` - App launches
- `session_started` / `LAUNCH_APP` - User starts playing
- `level_completed` / `ACHIEVE_LEVEL` - Level finished
- `animal_discovered` / `VIEW_CONTENT` - Animal found
- `level_selected` / `VIEW_CONTENT` - Level chosen
- `purchase_completed` / `PURCHASE` - In-app purchase
- `user_engagement` / `SEARCH` - User interactions
- `achievement_unlocked` / `UNLOCK_ACHIEVEMENT` - Achievement earned

## 🎯 TikTok Pixel Integration

### Set Up TikTok Pixel

1. Go to [TikTok Events Manager](https://ads.tiktok.com/help/article?aid=10028)
2. Create a Pixel:
   - Name: `Animal Detective App`
   - Platform: Mobile App
   - App ID: Your TikTok App ID
3. Configure conversion events:
   - App Install
   - Level Completion
   - Purchase
   - Registration

### Link Events to Campaigns

1. In TikTok Ads Manager, create or edit a campaign
2. Go to "Optimization Events"
3. Select your Pixel and choose conversion events
4. The SDK will automatically send events to TikTok

## 🔒 Privacy & Compliance

### Data Collection

TikTok SDK collects:
- Device information (IDFA/GAID)
- App usage data
- In-app events
- User identifiers (if provided)

### GDPR/CCPA Compliance

For EU/California users:
- Implement user consent mechanisms
- Allow users to opt out of tracking
- Handle data deletion requests
- Update privacy policy

### iOS App Tracking Transparency

Add to `Info.plist`:
```xml
<key>NSUserTrackingUsageDescription</key>
<string>This app uses tracking to provide personalized ads and improve your experience.</string>
```

Request permission:
```typescript
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const { status } = await requestTrackingPermissionsAsync();
if (status === 'granted') {
  // User consented to tracking
}
```

## 🐛 Troubleshooting

### TikTok SDK Not Initializing

- Verify TikTok App ID and Access Token are correct
- Check that the app ID matches your TikTok Events Manager configuration
- Ensure package is properly linked: `cd ios && pod install`
- Check device logs for error messages

### Events Not Showing in TikTok Dashboard

- Wait 24-48 hours for events to appear (can take time)
- Verify Access Token has correct permissions
- Check that events match TikTok's event names
- Enable debug mode: `await TikTokAnalytics.initialize(..., true)`
- Check TikTok Events Manager → Test Events

### Build Errors

- Run `pod install` in `ios/` directory
- Clean build folders: `cd ios && xcodebuild clean`
- Verify all dependencies are installed: `npm install`
- Check React Native version compatibility

## 📚 Additional Resources

- [TikTok for Developers](https://developers.tiktok.com/)
- [TikTok Events API Documentation](https://ads.tiktok.com/help/article?aid=10028)
- [TikTok Business SDK GitHub](https://github.com/tiktok/tiktok-business-api-sdk)
- [React Native TikTok Business SDK](https://github.com/mtebele/react-native-tiktok-business)

## ⚠️ Important Notes

1. **App ID vs Pixel ID**: 
   - TikTok App ID: Used for SDK initialization
   - Pixel ID: Used in TikTok Ads Manager (often the same)

2. **Access Token Security**: 
   - Keep Access Token secure
   - Don't commit tokens to version control
   - Use environment variables for production

3. **Event Delay**: 
   - Events may take 24-48 hours to appear in TikTok dashboard
   - Use Test Events feature in Events Manager for immediate testing

4. **Test Mode**: 
   - Enable debug mode during development
   - Use test events to verify integration
   - Check Events Manager → Test Events

5. **Attribution**: 
   - TikTok SDK automatically handles attribution
   - Install events are linked to ad campaigns
   - User identification improves attribution accuracy

## 🔄 Testing

### Test Events in TikTok Events Manager

1. Go to Events Manager → Test Events
2. Enable test mode
3. Trigger events in your app
4. Check Test Events tab for immediate results

### Verify Integration

1. Enable debug mode: `initialize(..., true)`
2. Check console logs for initialization messages
3. Trigger test events
4. Verify events appear in TikTok dashboard (may take time)

## 📈 Best Practices

1. **Track Key Events**: Focus on meaningful conversion events
2. **User Identification**: Identify users when possible for better attribution
3. **Event Parameters**: Include relevant parameters for better optimization
4. **Test Before Launch**: Verify integration thoroughly before production
5. **Monitor Performance**: Regularly check TikTok dashboard for event tracking

