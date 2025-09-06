# Apple Pay Integration Setup Guide

This guide explains how to set up Apple Pay integration for the "unlock all missions" feature in the Animal Detective app.

## Overview

The app now includes Apple Pay integration through `react-native-iap` library, which automatically presents Apple Pay when available on iOS devices. Users can unlock all game levels using Apple Pay for a seamless and secure payment experience.

## What's Already Implemented

✅ **Apple Pay Integration**: The app automatically uses Apple Pay when available on iOS
✅ **In-App Purchase**: Uses `react-native-iap` library for secure transactions
✅ **Restore Purchases**: Users can restore previous purchases
✅ **Error Handling**: Comprehensive error handling for payment failures
✅ **UI Integration**: Beautiful unlock buttons with Apple Pay branding

## iOS Configuration Required

### 1. Apple Developer Account Setup

1. **Enable Apple Pay Capability**:
   - Log into [Apple Developer Portal](https://developer.apple.com)
   - Go to Certificates, Identifiers & Profiles
   - Select your App ID
   - Enable "Apple Pay" capability
   - Add your merchant ID: `merchant.com.metaltorchlabs.pixieplay`

2. **Create Merchant ID** (if you don't have one):
   - In Apple Developer Portal, go to Certificates, Identifiers & Profiles
   - Select "Identifiers" → "Merchant IDs"
   - Create new Merchant ID with identifier: `com.metaltorchlabs.pixieplay`
   - Download and install the merchant certificate

### 2. Xcode Project Configuration

1. **Open your project in Xcode**:
   ```bash
   cd ios
   open AnimalDetective.xcworkspace
   ```

2. **Enable Apple Pay Capability**:
   - Select your project in the navigator
   - Select your target
   - Go to "Signing & Capabilities" tab
   - Click "+ Capability"
   - Add "Apple Pay"
   - Ensure the merchant ID matches: `merchant.com.metaltorchlabs.pixieplay`

3. **Update Info.plist** (already done):
   - The app automatically handles Apple Pay presentation
   - No additional Info.plist changes needed

### 3. App Store Connect Setup

1. **Create In-App Purchase Product**:
   - Log into [App Store Connect](https://appstoreconnect.apple.com)
   - Go to your app → Features → In-App Purchases
   - Create new IAP with:
     - Product ID: `animalDetectiveUnclock` (matches the code)
     - Type: Non-Consumable
     - Reference Name: "Unlock All Levels"
     - Price: Set your desired price

2. **Submit for Review**:
   - Ensure your IAP is ready for review
   - Include screenshots and descriptions
   - Submit for App Review team approval

## How It Works

### 1. User Experience

1. **Unlock Button**: Users see a beautiful unlock button with Apple Pay branding
2. **Apple Pay Sheet**: Tapping the button automatically presents Apple Pay if available
3. **Secure Payment**: Users authenticate with Face ID/Touch ID and complete payment
4. **Instant Unlock**: All levels are immediately unlocked after successful payment

### 2. Technical Flow

```typescript
// 1. User taps unlock button
handleUnlock() → RNIap.requestPurchase()

// 2. react-native-iap automatically presents Apple Pay
// 3. User completes payment
// 4. Purchase listener receives confirmation
// 5. Transaction is finished and levels are unlocked
```

### 3. Error Handling

- **User Cancellation**: No error shown if user cancels Apple Pay
- **Payment Failures**: User-friendly error messages
- **Network Issues**: Graceful fallback and retry options
- **Restore Purchases**: Users can restore previous purchases

## Testing

### 1. Sandbox Testing

1. **Create Sandbox Tester**:
   - In App Store Connect, create a sandbox tester account
   - Use this account on your test device

2. **Test on Device**:
   - Install the app on a physical iOS device
   - Sign in with sandbox tester account
   - Test the unlock flow

### 2. TestFlight Testing

1. **Upload Build**:
   - Archive and upload your app to TestFlight
   - Invite testers to test Apple Pay integration

2. **Real Device Testing**:
   - Testers can use real Apple Pay cards in sandbox mode
   - Verify the complete payment flow

## Troubleshooting

### Common Issues

1. **Apple Pay Not Showing**:
   - Verify Apple Pay capability is enabled in Xcode
   - Check merchant ID configuration
   - Ensure device supports Apple Pay

2. **Payment Fails**:
   - Check sandbox tester account is active
   - Verify IAP product is approved in App Store Connect
   - Check network connectivity

3. **Build Errors**:
   - Clean build folder: `cd ios && xcodebuild clean`
   - Reinstall pods: `cd ios && pod install`
   - Check all capabilities are properly configured

### Debug Logs

The app includes comprehensive logging:
```typescript
console.warn('Purchase error:', error);
console.warn('IAP initialization error:', e);
console.warn('Restore purchases error:', e);
```

## Security Features

✅ **Secure Transactions**: All payments go through Apple's secure payment system
✅ **Receipt Validation**: Automatic receipt validation and verification
✅ **Fraud Prevention**: Apple's built-in fraud detection and prevention
✅ **User Privacy**: No payment information is stored on the device

## Localization

The app supports multiple languages for payment flows:
- English (en)
- Russian (ru) 
- Turkish (tr)

Payment-related strings are automatically localized based on user's language preference.

## Support

If you encounter issues:

1. **Check this guide** for common solutions
2. **Review Xcode logs** for detailed error information
3. **Verify Apple Developer Portal** configuration
4. **Test with sandbox accounts** before production

## Next Steps

1. **Complete Apple Developer Portal setup**
2. **Configure Xcode project capabilities**
3. **Create IAP product in App Store Connect**
4. **Test with sandbox accounts**
5. **Submit for App Review**

The Apple Pay integration is now fully implemented and ready for production use!
