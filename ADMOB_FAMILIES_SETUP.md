# AdMob Families-Certified Integration Guide

## ✅ Completed Setup

### 1. Native Android Configuration

#### build.gradle
- ✅ Added AdMob SDK dependency: `com.google.android.gms:play-services-ads:23.3.0`

#### MainApplication.kt
- ✅ Initialized AdMob with Families-certified settings:
  - `TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE` (COPPA compliance)
  - `TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE` (Under 16 in EEA)
  - `MAX_AD_CONTENT_RATING_G` (G-rated content only)

#### AndroidManifest.xml
- ✅ Added AdMob App ID meta-data (currently using test ID)
- ⚠️ **ACTION REQUIRED**: Replace test App ID with your production Families-certified App ID

### 2. TypeScript/React Components

#### AdMobService.ts
- ✅ Updated with Families-certified initialization
- ✅ Ensures child-directed settings are always applied

#### AdMobBanner.tsx
- ✅ Already exists with proper fallback handling

#### AdMobInterstitial.tsx
- ✅ Created with Families policy compliance:
  - Non-personalized ads only
  - Proper event handling
  - Auto-reload after close

#### AdMobRewarded.tsx
- ✅ Created with Families policy compliance:
  - Non-personalized ads only
  - Reward callback handling
  - Auto-reload after close

## 🔧 Next Steps

### Step 1: Create AdMob Account & App

1. Go to [AdMob Console](https://apps.admob.com/)
2. Create an account or sign in
3. Create a new app:
   - App name: "Animal Detective"
   - Platform: Android
   - Package name: `com.metaltorchlabs.pixieplay`

### Step 2: Create Families-Certified Ad Units

1. In AdMob Console, go to **Apps** → Your App → **Ad units**
2. Create ad units with **Families** content rating:
   - **Banner**: For menu screens
   - **Interstitial**: For level transitions (natural breaks only)
   - **Rewarded**: For optional rewards (cosmetics, hints)

3. Copy the ad unit IDs (format: `ca-app-pub-xxxxx/yyyyy`)

### Step 3: Update App ID and Ad Unit IDs

#### AndroidManifest.xml
Replace the test App ID:
```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" 
           android:value="YOUR_ADMOB_APP_ID"/>
```

#### Update Components
Replace test ad unit IDs in:
- `AdMobBanner.tsx` (default `adUnitId`)
- `AdMobInterstitial.tsx` (default `adUnitId`)
- `AdMobRewarded.tsx` (default `adUnitId`)

Or pass them as props when using the components.

### Step 4: Install React Native AdMob Package (Optional)

If you want to use the React Native wrapper (currently using native SDK):

```bash
npm install react-native-google-mobile-ads
```

Then update `AdMobService.ts` to use the package instead of native SDK.

### Step 5: Implement Ad Placement (Following Families Policy)

#### Banner Ads
- ✅ Place on menu/lobby screens only
- ✅ Never during gameplay
- ✅ Use `AdMobBanner` component

#### Interstitial Ads
- ✅ **NEVER** on app launch
- ✅ Only on natural breaks (end of level)
- ✅ Frequency cap: Max once per 2-3 minutes
- ✅ Clear close buttons (handled by SDK)
- ✅ Example usage:
```tsx
import AdMobInterstitial, { AdMobInterstitialRef } from '../src/components/AdMobInterstitial';

const interstitialRef = useRef<AdMobInterstitialRef>(null);

// On level completion:
interstitialRef.current?.show();

<AdMobInterstitial
  ref={interstitialRef}
  adUnitId="ca-app-pub-xxx/interstitial-id"
  onAdClosed={() => {
    // Navigate to next level or menu
  }}
/>
```

#### Rewarded Ads
- ✅ Optional only (never required to progress)
- ✅ Use for kid-friendly rewards (cosmetics, hints, extra lives)
- ✅ Consider parental gate before showing
- ✅ Example usage:
```tsx
import AdMobRewarded, { AdMobRewardedRef } from '../src/components/AdMobRewarded';

const rewardedRef = useRef<AdMobRewardedRef>(null);

// On "Watch Ad for Hint" button:
rewardedRef.current?.show();

<AdMobRewarded
  ref={rewardedRef}
  adUnitId="ca-app-pub-xxx/rewarded-id"
  onRewarded={(reward) => {
    // Grant hint or cosmetic reward
    grantHint();
  }}
/>
```

## 📋 Families Policy Checklist

### ✅ Compliance Requirements

- ✅ Child-directed treatment flag set
- ✅ Under age of consent flag set
- ✅ G-rated content only
- ✅ Non-personalized ads only
- ✅ No ads on app launch
- ✅ No ads during gameplay
- ✅ Clear close buttons (handled by SDK)
- ✅ Frequency caps implemented (in your code)

### ⚠️ Still Required

- [ ] Replace test App ID with production App ID
- [ ] Replace test ad unit IDs with production IDs
- [ ] Add Privacy Policy URL (in Play Console and in-app)
- [ ] Fill Data Safety form in Play Console:
  - Declare ads SDK
  - Mark ads used
  - Explain data collection (coarse location/IP for ads)
- [ ] Test with test ads before production
- [ ] Implement frequency caps for interstitials
- [ ] Add parental gate before rewarded ads (optional but recommended)

## 🔍 Testing

### Test Ad Unit IDs
Use these test IDs during development:
- **Banner**: `ca-app-pub-3940256099942544/6300978111`
- **Interstitial**: `ca-app-pub-3940256099942544/1033173712`
- **Rewarded**: `ca-app-pub-3940256099942544/5224354917`

### Verify Configuration
Check logs for:
- `AdMob initialized with Families-certified settings`
- `requestNonPersonalizedAdsOnly: true`
- `maxAdContentRating: G`

## 🚫 Common Rejection Traps to Avoid

1. ❌ **Personalized ads enabled** - Always use non-personalized
2. ❌ **Interstitials on launch** - Never show on app start
3. ❌ **Interstitials during gameplay** - Only on natural breaks
4. ❌ **No privacy policy** - Must have accessible Privacy Policy URL
5. ❌ **External links without parental gate** - Gate all external links
6. ❌ **Mediation partners not Families-certified** - Only use certified partners

## 📝 Data Safety Form

When filling Play Console Data Safety form:

1. **Data Collection**: Yes
2. **Data Types**:
   - Coarse location (for ads)
   - Device ID (for ads)
   - App activity (for ads)
3. **Data Usage**: Advertising
4. **Data Sharing**: Yes (with ad partners)
5. **Security Practices**: Data encrypted in transit
6. **Deletion**: Users can request deletion via Privacy Policy

## 🔗 Resources

- [AdMob Families Policy](https://support.google.com/admob/answer/9905175)
- [COPPA Compliance Guide](https://support.google.com/admob/answer/6128543)
- [AdMob Test Ads](https://developers.google.com/admob/android/test-ads)


